# Legal Workflow Assistant — AI-Powered

An intelligent legal assistant for lawyers — case management, AI research, document drafting, PDF summarization, and context-aware chat.

## Tech Stack
- **Backend**: FastAPI (Python) + Motor (async MongoDB)
- **Database**: MongoDB
- **Frontend**: HTML, CSS, JavaScript
- **AI**: OpenRouter API (OpenAI-compatible)

## Setup & Run

### 1. Prerequisites
- Python 3.9+
- MongoDB running on `localhost:27017`
- OpenRouter API key ([get one here](https://openrouter.ai/keys))

### 2. Configure Environment
Edit `backend/.env` and add your OpenRouter API key:
```
OPENROUTER_API_KEY=your_key_here
```

### 3. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 4. Start the Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Open the Frontend
Open in your browser:
- **Dashboard**: http://localhost:8000/static/index.html
- **API Docs**: http://localhost:8000/docs

## Features
- **Case Management**: Create and manage cases with client info, notes, documents, and deadlines
- **AI Legal Research**: Get relevant case laws and statutes with case context
- **Document Generation**: Draft legal notices, affidavits, contracts, etc.
- **PDF Summarization**: Upload PDFs and get AI-powered summaries
- **Context-Aware Chat**: Chat with AI that understands your specific case
- **Case Preparation**: Multi-step AI analysis with strategy recommendations

## API Endpoints

### Cases
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cases` | Create case |
| GET | `/api/cases` | List cases |
| GET | `/api/cases/{id}` | Get case |
| POST | `/api/cases/{id}/notes` | Add note |
| POST | `/api/cases/{id}/deadlines` | Add deadline |
| PATCH | `/api/cases/{id}/deadlines/{did}` | Toggle deadline |
| POST | `/api/cases/{id}/upload` | Upload PDF |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/research` | Legal research |
| POST | `/api/ai/generate-document` | Generate document |
| POST | `/api/ai/summarize` | Summarize PDF |
| POST | `/api/ai/chat` | Case-aware chat |
| POST | `/api/ai/prepare-case` | Full case brief |
