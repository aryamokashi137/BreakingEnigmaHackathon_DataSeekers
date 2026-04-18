import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Send, 
  Bot, 
  Paperclip, 
  Download,
  MoreHorizontal,
  Plus,
  Loader2,
  Sparkles,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  loadCase, 
  askQuestion, 
  setLegalReferences, 
  getDocuments, 
  uploadDocument, 
  getChatHistory,
  deleteDocument
} from '../api';

const CaseDetails = () => {
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [caseInfo, setCaseInfo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [chat, setChat] = useState([]);
  const [error, setError] = useState('');

  const refreshData = async () => {
    try {
      const [docsRes, historyRes] = await Promise.all([
        getDocuments(),
        getChatHistory()
      ]);
      
      if (docsRes.success) setDocuments(docsRes.documents);
      if (historyRes.success) {
        const history = historyRes.history.map(h => ([
          { role: 'user', content: h.question },
          { role: 'assistant', content: h.answer }
        ])).flat();
        setChat(history.length > 0 ? history : [{ role: 'assistant', content: "Hello! How can I help with this case today?" }]);
      }
    } catch (err) {
      console.error("Failed to refresh case data:", err);
    }
  };

  useEffect(() => {
    const initCase = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await loadCase(id, ""); 
        if (result.success) {
          setCaseInfo(result.case);
          await refreshData();
        }
      } catch (err) {
        setError("Connection failed. Ensure the backend is running.");
        // Demo fallback
        setCaseInfo({ name: 'Case Preview', client: 'John Doe', case_status: 'Demo Mode' });
      } finally {
        setIsLoading(false);
      }
    };
    initCase();
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    const userMessage = message;
    setChat(prev => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsSending(true);

    try {
      const result = await askQuestion(userMessage);
      if (result.success) {
        setChat(prev => [...prev, { role: 'assistant', content: result.answer }]);
        if (result.new_advice) {
          setChat(prev => [...prev, { role: 'assistant', content: `💡 Proactive Insight: ${result.new_advice}`, isAdvice: true }]);
        }
      }
    } catch (err) {
      setChat(prev => [...prev, { role: 'assistant', content: "Error connecting to AI. Please check backend." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('files', file);

    try {
      const result = await uploadDocument(formData);
      if (result.success) {
        await refreshData();
      }
    } catch (err) {
      alert("Upload failed. Unsupported file type or connection error.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    try {
      const res = await deleteDocument(docId);
      if (res.success) await refreshData();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const handleRunResearch = async () => {
    setChat(prev => [...prev, { role: 'assistant', content: "🔍 Initiating deep legal research via CanLII..." }]);
    try {
      const res = await setLegalReferences();
      if (res.success) {
        setChat(prev => [...prev, { role: 'assistant', content: "✅ Research complete. Legal references have been indexed for this case." }]);
      }
    } catch (err) {
      setChat(prev => [...prev, { role: 'assistant', content: "❌ Research failed. Check internet connection." }]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-muted font-bold">Synchronizing with RAG Backend...</p>
      </div>
    );
  }

  return (
    <div className="case-details-page animate-fade-in">
      {error && (
        <div className="status-alert glass warning mb-1">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <header className="page-header">
        <div className="header-left">
          <Link to="/cases" className="btn-back">
            <ArrowLeft size={20} />
          </Link>
          <div className="title-group">
            <div className="case-meta">Case #{id.substring(0, 8)} • {caseInfo?.client_id || "Active Case"}</div>
            <h1 className="page-title">{caseInfo?.name || "Legal Case"}</h1>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleRunResearch}>
            <Sparkles size={18} /> Run AI Research
          </button>
          <button className="btn-primary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            <span>{isUploading ? 'Uploading...' : 'Add Document'}</span>
          </button>
          <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept=".pdf,.txt,.doc,.docx" />
        </div>
      </header>

      <div className="case-grid">
        <div className="case-main-content">
          <div className="tabs">
            <button className={`tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
              Documents ({documents.length})
            </button>
            <button className={`tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
              Case Context
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'documents' && (
              <div className="docs-list">
                {documents.length > 0 ? (
                  documents.map(doc => (
                    <motion.div layout key={doc.id} className="doc-card glass">
                      <div className="doc-info">
                        <div className="doc-icon"><FileText size={20} /></div>
                        <div>
                          <div className="doc-name">{doc.title || doc.source_name}</div>
                          <div className="doc-meta">{new Date(doc.uploaded_at).toLocaleDateString()} • {doc.language || 'English'}</div>
                        </div>
                      </div>
                      <div className="doc-actions">
                        <button className="icon-button" onClick={() => handleDeleteDoc(doc.id)}><Trash2 size={18} className="text-danger" /></button>
                        <button className="icon-button"><Download size={18} /></button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="empty-docs glass">
                    <FileText size={48} className="text-muted" />
                    <p>No documents uploaded yet. Add PDFs to begin RAG analysis.</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'notes' && (
              <div className="notes-container glass p-2">
                <h3>Case Summary</h3>
                <p className="whitespace-pre-wrap mt-1">{caseInfo?.notes || "No additional notes provided for this case."}</p>
                <div className="meta-info mt-2 pt-2 border-t">
                  <p><strong>Jurisdiction:</strong> {caseInfo?.jurisdiction_code}</p>
                  <p><strong>Status:</strong> {caseInfo?.case_status || 'Open'}</p>
                  <p><strong>Type:</strong> {caseInfo?.case_type || 'Legal Matter'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="case-ai-sidebar glass">
          <div className="ai-chat-header">
            <Bot size={20} className="ai-icon" />
            <div className="flex-1">
              <h3>Legal AI Assistant</h3>
              <span className="text-xs text-success flex items-center gap-0.5"><CheckCircle size={10} /> Case Context Active</span>
            </div>
          </div>
          
          <div className="chat-messages">
            {chat.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role} ${msg.isAdvice ? 'advice' : ''}`}>
                <div className="message-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="chat-message assistant">
                <div className="message-bubble">
                  <div className="typing-indicator"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <div className="input-wrapper">
              <input 
                type="text" 
                placeholder="Ask about this case or documents..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
              />
              <button type="button" className="btn-attach" onClick={() => fileInputRef.current?.click()}><Paperclip size={18} /></button>
            </div>
            <button type="submit" className="btn-send" disabled={isSending}>
              <Send size={18} />
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default CaseDetails;
