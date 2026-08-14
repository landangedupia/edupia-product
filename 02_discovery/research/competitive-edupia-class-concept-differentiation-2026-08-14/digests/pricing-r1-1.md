# Digest: Pricing & packaging — round 1

Assistant: general-purpose (pricing & packaging teardown)
Budget used: 13 tool calls (of ~10 planned; overran slightly), 8 sources

## Findings

**Monkey ecosystem (Monkey Junior / Monkey Stories / Monkey Pro) — self-study, no live teacher**
- claim: Monkey Junior costs 799,000 VND/year (≈66,600 VND/month, promo price) or 1,399,000 VND lifetime.
  source: https://monkey.edu.vn/dang-ky-hoc | publisher: Monkey | pub_date: undated (live page) | accessed: 2026-08-14 | confidence: medium (single primary source, promotional pricing) | class: pricing
- claim: Monkey Stories costs 699,000 VND/year (≈58,000 VND/month, promo price).
  source: https://monkey.edu.vn/dang-ky-hoc | publisher: Monkey | pub_date: undated | accessed: 2026-08-14 | confidence: medium | class: pricing
- claim: "Monkey Pro" bundles 6 apps (English x3 + Math + Vietnamese reading, i.e. English + Math bundled) for 1,299,000 VND/year (≈108,000 VND/month) — cheaper than buying English + Math separately.
  source: https://monkey.edu.vn/dang-ky-hoc | publisher: Monkey | pub_date: undated | accessed: 2026-08-14 | confidence: medium (single primary source; directionally corroborated by secondary writeups, not independently re-verified) | class: packaging
  **Note: clearest concrete VN example of bundling a second subject (Math) into one English-anchored price found this round — but it's a self-study app bundle, not a live-class product with an added session/activity.**

**ELSA Speak — AI pronunciation coach, self-study, no live teacher**
- claim: ELSA Pro costs 365,000/3mo (≈122,000/mo), 685,000/6mo (≈114,000/mo), 1,095,000/yr (≈91,000/mo), or 2,195,000 lifetime.
  source: https://vn.elsaspeak.com/elsa-shop/ ; https://elsaspeak.vn/bang-gia/ | publisher: ELSA Speak Vietnam | pub_date: undated | accessed: 2026-08-14 | confidence: medium (two converging domains, but figures came from search-summary, not raw fetch) | class: pricing

**Cambly Kids — 1:1 live tutoring, per-lesson pricing**
- claim: ₫550,000/lesson billed monthly; ₫456,923/lesson (10% off) on 3-mo commitment; ₫355,385/lesson (30% off) on yearly commitment. 30-min 1:1 sessions, 1/2/3/5 lessons/week options.
  source: https://www.cambly.com/kids/plans | publisher: Cambly | pub_date: undated (live page) | accessed: 2026-08-14 | confidence: medium-high on raw figures (directly fetched), LOW on any "effective monthly price" (not confirmed — at cheapest tier, back-of-envelope ≈1.5M VND/month, well above the 300–500k band; flagged as unverified computation, not a sourced claim) | class: pricing

**VUS (Vietnam USA Society) — secondary sources only**
- claim: VUS SMARTKIDS course ≈5,350,000 VND/month, classes of 10–20 students.
  source: https://muaban.net/blog/hoc-phi-vus-moi-nhat-533025/ ; https://mytour.vn/vi/blog/bai-viet/chi-phi-hoc-tai-trung-tam-anh-ngu-viet-my-vus-la-bao-nhieu.html | publisher: muaban.net / mytour.vn (aggregator blogs, not VUS's own site) | pub_date: undated | accessed: 2026-08-14 | confidence: LOW (secondary, no link to VUS's own pricing page — VUS's own page was not located) | class: pricing

**Yola — secondary sources only**
- claim: Dolphin (preschool) / Junior Primary ≈1,950,000–3,200,000 VND/month; Junior (teen) ≈8,000,000 VND/4.5mo term (≈1,780,000/mo).
  source: https://ila.edu.vn/hoc-phi-cac-trung-tam-tieng-anh-cho-tre-em (a competitor's site) ; https://gpaenglish.edu.vn/trung-tam-anh-ngu-yola-hoc-phi | publisher: ILA / third-party edu blog, not Yola's own site | pub_date: undated | accessed: 2026-08-14 | confidence: LOW | class: pricing

**Antoree — 1:1 tutoring, hourly pricing**
- claim: Children's (6–16) 1:1 tutoring 115,000–340,000 VND/hour depending on teacher nationality (VN/Filipino/native).
  source: antoree.com/tuition (referenced, not directly fetched) ; https://edu2review.com/reviews/hoc-phi-anh-ngu-antoree-1397.html | publisher: Antoree + Edu2Review | pub_date: undated | accessed: 2026-08-14 | confidence: medium | class: pricing
  Note: hourly 1:1 model, not directly comparable to a flat monthly bundled subscription.

**iSMART Education — pricing gated behind sales**
- claim: iSMART's online English program (Live Class, VIP 1:1/1:3, iSMART Touch self-study, CLIL-style English taught via Math/Science/Global-Citizenship content) publishes no package prices — only a generic "30% off" promo and consultation/trial forms.
  source: https://online.ismart.edu.vn/school-fee/ | publisher: iSMART Education | pub_date: undated | accessed: 2026-08-14 | confidence: HIGH that pricing is gated (directly fetched, genuinely absent) | class: packaging/other
  Note: iSMART is structurally the closest existing example of "English + extra subject bundled" (CLIL: English through Math/Science) at scale — but price is undiscoverable without a sales call.

## Leads
- Monkey Pro bundle economics (~108k/mo bundled vs ~58–67k/mo English-only) implies roughly 1.5–2x price uplift tolerance for a multi-subject bundle vs. single-subject in the self-study segment — a ratio that may be a useful (weak) reference point, not directly transferable to live-class pricing.
- iSMART's gated pricing on a CLIL (English+STEM) bundle suggests serious competitors may deliberately withhold bundle pricing publicly — worth flagging as a market norm, not a gap in this research.
- MindX, MAX English, YOLA, STEAMPlus surfaced as brands marketing "STEAM English" combined programs; none had discoverable pricing within this round's budget — candidates for a round-2 follow-up if the bundling question needs firmer grounding.
- Open question: is per-lesson/frequency-tiered pricing (Cambly-style) more common in this market than flat monthly subscriptions? Not resolved this round.

## Not found
- No platform found with a clean, current, self-serve monthly price landing directly in the 300,000–500,000 VND/month band with LIVE classes. Everything verifiable was either self-study-only and cheaper (Monkey/ELSA, ~60–120k/mo) or live-class and considerably more expensive (VUS ~5.35M/mo, Yola ~1.95–3.2M/mo, Cambly likely well over 1M/mo, Antoree hourly).
- Wayback Machine / archive.org access failed entirely this round (tool error on every attempt) — no pricing-trend/history data obtained for any competitor. Flagged as a tool limitation, not absence of data; worth retrying in round 2 for Monkey, ELSA, VUS at minimum.
- No 6–12 month pricing-change data confirmed for any platform (direct consequence of the Wayback failure).
- No concrete example found of a mass-market (~300–500k VND/mo) LIVE-CLASS English platform bundling a second subject/activity into one price. Closest analogues (Monkey Pro, iSMART CLIL) are self-study-only or price-opaque. Report as genuinely unresolved, not as evidence bundling is rare.
- VUS's and Yola's own pricing pages not located/fetched — all VUS/Yola figures rest on secondary sources (confidence-downgraded per source-quality rules).
- iSMART's actual price figures — confirmed gated, unobtainable via public search.
