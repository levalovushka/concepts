import test from "node:test";
import assert from "node:assert/strict";
import { resolveExtension } from "../lib/extension-catalog.mjs";

test("credential provider never embeds house secrets or releases them without interaction", () => {
  const provider = resolveExtension("credential-provider", {
    productName: "Двор",
    slug: "dvor",
    bundleId: "com.camo.dvor",
  });

  assert.doesNotMatch(provider.source, /dvor-guest-24|password:\s*"48"/,
    "generated extension source must not contain product credentials");
  assert.match(provider.source, /SecItemCopyMatching/,
    "credentials must be read from Keychain at request time");
  assert.match(provider.source, /userInteractionRequired/,
    "sensitive credentials must not be returned without user interaction");
  assert.ok(provider.entitlements.some(item => item.key === "keychain-access-groups"),
    "credential provider must share the protected Keychain access group");
});
