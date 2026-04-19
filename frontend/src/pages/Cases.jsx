import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Grid, List, Trash2, Clock } from "lucide-react";
import { getCases, createCase, deleteCase } from "../api";

export default function Cases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");

  const loadCases = () => getCases().then((r) => setCases(r.data));

  useEffect(() => {
    loadCases();
  }, []);

  const handleCreate = async () => {
    const name = prompt("Enter Case Name:");
    if (!name) return;
    await createCase(name);
    loadCases();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure?")) return;
    await deleteCase(id);
    loadCases();
  };

  // Helper to generate mock data for UI enhancement since backend might not have it
  const getMockData = (index) => {
    const statuses = [
      { text: "Investigation", color: "#DBEAFE", textColor: "#1E40AF" },
      { text: "Chargesheet", color: "#F3E8FF", textColor: "#7E22CE" },
      { text: "Trial", color: "#FFEDD5", textColor: "#C2410C" }
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <style>{`
        .delete-btn { display: none; }
        .card-grid > div:hover .delete-btn { display: flex; }
      `}</style>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0F172A", marginBottom: "4px" }}>Cases</h1>
          <p style={{ color: "#64748B", fontSize: "15px" }}>Manage and track all your legal cases</p>
        </div>
        <button
          className="btn"
          onClick={handleCreate}
          style={{ background: "#1E3A8A", color: "#fff", padding: "10px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}
        >
          <Plus size={18} /> New Case
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        padding: "16px", background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0"
      }}>
        <div style={{ display: "flex", gap: "12px", flex: 1, maxWidth: "700px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Search cases by name, client, or FIR number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: "8px", border: "1px solid #E2E8F0", outline: "none", fontSize: "14px" }}
            />
          </div>
          <select style={{ padding: "10px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", color: "#475569", fontSize: "14px", fontWeight: "500", outline: "none" }}>
            <option>All Cases</option>
            <option>Active</option>
            <option>Closed</option>
          </select>
          <button style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", color: "#475569", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>
            <Filter size={16} />
          </button>
        </div>
        
        <div style={{ display: "flex", gap: "8px", marginLeft: "24px" }}>
          <button style={{ padding: "8px", background: "#F1F5F9", border: "none", borderRadius: "6px", color: "#1E3A8A", cursor: "pointer" }}><Grid size={20} /></button>
          <button style={{ padding: "8px", background: "transparent", border: "none", borderRadius: "6px", color: "#64748B", cursor: "pointer" }}><List size={20} /></button>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="card-grid">
        {cases.filter(c => (c.case_name || c.title || "").toLowerCase().includes(search.toLowerCase())).map((c, i) => {
          const mock = getMockData(i);
          return (
            <div
              key={c._id}
              onClick={() => navigate(`/case/${c._id}`)}
              style={{
                background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px",
                padding: "20px", cursor: "pointer", transition: "all 0.15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "relative"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"}
            >
              {/* Header tags */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ 
                  padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                  backgroundColor: mock.status.color, color: mock.status.textColor
                }}>
                  {mock.status.text}
                </span>
                <span style={{ fontSize: "12px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} /> {c.created_at ? c.created_at.slice(0, 10) : "2026-04-15"}
                </span>
              </div>

              {/* Title & Client */}
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0F172A", marginBottom: "4px" }}>
                  {c.case_name || c.title || "Untitled Case"}
                </h3>
                <p style={{ fontSize: "14px", color: "#64748B" }}>{mock.client}</p>
              </div>

              {/* Details */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", color: "#64748B" }}>{mock.category}</span>
                <span style={{ fontSize: "13px", color: "#64748B" }}>{mock.fir}</span>
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#475569", fontWeight: "500" }}>Progress</span>
                  <span style={{ fontSize: "13px", color: "#0F172A", fontWeight: "600" }}>{mock.progress}%</span>
                </div>
                <div style={{ width: "100%", height: "6px", backgroundColor: "#F1F5F9", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${mock.progress}%`, height: "100%", backgroundColor: "#4F46E5" }}></div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => handleDelete(e, c._id)}
                className="delete-btn"
                style={{
                  position: "absolute", top: "20px", right: "20px",
                  background: "rgba(255, 255, 255, 0.9)", border: "1px solid #E2E8F0", color: "#94A3B8",
                  padding: "6px", borderRadius: "6px", cursor: "pointer", 
                  alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#DC2626"}
                onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
