import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Upload, Trash2, FileText, Brain,
  Calendar, Send, Loader2, Scale, Trash, RotateCcw,
  ChevronRight, File, MoreVertical, Plus
} from "lucide-react";
import {
  getDocuments, uploadDocument, deleteDocument,
  getChatHistory, sendMessage, summarizeDocument, clearChat,
} from "../api";
import { intentMeta } from "../theme";
import MarkdownRenderer from "../components/MarkdownRenderer";

const Spinner = () => <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />;

export default function CaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [docs, setDocs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(null);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const loadDocs = () => getDocuments(caseId).then((r) => setDocs(r.data));
  const loadChat = () => getChatHistory(caseId).then((r) => setMessages(r.data));

  useEffect(() => { loadDocs(); loadChat(); }, [caseId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    await uploadDocument(caseId, file);
    e.target.value = "";
    setUploading(false);
    loadDocs();
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
    await deleteDocument(docId);
    loadDocs();
  };

  const handleSummarize = async (filename) => {
    setSummarizing(filename);
    setMessages((p) => [...p, { role: "user", message: `📄 Summarize: ${filename}` }]);
    try {
      const res = await summarizeDocument(caseId, filename);
      setMessages((p) => [...p, { role: "assistant", message: res.data.summary, intent: "summarize" }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", message: "Failed to summarize.", intent: "summarize" }]);
    } finally {
      setSummarizing(null);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Clear all chat history for this case?")) return;
    await clearChat(caseId);
    setMessages([]);
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", message: msg }]);
    setLoading(true);
    try {
      const res = await sendMessage(caseId, msg);
      setMessages((p) => [...p, { role: "assistant", message: res.data.response, intent: res.data.intent }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-main)", overflow: "hidden" }}>
      
      {/* ── Case Sidebar ── */}
      <aside style={{
        width: 320, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-subtle)",
        display: "flex", flexDirection: "column", flexShrink: 0,
        boxShadow: "4px 0 10px rgba(0,0,0,0.02)"
      }}>
        {/* Logo & Header */}
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <Scale size={20} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text-main)", letterSpacing: "-0.02em" }}>LegalFlow AI</span>
          </div>
          <button className="btn btn-outline" onClick={() => navigate("/cases")}
            style={{ width: "100%", justifyContent: "center", gap: 8, borderRadius: 10, padding: "8px 16px" }}>
            <ArrowLeft size={16} /> Back to Library
          </button>
        </div>

        {/* Navigation Actions */}
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/case/${caseId}/analysis`)}
            style={{ justifyContent: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 12 }}>
            <Brain size={18} /> 
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Intelligent Analysis</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>Strengths, Risks & Strategy</div>
            </div>
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(`/case/${caseId}/timeline`)}
            style={{ justifyContent: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 12, background: "#E0F2FE", color: "#0369A1" }}>
            <Calendar size={18} /> 
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Case Timeline</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>Events & Deadlines</div>
            </div>
          </button>
        </div>

        {/* Documents Section */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h4 style={{ fontSize: 12, fontWeight: 800, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Attachments ({docs.length})
            </h4>
            <button
              className="btn btn-primary"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ width: 32, height: 32, padding: 0, borderRadius: 8 }}
            >
              {uploading ? <Spinner /> : <Plus size={18} />}
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={handleUpload} style={{ display: "none" }} />
          </div>

          {docs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", border: "1.5px dashed var(--border-subtle)", borderRadius: 12 }}>
              <FileText size={32} color="var(--text-light)" style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>Upload case files to begin RAG analysis</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {docs.map((d) => (
                <div key={d._id} className="premium-card" style={{ padding: "14px", borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <File size={16} color="var(--text-light)" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                        {d.filename}
                      </span>
                    </div>
                    <button className="btn" onClick={() => handleDelete(d._id)}
                      style={{ background: "transparent", color: "var(--danger)", padding: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSummarize(d.filename)}
                    disabled={summarizing === d.filename}
                    style={{ width: "100%", fontSize: 11, fontWeight: 700, padding: "6px 10px", borderRadius: 8 }}
                  >
                    {summarizing === d.filename ? <><Spinner /> Processing...</> : "AI Summarize"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Chat Interface ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "white" }}>
        
        {/* Chat Header */}
        <header style={{
          background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 32px", height: 72, display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 2 }}>Case Intelligence Assistant</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }}></div>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                Powered by RAG Context Engine
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, marginRight: 12 }}>
              {["Context-Aware", "Legal-Specific"].map((t) => (
                <span key={t} style={{
                  fontSize: 10, padding: "4px 10px", borderRadius: 20,
                  background: "var(--primary-light)", color: "var(--primary)", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.02em"
                }}>{t}</span>
              ))}
            </div>
            <button className="btn btn-outline" onClick={handleNewChat} style={{ borderRadius: 10, padding: "8px 16px", fontSize: 13 }}>
              <RotateCcw size={14} /> Reset
            </button>
            <button className="btn btn-outline" onClick={handleClearChat} style={{ borderRadius: 10, padding: "8px 16px", fontSize: 13, color: "var(--danger)", borderColor: "transparent" }}>
              <Trash size={14} /> Clear History
            </button>
          </div>
        </header>

        {/* Message Thread */}
        <div className="chat-messages-area" style={{ flex: 1, padding: "32px", background: "var(--bg-main)" }}>
          {messages.length === 0 && (
            <div style={{ maxWidth: 600, margin: "100px auto 0", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", margin: "0 auto 24px", boxShadow: "var(--shadow-lg)" }}>
                <Brain size={40} />
              </div>
              <h2 style={{ fontSize: 24, marginBottom: 12 }}>How can I help with this case?</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 32 }}>Ask specific questions about uploaded documents or request legal interpretations.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  "What are the core allegations?",
                  "Identify potential liabilities",
                  "Summarize key evidence",
                  "Relevant case precedents"
                ].map((q) => (
                  <button key={q} 
                    onClick={() => setInput(q)}
                    style={{ 
                      padding: "16px", background: "white", border: "1px solid var(--border-subtle)", 
                      borderRadius: 12, fontSize: 14, fontWeight: 600, color: "var(--text-main)",
                      textAlign: "left", cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column" }}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-row ${m.role === "user" ? "user" : "ai"}`}>
                <div className="chat-avatar">{m.role === "user" ? "U" : "AI"}</div>
                <div className="chat-bubble-wrap">
                  {m.role === "assistant" && m.intent && (
                    <span className="chat-intent-badge" style={{ 
                      color: intentMeta[m.intent]?.color || "var(--primary)", 
                      background: intentMeta[m.intent]?.bg || "var(--primary-light)",
                      marginBottom: 4
                    }}>
                      {intentMeta[m.intent]?.label || "Response"}
                    </span>
                  )}
                  <div className={m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} style={{ 
                    padding: "16px 20px", borderRadius: 16, 
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    fontSize: 15
                  }}>
                    {m.role === "assistant" ? <MarkdownRenderer content={m.message} /> : m.message}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-row ai">
                <div className="chat-avatar" style={{ background: "var(--primary)", color: "white" }}>AI</div>
                <div style={{ background: "white", padding: "16px 20px", borderRadius: 16, border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12 }}>
                  <Spinner />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>Analyzing document context...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} style={{ height: 20 }} />
          </div>
        </div>

        {/* Input Dock */}
        <div style={{ 
          padding: "24px 32px 40px", background: "var(--bg-main)",
          borderTop: "1px solid var(--border-subtle)"
        }}>
          <div style={{ 
            maxWidth: 900, margin: "0 auto", position: "relative",
            background: "white", borderRadius: 16, border: "1.5px solid var(--border-subtle)",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
            padding: "8px"
          }}>
            <textarea
              placeholder="Ask a question about this case..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              style={{ 
                width: "100%", padding: "12px 16px", border: "none", outline: "none", 
                resize: "none", fontSize: 15, color: "var(--text-main)",
                minHeight: 52, maxHeight: 200
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "4px" }}>
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{ 
                  width: 40, height: 40, borderRadius: 10, background: "var(--primary)", 
                  color: "white", border: "none", display: "flex", alignItems: "center", 
                  justifyContent: "center", cursor: "pointer", transition: "all 0.2s",
                  opacity: (loading || !input.trim()) ? 0.5 : 1
                }}
              >
                {loading ? <Spinner /> : <Send size={20} />}
              </button>
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-light)", marginTop: 12, fontWeight: 500 }}>
            AI-generated content may require professional legal verification.
          </p>
        </div>
      </main>
    </div>
  );
}
