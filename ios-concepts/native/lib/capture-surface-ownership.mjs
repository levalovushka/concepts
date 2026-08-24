const OWNERS = ["product", "pendingProduct", "system", "extension"];

/// Compiles one exhaustive ownership map for every captured multi-state
/// surface. Callers do not need to know how classification is represented.
export function compileCaptureSurfaceOwnership(catalog, source) {
  const diagnostics = [];
  if (source?.schemaVersion !== 2) {
    diagnostics.push("capture surface ownership schemaVersion must be 2");
  }

  const groups = Object.fromEntries(OWNERS.map(owner => [owner, source?.[owner] || []]));
  const declared = new Map();
  for (const owner of OWNERS) {
    for (const surface of groups[owner]) {
      if (declared.has(surface)) {
        diagnostics.push(`${surface}: classified as both ${declared.get(surface)} and ${owner}`);
      } else {
        declared.set(surface, owner);
      }
    }
  }

  const statesBySurface = new Map();
  for (const driver of catalog.drivers || []) {
    if (!statesBySurface.has(driver.surface)) statesBySurface.set(driver.surface, new Set());
    statesBySurface.get(driver.surface).add(driver.state);
  }
  const multiState = [...statesBySurface]
    .filter(([, states]) => states.size > 1)
    .map(([surface]) => surface)
    .sort();

  for (const surface of multiState) {
    if (!declared.has(surface)) diagnostics.push(`${surface}: multi-state surface has no owner`);
  }
  for (const surface of declared.keys()) {
    if (!statesBySurface.has(surface)) diagnostics.push(`${surface}: ownership names an unknown surface`);
  }

  return { ok: diagnostics.length === 0, diagnostics, multiState, ...groups };
}
