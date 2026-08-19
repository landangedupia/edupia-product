<!-- bmad:context -->
<!-- Verified 2026-08-19 against e894fcc. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## Edupia Product OS

Product knowledge base and PM workspace for Edupia — a Vietnamese K-12 online English learning platform (mass market, 390k VND/month). This is a **document repo, not a code repo**. Planning and strategy docs are the primary content; no build system, no test runner. AI tools work here as product management copilots.

## Policy

- Never push to remote without explicit approval from Landang.
- Never delete or overwrite product documents without explicit approval — ask first, even for files that look empty or stale.
- Never invent research findings, quotes, or survey data — mark unknowns as `[ASSUMPTION]` or `[OPEN QUESTION]`.
- Terminology: check `00_context/glossary.md` and `03_product/taxonomy/glossary.md` before introducing or redefining any product term. Do not silently redefine existing terms.
- Important decisions must be recorded in `06_decisions/` — not left only in conversation.

## Where things are

- **Product context & domain knowledge** → `00_context/` (glossary, problem statement, user profiles)
- **Strategy, goals, roadmap** → `01_strategy/`
- **Research, insights, hypotheses** → `02_discovery/`
- **Product model: concepts, features, taxonomy** → `03_product/`
- **Specs, epics, delivery** → `04_delivery/`
- **Metrics, events, experiments** → `05_data/`
- **Decisions & ADRs** → `06_decisions/`
- **User feedback & learnings** → `07_feedback/`
- **Deprecated / historical** → `08_archive/`
- Product brief (T8/2026, 4-concept evaluation) → `00_context/product-brief-2026-08-13.md`
- Current-state Edupia AI Class (features, operations, parent persona & renewal insight) → `00_context/current-state-product-features.md`, `00_context/current-state-operations.md`, `00_context/user-persona-parent-renewal.md`

## Conventions that differ from defaults

- Always distinguish and label: **Fact** (verified data), **Assumption** (untested belief), **Hypothesis** (testable), **Decision** (made and recorded), **Open Question** (needs resolution).
- Convention symbols used in source docs: `●` = data confirmed / chốt, `◆` = assumption needing validation, `⚠` = risk or contradiction.
- Product is always called **"Edupia Class"** in official/sales content — never "UniClass" (different product). "Edupia AI Class" / "AI Class Plus" are confirmed internal synonyms of Edupia Class (`00_context/glossary.md`, chốt 2026-08-18) — not banned terms. Edupia Club is a separate shared component, not a product differentiator.
- 4 concepts under evaluation: **C1 (Làm mịn), C2 (Làm mịn + Thêm môn), C3 (Nâng cấp mạnh AI), C4 (Nâng cấp mạnh con người)** — use these canonical labels.

## Known pitfalls

- `00_context/problem.md`, `00_context/users.md`, `00_context/product.md`, `03_product/taxonomy/glossary.md` contain skeleton placeholders only — do not treat as populated sources of truth. Real product context is in `00_context/product-brief-2026-08-13.md` and `00_context/glossary.md`.
- `03_product/concepts/` is empty — concept content has not yet been migrated into the repo.
- Module naming is unresolved: `00_context/current-state-product-features.md` uses "AI Practice" / "AI Speak" / "AI Club" (current live product); `00_context/glossary.md` uses "Edupia Practice" / "Edupia Speak" / "Edupia Club" for the apparently-same modules. Unlike Edupia Class/AI Class, this pair has **not** been confirmed as synonyms — do not treat as equivalent without Product confirmation.

<!-- /bmad:context -->
