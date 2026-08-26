import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCodexCLIStructuredModel } from "../lib/codex-cli-structured-model.mjs";
import { createStructuredModelFactoryAdapters } from "../lib/structured-model-factory-adapters.mjs";
import { createNeutralMediaPlaceholderProvider } from "../lib/structured-model-native-renderer.mjs";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const reportModelProgress = event => {
  if (event.type === "model-cache-hit") console.error(`  ↳ ${event.operation} · debug cache`);
  if (event.type === "model-start") console.error(`  ↳ ${event.operation} · started`);
  if (event.type === "model-complete") console.error(`  ↳ ${event.operation} · ${Math.round(event.durationMs)} ms`);
  if (event.type === "model-failed") console.error(`  ↳ ${event.operation} · failed after ${Math.round(event.durationMs)} ms`);
};
const client = clientId => createCodexCLIStructuredModel({
  clientId,
  projectRoot,
  cacheDirectory: process.env.CAMO_FACTORY_MODEL_CACHE || null,
  onProgress: reportModelProgress,
});

const adapters = createStructuredModelFactoryAdapters({
  productModel: client("product-generator"),
  evaluatorModel: client("product-evaluator"),
  experienceModel: client("experience-planner"),
  visualModel: client("visual-direction-generator"),
  visualEvaluatorModel: client("visual-direction-evaluator"),
  rendererModel: client("native-renderer"),
  revisionModel: client("native-reviser"),
  visionModel: client("independent-vision-critic"),
  visionReviewerName: "codex-independent-native-vision-critic",
  assetProvider: createNeutralMediaPlaceholderProvider(),
  projectRoot,
});

export const {
  productFactoryGenerator,
  productFactoryEvaluator,
  experiencePlanner,
  visualDirectionGenerator,
  visualDirectionEvaluator,
  factoryRenderer,
  productUICritic,
  productRevisionAdapter,
} = adapters;
