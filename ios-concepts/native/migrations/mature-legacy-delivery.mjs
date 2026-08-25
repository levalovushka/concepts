#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compileUXSpecification } from "../lib/ux-specification.mjs";
import { developProductConcept } from "../lib/product-maturity.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const conceptsDirectory = resolve(here, "../../concepts");

const identities = {
  looks: {
    coreSurfaces: ["home", "post", "search", "wardrobe", "chats"],
    requiredVocabulary: ["тренч", "вещ", "сочетан"],
    forbiddenVocabulary: ["питомец", "прогулка с собакой", "рабочая смена", "учебный билет"],
    firstFrame: { surface: "home", mustExpose: ["тренч", "вещ"] },
  },
  dvor: {
    coreSurfaces: ["home", "post", "yard", "chats", "menu"],
    requiredVocabulary: ["лифт", "сосед", "заявк"],
    forbiddenVocabulary: ["тренч", "гардероб", "питомец", "учебный билет", "рабочая смена"],
    firstFrame: { surface: "home", mustExpose: ["дом", "заявк"] },
    fixture: {
      kind: "house-matter",
      actor: "Марина Соколова · кв. 47",
      defaultHeadline: "Заявка дома: лифт снова останавливается между 6-м и 7-м этажами",
      metadata: "заявка №4817 · мастер до 18:30 · 12 соседей следят",
      stressText: "Подъезд №3, квартиры 41–68: повторная остановка после вчерашнего ремонта; соседи видят статус и следующий шаг.",
      surfaceContent: {
        home: "Дела дома · заявка по лифту и ответ соседей",
        post: "Заявка №4817 · мастер назначен до 18:30",
        yard: "Двор дома · события, гостевая сеть и счётчики",
        chats: "Соседи подъезда: мастер уже в доме",
        menu: "Ваш дом · соседи, доступы и настройки",
      },
      edgeValues: [0, 1, 2, 5, 12, 146],
    },
  },
};

function authScreen(id, title, parent, purpose, action) {
  return {
    id, title, type: parent ? "push" : "старт, без таб-бара", light: true, ...(parent ? { parent } : {}),
    meta: id === "phone" ? "Email" : "OTP",
    native: { presentation: parent ? "push" : "root", purpose, role: "authentication", states: ["default", "loading", "error"] },
    ui: {
      pattern: "auth", purpose, primaryAction: action.label,
      states: ["default", "loading", "error"], density: "low",
      contentCases: [
        { kind: "typical", example: `Обычный сценарий «${title}» с реальными данными` },
        { kind: "stress", example: `Длинная почта, крупный шрифт и ошибка на экране «${title}»` },
        { kind: "failure", example: `Ошибка сети или кода на экране «${title}» с понятным возвратом` },
      ],
      hierarchy: { primary: `Основная задача: ${purpose}`, secondary: "Контекст, состояние и предсказуемое следующее действие" },
      componentFamilies: ["auth-form", "primary-action"],
      actions: [action],
    },
  };
}

function navigationAction(id, label, target, enabledWhen) {
  return {
    id, label, outcome: { type: "navigate", target }, execution: "sync", persistence: "none",
    states: ["idle", "success"], variant: "primary", placement: "body", enabledWhen,
  };
}

function removeAppleSignIn(value) {
  if (Array.isArray(value)) return value
    .filter(item => item?.key !== "applesignin" && item?.id !== "permission.applesignin")
    .map(removeAppleSignIn);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, removeAppleSignIn(item)]));
}

async function writeConcept(slug, transform) {
  const path = resolve(conceptsDirectory, slug, "concept.json");
  const concept = await transform(JSON.parse(readFileSync(path, "utf8")));
  writeFileSync(path, `${JSON.stringify(concept, null, 2)}\n`);
}

await writeConcept("looks", concept => ({
  ...concept,
  native: { ...concept.native, deliveryIdentity: identities.looks },
}));

await writeConcept("dvor", async source => {
  const concept = removeAppleSignIn(source);
  concept.screens = concept.screens.filter(screen => !["phone", "code", "codefail"].includes(screen.id));
  concept.screens.splice(0, 0,
    authScreen("phone", "Вход по почте", null, "Войти и сохранить связь со своим домом", navigationAction("continue-email", "Получить код", "code", "input.email.valid")),
    authScreen("code", "Код из письма", "phone", "Подтвердить вход перед выбором дома", navigationAction("confirm-code", "Продолжить", "join", "input.code.complete")),
    authScreen("codefail", "Неверный код", "code", "Объяснить ошибку и вернуть к вводу", navigationAction("complete-codefail", "Ввести снова", "code", "always")),
  );
  concept.native = { ...concept.native, deliveryIdentity: identities.dvor };
  const development = await developProductConcept({
    brief: concept.productDevelopment.brief,
    generator: { generateCandidates: async () => concept.productDevelopment.candidates },
  });
  if (!development.ok) throw new Error(`Dvor Product Contract migration failed:\n${development.diagnostics.map(item => `${item.code}: ${item.message}`).join("\n")}`);
  concept.productDevelopment.selectionReceipt = development.selectionReceipt;
  concept.productDevelopment.productContract = development.productContract;
  delete concept.ux;
  const presentationByType = {
    "старт, без таб-бара": "root", "tab (root)": "tab", push: "push", modal: "sheet",
    sheet: "sheet", state: "state", "системная поверхность": "system",
  };
  const surfaces = concept.screens.map(screen => ({
    id: screen.id, title: screen.title, purpose: screen.ui?.purpose,
    presentation: screen.native?.presentation || presentationByType[screen.type] || "unknown",
    parent: screen.parent || null, states: screen.ui?.states || ["default"],
  }));
  const migrationContract = { ...concept.productDevelopment.productContract, status: "migration-baseline" };
  const migration = compileUXSpecification(concept, migrationContract, { surfaces });
  concept.ux = migration.specification;
  const compiled = compileUXSpecification(concept, concept.productDevelopment.productContract, { surfaces });
  if (!compiled.specification || compiled.diagnostics.some(item => item.severity === "error")) {
    throw new Error(`Dvor UX migration failed:\n${compiled.diagnostics.map(item => `${item.code}: ${item.message}`).join("\n")}`);
  }
  concept.ux = compiled.specification;
  return concept;
});

console.log("Matured Looks and Dvor delivery identities; migrated Dvor to shared email auth.");
