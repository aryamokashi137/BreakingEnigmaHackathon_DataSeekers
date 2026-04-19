import { useState, useEffect, useRef } from "react";
import { Bot, Send, Loader2, Scale, Lightbulb } from "lucide-react";
import { getCases, sendMessage, getChatHistory } from "../api";
import { intentMeta } from "../theme";

const Spinner = () => <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />;

const SUGGESTIONS = [
  "Explain IPC Section 420",
  "What does Article 21 say?",
  "Explain the concept of bail",
  "What is a cognizable offence?",
];

export default function AIAssistant() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    getCases().then((r) => {
      setCases(r.data);
      if (r.data.length > 0) setSelectedCase(r.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCase) return;
    getChatHistory(selectedCase).then((r) => setMessages(r.data));
  }, [selectedCase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading || !selectedCase) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", message: msg }]);
    setLoading(true);
    try {
      const res = await sendMessage(selectedCase, msg);
      setMessages((p) => [...p, { role: "assistant", message: res.data.response, intent: res.data.intent }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "24px", height: "calc(100vh - 120px)" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Main Chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A", marginBottom: "2px" }}>AI Legal Assistant</h2>
              <p style={{ fontSize: "13px", color: "#64748B" }}>Powered by Claude · RAG · Legal Research · Summarization</p>
            </div>
          </div>

          {/* Case Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "13px", color: "#64748B", fontWeight: "500" }}>Case:</label>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px", background: "#F8FAFC", color: "#0F172A", fontWeight: "500" }}
            >
              {cases.length === 0 && <option value="">No cases — create one first</option>}
              {cases.map((c) => (
                <option key={c._id} value={c._id}>{c.case_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Intent badges */}
        <div style={{ padding: "10px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", gap: "8px" }}>
          {Object.values(intentMeta).map((m) => (
            <span key={m.label} style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: m.bg, color: m.color, fontWeight: "600" }}>
              {m.label}
            </span>
          ))}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <Scale size={40} color="#CBD5E1" style={{ marginBottom: "12px" }} />
              <p style={{ color: "#94A3B8", fontSize: "15px", marginBottom: "20px" }}>
                {selectedCase ? "Ask anything about this case or any legal topic" : "Select a case to begin"}
              </p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                {SUGGESTIONS.map((q) => (
                  <button key={q} className="btn" onClick={() => handleSend(q)}
                    style={{ background: "#F1F5F9", color: "#475569", fontSize: "12px", padding: "6px 12px" }}>
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
                    <span style={{ display: "inline-block", fontSize: "10px", fontWeight: "700", color: meta.color, background: meta.bg, padding: "2px 8px", borderRadius: "20px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {meta.label}
                    </span>
                  );
                })()}
                <div style={{
                  padding: "12px 16px",
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: m.role === "user" ? "#4F46E5" : "#fff",
                  color: m.role === "user" ? "#fff" : "#0F172A",
                  border: m.role === "user" ? "none" : "1px solid #E2E8F0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-wrap",
                }}>
                  {m.message}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px", background: "#fff", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "8px", color: "#94A3B8", fontSize: "13px" }}>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "16px 24px", background: "#fff", borderTop: "1px solid #E2E8F0", display: "flex", gap: "10px" }}>
          <input
            style={{ flex: 1, padding: "12px 16px", border: "1px solid #E2E8F0", borderRadius: "12px", fontSize: "14px", background: "#F8FAFC" }}
            placeholder={selectedCase ? "Ask about laws, sections, or your case documents..." : "Select a case first..."}
            value={input}
            disabled={!selectedCase}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <button className="btn" onClick={() => handleSend()} disabled={loading || !input.trim() || !selectedCase}
            style={{ background: "#4F46E5", color: "#fff", padding: "12px 18px", borderRadius: "12px" }}>
            {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ width: "280px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Pro Tip */}
        <div style={{ background: "#EFF6FF", borderRadius: "12px", padding: "20px", border: "1px solid #BFDBFE" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <Lightbulb size={18} color="#F59E0B" />
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1E3A8A" }}>How it works</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { badge: "📚 Doc Q&A", desc: "Questions about uploaded documents" },
              { badge: "📄 Summarize", desc: "\"Summarize this document\"" },
              { badge: "🔍 Research", desc: "Laws, sections, IPC, articles" },
            ].map((t) => (
              <div key={t.badge} style={{ background: "#fff", borderRadius: "8px", padding: "10px 12px" }}>
                <p style={{ fontSize: "12px", fontWeight: "700", color: "#1E3A8A", marginBottom: "2px" }}>{t.badge}</p>
                <p style={{ fontSize: "11px", color: "#64748B" }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested queries */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #E2E8F0" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#0F172A", marginBottom: "12px" }}>Try These</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              "Who are the parties involved?",
              "What are the key arguments?",
              "Explain IPC Section 302",
              "What does Article 14 say?",
              "Summarize this document",
            ].map((q) => (
              <button key={q} onClick={() => { setInput(q); }}
                style={{ background: "#F8FAFC", border: "none", padding: "10px 12px", borderRadius: "8px", textAlign: "left", fontSize: "12px", color: "#334155", fontWeight: "500", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                onMouseLeave={e => e.currentTarget.style.background = "#F8FAFC"}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
