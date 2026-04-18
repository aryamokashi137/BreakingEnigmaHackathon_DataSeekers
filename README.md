# LegalAI — AI-Powered Legal Workflow Agent

An intelligent legal assistant for law professionals — case management, isolated AI research, document drafting, PDF summarization, and context-aware chat.

## 🚀 Recent Updates: React Transformation & Advanced RAG
We have merged the **Advanced RAG Pipeline** with our **Premium React Frontend**.
- **Case Dashboard**: Modern analytics and case tracking.
- **Hierarchical Document Chat**: Chat directly with client documents with legal isolation.
- **Advanced RAG (Merged)**: LangGraph-powered document processing and search.
- **CanLII Integration**: Research across the Canadian Legal Information Institute database.

## 🛠️ Tech Stack
- **Backend**: FastAPI (Python) + Motor (async MongoDB)
- **Database**: MongoDB (Local or Atlas) + Vector Store
- **Frontend**: React.js + Vite + Framer Motion + Lucide Icons
- **AI Engine**: OpenRouter API (OpenAI-compatible)

## 📦 Setup & Installation

### 1. Prerequisites
- Python 3.9+
- Node.js 18+ (for Frontend)
- MongoDB running on `localhost:27017`
- OpenRouter API key ([get one here](https://openrouter.ai/keys))

### 2. Backend Setup
1.  **Configure Environment**: Edit `backend/.env` and add your OpenRouter API key:
    ```env
    OPENROUTER_API_KEY=your_key_here
    ```
2.  **Install Dependencies**:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```
3.  **Start Backend**:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

### 3. Frontend Setup
1.  **Install Dependencies**:
    ```bash
    cd frontend
    npm install
    ```
2.  **Start Dev Server**:
    ```bash
    npm run dev
    ```

## ✨ Key Features
- **Hierarchical Document AI**: Chat with isolated document sets for specific clients.
- **CanLII Legal Research**: Specialized tools for Canadian legal precedents.
- **Automated Drafting**: Draft invitations, contracts, and petitions with AI.
- **Advanced RAG Pipeline**: Intelligent document retrieval and summarization.

---
> [!IMPORTANT]
> **Data Privacy**: The AI chat retrieves context ONLY from documents tagged with the current `case_id`, ensuring client data privacy and professional confidentiality.
