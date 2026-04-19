import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Grid, List, Trash2, Clock, ChevronRight, MoreHorizontal } from "lucide-react";
import { getCases, createCase, deleteCase } from "../api";
import { useAuth } from "../App";

export default function Cases() {
  const navigate = useNavigate();
  const { lawyer } = useAuth();
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const loadCases = () => getCases(lawyer.lawyer_id).then((r) => setCases(r.data));

  useEffect(() => { if (lawyer) loadCases(); }, [lawyer]);

  const handleCreate = async () => {
    const name = prompt("Enter Case Name:");
    if (!name?.trim()) return;
    await createCase(name.trim(), lawyer.lawyer_id);
    loadCases();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure?")) return;
    await deleteCase(id);
    loadCases();
  };

  const getMockData = (index) => {
    const statuses = [
      { text: "Investigation", color: "var(--primary)", bg: "var(--primary-light)" },
      { text: "In Progress", color: "#7E22CE", bg: "#F3E8FF" },
      { text: "Critical", color: "var(--danger)", bg: "#FEE2E2" }
    ];
    const categories = ["Criminal Defense", "Corporate", "Civil", "Tax Law", "Employment Law"];
    
    return {
      status: statuses[index % 3],
      category: categories[index % 5],
      fir: `FIR/2026/${1234 + index}`,
      progress: [35, 60, 75, 20, 85, 90][index % 6],
      client: ["Robert Johnson", "Smith Corporation", "Williams Family", "James Brown", "Green Industries", "Sarah Davis"][index % 6]
    };
  };

  const filteredCases = cases.filter(c => 
    (c.case_name || c.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main-content fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>Legal Matters</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "500" }}>
            Currently managing <span style={{ color: "var(--text-main)", fontWeight: "700" }}>{cases.length} active cases</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate} style={{ padding: "12px 24px", borderRadius: "12px" }}>
          <Plus size={20} /> New Case File
        </button>
      </div>

      {/* Toolbar */}
      <div className="premium-card" style={{ padding: "12px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} color="var(--text-light)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Search by case name, client, or FIR number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: "100%", padding: "12px 16px 12px 48px", borderRadius: "12px", 
              border: "1.5px solid transparent", background: "var(--bg-main)",
              fontSize: "14px", fontWeight: "500", outline: "none", transition: "all 0.2s"
            }}
            onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
            onBlur={e => e.currentTarget.style.borderColor = "transparent"}
          />
        </div>
        
        <div style={{ display: "flex", gap: "8px", background: "var(--bg-main)", padding: "6px", borderRadius: "10px" }}>
          <button 
            onClick={() => setViewMode("grid")}
            style={{ 
              padding: "8px", background: viewMode === "grid" ? "#fff" : "transparent", 
              border: "none", borderRadius: "8px", color: viewMode === "grid" ? "var(--primary)" : "var(--text-light)", 
              cursor: "pointer", boxShadow: viewMode === "grid" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <Grid size={20} />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            style={{ 
              padding: "8px", background: viewMode === "list" ? "#fff" : "transparent", 
              border: "none", borderRadius: "8px", color: viewMode === "list" ? "var(--primary)" : "var(--text-light)", 
              cursor: "pointer", boxShadow: viewMode === "list" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <List size={20} />
          </button>
        </div>

        <button className="btn btn-outline" style={{ borderRadius: "12px" }}>
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Cases View */}
      {viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {filteredCases.map((c, i) => {
            const mock = getMockData(i);
            return (
              <div
                key={c._id}
                className="premium-card"
                onClick={() => navigate(`/case/${c._id}`)}
                style={{ cursor: "pointer", position: "relative" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <span style={{ 
                    padding: "6px 14px", borderRadius: "10px", fontSize: "11px", fontWeight: "800",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    backgroundColor: mock.status.bg, color: mock.status.color
                  }}>
                    {mock.status.text}
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={(e) => handleDelete(e, c._id)}
                      style={{ background: "transparent", border: "none", color: "var(--text-light)", cursor: "pointer", padding: "4px" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--danger)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-light)"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: "18px", marginBottom: "4px", lineHeight: "1.3" }}>
                  {c.case_name || c.title || "Untitled Case"}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px", fontWeight: "500" }}>{mock.client}</p>

                <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "11px", color: "var(--text-light)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Category</p>
                    <p style={{ fontSize: "13px", fontWeight: "600" }}>{mock.category}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "11px", color: "var(--text-light)", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>FIR Number</p>
                    <p style={{ fontSize: "13px", fontWeight: "600" }}>{mock.fir}</p>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Completion</span>
                    <span style={{ fontSize: "12px", color: "var(--text-main)", fontWeight: "700" }}>{mock.progress}%</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-main)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ 
                      width: `${mock.progress}%`, height: "100%", 
                      background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)",
                      borderRadius: "4px"
                    }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="premium-card" style={{ padding: "0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Case Title</th>
                <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Client</th>
                <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Progress</th>
                <th style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c, i) => {
                const mock = getMockData(i);
                return (
                  <tr 
                    key={c._id} 
                    onClick={() => navigate(`/case/${c._id}`)}
                    style={{ cursor: "pointer", borderBottom: i < filteredCases.length - 1 ? "1px solid var(--border-subtle)" : "none", transition: "all 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-main)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Briefcase size={18} />
                        </div>
                        <span style={{ fontWeight: "600" }}>{c.case_name || c.title || "Untitled Case"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "var(--text-muted)" }}>{mock.client}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ 
                        padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700",
                        backgroundColor: mock.status.bg, color: mock.status.color
                      }}>
                        {mock.status.text}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "120px" }}>
                        <div style={{ flex: 1, height: "6px", background: "var(--bg-main)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${mock.progress}%`, height: "100%", background: "var(--primary)" }}></div>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: "700" }}>{mock.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={(e) => handleDelete(e, c._id)} style={{ background: "transparent", border: "none", color: "var(--text-light)", cursor: "pointer" }}>
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={18} color="var(--text-light)" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
