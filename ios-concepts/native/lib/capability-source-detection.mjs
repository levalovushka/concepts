function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function countCapabilityRequestHits(source, capabilityKey) {
  const key = escapeRegExp(capabilityKey);
  const shorthand = new RegExp(`request\\(\\s*\\.${key}(?:\\s*,|\\s*\\))`, "g");
  const runtimeKey = new RegExp(
    `request\\(\\s*PermissionKey\\(\\s*rawValue:\\s*"${key}"\\s*\\)(?:\\s*,|\\s*\\))`,
    "g",
  );
  return (source.match(shorthand) || []).length + (source.match(runtimeKey) || []).length;
}
