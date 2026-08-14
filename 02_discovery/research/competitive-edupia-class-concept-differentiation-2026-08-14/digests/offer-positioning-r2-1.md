# Digest: Offer/feature teardown + positioning — round 2 (follow-up)

Assistant: general-purpose (whitespace stress-test + two-source confirm)
Budget used: 14 tool calls, 6 sources

## Findings

- claim: VIP English Kid offers 1:1 live tutoring with native teachers from 600,000 VND/month, but teacher continuity is opt-in/changeable ("free to pick a teacher, freely change if not effective") — not a guarantee. Mirrors Antoree's pattern from round 1.
  source: https://kids.vipenglisheducation.com/ | publisher: VIP English Kid | confidence: medium | class: positioning

- claim: WISE Kids: native/VN-teacher courses at 4,200,000–4,500,000 VND/3-month block (≈1.4–1.5M VND/month) — well above the 300–500k band.
  source: search-aggregated, not directly fetched | confidence: low | class: positioning

- claim: KidsUP English and Alokiddy are self-study apps (AI pronunciation grading / robot+native-teacher content exposure, not a live relationship), priced far below the band (Alokiddy ≈40,000 VND/12-month plan) — neither is a genuine live-human-teacher product.
  source: KidsUP, Alokiddy sites/aggregators | confidence: low-medium | class: positioning

- claim: **Whitespace stress-test conclusion: after searching ~10 named candidates plus Vietnamese-phrase queries ("giáo viên chủ nhiệm," "giáo viên riêng giá rẻ," "390000/tháng") and English-phrase queries, no platform was found that combines a persistent/guaranteed human-teacher relationship with pricing in the 300,000–500,000 VND/month band.** Every product found is either (a) self-study/AI, priced at or below the band, no live teacher, or (b) live-teacher, priced above 500k/month (600k–1.5M+), typically with only an opt-in, non-guaranteed continuity model. **This strengthens (does not overturn) round 1's whitespace finding.**
  confidence: medium (broad but not exhaustive coverage — no native App/Play Store browsing, not every candidate's pricing page directly fetched) | class: capability-claim/positioning — **the single most decision-relevant finding of this research for C4.**

- claim: iSMART's AI-mechanism vagueness is now corroborated by a **third, differently-bylined publisher** (giaoduc.net.vn, Dec 2025) — gives no algorithm/architecture/data-point detail, quotes an iSMART business-development director, reads as promotional content derived from the same company messaging as the other two outlets (vietnamnet, vnexpress from round 1). **This is a syndication pattern across 3 outlets, not independent technical confirmation** — the vagueness finding itself is now well-corroborated (3 publishers, consistent absence of mechanism detail), even though no outlet supplies the missing detail.
  source: https://giaoduc.net.vn/he-thong-tinh-nang-ai-ismart-... -post256369.gd | publisher: Giáo dục Việt Nam | pub_date: 2025-12-03 | accessed: 2026-08-14 | confidence: HIGH (on the vagueness finding) | class: capability-claim

- claim: The vietnamnet.vn "iSMART AI era" article's actual publish date is **2025-03-24** — ~17 months before this research, outside the 3-month freshness bar (flagging staleness, not retracting the claim).
  source: vietnamnet.vn/ismart-education-... | pub_date: 2025-03-24 | confidence: high (on the date) | class: other

- claim: Cambly Kids' teacher-selection model is parent-driven choice/booking, constrained by popular tutors' availability — not assigned/guaranteed. An aggregated-review source (JustUseApp, compiling app-store reviews) independently corroborates this opt-in pattern, consistent with round 1. Cambly's own zendesk help center remains unreachable (403 on two different article URLs, and a third-party tutor-blog also 403'd).
  source: https://justuseapp.com/en/app/1454321866/cambly-kids/reviews | publisher: JustUseApp (aggregator) | pub_date: 2025 | confidence: medium (aggregator, not primary reviews directly read) | class: capability-claim

## Leads
- VIP English Kid / WISE Kids figures derived from synthesis/snippets, not line-by-line page verification — worth direct check if the whitespace question needs firmer grounding for a BOD-facing decision.
- Cambly Kids' zendesk help center unreachable via generic fetch (403 x2) — a browser-based check (e.g. claude-in-chrome) or archive snapshot could still get through if stronger confirmation is needed.
- 51Talk surfaced incidentally as a large, well-known live-foreign-teacher ESL platform "cheaper than traditional centers," not checked for exact pricing — candidate for a future pass, not pursued here (budget).

## Not found
- No VN K-12 online-English platform combining persistent/guaranteed human-teacher relationship with 300-500k VND/month pricing found, despite targeted Vietnamese and English queries and ~10 named candidates. **This absence is the round's headline result.**
- No independent (non-iSMART-derived) source describes iSMART's AI mechanism with any technical specificity — all three publishers checked recycle the same company messaging register.
- Cambly's own primary-source policy on teacher continuity could not be directly fetched (403 twice) — only aggregator/secondary evidence obtainable.
