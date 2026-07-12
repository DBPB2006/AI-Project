# AI Investment Research Agent

A stateful, multi-agent investment analysis system orchestrated with LangGraph that compiles financial and market research, detects discrepancies, runs verification protocols, and generates investment recommendations.

---

## 1. Overview — What it Does
The **AI Investment Research Agent** is a professional-grade research pipeline designed to automate equity analysis and mitigate AI hallucinations. It performs the following tasks:
- **Evidence Compilation**: Collects company fundamentals, financial ratios, stock quotes, analyst ratings, insider sentiment, and news items from multiple data providers (Financial Modeling Prep, Finnhub, NewsAPI).
- **Domain-Specific Analysis**: Evaluates quantitative financial health (balance sheets, profitability, growth) and qualitative market catalysts (sentiment, risks, major news topics) independently.
- **Strict Verification Layer**: Validates all generated claims against the raw evidence package. Contradictions or unsupported assumptions are flagged, graded, and pruned.
- **Recommendation Synthesis**: Synthesizes verified evidence into a final **BUY**, **HOLD**, or **PASS** recommendation with explicit confidence ratings and core thesis explanations.
- **Portfolio Personalization**: Tailors the recommendation to a user's specific risk tolerance, investment horizon, cash availability, and sector preferences (optional, only runs with user consent).

---

## 2. How to Run It — Setup and Run Steps

### Prerequisites
- **Node.js**: Version 18 or higher is recommended.
- **MongoDB**: A running local or remote MongoDB instance.
- **API Keys**: Access keys for FMP, Finnhub, NewsAPI, and Google Gemini.

### 1. Clone & Install Dependencies
First, navigate into the directory and install dependencies for both the backend server and the frontend client:

```bash
# Navigate to the workspace
cd "review 2"

# Install backend dependencies
cd server
npm install

# Install frontend client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=3300
MONGODB_URI=mongodb://localhost:27017/research_engine_db
GEMINI_API_KEY=your_gemini_api_key
FMP_API_KEY=your_fmp_api_key
FMP_API_BASE_URL=https://financialmodelingprep.com/api/v3
FINNHUB_API_KEY=your_finnhub_api_key
NEWS_API_KEY=your_news_api_key
```

### 3. Seed Mock User Profiles
Seed the database with default profiles representing different risk tolerances (Aggressive, Conservative, Moderate):
```bash
# In server directory
npm run seed:users
```

### 4. Start the Application
You can run both the server and client concurrently or in separate terminal windows:

**Start the Express Server:**
```bash
# In server directory
npm start
```

**Start the React Frontend Client:**
```bash
# In client directory
npm run dev
```

The application will be accessible locally:
- Frontend Client: `http://localhost:5173`
- Backend API Server: `http://localhost:3300`

### 5. Synchronize Company Directory (Optional)
To populate or refresh the local database search index with US stock symbols fetched from Finnhub, run:
```bash
# In server directory
npm run sync:companies
```
*To drop existing collections and perform a clean database reset before syncing:*
```bash
npm run sync:companies -- --reset
```

---

## 3. How It Works — Approach and Architecture

### Coordination and Orchestration
The system utilizes a structured, stateful orchestrator powered by **LangGraph** (`@langchain/langgraph`). Instead of chaining prompts sequentially, data is moved through deterministic graph nodes that validate inputs/outputs at each stage.

```
                                    USER
                                      │
                                      ▼
                                React Frontend
                                      │
                                      ▼
                             POST /api/analyze
                                      │
                                      ▼
                              Express Backend
                                      │
                                      ▼
                           LangGraph Orchestrator
                                      │
                                      ▼
                               Research Engine
                  (FMP & Finnhub Financials, NewsAPI & Finnhub News)
                                      │
                            Immutable Evidence Package
                                      │
                 ┌────────────────────┴────────────────────┐
                 │                                         │
                 ▼                                         ▼
      Financial Analysis Agent                 Market Analysis Agent
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      ▼
                    Evidence Validation & Risk Assessment
                                      │
                                      ▼
                        Investment Decision Agent
                                      │
                                      ▼
                  Portfolio Suitability Agent (Optional)
                                      │
                                      ▼
                         Final Investment Report
```

### Flow Node Specifications
1. **Research Node**: programmatically fetches all fundamental and sentiment data, building an immutable `Evidence Package` containing provider segments (`fmp`, `finnhub`, `newsApi`).
2. **Financial Analysis Node**: passes quantitative balance sheet, income, cash flow, and ratio datasets to the `Financial Analysis Agent` to assess leverage, efficiency, and growth.
3. **Market Analysis Node**: passes aggregated news and insider sentiment datasets to the `Market Analysis Agent` to analyze catalysts, topic sentiment, and risk trends.
4. **Validation Node**: evaluates the raw evidence package alongside the financial and market reports. The `Evidence Validation Agent` cross-checks every assertion, identifies contradictions, and rates data quality.
5. **Decision Node**: The `Investment Decision Agent` synthesizes the validated findings to form a BUY, HOLD, or PASS rating.
6. **Suitability Node (Optional)**: If the user provides a portfolio profile and consents, the `Portfolio Suitability Agent` compares the rating against portfolio limits, cash ratios, and sector exposure rules to personalize guidance.

### Company Directory Synchronization
The system includes a data sync script (`syncCompanies.js`) that pulls all active US stock symbols from Finnhub, cleans and normalizes the attributes (mapping ticker symbols to description names, setting standard country, currency, and mic values), and performs bulk upserts (`Company.bulkWrite`) into MongoDB. This creates a local, performant index of searchable tickers for the UI autocomplete query fields without incurring real-time API latency on ticker search.

---

## 4. Key Decisions & Trade-offs

### What We Chose and Why
- **LangGraph State Management**: We chose LangGraph to enforce a clean separation of duties. Traditional agents often query databases dynamically, which leads to unpredictable contexts. Isolating quantitative data collections from qualitative logic ensures consistent, repeatable reports.
- **Multi-Provider Data Alignment**: Integrating FMP, Finnhub, and NewsAPI enables the system to detect provider discrepancies (e.g. diverging EBITDA calculations) rather than trusting a single point of truth.
- **Dedicated Independent Validation Layer**: By injecting a separate Validation Agent before the final decision node, we establish a formal audit gate. The agent strictly acts as an auditor, preventing raw AI hallucinations from leaking into final portfolio recommendations.
- **Unified Gemini AI Model Integration**: Standardizing on Google Gemini Pro across all prompted nodes ensures prompt formatting compatibility, low latency, and highly efficient token consumption.

### What We Left Out (Trade-offs)
- **Real-Time Data Feeds**: We opted for RESTful polling rather than WebSocket connections to gather data. While streaming data would allow sub-second price tracking, polling significantly simplified graph state coordination and database storage requirements.
- **Granular Tax-Loss Harvesting Logic**: The Portfolio Suitability node focuses on asset allocation, risk matching, and sector drift. We chose to leave out granular tax-lot and cost-basis analysis to focus our development effort on mitigating LLM data hallucinations.

---

## 5. Example Runs

### Example 1: Apple Inc. (AAPL)
- **Recommendation**: `BUY`
- **Confidence Rating**: `High`
- **Audit Quality Rating**: `Excellent`
- **Thesis**: Apple demonstrates outstanding financial durability, characterized by consistent operating margins (>30%) and capital efficiency (ROE > 150%). Substantial services revenue offsets hardware replacement cycles.
- **Provider Discrepancy Found**: FMP and Finnhub reported slight differences in total debt values for Q1; the Validation Agent flagged the discrepancy and defaulted to FMP's audited 10-Q numbers for leverage metrics.
- **Personalized Fit (Moderate Profile)**: `SUITABLE`. Aligns with the 5+ years horizon. Recommend limited size positioning to maintain technology sector cap thresholds.

### Example 2: Tesla, Inc. (TSLA)
- **Recommendation**: `HOLD`
- **Confidence Rating**: `Medium`
- **Audit Quality Rating**: `Good`
- **Thesis**: Tesla exhibits strong market capitalization, but near-term pressure on automotive gross margins (excluding credits) warrants caution. Market catalysts surrounding autonomous driving represent high upside, but regulatory risks are elevated.
- **Provider Discrepancy Found**: None. News coverage volume matched perfectly across NewsAPI and Finnhub feeds.
- **Personalized Fit (Conservative Profile)**: `UNSUITABLE` (Conflict). High beta (volatility) conflicts with user's capital preservation priority.

---

## 6. What We Would Improve with More Time
- **SEC EDGAR Filing Parser**: Integrate a custom parsing agent to pull directly from SEC 10-K/10-Q PDF documents, bypassing API aggregators entirely for historical financial reporting.
- **Human-in-the-Loop Node**: Introduce a manual review checkpoint within the LangGraph state flow to let analysts annotate or correct validation reports before recommendation generation.
- **Historical Backtesting Simulation**: Develop a tool to simulate the performance of agent recommendations over 5-year windows, providing quantitative tracking of the agent's historical recommendations.
