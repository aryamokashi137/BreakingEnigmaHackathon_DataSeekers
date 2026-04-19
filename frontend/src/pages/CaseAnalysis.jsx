import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, RefreshCw, Zap, Brain, Scale, Shield, Target, AlertTriangle, ListChecks, ChevronRight, Calendar } from "lucide-react";
import { buildLifecycle, getLifecycle, analyzeCase } from "../api";

const Spinner = () => <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />;

const InfoCard = ({ label, value, color = "var(--primary)", icon: Icon }) => (
  <div className="premium-card" style={{
    padding: "20px", display: "flex", gap: "16px", alignItems: "center"
  }}>
    <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--bg-main)", color: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {Icon && <Icon size={24} />}
    </div>
    <div>
      <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "800", marginBottom: "4px" }}>{label}</p>
      <p style={{ fontWeight: "800", fontSize: "16px", color: "var(--text-main)" }}>{value || "Pending Analysis"}</p>
    </div>
  </div>
);

const Section = ({ icon: Icon, title, items, color, bg }) => (
  <div className="premium-card" style={{ height: "100%", padding: "24px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: bg || "var(--bg-main)", color: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} />
      </div>
      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>{title}</h4>
    </div>
    {items?.length > 0 ? (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((item, i) => (
          <div key={i} style={{
            fontSize: "13px", color: "var(--text-main)", padding: "12px 16px",
            background: "var(--bg-main)", borderRadius: "10px", borderLeft: `4px solid ${color}`,
            fontWeight: "500", lineHeight: "1.5"
          }}>
            {item}
          </div>
        ))}
      </div>
    ) : (
      <div style={{ padding: "32px 0", textAlign: "center", opacity: 0.5 }}>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No data extracted</p>
      </div>
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
    <div className="main-content fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--primary)", fontWeight: "700", fontSize: "13px", textTransform: "uppercase", marginBottom: "8px" }}>
            <Brain size={16} /> Advanced Case Intelligence
          </div>
          <h1 style={{ marginBottom: "8px" }}>Strategy & Analysis</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "500" }}>AI-driven extraction of case facts, risks, and winning legal strategies.</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ borderRadius: "12px", padding: "10px 20px" }}>
          <ArrowLeft size={16} /> Back to Case
        </button>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", padding: "16px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", fontWeight: "600" }}>
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {/* Step 1: Lifecycle Extraction */}
      <div className="premium-card" style={{ padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>1. Document Lifecycle Extraction</h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "500" }}>Automatically identify parties, legal issues, and key procedural events.</p>
          </div>
          <button className="btn btn-primary"
            onClick={() => handleBuildLifecycle(!!lifecycle)}
            disabled={lifecycleLoading}
            style={{ borderRadius: "12px", padding: "12px 24px" }}>
            {lifecycleLoading ? <Spinner /> : lifecycle ? <><RefreshCw size={16} /> Update Extraction</> : <><Zap size={16} /> Run Extraction</>}
          </button>
        </div>

        {lifecycle ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <InfoCard label="Case Categorization" value={lifecycle.case_type} color="var(--primary)" icon={Scale} />
              <InfoCard label="Procedural Stage" value={lifecycle.current_stage} color="var(--success)" icon={Target} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <Section icon={Shield} title="Involved Parties" items={lifecycle.parties} color="var(--primary)" />
              <Section icon={ListChecks} title="Identified Legal Issues" items={lifecycle.legal_issues} color="var(--warning)" bg="#FFFBEB" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <Section icon={Calendar} title="Procedural Timeline" items={lifecycle.timeline} color="var(--accent)" bg="#F5F3FF" />
              <Section icon={Zap} title="Key Factual Events" items={lifecycle.key_events} color="var(--info)" bg="#EFF6FF" />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "64px 0", background: "var(--bg-main)", borderRadius: "16px", border: "2px dashed var(--border-subtle)" }}>
            <Brain size={64} color="var(--border-subtle)" style={{ marginBottom: "20px", opacity: 0.5 }} />
            <h3 style={{ marginBottom: "8px" }}>No Analysis Found</h3>
            <p style={{ color: "var(--text-muted)", maxWidth: "340px", margin: "0 auto" }}>Please run the extraction process to analyze your case documents.</p>
          </div>
        )}
      </div>

      {/* Step 2: Strategic Insights */}
      <div className="premium-card" style={{ padding: "32px", border: "2px solid var(--success-light)", background: analysis ? "white" : "var(--bg-main)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>2. Strategic Legal Insights</h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "500" }}>AI-powered evaluation of case strengths, weaknesses, and next steps.</p>
          </div>
          <button className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={analysisLoading || !lifecycle}
            style={{ borderRadius: "12px", padding: "12px 24px", background: "var(--success)" }}>
            {analysisLoading ? <Spinner /> : <><Brain size={16} /> Generate Strategy</>}
          </button>
        </div>

        {analysis ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <Section icon={Shield} title="Case Strengths" items={analysis.strengths} color="var(--success)" bg="#ECFDF5" />
              <Section icon={Target} title="Recommended Strategy" items={analysis.strategy} color="var(--primary)" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <Section icon={AlertTriangle} title="Risks & Weaknesses" items={analysis.risks} color="var(--danger)" bg="#FEF2F2" />
              <Section icon={ChevronRight} title="Next Procedural Steps" items={analysis.next_steps} color="var(--info)" bg="#EFF6FF" />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "var(--text-muted)", fontWeight: "600" }}>{lifecycle ? "Ready to generate strategic insights." : "Complete Step 1 to unlock strategic insights."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
