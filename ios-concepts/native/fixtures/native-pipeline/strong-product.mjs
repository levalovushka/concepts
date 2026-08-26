export const strongCore = Object.freeze({
  schemaVersion: 2,
  id: "neighbour-promises",
  name: "Рядом",
  thesis: "Соседи публично обещают небольшой результат, получают конкретную помощь и возвращаются показать завершение дела.",
  audience: { who: "Жители одного дома и соседних дворов", need: "Быстро находить знакомую помощь для небольших дел и видеть, чем закончилось обещание" },
  situation: "Человек замечает небольшое общее дело, которое можно завершить сегодня вместе с соседями.",
  problem: "Просьбы теряются в чатах, помощь остаётся без результата, а соседи не понимают, что уже сделано.",
  mechanism: "Авторская лента обещаний связывает конкретное дело, предложение помощи, обновление хода и публичное завершение.",
  world: {
    entities: [{ id: "person", name: "Сосед" }, { id: "promise", name: "Обещание" }, { id: "contribution", name: "Вклад" }],
    actions: [
      { id: "discover_promise", label: "Открыть обещание", entityId: "promise", outcome: "Человек видит актуальное обещание рядом", effect: { type: "update", stateField: "lastSeen", value: "now" } },
      { id: "offer_help", label: "Предложить помощь", entityId: "contribution", outcome: "Предложение помощи появляется у автора", effect: { type: "create", collectionField: "contributions" } },
      { id: "accept_help", label: "Принять помощь", entityId: "promise", outcome: "Автор закрепляет конкретный вклад за обещанием", effect: { type: "update", stateField: "acceptedContribution", value: "selected" } },
      { id: "complete_promise", label: "Завершить обещание", entityId: "promise", outcome: "В ленте появляется видимый результат обещания", effect: { type: "update", stateField: "status", value: "completed" } },
      { id: "capture_result", label: "Добавить фото", entityId: "promise", outcome: "К завершению прикрепляется доказательство результата", effect: { type: "update", stateField: "resultPhoto", value: "captured" } },
    ],
  },
  coreLoop: { actionIds: ["discover_promise", "offer_help", "accept_help", "complete_promise"], returnReason: "Обновления обещания и ответы знакомых возвращают участников до видимого завершения." },
  returnReasons: ["Ответ на предложение помощи", "Обновление хода обещания", "Публичный результат знакомого человека"],
  nonGoals: ["Биржа случайных исполнителей", "Административный таск-трекер"],
  proof: { steps: [
    { role: "entry", actionId: "discover_promise", observable: "В ленте видно обещание знакомого соседа" },
    { role: "action", actionId: "offer_help", observable: "Предложение с конкретным вкладом прикреплено к обещанию" },
    { role: "result", actionId: "complete_promise", observable: "Карточка показывает завершение и участников" },
  ] },
});

export const portfolio = Object.freeze({
  candidates: [{ id: "neighbour-promises" }, { id: "shared-tools" }, { id: "yard-stories" }],
  assessments: ["neighbour-promises", "shared-tools", "yard-stories"].map(candidateId => ({ candidateId, axes: [{ id: "mechanism", score: 9 }] })),
  recommendationId: "neighbour-promises",
});

export const strongCapabilityProposal = Object.freeze({
  policy: "required",
  bindings: [{
    key: "camera", actionId: "capture_result", strengthensActionId: "complete_promise",
    purpose: "Показать соседям проверяемый итог обещания прямо в карточке завершения",
    requestMoment: "После нажатия «Добавить фото результата» на экране завершения",
    platformEffect: "Открыть системную камеру и сохранить полученный локальный файл",
    fallback: "Оставить текстовый результат и предложить выбрать изображение позже",
    testScenario: "Разрешить камеру и увидеть сохранённую миниатюру после перезапуска",
    outcome: { entityId: "promise", stateField: "resultPhoto", proof: "Карточка завершения показывает сохранённую миниатюру" },
  }],
  exclusions: [],
});

export const strongSlice = Object.freeze({
  surfaces: [
    { id: "feed", role: "entry", title: "Рядом", recipe: "authoredFeed", states: ["populated/default", "empty", "offline"], actionIds: ["discover_promise"], content: { author: "Марина Орлова", headline: "Починим лавку до вечера", body: "Сосед показал конкретный результат, для которого нужна помощь." } },
    { id: "offer", role: "action", title: "Предложить помощь", recipe: "contributionEditor", states: ["populated/default", "error"], actionIds: ["offer_help"], content: { headline: "Чем вы поможете", body: "Укажите конкретный вклад, который увидит автор обещания.", details: [{ title: "Ваш вклад", detail: "Инструменты и 40 минут", icon: "person.crop.circle.badge.plus" }, { title: "Когда", detail: "Сегодня до 19:00", icon: "clock" }] } },
    { id: "result", role: "result", title: "Результат", recipe: "completion", states: ["populated/default", "permission-denied"], actionIds: ["complete_promise", "capture_result"], content: { headline: "Лавка снова на месте", body: "Результат, вклад помощников и продолжение видны в одной карточке.", summary: { title: "Результат увидят соседи", detail: "Вклад помощников останется в истории обещания." } } },
  ],
  transitions: [{ from: "feed", to: "offer", actionId: "discover_promise" }, { from: "offer", to: "result", actionId: "offer_help" }],
  acceptanceJourney: { id: "product-proof", actionIds: ["discover_promise", "offer_help", "complete_promise"] },
});

const strongFullExtraSurfaces = [
  { id: "responses", role: "support", title: "Ответы", recipe: "conversationList", states: ["populated/default", "empty"], actionIds: ["accept_help"], content: { headline: "Ответы соседей", body: "Автор видит предложения и выбирает конкретный вклад." } },
  { id: "profile", role: "support", title: "Профиль", recipe: "ownedProfile", states: ["populated/default", "offline"], actionIds: [], content: { headline: "Мои обещания", body: "Завершённые дела и вклады остаются в профиле." } },
];
const strongFullSurfaces = [...strongSlice.surfaces, ...strongFullExtraSurfaces];
export const strongFullContract = Object.freeze({
  schemaVersion: 2,
  surfaces: strongFullSurfaces,
  rootTabs: strongFullSurfaces.map((surface, index) => ({
    surfaceId: surface.id, title: surface.title, role: ["feed", "discovery", "short-video", "messaging", "services"][index],
  })),
  transitions: [...strongSlice.transitions, { from: "responses", to: "result", actionId: "accept_help" }],
  acceptanceJourneys: [
    { id: "proof", actionIds: ["discover_promise", "offer_help", "complete_promise"] },
    { id: "response", actionIds: ["accept_help"] },
    { id: "permission", actionIds: ["capture_result"] },
  ],
  verification: {
    captures: strongFullSurfaces.flatMap(surface => surface.states.map(state => ({ id: `${surface.id}--${state}` }))),
  },
});
