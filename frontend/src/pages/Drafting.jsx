import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDraftTypes, generateDraft } from "../api";

const FIELD_LABELS = {
  deponent_name: "Deponent Name",
  age: "Age",
  address: "Address",
  statement: "Statement / Facts",
  date: "Date",
  location: "Location / City",
  applicant_name: "Applicant Name",
  case_number: "Case Number",
  court_name: "Court Name",
  charges: "Charges / Offence",
  grounds: "Grounds for Bail",
  sender_name: "Sender Name",
  sender_address: "Sender Address",
  recipient_name: "Recipient Name",
  recipient_address: "Recipient Address",
  subject: "Subject",
  facts: "Facts of the Matter",
  demand: "Demand / Relief Sought",
};

const MULTILINE_FIELDS = new Set(["statement", "grounds", "facts", "charges", "demand"]);

export default function Drafting() {
  const navigate = useNavigate();
  const [types, setTypes] = useState({});
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({});
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getDraftTypes().then((r) => {
      setTypes(r.data);
      const first = Object.keys(r.data)[0];
      setSelectedType(first);
      initForm(r.data, first);
    });
  }, []);

  const initForm = (allTypes, type) => {
    const fields = allTypes[type]?.fields || [];
    setFormData(Object.fromEntries(fields.map((f) => [f, ""])));
    setDraft("");
  };

  const handleTypeChange = (e) => {
    const t = e.target.value;
    setSelectedType(t);
    initForm(types, t);
  };

  const handleGenerate = async () => {
    const empty = Object.entries(formData).find(([, v]) => !v.trim());
    if (empty) {
      alert(`Please fill in: ${FIELD_LABELS[empty[0]] || empty[0]}`);
      return;
    }
    setLoading(true);
    setDraft("");
    try {
      const res = await generateDraft(selectedType, formData);
      setDraft(res.data.draft);
    } catch {
      setDraft("Failed to generate draft. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([draft], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedType}_draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <button onClick={() => navigate("/")} style={{ marginBottom: 16 }}>← Back</button>
      <h2>✍️ AI Document Drafting</h2>
      <p style={{ color: "#666", marginTop: 0 }}>Fill in the details and get a complete legal document instantly.</p>

      <div style={{ display: "flex", gap: 24 }}>

        {/* Left — Form */}
        <div style={{ width: 380, flexShrink: 0 }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: 6 }}>Document Type</label>
          <select
            value={selectedType}
            onChange={handleTypeChange}
            style={{ width: "100%", padding: 8, marginBottom: 16 }}
          >
            {Object.entries(types).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>

          {Object.keys(formData).map((field) => (
            <div key={field} style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 4, fontWeight: "500" }}>
                {FIELD_LABELS[field] || field}
              </label>
              {MULTILINE_FIELDS.has(field) ? (
                <textarea
                  rows={4}
                  style={{ width: "100%", padding: 8, boxSizing: "border-box", resize: "vertical" }}
                  value={formData[field]}
                  onChange={(e) => setFormData((p) => ({ ...p, [field]: e.target.value }))}
                />
              ) : (
                <input
                  style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
                  value={formData[field]}
                  onChange={(e) => setFormData((p) => ({ ...p, [field]: e.target.value }))}
                />
              )}
            </div>
          ))}

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 0",
              background: loading ? "#ccc" : "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4,
            }}
          >
            {loading ? "Generating..." : "⚡ Generate Draft"}
          </button>
        </div>

        {/* Right — Output */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontWeight: "bold" }}>Generated Document</label>
            {draft && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleCopy} style={{ fontSize: 12, padding: "4px 10px" }}>
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
                <button onClick={handleDownload} style={{ fontSize: 12, padding: "4px 10px" }}>
                  ⬇️ Download
                </button>
              </div>
            )}
          </div>
          <textarea
            readOnly={false}
            value={loading ? "Generating your document..." : draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Your generated legal document will appear here..."
            style={{
              flex: 1,
              minHeight: 520,
              padding: 14,
              fontFamily: "monospace",
              fontSize: 13,
              lineHeight: 1.6,
              border: "1px solid #ddd",
              borderRadius: 4,
              resize: "none",
              background: draft ? "#fff" : "#fafafa",
              color: "#222",
            }}
          />
        </div>
      </div>
    </div>
  );
}
