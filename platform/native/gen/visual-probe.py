#!/usr/bin/env python3
"""Замеры по снятым кадрам для ворот интерфейса.

Считает то, что раньше ловили только глазами и только иногда:
статус-бар другого цвета, пустой низ экрана, короткий список,
повторяющиеся одинаковые плитки.

Выход — JSON на stdout, чтобы ворота на Node читали его как данные.
"""

import json
import sys
from pathlib import Path

from PIL import Image

# Кадры состояний, где пустота — это и есть состояние.
STATE_SUFFIXES = (
    "-empty", "-denied", "-scanning", "-loading", "-locked",
    "-success", "-submitted", "-error", "-connecting", "-searching",
    "-checking", "-mismatch", "-fallback", "-recording", "-transcribing",
)


def probe(path: Path) -> dict:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()

    status = px[w // 2, 20]
    # Точка внутри шапки, а не под ней: ниже начинается контент, и там
    # законно другой цвет (подпись чата, серая подложка списка).
    under_header = px[w // 2, 250]
    # Модальный лист затемняет корневой экран — серая полоса сверху там норма.
    sheet = all(198 <= c <= 214 for c in status)

    # Пустой низ: снизу вверх, пока строка однотонная.
    empty = 0
    for y in range(h - 1, int(h * 0.3), -6):
        row = [px[x, y] for x in range(20, w - 20, 24)]
        if max(row) == min(row):
            empty += 6
        else:
            break

    # Текстовые строки: полосы, где есть тёмные пиксели, разделённые пустыми.
    lines, in_line = 0, False
    for y in range(int(h * 0.13), int(h * 0.92), 3):
        dark = any(sum(px[x, y]) < 380 for x in range(24, w - 24, 8))
        if dark and not in_line:
            lines += 1
        in_line = dark

    # Повторяющиеся блоки: кадр бьётся на сетку 6×12, считаются одинаковые.
    cells = {}
    cw, ch = w // 6, h // 12
    for cy in range(12):
        for cx in range(6):
            box = (cx * cw, cy * ch, (cx + 1) * cw, (cy + 1) * ch)
            crop = im.crop(box).resize((12, 12))
            colors = crop.getcolors(maxcolors=256)
            # Однотонные клетки — это поля и подложки, а не повтор содержимого.
            if colors and len(colors) < 3:
                continue
            key = crop.tobytes()
            cells[key] = cells.get(key, 0) + 1
    repeats = max(cells.values()) if cells else 0

    return {
        "screen": path.stem,
        "isState": any(path.stem.endswith(s) for s in STATE_SUFFIXES),
        "statusBar": list(status),
        "underHeader": list(under_header),
        "isSheet": sheet,
        "statusBarMatchesHeader": sheet or status == under_header,
        "emptyTailPercent": round(empty / h * 100),
        "textLines": lines,
        "repeatedBlocks": repeats,
    }


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: visual-probe.py <shots-dir>", file=sys.stderr)
        return 1
    shots = Path(sys.argv[1])
    frames = sorted(shots.glob("*.png"))
    if not frames:
        print(json.dumps({"frames": []}))
        return 0
    print(json.dumps({"frames": [probe(f) for f in frames]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
