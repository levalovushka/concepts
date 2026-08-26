import test from "node:test";
import assert from "node:assert/strict";
import { auditWorldModel, compilePermissionGrounding } from "../lib/world-model.mjs";
import { resolveProductTarget } from "../lib/product-target-catalog.mjs";

const action = (id, actor, target, effect) => ({
  id, actor, target, intent: effect,
  preconditions: ["Пользователь находится в явном продуктовом сценарии"],
  effects: [effect], failures: ["Действие не выполнено, данные сохранены для повтора"],
  offlineBehavior: "Локальное состояние сохраняется, сетевой эффект помечается ожидающим",
});

function musicWorldModel() {
  return {
    schemaVersion: 1,
    id: "music-listening-world",
    entities: [
      { id: "listener", name: "Слушатель", ownership: "user", states: ["signed-out", "signed-in"] },
      { id: "track", name: "Трек", ownership: "shared", states: ["available", "playing", "paused"] },
      { id: "playlist", name: "Плейлист", ownership: "user", states: ["draft", "saved"] },
    ],
    relationships: [
      { id: "listener-saves-playlist", from: "listener", to: "playlist", cardinality: "one-to-many", meaning: "Слушатель сохраняет свои подборки" },
    ],
    actions: [
      action("authenticate", "listener", "listener", "Создать и сохранить локальную авторизованную сессию"),
      action("scan-code", "listener", "playlist", "Открыть музыкальную подборку по коду"),
      action("choose-cover", "listener", "playlist", "Выбрать обложку пользовательской подборки"),
      action("play-track", "listener", "track", "Продолжить реальное воспроизведение в фоне"),
      action("follow-release", "listener", "track", "Подписаться на выбранный музыкальный релиз"),
      action("open-link", "listener", "track", "Открыть конкретный трек из universal link"),
    ],
    coreActions: ["play-track"],
    invariants: ["Ни один системный доступ не создаёт отдельную продуктовую функцию"],
    authentication: { required: true, method: "phone-code", sessionEntity: "listener", persistence: "keychain-backed local demo session" },
    runtime: {
      persistence: [{ entity: "playlist", store: "SwiftData" }],
      demoAdapters: [{ id: "music-catalog-demo", simulates: "Каталог и подписки", states: ["loading", "populated", "empty", "error", "offline"] }],
    },
    capabilityBindings: [
      { key: "camera", action: "scan-code", purpose: "Считать код конкретной музыкальной подборки", requestMoment: "После нажатия «Сканировать код»", deniedOutcome: "Открыть поле для ввода ссылки", observableResult: "Открыта найденная подборка" },
      { key: "photos", action: "choose-cover", purpose: "Выбрать обложку собственной подборки", requestMoment: "После нажатия «Выбрать обложку»", deniedOutcome: "Сохранить подборку со стандартной обложкой", observableResult: "Новая обложка видна в подборке" },
      { key: "audio", action: "play-track", purpose: "Продолжить выбранный трек при блокировке экрана", requestMoment: "После запуска воспроизведения", deniedOutcome: "Остановить трек при уходе приложения в фон", observableResult: "Now Playing отражает текущий трек" },
      { key: "push", action: "follow-release", purpose: "Сообщить о релизе выбранного исполнителя", requestMoment: "После явной подписки на релизы", deniedOutcome: "Показывать обновления во входящих приложения", observableResult: "Подписка видна в настройках исполнителя" },
      { key: "associateddomains", action: "open-link", purpose: "Открыть присланный музыкальный объект", requestMoment: "При переходе по поддерживаемой ссылке", deniedOutcome: "Открыть безопасный экран поиска", observableResult: "Показан соответствующий трек" },
    ],
    deliveryBindings: [],
  };
}

test("world model owns the complete capability-to-action graph before screens", () => {
  const target = resolveProductTarget("vk-music");
  const model = musicWorldModel();
  assert.deepEqual(auditWorldModel(model, target), []);
  assert.deepEqual(compilePermissionGrounding(model, target).map(item => item.key), target.permissions.map(item => item.key));
});

test("delivery obligations cannot disappear into prose constraints", () => {
  const target = { ...resolveProductTarget("vk-music"), deliveryObligations: ["share-extension"] };
  const diagnostics = auditWorldModel(musicWorldModel(), target);
  assert.equal(diagnostics.some(item => item.code === "world.delivery.missing"), true);
});

test("world model accepts an organic capability subset but rejects an unknown action", () => {
  const target = resolveProductTarget("vk-music");
  const model = musicWorldModel();
  model.capabilityBindings.pop();
  model.capabilityBindings[0].action = "screen-only-placeholder";
  const diagnostics = auditWorldModel(model, target);
  assert.equal(diagnostics.some(item => item.code === "world.capability.missing"), false);
  assert.equal(diagnostics.some(item => item.code === "world.capability.action-unknown"), true);
});

test("system automation may act on a known product entity", () => {
  const target = resolveProductTarget("vk-music");
  const model = musicWorldModel();
  model.actions.push(action("refresh-library", "system", "playlist", "Обновить локальный снимок плейлиста в фоне"));
  assert.equal(auditWorldModel(model, target).some(item => item.code === "world.action.entity-unknown"), false);
  model.actions.at(-1).target = "ghost";
  assert.equal(auditWorldModel(model, target).some(item => item.code === "world.action.entity-unknown"), true);
});
