import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { IOS_CAPABILITY_CATALOG } from "./capability-catalog.mjs";

const nativeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(readFileSync(join(nativeRoot, "ProductTargets", "catalog.json"), "utf8"));

export const PRODUCT_TARGET_CATALOG = Object.freeze(Object.fromEntries(
  source.targets.map(target => [target.id, Object.freeze({
    ...target,
    authentication: Object.freeze({ ...target.authentication }),
    deliveryObligations: Object.freeze([...(target.deliveryObligations || [])]),
    permissions: Object.freeze(target.permissions.map(permission => Object.freeze({ ...permission }))),
  })]),
));

export function resolveProductTarget(id) {
  return PRODUCT_TARGET_CATALOG[id] || null;
}

export function auditProductTargetCatalog() {
  const diagnostics = [];
  const ids = new Set();
  for (const [index, target] of source.targets.entries()) {
    const path = `targets[${index}]`;
    if (ids.has(target.id)) diagnostics.push({ code: "target.id.duplicate", path: `${path}.id`, message: `Duplicate target ${target.id}` });
    ids.add(target.id);
    if (!target.authentication?.required) diagnostics.push({ code: "target.authentication.required", path: `${path}.authentication`, message: `${target.id} must require authentication` });
    if (target.deliveryObligations !== undefined && (!Array.isArray(target.deliveryObligations) || target.deliveryObligations.some(item => typeof item !== "string" || !item.trim()))) diagnostics.push({ code: "target.delivery-obligations.invalid", path: `${path}.deliveryObligations`, message: `${target.id} delivery obligations must be named strings` });
    if (!target.permissions?.length) diagnostics.push({ code: "target.permissions.empty", path: `${path}.permissions`, message: `${target.id} has no permission profile` });
    const keys = new Set();
    for (const [permissionIndex, permission] of (target.permissions || []).entries()) {
      if (keys.has(permission.key)) diagnostics.push({ code: "target.permission.duplicate", path: `${path}.permissions[${permissionIndex}]`, message: `Duplicate permission ${permission.key}` });
      keys.add(permission.key);
      if (!IOS_CAPABILITY_CATALOG[permission.key]) diagnostics.push({ code: "target.permission.unknown", path: `${path}.permissions[${permissionIndex}].key`, message: `Unknown native capability ${permission.key}` });
      if (typeof permission.constraint !== "string" || permission.constraint.trim().length < 8) diagnostics.push({ code: "target.permission.constraint", path: `${path}.permissions[${permissionIndex}].constraint`, message: `Permission ${permission.key} needs a product constraint` });
    }
  }
  return diagnostics;
}
