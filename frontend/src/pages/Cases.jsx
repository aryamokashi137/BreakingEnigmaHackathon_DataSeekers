import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCases, createCase } from "../api";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [caseName, setCaseName] = useState("");
  const navigate = useNavigate();

  const load = () => getCases().then((r) => setCases(r.data));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!caseName.trim()) return;
    await createCase(caseName.trim());
    setCaseName("");
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>⚖️ Legal Workflow Assistant</h2>

      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Case name..."
          value={caseName}
          onChange={(e) => setCaseName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          style={{ padding: 8, width: 260, marginRight: 8 }}
        />
        <button onClick={handleCreate}>+ Create Case</button>
      </div>

      <h3>Cases</h3>
      {cases.length === 0 && <p>No cases yet.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {cases.map((c) => (
          <li
            key={c._id}
            onClick={() => navigate(`/case/${c._id}`)}
            style={{
              padding: "10px 14px",
              marginBottom: 8,
              background: "#f0f0f0",
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            📁 {c.case_name}
            <span style={{ fontSize: 12, color: "#888", marginLeft: 12 }}>
              {c.created_at?.slice(0, 10)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
