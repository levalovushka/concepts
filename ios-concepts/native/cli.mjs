#!/usr/bin/env node
import { runNativePipeline } from "./lib/native-pipeline.mjs";
import { writeFactoryReadinessReport } from "./lib/factory-readiness.mjs";

const [operation, slug] = process.argv.slice(2);
if (!operation) {
  console.error("usage: node native/cli.mjs <product-gate|compile|check|build|capture|smoke|release|test|check-all|matrix|profiles|readiness|readiness-gate> [slug]");
  process.exit(1);
}
try {
  if (["readiness", "readiness-gate"].includes(operation)) {
    const { path, report } = writeFactoryReadinessReport({ gate: operation === "readiness-gate" });
    console.log(`${report.factoryReady ? "✓" : "○"} factory readiness → ${path}`);
    for (const [name, value] of Object.entries(report.evaluations)) {
      console.log(`  ${name}: automated ${value.automatedConfidence}% · human ${value.humanScore}/10`);
    }
    process.exit(0);
  }
  const result = runNativePipeline({ operation, slug });
  if (operation === "profiles") {
    for (const profile of result.profiles) {
      console.log(`${profile.ready ? "✓" : "○"} ${profile.product}`);
      for (const blocker of profile.blockers) console.log(`  — ${blocker}`);
    }
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
