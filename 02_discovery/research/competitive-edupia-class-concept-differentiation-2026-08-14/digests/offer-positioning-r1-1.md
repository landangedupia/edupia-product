# Digest: Offer/feature teardown + positioning — round 1

Assistant: general-purpose (competitor offer & positioning teardown)
Budget used: 14 tool calls (of ~10 planned; overran slightly), 8 sources

## Findings

**AI-personalization — mechanism specificity**

- claim: Monkey Stories markets a "personalized learning pathway" (AI + ~350 lessons / 7 stages / 1,400+ interactive comics) but discloses no diagnostic protocol, no discrete skill/objective count, no mastery threshold, no gap-detection mechanism. Named AI capability is "AI Buddy" for pronunciation feedback/interactive questions, not a skill-tracking engine.
  source: https://monkey.edu.vn/monkey-junior/monkey-stories | publisher: Monkey.edu.vn | pub_date: undated | accessed: 2026-08-14 | confidence: medium (primary, marketing copy, single-source) | class: capability-claim
- claim: Monkey Stories' other named AI capability, "AI M-Speak," is real-time pronunciation scoring — narrower than a full adaptive-diagnostic engine.
  source: monkey.edu.vn (search-snippet, not directly fetched) | confidence: low (single-source, unverified) | class: capability-claim
- claim: iSMART's "personalized learning journey" page claims AI "analyzes each student's learning data" to serve suited lessons, with no diagnostic protocol, discrete-skills inventory, mastery thresholds, or adaptation mechanism disclosed — aspirational marketing language only.
  source: https://ismart.edu.vn/vi/tieng-anh-truc-tuyen-cung-hanh-trinh-ca-nhan-hoa-hoc-tap-tai-ismart.html | publisher: iSMART Education | pub_date: undated | accessed: 2026-08-14 | confidence: medium (primary, marketing register, single-source) | class: capability-claim
- claim: iSMART's "AI era" ecosystem PR (iDIGI, iCLASS, AI learning assistant, AI robot, speech evaluation) is published near-identically on VietnamNet and VnExpress — one syndicated press release republished on two domains, not two independent confirmations.
  source: vietnamnet.vn/ismart-education... ; vnexpress.net/ismart-education... | publisher: VietnamNet / VnExpress (same underlying PR) | confidence: low (PR-driven, one effective source, no mechanism specifics) | class: positioning
- claim: ELSA Speak has the only describable personalization mechanism found — an entry placement test + stated goal (work/travel/IELTS) generates a personalized daily path that adapts by proficiency — but no discrete objective count or mastery-tracking granularity disclosed. (Note: ELSA is general-audience, not child-specific, not squarely in the 300–500k K-12 band.)
  source: elsaspeak.com (search-snippet, not directly fetched) | confidence: low (single-source, unverified) | class: capability-claim
- claim: **No platform surveyed (Monkey Stories, ELSA, iSMART, VUS, Antoree, Cambly Kids) describes personalization with granularity approaching "1,000+ discrete learning objectives"** — disclosed mechanisms top out at coarse level-counts (7 stages, 14 levels) or vague "AI analyzes learning data" language.
  source: synthesis across all sources | confidence: medium (consistent pattern across independent primary pages; absence-of-evidence is inherently harder to fully verify) | class: capability-claim — **directly load-bearing for the C3 differentiation question.**

**Human-teacher continuity**

- claim: Antoree's 1:1 model offers an opt-in "fixed teacher" (học cố định) option, but the same source states students can freely switch teachers if style doesn't fit — continuity is a bookable preference, not a guaranteed/assigned homeroom structure. No proactive-parent-contact SLA found.
  source: community.antoree.com (company-affiliated blog, not core FAQ) | confidence: low (single source, secondary register, no SLA specifics) | class: capability-claim
- claim: Cambly Kids uses on-demand tutor booking (any available native tutor) with a "save favorite tutors" convenience feature — not a guaranteed consistent/assigned teacher. No proactive parent-contact promise found.
  source: camblykids.zendesk.com (fetch blocked, HTTP 403) corroborated via https://www.happyteachermama.com/cambly-kids-the-ultimate-guide/ | confidence: low (primary inaccessible, rests on secondary summary) | class: capability-claim
- claim: VUS deploys a large institutional teacher pool (2,700+ certified teachers, TESOL/CELTA/TEFL) at center scale; no claim of a single named/dedicated teacher following one student with limited rotation was found.
  source: https://vus.edu.vn/blog-vus/khoa-hoc-tieng-anh-cho-tre-em | publisher: VUS | confidence: medium (primary, general "teacher quality" claim only — absence found, not confirmed absence) | class: capability-claim
- claim: **No platform surveyed (Antoree, Cambly Kids, VUS, iSMART, Yola) publishes an explicit SLA-style teacher-continuity promise** (stated rotation cap, guaranteed same-teacher %, defined parent-contact cadence).
  source: synthesis across all sources | confidence: medium | class: capability-claim — **directly load-bearing for the C4 differentiation question.**

**Pricing-band relevance (contextual, load-bearing)**

- claim: Monkey Stories' actual pricing is far below the 300–500k VND/month band: 6-month package 399,000 VND total (~66k/mo equiv), 1-year package 499,000 VND total (~42k/mo equiv) — roughly 6–10x cheaper per month than 390,000 VND/month.
  source: https://monkey.edu.vn/tin-tuc/gia-monkey-stories (search-snippet, not directly fetched) | confidence: low-medium (should be re-verified via direct fetch) | class: pricing-adjacent
- claim: Cambly Kids' 1:1 native-tutor pricing (~3.0–3.3M VND/mo at 2x/week, up to 6.0–6.5M/mo at 5x/week) sits far above the 300–500k band — a premium 1:1 product, not a mass-market comparator.
  source: tinhte.vn (hosting a 51Talk-authored comparison — vendor-affiliated) | confidence: low (vendor-affiliated secondary, single-source) | class: pricing-adjacent
- claim: VUS pricing "from 1.8–1.9 triệu/month" — also far above the 300–500k band.
  source: hocbong.vus.edu.vn ; tienganh.vus.edu.vn | publisher: VUS | confidence: medium (primary page titles state price directly, content not fully fetched) | class: pricing-adjacent

## Leads
- **Pricing/positioning whitespace**: every platform with a genuine live-teacher relationship (Cambly Kids, VUS, Antoree) prices far above 500k VND/month; every platform in/near the mass-market band (Monkey Stories, likely ELSA) is self-study with no live teacher at all. No competitor found combining a persistent human-teacher relationship with ~390,000 VND/month pricing — if confirmed with deeper research, this is either a meaningful strategic gap for C4, or an explanation for why nobody's done it (teacher cost doesn't fit the price point). **High-value follow-up for round 2.**
- VUS's newer app layer (OVI Kids / OVI Parents / OVI Teens) not explored — may carry separate AI-personalization/engagement claims distinct from VUS's classic center courses.
- iSMART's "AI era" PR push is undated in this pass — worth pinning actual publish date to check the 3-month freshness bar.
- Cambly Kids' help-center domain (camblykids.zendesk.com) blocked automated fetch (403) — human-in-browser check would raise confidence on the teacher-continuity finding.

## Not found
- No platform disclosed personalization granularity approaching "1,000+ discrete learning objectives" — all coarse or narrative.
- No explicit teacher-continuity SLA (contact frequency, rotation cap, teacher:student ratio) found on any platform's own marketing/FAQ within budget.
- Could not directly access Cambly Kids' primary help-center article on tutor consistency (403 blocked) — rests on secondary summary only.
- Yola yielded no specific AI-personalization or dedicated-teacher-continuity claim within budget (likely because Yola is primarily offline/hybrid center chain) — not conclusively ruled out, just unexplored further given budget.
- ELSA's placement-test claim and Monkey Stories' pricing numbers came from search-snippet synthesis, not direct page fetch — flagged low-confidence pending direct-fetch re-check if load-bearing.
- **No claim in this digest achieved genuine two-source independent confirmation** (the two-source bar for capability claims this research's differentiation conclusions rest on) — every finding above is effectively single-source. This thinness in public information on actual product mechanics is itself a notable finding.
