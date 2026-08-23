import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const appRoot = join(import.meta.dirname, "../apps/dvor");
const app = readFileSync(join(appRoot, "App.swift"), "utf8");
const onboarding = readFileSync(join(appRoot, "Onboarding.swift"), "utf8");
const services = readFileSync(join(appRoot, "Services.swift"), "utf8");
const tabs = readFileSync(join(appRoot, "Tabs.swift"), "utf8");

test("Dvor cannot enter the house before contextual residence verification", () => {
  assert.match(app, /enum\s+DvorEntryStage/);
  assert.match(app, /case\s+residenceVerification/);
  assert.match(app, /ResidenceVerificationScreen/);
  assert.doesNotMatch(onboarding, /VKButton\(title:\s*"Это мой дом"\)\s*\{\s*complete\(\)\s*\}/);
  assert.match(app, /session\.submitResidenceForReview\(\)/);
  assert.match(app, /ResidencePendingGateScreen/);
  assert.doesNotMatch(onboarding, /Войти с Google/);
});

test("guest QR action reaches the camera capability instead of a toast-only stub", () => {
  const guest = services.slice(services.indexOf("struct GuestAccessScreen"), services.indexOf("struct EventsScreen"));
  assert.match(guest, /requestCameraForEvidence|request\(\.camera\)/);
  assert.match(guest, /DataScannerViewController/);
  assert.match(guest, /connectToGuestNetwork\(qrPayload:/);
});

test("protected access authenticates before rendering credentials", () => {
  const access = services.slice(services.indexOf("struct HouseAccessScreen"), services.indexOf("struct NeighboursScreen"));
  assert.match(access, /authenticateDeviceOwner/);
  assert.match(access, /accessCheck != true/);
  assert.ok(access.indexOf("accessCheck != true") < access.indexOf('accessRow("Домофон"'));
});

test("operational services use real system adapters and validation", () => {
  assert.match(services, /EKEventStore/);
  assert.match(services, /eventStore\.save/);
  assert.match(services, /CNContactFetchRequest/);
  assert.match(services, /validationError/);
  assert.match(services, /UserDefaults\.standard\.set\(store\.coldWater/);
});

test("messaging actions create product messages instead of clearing drafts", () => {
  assert.match(tabs, /store\.sendText/);
  assert.match(tabs, /store\.sendPhoto/);
  assert.match(tabs, /store\.sendVoice/);
  assert.match(tabs, /AVAudioRecorder/);
  assert.match(tabs, /transcribe\(/);
  assert.match(tabs, /Data\(contentsOf: voiceRecordingURL\)/);
  assert.match(tabs, /AVAudioPlayer\(data: data\)/);
});

test("Dvor does not present a simulated call as a real product outcome", () => {
  const chat = tabs.slice(tabs.indexOf("struct HouseChatScreen"), tabs.indexOf("struct YardScreen"));
  assert.doesNotMatch(chat, /permissions\.request\(\.voip\)/);
  assert.doesNotMatch(chat, /HouseCallScreen|CallPhase|Соединяем через Двор/);
});

test("residence flow requests each capability on the screen that explains its benefit", () => {
  const join = onboarding.slice(onboarding.indexOf("struct ResidenceJoinScreen"), onboarding.indexOf("struct ResidenceVerificationScreen"));
  const verify = onboarding.slice(onboarding.indexOf("struct ResidenceVerificationScreen"), onboarding.indexOf("struct ManualResidenceScreen"));
  assert.match(join, /permissions\.request\(\.location\)/);
  assert.doesNotMatch(join, /permissions\.request\(\.wifiinfo\)/);
  assert.match(verify, /permissions\.request\(\.wifiinfo\)/);
  assert.doesNotMatch(verify, /permissions\.request\(\.location\)/);
  assert.match(verify, /Проверить, что я дома/);
  assert.match(verify, /manualFallback/);
});
