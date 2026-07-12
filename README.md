# AI Investment Research Agent — Engineering Design Document

---

# Submission Information

* **Project Name**: AI Investment Research Agent
* **Live Application (Frontend)**: [https://ai-project-eight-psi.vercel.app/](https://ai-project-eight-psi.vercel.app/)
* **Live Application (Backend API)**: [https://ai-project-fl7o.onrender.com/](https://ai-project-fl7o.onrender.com/)
* **Repository**: `https://github.com/DBPB2006/AI-Project.git`

### Evaluation Methods
Reviewers can evaluate this project in one of two ways:
1. **Live Deployed Application**: Navigate to the live Vercel URL above to interact with the application immediately (no API keys or environment configurations required).
2. **Local Execution from ZIP**: Extract the submitted ZIP file archive and execute the project locally by following the detailed setup instructions below.

---

# Live Demo
The application is fully deployed and configured on production cloud infrastructure:
* **Frontend Client (Vercel)**: [https://ai-project-eight-psi.vercel.app/](https://ai-project-eight-psi.vercel.app/)
* **Backend API Server (Render)**: [https://ai-project-fl7o.onrender.com/](https://ai-project-fl7o.onrender.com/)
* **Database (MongoDB Atlas)**: Managed document cluster with global network access rules.

*Note: The deployed version is connected to our active market data and LLM pipelines, so you do not need to configure any environment variables, databases, or API keys to test it.*

---

## 1. Project Overview

### Problem Statement
Standard Large Language Models (LLMs) are highly unreliable when used directly for equity research or investment analysis. Because monolithic LLMs generate outputs based on next-token probability distributions rather than strict deterministic logic, they suffer from three key deficiencies:
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

## 2. Why a Multi-Agent Architecture?

In traditional single-prompt LLM applications, a single model call is expected to manage data collection, financial reasoning, market sentiment analysis, fact validation, and final recommendations in one execution block. This monolithic approach inevitably leads to reasoning breakdowns, context-window saturation, and unconstrained hallucinations. 

This project deliberately separates these responsibilities into independent **LangGraph agents**. 
* **Single Responsibility**: Each agent has one well-defined task and a specialized system prompt.
* **Bounded Evidence Context**: Rather than exposing all collected files to all agents, each agent works only with the specific subsets of the `Evidence Package` required for its core task.
* **Traceable Audits**: Isolating components allows each step's output to be logged, analyzed, and validated independently.

This architectural decoupling delivers substantial improvements across key engineering dimensions:
* **Explainability**: The final investment thesis is built from explicit, separate reports.
* **Traceability**: Every output metric can be tracked back to the specific raw API response.
* **Modularity**: Individual agents can be updated, tweaked, or swapped (e.g., using a different model or prompt) without affecting the rest of the system.
* **Hallucination Mitigation**: Constraining model scope keeps the focus narrow, reducing error rates.
* **Maintainability**: Bugs can be isolated to a single node within the state graph.

---

## 3. Features

* **Multi-Provider Financial Research**: Automatically fetches balance sheets, income statements, cash flow metrics, and valuation ratios from Financial Modeling Prep (FMP) and Finnhub.
* **Multi-Provider Market Research**: Integrates Finnhub quotes, stock pricing bands, and NewsAPI articles to capture market trends and sentiment.
* **Evidence Aggregation**: Consolidates raw provider payloads into a single, immutable `Evidence Package` locked within the graph state.
* **Provider Discrepancy Detection**: Dynamically compares overlapping data fields between FMP and Finnhub to identify reporting variances.
* **Financial Health Analysis**: Quantitative evaluations of leverage, operating margin durability, and dividend coverages.
* **Market Catalyst Analysis**: Qualitative extraction of operational risks, regulatory shifts, and topic trends.
* **Independent Evidence Validation**: An auditing layer that compares generated reports with the raw evidence package, flags contradictions, and calculates a data confidence rating.
* **Explainable BUY / HOLD / PASS Recommendation**: Synthesizes verified data points into a final recommendation backed by a logical core thesis.
* **Portfolio-Aware Recommendations**: Customizes general verdicts against user-defined risk profiles, cash constraints, and sector restriction preferences (requires explicit user consent).
* **Research History**: Keeps a history of generated analyses in MongoDB Atlas, allowing users to review past reports.
* **Dynamic AI Reports**: A multi-tab dashboard presenting metric tables, news sentiment scores, audit validation flags, and personalized suitability metrics.
* **Modular LangGraph Workflow**: A stateful graph representation of the multi-agent pipeline allowing conditional routes and execution validation at node boundaries.

---

# Project Structure
The code is divided into two primary subdirectories containing the frontend client and backend server respectively:

### Core File Structure Map
```
review 2/
├── client/                     # Frontend React SPA (Vite)
│   ├── src/
│   │   ├── components/         # Global shared layouts, Navbar, ProtectedRoute
│   │   ├── context/            # AuthContext managing user session hooks
│   │   ├── pages/              # Main view files (Home, Portfolio, History, Report, Login)
│   │   ├── services/           # Api service wrappers
│   │   └── main.jsx            # Entry script loading Styles and Routes
│   ├── index.html              # HTML shell loading custom fonts
│   └── vite.config.js          # Build target configurations
└── server/                     # Backend API & Orchestration Engine
    ├── agents/                 # Agent prompt definitions and graph mappings
    ├── controllers/            # Express controllers handling users and history
    ├── graph/                  # LangGraph nodes and execution graph workflows
    ├── middleware/             # Route validators and JWT authorization filters
    ├── models/                 # Mongoose database models (User, Company, Analysis)
    ├── routes/                 # Express REST endpoint maps
    ├── scripts/                # Database seeders and Finnhub stock sync tasks
    ├── utils/                  # Presentation data builder utilities
    ├── server.js               # Entry script connecting DB and loading server listener
    └── package.json            # Script definitions and package locks
```

---

## 4. Architecture

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
* **Single Responsibility Nodes**: Every node within the LangGraph orchestrator has a single, well-defined function.
* **State-Based Communication**: Nodes communicate exclusively through a shared graph state. No direct parent-child function calls occur between nodes.
* **No Direct Agent API Access**: AI agents never call external APIs directly. Only the programmatic Research Engine interacts with providers, populating the `Evidence Package` in the graph state.
* **Clean Ingestion Boundary**: Later agents consume only the generated `Evidence Package`, ensuring they operate on static, locked inputs that cannot shift mid-workflow.

---

## 5. Why This Architecture?

We chose this modular, multi-agent architecture to enforce data integrity, trace reasoning, and prevent model hallucinations.

### Research Engine
* **Responsibilities**: Gathers raw fundamentals, price data, and news from external APIs; packages them into a static `Evidence Package`.
* **Why**: By keeping this node purely programmatic and free of LLM reasoning, we guarantee that the baseline datasets represent authentic provider records, completely eliminating ingest-stage hallucinations.

### Financial Analysis Agent
* **Responsibilities**: Evaluates balance sheets, income statements, cash flows, and valuation metrics.
* **Why**: Restricting this agent's scope strictly to financial metrics prevents qualitative news hype or general market momentum from biasing quantitative health calculations.

### Market Analysis Agent
* **Responsibilities**: Analyzes news arrays, analyst ratings, and insider transactions to extract risk catalysts.
* **Why**: Qualitative factors are inherently subjective. Isolating this analysis ensures that volatile public sentiment does not skew fundamental balance sheet metrics.

### Evidence Validation Agent
* **Responsibilities**: Cross-checks every statement generated by the Financial and Market agents against the raw `Evidence Package`. Identifies data discrepancies, notes unsupported claims, and calculates a confidence score.
* **Why**: This is the key architectural gate. The system does not allow recommendations to rely directly on raw agent outputs. By injecting an independent audit layer, the final recommendation is based only on verified facts.

### Investment Decision Agent
* **Responsibilities**: Synthesizes the validated reports and audit flags into a final recommendation (BUY, HOLD, PASS).
* **Why**: Decoupling synthesis from analysis ensures the decision model is not overwhelmed by raw datasets, keeping its focus on logical verdict generation.

### Portfolio Suitability Agent
* **Responsibilities**: Evaluates recommendations against the user's risk tolerance, horizon, and sector rules.
* **Why**: Runs conditionally only when user consent and portfolio settings are provided. Personalization is isolated from baseline stock valuation so that portfolio-specific rules do not bias the objective stock rating.

### Presentation Builder
* **Responsibilities**: Maps the raw graph state into structured display models; performs zero financial reasoning or AI processing.
* **Why**: Decoupling the frontend display contract from the agent states keeps the orchestrator's data structure lightweight and robust.

### React Frontend
* **Responsibilities**: Provides the UI interface; performs zero business logic, AI reasoning, or investment calculations.
* **Why**: Treating React as a pure presentation layer ensures that all execution, validation, and calculations remain secure and repeatable on the backend.

---

## 6. Complete Workflow

The workflow executes in a strict, step-by-step pipeline:

```
[User Request] ➔ [Backend Gateway] ➔ [Research Engine Ingest] ➔ [Parallel Analysis] ➔ [Audit Validation] ➔ [Decision Synthesis] ➔ [Portfolio Screening] ➔ [Presentation Builder] ➔ [Frontend UI Render]
```

1. **User Request**: The user enters a stock symbol on the React client.
2. **Backend Gateway**: Express receives the request at `/api/analyze` and checks user authentication.
3. **Research Engine Ingest**: LangGraph starts. Node 1 programmatically queries FMP, Finnhub, and NewsAPI, saving the inputs into the shared state as the `Evidence Package`.
4. **Parallel Analysis**: The graph branches into the Financial and Market nodes, executing both analysis agents concurrently.
5. **Audit Validation**: The Validation node audits the generated claims against the raw evidence data, outputting an audit log.
6. **Decision Synthesis**: The Investment Decision node reads the validated reports and assigns a rating and thesis.
7. **Portfolio Screening**: If profile settings and consent are present, the Suitability node checks the rating against portfolio rules.
8. **Presentation Builder**: The backend presentation utility formats the final state.
9. **Frontend UI Render**: React renders the structured metrics, audit reports, and investment thesis.

---

## 7. Data Sources

| Source | Purpose | Why It Was Chosen |
| :--- | :--- | :--- |
| **Financial Modeling Prep (FMP)** | Standardized Financial Data | Provides standardized, audited SEC filing extractions, income statements, balance sheets, and key ratios. |
| **Finnhub** | Market Metadata Feed | Ingests stock quotes, analyst targets, insider sentiment, and US exchange symbols. |
| **NewsAPI** | Broad News Aggregator | Gathers market articles to evaluate news sentiment and industry shifts. |
| **Google Gemini (Gemini Pro)** | Core Reasoning Engine | Selected for its strong reasoning capabilities, structured output compliance, low latency, and large context window. |
| **MongoDB Atlas** | Document Datastore | A document store is ideal for storing unstructured news arrays, nested ratios, and JSON report states. |

*Why multiple providers improve evidence quality*: Relying on a single provider introduces risk. Gathers duplicate fields (like news and profiles) from different APIs to identify data gaps. Comparing overlapping fields between FMP and Finnhub allows the Validation Agent to flag reporting discrepancies (such as differing calculations of debt or cash flow) before making an investment decision.

---

## 8. Hallucination Mitigation

Our anti-hallucination design works across all layers:
* **Research Layer**: Decoupled from LLM inference. Ingests raw data programmatically to ensure a reliable foundation.
* **Financial Layer**: Restricts model context strictly to financial statements, preventing qualitative sentiment from biasing calculations.
* **Market Layer**: Confines LLM reasoning to news arrays and target rates, preventing the model from hallucinating broader corporate statistics.
* **Validation Layer**: Cross-references every report statistic against the `Evidence Package`. Unsupported claims are flagged and pruned.
* **Decision Layer**: Bases its thesis only on validated data points, ensuring no unverified assumptions impact the final recommendation.
* **Portfolio Layer**: Keeps portfolio checks separate from stock analysis, preventing subjective variables from biasing the objective valuation of the stock.
* **Presentation Layer**: Performs zero reasoning. Uses structured schema mapping to protect data integrity.

---

# API Endpoints
The backend server exposes the following endpoints for client authentication, company directories, and graph execution:

### Auth Endpoints (`/api/auth`)
* `POST /api/auth/register`: Create user profiles. Expects `{ name, email, password, consent }`. Returns a JWT token and user info payload.
* `POST /api/auth/login`: Authenticate users. Expects `{ email, password, consent }`. Returns session tokens and user state.
* `GET /api/auth/me`: Retrieve authorization status and profile preferences (requires Bearer JWT authorization).
* `PUT /api/auth/profile`: Update investment preferences (avoided sectors, risk profiles) (requires Bearer JWT authorization).

### Company Endpoints (`/api/companies`)
* `GET /api/companies/search?q=...`: Search company indices. Queries the autocomplete index in MongoDB and returns matching stocks.

### Analyze Endpoints (`/api/analyze`)
* `POST /api/analyze`: Trigger research. Runs the complete multi-agent LangGraph workflow. Returns the generated report with quantitative tables, audit validation flags, and personalized suitability thesis.

### History Endpoints (`/api/history`)
* `GET /api/history`: Retrieve saved analysis history (requires Bearer JWT authorization).
* `DELETE /api/history/:id`: Delete a saved analysis report from research history (requires Bearer JWT authorization).

---

## 9. Engineering Decisions

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

## 10. Technology Stack

* **React**: Component-driven frontend architecture, ideal for rendering a dynamic, multi-tab dashboard.
* **Node.js & Express**: Lightweight backend API gateway that manages routing, auth, and database writes.
* **MongoDB Atlas**: Document database that natively stores unstructured news arrays, nested ratios, and JSON report states.
* **LangGraph.js**: Graph orchestration engine that coordinates the multi-agent workflow.
* **Google Gemini (Gemini Pro)**: Core LLM that offers strong reasoning, low latency, and structured JSON output compliance.
* **Financial Modeling Prep (FMP) API**: Standardized financial data feed.
* **Finnhub API**: Real-time stock quotes and market metadata.
* **NewsAPI**: Macro financial news aggregator.

---

# Setup & Run Instructions (Local Execution from ZIP)

Follow these steps to configure, seed, and execute the project locally on your machine.

### Step 1: Extract the ZIP Archive
Extract the project ZIP file to a workspace folder.
```bash
unzip review_2.zip
cd "review 2"
```

### Step 2: Open Two Terminals and Install Dependencies
Open two separate terminal windows (one for the backend API server and one for the frontend client) and run the installer:

**Terminal 1 (Backend Server Setup):**
```bash
cd server
npm install
```

**Terminal 2 (Frontend Client Setup):**
```bash
cd client
npm install
```

### Step 3: Create MongoDB Atlas Cluster
To run the database:
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and deploy a free M0 Shared Cluster.
2. In the "Database Access" section, create a database user and record the username and password.
3. In the "Network Access" section, select "Add IP Address" and choose "Allow Access from Anywhere" (`0.0.0.0/0`) or add your local IP.
4. Go to your clusters view, select "Connect", choose "Drivers", and copy the connection string. Replace the username and password placeholders with your credentials.

### Step 4: Configure Backend Environment Variables
Create a file named `.env` in the `server/` directory:
```env
PORT=3300
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/evidenceai?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key
FMP_API_KEY=your_fmp_api_key
FMP_API_BASE_URL=https://financialmodelingprep.com/api/v3
FINNHUB_API_KEY=your_finnhub_api_key
NEWS_API_KEY=your_news_api_key
CLIENT_URL=http://localhost:5173
```
* **PORT**: The network port where the Express server listens for API requests.
* **MONGODB_URI**: Connection string containing credentials to authenticate with MongoDB Atlas.
* **GEMINI_API_KEY**: Google Cloud credentials consumed by Gemini Pro for LangGraph agent node calls.
* **FMP_API_KEY**: API key used by the Research Engine to pull income statements and key financials.
* **FINNHUB_API_KEY**: API key used by the Research Engine to fetch stock quotes and insider sentiment.
* **NEWS_API_KEY**: API key used by the Research Engine to query NewsAPI articles.
* **CLIENT_URL**: Origin URL allowed by backend CORS configurations.

### Step 5: Configure Frontend Environment Variables
Create a file named `.env` in the `client/` directory:
```env
VITE_API_URL=http://localhost:3300
```
* **VITE_API_URL**: The backend API endpoint consumed by the React app's API client.

### Step 6: Seed Default Users and Sync Companies
Run the seed scripts to populate database records before starting:

**Seed default user risk profiles:**
```bash
# In server directory
npm run seed:users
```

**Fetch and index stock listings from Finnhub:**
```bash
# In server directory
npm run sync:companies
```
*This fetches active US tickers and indexes them in MongoDB to support autocomplete search in the UI.*

### Step 7: Launch the Applications
**Start Backend API Server (Terminal 1):**
```bash
# In server directory
npm start
```
*Expected Console Output:*
`◇ injected env (8) from .env`
`Server is running on port 3300`
`Connected to MongoDB`

**Start React Frontend (Terminal 2):**
```bash
# In client directory
npm run dev
```
Open your browser to `http://localhost:5173` to interact with the application.

---

# Production Deployment & Environment Sync

The production version of the project is deployed using the following services:
* **Frontend App (Vercel)**: Automatically deploys the `client` directory using production configurations.
* **Backend Server API (Render)**: Automatically builds the `server` directory and starts `node server.js`.
* **Database (MongoDB Atlas)**: Dedicated cloud cluster.

### Configuration Reminders for Production:
1. **Frontend**: Make sure `VITE_API_URL` on Vercel is set to your live Render API server URL.
2. **Backend**: Make sure `CLIENT_URL` on Render matches your live Vercel URL, and verify that the backend's CORS policies allow origin access.
3. **Database Network Rules**: Verify that MongoDB Atlas allows network connections from Render's outbound IP ranges.

---

## 11. Example Research Outputs

*Note: The recommendations shown below are example outputs generated during testing and may change as market data changes.*

### Example Case 1: Ticker `AAPL`
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

### Example Case 2: Ticker `TSLA`
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

The application was validated manually using a variety of test cases:
* **Multiple Companies**: Manually tested across different market caps and sectors (e.g., tech, auto) to verify agent adaptability.
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

# Notes for Reviewers

* **Live Evaluation (Recommended)**: The easiest way to review this project is to navigate to (https://ai-project-eight-psi.vercel.app/) and sign in.
* **Local Evaluation**: If you prefer to inspect the source code locally, please follow the steps in the setup guide:
  1. Extract the submission ZIP file.
  2. Configure `.env` files in both the `server/` and `client/` directories.
  3. Execute `npm run sync:companies` to index search fields.
  4. Boot the server and dev client.

---


## 14. Conclusion

The AI Investment Research Agent demonstrates a modular, evidence-first AI architecture that mitigates LLM hallucinations. By separating data ingestion, quantitative financial computation, qualitative sentiment analysis, and validation, the system delivers verifiable, explainable, and trace-friendly investment reports. Stateful graph orchestration ensures scalability and makes it a reliable foundation for automated equity research.
