import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function bitmapPixels(path) {
  const directory = mkdtempSync(join(tmpdir(), "native-capture-"));
  const bitmap = join(directory, "capture.bmp");
  try {
    execFileSync("/usr/bin/sips", ["-s", "format", "bmp", path, "--out", bitmap], { stdio: "ignore" });
    const data = readFileSync(bitmap);
    const offset = data.readUInt32LE(10);
    const width = data.readInt32LE(18);
    const signedHeight = data.readInt32LE(22);
    const bitsPerPixel = data.readUInt16LE(28);
    if (width <= 0 || !signedHeight || bitsPerPixel !== 32) throw new Error("unsupported capture bitmap");
    return { data, offset, width, height: Math.abs(signedHeight), topDown: signedHeight < 0 };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

export function auditLightStatusBarScreenshot(path) {
  const bitmap = bitmapPixels(path);
  const yStart = Math.round(bitmap.height * 0.018);
  const yEnd = Math.round(bitmap.height * 0.055);
  let samples = 0;
  let white = 0;

  for (let y = yStart; y < yEnd; y += 4) {
    for (let x = 20; x < bitmap.width - 20; x += 4) {
      // Dynamic Island and system glyphs are content, not the background under test.
      if (x > bitmap.width * 0.28 && x < bitmap.width * 0.72) continue;
      const row = bitmap.topDown ? y : bitmap.height - y - 1;
      const index = bitmap.offset + (row * bitmap.width + x) * 4;
      const blue = bitmap.data[index];
      const green = bitmap.data[index + 1];
      const red = bitmap.data[index + 2];
      samples += 1;
      if (red >= 250 && green >= 250 && blue >= 250) white += 1;
    }
  }

  const whiteRatio = white / samples;
  return Object.freeze({ ok: whiteRatio >= 0.82, whiteRatio });
}
