import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Copy, Download, Check, Loader2, Scale, FileText } from "lucide-react";
import { getDraftTypes, generateDraft } from "../api";

const Spinner = () => <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />;

const FIELD_LABELS = {
  deponent_name: "Deponent Name", age: "Age", address: "Address",
  statement: "Statement / Facts", date: "Date", location: "Location / City",
  applicant_name: "Applicant Name", case_number: "Case Number", court_name: "Court Name",
  charges: "Charges / Offence", grounds: "Grounds for Bail",
  sender_name: "Sender Name", sender_address: "Sender Address",
  recipient_name: "Recipient Name", recipient_address: "Recipient Address",
  subject: "Subject", facts: "Facts of the Matter", demand: "Demand / Relief Sought",
};
const MULTILINE = new Set(["statement", "grounds", "facts", "charges", "demand", "address", "sender_address", "recipient_address"]);

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

  const initForm = (all, type) => {
    setFormData(Object.fromEntries((all[type]?.fields || []).map((f) => [f, ""])));
    setDraft("");
  };

  const handleTypeChange = (type) => { setSelectedType(type); initForm(types, type); };

  const handleGenerate = async () => {
    const empty = Object.entries(formData).find(([, v]) => !v.trim());
    if (empty) { alert(`Please fill in: ${FIELD_LABELS[empty[0]] || empty[0]}`); return; }
    setLoading(true); setDraft("");
    try { const res = await generateDraft(selectedType, formData); setDraft(res.data.draft); }
    catch { setDraft("Failed to generate draft. Please try again."); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([draft], { type: "text/plain" })),
      download: `${selectedType}_draft.txt`,
    });
    a.click();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <nav style={{
        background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 32px",
        height: 56, display: "flex", alignItems: "center", gap: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <Scale size={18} color="#4F46E5" />
        <span style={{ fontWeight: 700, fontSize: 15 }}>LegalAI</span>
        <span style={{ color: "#CBD5E1" }}>›</span>
        <span style={{ color: "#64748B", fontSize: 14 }}>AI Document Drafting</span>
        <button className="btn" onClick={() => navigate("/")} style={{ background: "#F1F5F9", color: "#475569", marginLeft: "auto" }}>
          <ArrowLeft size={14} /> Back
        </button>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>✍️ AI Document Drafting</h1>
          <p style={{ color: "#64748B" }}>Fill in the details and get a complete, professionally formatted legal document instantly.</p>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Left — Form */}
          <div style={{ width: 380, flexShrink: 0 }}>
            {/* Type selector */}
            <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 10 }}>
                Document Type
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(types).map(([key, val]) => (
                  <button key={key} className="btn"
                    onClick={() => handleTypeChange(key)}
                    style={{
                      justifyContent: "flex-start", padding: "10px 14px",
                      background: selectedType === key ? "#EEF2FF" : "#F8FAFC",
                      color: selectedType === key ? "#4F46E5" : "#374151",
                      border: `1px solid ${selectedType === key ? "#C7D2FE" : "#E2E8F0"}`,
                      fontWeight: selectedType === key ? 700 : 500,
                    }}>
                    <FileText size={14} /> {val.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 14 }}>
                Document Details
              </label>
              {Object.keys(formData).map((field) => (
                <div key={field} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
                    {FIELD_LABELS[field] || field}
                  </label>
                  {MULTILINE.has(field) ? (
                    <textarea rows={3} value={formData[field]}
                      onChange={(e) => setFormData((p) => ({ ...p, [field]: e.target.value }))}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, resize: "vertical", background: "#F8FAFC" }} />
                  ) : (
                    <input value={formData[field]}
                      onChange={(e) => setFormData((p) => ({ ...p, [field]: e.target.value }))}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, background: "#F8FAFC" }} />
                  )}
                </div>
              ))}
              <button className="btn" onClick={handleGenerate} disabled={loading}
                style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 14,
                  background: loading ? "#E2E8F0" : "#4F46E5", color: loading ? "#94A3B8" : "#fff", marginTop: 4 }}>
                {loading ? <><Spinner /> Generating...</> : <><Zap size={15} /> Generate Draft</>}
              </button>
            </div>
          </div>

          {/* Right — Output */}
          <div style={{ flex: 1 }}>
            <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Generated Document</span>
                {draft && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" onClick={handleCopy} style={{ background: "#F1F5F9", color: "#475569", padding: "6px 12px" }}>
                      {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                    </button>
                    <button className="btn" onClick={handleDownload} style={{ background: "#F1F5F9", color: "#475569", padding: "6px 12px" }}>
                      <Download size={13} /> Download
                    </button>
                  </div>
                )}
              </div>
              <textarea
                value={loading ? "⚡ Generating your document..." : draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Your generated legal document will appear here..."
                style={{
                  width: "100%", minHeight: 580, padding: 20,
                  fontFamily: "'Courier New', monospace", fontSize: 13, lineHeight: 1.7,
                  border: "none", resize: "none", background: draft ? "#fff" : "#FAFAFA",
                  color: "#1E293B", outline: "none",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
