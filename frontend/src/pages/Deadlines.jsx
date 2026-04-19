import { useState, useEffect } from "react";
import { Plus, Calendar, Loader2, AlertCircle } from "lucide-react";
import { getCases, getTimeline, extractDeadlines, addEvent } from "../api";

const Spinner = () => <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />;

const TYPE_META = {
  hearing:         { bg: "#DBEAFE", color: "#1D4ED8", dot: "#3B82F6", label: "🏛️ Hearing" },
  filing_deadline: { bg: "#FEE2E2", color: "#B91C1C", dot: "#EF4444", label: "📌 Filing Deadline" },
  submission:      { bg: "#FEF9C3", color: "#92400E", dot: "#F59E0B", label: "📤 Submission" },
  judgment:        { bg: "#DCFCE7", color: "#15803D", dot: "#22C55E", label: "⚖️ Judgment" },
  notice:          { bg: "#F3E8FF", color: "#7E22CE", dot: "#A855F7", label: "📬 Notice" },
  other:           { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8", label: "📅 Event" },
};

export default function Deadlines() {
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
    getCases().then((r) => {
      setCases(r.data);
      if (r.data.length > 0) setSelectedCase(r.data[0]._id);
    });
  }, []);

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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0F172A", marginBottom: "4px" }}>Deadlines & Calendar</h1>
          <p style={{ color: "#64748B", fontSize: "15px" }}>Track important dates and court schedules</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select value={selectedCase} onChange={(e) => setSelectedCase(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px", background: "#F8FAFC" }}>
            {cases.length === 0 && <option value="">No cases</option>}
            {cases.map((c) => <option key={c._id} value={c._id}>{c.case_name}</option>)}
          </select>
          <button className="btn" onClick={() => setShowForm(!showForm)}
            style={{ background: "#DCFCE7", color: "#16A34A" }}>
            <Plus size={15} /> Add Event
          </button>
          <button className="btn" onClick={handleExtract} disabled={extracting || !selectedCase}
            style={{ background: extracting ? "#E2E8F0" : "#1E3A8A", color: extracting ? "#94A3B8" : "#fff" }}>
            {extracting ? <><Spinner /> Extracting...</> : "⚡ Extract from Docs"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", padding: "12px 16px", borderRadius: "8px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Add Event Form */}
      {showForm && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "14px" }}>➕ Add Event Manually</h3>
          <div style={{ display: "grid", gridTemplateColumns: "160px 180px 1fr auto", gap: "10px", alignItems: "flex-end" }}>
            <div>
              <label style={{ fontSize: "11px", color: "#64748B", display: "block", marginBottom: "4px", fontWeight: "600" }}>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px" }} />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#64748B", display: "block", marginBottom: "4px", fontWeight: "600" }}>Type</label>
              <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px" }}>
                {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#64748B", display: "block", marginBottom: "4px", fontWeight: "600" }}>Description</label>
              <input value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="e.g. Hearing before District Court"
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px" }} />
            </div>
            <button className="btn" onClick={handleAdd} disabled={adding}
              style={{ background: adding ? "#E2E8F0" : "#16A34A", color: adding ? "#94A3B8" : "#fff" }}>
              {adding ? <Spinner /> : "Add"}
            </button>
          </div>
        </div>
      )}

      <div className="grid-layout">
        {/* Events List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Next upcoming callout */}
          {upcoming.length > 0 && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "24px" }}>🔴</span>
              <div>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#DC2626", textTransform: "uppercase", marginBottom: "2px" }}>Next Upcoming</p>
                <p style={{ fontSize: "14px", color: "#0F172A" }}><strong>{upcoming[0].date}</strong> — {upcoming[0].description}</p>
              </div>
            </div>
          )}

          {total === 0 && !extracting && (
            <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "48px", textAlign: "center", color: "#94A3B8" }}>
              <Calendar size={40} color="#CBD5E1" style={{ marginBottom: "12px" }} />
              <p>No events yet. Extract from documents or add manually.</p>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>🔴 Upcoming ({upcoming.length})</h3>
              {upcoming.map((e, i) => {
                const m = TYPE_META[e.type] || TYPE_META.other;
                return (
                  <div key={i} style={{ background: "#FFF7F7", border: "1px solid #FECACA", borderLeft: "4px solid #EF4444", borderRadius: "10px", padding: "14px 18px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ background: m.bg, color: m.color, padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", marginBottom: "6px", display: "inline-block" }}>{m.label}</span>
                      <p style={{ fontSize: "14px", color: "#0F172A" }}>{e.description}</p>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#DC2626", whiteSpace: "nowrap", marginLeft: "16px" }}>{e.date}</span>
                  </div>
                );
              })}
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>✅ Past ({past.length})</h3>
              {[...past].reverse().map((e, i) => {
                const m = TYPE_META[e.type] || TYPE_META.other;
                return (
                  <div key={i} style={{ background: "#fff", border: "1px solid #E2E8F0", borderLeft: `4px solid ${m.dot}`, borderRadius: "10px", padding: "14px 18px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ background: m.bg, color: m.color, padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", marginBottom: "6px", display: "inline-block" }}>{m.label}</span>
                      <p style={{ fontSize: "14px", color: "#374151" }}>{e.description}</p>
                    </div>
                    <span style={{ fontSize: "13px", color: "#64748B", whiteSpace: "nowrap", marginLeft: "16px" }}>{e.date}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {upcoming.length > 0 && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "12px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <AlertCircle size={18} color="#DC2626" />
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#991B1B" }}>Urgent Deadlines</h3>
              </div>
              {upcoming.slice(0, 3).map((e, i) => (
                <div key={i} style={{ paddingBottom: "10px", marginBottom: "10px", borderBottom: i < Math.min(upcoming.length, 3) - 1 ? "1px solid #FECACA" : "none" }}>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#1E293B", marginBottom: "2px" }}>{e.description}</p>
                  <p style={{ fontSize: "12px", color: "#DC2626" }}>{e.date}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#0F172A", marginBottom: "16px" }}>Stats</h3>
            {[
              { label: "Upcoming", value: upcoming.length, color: "#4F46E5" },
              { label: "Past", value: past.length, color: "#16A34A" },
              { label: "Total", value: total, color: "#0F172A" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "#64748B" }}>{s.label}</span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
