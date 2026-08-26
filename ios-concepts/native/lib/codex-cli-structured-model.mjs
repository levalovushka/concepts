import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

function runProcess({ command, args, cwd, stdin, timeoutMs }) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, stdio: ["pipe", "ignore", "pipe"] });
    let stderrTail = "";
    let settled = false;
    const finish = callback => value => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      callback(value);
    };
    const timer = Number.isFinite(timeoutMs) && timeoutMs > 0 ? setTimeout(() => {
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5_000).unref();
      finish(reject)(new Error(`Codex structured model exceeded ${timeoutMs} ms`));
    }, timeoutMs) : null;
    timer?.unref();
    child.stderr.on("data", chunk => {
      stderrTail = `${stderrTail}${chunk}`.slice(-32_768);
    });
    child.once("error", finish(reject));
    child.once("exit", (code, signal) => {
      if (code === 0) finish(resolvePromise)();
      else finish(reject)(new Error(`Codex structured model exited with ${code ?? signal}${stderrTail ? `\n${stderrTail}` : ""}`));
    });
    child.stdin.end(stdin);
  });
}

function promptFor({ operation, input, imagePaths, imageLegend = [] }) {
  return [
    "You are one bounded stage in an automated native iOS product factory.",
    "Return only the JSON value required by --output-schema. Do not edit files, run commands, or wrap JSON in Markdown.",
    `Operation: ${operation}`,
    imagePaths.length
      ? `The attached images correspond in order to the following evidence. Inspect all ${imagePaths.length} before deciding: ${imageLegend.join("; ")}.`
      : "No images are attached to this stage.",
    "Input:",
    JSON.stringify(input),
  ].join("\n\n");
}

function acceptsNull(schema) {
  return schema?.type === "null"
    || (Array.isArray(schema?.type) && schema.type.includes("null"))
    || [...(schema?.anyOf || []), ...(schema?.oneOf || [])].some(acceptsNull);
}

function normalizeStrictSchema(schema, inheritedDefinitions = {}, resolving = new Set()) {
  if (Array.isArray(schema)) return schema.map(item => normalizeStrictSchema(item, inheritedDefinitions, resolving));
  if (!schema || typeof schema !== "object") return schema;
  const definitions = { ...inheritedDefinitions, ...(schema.$defs || {}) };
  if (typeof schema.$ref === "string" && schema.$ref.startsWith("#/$defs/")) {
    const name = schema.$ref.slice("#/$defs/".length);
    const target = definitions[name];
    if (!target) throw new Error(`Structured output schema references missing definition ${name}`);
    if (resolving.has(name)) throw new Error(`Recursive structured output definition ${name} is unsupported`);
    return normalizeStrictSchema(target, definitions, new Set([...resolving, name]));
  }
  const result = {};
  for (const [key, value] of Object.entries(schema)) {
    if (["properties", "required", "additionalProperties", "items", "anyOf", "oneOf", "allOf", "$defs", "$ref"].includes(key)) continue;
    result[key] = structuredClone(value);
  }
  if (!result.type && Object.hasOwn(schema, "const")) {
    result.type = Number.isInteger(schema.const) ? "integer" : typeof schema.const;
  }
  if (!result.type && Array.isArray(schema.enum) && schema.enum.length) {
    const types = new Set(schema.enum.map(item => Number.isInteger(item) ? "integer" : typeof item));
    if (types.size === 1) result.type = [...types][0];
  }
  if (schema.items) result.items = normalizeStrictSchema(schema.items, definitions, resolving);
  for (const union of ["anyOf", "oneOf", "allOf"]) if (schema[union]) result[union] = schema[union].map(item => normalizeStrictSchema(item, definitions, resolving));
  if (schema.type === "object" || schema.properties) {
    if (!schema.properties) throw new Error("Strict structured output cannot contain an open object without properties");
    const originallyRequired = new Set(schema.required || []);
    result.type = "object";
    result.additionalProperties = false;
    result.properties = Object.fromEntries(Object.entries(schema.properties).map(([key, value]) => {
      const normalized = normalizeStrictSchema(value, definitions, resolving);
      return [key, originallyRequired.has(key) || acceptsNull(normalized)
        ? normalized
        : { anyOf: [normalized, { type: "null" }] }];
    }));
    result.required = Object.keys(result.properties);
  }
  return result;
}

export function toStrictOutputSchema(schema) {
  return normalizeStrictSchema(schema);
}

export function restoreOptionalProperties(value, schema) {
  if (Array.isArray(value)) return value.map(item => restoreOptionalProperties(item, schema?.items));
  if (!value || typeof value !== "object") return value;
  const result = {};
  const required = new Set(schema?.required || []);
  for (const [key, item] of Object.entries(value)) {
    if (item === null && !required.has(key)) continue;
    const propertySchema = schema?.properties?.[key];
    result[key] = restoreOptionalProperties(item, propertySchema);
  }
  return result;
}

export function createCodexCLIStructuredModel({
  clientId,
  projectRoot,
  command = process.env.CAMO_CODEX_COMMAND || "codex",
  model = process.env.CAMO_CODEX_MODEL || null,
  cacheDirectory = null,
  timeoutMs = Number(process.env.CAMO_CODEX_TIMEOUT_MS || 600_000),
  onProgress = null,
  run = runProcess,
}) {
  if (typeof clientId !== "string" || clientId.trim().length < 3) throw new TypeError("clientId is required");
  const cwd = resolve(projectRoot || process.cwd());
  const invoke = async ({ operation, input, schema, imagePaths = [], imageLegend = [] }) => {
    if (!operation || !input || !schema) throw new TypeError("operation, input and schema are required");
    const cacheKey = createHash("sha256")
      .update(JSON.stringify({ clientId, model, operation, input, schema }))
      .update(imagePaths.map(path => existsSync(path) ? createHash("sha256").update(readFileSync(path)).digest("hex") : path).join("|"))
      .digest("hex");
    const cachePath = cacheDirectory ? join(resolve(cacheDirectory), `${cacheKey}.json`) : null;
    if (cachePath && existsSync(cachePath)) {
      onProgress?.({ type: "model-cache-hit", clientId, operation });
      return JSON.parse(readFileSync(cachePath, "utf8"));
    }
    const temporary = mkdtempSync(join(tmpdir(), "camo-codex-structured-"));
    const schemaPath = join(temporary, "output.schema.json");
    const outputPath = join(temporary, "response.json");
    const started = Date.now();
    try {
      onProgress?.({ type: "model-start", clientId, operation });
      writeFileSync(schemaPath, JSON.stringify(toStrictOutputSchema(schema)));
      const args = [
        "exec", "--ephemeral", "--ignore-user-config", "--sandbox", "read-only", "--color", "never",
        "--output-schema", schemaPath, "--output-last-message", outputPath, "--cd", cwd,
      ];
      if (model) args.push("--model", model);
      for (const path of imagePaths) args.push("--image", resolve(cwd, path));
      args.push("-");
      await run({ command, args, cwd, stdin: promptFor({ operation, input, imagePaths, imageLegend }), timeoutMs });
      const output = JSON.parse(readFileSync(outputPath, "utf8"));
      const restored = restoreOptionalProperties(output, schema);
      if (cachePath) {
        mkdirSync(resolve(cacheDirectory), { recursive: true });
        writeFileSync(cachePath, JSON.stringify(restored));
      }
      onProgress?.({ type: "model-complete", clientId, operation, durationMs: Date.now() - started });
      return restored;
    } catch (error) {
      onProgress?.({ type: "model-failed", clientId, operation, durationMs: Date.now() - started, message: error.message });
      throw error;
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  };
  return Object.freeze({
    clientId,
    async generateStructured(request) { return invoke(request); },
    async reviewStructuredVisuals(request) {
      const captures = (request.input?.captures || []).map((item, index) => ({ label: `candidate:${item.id || index + 1}`, path: item.path }));
      const goldens = Object.entries(request.input?.product?.visualCalibration?.goldenCaptures || {})
        .map(([role, path]) => ({ label: `golden:${role}`, path }));
      const images = [...captures, ...goldens];
      const imagePaths = images.map(item => item.path);
      if (!imagePaths.length) throw new Error("Visual review requires capture image paths");
      return invoke({ ...request, imagePaths, imageLegend: images.map(item => item.label) });
    },
  });
}

export { promptFor as codexStructuredPrompt };
