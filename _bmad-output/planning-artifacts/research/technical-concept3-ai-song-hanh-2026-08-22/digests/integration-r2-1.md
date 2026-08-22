# Integration R2-1: Vendor Voice-Cloning Language Support for Vietnamese

## Findings

### 1. ElevenLabs — Vietnamese IS explicitly listed for Professional Voice Cloning (PVC)
Source: ElevenLabs docs — "What languages are supported with Professional Voice Cloning (PVC)?"
https://elevenlabs.io/docs/help-center/product/voices/voice-cloning/what-languages-are-supported-with-professional-voice-cloning-pvc

- The page explicitly lists "🇻🇳 Vietnamese" as the final entry in the PVC-supported language list.
- PVC is scoped as "supported for all languages supported by the Flash v2.5 model" — i.e., ElevenLabs does **not** distinguish a separate "cloning input language" list from the "TTS output language" list. Cloning eligibility and speakable-output eligibility are the same list (73 languages via Flash v2.5 / Multilingual v2).
- This **directly reverses Round 1's absence-of-evidence finding** for ElevenLabs: Vietnamese is confirmed, not merely unconfirmed.
- Caveat: could not fetch help.elevenlabs.io's companion article (returned HTTP 403); relied on the elevenlabs.io/docs mirror of the same content, which loaded successfully and is a first-party vendor doc.
- No visible last-updated date on the page — freshness not confirmable from the page itself.

### 2. Cartesia — Vietnamese (`vi`) IS in the voice-clone API's SupportedLanguage enum
Source: Cartesia API reference, Clone Voice endpoint — https://docs.cartesia.ai/api-reference/voices/clone

- The `SupportedLanguage` schema used by the voice-cloning request itself enumerates: `en, fr, de, es, pt, zh, ja, hi, it, ko, nl, pl, ru, sv, tr, tl, bg, ro, ar, cs, el, fi, hr, ms, sk, da, ta, uk, hu, no, vi, bn, th, he, ka, id, te, gu, kn, ml, mr, pa, or, ur`.
- `vi` (Vietnamese) is present. This is the parameter attached to the actual `/voices/clone` call, not a general marketing language list — i.e., this is cloning-specific, not just TTS-output-specific.
- Secondary/marketing pages are inconsistent on the topline number: Cartesia's blog post on Professional Voice Cloning states PVC is "available across 15 languages" without naming them; other Cartesia marketing copy claims cloned voices can "localize into 42 languages." The API reference (primary, technical) is the most authoritative and confirms `vi` is a valid cloning-language value.
- This also reverses Round 1's finding for Cartesia.

### 3. Google Cloud — Vietnamese (vi-VN) IS in Dialogflow CX's Voice Cloning locale list; separate generic Cloud TTS Custom Voice is unclear/restricted
Source: Google Cloud docs — Dialogflow CX Voice Cloning — https://docs.cloud.google.com/dialogflow/cx/docs/concept/voice-cloning

- Explicit supported-locale list for this voice-cloning feature: `ar-XA, cmn-CN, de-DE, en-AU, en-GB, en-IN, en-US, es-ES, es-US, fr-CA, fr-FR, gu-IN, hi-IN, id-ID, it-IT, ko-KR, mr-IN, nl-NL, pl-PL, pt-BR, ru-RU, ta-IN, te-IN, th-TH, tr-TR, ur-IN, vi-VN`.
- `vi-VN` is present (last entry).
- Important scope caveat: this is the Dialogflow CX / CCAI product's voice-cloning feature, not the generic Cloud Text-to-Speech "Instant Custom Voice"/custom-voice-model product. A separate web-search snippet (not independently vendor-confirmed in this pass) suggested the general Cloud TTS custom-voice/pronunciation feature excludes `vi-vn` and is "restricted access" — this is a **different product surface** than the Dialogflow CX one just confirmed. Both claims should be treated as about different Google products; do not conflate them.
- This is a partial reversal of Round 1: at least one Google Cloud voice-cloning surface (Dialogflow CX) confirms vi-VN; the generic Cloud TTS custom-voice surface remains unconfirmed/likely excluded.

### 4. PlayHT — Vietnamese for voice cloning specifically NOT confirmed
Source: PlayHT docs, Models reference — https://docs.play.ht/reference/models

- Voice cloning quality/availability is model-dependent: PlayDialog ("Best," beta multilingual, languages not enumerated on this page), Play 3.0 Mini ("Better," "supports 36 languages" but the 36 are not named on this page), PlayHT 2.0 ("Good," English only).
- Could not confirm Vietnamese is (or isn't) among Play 3.0 Mini's 36 cloning-capable languages from this page. Marketing pages claim "142 languages" platform-wide, but that figure is not tied to the cloning-capable model list.
- Net: PlayHT remains an open question for voice cloning (distinct from its broad stock-voice/TTS-output language count).

### 5. Vietnam-market voice AI company: Vbee (Vbee AI Voice / Vbee.vn)
Sources: https://vbee.vn/blog/news/vbee-hop-tac-voi-google-cloud/ ; https://cloud.google.com/customers/vbee (fetch was truncated — title/existence confirmed, full case-study body not retrieved) ; https://cloud-ace.vn/en/case-study/vbee-ai-hop-tac-voi-cloud-ace-va-google-cloud-mo-rong-quy-mo-ai-voice-tai-viet-nam/

- Vbee is a Vietnam-based conversational-AI/TTS company explicitly founded on the premise that "global text-to-speech platforms often fail to capture the complex nuances of the Vietnamese language" — i.e., a direct, published statement of the Vietnamese-voice-cloning limitation the client is worried about.
- In early 2025 Vbee launched a large-scale Vietnamese voice-cloning product ("immediate hit") built on their own stack, hosted on Google Cloud infrastructure (Cloud Run, Cloud Build) via partner Cloud Ace — not on Google's own Cloud TTS custom-voice product. Their original static-VM infrastructure couldn't handle voice-cloning training-request volume; migrating to serverless Cloud Run reportedly increased voice-cloning scaling speed 800% and cut AI-team maintenance time ~50%.
- Implication for the decision: a Vietnam-native vendor (Vbee) already operates production-grade Vietnamese voice cloning at scale, independent of whether ElevenLabs/Cartesia/Google's own products cover Vietnamese well. This is a viable alternative/backup vendor path worth evaluating directly, not just a data point about global vendors.

## Leads

- **Vbee (vbee.vn)** — the single most decision-relevant lead. A Vietnam-based vendor with a live, at-scale Vietnamese voice-cloning product, explicitly positioned against the exact gap ("global TTS platforms fail to capture Vietnamese nuances") the client is worried about. Worth a direct evaluation call/demo and a look at vbee.vn/en for English-teaching-relevant offerings (e.g., whether they support Vietnamese-accented English output, K-12/EdTech use cases, API pricing).
- Cartesia's inconsistent language counts across pages (15 vs. 42 vs. the ~44-code API enum) suggest the different numbers refer to different tiers/features (e.g., "Professional Voice Cloning" tier vs. general Sonic TTS output vs. the full API enum). Worth a follow-up query directly to Cartesia support/docs to pin down which number governs actual PVC-tier availability for `vi`, since the blog explicitly says PVC is "across 15 languages" without naming them — that 15-language subset may or may not include Vietnamese even though `vi` appears in the broader API enum.
- Google's generic Cloud TTS custom-voice product (separate from Dialogflow CX voice cloning) reportedly excludes `vi-vn` per a secondary source found in search snippets — not yet confirmed against Google's own primary custom-voice/Instant Custom Voice documentation page directly. Worth a targeted follow-up fetch of that specific doc page if this product path (vs. Dialogflow CX) matters to the architecture.
- Round 2 question 2 (Vietnamese-accented English specifically, as opposed to Vietnamese-language output) was not directly answered by any vendor doc found in this pass — none of the pages discuss accent-transfer/accent-retention behavior when a cloned voice speaks a second language. This remains open and may need a hands-on vendor trial rather than a docs search.

## Could not find

- No vendor documentation (ElevenLabs, Cartesia, PlayHT, or Google) explicitly addresses whether a voice cloned from a Vietnamese speaker can be made to output **English with a Vietnamese accent** (vs. output normalized to standard English pronunciation). This is architecturally different from "is Vietnamese language supported" and appears to require a hands-on trial, not a docs lookup.
- Could not retrieve the full Google Cloud VBEE case-study page body (cloud.google.com/customers/vbee) — the fetch returned a truncated/empty result; only the page's existence and title were confirmed. The Vbee.vn and Cloud Ace case-study pages substituted as sources for the same story.
- Could not confirm a specific "last updated" date on any of the ElevenLabs, Cartesia, or Google pages cited — freshness is unconfirmed, though all are current live vendor doc/API-reference pages as of this research date (2026-08-22).
- Did not find any other Vietnam-market company (fintech, media, call-center/CX) publishing specifically about voice-cloning vendor choice or Vietnamese-language limitations, beyond Vbee — search budget was exhausted before a broader sweep of that vertical.
