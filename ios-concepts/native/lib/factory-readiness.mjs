import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileNativeConcept } from "./compile-concept.mjs";
import { auditReferenceProfiles } from "./reference-profile-catalog.mjs";
import { auditVisualLanguage } from "./visual-language-audit.mjs";
import { auditDeveloperDocumentation } from "./developer-documentation.mjs";
import { canonicalProjectPath } from "./project-paths.mjs";

const defaultRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const readJSON = path => JSON.parse(readFileSync(path, "utf8"));
const mean = values => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 10) / 10;

function receipt(root, name) {
  const path = join(root, "native", "artifacts", "receipts", `${name}.json`);
  return existsSync(path) ? readJSON(path) : null;
}

function conceptEvidence(root, slug, matrix) {
  const concept = readJSON(join(root, "concepts", slug, "concept.json"));
  const compiled = compileNativeConcept(concept);
  const developerDocs = auditDeveloperDocumentation({ root, concept, manifest: compiled.manifest });
  const visualDiagnostics = auditVisualLanguage(join(root, "native", "apps", slug), slug);
  const captureSource = readJSON(join(root, "native", "apps", slug, "capture.json"));
  const captures = matrix.devices.flatMap(device => matrix.concepts[slug].captures.map(id => {
    const driver = captureSource.drivers.find(item => `${item.surface}--${item.state}` === id);
    const path = driver ? join(root, "native", "artifacts", slug, `shots-${device.id}`, `${driver.artifact}.png`) : null;
    return {
      device: device.id,
      id,
      path: path ? canonicalProjectPath(root, path) : null,
      present: Boolean(path && existsSync(path)),
    };
  }));
  const appName = slug[0].toUpperCase() + slug.slice(1);
  return {
    compile: { pass: compiled.ok, diagnostics: compiled.diagnostics },
    uxSpecification: { pass: compiled.ok && Boolean(compiled.manifest.uxSpecification?.uxSpecificationId), diagnostics: compiled.diagnostics.filter(item => item.code.startsWith("ux.")) },
    developerDocs: { pass: developerDocs.ok, diagnostics: developerDocs.diagnostics },
    visualLanguage: { pass: visualDiagnostics.length === 0, diagnostics: visualDiagnostics },
    buildReceipt: receipt(root, `build-${slug}`),
    matrixReceipt: receipt(root, "matrix"),
    generatedProject: existsSync(join(root, "native", "build", slug, `${appName}.xcodeproj`, "project.pbxproj")),
    captures,
  };
}

export function createFactoryReadinessReport(root = defaultRoot) {
  const matrix = readJSON(join(root, "native", "device-matrix.json"));
  const input = readJSON(join(root, "native", "factory-readiness-input.json"));
  const profiles = auditReferenceProfiles();
  const checkAll = receipt(root, "check-all");
  const concepts = Object.fromEntries(["looks", "dvor"].map(slug => [slug, conceptEvidence(root, slug, matrix)]));
  const vk = profiles.find(item => item.id === "vk-ios");

  function assessment(slug) {
    const evidence = concepts[slug];
    const checks = {
      productContract: evidence.compile.pass,
      uxSpecification: evidence.uxSpecification.pass,
      developerDocumentation: evidence.developerDocs.pass,
      visualConsistency: evidence.visualLanguage.pass && (slug !== "looks" || vk?.ready === true),
      predictableInteractions: Boolean(checkAll && evidence.matrixReceipt),
      permissionsCapabilities: Boolean(checkAll && evidence.buildReceipt),
      captures: evidence.captures.every(item => item.present),
      cleanRegenerationBuild: Boolean(evidence.buildReceipt && evidence.generatedProject),
    };
    const automatedConfidence = Math.round(Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100);
    const human = input.humanAssessment[slug];
    return {
      strategy: "VK reference mimicry",
      automatedConfidence,
      automatedChecks: checks,
      humanScore: mean([human.productContract, human.hierarchy, human.consistency, human.visualAccuracy, human.predictableInteractions]),
      humanAssessment: human,
    };
  }

  const manualBlockers = input.manualGates.filter(gate => !gate.complete).map(gate => gate.id);
  const evaluations = {
    looks: assessment("looks"),
    dvor: assessment("dvor"),
  };
  const automatedBlockers = Object.entries(evaluations).flatMap(([name, value]) =>
    Object.entries(value.automatedChecks).filter(([, pass]) => !pass).map(([check]) => `${name}.${check}`));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    definition: "factory-ready requires automated evidence plus independent visual/product and physical accessibility gates",
    humanReview: {
      reviewerKind: input.humanAssessment.reviewerKind,
      independentReviewComplete: input.humanAssessment.independentReviewComplete,
    },
    evaluations,
    pipelineStrategies: {
      mimicry: {
        validatedConcepts: ["looks", "dvor"],
        automatedConfidence: Math.round(mean(Object.values(evaluations).map(item => item.automatedConfidence))),
        humanScore: mean(Object.values(evaluations).map(item => item.humanScore)),
      },
      differentiation: {
        validatedConcepts: [],
        automatedConfidence: 50,
        humanScore: null,
        blocker: "no current differentiation concept; adapter and SF grammar exist but have no end-to-end product evidence",
      },
    },
    evidence: { profiles, concepts, checkAllReceipt: checkAll, deviceMatrix: matrix },
    blockers: { automated: automatedBlockers, manual: manualBlockers },
    factoryReady: automatedBlockers.length === 0 && manualBlockers.length === 0,
  };
}

export function writeFactoryReadinessReport({ root = defaultRoot, gate = false } = {}) {
  const report = createFactoryReadinessReport(root);
  const path = join(root, "docs", "factory-readiness.json");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(report, null, 2) + "\n");
  if (gate && !report.factoryReady) throw new Error(`factory readiness blocked: ${[...report.blockers.automated, ...report.blockers.manual].join(", ")}`);
  return { path, report };
}
