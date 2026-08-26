import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function diagnostic(code, message, path) {
  return Object.freeze({ code, message, path, severity: "error" });
}

export function selectCoreProofSurfaces(manifest, limit = 4) {
  const surfaces = new Map((manifest?.surfaces || []).map(item => [item.id, item]));
  const preferred = [
    ...(manifest?.product?.evidenceScreens || []),
    ...(manifest?.navigation?.tabs || []).map(item => item.screen),
    ...(manifest?.surfaces || []).filter(item => ["sheet", "detail"].includes(item.presentation)).map(item => item.id),
  ];
  return [...new Set(preferred)].filter(id => surfaces.has(id)).slice(0, limit);
}

export function createLeanDeliveryProof({ manifest, buildReceipt, captures, durationMs }) {
  const diagnostics = [];
  if (buildReceipt?.passed !== true) diagnostics.push(diagnostic(
    "proof.build.required", "Core delivery proof requires a fresh successful build.", "buildReceipt",
  ));
  if (!Array.isArray(captures) || captures.length < 3) diagnostics.push(diagnostic(
    "proof.captures.insufficient", "Core delivery proof requires at least three current captures.", "captures",
  ));

  const knownSurfaces = new Set((manifest?.surfaces || []).map(item => item.id));
  const capturedSurfaces = new Set((captures || []).map(item => item.surface));
  const missingSurfaces = [...knownSurfaces].filter(surface => !capturedSurfaces.has(surface));
  if (missingSurfaces.length) diagnostics.push(diagnostic(
    "proof.captures.surface-coverage",
    `Default visual coverage is missing for: ${missingSurfaces.join(", ")}.`,
    "captures",
  ));
  const seenIds = new Set();
  const seenHashes = new Map();
  const artifacts = [];
  for (const [index, capture] of (captures || []).entries()) {
    const path = `captures[${index}]`;
    if (!capture?.id || seenIds.has(capture.id)) diagnostics.push(diagnostic(
      "proof.capture.identity", "Every capture needs a unique verified id.", `${path}.id`,
    ));
    seenIds.add(capture?.id);
    if (!knownSurfaces.has(capture?.surface)) diagnostics.push(diagnostic(
      "proof.capture.surface", `Capture ${capture?.id || index} does not belong to the compiled product.`, `${path}.surface`,
    ));
    if (!capture?.path || !existsSync(capture.path)) {
      diagnostics.push(diagnostic("proof.capture.missing", `Capture ${capture?.id || index} is missing.`, `${path}.path`));
      continue;
    }
    const bytes = readFileSync(capture.path);
    if (bytes.length < 10_000 || !bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) diagnostics.push(diagnostic(
      "proof.capture.invalid", `Capture ${capture.id} is not a full PNG screenshot.`, `${path}.path`,
    ));
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    if (seenHashes.has(sha256)) diagnostics.push(diagnostic(
      "proof.capture.duplicate", `${capture.id} is pixel-identical to ${seenHashes.get(sha256)}.`, `${path}.path`,
    ));
    seenHashes.set(sha256, capture.id);
    artifacts.push(Object.freeze({
      id: capture.id,
      surface: capture.surface,
      path: capture.path,
      bytes: statSync(capture.path).size,
      sha256,
    }));
  }

  return Object.freeze({
    schemaVersion: 1,
    product: manifest?.slug || null,
    passed: diagnostics.length === 0,
    deliveryLevel: diagnostics.length ? "blocked" : "engineered-preview",
    build: buildReceipt || null,
    captures: artifacts,
    durationMs: Number.isFinite(durationMs) ? Math.round(durationMs) : null,
    independentVisualReview: Object.freeze({ status: "required", passed: false }),
    diagnostics,
  });
}
