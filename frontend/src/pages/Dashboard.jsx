import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Briefcase, Clock, AlertCircle, TrendingUp, FileText, Calendar, PenTool, Brain, FolderOpen, ChevronRight } from "lucide-react";
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
    <div className="main-content fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "500" }}>
            Welcome back, <span style={{ color: "var(--primary)", fontWeight: "700" }}>John</span>. Here's your legal overview.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={creating}
          style={{ padding: "12px 24px", borderRadius: "12px" }}
        >
          <Plus size={20} /> {creating ? "Creating..." : "New Case"}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid-layout" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {[
          { label: "Total Cases", value: cases.length, icon: Briefcase, color: "var(--primary)", bg: "var(--primary-light)", trend: "+12%" },
          { label: "Active Matters", value: cases.length, icon: Clock, color: "#0EA5E9", bg: "#F0F9FF" },
          { label: "Pending Tasks", value: "8", icon: AlertCircle, color: "#F59E0B", bg: "#FFFBEB" },
          { label: "Documents", value: "124", icon: FileText, color: "#8B5CF6", bg: "#F5F3FF" },
        ].map((stat, i) => (
          <div key={i} className="premium-card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ 
              width: "48px", height: "48px", borderRadius: "14px", 
              backgroundColor: stat.bg, color: stat.color, 
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "20px"
            }}>
              <stat.icon size={24} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h2 style={{ fontSize: "32px", marginBottom: "4px" }}>{stat.value}</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600" }}>{stat.label}</p>
              </div>
              {stat.trend && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--success)", fontSize: "12px", fontWeight: "700", background: "#ECFDF5", padding: "4px 8px", borderRadius: "6px" }}>
                  <TrendingUp size={14} /> {stat.trend}
                </div>
              )}
            </div>
            {/* Subtle background decoration */}
            <div style={{ position: "absolute", right: "-10px", bottom: "-10px", opacity: 0.03 }}>
              <stat.icon size={80} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.8fr) minmax(0, 1.2fr)", gap: "32px" }}>

        {/* Recent Cases */}
        <div className="premium-card" style={{ padding: "0" }}>
          <div style={{ padding: "24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "18px" }}>Recent Cases</h3>
            <Link to="/cases" style={{ color: "var(--primary)", fontSize: "14px", fontWeight: "700", textDecoration: "none" }}>View all</Link>
          </div>

          <div style={{ padding: "8px" }}>
            {recentCases.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-light)" }}>
                <FolderOpen size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <p style={{ fontSize: "15px", fontWeight: "500" }}>No cases found. Start by creating one.</p>
              </div>
            ) : (
              recentCases.map((c, i) => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/case/${c._id}`)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "16px 20px", borderRadius: "12px",
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--bg-main)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ 
                      width: "44px", height: "44px", borderRadius: "12px", 
                      backgroundColor: "var(--primary-light)", color: "var(--primary)",
                      display: "flex", alignItems: "center", justifyContent: "center" 
                    }}>
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "16px", marginBottom: "2px" }}>{getCaseName(c)}</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Modified {c.updated_at?.slice(0, 10) || "Today"}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-light)" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          <div className="premium-card" style={{ 
            background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", 
            color: "white", border: "none" 
          }}>
            <h3 style={{ color: "white", marginBottom: "16px", fontSize: "18px" }}>AI Power Tools</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Legal Assistant", path: "/assistant", icon: Brain },
                { label: "Doc Drafting", path: "/drafting", icon: PenTool },
                { label: "View Deadlines", path: "/deadlines", icon: Calendar },
                { label: "All Cases", path: "/cases", icon: Briefcase },
              ].map((a) => (
                <button key={a.path} onClick={() => navigate(a.path)}
                  style={{ 
                    background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", 
                    borderRadius: "12px", padding: "16px", color: "#fff", 
                    display: "flex", flexDirection: "column", gap: "12px",
                    cursor: "pointer", transition: "all 0.2s", textAlign: "left"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <a.icon size={20} />
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="premium-card">
            <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>System Infrastructure</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "Deployment", value: "Production Ready", color: "var(--success)" },
                { label: "AI Backend", value: "Claude 3.5 Sonnet", color: "var(--primary)" },
                { label: "Database", value: "MongoDB Atlas", color: "#16A34A" },
                { label: "Vector Search", value: "FAISS Engine", color: "#0891B2" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>{s.label}</span>
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
