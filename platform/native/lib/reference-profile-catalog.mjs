export const REFERENCE_PROFILE_CATALOG = Object.freeze({
  "vk-ios": {
    id: "vk-ios",
    product: "ВКонтакте",
    platform: "iOS",
    status: "ready",
    contract: "ReferenceProfiles/vk-ios/profile.json",
    evidence: "vk-visual-profile.md",
    swiftSources: ["ReferenceProfiles/vk-ios/Components.swift"],
    tokens: {
      accent: "#0077FF",
      background: "#FFFFFF",
      groupedBackground: "#F2F3F5",
      fill: "#F2F3F5",
      separator: "#E7E8EC",
      textPrimary: "#000000",
      textSecondary: "#818C99",
      badge: "#FF3347",
      outgoingStart: "#4B8BF5",
      outgoingMiddle: "#A44BF5",
      outgoingEnd: "#F54BA4",
    },
  },
  "vk-music-ios": {
    id: "vk-music-ios",
    product: "VK Музыка",
    platform: "iOS",
    status: "awaiting-evidence",
    contract: "ReferenceProfiles/vk-music-ios/profile.json",
    swiftSources: [],
    tokens: {},
  },
  "vk-video-ios": {
    id: "vk-video-ios",
    product: "VK Видео",
    platform: "iOS",
    status: "awaiting-evidence",
    contract: "ReferenceProfiles/vk-video-ios/profile.json",
    swiftSources: [],
    tokens: {},
  },
  "ok-ios": {
    id: "ok-ios",
    product: "Одноклассники",
    platform: "iOS",
    status: "awaiting-evidence",
    contract: "ReferenceProfiles/ok-ios/profile.json",
    swiftSources: [],
    tokens: {},
  },
});

export function resolveReferenceProfile(id) {
  return REFERENCE_PROFILE_CATALOG[id] || null;
}
