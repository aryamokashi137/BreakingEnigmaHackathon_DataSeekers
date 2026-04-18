import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buildLifecycle, getLifecycle, analyzeCase } from "../api";

const Section = ({ emoji, title, items, color }) => (
  <div style={{ marginBottom: 20 }}>
    <h4 style={{ margin: "0 0 8px", color }}>{emoji} {title}</h4>
    {items && items.length > 0 ? (
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 4, fontSize: 14 }}>{item}</li>
        ))}
      </ul>
    ) : (
      <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Not available</p>
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

  // Load existing lifecycle on mount
  useEffect(() => {
    getLifecycle(caseId).then((r) => {
      if (r.data.lifecycle) setLifecycle(r.data.lifecycle);
    }).catch(() => {});
  }, [caseId]);

  const handleBuildLifecycle = async (force = false) => {
    setLifecycleLoading(true);
    setError("");
    try {
      const res = await buildLifecycle(caseId, force);
      setLifecycle(res.data.lifecycle);
      setAnalysis(null); // reset analysis when lifecycle changes
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to extract lifecycle. Make sure documents are uploaded.");
    } finally {
      setLifecycleLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalysisLoading(true);
    setError("");
    try {
      const res = await analyzeCase(caseId);
      setAnalysis(res.data.analysis);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to analyze case.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>
      <h2>🧠 Case Lifecycle & Smart Analysis</h2>
      <p style={{ color: "#666", marginTop: 0 }}>
        Extract the full lifecycle of this case from uploaded documents, then get AI-powered legal strategy.
      </p>

      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 4, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Step 1 — Lifecycle */}
      <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>📋 Step 1: Case Lifecycle</h3>
          <button
            onClick={() => handleBuildLifecycle(lifecycle ? true : false)}
            disabled={lifecycleLoading}
            style={{
              padding: "8px 16px",
              background: lifecycleLoading ? "#ccc" : "#0070f3",
              color: "#fff", border: "none", borderRadius: 4, cursor: lifecycleLoading ? "not-allowed" : "pointer",
            }}
          >
            {lifecycleLoading ? "Extracting..." : lifecycle ? "🔄 Re-extract" : "⚡ Extract Lifecycle"}
          </button>
        </div>

        {lifecycle ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 4 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888", textTransform: "uppercase" }}>Case Type</p>
              <p style={{ margin: 0, fontWeight: "bold" }}>{lifecycle.case_type || "—"}</p>
            </div>
            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 4 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888", textTransform: "uppercase" }}>Current Stage</p>
              <p style={{ margin: 0, fontWeight: "bold" }}>{lifecycle.current_stage || "—"}</p>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <Section emoji="👥" title="Parties Involved" items={lifecycle.parties} color="#0070f3" />
              <Section emoji="📅" title="Timeline" items={lifecycle.timeline} color="#7c3aed" />
              <Section emoji="⚖️" title="Legal Issues" items={lifecycle.legal_issues} color="#b45309" />
              <Section emoji="🔑" title="Key Events" items={lifecycle.key_events} color="#0891b2" />
            </div>
          </div>
        ) : (
          <p style={{ color: "#aaa" }}>Upload documents and click "Extract Lifecycle" to begin.</p>
        )}
      </div>

      {/* Step 2 — Analysis */}
      <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>🎯 Step 2: Smart Legal Analysis</h3>
          <button
            onClick={handleAnalyze}
            disabled={analysisLoading || !lifecycle}
            style={{
              padding: "8px 16px",
              background: analysisLoading || !lifecycle ? "#ccc" : "#16a34a",
              color: "#fff", border: "none", borderRadius: 4,
              cursor: analysisLoading || !lifecycle ? "not-allowed" : "pointer",
            }}
          >
            {analysisLoading ? "Analyzing..." : "🧠 Analyze Case"}
          </button>
        </div>

        {!lifecycle && (
          <p style={{ color: "#aaa" }}>Complete Step 1 first to enable analysis.</p>
        )}

        {analysis && (
          <div>
            <Section emoji="✅" title="Strengths" items={analysis.strengths} color="#16a34a" />
            <Section emoji="⚠️" title="Risks & Weaknesses" items={analysis.risks} color="#dc2626" />
            <Section emoji="👣" title="Recommended Next Steps" items={analysis.next_steps} color="#0070f3" />
            <Section emoji="🎯" title="Legal Strategy" items={analysis.strategy} color="#7c3aed" />
          </div>
        )}

        {!analysis && lifecycle && (
          <p style={{ color: "#aaa" }}>Click "Analyze Case" to get AI-powered legal strategy.</p>
        )}
      </div>
    </div>
  );
}
