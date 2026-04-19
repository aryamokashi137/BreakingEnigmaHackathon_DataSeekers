import { useState, useEffect, useRef } from "react";
import { Send, RotateCcw, Trash, Scale, Brain, MessageSquare, Info, Shield, Zap, Loader2 } from "lucide-react";
import { getChatHistory, sendMessage, clearChat } from "../api";
import { intentMeta } from "../theme";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { useAuth } from "../App";

const Spinner = () => <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />;

export default function AIAssistant() {
  const { lawyer } = useAuth();
  const chatId = lawyer?.lawyer_id || "general";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    getChatHistory(chatId).then((r) => setMessages(r.data)).catch(() => {});
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", message: msg }]);
    setLoading(true);
    try {
      const res = await sendMessage(chatId, msg);
      setMessages((p) => [...p, { role: "assistant", message: res.data.response, intent: res.data.intent }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear chat history?")) return;
    await clearChat(chatId);
    setMessages([]);
  };

  return (
    <div className="main-content fade-in" style={{ display: "flex", height: "calc(100vh - 100px)", gap: "32px", padding: "0 32px 32px" }}>
      
      {/* ── Chat Stream ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "white", borderRadius: "24px", border: "1px solid var(--border-subtle)", overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
        
        {/* Header */}
        <header style={{ padding: "20px 32px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", marginBottom: "2px" }}>General AI Assistant</h2>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }}></div>
                Knowledge Base Active
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-outline" onClick={() => setMessages([])} style={{ borderRadius: "10px", padding: "8px 16px" }}>
              <RotateCcw size={16} /> Reset
            </button>
            <button className="btn btn-outline" onClick={handleClear} style={{ borderRadius: "10px", padding: "8px 16px", color: "var(--danger)", borderColor: "transparent" }}>
              <Trash size={16} /> Clear History
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="chat-messages-area" style={{ flex: 1, padding: "32px", background: "var(--bg-main)" }}>
          {messages.length === 0 && (
            <div style={{ maxWidth: "500px", margin: "80px auto 0", textAlign: "center" }}>
              <Scale size={64} color="var(--border-subtle)" style={{ marginBottom: "24px", opacity: 0.5 }} />
              <h2 style={{ marginBottom: "12px" }}>Universal Legal Intelligence</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontWeight: "500" }}>Ask about IPC sections, case filing procedures, or general legal queries. I can analyze precedents and provide summaries.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {["Explain IPC Section 302", "Bail procedures in India", "Draft a property notice", "Criminal vs Civil law"].map(q => (
                  <button key={q} onClick={() => setInput(q)} style={{ padding: "12px 16px", background: "white", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "13px", fontWeight: "700", textAlign: "left", cursor: "pointer" }}>{q}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-row ${m.role === "user" ? "user" : "ai"}`}>
                <div className="chat-avatar">{m.role === "user" ? "U" : "AI"}</div>
                <div className="chat-bubble-wrap">
                  {m.role === "assistant" && m.intent && (
                    <span className="chat-intent-badge" style={{ 
                      color: intentMeta[m.intent]?.color || "var(--primary)", 
                      background: intentMeta[m.intent]?.bg || "var(--primary-light)",
                      marginBottom: "4px"
                    }}>
                      {intentMeta[m.intent]?.label || "Response"}
                    </span>
                  )}
                  <div className={m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} style={{ padding: "16px 20px", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
                    {m.role === "assistant" ? <MarkdownRenderer content={m.message} /> : m.message}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-row ai">
                <div className="chat-avatar">AI</div>
                <div style={{ padding: "16px 20px", background: "white", borderRadius: "16px", display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
                  <Spinner /> Processing query...
                </div>
              </div>
            )}
            <div ref={bottomRef} style={{ height: "20px" }} />
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: "24px 32px 32px", background: "var(--bg-main)", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", background: "white", borderRadius: "16px", border: "1.5px solid var(--border-subtle)", padding: "8px", boxShadow: "var(--shadow-md)" }}>
            <textarea
              placeholder="Type your legal query here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              style={{ width: "100%", border: "none", outline: "none", padding: "12px 16px", fontSize: "15px", resize: "none", minHeight: "52px", maxHeight: "200px" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleSend} disabled={loading || !input.trim()} style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--primary)", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: (loading || !input.trim()) ? 0.5 : 1 }}>
                {loading ? <Spinner /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Context Sidebar ── */}
      <aside style={{ width: "300px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className="premium-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Info size={18} color="var(--primary)" /> Intelligence Guide
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: Shield, title: "Legal Research", desc: "Reference IPC sections, articles, and case laws." },
              { icon: Zap, title: "Instant Summaries", desc: "Get quick overviews of complex legal texts." },
              { icon: MessageSquare, title: "Doc Q&A", desc: "Upload PDFs to ask case-specific questions." }
            ].map(item => (
              <div key={item.title} style={{ display: "flex", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <item.icon size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", marginBottom: "2px" }}>{item.title}</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card" style={{ padding: "24px", background: "var(--primary)", color: "white", border: "none" }}>
          <h3 style={{ color: "white", fontSize: "16px", marginBottom: "12px" }}>Did you know?</h3>
          <p style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.6" }}>
            You can use the Document Indexing feature to perform full-text search across thousands of case files simultaneously.
          </p>
        </div>
      </aside>
    </div>
  );
}
