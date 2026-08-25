#!/usr/bin/env node
// Compatibility entry point. The deep pipeline module owns ordering so this
// command cannot drift from `native/cli.mjs` or skip product maturity/docs.
import { runNativePipeline } from "../lib/native-pipeline.mjs";

const slug = process.argv[2];
if (!slug) {
  console.error("usage: pipeline.mjs <slug>");
  process.exit(1);
}

try {
  runNativePipeline({ operation: "release", slug });
  console.log(`\nКонцепт «${slug}» прошёл продуктовый и нативный конвейер целиком.`);
} catch (error) {
  console.error(`Конвейер остановлен: ${error.message}`);
  process.exit(1);
}
