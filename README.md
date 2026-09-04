# Anti-AI Frontend Studio

A research-driven design-director skill for turning a product brief, an existing interface, or a rough creative idea into an implemented, rendered, and revised web interface—without falling back to familiar AI design recipes.

> **Status:** the current distribution is **`v7.0.0-alpha6-r2`** (Runtime + Lab dual edition, with backflow gate and reproducible build) — download it from the [Releases page](https://github.com/Equinox7379/anti-ai-frontend-studio/releases/tag/v7.0.0-alpha6-r2). See [README_FIRST.md](README_FIRST.md) and [distribution-r2-validation.json](distribution-r2-validation.json). The v6.0.0-rc2 source tree in this repository is retained as the prior research snapshot; cross-model design effectiveness is not yet claimed.

[中文说明](README.zh-CN.md)

## Why this exists

Most anti-slop guidance stops at prohibition: no purple gradients, no card walls, no default font pairings. That can remove obvious failure modes while producing interfaces that are merely safe and generic.

Anti-AI Frontend Studio separates four jobs:

1. **Positive design direction** — derive the page thesis, information relationship, composition, typography, state model, and responsive behavior from the actual product.
2. **Real implementation** — build a runnable surface with realistic content and edge states.
3. **Unanchored rendered critique** — judge the first render before seeing detector results or anti-pattern lists.
4. **Deterministic evidence and revision** — run a descriptive detector, reconcile it with the design review, and change the real code.

## Quick start

Upload or expose this repository to a capable coding/design agent, then paste `PROMPT_TO_USE.txt` with your brief.

When multi-file retrieval is unreliable, use the staged route:

```text
ONE_FILE_MODE.md
→ build and render the first version
→ POST_RENDER_REVIEW.md
→ save the unanchored design assessment
→ POST_RENDER_EVIDENCE_AND_REVISE.md
→ run evidence checks and revise the real implementation
```

Do not load the post-render anti-pattern material before a first render exists.

## Repository map

```text
core/                         active design, critique, and delivery method
knowledge/                    task-specific deep dives
review_after_first_render/    anti-default material loaded only after first render
DESIGN_VERBS.md               bounded follow-up actions such as 加力 / 收声 / 提炼 / 精修
references/                   structured deep references and 353-entry corpus
archive/                      reference catalog (287 entries), external reviews, prior packages
deep_library/                 historical package lineage (v2.3, v5.5.0); provenance only
cases/                        rejected and improved calibration cases
blind_test/                   contextless multi-model test protocol and briefs
templates/                    project, product-context, implementation, and visual-contract templates
tools/                        zero-dependency descriptive detector and package checks
platform/                     one canonical method with lightweight platform entry points
```

## Design principles

- Product relationships generate form; style labels do not.
- Familiar interaction is a floor; product-specific structure is the differentiator.
- Rectangles are legitimate only when the boundary has a real job.
- Typography is a system of roles and parameters, not a fashionable font name.
- Mobile adaptation reorganizes the task; it does not stack desktop cards vertically.
- A detector finding is a question to investigate, not a design verdict.
- A clean scan is not proof of quality.
- The model must render, critique, and revise actual work rather than self-score its intentions.

## Tools

Validate package structure:

```bash
python tools/package_doctor.py
```

Run the descriptive detector **after** the unanchored review has been saved:

```bash
node tools/slop_detector.mjs path/to/ui --json
```

Run detector fixtures:

```bash
node tools/test_slop_detector.mjs
```

The detector has no runtime dependencies and intentionally exits successfully when it finds design signals. It does not produce an aesthetic score.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Contributions should be driven by a reproducible design failure, a real rendered case, or a well-scoped improvement—not by adding more universal prohibitions.

## License

Apache License 2.0. See [LICENSE](LICENSE), [NOTICE](NOTICE.md), and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
