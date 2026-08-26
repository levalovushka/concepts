const PLATFORM_EVIDENCE = Object.freeze({
  camera: [/UIImagePickerController/, /didFinishPickingMediaWithInfo/],
  photos: [/PHPickerViewController/, /didFinishPicking/],
  mic: [/AVAudioRecorder/, /\.record\(\)/],
  speech: [/SFSpeechRecognizer/, /recognitionTask\s*\(/],
  location: [/CLLocationManager/, /requestLocation\(\)|didUpdateLocations/],
  contacts: [/CNContactPickerViewController/, /didSelect\s+contacts/],
  calendar: [/EKEventStore/, /save\s*\(.*event|store\.save\s*\(/s],
  faceid: [/LAContext/, /evaluatePolicy\s*\(/],
  push: [/UNNotificationRequest/, /UNUserNotificationCenter\.current\(\)\.add|\.add\s*\(.*UNNotificationRequest/s],
  commnotif: [/UNNotificationServiceExtension|INSendMessageIntent|CXStartCallAction/],
  remotenotif: [/registerForRemoteNotifications/, /didReceiveRemoteNotification/],
  fetch: [/performFetchWithCompletionHandler/, /setMinimumBackgroundFetchInterval|lastBackgroundRefresh/],
  bgtask: [/BGTaskScheduler\.shared\.register/, /BGAppRefreshTaskRequest/],
  appgroups: [/UserDefaults\s*\(suiteName:|containerURL\s*\(forSecurityApplicationGroupIdentifier:/],
  keychain: [/SecItemAdd/, /SecItemCopyMatching|SecItemUpdate/],
  autofill: [/ASCredentialIdentityStore/, /saveCredentialIdentities/],
  wifiinfo: [/NEHotspotNetwork\.fetchCurrent/],
  tracking: [/ATTrackingManager/, /requestTrackingAuthorization/],
  audio: [/AVAudioPlayer|AVPlayer/, /MPNowPlayingInfoCenter/],
  voip: [/CXCallController/, /CXStartCallAction/],
  associateddomains: [/onOpenURL|continueUserActivity|onContinueUserActivity/, /URL|NSUserActivity/],
  hotspot: [/NEHotspotConfiguration/, /NEHotspotConfigurationManager\.shared\.apply/],
});

function hasText(value, minimum = 3) {
  return typeof value === "string" && value.trim().length >= minimum;
}

export function validateCapabilityOutcome(binding, { entities, actions }) {
  if (!binding || !actions.has(binding.actionId)) return "needs an existing product action";
  if (!hasText(binding.observableResult, 8)) return "needs an observable result";
  if (!hasText(binding.fallback, 8)) return "needs an executable denied fallback";
  if (!entities.has(binding.outcome?.entityId)) return "needs an outcome owned by a world entity";
  if (!hasText(binding.outcome?.stateField, 3)) return "needs a concrete product state field";
  if (!/^[a-z][A-Za-z0-9]{2,50}$/.test(binding.outcome?.stateField || "")) return "needs a Swift-compatible product state field";
  if (!hasText(binding.outcome?.proof, 8)) return "needs observable proof of the product result";
  return null;
}

function escaped(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function auditCapabilityOutcomeImplementation({ capabilities, manifest, swiftSource, runtimeSource = "", uiTestSource = "" }) {
  const problems = [];
  const platformSource = `${swiftSource}\n${runtimeSource}`;
  if (/ForEach\s*\([^)]*permissions|permissions\.request\(key\)/.test(swiftSource)) {
    problems.push("generic capability control: permissions must belong to concrete product gestures, not a generated access list");
  }
  for (const capability of capabilities || []) {
    const permission = manifest?.permissions?.find(item => item.key === capability.key);
    const marker = permission?.screen ? `${permission.screen}.${capability.actionId}` : capability.actionId;
    if (!swiftSource.includes(`.nativeAction("${marker}")`)) {
      problems.push(`${capability.key}/${capability.actionId}: owning product control is not bound to ${marker}`);
    }
    const fieldPattern = new RegExp(`\\b${escaped(capability.outcome.stateField)}\\b`);
    if (!fieldPattern.test(swiftSource)) {
      problems.push(`${capability.key}/${capability.actionId}: contracted state field ${capability.outcome.stateField} is not implemented`);
    }
    const missing = (PLATFORM_EVIDENCE[capability.key] || []).filter(pattern => !pattern.test(platformSource));
    if (missing.length) {
      problems.push(`${capability.key}/${capability.actionId}: real platform effect is missing (${missing.map(item => item.source).join(", ")})`);
    }
    if (uiTestSource) {
      const key = capability.key.toUpperCase();
      if (!uiTestSource.includes(key) && !uiTestSource.includes(capability.key)) {
        problems.push(`${capability.key}/${capability.actionId}: XCUI capability outcome scenario is missing`);
      }
    }
  }
  if (uiTestSource && (!uiTestSource.includes("granted") || !uiTestSource.includes("denied"))) {
    problems.push("XCUI capability suite must prove both granted and denied outcomes");
  }
  return problems;
}
