export const HTML_CONCEPT_PATTERN_CATALOG = Object.freeze([
  Object.freeze({
    id: "social-context-before-feed",
    sources: ["platform/concepts/druzya/screens/feed.html", "platform/concepts/klass/screens/feed.html"],
    recipes: ["authoredFeed", "socialDiscovery"],
    rule: "Lead with a compact social context or urgent object, then authored content with identity, metadata and object-attached proof.",
  }),
  Object.freeze({
    id: "structured-social-progress",
    sources: ["platform/concepts/klass/screens/feed.html"],
    recipes: ["authoredFeed", "notificationCenter", "ownedProfile", "serviceMenu", "featureList"],
    rule: "Turn status into product facts such as who acted, how many completed and what is due; avoid generic activity labels.",
  }),
  Object.freeze({
    id: "media-continue-hero",
    sources: ["platform/concepts/strochka/screens/program.html"],
    recipes: ["mediaHome", "authoredFeed", "resultCompletion"],
    rule: "A media-led root starts with one resumable hero carrying subject, progress and a single next action; gray media placeholders are valid evidence.",
  }),
  Object.freeze({
    id: "persistent-media-context",
    sources: ["platform/concepts/strochka/screens/player.html"],
    recipes: ["musicPlayer", "mediaHome"],
    rule: "Keep the playing object, progress and next control together; secondary queues come after the primary playback task.",
  }),
  Object.freeze({
    id: "video-subject-detail",
    sources: ["platform/concepts/liga/screens/watch.html", "platform/concepts/liga/screens/home.html"],
    recipes: ["videoDetail", "mediaHome", "socialDiscovery"],
    rule: "Attach title, source identity, live or duration metadata, actions and timeline to the same media subject.",
  }),
  Object.freeze({
    id: "domain-first-differentiation",
    sources: [
      "platform/concepts/today/docs/01-product-vision.md",
      "platform/concepts/dvor/docs/03-design-system.md",
      "platform/concepts/strochka/docs/03-design-system.md",
    ],
    recipes: ["authoredFeed", "contributionEditor", "completion", "recipientPicker", "ownedProfile"],
    rule: "Differentiate with the domain model and one signature component; preserve native hierarchy and vary accent, type or radius only after the product structure is clear.",
  }),
  Object.freeze({
    id: "capability-inside-feature",
    sources: ["platform/concepts/druzya/sections.html", "platform/concepts/klass/sections.html"],
    recipes: ["publicationEditor", "conversationList", "socialDiscovery", "ownedProfile", "settings", "recipientPicker", "serviceMenu"],
    rule: "A capability is reached through a useful feature in two or three taps, with a visible granted result and denied fallback; never collect requests in an access catalogue.",
  }),
]);

export function resolveHTMLConceptPatterns(recipe) {
  return Object.freeze(HTML_CONCEPT_PATTERN_CATALOG
    .filter(pattern => pattern.recipes.includes(recipe))
    .map(pattern => Object.freeze({ id: pattern.id, sources: pattern.sources, rule: pattern.rule })));
}
