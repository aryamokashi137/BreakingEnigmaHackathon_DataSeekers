import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Upload, Trash2, FileText, Brain,
  Calendar, Send, Loader2, Scale, Trash, RotateCcw,
} from "lucide-react";
import {
  getDocuments, uploadDocument, deleteDocument,
  getChatHistory, sendMessage, summarizeDocument, clearChat,
} from "../api";
import { intentMeta } from "../theme";

const Spinner = () => <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />;

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
    <div style={{ display: "flex", height: "100vh", background: "#F8FAFC", overflow: "hidden" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 260, background: "#fff", borderRight: "1px solid #E2E8F0",
        display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 8 }}>
          <Scale size={18} color="#4F46E5" />
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>LegalAI</span>
        </div>

        {/* Back */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9" }}>
          <button className="btn" onClick={() => navigate("/cases")}
            style={{ background: "#F1F5F9", color: "#475569", width: "100%", justifyContent: "flex-start" }}>
            <ArrowLeft size={14} /> All Cases
          </button>
        </div>

        {/* Nav Actions */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="btn" onClick={() => navigate(`/case/${caseId}/analysis`)}
            style={{ background: "#DCFCE7", color: "#16A34A", justifyContent: "flex-start" }}>
            <Brain size={14} /> Analyze Case
          </button>
          <button className="btn" onClick={() => navigate(`/case/${caseId}/timeline`)}
            style={{ background: "#E0F2FE", color: "#0891B2", justifyContent: "flex-start" }}>
            <Calendar size={14} /> Timeline
          </button>
        </div>

        {/* Documents */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Documents
            </span>
            <button
              className="btn"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ background: "#EEF2FF", color: "#4F46E5", padding: "4px 8px", fontSize: 11 }}
            >
              {uploading ? <Spinner /> : <Upload size={12} />}
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={handleUpload} style={{ display: "none" }} />
          </div>

          {docs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <FileText size={28} color="#CBD5E1" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 12, color: "#94A3B8" }}>No documents yet</p>
            </div>
          ) : (
            docs.map((d) => (
              <div key={d._id} style={{
                background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8,
                padding: "10px 12px", marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#374151", wordBreak: "break-word", flex: 1, marginRight: 6 }}>
                    📄 {d.filename}
                  </span>
                  <button className="btn" onClick={() => handleDelete(d._id)}
                    style={{ background: "transparent", color: "#94A3B8", padding: "2px 4px", flexShrink: 0 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
                <button
                  className="btn"
                  onClick={() => handleSummarize(d.filename)}
                  disabled={summarizing === d.filename}
                  style={{
                    background: summarizing === d.filename ? "#F3E8FF" : "#7C3AED",
                    color: summarizing === d.filename ? "#7C3AED" : "#fff",
                    width: "100%", justifyContent: "center", fontSize: 11, padding: "5px 8px",
                  }}
                >
                  {summarizing === d.filename ? <><Spinner /> Summarizing...</> : "📄 Summarize"}
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Chat Panel ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Chat Header */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #E2E8F0",
          padding: "0 24px", height: 56, display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: 15 }}>💬 AI Legal Assistant</span>
            <span style={{ fontSize: 12, color: "#94A3B8", marginLeft: 10 }}>
              Ask about documents · Summarize · Legal research
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {["📚 Doc Q&A", "📄 Summarize", "🔍 Research"].map((t) => (
              <span key={t} style={{
                fontSize: 11, padding: "3px 8px", borderRadius: 20,
                background: "#F1F5F9", color: "#64748B", fontWeight: 500,
              }}>{t}</span>
            ))}
            <div style={{ width: 1, height: 20, background: "#E2E8F0", margin: "0 4px" }} />
            <button className="btn" onClick={handleNewChat}
              title="New Chat (clears view only)"
              style={{ background: "#EEF2FF", color: "#4F46E5", padding: "5px 10px", fontSize: 12 }}>
              <RotateCcw size={13} /> New Chat
            </button>
            <button className="btn" onClick={handleClearChat}
              title="Clear chat history from database"
              style={{ background: "#FEF2F2", color: "#DC2626", padding: "5px 10px", fontSize: 12 }}>
              <Trash size={13} /> Clear History
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", marginTop: 60 }}>
              <Scale size={40} color="#CBD5E1" style={{ marginBottom: 12 }} />
              <p style={{ color: "#94A3B8", fontSize: 15, marginBottom: 6 }}>Ask anything about this case</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
                {[
                  "What is this document about?",
                  "Who are the parties involved?",
                  "Summarize this document",
                  "Explain IPC section 420",
                ].map((q) => (
                  <button key={q} className="btn"
                    onClick={() => setInput(q)}
                    style={{ background: "#F1F5F9", color: "#475569", fontSize: 12, padding: "6px 12px" }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "72%" }}>
                {m.role === "assistant" && m.intent && (() => {
                  const meta = intentMeta[m.intent] || intentMeta.document_qa;
                  return (
                    <span style={{
                      display: "inline-block", fontSize: 10, fontWeight: 700,
                      color: meta.color, background: meta.bg,
                      padding: "2px 8px", borderRadius: 20, marginBottom: 6,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      {meta.label}
                    </span>
                  );
                })()}
                <div style={{
                  padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: m.role === "user" ? "#4F46E5" : "#fff",
                  color: m.role === "user" ? "#fff" : "#0F172A",
                  border: m.role === "user" ? "none" : "1px solid #E2E8F0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap",
                }}>
                  {m.message}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                padding: "12px 16px", borderRadius: "18px 18px 18px 4px",
                background: "#fff", border: "1px solid #E2E8F0",
                display: "flex", alignItems: "center", gap: 8, color: "#94A3B8", fontSize: 13,
              }}>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          background: "#fff", borderTop: "1px solid #E2E8F0",
          padding: "16px 24px", display: "flex", gap: 10, alignItems: "flex-end",
        }}>
          <input
            style={{
              flex: 1, padding: "12px 16px", border: "1px solid #E2E8F0",
              borderRadius: 12, fontSize: 14, background: "#F8FAFC",
              transition: "border-color 0.15s",
            }}
            placeholder="Ask anything about your case..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <button
            className="btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{ background: "#4F46E5", color: "#fff", padding: "12px 18px", borderRadius: 12 }}
          >
            {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
          </button>
        </div>
      </main>
    </div>
  );
}
