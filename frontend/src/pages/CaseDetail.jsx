import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDocuments, uploadDocument, deleteDocument,
  getChatHistory, sendMessage, summarizeDocument,
} from "../api";

export default function CaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [docs, setDocs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(null); // doc filename being summarized
  const bottomRef = useRef(null);

  const loadDocs = () => getDocuments(caseId).then((r) => setDocs(r.data));
  const loadChat = () => getChatHistory(caseId).then((r) => setMessages(r.data));

  useEffect(() => {
    loadDocs();
    loadChat();
  }, [caseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadDocument(caseId, file);
    e.target.value = "";
    loadDocs();
  };

  const handleDelete = async (docId) => {
    await deleteDocument(docId);
    loadDocs();
  };

  const handleSummarize = async (filename) => {
    setSummarizing(filename);
    setMessages((prev) => [...prev, { role: "user", message: `📄 Summarize: ${filename}` }]);
    try {
      const res = await summarizeDocument(caseId, filename);
      setMessages((prev) => [...prev, { role: "assistant", message: res.data.summary, intent: "summarize" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", message: "Failed to summarize document.", intent: "summarize" }]);
    } finally {
      setSummarizing(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", message: msg }]);
    setLoading(true);
    try {
      const res = await sendMessage(caseId, msg);
      setMessages((prev) => [...prev, { role: "assistant", message: res.data.response, intent: res.data.intent }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, display: "flex", gap: 24, height: "100vh", boxSizing: "border-box" }}>

      {/* Left panel */}
      <div style={{ width: 280, flexShrink: 0 }}>
        <button onClick={() => navigate("/")}>← Back</button>
        <h3>📂 Documents</h3>

        <input type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" onChange={handleUpload} />

        <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
          {docs.length === 0 && <li style={{ color: "#888" }}>No documents uploaded.</li>}
          {docs.map((d) => (
            <li key={d._id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13 }}>📄 {d.filename}</span>
                <button
                  onClick={() => handleDelete(d._id)}
                  style={{ fontSize: 11, color: "red", background: "none", border: "none", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
              <button
                onClick={() => handleSummarize(d.filename)}
                disabled={summarizing === d.filename}
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  padding: "3px 8px",
                  cursor: "pointer",
                  background: summarizing === d.filename ? "#ccc" : "#7c3aed",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  width: "100%",
                }}
              >
                {summarizing === d.filename ? "Summarizing..." : "📄 Summarize"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", border: "1px solid #ddd", borderRadius: 6 }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #ddd", fontWeight: "bold" }}>
          💬 Chat
          <span style={{ fontSize: 11, fontWeight: "normal", color: "#888", marginLeft: 8 }}>
            Try: "summarize this" · "explain section 420" · "what are the arguments?"
          </span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
          {messages.length === 0 && (
            <p style={{ color: "#aaa" }}>Ask anything about this case...</p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: 12,
                textAlign: m.role === "user" ? "right" : "left",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: m.role === "user" ? "#0070f3" : "#f0f0f0",
                  color: m.role === "user" ? "#fff" : "#000",
                  maxWidth: "75%",
                  fontSize: 14,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.role === "assistant" && m.intent && (
                  <span style={{
                    display: "block",
                    fontSize: 10,
                    marginBottom: 4,
                    color: m.intent === "summarize" ? "#7c3aed" : m.intent === "legal_research" ? "#0891b2" : "#16a34a",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}>
                    {m.intent === "summarize" ? "📄 Summarizer" : m.intent === "legal_research" ? "🔍 Legal Research" : "📚 Document Q&A"}
                  </span>
                )}
                {m.message}
              </span>
            </div>
          ))}
          {loading && <p style={{ color: "#aaa", fontSize: 13 }}>Thinking...</p>}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: 10, borderTop: "1px solid #ddd", display: "flex", gap: 8 }}>
          <input
            style={{ flex: 1, padding: 8 }}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}
