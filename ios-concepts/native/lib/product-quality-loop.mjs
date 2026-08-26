import { PRODUCT_QUALITY_MAX_ATTEMPTS } from "./quality-policy.mjs";

export { PRODUCT_QUALITY_MAX_ATTEMPTS } from "./quality-policy.mjs";

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

export async function runProductQualityLoop({
  initialDelivery,
  reviewer,
  reviser,
  maxAttempts = PRODUCT_QUALITY_MAX_ATTEMPTS,
}) {
  if (!reviewer || typeof reviewer.review !== "function") return {
    ok: false,
    delivery: initialDelivery,
    attempts: [],
    diagnostics: [diagnostic("quality.reviewer.required", "Quality loop requires an independent reviewer adapter.", "quality.reviewer")],
  };
  if (maxAttempts !== PRODUCT_QUALITY_MAX_ATTEMPTS) return {
    ok: false,
    delivery: initialDelivery,
    attempts: [],
    diagnostics: [diagnostic("quality.attempts.fixed", "Product quality loop is fixed at three review attempts.", "quality.maxAttempts")],
  };

  let delivery = initialDelivery;
  const attempts = [];
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const review = await reviewer.review({ attempt, delivery: structuredClone(delivery) });
    attempts.push(Object.freeze({ attempt, receipt: review?.receipt || null, diagnostics: Object.freeze([...(review?.diagnostics || [])]) }));
    if (review?.ok === true) return { ok: true, delivery, attempts: Object.freeze(attempts), diagnostics: [] };
    if (attempt === maxAttempts) return {
      ok: false,
      delivery,
      attempts: Object.freeze(attempts),
      diagnostics: Object.freeze([
        ...(review?.diagnostics || []),
        diagnostic("quality.iterations.exhausted", "Delivery still has blockers after three independent reviews.", "quality.attempts"),
      ]),
    };
    if (!reviser || typeof reviser.revise !== "function") return {
      ok: false,
      delivery,
      attempts: Object.freeze(attempts),
      diagnostics: Object.freeze([
        ...(review?.diagnostics || []),
        diagnostic("quality.reviser.required", "Blocked delivery requires a revision adapter before another review.", "quality.reviser"),
      ]),
    };
    delivery = await reviser.revise({
      attempt,
      delivery: structuredClone(delivery),
      receipt: review?.receipt || null,
      diagnostics: structuredClone(review?.diagnostics || []),
    });
  }
}
