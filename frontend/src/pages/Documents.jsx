import { useState, useEffect, useRef } from "react";
import { Upload, FileText, Trash2, Loader2, FolderOpen } from "lucide-react";
import { getCases, getDocuments, uploadDocument, deleteDocument, summarizeDocument } from "../api";
import { intentMeta } from "../theme";

const Spinner = () => <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />;

export default function Documents() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(null);
  const [summary, setSummary] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    getCases().then((r) => {
      setCases(r.data);
      if (r.data.length > 0) setSelectedCase(r.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCase) return;
    getDocuments(selectedCase).then((r) => setDocs(r.data));
    setSummary(null);
  }, [selectedCase]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedCase) return;
    setUploading(true);
    await uploadDocument(selectedCase, file);
    e.target.value = "";
    setUploading(false);
    getDocuments(selectedCase).then((r) => setDocs(r.data));
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
    await deleteDocument(docId);
    getDocuments(selectedCase).then((r) => setDocs(r.data));
  };

  const handleSummarize = async (filename) => {
    setSummarizing(filename);
    setSummary(null);
    try {
      const res = await summarizeDocument(selectedCase, filename);
      setSummary({ filename, text: res.data.summary });
    } catch {
      setSummary({ filename, text: "Failed to summarize." });
    } finally {
      setSummarizing(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0F172A", marginBottom: "4px" }}>Documents</h1>
          <p style={{ color: "#64748B", fontSize: "15px" }}>Upload and manage legal documents for your cases</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px", background: "#F8FAFC" }}
          >
            {cases.length === 0 && <option value="">No cases</option>}
            {cases.map((c) => <option key={c._id} value={c._id}>{c.case_name}</option>)}
          </select>
          <button className="btn" onClick={() => fileRef.current?.click()} disabled={uploading || !selectedCase}
            style={{ background: "#1E3A8A", color: "#fff", padding: "10px 16px" }}>
            {uploading ? <><Spinner /> Uploading...</> : <><Upload size={16} /> Upload</>}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            onChange={handleUpload} style={{ display: "none" }} />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{ border: "2px dashed #CBD5E1", borderRadius: "12px", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", background: "#fff", cursor: "pointer", transition: "all 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#4F46E5"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#CBD5E1"}
      >
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
          <Upload size={28} color="#4F46E5" />
        </div>
        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A", marginBottom: "6px" }}>Click to upload documents</h3>
        <p style={{ color: "#64748B", fontSize: "13px" }}>PDF, DOCX, TXT, or images</p>
      </div>

      {/* Documents list */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #E2E8F0", fontWeight: "600", fontSize: "15px", color: "#0F172A" }}>
          Documents {selectedCase && `— ${cases.find(c => c._id === selectedCase)?.case_name || ""}`}
          <span style={{ marginLeft: "8px", fontSize: "13px", color: "#94A3B8", fontWeight: "400" }}>({docs.length})</span>
        </div>

        {docs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94A3B8" }}>
            <FolderOpen size={36} color="#CBD5E1" style={{ marginBottom: "10px" }} />
            <p>No documents uploaded yet for this case.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <tr>
                {["Name", "Indexed", "Uploaded", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 24px", fontSize: "12px", fontWeight: "600", color: "#64748B", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, i) => (
                <tr key={doc._id} style={{ borderBottom: i < docs.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                  <td style={{ padding: "14px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FileText size={18} color="#64748B" />
                      <span style={{ fontSize: "14px", fontWeight: "500", color: "#0F172A" }}>{doc.filename}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 24px" }}>
                    <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "20px", background: doc.has_text ? "#DCFCE7" : "#F1F5F9", color: doc.has_text ? "#16A34A" : "#64748B", fontWeight: "600" }}>
                      {doc.has_text ? "✓ Indexed" : "Image only"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 24px", fontSize: "13px", color: "#64748B" }}>{doc.created_at?.slice(0, 10)}</td>
                  <td style={{ padding: "14px 24px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn"
                        onClick={() => handleSummarize(doc.filename)}
                        disabled={summarizing === doc.filename || !doc.has_text}
                        style={{ background: "#F3E8FF", color: "#7C3AED", padding: "5px 10px", fontSize: "12px" }}>
                        {summarizing === doc.filename ? <><Spinner /> Summarizing...</> : "📄 Summarize"}
                      </button>
                      <button className="btn" onClick={() => handleDelete(doc._id)}
                        style={{ background: "#FEF2F2", color: "#DC2626", padding: "5px 8px" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary output */}
      {summary && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0F172A" }}>
              <span style={{ ...{ fontSize: "11px", background: intentMeta.summarize.bg, color: intentMeta.summarize.color, padding: "2px 8px", borderRadius: "20px", fontWeight: "700", marginRight: "8px" } }}>📄 SUMMARIZER</span>
              {summary.filename}
            </h3>
            <button className="btn" onClick={() => setSummary(null)} style={{ background: "#F1F5F9", color: "#64748B", padding: "4px 10px", fontSize: "12px" }}>✕ Close</button>
          </div>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#374151", whiteSpace: "pre-wrap" }}>{summary.text}</p>
        </div>
      )}
    </div>
  );
}
