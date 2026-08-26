import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCodexCLIStructuredModel } from "../lib/codex-cli-structured-model.mjs";
import { createLeanDeliveryReviewer } from "../lib/lean-delivery-reviewer.mjs";
import { createStructuredModelLeanArchitect } from "../lib/structured-model-lean-architect.mjs";
import { createStructuredModelLeanBuilder } from "../lib/structured-model-lean-builder.mjs";
import { createStructuredVisionProductUICritic } from "../lib/structured-vision-product-ui-critic.mjs";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const report = event => {
  if (event.type === "model-cache-hit") console.error(`  ↳ ${event.operation} · cache`);
  if (event.type === "model-start") console.error(`  ↳ ${event.operation} · started`);
  if (event.type === "model-complete") console.error(`  ↳ ${event.operation} · ${Math.round(event.durationMs)} ms`);
  if (event.type === "model-failed") console.error(`  ↳ ${event.operation} · failed after ${Math.round(event.durationMs)} ms`);
};
const client = clientId => createCodexCLIStructuredModel({
  clientId,
  projectRoot,
  cacheDirectory: process.env.CAMO_LEAN_MODEL_CACHE || null,
  timeoutMs: Number(process.env.CAMO_LEAN_MODEL_TIMEOUT_MS || 600_000),
  onProgress: report,
});

const ideaModel = client("lean-product-generator");
const evaluatorModel = client("lean-product-evaluator");
const rendererModel = client("lean-native-renderer");
const visionModel = client("lean-independent-vision-critic");
const critic = createStructuredVisionProductUICritic({
  model: visionModel,
  reviewerName: "codex-lean-independent-vision-critic",
});

const nativeRoot = join(projectRoot, "native");
const reservedIds = new Set();
for (const directory of [join(nativeRoot, "apps"), join(nativeRoot, "ProductBlueprints")]) {
  if (!existsSync(directory)) continue;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const id = entry.isDirectory() ? entry.name : entry.name.replace(/-vk\.json$/, "");
    if (entry.isDirectory() || entry.name.endsWith("-vk.json")) reservedIds.add(id);
  }
}

export const architect = createStructuredModelLeanArchitect({ ideaModel, evaluatorModel, reservedIds: [...reservedIds] });
export const builder = createStructuredModelLeanBuilder({ model: rendererModel, projectRoot });
export const reviewer = createLeanDeliveryReviewer({ critic });
