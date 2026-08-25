// Explicit deterministic fixture adapter. It is test/example data, not a
// production substitute for a model and it makes no claim of real research.
function evidence() {
  return [
    {
      id: "brief-observation",
      type: "user-input",
      source: "strong-brief.json: supplied scenario and constraints",
      status: "approved",
      supports: ["audience situation", "permission constraints", "first-session job"],
    },
    {
      id: "vk-reference",
      type: "reference-profile",
      source: "native/ReferenceProfiles/vk-ios/profile.json",
      status: "approved",
      supports: ["VK social mental model", "borrowed interaction patterns"],
    },
    {
      id: "supply-assumption",
      type: "assumption",
      source: "fixture assumption requiring a live supply pilot",
      status: "needs-validation",
      supports: ["ongoing contributor supply", "expected return cadence"],
    },
  ];
}

function delivery(name, unit, primaryFlow) {
  return {
    domainGlossary: [
      { term: unit, definition: `The primary product content unit for ${name}.` },
      { term: "Commitment", definition: "A time-bounded promise between two identified people with one observable outcome." },
    ],
    personas: [
      { name: "Neighbour with an immediate job", context: "At home before a short practical task", job: primaryFlow },
      { name: "Neighbour with spare capacity", context: "Owns a useful item or local knowledge", job: "Help without starting an open-ended conversation" },
    ],
    criticalFlows: [
      { id: "activate", name: "First value", trigger: "Open the nearest-house feed", steps: ["See a relevant unit", "Open its detail", "Commit to one outcome"], outcome: primaryFlow },
      { id: "contribute", name: "Contribute supply", trigger: "A completed exchange or unresolved need", steps: ["Create a unit", "Add constraints", "Publish to the house"], outcome: `A new ${unit} enters supply` },
    ],
    architecture: {
      modules: [
        { name: "Product model", responsibility: `Own ${unit}, commitment, and loop state`, owns: "native/apps/<slug>" },
        { name: "Runtime adapters", responsibility: "Own permission and lifecycle integration", owns: "native/Runtime" },
        { name: "VK reference profile", responsibility: "Own evidence-backed visual and interaction grammar", owns: "native/ReferenceProfiles/vk-ios" },
      ],
      boundaries: ["Product behavior stays outside the reference profile", "Permission adapters cannot create product success", "Generated project files do not own domain state"],
    },
    data: {
      entities: [unit, "Person", "House", "Commitment"],
      state: ["Signed-in house context", "Feed and detail state", "Commitment lifecycle", "Permission and denied fallback state"],
      persistence: ["Local draft and recovery state", "Remote product records through an approved provider adapter"],
      integrations: ["VK identity or equivalent approved authentication", "Notification provider", "Core Location with manual address fallback"],
    },
    experienceStates: {
      loading: "Keep the house and task context visible while the latest supply loads.",
      empty: `Offer a concrete action that creates the first ${unit} without pretending supply exists.`,
      error: "Preserve input, name the failed operation, and expose retry plus a safe fallback.",
      denied: "Keep the task possible through the denied fallback declared for that permission.",
      offline: "Show cached commitments and drafts; label remote supply as stale and offer retry.",
    },
    accessibility: ["VoiceOver order follows task hierarchy", "All actions have 44pt targets", "Accessibility XXXL preserves the primary outcome", "Motion is not required to understand state"],
    localization: { locales: ["ru"], requirements: ["Pluralise distance and time correctly", "Avoid concatenated action copy", "Stress-test long house and person names"] },
    analytics: {
      events: ["candidate_feed_opened", "unit_opened", "commitment_started", "commitment_completed", "contribution_published", "denied_fallback_used"],
      successMetrics: ["First-session commitment rate", "Completed commitments per active house", "Contribution after completion", "Denied-fallback task completion"],
    },
    testing: {
      levels: ["Contract compile", "Deterministic interaction replay", "XCUI smoke", "Independent capture review"],
      evidencePlan: ["Validate the supply assumption with a real-house pilot", "Record provenance for every changed product claim"],
      capturePlan: ["auth--default", "feed--populated", "feed--empty", "detail--default", "commitment--success", "permission--denied", "offline--stale"],
    },
    setup: {
      prerequisites: ["Node 22", "Xcode with an iOS 26 simulator", "A selected Product Contract"],
      build: ["npm run build -- <slug>"],
      run: ["npm run smoke -- <slug>", "npm run capture -- <slug>"],
    },
    ownership: {
      generated: ["native/build/<slug>", "concepts/<slug>/docs/developer-guide.md"],
      owned: ["concepts/<slug>/concept.json", "native/apps/<slug>", "native/apps/<slug>/capture.json"],
    },
    limitations: ["Fixture evidence is not user research", "Server/provider contracts require separate intake", "Physical-device and VoiceOver checks remain manual"],
    acceptanceCriteria: ["Every maturity gate passes", "Every primary action has a deterministic outcome", "Every permission has timing and denied fallback", "All required states are captured"],
    appStoreNotes: ["Explain the product task, not a hidden permission objective", "Match permission copy, privacy labels, and reachable behavior", "Do not claim real-house validation until evidence is collected"],
  };
}

function axes(scores = {}) {
  const ids = [
    "audience-need", "wedge", "observable-differentiation", "value-exchange",
    "content-supply", "social-graph", "cold-start", "activation", "core-loop",
    "retention", "trust-privacy", "business-viability", "reference-fit",
    "permission-cohesion", "evidence",
  ];
  return ids.map(id => ({
    id,
    score: scores[id] ?? 3,
    rationale: `Fixture rationale for ${id} links the structured claim to supplied brief evidence and names the remaining risk.`,
    evidenceRefs: id === "reference-fit" ? ["vk-reference"] : ["brief-observation"],
    failureModes: [`${id} must be re-evaluated when real pilot evidence contradicts this fixture`],
  }));
}

function permissions(coreKey = "location") {
  return [
    { key: "camera", productValue: "Publish one photo of the concrete item or place involved", flow: "Create contribution from the relevant detail flow", requestMoment: "Tap Add a current photo in the composer", deniedFallback: "Publish a text description and category without a photo", role: coreKey === "camera" ? "core" : "supporting" },
    { key: "location", productValue: "Choose the nearest relevant house without exposing continuous movement", flow: "Select house before entering its scoped feed", requestMoment: "Tap Use my location on house selection", deniedFallback: "Search and select the address manually", role: coreKey === "location" ? "core" : "supporting" },
    { key: "push", productValue: "Receive the answer or commitment the person explicitly follows", flow: "Follow one request or confirm one commitment", requestMoment: "Tap Notify me about this request", deniedFallback: "Show unread state and updates inside the product inbox", role: coreKey === "push" ? "core" : "supporting" },
  ];
}

function common({ id, name, thesis, insight, unit, job, mechanism, difference, action, contribution, supply, scoreOverrides = {}, corePermission = "location" }) {
  return {
    schemaVersion: 1,
    id,
    name,
    productThesis: thesis,
    insight: { claim: insight, evidenceRefs: ["brief-observation"] },
    job: { actor: "A resident with an immediate bounded household need", situation: "The need appears before a task at home", motivation: "Avoid buying or coordinating more than the task requires", outcome: job },
    wedge: { audience: "Residents of one dense apartment building", situation: "A need can be fulfilled within a short walk and clear return window", mechanism },
    observableDifferentiation: {
      kind: "behavior",
      behavior: difference,
      comparator: "An unstructured neighbourhood chat or city-wide classifieds feed",
      measurement: "Share of opened units that reach a named commitment and completed outcome",
      threshold: "At least one in four relevant opens creates a commitment in the pilot",
      experiment: "Run a four-week two-house pilot and compare completion with the existing house chat",
      coreLoopStep: action,
      evidenceRefs: ["brief-observation"],
    },
    valueExchange: { userGives: [contribution, "A clear time or availability constraint"], userGets: [job, "A visible accountable next step"] },
    contentModel: { primaryUnit: unit, relationships: [`${unit} belongs to one House`, `${unit} links a requester, responder, and Commitment`] },
    contentSupply: {
      coldStartSources: [`House stewards seed verified ${unit} examples with explicit consent`],
      ongoingSources: [supply],
      contributorIncentives: ["A completed outcome lowers the next neighbour's coordination cost", "Contribution improves reciprocal access"],
      qualityControls: ["One-house visibility", "Expiry and duplicate detection", "Reporting and commitment history"],
    },
    socialGraphLeverage: { relationship: "Verified residents and their direct reciprocal commitments", mechanism: "Identity and completion history reduce uncertainty without a public popularity score", valueWithoutGraph: "Seeded current units and manual house choice provide first-session value before friend matches" },
    coldStart: { firstSessionValue: `Browse current ${unit} examples and complete one bounded task`, seededContent: `Consent-based representative ${unit} entries for the pilot house`, emptyStateAction: `Create the first ${unit} with a guided constraint form` },
    activation: { moment: "A resident reaches a commitment with a named counterparty and time", signal: "commitment_started with both parties confirmed", window: "First seven days after joining a House" },
    coreLoop: { trigger: "A bounded household need or completed reciprocal action", action, reward: job, contribution, hypothesis: "Visible completion makes the next relevant contribution more likely", successMetric: "Second completed commitment or contribution within 30 days", testPlan: "Pilot two houses and inspect cohort completion plus qualitative failure reasons", evidenceRefs: ["brief-observation"] },
    habitLoop: { cue: "A relevant nearby need or return deadline", routine: action, reward: "The task closes with less purchase and coordination", frequency: "Event-driven, measured by house rather than assumed daily" },
    retention: { reasons: ["Open commitments need closure", "New relevant units appear within one House", "Reciprocity makes future access easier"], leadingIndicators: ["Commitment completion", "Contribution after receiving value", "Second relevant open within 30 days"] },
    permissions: permissions(corePermission),
    trustSafety: { risks: ["Unsafe in-person handoff", "Theft or harassment", "Disclosure of a precise apartment"], controls: ["House-scoped identity", "Neutral handoff location", "Block/report and commitment cancellation"], reporting: "Report remains attached to the person and commitment, with an emergency exit from the flow" },
    privacy: { data: ["Selected House, not continuous movement history", "Product contribution and commitment state", "Optional item photo"], principles: ["Minimise address precision", "Request access at the causal action", "Keep denied fallback equivalent where possible"], retention: "Expire location-derived selection immediately; retain commitments only for the declared dispute window" },
    businessLogic: { model: "House-level partner sponsorship after product value is proven", payer: "Property operator or local partner, never the resident seeking help", value: "Lower duplicated purchases and unresolved household coordination", viabilitySignal: "Completed commitments per funded House exceed operating and moderation cost", constraints: "No paywall on safety, reporting, or return completion" },
    nonGoals: ["City-wide marketplace", "Anonymous public chat", "Professional rental inventory"],
    risks: [
      { risk: "Supply remains too sparse inside one House", mitigation: "Pilot dense houses and seed only consented current entries", killSignal: "Fewer than ten relevant units per active House after four weeks" },
      { risk: "People avoid accountable handoff", mitigation: "Use bounded commitments and neutral handoff points", killSignal: "More than half of commitments cancel before handoff" },
    ],
    assumptions: [
      { claim: "One House has enough reciprocal demand", risk: "high", validation: "Four-week supply and demand pilot", status: "needs-validation" },
      { claim: "Completion history improves trust without popularity scores", risk: "high", validation: "Interview both sides after completed and cancelled commitments", status: "needs-validation" },
    ],
    evidence: evidence(),
    referenceFit: { profileId: "vk-ios", mentalModel: "Identified people publish social units, respond, converse, and contribute again through a familiar dense feed", naturalFit: "Each unit belongs to a person and House graph; value grows through response and repeat contribution rather than passive utility use", borrowedPatterns: ["Social feed", "Person identity", "Conversation", "Notifications", "Service menu"], productMapping: `${unit} maps to a feed unit; Commitment maps to response and conversation; House scopes discovery`, tensions: ["House privacy must override VK-wide discovery", "Commitment state must remain clearer than generic reactions"], evidenceRefs: ["vk-reference"] },
    stressTest: { axes: axes(scoreOverrides) },
    delivery: delivery(name, unit, job),
  };
}

export const productGenerator = {
  async generateCandidates({ brief, rubric }) {
    if (brief.id !== "vk-neighbour-exchange") throw new Error("fixture adapter only accepts strong-brief.json");
    if (rubric.minimumAxisScore !== 3) throw new Error("fixture expects the fail-closed 3/4 floor");
    return [
      common({
        id: "borrow-circle", name: "Круг", unit: "Borrow request",
        thesis: "Соседи закрывают редкую бытовую задачу через одно обещание выдать и вернуть вещь, а не через бесконечный общий чат.",
        insight: "Для редкой вещи главная стоимость — не цена, а неопределённость, у кого она есть и когда её вернут.",
        job: "Borrow a nearby item with a clear handoff and return promise",
        mechanism: "A time-bounded borrow request becomes a two-party commitment with handoff and return states",
        difference: "People move from a relevant request to a tracked handoff and return instead of continuing an open chat",
        action: "Open a relevant borrow request and accept one bounded handoff",
        contribution: "Close the return and publish availability for a future neighbour",
        supply: "Residents publish available items after a successful return or from an unresolved request",
        scoreOverrides: { "observable-differentiation": 4, "cold-start": 4, "core-loop": 4, "permission-cohesion": 4 },
        corePermission: "camera",
      }),
      common({
        id: "skill-minute", name: "Пять минут", unit: "Five-minute help call",
        thesis: "Сосед просит не вещь, а один короткий бытовой совет с понятным вопросом и закрытием результата.",
        insight: "Часть бытовых задач застревает не из-за отсутствия инструмента, а из-за одного неизвестного шага.",
        job: "Get one bounded answer from a nearby experienced neighbour",
        mechanism: "A question expires after one accepted five-minute response and records whether the task closed",
        difference: "Questions close with an observed task outcome rather than accumulate generic comments",
        action: "Accept one bounded question and record whether the task closed",
        contribution: "Publish the resolved step as reusable local knowledge",
        supply: "Residents turn completed answers into house-specific reusable notes",
        scoreOverrides: { "content-supply": 2 },
        corePermission: "push",
      }),
      common({
        id: "shared-shelf", name: "Полка", unit: "Shared inventory card",
        thesis: "Дом ведёт общую полку редко используемых вещей и показывает ответственному жителю понятный срок возврата.",
        insight: "Повторяющиеся покупки можно сократить, если у общей вещи есть владелец состояния, а не только место хранения.",
        job: "Reserve a shared item and return it to an accountable state",
        mechanism: "A house-owned inventory card moves through available, reserved, collected, and returned states",
        difference: "Shared inventory exposes accountable availability rather than a static list of items",
        action: "Reserve one available card and confirm collection",
        contribution: "Confirm return condition and availability for the next resident",
        supply: "House partners and residents add only items with an accountable steward",
        scoreOverrides: { "social-graph": 2 },
        corePermission: "location",
      }),
    ];
  },
};

export default productGenerator;
