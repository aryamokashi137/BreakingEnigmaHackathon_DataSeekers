import { useState, useEffect } from "react";
import { Plus, Calendar, Loader2, AlertCircle, Zap, Clock, ChevronRight, CheckCircle2 } from "lucide-react";
import { getCases, getTimeline, extractDeadlines, addEvent } from "../api";
import { useAuth } from "../App";

const Spinner = () => <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />;

const TYPE_META = {
  hearing:         { bg: "#E0E7FF", color: "#4338CA", label: "🏛️ Hearing" },
  filing_deadline: { bg: "#FEE2E2", color: "#B91C1C", label: "📌 Filing" },
  submission:      { bg: "#FEF9C3", color: "#92400E", label: "📤 Submission" },
  judgment:        { bg: "#DCFCE7", color: "#15803D", label: "⚖️ Judgment" },
  notice:          { bg: "#F3E8FF", color: "#7E22CE", label: "📬 Notice" },
  other:           { bg: "var(--bg-main)", color: "var(--text-muted)", label: "📅 Event" },
};

export default function Deadlines() {
  const { lawyer } = useAuth();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", type: "hearing", description: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lawyer) return;
    getCases(lawyer.lawyer_id).then((r) => {
      setCases(r.data);
      if (r.data.length > 0) setSelectedCase(r.data[0]._id);
    });
  }, [lawyer]);

  useEffect(() => {
    if (!selectedCase) return;
    loadTimeline();
  }, [selectedCase]);

  const loadTimeline = () => {
    getTimeline(selectedCase).then((r) => {
      setUpcoming(r.data.upcoming || []);
      setPast(r.data.past || []);
    }).catch(() => {});
  };

  const handleExtract = async () => {
    setExtracting(true); setError("");
    try { await extractDeadlines(selectedCase); loadTimeline(); }
    catch (e) { setError(e.response?.data?.detail || "Failed to extract. Upload documents first."); }
    finally { setExtracting(false); }
  };

  const handleAdd = async () => {
    if (!form.date || !form.description.trim()) { setError("Fill in date and description."); return; }
    setAdding(true); setError("");
    try {
      await addEvent(selectedCase, form);
      setForm({ date: "", type: "hearing", description: "" });
      setShowForm(false);
      loadTimeline();
    } catch { setError("Failed to add event."); }
    finally { setAdding(false); }
  };

  const total = upcoming.length + past.length;

  return (
    <div className="main-content fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>Deadlines & Calendar</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "500" }}>Track important dates and court schedules</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <select 
              value={selectedCase} 
              onChange={(e) => setSelectedCase(e.target.value)}
              style={{ 
                padding: "10px 16px", borderRadius: "12px", border: "1.5px solid var(--border-subtle)", 
                background: "var(--bg-card)", fontSize: "14px", fontWeight: "600",
                minWidth: "200px"
              }}
            >
              {cases.length === 0 && <option value="">No cases</option>}
              {cases.map((c) => <option key={c._id} value={c._id}>{c.case_name}</option>)}
            </select>
          </div>
          <button className="btn btn-secondary" onClick={() => setShowForm(!showForm)} style={{ borderRadius: "12px" }}>
            <Plus size={18} /> Add Event
          </button>
          <button className="btn btn-primary" onClick={handleExtract} disabled={extracting || !selectedCase} style={{ borderRadius: "12px" }}>
            {extracting ? <><Spinner /> Extracting...</> : <><Zap size={18} /> AI Extract</>}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", padding: "16px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", fontWeight: "500" }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Add Event Form */}
      {showForm && (
        <div className="premium-card scale-in" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Add Event Manually</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: "16px", alignItems: "flex-end" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Type</label>
              <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}>
                {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase" }}>Description</label>
              <input value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="e.g. Hearing before District Court" />
            </div>
            <button className="btn btn-primary" onClick={handleAdd} disabled={adding} style={{ borderRadius: "8px", height: "42px", padding: "0 24px" }}>
              {adding ? <Spinner /> : "Save Event"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.8fr) minmax(0, 1.2fr)", gap: "32px" }}>
        
        {/* Events List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {upcoming.length > 0 && (
            <div className="premium-card" style={{ background: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)", border: "1px solid #FECDD3", padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#E11D48", boxShadow: "0 4px 12px rgba(225, 29, 72, 0.1)" }}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: "800", color: "#E11D48", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Critical Deadline</p>
                  <p style={{ fontSize: "15px", color: "#881337", fontWeight: "600" }}><strong>{upcoming[0].date}</strong> — {upcoming[0].description}</p>
                </div>
              </div>
            </div>
          )}

          {total === 0 && !extracting && (
            <div className="premium-card" style={{ padding: "64px", textAlign: "center" }}>
              <Calendar size={64} color="var(--border-subtle)" style={{ marginBottom: "24px", opacity: 0.5 }} />
              <h3 style={{ marginBottom: "8px" }}>No scheduled events</h3>
              <p style={{ color: "var(--text-muted)", maxWidth: "320px", margin: "0 auto" }}>Extract deadlines from your case documents using AI or add them manually.</p>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <Clock size={18} color="var(--primary)" />
                <h3 style={{ fontSize: "15px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Upcoming Events</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {upcoming.map((e, i) => {
                  const m = TYPE_META[e.type] || TYPE_META.other;
                  return (
                    <div key={i} className="premium-card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ padding: "8px 12px", borderRadius: "8px", background: m.bg, color: m.color, fontSize: "12px", fontWeight: "700" }}>
                          {m.label.split(" ")[1]}
                        </div>
                        <div>
                          <p style={{ fontSize: "15px", fontWeight: "600" }}>{e.description}</p>
                          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>{m.label.split(" ")[0]} {m.label.split(" ")[1]}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main)" }}>{e.date}</p>
                        <p style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "700" }}>Active Matter</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <CheckCircle2 size={18} color="var(--success)" />
                <h3 style={{ fontSize: "15px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Past Events</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[...past].reverse().map((e, i) => {
                  const m = TYPE_META[e.type] || TYPE_META.other;
                  return (
                    <div key={i} className="premium-card" style={{ padding: "14px 20px", opacity: 0.8, display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-main)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ padding: "6px 10px", borderRadius: "8px", background: "#F1F5F9", color: "#64748B", fontSize: "11px", fontWeight: "700" }}>
                          {m.label.split(" ")[1]}
                        </div>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "500" }}>{e.description}</p>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-light)" }}>{e.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div className="premium-card">
            <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Event Statistics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "Pending Hearings", value: upcoming.filter(e => e.type === "hearing").length, color: "var(--primary)" },
                { label: "Filing Deadlines", value: upcoming.filter(e => e.type === "filing_deadline").length, color: "var(--danger)" },
                { label: "Completed Matters", value: past.length, color: "var(--success)" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>{s.label}</span>
                  <span style={{ fontSize: "15px", fontWeight: "800", color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "24px", padding: "16px", background: "var(--bg-main)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                <span style={{ color: "var(--primary)", fontWeight: "700" }}>Tip:</span> You can use the "AI Extract" button to automatically find dates and deadlines from your case documents.
              </p>
            </div>
          </div>

          <div className="premium-card" style={{ background: "#F8FAFC" }}>
            <h4 style={{ marginBottom: "16px" }}>Upcoming Focus</h4>
            {upcoming.slice(0, 3).map((e, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", padding: "12px 0", borderBottom: i < 2 ? "1px solid var(--border-subtle)" : "none" }}>
                <div style={{ width: "4px", borderRadius: "2px", background: "var(--primary)" }}></div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "700", marginBottom: "2px" }}>{e.description}</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{e.date}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
