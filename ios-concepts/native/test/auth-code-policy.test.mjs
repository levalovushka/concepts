import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

test("local concepts accept any complete numeric OTP while the failure fixture stays deterministic", () => {
  const directory = mkdtempSync(join(tmpdir(), "native-auth-policy-"));
  const main = join(directory, "main.swift");
  const binary = join(directory, "auth-policy");
  writeFileSync(main, `
import Foundation

precondition(NativeAuthCodePolicy.accepts("1234", length: 4, demoCode: "0427", isFailureFixture: false))
precondition(NativeAuthCodePolicy.accepts("0427", length: 4, demoCode: "0427", isFailureFixture: false))
precondition(!NativeAuthCodePolicy.accepts("123", length: 4, demoCode: "0427", isFailureFixture: false))
precondition(!NativeAuthCodePolicy.accepts("1234", length: 4, demoCode: "0427", isFailureFixture: true))
precondition(NativeAuthCodePolicy.accepts("0427", length: 4, demoCode: "0427", isFailureFixture: true))
`);
  let error;
  try {
    execFileSync("xcrun", ["swiftc", fileURLToPath(new URL("../DesignSystem/NativeAuthCodePolicy.swift", import.meta.url)), main, "-o", binary]);
    execFileSync(binary);
  } catch (caught) {
    error = caught;
  }
  assert.equal(error, undefined, error?.stderr?.toString() || error?.message);
});
