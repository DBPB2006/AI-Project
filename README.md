# AI Investment Research Agent — Engineering Design Document

A stateful, multi-agent investment analysis system orchestrated with LangGraph that compiles financial and market research, detects discrepancies, runs verification protocols, and generates investment recommendations.

---

## 1. Project Overview

### Problem Statement
Standard Large Language Models (LLMs) are inherently unreliable when used directly for equity research or investment analysis. Because monolithic LLMs generate outputs based on next-token probability distributions rather than strict deterministic logic, they suffer from three key deficiencies:
* **Hallucinations of Financial Metrics**: Monolithic models frequently hallucinate or approximate key financial indicators (e.g., EBITDA, operating margin, debt-to-equity ratio) or invent news catalysts.
* **Opaque and Unverifiable Reasoning**: Combining data ingestion, quantitative financial computation, and qualitative sentiment evaluation into a single prompt makes it impossible to trace the origin of a claim.
* **Uncritical Acceptance of Single-Source Data**: Monolithic agents often trust a single data source or context window. They fail to identify or resolve data discrepancies between multiple API providers.

### The Solution: Evidence-First Pipeline
This system resolves these deficiencies by separating the workflow into a strict, unidirectional pipeline:

```
[Evidence Ingestion] ➔ [Financial & Market Analysis] ➔ [Independent Validation] ➔ [Investment Decision] ➔ [Portfolio Suitability]
```

1. **Evidence Ingestion**: Programmatic data collection from external APIs (FMP, Finnhub, NewsAPI). Decoupled from LLM reasoning to lock down raw, unhallucinated figures.
2. **Financial & Market Analysis**: Concurrent independent agents analyze balance sheet variables and qualitative sentiment, isolating quantitative metrics from market volatility.
3. **Independent Validation**: An audit layer checking agent output statements against the raw Evidence Package, identifying reporting discrepancies and data conflicts.
4. **Investment Decision**: Synthesis of validated data into a final recommendation (BUY, HOLD, PASS) and core investment thesis.
5. **Portfolio Suitability (Optional)**: If consented, screens the stock against the user's asset allocation rules, cash limits, and risk thresholds.

By isolating concerns, the system ensures that:
* Every financial claim is audited by an independent validation agent before reaching the decision-maker.
* Data Ingestion is entirely programmatic and decoupled from AI inference.
* All qualitative reasoning is auditable back to the raw source data.

---

## 2. Features

* **Multi-Provider Financial Research**: Automatically fetches balance sheets, income statements, cash flow metrics, and valuation ratios from Financial Modeling Prep (FMP) and Finnhub.
* **Multi-Provider Market Research**: Integrates Finnhub quotes, stock pricing bands, and NewsAPI articles to capture market trends and sentiment.
* **Evidence Ingestion & Aggregation**: Consolidates raw provider payloads into a single, immutable, and versioned `Evidence Package` locked within the graph state.
* **Provider Discrepancy Detection**: Dynamically compares overlapping data fields between FMP and Finnhub to identify reporting variances.
* **Financial Health Analysis**: Quantitative evaluations of leverage, operating margin durability, and dividend coverages.
* **Market Catalyst Analysis**: Qualitative extraction of operational risks, regulatory shifts, and topic trends.
* **Independent Evidence Validation**: An independent auditing layer that compares generated reports with the raw evidence package, flags contradictions, and calculates a data confidence rating.
* **Explainable BUY / HOLD / PASS Verdicts**: Synthesizes verified data points into a final recommendation backed by a logical core thesis.
* **Portfolio-Aware Recommendations**: Customizes general verdicts against user-defined risk profiles, cash constraints, and sector restriction preferences (requires explicit user consent).
* **Research History**: Keeps a historical audit trail of generated analyses in MongoDB Atlas, allowing users to revisit past reports.
* **Dynamic AI Reports**: A dashboard presenting metric tables, news sentiment scores, audit validation flags, and personalized suitability metrics.
* **Modular LangGraph Workflow**: A stateful graph representation of the multi-agent pipeline allowing conditional routes and execution validation at node boundaries.

---

## 3. Architecture

### System Architecture Diagram
```
                       [ USER ]
                          │
                          ▼
                  [ React Frontend ]
                          │
                   POST /api/analyze
                          ▼
                  [ Express Backend ]
                          │
                  (runInvestmentGraph)
                          ▼
               [ LangGraph Orchestrator ]
                          │
             1. [ Research Node ] ──> Query API Feeds (FMP, Finnhub, NewsAPI)
                          │
                          ▼
            [ Immutable Evidence Package ] (Locked in Graph State)
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
   2. [ Financial Node ]     3. [ Market Node ]
      (Financial Agent)         (Market Agent)
             │                         │
             └────────────┬────────────┘
                          ▼
             4. [ Validation Node ] (Validation Agent Checks Claims)
                          │
                          ▼
             5. [ Decision Node ] (Investment Decision Agent)
                          │
                          ▼
             6. [ Suitability Node ] (Portfolio Suitability Agent — Optional)
                          │
                          ▼
             7. [ Presentation Builder ] (Maps data for React display)
                          │
                          ▼
                  [ React Report UI ]
```

### Architectural Breakdown
* **Stateful Graph Orchestration**: LangGraph coordinates the state machine. The graph state is updated at each node boundary and validated before moving to the next stage, preventing data drift.
* **API Middleware**: The Express backend acts as the gateway. It handles user authentication, manages profile preferences, and triggers the async LangGraph workflow.
* **Database Persistency**: MongoDB Atlas acts as the persistent store for the final research reports and raw data packages, maintaining a full history of generated reports.

---

## 4. Why This Architecture?

We chose this modular, multi-agent architecture to enforce data integrity, trace reasoning, and prevent model hallucinations.

### Research Engine
* **Responsibilities**: Fetch raw data from FMP, Finnhub, and NewsAPI; consolidate into an immutable `Evidence Package`; perform zero LLM reasoning.
* **Why**: Programmatic API fetching ensures that downstream agents work with actual data.Decoupling data fetching from LLM inference prevents the model from hallucinating numbers at the ingest step.

### Financial Analysis Agent
* **Responsibilities**: Assess fundamental ratios, operating margins, leverage, cash coverages, and valuation metrics.
* **Why**: Isolating financial reasoning prevents qualitative news sentiment from biasing balance sheet calculations. The model evaluates profitability metrics independently of market momentum.

### Market Analysis Agent
* **Responsibilities**: Analyze raw news arrays, insider activity, and daily quotes to identify risk catalysts and sentiment.
* **Why**: Separating qualitative analysis ensures that volatile market sentiment is processed independently and does not corrupt quantitative calculations.

### Evidence Validation Agent
* **Responsibilities**: Cross-reference the reports from the Financial and Market agents against the raw `Evidence Package`. Detect discrepancies, verify numbers, flag unsupported statements, and assign an audit rating.
* **Why**: This is the most critical security layer. The final decision agent does not review raw analysis; it only receives validated data. This prevents hallucinations from reaching the final recommendation.

### Investment Decision Agent
* **Responsibilities**: Synthesize validated quantitative and qualitative insights into a BUY, HOLD, or PASS verdict.
* **Why**: DECISION IS NOT AN ANALYST. Decoupling decision synthesis from data processing prevents the model from suffering from context-window confusion and focus drift.

### Portfolio Suitability Agent
* **Responsibilities**: Map recommendations against the user's risk tolerance, investment horizon, cash limits, and sector preferences.
* **Why**: Personalized portfolio checks are optional and require explicit user consent. Keeping this logic isolated prevents subjective portfolio parameters from biasing the objective evaluation of the stock.

### Presentation Builder
* **Responsibilities**: Clean, format, and map the final LangGraph state into structured datasets for the React frontend; perform zero financial or AI reasoning.
* **Why**: Isolating data formatting from agent logic keeps the LangGraph state clean and lightweight, while ensuring the UI receives a standardized presentation contract.

### React Frontend
* **Responsibilities**: Render dynamic reports; perform zero investment calculations or business logic.
* **Why**: Treats the frontend as a pure view layer, ensuring that all calculations and validations remain secure and repeatable on the backend.

---

## 5. Complete Workflow

1. **User Action**: The user inputs a stock symbol (e.g., `AAPL`) on the React search interface.
2. **Request Gateway**: The React client sends a `POST` request to the Express server at `/api/analyze`.
3. **Research Node**: The backend triggers the LangGraph workflow. Node 1 programmatically queries FMP, Finnhub, and NewsAPI, building the immutable `Evidence Package`.
4. **Parallel Analysis**: The graph branches. The Financial Node evaluates financial health, while the Market Node evaluates qualitative catalysts and sentiment.
5. **Auditing/Validation**: The Validation Node cross-checks every statistic in the reports against the `Evidence Package`. Unsupported metrics are pruned or flagged.
6. **Verdict Node**: The Investment Decision Node synthesizes the validated findings into a BUY, HOLD, or PASS rating with a core thesis.
7. **Suitability Check (Optional)**: If user consent and profile data exist, the Suitability Node compares the recommendation against the user's portfolio and sector limits.
8. **Presentation Mapper**: The Presentation Builder converts the graph state into a structured schema.
9. **UI Display**: The React frontend renders the multi-tab report dashboard.

---

## 6. Data Sources

| Source | Purpose | Why It Was Chosen |
| :--- | :--- | :--- |
| **Financial Modeling Prep (FMP)** | Standardized Financial Data | Provides standardized, audited SEC filing data, income statements, balance sheets, and key ratios. |
| **Finnhub** | Real-Time Market Metadata | Ingests daily price quotes, target analyst metrics, insider sentiment, and US exchange metadata. |
| **NewsAPI** | Broad News Aggregator | Gathers market articles to evaluate news sentiment, industry shifts, and macroeconomic factors. |
| **Google Gemini (Gemini Pro)** | Core Reasoning Engine | Selected for its strong reasoning capabilities, structured output compliance, low latency, and large context window. |
| **MongoDB Atlas** | Document Datastore | A document store is ideal for storing unstructured news arrays, nested metrics, and JSON report states. |

*Why multiple providers improve evidence quality*: Relying on a single provider introduces risk. Comparing overlapping fields between FMP and Finnhub allows the Validation Agent to flag reporting discrepancies (such as differing calculations of debt or cash flow) before making an investment decision.

---

## 7. Hallucination Mitigation

* **Research Layer**: Decoupled from LLM inference. Ingests raw data programmatically to ensure a reliable foundation.
* **Financial Layer**: Restricts model context strictly to financial statements, preventing qualitative sentiment from biasing calculations.
* **Market Layer**: Confines LLM reasoning to news arrays and target rates, preventing the model from hallucinating broader corporate statistics.
* **Validation Layer**: Cross-references every report statistic against the `Evidence Package`. Unsupported claims are flagged and pruned.
* **Decision Layer**: Bases its thesis only on validated data points, ensuring no unverified assumptions impact the final recommendation.
* **Portfolio Layer**: Keeps portfolio checks separate from stock analysis, preventing subjective variables from biasing the objective valuation of the stock.
* **Presentation Layer**: Performs zero reasoning. Uses structured schema mapping to protect data integrity.

---

## 8. Engineering Decisions

* **Why LangGraph instead of Sequential Prompting**: Sequential prompting can lead to context drift and hallucinated summaries. LangGraph enables state verification at node boundaries and allows conditional execution paths.
* **Why One Core LLM (Google Gemini)**: Using a single LLM across nodes simplifies prompt structures and ensures format compatibility while reducing token consumption.
* **Why Multiple Providers**: Using multiple APIs allows the Validation Agent to detect reporting variances and calculate a data confidence rating.
* **Why Validation Exists**: The validation layer acts as a strict audit gate, ensuring the final recommendation is based only on verified facts.
* **Why Evidence is Preserved**: Locking the `Evidence Package` in the state ensures that all downstream agents process the exact same dataset, maintaining consistency.
* **Why React is Only a Renderer**: Decouples presentation from business logic, ensuring calculations and validations remain secure on the backend.
* **Why the Presentation Builder Exists**: Separates presentation formatting from agent logic, keeping the LangGraph state clean and lightweight.
* **Why Portfolio Analysis is Optional**: Ensures that generic research reports can still be generated when user profile data or consent is missing.
* **Why Provider Discrepancies are Preserved**: We do not force providers to agree. Flagging discrepancies helps analysts identify potential reporting risks.
* **Why Every AI Node Has a Single Responsibility**: Prevents context-window confusion and focus drift, improving execution speed and output accuracy.

---

## 9. Technology Stack

* **React**: Component-driven frontend architecture, ideal for rendering a dynamic, multi-tab dashboard.
* **Node.js & Express**: Lightweight backend API gateway that manages routing, auth, and database writes.
* **MongoDB Atlas**: Document database that natively stores unstructured news arrays, nested ratios, and JSON report states.
* **LangGraph.js**: Graph orchestration engine that coordinates the multi-agent workflow.
* **Google Gemini (Gemini Pro)**: Core LLM that offers strong reasoning, low latency, and structured JSON output compliance.
* **Financial Modeling Prep (FMP) API**: Standardized financial data feed.
* **Finnhub API**: Real-time stock quotes and market metadata.
* **NewsAPI**: Macro financial news aggregator.

---

## 10. Setup Instructions

### 1. Prerequisites
* **Node.js**: v18 or higher.
* **MongoDB**: A running local instance or MongoDB Atlas cluster.
* **API Keys**: Access keys for FMP, Finnhub, NewsAPI, and Google Gemini.

### 2. Installation & Directory Layout
Clone the repository and install client and server dependencies:
```bash
# Navigate to the workspace
cd "review 2"

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Variable Configurations
Create a `.env` file in the `server/` directory:
```env
PORT=3300
MONGODB_URI=mongodb://localhost:27017/research_engine_db
GEMINI_API_KEY=your_gemini_api_key
FMP_API_KEY=your_fmp_api_key
FMP_API_BASE_URL=https://financialmodelingprep.com/api/v3
FINNHUB_API_KEY=your_finnhub_api_key
NEWS_API_KEY=your_news_api_key
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:3300
```

### 4. Database Seeding & Setup
Seed default user profiles representing different risk profiles:
```bash
# In server directory
npm run seed:users
```

### 5. Company Index Synchronization
To index company symbols from Finnhub to your local MongoDB search index, run:
```bash
# In server directory
npm run sync:companies
```
To perform a database drop and reset before syncing:
```bash
npm run sync:companies -- --reset
```

### 6. Starting Locally
**Start Express Backend:**
```bash
# In server directory
npm start
```
**Start React Frontend Client:**
```bash
# In client directory
npm run dev
```
Open your browser to `http://localhost:5173`.

### 7. Deployment
* **Backend**: Build and deploy `server/` to a hosting platform like Render.
* **Frontend**: Build production assets with `npm run build` inside `client/` and deploy to Vercel, Netlify, or Render.
* **Database**: Provision a MongoDB Atlas cluster and replace `MONGODB_URI` in the production environment settings.

---

## 11. Example Research Outputs

### Example 1: Apple Inc. (AAPL)
* **Recommendation**: `BUY`
* **Confidence**: `High`
* **Audit Quality**: `Excellent`
* **Investment Thesis**: Apple demonstrates outstanding financial durability, characterized by operating margins over 30% and capital efficiency (ROE > 150%).
* **Decision Factors**:
  * *Strengths*: Consistent cash flow generation and high ROE.
  * *Risks*: High exposure to consumer spending cycles.
  * *Watch Items*: Growth rates in services revenue.
* **Portfolio Recommendation**: `SUITABLE` (fits the 5+ years horizon; recommends sizing restrictions due to tech sector limits).
* **Rationale**: Strong fundamentals and high audit scores support a BUY rating. Flagged discrepancies in leverage figures between FMP and Finnhub were resolved by defaulting to audited 10-Q metrics.

### Example 2: Tesla, Inc. (TSLA)
* **Recommendation**: `HOLD`
* **Confidence**: `Medium`
* **Audit Quality**: `Good`
* **Investment Thesis**: Tesla exhibits strong market capitalization, but near-term pressure on automotive gross margins (excluding credits) warrants caution.
* **Decision Factors**:
  * *Strengths*: Dominant market share in electric vehicles.
  * *Risks*: Margin compression and regulatory headwinds.
  * *Watch Items*: Launch timeline of next-generation vehicle platforms.
* **Portfolio Recommendation**: `UNSUITABLE` (TSLA's historical volatility conflicts with capital preservation targets).
* **Rationale**: Near-term margin compression warrants caution, resulting in a HOLD rating. High beta conflicts with the user's conservative risk profile.

---

## 12. Testing

We validated the system using a variety of test cases:
* **Multiple Companies**: Tested across different market caps and sectors (e.g., tech, auto) to verify agent adaptability.
* **Different Market Conditions**: Tested during periods of high news volume to ensure the Market agent remained focused.
* **Missing Financial Data**: Verified that downstream agents correctly handle missing metrics (using `null` or `N/A`) without crashing.
* **Provider Discrepancies**: Verified that the Validation agent flags differences in leverage metrics between FMP and Finnhub.
* **Portfolio Recommendations**: Verified that suitability logic correctly flags conflicts for different risk profiles.
* **End-to-End Testing**: Validated the complete flow from frontend search to backend state generation and database persistence.

---

## 13. Trade-offs

* **REST Polling vs WebSockets**: We chose REST polling. While WebSockets would allow sub-second price streaming, polling simplified graph coordination and database writes.
* **Omission of Complex Portfolio Optimization**: We focused on suitability checks (risk levels, horizon, sector exclusions) and left out complex mathematical optimizations (mean-variance models) to keep execution speed fast.
* **No Inline SEC Filings Parsing**: We rely on FMP/Finnhub SEC filing extractions rather than parsing raw PDFs on the fly. This prevents context-window depletion and keeps latency low.
* **No Real-Time streaming**: Prioritized report generation consistency over sub-second updates.
* **No RAG**: Relied on direct API payloads to ensure high-accuracy data retrieval.

---

## 14. Future Improvements

* **Custom SEC PDF Parser**: Ingest raw 10-K/10-Q filings directly from SEC EDGAR to eliminate API provider dependency.
* **Historical Backtesting Simulation**: Evaluate recommendations over 5-year windows to track the agent's performance.
* **RAG over Annual Transcripts**: Ingest transcripts of earnings calls using retrieval-augmented generation to extract direct management sentiment.
* **Multi-LLM Consensus**: Run validation nodes using both Gemini and Claude to get a second opinion on data flags.
* **Portfolio Optimization**: Add portfolio rebalancing recommendations.
* **Watchlists & Alerts**: Allow users to monitor stocks and receive notifications on rating changes.
* **More Financial Providers**: Integrate additional data feeds to improve discrepancy detection.

---

## 15. Deployment

* **Frontend App**: [<ADD_FRONTEND_URL>](<ADD_FRONTEND_URL>)
* **Backend Server API**: [<ADD_BACKEND_URL>](https://ai-project-fl7o.onrender.com)
* **Database**: MongoDB Atlas
* **GitHub Repository**: [<ADD_GITHUB_REPOSITORY>](<ADD_GITHUB_REPOSITORY>)

---

## 16. AI-Assisted Development

This project was built in collaboration with **Antigravity**, a Google DeepMind agentic AI coding assistant.
* **Iterative Refinement**: Chat logs document how prompt directives were refined to prevent LLM drift.
* **Architecture Evolution**: The independent Validation Node was added after early tests showed models combining financial ledger analysis and news analysis failed to detect data discrepancies.
* **Code Generation & Debugging**: AI assisted in generating utility functions, formatting files, and identifying environment configuration issues.
* **Manual Verification**: All architectural decisions, database schemas, validation logic, and frontend integrations were manually reviewed, validated, and implemented.
* **Development Transcript**:
  [**View LLM chat transcript session logs here**](<ADD_CHAT_TRANSCRIPT_LINK>)

---

## 17. Conclusion

The AI Investment Research Agent implements a modular, evidence-first architecture that mitigates LLM hallucinations. By separating data ingestion, quantitative financial computation, qualitative sentiment analysis, and validation, the system delivers verifiable, explainable, and trace-friendly investment reports. Stateful graph orchestration ensures scalability and makes it a reliable foundation for automated equity research.
