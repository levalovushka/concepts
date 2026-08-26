import { createHash } from "node:crypto";
import { effectiveQualityFloor } from "./quality-policy.mjs";
import { resolveVisualCalibration } from "./visual-calibration-catalog.mjs";

export const PRODUCT_UI_CRITIC_AXES = Object.freeze([
  "product-identity",
  "task-clarity",
  "information-hierarchy",
  "composition-density",
  "cross-screen-consistency",
  "visual-craft",
  "interaction-predictability",
  "state-quality",
  "accessibility",
  "strategy-integrity",
  "reference-fidelity",
]);

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function stableId(value) {
  return `ui-review-${createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16)}`;
}

export async function reviewProductUI({ concept, captures, integrityContract = null, reviewer }) {
  const diagnostics = [];
  if (!reviewer?.review) return {
    ok: false,
    receipt: null,
    diagnostics: [diagnostic(
      "critic.reviewer.required",
      "Independent product/UI review requires a real reviewer adapter; deterministic audits cannot substitute for it.",
      "critic.reviewer",
    )],
  };
  if (!captures?.length) return {
    ok: false,
    receipt: null,
    diagnostics: [diagnostic("critic.captures.required", "Independent review requires current captures.", "critic.captures")],
  };

  const calibration = resolveVisualCalibration({
    strategy: concept.native?.design?.strategy,
    referenceProfileId: concept.native?.design?.referenceProfile || null,
  });
  const request = Object.freeze({
    schemaVersion: 1,
    product: {
      slug: concept.slug,
      thesis: concept.productDevelopment?.productContract?.productThesis,
      identity: concept.native?.deliveryIdentity,
      strategy: concept.native?.design?.strategy,
      referenceProfile: concept.native?.design?.referenceProfile || null,
      visualDirectionContractId: concept.native?.design?.visualDirectionContractId || null,
      criticalFlows: concept.productDevelopment?.productContract?.delivery?.criticalFlows || [],
      canonicalContent: integrityContract?.content || null,
      screenBlueprints: integrityContract?.screenBlueprints || [],
      entryPoints: integrityContract?.entryPoints || [],
      acceptanceJourneys: integrityContract?.journeys || [],
      visualCalibration: calibration ? {
        id: calibration.id,
        implementationRecipes: calibration.implementationRecipes || null,
        goldenCaptures: calibration.goldenCaptures || null,
        nonTransferable: calibration.nonTransferable,
      } : null,
    },
    rubric: {
      axes: PRODUCT_UI_CRITIC_AXES,
      scoreRange: [0, 10],
      rule: "Every capture and every axis is required; the minimum axis score controls the verdict.",
      instructions: [
        "Judge visible product meaning and next action, not implementation volume or decorative novelty.",
        "Inspect optical alignment, spacing, safe areas, icon weight, control attachment and content density at capture scale.",
        "Compare related captures for navigation, component, typography and state consistency.",
        "Treat an ambiguous control, detached action strip, fake state, clipped content or strategy drift as a blocker even when other axes are strong.",
        "Treat tabs, segments, filters, chevrons, avatars, badges or buttons with no distinct user-visible outcome as blocking false affordances.",
        "Compare every visible name, fact and media subject with canonicalContent. Cross-screen identity or media drift is a blocker.",
        "Check screenBlueprints and entryPoints: duplicated destinations, reordered product hierarchy or an action detached from its owning entity are blockers.",
        "For mimicry, compare each applicable core screen directly with the supplied golden captures. Matching colors without matching hierarchy, density, chrome and content attachment is a blocker.",
      ],
    },
    captures,
  });
  const response = await reviewer.review(request);
  const reviews = Array.isArray(response?.reviews) ? response.reviews : [];
  if (!response?.reviewer?.name || response?.reviewer?.independentFromGenerator !== true
      || !["vision", "human"].includes(response?.reviewer?.captureInspection)) diagnostics.push(diagnostic(
    "critic.independence.unproven", "Reviewer must identify itself, be independent from generation, and inspect actual captures through vision or a human review.", "critic.reviewer",
  ));
  const byCapture = new Map();
  for (const [index, review] of reviews.entries()) {
    if (byCapture.has(review.captureId)) diagnostics.push(diagnostic(
      "critic.capture.duplicate-review", `Capture ${review.captureId} has duplicate reviews.`, `critic.reviews[${index}]`,
    ));
    byCapture.set(review.captureId, review);
  }
  const floor = effectiveQualityFloor(concept.native?.design?.qualityFloor);

  for (const capture of captures) {
    const review = byCapture.get(capture.id);
    if (!review) {
      diagnostics.push(diagnostic("critic.capture.unreviewed", `Capture ${capture.id} has no independent review.`, `critic.reviews.${capture.id}`));
      continue;
    }
    if (typeof review.summary !== "string" || review.summary.trim().length < 24
        || typeof review.evidence !== "string" || review.evidence.trim().length < 16) diagnostics.push(diagnostic(
      "critic.capture.ungrounded", `${capture.id} lacks a concise visible summary and evidence.`, `critic.reviews.${capture.id}`,
    ));
  }
  for (const review of reviews) if (!captures.some(item => item.id === review.captureId)) diagnostics.push(diagnostic(
    "critic.capture.unknown", `Review references unknown capture ${review.captureId}.`, `critic.reviews.${review.captureId}`,
  ));

  const axes = new Map();
  for (const [axisIndex, axis] of (response?.axes || []).entries()) {
    if (axes.has(axis.id)) diagnostics.push(diagnostic("critic.axis.duplicate", `Product review repeats axis ${axis.id}.`, `critic.axes[${axisIndex}]`));
    if (!PRODUCT_UI_CRITIC_AXES.includes(axis.id)) diagnostics.push(diagnostic("critic.axis.unknown", `Product review contains unknown axis ${axis.id}.`, `critic.axes[${axisIndex}]`));
    axes.set(axis.id, axis);
  }
  for (const id of PRODUCT_UI_CRITIC_AXES) {
    const axis = axes.get(id);
    if (!axis || !Number.isFinite(axis.score) || axis.score < 0 || axis.score > 10
        || typeof axis.rationale !== "string" || axis.rationale.trim().length < 24
        || typeof axis.evidence !== "string" || axis.evidence.trim().length < 12) {
      diagnostics.push(diagnostic("critic.axis.incomplete", `Product review lacks grounded evidence for ${id}.`, `critic.axes.${id}`));
    } else if (axis.score < floor) {
      diagnostics.push(diagnostic("critic.axis.below-floor", `${id} scored ${axis.score}, below ${floor}.`, `critic.axes.${id}`));
    }
  }

  const blockingFindings = reviews.flatMap(item => item.findings || []).filter(item => item.severity === "blocker");
  for (const [index, review] of reviews.entries()) if (!Array.isArray(review.findings)) diagnostics.push(diagnostic(
    "critic.findings.required", `Review ${review.captureId || index} must explicitly return findings, even when empty.`, `critic.reviews[${index}].findings`,
  ));
  if (blockingFindings.length) diagnostics.push(diagnostic(
    "critic.findings.blocking", `Independent reviewer found ${blockingFindings.length} blocking defects.`, "critic.findings",
  ));
  if (!["clean", "blockers"].includes(response?.verdict)) diagnostics.push(diagnostic(
    "critic.verdict.invalid", "Reviewer must return verdict=clean or verdict=blockers.", "critic.verdict",
  ));
  if (response?.verdict !== "clean") diagnostics.push(diagnostic(
    "critic.verdict.blocked", "Independent reviewer did not declare the delivery clean.", "critic.verdict",
  ));

  const receipt = Object.freeze({
    schemaVersion: 1,
    receiptId: stableId({ contract: concept.productDevelopment?.productContract?.contractId, captures, response }),
    productContractId: concept.productDevelopment?.productContract?.contractId || null,
    reviewer: response?.reviewer || null,
    verdict: diagnostics.length ? "blockers" : "clean",
    floor,
    axes: response?.axes || [],
    reviews,
  });
  return { ok: diagnostics.length === 0, receipt, diagnostics, request };
}
