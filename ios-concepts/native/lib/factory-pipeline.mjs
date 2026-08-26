import { developExperienceContract } from "./experience-contract.mjs";
import { releaseFactoryProduct } from "./factory-release.mjs";
import { createFactoryDevelopmentArtifact, developProductFactory, resumeLeanProductFactory } from "./product-factory.mjs";
import { createVisualDevelopmentArtifact, developVisualDirection } from "./visual-direction.mjs";
import { performance } from "node:perf_hooks";

export async function runFactoryPipeline({ request, adapters, benchmark = null, onProgress = null, productFailure = null }) {
  const wallStartedAt = new Date().toISOString();
  const wallStart = performance.now();
  const stages = [];
  let automatedRevisionCount = 0;
  const artifacts = { factoryRequest: structuredClone(request) };
  const timed = async (id, operation) => {
    const started = performance.now();
    onProgress?.({ type: "stage-start", stage: id });
    try {
      const result = await operation();
      const measurement = Object.freeze({ id, durationMs: Math.round((performance.now() - started) * 100) / 100, status: result?.ok === false ? "failed" : "completed" });
      stages.push(measurement);
      onProgress?.({ type: "stage-complete", stage: id, ...measurement });
      return result;
    } catch (error) {
      const measurement = Object.freeze({ id, durationMs: Math.round((performance.now() - started) * 100) / 100, status: "crashed" });
      stages.push(measurement);
      onProgress?.({ type: "stage-complete", stage: id, ...measurement });
      throw error;
    }
  };
  const metrics = (manualInterventions = benchmark?.manualInterventions ?? null) => Object.freeze({
    startedAt: wallStartedAt,
    finishedAt: new Date().toISOString(),
    wallClockMs: Math.round((performance.now() - wallStart) * 100) / 100,
    stages: Object.freeze([...stages]),
    automatedRevisionCount,
    manualInterventions,
  });
  const failed = (stage, diagnostics) => Object.freeze({
    ok: false, stage, diagnostics, artifacts: Object.freeze({ ...artifacts }), metrics: metrics(),
  });

  const product = await timed("product", () => productFailure
    ? resumeLeanProductFactory({ request, failure: productFailure, evaluator: adapters?.productFactoryEvaluator })
    : developProductFactory({ request, generator: adapters?.productFactoryGenerator, evaluator: adapters?.productFactoryEvaluator }));
  if (!product.ok) {
    artifacts.productFailure = structuredClone(product);
    return failed("product", product.diagnostics);
  }
  artifacts.factoryDevelopment = createFactoryDevelopmentArtifact({ request, result: product });

  const experience = await timed("product-integrity", () => developExperienceContract({
    factoryArtifact: artifacts.factoryDevelopment,
    planner: adapters?.experiencePlanner,
  }));
  if (!experience.ok) return failed("experience", experience.diagnostics);
  automatedRevisionCount += experience.revisionCount || 0;
  artifacts.experienceContract = experience.contract;

  const visual = await timed("visual-direction", () => developVisualDirection({
    factoryArtifact: artifacts.factoryDevelopment,
    experienceContract: artifacts.experienceContract,
    generator: adapters?.visualDirectionGenerator,
    evaluator: adapters?.visualDirectionEvaluator,
  }));
  if (!visual.ok) return failed("visual", visual.diagnostics);
  artifacts.visualDevelopment = createVisualDevelopmentArtifact(visual);

  const release = await timed("render-review-release", () => releaseFactoryProduct({
    factoryArtifact: artifacts.factoryDevelopment,
    experienceContract: artifacts.experienceContract,
    visualDevelopment: artifacts.visualDevelopment,
    renderer: adapters?.factoryRenderer,
    critic: adapters?.productUICritic,
    reviser: adapters?.productRevisionAdapter,
  }));
  artifacts.release = release;
  automatedRevisionCount += Math.max(0, (release?.renderAttempts?.length || 1) - 1);
  automatedRevisionCount += Math.max(0, (release?.attempts?.length || 1) - 1);
  if (!release.ok) return failed("release", release.diagnostics);
  return Object.freeze({
    ok: true, stage: "complete", diagnostics: [], artifacts: Object.freeze({ ...artifacts }), metrics: metrics(),
  });
}
