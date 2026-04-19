import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Briefcase, Clock, AlertCircle, TrendingUp, FileText, Calendar, PenTool, Brain, FolderOpen } from "lucide-react";
import { getCases, createCase } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getCases().then((r) => setCases(r.data));
  }, []);

  const handleCreate = async () => {
    const name = prompt("Enter Case Name:");
    if (!name?.trim()) return;
    setCreating(true);
    await createCase(name.trim());
    setCreating(false);
    getCases().then((r) => setCases(r.data));
  };

  const recentCases = cases.slice(-5).reverse();
  const getCaseName = (c) => c.case_name || c.title || "Untitled Case";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0F172A", marginBottom: "4px" }}>
            Welcome back
          </h1>
          <p style={{ color: "#64748B", fontSize: "15px" }}>
            Here's what's happening with your cases today
          </p>
        </div>
        <button
          className="btn"
          onClick={handleCreate}
          disabled={creating}
          style={{ background: "#1E3A8A", color: "#fff", padding: "10px 16px", borderRadius: "8px" }}
        >
          <Plus size={16} /> {creating ? "Creating..." : "New Case"}
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "relative" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <Briefcase size={20} color="#3B82F6" />
          </div>
          <TrendingUp size={18} color="#10B981" style={{ position: "absolute", top: "24px", right: "24px" }} />
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0F172A", marginBottom: "4px" }}>{cases.length}</h2>
          <p style={{ color: "#64748B", fontSize: "14px" }}>Total Cases</p>
        </div>

        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <Clock size={20} color="#3B82F6" />
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0F172A", marginBottom: "4px" }}>{cases.length}</h2>
          <p style={{ color: "#64748B", fontSize: "14px" }}>Active Cases</p>
        </div>

        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <AlertCircle size={20} color="#F97316" />
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0F172A", marginBottom: "4px" }}>—</h2>
          <p style={{ color: "#64748B", fontSize: "14px" }}>Upcoming Deadlines</p>
          <p style={{ color: "#64748B", fontSize: "12px", marginTop: "4px" }}>Open a case to view</p>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "24px" }}>

        {/* Recent Cases — REAL DATA */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0F172A" }}>Recent Cases</h3>
            <Link to="/cases" style={{ color: "#4F46E5", fontSize: "14px", fontWeight: "500", textDecoration: "none" }}>View all →</Link>
          </div>

          {recentCases.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
              <FolderOpen size={36} color="#CBD5E1" style={{ marginBottom: "10px" }} />
              <p style={{ fontSize: "14px" }}>No cases yet. Create your first case.</p>
              <button className="btn" onClick={handleCreate}
                style={{ background: "#4F46E5", color: "#fff", marginTop: "12px" }}>
                <Plus size={14} /> Create Case
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recentCases.map((c, i) => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/case/${c._id}`)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "16px 0", borderBottom: i < recentCases.length - 1 ? "1px solid #F1F5F9" : "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={16} color="#4F46E5" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#0F172A", marginBottom: "2px" }}>{getCaseName(c)}</h4>
                      <p style={{ fontSize: "12px", color: "#94A3B8" }}>Created {c.created_at?.slice(0, 10)}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: "12px", color: "#4F46E5", fontWeight: "600" }}>Open →</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Quick Actions — all wired to real routes */}
          <div style={{ background: "#6366F1", borderRadius: "12px", padding: "24px", color: "#fff", boxShadow: "0 10px 15px -3px rgba(99,102,241,0.3)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <FileText size={20} color="#fff" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>Quick Actions</h3>
            <p style={{ fontSize: "13px", opacity: 0.85, marginBottom: "20px" }}>Jump into your workflow</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "📁 Manage Cases", path: "/cases", icon: Briefcase },
                { label: "✍️ AI Document Drafting", path: "/drafting", icon: PenTool },
                { label: "🔍 AI Legal Assistant", path: "/assistant", icon: Brain },
                { label: "📅 View Deadlines", path: "/deadlines", icon: Calendar },
              ].map((a) => (
                <button key={a.path} onClick={() => navigate(a.path)}
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "12px 16px", color: "#fff", fontSize: "14px", fontWeight: "600", textAlign: "left", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Case count summary */}
          <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#0F172A", marginBottom: "14px" }}>System Status</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Total Cases", value: cases.length, color: "#4F46E5" },
                { label: "AI Model", value: "Claude 3.5 Haiku", color: "#16A34A" },
                { label: "Vector Store", value: "FAISS (local)", color: "#0891B2" },
                { label: "Database", value: "MongoDB", color: "#D97706" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#64748B" }}>{s.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
