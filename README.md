# AI Investment Research Agent

## 1. Project Overview

The AI Investment Research Agent is a multi-agent investment analysis system that researches a publicly traded company, gathers financial and market evidence from multiple independent providers, validates AI-generated conclusions against the original evidence, and produces an explainable BUY, HOLD, or PASS recommendation. The system is designed to reduce hallucinations by separating data collection, analysis, validation, and decision-making into specialized AI agents coordinated using LangGraph.

---

## 2. Features

✔ Multi-provider financial research  
✔ Multi-provider news aggregation  
✔ Financial comparison across providers  
✔ Evidence validation layer  
✔ Explainable investment recommendation  
✔ Portfolio personalization (optional)  
✔ Hallucination mitigation  
✔ Modular LangGraph workflow  

---

## 3. Architecture Diagram

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
                           Original Evidence Package
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
                         Final Investment Research Report
```

---

## 4. Why this Architecture?

### Research Engine
* **Responsibilities**
  * Collect data only
  * No AI reasoning
  * Normalize multiple providers (FMP, Finnhub, NewsAPI)
  * Build an immutable Evidence Package
* **Why?**
  * Separating data collection from reasoning ensures that every AI agent receives the same trusted evidence instead of independently calling external APIs or fabricating data.

### Financial Analysis Agent
* **Responsibilities**
  * Analyze fundamentals and financial ratios
  * Compare FMP vs Finnhub data points
  * Preserve unique provider information
* **Why?**
  * Financial reasoning is isolated from market sentiment, preventing news hype or sentiment bias from influencing quantitative financial analysis.

### Market Analysis Agent
* **Responsibilities**
  * Merge news from multiple sources
  * Remove duplicates
  * Detect sentiment trends
  * Identify potential market catalysts
  * Identify external and market risks
* **Why?**
  * Market events and financial statements belong to different analytical domains and should be evaluated independently.

### Evidence Validation Agent
* **Responsibilities**
  * Receives:
    * Original Evidence Package
    * Financial Report
    * Market Report
  * Verify claims against raw facts
  * Detect hallucinations and unsupported statements
  * Detect provider discrepancies
  * Assess evidence quality
  * Generate trusted, validated knowledge
* **Why?**
  * Instead of trusting a single AI response, every generated conclusion is validated against the original evidence before it is allowed to influence the final investment recommendation. This verification layer is the core differentiator of this architecture.

### Investment Decision Agent
* **Responsibilities**
  * It is NOT:
    * A Financial Analyst
    * A Market Analyst
    * A Validator
  * Instead, it synthesizes validated knowledge into an explainable **BUY**, **HOLD**, or **PASS** decision with explicit confidence scoring and risk weighting.

### Portfolio Suitability Agent
* **Responsibilities**
  * Runs only when:
    * User consents
    * Portfolio profile exists
  * Otherwise cleanly skipped
* **Why?**
  * Preserves objective asset analysis separate from individual investor constraints, tailoring recommendations only when context is provided.

---

## 5. Data Sources

| Provider | Purpose |
| :--- | :--- |
| **FMP** | Financial statements, financial ratios, company profile, historical prices |
| **Finnhub** | Real-time quote, analyst recommendations, insider sentiment, company news |
| **NewsAPI** | Company news aggregation |
| **Gemini** | AI reasoning across specialized LangGraph nodes |

---

## 6. Hallucination Mitigation

The system implements a multi-layered engineering defense against AI hallucinations:

* **Research Layer**: Pure programmatic data collection and normalization with zero AI reasoning.
* **Financial Layer**: Uses strictly quantitative financial evidence from normalized provider packages.
* **Market Layer**: Uses only gathered news articles and sentiment indicators.
* **Validation Layer**: Checks every AI-generated claim against the original factual evidence package; flags or discards unsupported statements.
* **Decision Layer**: Uses only validated conclusions to derive the investment verdict.
* **Portfolio Layer**: Personalizes only after an objective investment decision has been finalized.

---

## 7. Workflow

```
Company Ticker
     ↓
Research Engine
     ↓
Evidence Package
     ↓
Financial Agent & Market Agent
     ↓
Validation Layer
     ↓
Decision Agent
     ↓
Portfolio Suitability (Optional)
     ↓
Final Investment Research Report
```

---

## 8. Tech Stack

* **Frontend**: React 19, Vite, Tailwind CSS 4, Redux Toolkit, Lucide Icons
* **Backend**: Node.js, Express 5
* **AI Orchestration**: LangGraph (`@langchain/langgraph`), LangChain Core
* **LLM**: Google Gemini (`@google/genai`)
* **Database**: MongoDB (Mongoose 9)
* **APIs**: Financial Modeling Prep (FMP), Finnhub, NewsAPI

---

## 9. Running the Project

### 1. Clone the repository
```bash
git clone <repository-url>
cd "review 2"
```

### 2. Install Dependencies
```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 3. Environment Variables (`server/.env`)
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

### 4. Start MongoDB
Ensure your local MongoDB server is running:
```bash
mongod
```

### 5. Start the Server
```bash
cd server
node server.js
```
*(Optional: Sync company ticker data)*
```bash
npm run sync:companies
```

### 6. Start the Client Frontend
```bash
cd client
npm run dev
```

---

## 10. Example Output

```json
{
  "ticker": "AAPL",
  "recommendation": "BUY",
  "confidenceScore": 85,
  "investmentThesis": "Apple exhibits robust free cash flow generation and high return on equity, supported by strong ecosystem retention and services revenue growth.",
  "strengths": [
    "Consistent revenue and EPS growth across core segments",
    "Strong balance sheet with substantial liquidity buffer",
    "High institutional confidence and positive analyst revisions"
  ],
  "risks": [
    "Hardware replacement cycle elongation in key consumer markets",
    "Regulatory scrutiny surrounding App Store policies"
  ],
  "watchItems": [
    "Upcoming quarterly Services margin expansion report",
    "AI feature rollout adoption metrics across iOS devices"
  ],
  "portfolioRecommendation": {
    "suitability": "SUITABLE",
    "reasoning": "Fits well within a balanced growth portfolio; current portfolio exposure to mega-cap tech remains within target thresholds."
  }
}
```

---

## 11. Testing

The repository includes modular scripts and verification suites:
* **Research Engine tests**: Validates multi-provider data fetching and normalization (`server/scripts/testPipeline.js`).
* **Financial Agent tests**: Verifies quantitative analysis and FMP/Finnhub comparison logic.
* **Market Agent tests**: Verifies news deduplication and sentiment extraction.
* **Validation tests**: Ensures unsupported claims and discrepancies are flagged properly.
* **Decision tests**: Confirms deterministic BUY/HOLD/PASS synthesis from validated facts.
* **End-to-End pipeline tests**: Exercises the complete LangGraph workflow (`server/scripts/testLangGraph.js`).

---

## 12. Future Improvements

* **User authentication**: Secure JWT-based auth and multi-user sessions.
* **Portfolio management**: Comprehensive asset tracking, cost-basis calculation, and transaction history.
* **Consent-based personalization**: Granular user controls for risk tolerance and sector preferences.
* **Watchlists**: Persistent ticker monitoring with scheduled background research runs.
* **Portfolio rebalancing**: Automated asset allocation drift alerts and rebalancing suggestions.
* **Real-time alerts**: Webhook or email notifications triggered by critical sentiment or fundamental shifts.
* **More providers**: Integration with SEC EDGAR filings and macroeconomic data providers.
* **Explainable charts**: Interactive visualizations mapping financial metrics alongside historical events.

---

## 13. Design Decisions

### Why LangGraph?
LangGraph provides stateful, graph-based orchestration with explicit control over data flow. Unlike linear chains, LangGraph allows conditional routing (such as skipping the optional Portfolio Suitability node when no portfolio context is provided) while maintaining immutable state propagation across nodes.

### Why multiple providers?
Relying on a single financial data API creates single points of failure and risks incomplete data. Integrating FMP, Finnhub, and NewsAPI allows cross-provider verification and ensures comprehensive fundamental and market coverage.

### Why validation?
LLMs are prone to hallucinating numbers or misattributing causality between news headlines and financial performance. Introducing a dedicated Evidence Validation Agent creates an independent auditing step that checks every generated statement against raw data before any decision is made.

### Why only one LLM?
Using a single high-capability LLM (Google Gemini Pro) across distinct role-prompted nodes simplifies system architecture, avoids model compatibility quirks, and guarantees consistent analytical depth across all graph nodes.

### Why optional portfolio?
Investment analysis should first establish an objective, unbiased valuation of the asset. Personalization (portfolio fit, risk tolerance, diversification constraints) should only be applied as a separate post-processing layer when explicitly consented to by the user.
