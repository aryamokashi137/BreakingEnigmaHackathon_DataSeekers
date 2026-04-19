import { useState, useEffect, useRef } from "react";
import { Upload, FileText, Trash2, Loader2, FolderOpen, Search, CheckCircle, File, MoreVertical, X } from "lucide-react";
import { getCases, getDocuments, uploadDocument, deleteDocument, summarizeDocument } from "../api";
import { intentMeta } from "../theme";

const Spinner = () => <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />;

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
    <div className="main-content fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>Repository</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "500" }}>Manage and index documents for automated legal research</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            style={{ 
              padding: "10px 16px", borderRadius: "12px", border: "1.5px solid var(--border-subtle)", 
              background: "var(--bg-card)", fontSize: "14px", fontWeight: "600", minWidth: "200px"
            }}
          >
            {cases.length === 0 && <option value="">No cases</option>}
            {cases.map((c) => <option key={c._id} value={c._id}>{c.case_name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading || !selectedCase} style={{ borderRadius: "12px" }}>
            {uploading ? <><Spinner /> Processing...</> : <><Upload size={18} /> Upload New</>}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            onChange={handleUpload} style={{ display: "none" }} />
        </div>
      </div>

      {/* Drop zone / Upload Area */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{ 
          border: "2px dashed var(--border-focus)", borderRadius: "20px", 
          padding: "48px 24px", display: "flex", flexDirection: "column", 
          alignItems: "center", background: "var(--primary-light)", 
          cursor: "pointer", transition: "all 0.2s", opacity: uploading ? 0.6 : 1
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "#EEF2FF"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-focus)"; e.currentTarget.style.background = "var(--primary-light)"; }}
      >
        <div style={{ 
          width: "64px", height: "64px", borderRadius: "20px", 
          background: "white", display: "flex", alignItems: "center", 
          justifyContent: "center", marginBottom: "16px",
          boxShadow: "0 8px 16px -4px rgba(79, 70, 229, 0.1)"
        }}>
          <Upload size={32} color="var(--primary)" />
        </div>
        <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>{uploading ? "Analyzing document..." : "Import Document"}</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>Drag and drop or click to browse files (PDF, DOCX, TXT)</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
        
        {/* Documents Table */}
        <div className="premium-card" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "16px" }}>Case Documents</h3>
            <div style={{ fontSize: "13px", color: "var(--text-light)", fontWeight: "600" }}>{docs.length} items total</div>
          </div>

          {docs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <FolderOpen size={48} color="var(--border-subtle)" style={{ marginBottom: "16px", opacity: 0.5 }} />
              <p style={{ color: "var(--text-muted)", fontWeight: "500" }}>No documents found for this case file.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Document Name", "Index Status", "Uploaded On", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "16px 32px", fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, i) => (
                  <tr key={doc._id} style={{ borderBottom: i < docs.length - 1 ? "1px solid var(--border-subtle)" : "none", transition: "all 0.1s" }}>
                    <td style={{ padding: "20px 32px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ 
                          width: "40px", height: "40px", borderRadius: "10px", 
                          background: "#F8FAFC", border: "1px solid var(--border-subtle)",
                          display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)"
                        }}>
                          <File size={20} />
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>{doc.filename}</span>
                      </div>
                    </td>
                    <td style={{ padding: "20px 32px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {doc.has_text ? (
                          <>
                            <CheckCircle size={14} color="var(--success)" />
                            <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: "700" }}>RAG Indexed</span>
                          </>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--text-light)", fontWeight: "600" }}>Image (OCR Pending)</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "20px 32px", fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>{doc.created_at?.slice(0, 10)}</td>
                    <td style={{ padding: "20px 32px" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button className="btn btn-secondary"
                          onClick={() => handleSummarize(doc.filename)}
                          disabled={summarizing === doc.filename || !doc.has_text}
                          style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "12px" }}>
                          {summarizing === doc.filename ? <Spinner /> : "Summarize"}
                        </button>
                        <button className="btn btn-outline" onClick={() => handleDelete(doc._id)}
                          style={{ padding: "8px", borderRadius: "10px", borderColor: "transparent" }}>
                          <Trash2 size={16} color="var(--danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary output with a premium floating card effect */}
        {summary && (
          <div className="premium-card scale-in" style={{ 
            border: "1.5px solid var(--primary)", background: "var(--bg-card)",
            boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={20} />
                </div>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", marginBottom: "2px" }}>AI Summary Generation</p>
                  <h3 style={{ fontSize: "16px" }}>{summary.filename}</h3>
                </div>
              </div>
              <button className="btn" onClick={() => setSummary(null)} style={{ background: "var(--bg-main)", borderRadius: "8px", padding: "8px" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ 
              background: "var(--bg-main)", padding: "24px", borderRadius: "12px", 
              fontSize: "15px", lineHeight: "1.75", color: "var(--text-main)",
              whiteSpace: "pre-wrap", border: "1px solid var(--border-subtle)"
            }}>
              {summary.text}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="btn btn-outline" style={{ borderRadius: "10px" }} onClick={() => {
                navigator.clipboard.writeText(summary.text);
                alert("Summary copied to clipboard!");
              }}>Copy to Clipboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
