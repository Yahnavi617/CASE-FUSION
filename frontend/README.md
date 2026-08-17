# CASE-FUSION

CASE-FUSION is an intelligence investigation platform that helps investigators analyze multiple datasets and identify high-priority entities connected to a case.

## Features

- Create new investigations
- Upload CDR, bank, social and entity CSV datasets
- Analyze investigation data
- Priority lead scoring
- Financial, communication, cross-source, temporal and centrality signals
- Evidence-based lead explanations
- Entity relationship network visualization
- Case evidence summary
- High, medium and low risk classification
- Investigation history and dashboard
- Export priority leads as CSV

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express
- REST API

### Scoring Engine
- Node.js
- Rule-based intelligence scoring

## Project Structure

```text
CASE-FUSION/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── backend/
│   ├── server.js
│   ├── storage/
│   └── package.json
│
└── scoring-engine/
    ├── run.js
    ├── scoringEngine.js
    └── package.json