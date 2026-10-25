# AI & Predictive Capabilities Architecture

This document specifies the three distinct tiers of AI processing required by the Strategic Architecture document.

## 1. Edge AI (Real-Time Computer Vision)
**Objective:** Detect hazards (missing PPE, Red-zone incursion) in real-time.
**Constraint:** <300ms latency.
**Implementation:**
- **Hardware Layer:** Execution on localized Edge nodes (e.g., Azure Stack Edge, NVIDIA Jetson).
- **Model:** Optimized YOLO-v8 or MobileNet for object detection.
- **Workflow:** CCTV streams are processed on-premise. If a violation is detected (e.g., worker enters red-zone without helmet), an MQTT event is fired to the central Kafka bus to trigger an immediate IoT siren or supervisor SMS. 
- *Note:* Video frames are discarded locally after processing to ensure privacy; only metadata is sent to the cloud.

## 2. Generative AI (Agentic Copilot)
**Objective:** Assist users in generating Hazard Identification and Risk Assessments (HIRA) and Method Statements.
**Constraint:** Grounded in enterprise documentation and local GCC regulations (Oman MoL MD 286/2008).
**Implementation:**
- **Architecture:** Retrieval-Augmented Generation (RAG).
- **Components:** 
  - Vector Database (e.g., Milvus or Pinecone) storing chunked policies and PDO/Oman MoL manuals.
  - LLM Orchestrator (e.g., LangChain) invoking OpenAI / Gemini models.
- **Workflow:** User describes the job -> Copilot fetches relevant regulations -> Drafts a HIRA -> Requires human-in-the-loop (HITL) approval.

## 3. Predictive Analytics (Forward Modeling)
**Objective:** Predict safety incidents using historical and real-time telemetry (fatigue, heat stress).
**Constraint:** 72-hour forward risk modeling.
**Implementation:**
- **Data Ingestion:** Wearable IoT (smart helmets, biosensors) streams heart rate and core temperature via MQTT to Apache Kafka.
- **Environmental Context:** Weather APIs feed temperature and humidity data for WBGT (Wet Bulb Globe Temperature) calculation.
- **Modeling:** Time-series forecasting (e.g., LSTM or Prophet).
- **Output:** Dashboard heatmaps projecting site-level risk probabilities for the next 72 hours, triggering automated work-rest cycle adjustments.
