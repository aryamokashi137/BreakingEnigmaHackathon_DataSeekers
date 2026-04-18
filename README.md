# ⚖️ AI Legal Workflow Assistant

An AI-powered legal co-pilot that helps lawyers read, understand, and research legal documents intelligently. Built as a hackathon MVP.

---

## 🧠 What It Does

Instead of manually reading through hundreds of pages, lawyers can:

- Upload case documents (PDF, DOCX, TXT)
- Ask questions and get answers grounded in the document
- Get structured summaries with one click
- Research laws, sections, and articles instantly
- Let the AI automatically decide what kind of help is needed

---

## 🚀 Features

### 1. 📚 Document Q&A (RAG)
Ask any question about uploaded documents. The system retrieves the most relevant sections and answers using Claude.

> "Who are the parties involved in this case?"
> "What evidence was submitted?"

### 2. 📄 PDF Summarization
Click **Summarize** on any document or ask in chat. Gets a structured summary:
- Overview
- Key Points
- Important Arguments
- Conclusion

### 3. 🔍 Legal Research
Ask about any law, section, article, or legal concept. The AI answers from its legal knowledge base.

> "Explain IPC Section 420"
> "What does Article 21 of the Indian Constitution say?"

### 4. 🧠 Agentic AI Router
The system automatically classifies every query using an LLM and routes it to the right capability — no manual selection needed.

```
User Query
    ↓
Claude classifies intent
    ↓
document_qa   → RAG over uploaded docs
summarize     → Structured summarization
legal_research → Legal knowledge answer
    ↓
Response with intent badge
```

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Database | MongoDB |
| Vector Store | FAISS (local) |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| LLM | Claude 3.5 Haiku via OpenRouter |
| PDF Parsing | PyMuPDF (fitz) |
| DOCX Parsing | python-docx |

---

## 📁 Project Structure

```
hackathon3/
├── backend/
│   ├── main.py            # FastAPI app + all routes
│   ├── database.py        # MongoDB connection
│   ├── models.py          # Pydantic models
│   ├── pdf_processor.py   # Text extraction + chunking
│   ├── vector_store.py    # FAISS embed + search
│   ├── ai_agent.py        # LLM calls + agentic router
│   ├── .env               # API keys (not committed)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js              # Axios API calls
    │   └── pages/
    │       ├── Cases.jsx       # Dashboard
    │       └── CaseDetail.jsx  # Workspace
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 20.19+ or 22+
- MongoDB running locally on port `27017`
- OpenRouter API key → [openrouter.ai](https://openrouter.ai)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
git checkout legal-assistant
```

---

### 2. Backend Setup

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate (PowerShell)
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
MONGO_URL=mongodb://localhost:27017
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

> Get your OpenRouter key at: https://openrouter.ai/keys

#### Start the Backend

```powershell
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`

---

### 3. Frontend Setup

```powershell
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🧪 How to Test

### Full Flow

1. Open `http://localhost:5173`
2. Click **+ Create Case** → enter a case name
3. Click on the case to open the workspace
4. Upload a PDF or DOCX file
5. Try these queries in the chat:

| Query | Expected Behavior |
|-------|------------------|
| `"What is this document about?"` | 📚 Document Q&A |
| `"Who are the parties involved?"` | 📚 Document Q&A |
| `"Summarize this document"` | 📄 Summarizer |
| `"Give me an overview"` | 📄 Summarizer |
| `"Explain IPC section 420"` | 🔍 Legal Research |
| `"What does Article 21 say?"` | 🔍 Legal Research |

6. Click the purple **📄 Summarize** button on any document for instant summary

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cases` | Create a new case |
| GET | `/cases` | List all cases |
| GET | `/cases/{id}` | Get case details |
| POST | `/upload/{case_id}` | Upload & index a document |
| GET | `/documents/{case_id}` | List documents in a case |
| DELETE | `/documents/{doc_id}` | Delete a document |
| POST | `/chat` | Send message, get AI response |
| GET | `/chat/{case_id}` | Get chat history |
| POST | `/summarize/{case_id}/{doc_name}` | Summarize a specific document |

---

## 📄 Supported File Types

| Type | Extensions |
|------|-----------|
| PDF | `.pdf` |
| Word | `.doc`, `.docx` |
| Text | `.txt` |
| Images | `.png`, `.jpg`, `.jpeg` |

> Note: Images are uploaded but not indexed for Q&A (no OCR in MVP).

---

## 🗂️ MongoDB Collections

| Collection | Fields |
|-----------|--------|
| `cases` | case_name, description, created_at |
| `documents` | case_id, filename, file_path, has_text, created_at |
| `chats` | case_id, role, message, intent, created_at |

---

## ⚠️ Known Limitations (MVP)

- No authentication or user management
- FAISS index is stored locally (not persistent across machines)
- Images are not OCR-processed
- No pagination on case/document lists

---

## 🏗️ Built With

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [MongoDB](https://www.mongodb.com/)
- [FAISS](https://github.com/facebookresearch/faiss)
- [sentence-transformers](https://www.sbert.net/)
- [OpenRouter](https://openrouter.ai/)
- [PyMuPDF](https://pymupdf.readthedocs.io/)
