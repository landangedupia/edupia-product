---
title: "PRFAQ Distillate: concept3-ai-song-hanh"
type: llm-distillate
source: "prfaq-concept3-ai-song-hanh.md"
created: "2026-08-20"
purpose: "Token-efficient context for downstream PRD creation"
---

## Concept scope
- Concept under test: Concept 3, biến thể **3.1** (AI nhân hoá "giáo viên ngôi sao") × Phương án kỹ thuật **A** ("AI Song Hành" — giám sát/nhắc bài/vá lỗ hổng liên tục cả tuần, GVCN can thiệp khi có ngoại lệ). Chosen deliberately as the highest-risk combination in a 2×2 board (3.1/3.2 × A/B) to stress-test the hardest case first — not a claim that 3.1-A is the recommended direction.
- Working name "AI Đồng Hành" is a placeholder invented for this PRFAQ draft, not an approved brand name. Official naming still open (risk: collides with existing "Tutor 1-1").
- Press release scoped to **Giai đoạn 1 only** (AI = trợ giảng: chấm-chữa bài + đồng hành lúc tự học; GV thật vẫn dạy buổi sống) — not Giai đoạn 3's "AI runs independently" end-state, since zero internal pilot exists to support announcing that vision as real today.

## Customer / problem (validated against internal docs, not invented)
- Customer: Tier 3/4 Vietnamese parents, household income ~4.5M VND/mo avg (range 3.8-7.1M by region), mostly unable to coach English themselves, time-poor, currently paying 250k/mo for Edupia Class self-learning.
- Core problem: only 2 live Big Class sessions/week; no continuous supervision between sessions → engagement fades ("cả thèm chóng chán"); parents can't fill the gap; human tutor (Edupia Tutor) priced out of reach (≥600k/mo).
- Known adjacent churn drivers (from existing renewal-persona research, NOT Concept-3-specific but directly relevant): "no current need" 26.55%, time pressure/overload from other tutoring 20.83%, lack of trust in effectiveness 19.44%, "finished the program" mindset 17.42%.

## Rejected framings
- Headline "Edupia Class ra mắt gia sư AI riêng cho mọi học sinh" — rejected: "gia sư riêng" reads as literal human tutor, violates brief's explicit overpromise warning (mục 4.0.3), echoes the exact overpromise mistake already flagged for GVCN in mức 1.3.
- "Con bạn giờ có một AI luôn theo sát bài học suốt tuần" — rejected: too vague/marketing-toned, fails "so what?" test without concrete mechanism/price anchor.
- Using Hong Kong star-tutor economics (1 teacher livestream to 1,000 students) as supporting evidence for 3.1 — rejected for the press release: that model is 100% human-delivered, no AI layer; brief mục 4.1 explicitly flags it as NOT an AI precedent, so using it would misrepresent evidence.

## Requirements / design signals captured
- Human-in-the-loop trust mechanism (3-phase roadmap, converged 2026-08-18, brainstorm-intent.md): GĐ1 AI=trợ giảng/GV live-teaches; GĐ2 AI teaches live/GV assists; GĐ3 AI runs independently/human shifts to periodic audit (not per-session) — "human as final checkpoint" persists across all 3 phases, never fully removed. This is the load-bearing answer to "how do we earn enough trust to win."
- Trust does NOT come from AI "passing as human" (students recognize AI regardless) — it comes from AI making visibly accurate decisions shown concretely to parents (mastery reports, proactive alerts). Direct implication: persona realism is not the trust lever; decision accuracy + visible progress is.
- Hard exclusion (non-negotiable, applies to ALL of Concept 3): no "anthropomorphic/personality-simulating AI companion" archetype for children — based on Character.AI lawsuits tied to two teen deaths. If 3.1 proceeds, must stay strictly within structured-lesson AI.
- Persona Engine (shared infra for both A/B): requires building BOTH a teacher persona (voice/style/interaction pattern sourced from existing Edupia Tutor teacher pool) AND a student persona (continuous learning-data ingestion) simultaneously — rated the single largest investment ask across the whole 3-concept board, larger than mức 1.2's Adaptive Learning.
- Design recommendation (unverified, not yet decided): if pursuing 3.1, build an ORIGINAL branded teacher character rather than cloning a real, currently-teaching Edupia staff member's voice/likeness — avoids right-of-publicity exposure (Lovo Inc. case, NY digital-replica law; Tennessee ELVIS Act).

## Cracks / unresolved contradictions (from Stage 5 Verdict — verdict: "cracked")
1. **Persona-trust paradox (A6, foundational, user-confirmed 2026-08-20 as NOT cosmetic):** the legal-risk mitigation for 3.1 (original character, not real-teacher clone) may cancel out 3.1's core differentiator (trust anchored to a specific teacher's brand/track record — the thing that distinguishes 3.1 from 3.2 per mục 4.1's JTBD delta). An original fictional character has no real exam track record, unlike the Hong Kong model 3.1 draws inspiration from. Risk: pay 3.1's higher legal-risk cost without capturing 3.1's differentiation benefit. **T9 survey should directly measure trust in an original-character persona vs. 3.2's mascot vs. no-persona baseline** — cannot be resolved by internal design debate alone.
2. **Margin↔effort circular dependency (A3, blocker, user-confirmed 2026-08-20):** cannot estimate margin without an effort estimate for Persona Engine + real-time infra (A1/A2), cannot judge if effort is worth it without a margin estimate. Company policy requires profit proof before proceeding on any concept. Needs a joint Product+Engineering+Finance session to break the loop with a rough (not precise) estimate — no owner or date currently assigned.
3. **Pricing-structure inconsistency (A4, deliberately left unresolved in the document rather than silently picked):** the press release assumes in-place upgrade from 250k→390k ("nâng cấp trực tiếp trong app"); the Internal FAQ working assumption (chosen by user 2026-08-20, for FAQ-writing purposes only) is a standalone new product at 390k. This is a real, unresolved BOD decision (mục 4.0 of product-brief-2026-08-13.md) with direct GTM and existing-customer-reaction consequences — do not resolve it downstream without going back to BOD.
4. **No kill-switch governance (A9):** risk register already logs that T9 survey purchase-intent may overstate real T11 paid-conversion behavior, but no one has been named owner of the decision to stop Concept 3 if that gap materializes, and no threshold is defined. Sunk cost from Persona Engine investment will make stopping harder in practice than on paper if this isn't decided in advance.

## Open questions / unknowns (need owners before PRD)
- Effort/timeline for Persona Engine and batch→real-time Adaptive Learning shift — unestimated (Product+Engineering, deadline "trước T9" per brief, no session scheduled).
- Giá vốn/học sinh/tháng and resulting margin at 390k — unestimated (Finance, blocked on the above).
- Resource trade-off across Concept 1/2/3 — no cross-concept resourcing plan exists; unclear what Product/Engineering/Vận hành stop doing to fund Concept 3.
- SLA/cadence for human audit intervention (even in GĐ1) — undefined; without it, the "human is always the final checkpoint" trust mechanism is nominal, not operational.
- Interaction design to avoid adding to time-overload churn (20.83% existing churn driver) — no concrete design yet, classified fast-follow by user (2026-08-20), meaning it ships without an answer and gets fixed post-launch based on feedback.
- Lead on "Chinese platform clones famous educators' voices" (research.md refs [40][41] / star-teacher-persona-r1-1.md finding [5]) — confidence too low (aggregator snippet only) to use as evidence; needs a dedicated fetch/verification pass if 3.1 proceeds to BOD.
- Whether the "AI Song Hành" 3-phase roadmap is an independent timeline applicable to both Phương án A/B, or a maturity path specifically leading to A — brief mục 4.4 leaves this open.
- Competitive moat if a domestic competitor copies the TAL/Xueersi-style dual-teacher model — only hypothesis found (Edupia's existing large Tutor teacher pool as Persona Engine source) is unverified by direct competitive analysis.

## External research signals worth carrying forward (medium/low confidence, flag accordingly)
- Spheria.ai — teacher-AI-twin platform, ~$16/mo Pro tier (price unverified, direct fetch 404'd) — closest found near-precedent for a persona-clone product at Edupia's target price band; not in the internal brief, surfaced only by this PRFAQ's web research pass.
- US parent trust in AI-in-education trending down (tutoring-support 65%→60% YoY 2024-2025; ~70% object to grades/data going into AI tools; organized backlash e.g. Oregon petition, NY "Sally" robot-teacher pause 2026-07-29) — no Vietnam/Tier-3-4-specific equivalent data exists; treat as a real research gap, not a settled directional signal either way.
- No product found anywhere searched (China/HK/US/Vietnam) combining K-12 + real-teacher-AI-clone + mass-market pricing — 3.1 would be a genuine first-mover with no operational/economic benchmark to de-risk against.

## Scope signals
- In scope for Giai đoạn 1 launch: AI grading/correction on homework, continuous self-study interaction, weekly Zalo-style parent report, teacher reviewing AI-collected data before each live session.
- Explicitly NOT in scope / excluded: open-ended emotional/personality AI companion behavior (hard exclusion, all of Concept 3); real-teacher voice/likeness cloning (design recommendation, pending Product+Pháp lý sign-off); psych/behavior-signal detection from student data (flagged as an open possibility, not a committed feature, needs separate legal/ethics review before any development).
- Launch blocker (user-classified 2026-08-20): AI grading-accuracy fix (known existing complaint on Edupia Speak) must ship before Giai đoạn 1 launches, not after.
- Fast-follow (user-classified 2026-08-20): time-overload-safe interaction design; human-intervention SLA cadence.
