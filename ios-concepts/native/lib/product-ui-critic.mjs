import { createHash } from "node:crypto";

export const PRODUCT_UI_CRITIC_AXES = Object.freeze([
  "product-identity",
  "task-clarity",
  "composition-density",
  "visual-craft",
  "strategy-integrity",
]);

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

function stableId(value) {
  return `ui-review-${createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16)}`;
}

export async function reviewProductUI({ concept, captures, reviewer }) {
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

  const request = Object.freeze({
    schemaVersion: 1,
    product: {
      slug: concept.slug,
      thesis: concept.productDevelopment?.productContract?.productThesis,
      identity: concept.native?.deliveryIdentity,
      strategy: concept.native?.design?.strategy,
      referenceProfile: concept.native?.design?.referenceProfile || null,
      criticalFlows: concept.productDevelopment?.productContract?.delivery?.criticalFlows || [],
    },
    rubric: { axes: PRODUCT_UI_CRITIC_AXES, scoreRange: [0, 10], rule: "Every capture and every axis is required; the minimum axis score controls the verdict." },
    captures,
  });
  const response = await reviewer.review(request);
  const reviews = Array.isArray(response?.reviews) ? response.reviews : [];
  const byCapture = new Map(reviews.map(item => [item.captureId, item]));
  const floor = concept.native?.design?.qualityFloor ?? 8;

  for (const capture of captures) {
    const review = byCapture.get(capture.id);
    if (!review) {
      diagnostics.push(diagnostic("critic.capture.unreviewed", `Capture ${capture.id} has no independent review.`, `critic.reviews.${capture.id}`));
      continue;
    }
    const axes = new Map((review.axes || []).map(axis => [axis.id, axis]));
    for (const id of PRODUCT_UI_CRITIC_AXES) {
      const axis = axes.get(id);
      if (!axis || !Number.isFinite(axis.score) || axis.score < 0 || axis.score > 10
          || typeof axis.rationale !== "string" || axis.rationale.trim().length < 24
          || typeof axis.evidence !== "string" || axis.evidence.trim().length < 12) {
        diagnostics.push(diagnostic("critic.axis.incomplete", `${capture.id} lacks grounded review for ${id}.`, `critic.reviews.${capture.id}.axes.${id}`));
      } else if (axis.score < floor) {
        diagnostics.push(diagnostic("critic.axis.below-floor", `${capture.id}.${id} scored ${axis.score}, below ${floor}.`, `critic.reviews.${capture.id}.axes.${id}`));
      }
    }
  }
  for (const review of reviews) if (!captures.some(item => item.id === review.captureId)) diagnostics.push(diagnostic(
    "critic.capture.unknown", `Review references unknown capture ${review.captureId}.`, `critic.reviews.${review.captureId}`,
  ));

  const blockingFindings = reviews.flatMap(item => item.findings || []).filter(item => item.severity === "blocker");
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
    reviews,
  });
  return { ok: diagnostics.length === 0, receipt, diagnostics, request };
}
