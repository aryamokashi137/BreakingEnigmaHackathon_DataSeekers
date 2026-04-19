import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Copy, Download, Check, Loader2, Scale, FileText, Settings, ChevronRight } from "lucide-react";
import { getDraftTypes, generateDraft } from "../api";

const Spinner = () => <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />;

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
    <div className="main-content fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>AI Document Drafting</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "500" }}>Generate professional legal documents with automated formatting.</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate("/")} style={{ borderRadius: "12px" }}>
          <ArrowLeft size={18} /> Exit Designer
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "32px", alignItems: "flex-start" }}>
        
        {/* Left Column: Configuration */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Document Selection */}
          <div className="premium-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FileText size={18} color="var(--primary)" /> Document Type
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {Object.entries(types).map(([key, val]) => (
                <button key={key} className="btn"
                  onClick={() => handleTypeChange(key)}
                  style={{
                    justifyContent: "space-between", padding: "12px 16px", borderRadius: "10px",
                    background: selectedType === key ? "var(--primary-light)" : "var(--bg-main)",
                    color: selectedType === key ? "var(--primary)" : "var(--text-main)",
                    border: `1.5px solid ${selectedType === key ? "var(--primary)" : "transparent"}`,
                    fontWeight: "700", fontSize: "14px"
                  }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
                      <FileText size={16} />
                    </div>
                    {val.label}
                  </div>
                  {selectedType === key && <ChevronRight size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="premium-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Settings size={18} color="var(--primary)" /> Parameters
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {Object.keys(formData).map((field) => (
                <div key={field}>
                  <label style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-light)", textTransform: "uppercase", display: "block", marginBottom: "8px", letterSpacing: "0.05em" }}>
                    {FIELD_LABELS[field] || field}
                  </label>
                  {MULTILINE.has(field) ? (
                    <textarea rows={4} value={formData[field]}
                      onChange={(e) => setFormData((p) => ({ ...p, [field]: e.target.value }))}
                      placeholder={`Enter ${FIELD_LABELS[field] || field}...`}
                      style={{ borderRadius: "10px", padding: "12px 16px" }} />
                  ) : (
                    <input value={formData[field]}
                      onChange={(e) => setFormData((p) => ({ ...p, [field]: e.target.value }))}
                      placeholder={`Enter ${FIELD_LABELS[field] || field}...`}
                      style={{ borderRadius: "10px", padding: "12px 16px" }} />
                  )}
                </div>
              ))}
              <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}
                style={{ width: "100%", padding: "14px", borderRadius: "12px", marginTop: "12px" }}>
                {loading ? <Spinner /> : <><Zap size={18} /> Generate Professional Draft</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Editor Preview */}
        <div style={{ height: "calc(100vh - 200px)", position: "sticky", top: "32px" }}>
          <div className="premium-card" style={{ height: "100%", padding: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "2px solid var(--border-subtle)" }}>
            <div style={{ padding: "20px 32px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-main)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "15px", marginBottom: "2px" }}>Live Draft Preview</h3>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>{selectedType ? types[selectedType]?.label : "Initializing..."}</p>
              </div>
              {draft && (
                <div style={{ display: "flex", gap: "12px" }}>
                  <button className="btn btn-secondary" onClick={handleCopy} style={{ borderRadius: "10px", padding: "8px 16px" }}>
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                  </button>
                  <button className="btn btn-primary" onClick={handleDownload} style={{ borderRadius: "10px", padding: "8px 16px" }}>
                    <Download size={14} /> Download
                  </button>
                </div>
              )}
            </div>
            
            <div style={{ flex: 1, position: "relative", background: "#fdfdfd" }}>
              <textarea
                value={loading ? "Generating your legal document with AI precision...\nPlease wait." : draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="The AI will render your professional legal draft here after you fill in the parameters on the left."
                style={{
                  width: "100%", height: "100%", padding: "40px",
                  fontFamily: "'Courier New', Courier, monospace", fontSize: "14px", lineHeight: "1.8",
                  border: "none", resize: "none", background: "transparent",
                  color: "var(--text-main)", outline: "none",
                  whiteSpace: "pre-wrap"
                }}
              />
              {!draft && !loading && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", opacity: 0.3 }}>
                  <Scale size={80} style={{ marginBottom: "20px" }} />
                  <p style={{ fontWeight: "700" }}>No content generated yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
