export function compileCaptureCatalog(manifest, source) {
  const diagnostics = [];
  if (source?.schemaVersion !== 1) {
    diagnostics.push({ code: "capture.schema-version.unsupported", message: "Capture schemaVersion must be 1" });
  }

  const requirements = new Map(
    manifest.verification.states.map(item => [item.id, item]),
  );
  const seenArtifacts = new Set();
  const drivers = [];

  for (const [index, raw] of (source?.drivers || []).entries()) {
    const id = `${raw.surface}--${raw.state}`;
    const requirement = requirements.get(id);
    if (!requirement) {
      diagnostics.push({
        code: "capture.requirement.missing",
        message: `Driver ${index} points to undeclared state ${id}`,
      });
      continue;
    }
    if (requirement.method !== "screenshot" && raw.supplemental !== true) {
      diagnostics.push({
        code: "capture.method.invalid",
        message: `${id} is verified by ${requirement.method}; mark an additional visual as supplemental`,
      });
      continue;
    }
    if (!raw.launch || !raw.artifact) {
      diagnostics.push({ code: "capture.driver.incomplete", message: `${id} needs launch and artifact` });
      continue;
    }
    if (seenArtifacts.has(raw.artifact)) {
      diagnostics.push({ code: "capture.artifact.duplicate", message: `Duplicate artifact ${raw.artifact}` });
      continue;
    }
    seenArtifacts.add(raw.artifact);
    drivers.push({ id, ...raw });
  }

  const covered = new Set(drivers.map(item => item.id));
  const missing = manifest.verification.states.filter(
    item => item.method === "screenshot" && !covered.has(item.id),
  );

  const distinctGroups = [];
  for (const [index, group] of (source?.distinctStateGroups || []).entries()) {
    if (!Array.isArray(group) || group.length < 2) {
      diagnostics.push({ code: "capture.distinct-group.invalid", message: `Distinct group ${index} needs at least two artifacts` });
      continue;
    }
    const unknown = group.filter(artifact => !seenArtifacts.has(artifact));
    if (unknown.length) {
      diagnostics.push({ code: "capture.distinct-group.unknown", message: `Distinct group ${index} names unknown artifacts: ${unknown.join(", ")}` });
      continue;
    }
    distinctGroups.push(group);
  }
  const explicitKeys = new Set(distinctGroups.map(group => [...group].sort().join("|")));
  const bySurface = Map.groupBy(drivers, driver => driver.surface);
  for (const surfaceDrivers of bySurface.values()) {
    const artifacts = surfaceDrivers.map(driver => driver.artifact);
    if (new Set(surfaceDrivers.map(driver => driver.state)).size < 2) continue;
    const key = [...artifacts].sort().join("|");
    if (!explicitKeys.has(key)) distinctGroups.push(artifacts);
  }

  return {
    ok: diagnostics.length === 0,
    diagnostics,
    drivers,
    missing,
    distinctGroups,
  };
}

export function selectCaptureDrivers(catalog, requested = []) {
  if (!requested.length) return catalog.drivers;
  return requested.map(key => {
    const matches = catalog.drivers.filter(driver =>
      driver.artifact === key || driver.id === key || driver.surface === key,
    );
    if (matches.length !== 1) {
      throw new Error(matches.length
        ? `capture “${key}” is ambiguous; use surface--state`
        : `capture “${key}” has no verified driver`);
    }
    return matches[0];
  });
}
