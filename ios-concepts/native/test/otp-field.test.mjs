import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const native = join(import.meta.dirname, "..");
const shared = readFileSync(join(native, "DesignSystem/NativeOTPField.swift"), "utf8");
const auth = readFileSync(join(native, "DesignSystem/NativeEmailAuth.swift"), "utf8");
const appSources = readdirSync(join(native, "apps"), { recursive: true })
  .filter(file => file.endsWith(".swift"))
  .map(file => readFileSync(join(native, "apps", file), "utf8"));

test("every concept uses one production OTP component", () => {
  assert.match(shared, /struct NativeOTPField/);
  assert.match(shared, /textContentType\(\.oneTimeCode\)/);
  assert.match(shared, /filter\(\\\.isNumber\)\.prefix\(length\)/);
  assert.match(shared, /focused\(\$isFocused\)/);
  assert.match(shared, /accessibilityValue/);
  assert.match(shared, /t\.palette\.surface/);
  assert.match(shared, /t\.palette\.separator/);
  assert.match(auth, /NativeOTPField\(code: \$code/);
  assert.equal(appSources.some(source => /struct (OTPField|DvorOTPField)/.test(source)), false,
    "apps must not fork the shared OTP field");
  assert.equal(appSources.every(source => !source.includes("NativeOTPField(code: $code")), true,
    "apps must consume OTP only through the shared NativeEmailAuth boundary");
});
