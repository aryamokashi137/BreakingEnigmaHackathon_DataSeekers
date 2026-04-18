import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, RefreshCw, Zap, Brain, Scale } from "lucide-react";
import { buildLifecycle, getLifecycle, analyzeCase } from "../api";

const Spinner = () => <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />;

const InfoCard = ({ label, value, color = "#4F46E5" }) => (
  <div style={{
    background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10,
    padding: "14px 18px", borderTop: `3px solid ${color}`,
  }}>
    <p style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</p>
    <p style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{value || "—"}</p>
  </div>
);

const Section = ({ emoji, title, items, color }) => (
  <div style={{ marginBottom: 20 }}>
    <h4 style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
      {emoji} {title}
    </h4>
    {items?.length > 0 ? (
      <ul style={{ paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => (
          <li key={i} style={{
            fontSize: 13, color: "#374151", padding: "8px 12px",
            background: "#F8FAFC", borderRadius: 6, borderLeft: `3px solid ${color}`,
          }}>
            {item}
          </li>
        ))}
      </ul>
    ) : (
      <p style={{ color: "#94A3B8", fontSize: 13 }}>Not available</p>
    )}
  </div>
);

export default function CaseAnalysis() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [lifecycle, setLifecycle] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [lifecycleLoading, setLifecycleLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getLifecycle(caseId).then((r) => { if (r.data.lifecycle) setLifecycle(r.data.lifecycle); }).catch(() => {});
  }, [caseId]);

  const handleBuildLifecycle = async (force = false) => {
    setLifecycleLoading(true); setError("");
    try {
      const res = await buildLifecycle(caseId, force);
      setLifecycle(res.data.lifecycle); setAnalysis(null);
    } catch (e) { setError(e.response?.data?.detail || "Failed to extract lifecycle."); }
    finally { setLifecycleLoading(false); }
  };

  const handleAnalyze = async () => {
    setAnalysisLoading(true); setError("");
    try { const res = await analyzeCase(caseId); setAnalysis(res.data.analysis); }
    catch (e) { setError(e.response?.data?.detail || "Failed to analyze case."); }
    finally { setAnalysisLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Nav */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 32px",
        height: 56, display: "flex", alignItems: "center", gap: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <Scale size={18} color="#4F46E5" />
        <span style={{ fontWeight: 700, fontSize: 15 }}>LegalAI</span>
        <span style={{ color: "#CBD5E1" }}>›</span>
        <span style={{ color: "#64748B", fontSize: 14 }}>Case Analysis</span>
        <button className="btn" onClick={() => navigate(-1)}
          style={{ background: "#F1F5F9", color: "#475569", marginLeft: "auto" }}>
          <ArrowLeft size={14} /> Back
        </button>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>🧠 Case Lifecycle & Smart Analysis</h1>
          <p style={{ color: "#64748B" }}>Extract the full lifecycle from documents, then get AI-powered legal strategy.</p>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", padding: "12px 16px", borderRadius: 8, marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 1 */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>📋 Step 1: Case Lifecycle</h2>
              <p style={{ fontSize: 13, color: "#64748B" }}>Extract parties, timeline, and legal issues from documents.</p>
            </div>
            <button className="btn"
              onClick={() => handleBuildLifecycle(!!lifecycle)}
              disabled={lifecycleLoading}
              style={{ background: lifecycleLoading ? "#E2E8F0" : "#4F46E5", color: lifecycleLoading ? "#94A3B8" : "#fff" }}>
              {lifecycleLoading ? <><Spinner /> Extracting...</> : lifecycle ? <><RefreshCw size={14} /> Re-extract</> : <><Zap size={14} /> Extract Lifecycle</>}
            </button>
          </div>

          {lifecycle ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <InfoCard label="Case Type" value={lifecycle.case_type} color="#4F46E5" />
                <InfoCard label="Current Stage" value={lifecycle.current_stage} color="#16A34A" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <Section emoji="👥" title="Parties Involved" items={lifecycle.parties} color="#4F46E5" />
                  <Section emoji="⚖️" title="Legal Issues" items={lifecycle.legal_issues} color="#D97706" />
                </div>
                <div>
                  <Section emoji="📅" title="Timeline" items={lifecycle.timeline} color="#7C3AED" />
                  <Section emoji="🔑" title="Key Events" items={lifecycle.key_events} color="#0891B2" />
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94A3B8" }}>
              <Brain size={36} color="#CBD5E1" style={{ marginBottom: 10 }} />
              <p>Upload documents and click "Extract Lifecycle" to begin.</p>
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>🎯 Step 2: Smart Legal Analysis</h2>
              <p style={{ fontSize: 13, color: "#64748B" }}>Get AI-powered strengths, risks, and strategy.</p>
            </div>
            <button className="btn"
              onClick={handleAnalyze}
              disabled={analysisLoading || !lifecycle}
              style={{ background: analysisLoading || !lifecycle ? "#E2E8F0" : "#16A34A", color: analysisLoading || !lifecycle ? "#94A3B8" : "#fff" }}>
              {analysisLoading ? <><Spinner /> Analyzing...</> : <><Brain size={14} /> Analyze Case</>}
            </button>
          </div>

          {!lifecycle && <p style={{ color: "#94A3B8", textAlign: "center", padding: "20px 0" }}>Complete Step 1 first.</p>}

          {analysis && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <Section emoji="✅" title="Strengths" items={analysis.strengths} color="#16A34A" />
                <Section emoji="👣" title="Next Steps" items={analysis.next_steps} color="#4F46E5" />
              </div>
              <div>
                <Section emoji="⚠️" title="Risks & Weaknesses" items={analysis.risks} color="#DC2626" />
                <Section emoji="🎯" title="Legal Strategy" items={analysis.strategy} color="#7C3AED" />
              </div>
            </div>
          )}

          {!analysis && lifecycle && (
            <p style={{ color: "#94A3B8", textAlign: "center", padding: "20px 0" }}>Click "Analyze Case" to get AI-powered legal strategy.</p>
          )}
        </div>
      </div>
    </div>
  );
}
