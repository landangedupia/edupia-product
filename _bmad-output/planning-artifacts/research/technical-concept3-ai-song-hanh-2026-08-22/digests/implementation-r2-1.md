# R2-1: AI Grading Accuracy vs Human Evaluators — Verification & SOTA

## Findings

### 1. The "~92% match to human evaluators" Duolingo claim — STILL UNVERIFIED / LIKELY WRONG NUMBER
- `openai.com/index/duolingo/` returned HTTP 403 again on retry. `web.archive.org` is not fetchable by the available tool (blocked). Two targeted searches ("Duolingo AI grading 92% human evaluators" and a rater-correlation search) turned up **no source anywhere using the figure "92%"** for Duolingo spoken grading.
- Instead, Duolingo's own primary materials report a **different, lower, and better-documented figure**: for DET Extended Speaking Responses, the AI ("Duo Speaking Scorer") agrees with human raters **~85% of the time** — approximately the same rate at which two human raters agree with each other. Reported as Cohen's κ: **human–machine κ = 0.77** vs **human–human κ = 0.68** (i.e., machine–human agreement was *numerically higher* than human–human agreement in this comparison).
  - Sources: Duolingo English Test Technical Manual (2023) — https://www.dpsdurgapur.com/wp-content/uploads/2024/05/duo-lingo-technical-mannual-2023.pdf ; Duolingo validity report — https://d23cwzsbkjbm45.cloudfront.net/media/resources/standards/validity.pdf ; independent peer-reviewed replication: "Evaluating automated evaluation systems for spoken English proficiency: An exploratory comparative study with human raters," PMC11952242 (full text could not be fetched — NCBI redirected to an abuse-block page — but the title/venue and the same 85%/κ figures were corroborated via search-result summary, so treat this as a second, independent-source *lead* rather than a fully confirmed read).
- **Verdict: do not use "~92%" in any deliverable.** If you need a headline Duolingo number, "~85% agreement, comparable to or slightly better than human-human agreement (κ 0.77 vs 0.68)" is the defensible, sourced figure. This is a materially different (weaker) claim than "92%" and should replace it everywhere in the deck/brief.

### 2. Current (2025–2026) SOTA accuracy figures for open-ended grading
**Spoken language:**
- DET speaking: ~85% human-machine agreement / κ 0.77 (see above; this appears to be the most recent officially documented figure, not clearly dated to 2025-2026 specifically — the technical manual is dated 2023, so flag as possibly not fully current).
- No other test-vendor (ETS, Pearson) technical-report figures for spoken grading were surfaced in this round — this is a gap (see Could not find).

**Written/essay grading (2025-2026 academic sources):**
- Human–LLM correlations reported in the range **r = 0.78–0.84**, Quadratic Weighted Kappa (QWK) **0.78–0.79** in several 2025 studies (ScienceDirect, BERT/random-forest studies).
- K-12-specific: SOTA hybrid/LLM models reported at **QWK 0.75–0.86** (arxiv 2606.12422, "Creating and Evaluating K-12 GenAI Assessment Graders").
- A research synthesis of 65 studies (Jan 2022–Aug 2025) found LLM–human agreement indices ranging widely, **0.30–0.80**, and explicitly "highly context-dependent" — i.e., no single stable accuracy figure holds across contexts/rubrics/languages ("Agreement Between Large Language Models and Human Raters in Essay Scoring: A Research Synthesis," ResearchGate/2025).
- **Two-source check**: the QWK ~0.75–0.86 K-12 range and the 0.78–0.84 correlation range are corroborated across at least 2 independent 2025 studies each, so this range can be treated as reasonably established — but note it is a *range*, not a single point figure, and essay QWK/correlation is not directly comparable to Duolingo's percent-agreement metric.

### 3. Springer paywalled article — still not directly accessible, but content partially recovered via search snippet
- Could not open link.springer.com/article/10.1007/s44366-026-0091-1 directly (paywall), and no arXiv preprint by the same authors was found in this round.
- However, a search snippet surfaced enough abstract-level content to be useful: the study evaluates **ChatGPT-4o with a reranked retrieval-augmented-generation (RAG) framework** grading **Finland's national high-stakes matriculation examination**, using **1,016 students' open-ended responses**, explicitly covering **high- and low-resource languages**. Its stated conclusion: LLMs show real potential as **supplementary** grading tools, particularly for low-resource languages, but **do not yet match the consistency or interpretive depth of human expert evaluators**. Treat this as a paraphrase from a search snippet, not a verified direct read of the paper — flag lower confidence.

### 4. Failure modes where AI grading systematically diverges from humans
- **Accent/non-native-speaker bias (well-documented, multiple 2025 sources):** ASR systems (which spoken-grading pipelines typically depend on for transcription) show significantly higher error rates for non-native speakers. One cited figure: **Nigerian-accented English ~44.2% error rate** in some ASR systems. A January 2025 independent benchmark found Google's conventional cloud ASR struggled most with Chinese- and Indian-accented English, while Google Gemini and OpenAI Whisper performed better; WhisperX + GPT-4o post-processing was found more robust for non-native speech. Sources: medRxiv "Accents Still Confuse AI: Systematic Errors in Speech Transcription and LLM-Based Remedies" (2025.08.29.25333548), Kerson AI research page, ResearchGate ASR bias study. **Direct relevance to this project**: if the spoken-grading product's complaint is accuracy-related, accent handling (Vietnamese-accented English specifically) is a highly plausible root cause given this literature, though no source in this round tested Vietnamese-accented English specifically.
- **Directional grading bias (essay/short-answer):** one study (arxiv 2406.16510, "Large Language Models in Student Assessment," found via Round 1/this round's search) reported GPT-4o scored **higher than humans in 6.2%** of cases but **lower than humans in 38.8%** of cases — i.e., LLM graders tend to be systematically more conservative / under-grade relative to human raters, not random-error noise.
- **Context-dependency / rubric-edge-case sensitivity:** the 65-study synthesis above frames the core failure mode as inconsistency across contexts rather than a single bias — agreement swings from 0.30 to 0.80 depending on task, rubric, and population, meaning any single "accuracy %" claim (like the disputed 92%) is likely cherry-picked from a favorable context rather than representative.

## Leads
- **Most important lead**: PMC11952242 ("Evaluating automated evaluation systems for spoken English proficiency: An exploratory comparative study with human raters") is a peer-reviewed source directly corroborating the 85%/κ figures from Duolingo's own materials — worth a direct-access retry (e.g., via PubMed Central's canonical URL structure or the journal's own site) since the NCBI PMC mirror blocked this session's fetch as abuse.
- Duolingo Technical Manual 2023 PDF and validity.pdf are primary documents worth a full read for exact wording/context, not just search-snippet paraphrase.
- Springer article's authors/affiliations should be looked up directly to search for an author-hosted preprint or SSRN/ResearchGate copy.
- ETS and Pearson technical reports for automated speaking-scoring (e.g., ETS SpeechRater) were not checked this round — a real gap given the brief's ask for vendor technical reports.

## Could not find
- No source anywhere repeats or corroborates the "~92%" Duolingo figure — it could not be confirmed and appears likely incorrect or a conflation with a different metric/test.
- Could not fetch openai.com/index/duolingo/ (403) or an archive.org snapshot (tool blocked from web.archive.org).
- Could not directly read the Springer/Frontiers of Digital Education article (paywalled); no arXiv preprint by the same authors located.
- No ETS or Pearson official technical-report figures for AI/automated spoken grading accuracy were found in this round.
- No source in this round specifically tested Vietnamese-accented English grading/ASR accuracy — this remains an open question directly relevant to the product's complaint.
