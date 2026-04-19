import { useState } from "react";
import { Scale, Loader2 } from "lucide-react";
import { login } from "../api";

const DEMO_IDS = ["LAW001", "LAW002", "LAW003", "LAW004"];

export default function Login({ onLogin }) {
  const [lawyerId, setLawyerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (id) => {
    const idToUse = (id || lawyerId).trim().toUpperCase();
    if (!idToUse) { setError("Please enter your Lawyer ID."); return; }
    setLoading(true); setError("");
    try {
      const res = await login(idToUse);
      onLogin(res.data.lawyer);
    } catch (e) {
      setError(e.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #1E3A8A 0%, #312E81 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <Scale size={32} color="#fff" />
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>LegalFlow AI</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>AI-Powered Legal Workspace</p>
        </div>

        {/* Card */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>Lawyer Login</h2>
          <p style={{ fontSize: 13, color: "#64748B", marginBottom: 24 }}>
            Enter your Bar Council Lawyer ID to access your workspace
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Lawyer ID
            </label>
            <input
              type="text"
              placeholder="e.g. LAW001"
              value={lawyerId}
              onChange={(e) => { setLawyerId(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", padding: "12px 16px", border: "1.5px solid #E2E8F0",
                borderRadius: 10, fontSize: 15, fontWeight: 600, letterSpacing: "0.08em",
                color: "#0F172A", background: "#F8FAFC", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={() => handleLogin()}
            disabled={loading || !lawyerId.trim()}
            style={{
              width: "100%", padding: "13px", border: "none", borderRadius: 10,
              background: loading || !lawyerId.trim() ? "#E2E8F0" : "linear-gradient(135deg, #4F46E5, #6366F1)",
              color: loading || !lawyerId.trim() ? "#94A3B8" : "#fff",
              fontSize: 15, fontWeight: 700, cursor: loading || !lawyerId.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: loading || !lawyerId.trim() ? "none" : "0 4px 14px rgba(79,70,229,0.4)",
              transition: "all 0.2s",
            }}
          >
            {loading ? <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Verifying...</> : "Login to Workspace"}
          </button>

          {/* Demo IDs */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #F1F5F9" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Demo Accounts
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {DEMO_IDS.map((id) => (
                <button key={id} onClick={() => handleLogin(id)}
                  style={{
                    padding: "8px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8,
                    background: "#F8FAFC", fontSize: 13, fontWeight: 700, color: "#4F46E5",
                    cursor: "pointer", letterSpacing: "0.05em", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#4F46E5"; e.currentTarget.style.background = "#EEF2FF"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 20 }}>
          Hackathon Prototype · AI Legal Workflow Assistant
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
