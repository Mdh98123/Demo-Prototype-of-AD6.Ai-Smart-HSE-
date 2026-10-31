# AD6.Ai Smart HSE Platform — Enterprise AI Model Cards (Phase 5: Gap G4)
### Regulated Juridical Scope: Sultanate of Oman (MD 286/2008, RD 53/2023, PDO SP-1143 Section 4.2), UAE, KSA

---

## Executive AI Governance Statement
All artificial intelligence components operating within the **AD6.Ai Smart HSE Platform** are advisory and assistive only. In strict accordance with GCC health and safety jurisprudence, international human-in-the-loop (HITL) directives, and platform Guardrail G-4:
- No AI model is authorized to commit, alter, close, or submit statutory or safety records autonomously.
- Every safety-critical AI prediction, classification, causal tree, transcript, or legal citation requires explicit human verification by an authorized, certified role before entering the official system of record.
- If model confidence falls below the specified safety threshold, the suggestion is actively suppressed and the user interface enforces manual entry.

---

## 1. Use Case: Incident Severity & Category Classification (`incident_classification`)

### 1.1 Purpose
Assists site safety supervisors and HSE officers in triaging incoming incident descriptions, suggesting initial category (e.g., Caught-In/Between, Fall From Height, Chemical Release, Dropped Object) and severity (Minor, Moderate, Major, Critical, Catastrophic) to streamline initial reporting.

### 1.2 Model & Architecture
- **Model**: Gemini 2.5 Flash / Domain-Fine-Tuned Classifier
- **Inference Mode**: Server-side proxy (`/api/gemini/generate` via Express Gateway)
- **Hashing**: SHA-256 hash of prompt and input payload stored in `ai_outputs` table.

### 1.3 Inputs
- Raw incident narrative text (witness reports, worker initial description).
- Incident location, work activity, equipment involved.
- Initial immediate injury/damage observation.

### 1.4 Outputs
- `suggested_category`: Industrial classification taxonomy.
- `suggested_severity`: Severity score (Minor to Catastrophic).
- `statutory_reportable`: Boolean flag assessing whether statutory clock (24h/48h) is triggered under Oman MoL MD 286/2008.
- `confidence`: Calibrated numeric score [0.0000 - 1.0000].

### 1.5 Safety Thresholds
- **Confidence Gate Threshold**: `0.75` (75%).
- If `confidence < 0.75`, suggestion is suppressed; UI displays *"manual entry required — automated suggestion disabled for safety"*.
- Evaluation Accuracy Benchmark: $\ge 85\%$ agreement against certified lead safety investigators on golden dataset ($n=100$).

### 1.6 Known Failure Modes
- Polysemous terminology in construction slang (e.g., "crane dropped" referring to hook load vs. mechanical structural failure).
- Incomplete initial witness narratives leading to under-classification of High Potential (HIPO) events.
- Sarcasm, panic phrasing, or mixed multilingual text.

### 1.7 Human Oversight & Confirmation Gate
- **Enforcement**: Gate enforced at API layer (`requireAiGate('incident')`).
- **Authorized Reviewers**: `hse_officer`, `site_manager`, `group_hse_director`, `supervisor`.
- **Review Decision**: Must be `accepted` or `edited`. Rejections require reason code.
- Unconfirmed drafts trigger HTTP 403 and `AI_GATE_REJECTION` audit entries.

### 1.8 Explicit Prohibitions
1. **PROHIBITED**: Autonomous downgrade of any incident classified as Major, Critical, or Fatality.
2. **PROHIBITED**: Automatic generation or filing of statutory notifications to the Ministry of Labour without explicit signed human officer sign-off.
3. **PROHIBITED**: Use of classification outputs to trigger automated disciplinary actions, financial deductions, or terminations against workers.

---

## 2. Use Case: Root Cause Analysis (RCA) Drafting (`rca_drafting`)

### 2.1 Purpose
Assists lead investigators in structuring 5-Whys and Ishikawa (Fishbone) diagrams by synthesizing factual witness statements, inspection reports, and maintenance records into initial causal hypotheses.

### 2.2 Model & Architecture
- **Model**: Gemini 2.5 Pro / Flash with structured JSON schema output
- **Inference Mode**: Server-side proxy with grounded citation injection

### 2.3 Inputs
- Detailed incident timeline, evidence artifacts (photos, telemetry, maintenance logs).
- Witness statements, equipment calibration records, environmental conditions (e.g., TWL index).

### 2.4 Outputs
- `five_whys`: Array of sequential causal links ending in systemic root causes.
- `fishbone`: Structured 6M categories (Man, Machine, Method, Material, Measurement, Milieu).
- `suggested_controls`: Hierarchy of controls (Elimination, Substitution, Engineering, Administrative, PPE).
- `confidence`: Causal coherence score [0.0000 - 1.0000].

### 2.5 Safety Thresholds
- **Confidence Gate Threshold**: `0.70` (70%).
- If `confidence < 0.70`, causal tree draft is suppressed; UI requires manual investigation entry.
- Normalized Levenshtein Edit Distance Benchmark: $\le 0.35$ against certified investigator ground truth on historical golden dataset ($n=20$).

### 2.6 Known Failure Modes
- "Blame-the-worker" cognitive bias reflection: Over-indexing on human error (unsafe acts) rather than upstream organizational/engineering latent failures.
- Hallucinated equipment components not mentioned in source documentation.
- Circular 5-Why reasoning when narrative lacks technical maintenance records.

### 2.7 Human Oversight & Confirmation Gate
- **Enforcement**: Mandatory review checkbox and NEBOSH/IOSH certification attribution.
- **Review Decision**: Lead investigator must review every node in 5-Whys tree; diffs are computed and stored in `edit_diff`.
- `ai_outputs.review_decision` must be marked `accepted` or `edited` before CAPAs can be linked to RCA.

### 2.8 Explicit Prohibitions
1. **PROHIBITED**: Naming individual workers as sole root causes without systemic barrier evaluation.
2. **PROHIBITED**: Autonomous closure of incident investigations or signing of Form G statutory reports.
3. **PROHIBITED**: Bypassing investigator physical verification of site conditions.

---

## 3. Use Case: Voice-to-Text & Dialect Processing (`voice_structured_fields`)

### 3.1 Purpose
Enables field workers to report near-misses, unsafe conditions, and toolbox talk logs via natural speech in GCC industrial dialects (Omani Arabic, Gulf Arabic, Urdu-influenced Khaleeji, Hindi-English pidgin, English) while working hands-free in the field.

### 3.2 Model & Architecture
- **Model**: Whisper Large-v3 / Gemini Multimodal Audio Transcriber
- **Inference Mode**: Client-captured Opus audio chunk sent to secure server gateway (`/api/gemini/transcribe`).

### 3.3 Inputs
- Raw audio stream (WAV/WebM/Opus, 16kHz-48kHz).
- Dialect hinting (Oman Interior, UAE Northern Emirates, KSA Eastern Province).
- Ambient noise profile indicator.

### 3.4 Outputs
- `transcript_raw`: Verbatim dialect transcription.
- `transcript_en`: Standardized English HSE translation.
- `extracted_fields`: Structured key-value pairs (Location, Equipment, HazardType, Severity).
- `confidence`: Phonetic confidence and parsing certainty [0.0000 - 1.0000].

### 3.5 Safety Thresholds
- **Confidence Gate Threshold**: `0.70` (70%).
- Word Error Rate (WER) Benchmarks:
  - Clean Audio ($\le 15\text{ dB noise}$): $\text{WER} \le 10\%$.
  - Moderate Noise ($15\text{--}30\text{ dB noise}$, e.g. running plant/generators): $\text{WER} \le 18\%$.
  - Heavy Industrial Noise ($> 30\text{ dB noise}$, e.g. drilling rig floor, abrasive blasting): $\text{WER} \le 30\%$.

### 3.6 Known Failure Modes
- High ambient compressor/turbine noise masking fricative and sibilant Arabic phonemes.
- Technical abbreviations (e.g., LOTO, SCBA, H2S, ESDV) misconstrued as common spoken words.
- Multiple speakers talking simultaneously during emergency muster.

### 3.7 Human Oversight & Confirmation Gate
- Worker or supervisor must inspect the extracted transcript and fields on screen and tap "Confirm Accuracy" before the observation or hazard card is dispatched.
- Field worker retains full ability to edit transcribed text.

### 3.8 Explicit Prohibitions
1. **PROHIBITED**: Automatic generation of safety-critical permits (Hot Work, Confined Space Entry) purely from voice transcription without interactive physical review.
2. **PROHIBITED**: Voice-activated emergency isolation without redundant physical confirmation.

---

## 4. Use Case: Statutory & Regulatory Citation (`regulatory_citation`)

### 4.1 Purpose
Retrieves and cites relevant statutory articles from Sultanate of Oman (MD 286/2008, RD 53/2023, PDO SP-1143, SP-1230), UAE (Federal Decree-Law 33/2021), and Saudi Arabia (MHRSD Resolution 161238) relevant to reported hazards and violations.

### 4.2 Model & Architecture
- **Model**: Retrieval-Augmented Generation (RAG) over verified statutory corpus with deterministic vector and lexical lookup.

### 4.3 Inputs
- Incident type, facility type, jurisdiction (Oman / UAE / KSA), violated safety standard.

### 4.4 Outputs
- `citation`: Article number, title, and exact verbatim statutory excerpt.
- `relevance_score`: Semantic relevance index [0.0000 - 1.0000].
- `compliance_mandate`: Mandatory corrective action requirements under regional law.

### 4.5 Safety Thresholds
- **Confidence / Precision Gate Threshold**: `0.90` (90%).
- Precision Benchmark: $\ge 95\%$ valid statutory legal citations matching verified legal compendium on benchmark evaluation ($n=50$).

### 4.6 Known Failure Modes
- Cross-jurisdiction contamination (e.g., citing UAE Ministerial Resolution for an incident occurring in the Port of Sohar, Oman).
- Referencing repealed legislation or outdated article numbers after legal reforms (e.g., referencing pre-2023 Oman Labor Law).

### 4.7 Human Oversight & Confirmation Gate
- Legal citations flagged with amber warning badge in Form G generator and statutory clock dashboard.
- HSE Director or Legal Counsel must review cited articles prior to official external statutory filing.

### 4.8 Explicit Prohibitions
1. **PROHIBITED**: Autonomous submission of Form G or regulatory notices directly to government APIs or portal webhooks.
2. **PROHIBITED**: Extrapolating criminal or civil liability without human legal counsel review.

---

## 5. Summary Matrix of AI Use Cases & Governance Gates

| Use Case ID | Domain Focus | Model Family | Gate Threshold | Mandatory Human Reviewer | Failure Action |
|---|---|---|---|---|---|
| `incident_classification` | Triage & Severity | Gemini 2.5 Flash | $\ge 0.75$ | HSE Officer / Site Manager | Suppress & Force Manual Entry |
| `rca_drafting` | 5-Whys & Fishbone | Gemini 2.5 Pro | $\ge 0.70$ | Lead Investigator (NEBOSH) | Suppress & Force Manual Tree |
| `voice_structured_fields` | ASR & Dialects | Whisper v3 / Gemini | $\ge 0.70$ | Reporting Worker / Supervisor | Display Audio for Re-Listen / Edit |
| `regulatory_citation` | Oman / GCC Laws | Statutory RAG | $\ge 0.90$ | Group HSE Director / Legal | Mask Citation & Notify Compliance |

---
*Document Version: 5.0.0 (Phase 5 Safety Certified)*  
*Approved by: Group HSE Technical Authority & AI Governance Committee*
