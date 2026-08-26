import test from "node:test";
import assert from "node:assert/strict";
import { auditInterfaceSource } from "../lib/interface-anatomy.mjs";

test("interface anatomy rejects detached list actions", () => {
  const issues = auditInterfaceSource(`
    List {
      NativeContractActionControl(surfaceID: "chats", title: "Открыть разговор")
        .listRowInsets(EdgeInsets())
    }
  `);
  assert.deepEqual(issues.map(issue => issue.rule), ["attached-action"]);
});

test("interface anatomy rejects local and undeclared auth variants", () => {
  const issues = auditInterfaceSource(`
    struct AuthScreen: View { Text("Продолжить с Google") }
  `);
  assert.deepEqual(issues.map(issue => issue.rule), ["shared-auth", "declared-auth-provider"]);
});

test("interface anatomy accepts navigation attached to a concrete row", () => {
  const issues = auditInterfaceSource(`
    NavigationLink(value: "chat") { DialogRow(dialog: dialog) }
      .nativeAction("open-chat")
  `);
  assert.deepEqual(issues, []);
});
