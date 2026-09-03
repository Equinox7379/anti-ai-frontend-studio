#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "00_READ_FIRST.md",
    "ONE_FILE_MODE.md",
    "POST_RENDER_REVIEW.md",
    "POST_RENDER_EVIDENCE_AND_REVISE.md",
    "PROMPT_TO_USE.txt",
    "DESIGN_VERBS.md",
    "core/01_DESIGN_DIRECTOR_CORE.md",
    "core/02_RENDER_REVIEW_REVISE.md",
    "core/03_CRAFT_AND_DELIVERY.md",
    "core/04_ROUTING_INDEX.md",
    "review_after_first_render/00_READ_AFTER_FIRST_RENDER.md",
    "review_after_first_render/00A_UNANCHORED_DESIGN_REVIEW.md",
    "review_after_first_render/00B_DETERMINISTIC_EVIDENCE.md",
    "review_after_first_render/00C_SYNTHESIS_AND_REVISION.md",
    "knowledge/09_COGNITIVE_LOAD_LENS.md",
    "optional/LIVE_VARIANT_LOOP.md",
    "templates/PRODUCT_CONTEXT.template.md",
    "platform/PLATFORM_ENTRYPOINTS.md",
    "tools/slop_detector.mjs",
    "tools/test_slop_detector.mjs",
    "references/REFERENCE_CORPUS_DEEP.csv",
    "blind_test/00_PROTOCOL.md",
    "blind_test/02_EVALUATION_RUBRIC.md",
]

def main() -> int:
    missing = [rel for rel in REQUIRED if not (ROOT / rel).exists()]
    bad_fences = []
    bad_json = []
    for path in ROOT.rglob("*.md"):
        if path.read_text(encoding="utf-8", errors="replace").count("```") % 2:
            bad_fences.append(str(path.relative_to(ROOT)))
    for path in ROOT.rglob("*.json"):
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            bad_json.append(f"{path.relative_to(ROOT)}: {exc}")
    font_exts = {".ttf", ".otf", ".woff", ".woff2", ".eot"}
    fonts = [
        str(path.relative_to(ROOT))
        for path in ROOT.rglob("*")
        if path.is_file() and path.suffix.lower() in font_exts
    ]
    report = {
        "version": "6.0.0-rc2",
        "required_files_missing": missing,
        "unbalanced_markdown_fences": bad_fences,
        "invalid_json": bad_json,
        "font_binaries": fonts,
        "status": "PASS" if not missing and not bad_fences and not bad_json and not fonts else "FAIL",
        "note": "This validates package structure only, not design quality or cold-start model performance.",
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["status"] == "PASS" else 1

if __name__ == "__main__":
    raise SystemExit(main())
