#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { NATIVE_PROJECT_ROOT } from "../lib/project-paths.mjs";

execFileSync(process.execPath, [join(NATIVE_PROJECT_ROOT, "native", "cli.mjs"), "check-all"], {
  cwd: NATIVE_PROJECT_ROOT,
  stdio: "inherit",
  env: process.env,
});

if (process.env.IOS_CONCEPTS_ISOLATION_CHILD !== "1") {
  execFileSync(process.execPath, [join(NATIVE_PROJECT_ROOT, "native", "gates", "isolation.mjs")], {
    cwd: NATIVE_PROJECT_ROOT,
    stdio: "inherit",
    env: process.env,
  });
}
