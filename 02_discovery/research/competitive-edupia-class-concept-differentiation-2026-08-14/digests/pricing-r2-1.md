# Digest: Pricing & packaging — round 2 (follow-up)

Assistant: general-purpose (pricing direct-source follow-up)
Budget used: 13 tool calls, 6 sources

## Findings

- claim: VUS's own site confirms "Chỉ từ 1.8Tr/tháng" (starting from 1,800,000 VND/month) and "Chỉ từ 118k/giờ" — first-party confirmation, upgrade from round 1's secondary sourcing. A second VUS subdomain (hocbong.vus.edu.vn) shows the same banner in search snippets, giving cross-confirmation within VUS's own properties.
  source: https://tienganh.vus.edu.vn/ | publisher: VUS | pub_date: undated | accessed: 2026-08-14 | confidence: HIGH | class: pricing

- claim: VUS's "5,350,000 VND SMARTKIDS" figure is likely **per course, not per month** — a secondary source (muaban.net) phrases it as "5.350.000 VNĐ/khóa" (per course). VUS's own detailed tuition page (keep.vus.edu.vn/programs/hoc-phi-vus/) could not be reached (DNS resolution failure). **Round 1's "~5.35M/month" figure is likely a unit-of-measure error and should be treated as unresolved/probably wrong, not repeated as fact.**
  source: https://muaban.net/blog/hoc-phi-vus-moi-nhat-533025/ | publisher: muaban.net (secondary) | confidence: low | class: pricing

- claim: Yola's own site (yola.vn) publishes NO self-serve pricing anywhere — course pages list names/ages/features only; pricing is gated behind a "TƯ VẤN NGAY" (consult now) lead form. The dedicated pricing URL redirects into a broken staging-subdomain redirect loop. Yola behaves as a fully sales-gated pricing model, like iSMART. Round 1's 1.95–3.2M secondary figures remain unconfirmed.
  source: https://yola.vn/ | publisher: YOLA | confidence: HIGH (for the fact that no price is published) | class: packaging

- claim: **Kyna English (kynaenglish.vn) advertises a live 1:1 online-teacher English program "Chỉ từ 520K/tháng" (from 520,000 VND/month)** — described as personalized live instruction with real-time correction and AI-assisted pronunciation scoring. This is the closest live-teacher offer to the 300–500k band found across both rounds — just ~4% above the 500k ceiling.
  source: https://kynaenglish.vn/ | publisher: Kyna English | pub_date: undated | accessed: 2026-08-14 | confidence: medium (primary source, but "starting from" is a promotional-price red flag — true typical cost may be higher) | class: pricing

- claim: A Vietnamese aggregator survey of children's-English-center pricing (2025) shows live/small-class programs clustering well above 500k/month (e.g. Camkey ~2,000,000 VND/month ages 3-5; "Wise Kids" ~4,200,000/3mo ≈1,400,000/mo-equivalent) — corroborates, does not contradict, round 1's no-man's-land conclusion.
  source: https://camkeyenglish.edu.vn/hoc-phi-cac-trung-tam-tieng-anh-cho-tre-em-nam-2025-cap-nhat-moi-nhat-tai-ha-noi/ | publisher: Camkey English (competing center's own blog) | pub_date: 2025 | confidence: low-medium (secondary, snippet-level) | class: pricing-trend

- claim: **Wayback Machine / archive.org access is a confirmed hard block in this tool environment**, not a transient failure — both direct URL fetch and the CDX API endpoint (`web.archive.org/cdx/search/cdx?...`) returned an explicit tool-level refusal for both vus.edu.vn and monkey.edu.vn. No pricing-history data is obtainable via any method available in this environment.
  source: N/A (tool-level restriction) | confidence: HIGH (for the failure mode) | class: other

## Leads
- Kyna English (520K VND/month) — worth a dedicated follow-up if this becomes decision-critical: what exactly does the 520K tier include (session count/frequency)? Is there a lower intro/promotional tier that might dip into the 300-500k band during sign-up flows?
- VUS's keep.vus.edu.vn/programs/hoc-phi-vus/ page (found in search, DNS-unreachable this session, search-result title suggests "áp dụng từ 01/2022" i.e. likely stale) — worth retrying from a different network/tool to resolve the 5.35M per-course-vs-per-month ambiguity.
- Yola's true self-serve pricing may not exist publicly — confirming a number would require simulating a lead-form submission or phone inquiry, out of scope for web search/fetch.

## Not found
- No live-class (teacher-involved) VN K-12 online English platform found with clean, current, self-serve pricing inside the 300,000–500,000 VND/month band. Nearest: Kyna English at 520,000 VND/month (primary-sourced, just above ceiling).
- Could not fetch VUS's detailed tuition table (DNS failure) or Yola's dedicated pricing page (redirect loop; homepage confirms no public pricing).
- Wayback Machine/archive.org confirmed fully inaccessible in this environment via both direct URL and CDX API, for both VUS and Monkey — a hard block, not flakiness.
