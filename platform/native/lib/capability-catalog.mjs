const usage = (key, framework, runtimeAdapter) => ({
  usageKeys: [key],
  frameworks: [framework],
  runtimeAdapter,
  verification: "system-prompt",
});

const entitlement = (key, value, framework, runtimeAdapter) => ({
  entitlements: [{ key, value }],
  frameworks: framework ? [framework] : [],
  runtimeAdapter,
  verification: "signed-build",
});

const background = (mode, framework, runtimeAdapter) => ({
  backgroundModes: [mode],
  frameworks: framework ? [framework] : [],
  runtimeAdapter,
  verification: "built-info-plist",
});

/**
 * Platform knowledge lives here, not in concept.json. A permission may expand to
 * several build artifacts. Values containing ${bundleId} are resolved by the compiler.
 */
export const IOS_CAPABILITY_CATALOG = Object.freeze({
  camera: usage("NSCameraUsageDescription", "AVFoundation", "camera"),
  mic: usage("NSMicrophoneUsageDescription", "AVFoundation", "microphone"),
  speech: usage("NSSpeechRecognitionUsageDescription", "Speech", "speech"),
  photo: usage("NSPhotoLibraryUsageDescription", "Photos", "photoLibrary"),
  photos: usage("NSPhotoLibraryUsageDescription", "Photos", "photoLibrary"),
  photoadd: usage("NSPhotoLibraryAddUsageDescription", "Photos", "photoLibraryAdd"),
  photosadd: usage("NSPhotoLibraryAddUsageDescription", "Photos", "photoLibraryAdd"),
  location: usage("NSLocationWhenInUseUsageDescription", "CoreLocation", "locationWhenInUse"),
  locationalways: {
    usageKeys: ["NSLocationWhenInUseUsageDescription", "NSLocationAlwaysAndWhenInUseUsageDescription"],
    frameworks: ["CoreLocation"],
    runtimeAdapter: "locationAlways",
    verification: "system-prompt",
  },
  push: entitlement("aps-environment", "development", "UserNotifications", "notifications"),
  commnotif: {
    entitlements: [{ key: "com.apple.developer.usernotifications.communication", value: true }],
    extensionTargets: ["notification-service"],
    frameworks: ["UserNotifications"],
    runtimeAdapter: "communicationNotifications",
    verification: "signed-build-and-extension",
  },
  tracking: usage("NSUserTrackingUsageDescription", "AppTrackingTransparency", "tracking"),
  contacts: usage("NSContactsUsageDescription", "Contacts", "contacts"),
  calendar: {
    usageKeys: ["NSCalendarsUsageDescription", "NSCalendarsFullAccessUsageDescription"],
    frameworks: ["EventKit"],
    runtimeAdapter: "calendar",
    verification: "system-prompt",
  },
  faceid: usage("NSFaceIDUsageDescription", "LocalAuthentication", "localAuthentication"),
  localnet: usage("NSLocalNetworkUsageDescription", "Network", "localNetwork"),
  localnetwork: usage("NSLocalNetworkUsageDescription", "Network", "localNetwork"),
  music: usage("NSAppleMusicUsageDescription", "MusicKit", "musicLibrary"),
  audio: background("audio", "AVFoundation", "backgroundAudio"),
  voip: background("voip", "CallKit", "voip"),
  remotenotif: background("remote-notification", "UserNotifications", "remoteNotifications"),
  fetch: background("fetch", null, "backgroundFetch"),
  processing: background("processing", "BackgroundTasks", "backgroundProcessing"),
  bgtask: {
    info: [{ key: "BGTaskSchedulerPermittedIdentifiers", value: ["${bundleId}.refresh"] }],
    frameworks: ["BackgroundTasks"],
    runtimeAdapter: "backgroundTask",
    verification: "built-info-plist",
  },
  appgroups: entitlement(
    "com.apple.security.application-groups",
    ["group.${bundleId}"],
    null,
    "appGroup",
  ),
  keychain: entitlement(
    "keychain-access-groups",
    ["$(AppIdentifierPrefix)${bundleId}.shared"],
    "Security",
    "keychainSharing",
  ),
  wifiinfo: entitlement("com.apple.developer.networking.wifi-info", true, "NetworkExtension", "wifiInfo"),
  hotspot: entitlement(
    "com.apple.developer.networking.HotspotConfiguration",
    true,
    "NetworkExtension",
    "hotspotConfiguration",
  ),
  applesignin: entitlement("com.apple.developer.applesignin", ["Default"], "AuthenticationServices", "signInWithApple"),
  associateddomains: entitlement("com.apple.developer.associated-domains", [], null, "associatedDomains"),
  domains: entitlement("com.apple.developer.associated-domains", [], null, "associatedDomains"),
  autofill: {
    extensionTargets: ["credential-provider"],
    frameworks: ["AuthenticationServices"],
    runtimeAdapter: "credentialProvider",
    verification: "extension-target",
  },
  shareext: {
    extensionTargets: ["share-extension"],
    frameworks: ["UniformTypeIdentifiers"],
    runtimeAdapter: "shareExtension",
    verification: "extension-target",
  },
});

function resolveValue(value, variables) {
  if (typeof value === "string") {
    return value.replaceAll("${bundleId}", variables.bundleId);
  }
  if (Array.isArray(value)) return value.map(item => resolveValue(item, variables));
  return value;
}

export function resolveCapability(permissionKey, buildContext) {
  const definition = IOS_CAPABILITY_CATALOG[permissionKey];
  if (!definition) return null;
  return {
    permissionKey,
    usageKeys: definition.usageKeys || [],
    info: (definition.info || []).map(item => ({
      ...item,
      value: resolveValue(item.value, buildContext),
    })),
    entitlements: (definition.entitlements || []).map(item => ({
      ...item,
      value: resolveValue(item.value, buildContext),
    })),
    backgroundModes: definition.backgroundModes || [],
    extensionTargets: definition.extensionTargets || [],
    frameworks: definition.frameworks || [],
    runtimeAdapter: definition.runtimeAdapter,
    verification: definition.verification,
  };
}
