import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, FolderOpen, Plus, Trash2, FileText, PenTool } from "lucide-react";
import { getCases, createCase, deleteCase } from "../api";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [caseName, setCaseName] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const load = () => getCases().then((r) => setCases(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!caseName.trim()) return;
    setCreating(true);
    await createCase(caseName.trim());
    setCaseName("");
    setCreating(false);
    load();
  };

  const handleDelete = async (e, caseId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this case and all its documents?")) return;
    await deleteCase(caseId);
    load();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      {/* Top Nav */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #E2E8F0",
        padding: "0 32px", height: 60, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Scale size={22} color="#4F46E5" />
          <span style={{ fontWeight: 700, fontSize: 17, color: "#0F172A" }}>LegalAI</span>
          <span style={{ fontSize: 11, background: "#EEF2FF", color: "#4F46E5", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>BETA</span>
        </div>
        <button
          className="btn"
          onClick={() => navigate("/drafting")}
          style={{ background: "#4F46E5", color: "#fff" }}
        >
          <PenTool size={14} /> AI Drafting
        </button>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
            Case Dashboard
          </h1>
          <p style={{ color: "#64748B", fontSize: 15 }}>
            Manage your legal cases, upload documents, and get AI-powered insights.
          </p>
        </div>

        {/* Create Case */}
        <div style={{
          background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12,
          padding: 24, marginBottom: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: "#374151" }}>
            Create New Case
          </h3>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="Enter case name (e.g. State vs. Sharma 2024)..."
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              style={{
                flex: 1, padding: "10px 14px", border: "1px solid #E2E8F0",
                borderRadius: 8, fontSize: 14, background: "#F8FAFC",
              }}
            />
            <button
              className="btn"
              onClick={handleCreate}
              disabled={creating || !caseName.trim()}
              style={{ background: "#4F46E5", color: "#fff", padding: "10px 20px" }}
            >
              <Plus size={15} /> {creating ? "Creating..." : "Create Case"}
            </button>
          </div>
        </div>

        {/* Cases Grid */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>
            All Cases <span style={{ color: "#94A3B8", fontWeight: 400 }}>({cases.length})</span>
          </h3>
        </div>

        {cases.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            background: "#fff", borderRadius: 12, border: "1px dashed #CBD5E1",
          }}>
            <FolderOpen size={40} color="#CBD5E1" style={{ marginBottom: 12 }} />
            <p style={{ color: "#94A3B8", fontSize: 15 }}>No cases yet. Create your first case above.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {cases.map((c) => (
              <div
                key={c._id}
                onClick={() => navigate(`/case/${c._id}`)}
                style={{
                  background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12,
                  padding: 20, cursor: "pointer", transition: "all 0.15s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  position: "relative",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(79,70,229,0.12)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{
                    width: 40, height: 40, background: "#EEF2FF", borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
                  }}>
                    <FileText size={18} color="#4F46E5" />
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, c._id)}
                    className="btn"
                    style={{ background: "transparent", color: "#94A3B8", padding: "4px 6px" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#DC2626"}
                    onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>
                  {c.case_name}
                </h4>
                <p style={{ fontSize: 12, color: "#94A3B8" }}>
                  Created {c.created_at?.slice(0, 10)}
                </p>
                <div style={{
                  marginTop: 14, paddingTop: 12, borderTop: "1px solid #F1F5F9",
                  fontSize: 12, color: "#4F46E5", fontWeight: 600,
                }}>
                  Open Workspace →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
