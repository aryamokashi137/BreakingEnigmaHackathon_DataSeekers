import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Zap, RefreshCw, Plus, Scale, Calendar } from "lucide-react";
import { extractDeadlines, getTimeline, addEvent } from "../api";

const Spinner = () => <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />;

const TYPE_META = {
  hearing:         { bg: "#DBEAFE", color: "#1D4ED8", dot: "#3B82F6", label: "🏛️ Hearing" },
  filing_deadline: { bg: "#FEE2E2", color: "#B91C1C", dot: "#EF4444", label: "📌 Filing Deadline" },
  submission:      { bg: "#FEF9C3", color: "#92400E", dot: "#F59E0B", label: "📤 Submission" },
  judgment:        { bg: "#DCFCE7", color: "#15803D", dot: "#22C55E", label: "⚖️ Judgment" },
  notice:          { bg: "#F3E8FF", color: "#7E22CE", dot: "#A855F7", label: "📬 Notice" },
  other:           { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8", label: "📅 Event" },
};

const Badge = ({ type }) => {
  const m = TYPE_META[type] || TYPE_META.other;
  return (
    <span style={{ background: m.bg, color: m.color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
      {m.label}
    </span>
  );
};

const EventRow = ({ event, upcoming }) => {
  const m = TYPE_META[event.type] || TYPE_META.other;
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 12 }}>
      {/* Timeline dot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: upcoming ? "#EF4444" : m.dot, flexShrink: 0 }} />
        <div style={{ width: 2, flex: 1, background: "#E2E8F0", minHeight: 24, marginTop: 4 }} />
      </div>
      {/* Card */}
      <div style={{
        flex: 1, background: "#fff", border: `1px solid ${upcoming ? "#FECACA" : "#E2E8F0"}`,
        borderRadius: 10, padding: "12px 16px", marginBottom: 4,
        boxShadow: upcoming ? "0 2px 8px rgba(239,68,68,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Badge type={event.type} />
          <span style={{ fontSize: 12, fontWeight: 700, color: upcoming ? "#DC2626" : "#64748B" }}>
            {event.date}
            {upcoming && <span style={{ marginLeft: 6, fontSize: 10, background: "#FEE2E2", color: "#DC2626", padding: "1px 6px", borderRadius: 10 }}>UPCOMING</span>}
          </span>
        </div>
        <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{event.description}</p>
      </div>
    </div>
  );
};

export default function Timeline() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ date: "", type: "hearing", description: "" });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadTimeline = () => {
    getTimeline(caseId).then((r) => {
      setUpcoming(r.data.upcoming || []);
      setPast(r.data.past || []);
    }).catch(() => {});
  };

  useEffect(() => { loadTimeline(); }, [caseId]);

  const handleExtract = async () => {
    setLoading(true); setError("");
    try { await extractDeadlines(caseId); loadTimeline(); }
    catch (e) { setError(e.response?.data?.detail || "Failed to extract. Make sure documents are uploaded."); }
    finally { setLoading(false); }
  };

  const handleAddEvent = async () => {
    if (!form.date || !form.description.trim()) { setError("Please fill in date and description."); return; }
    setAdding(true); setError("");
    try {
      await addEvent(caseId, form);
      setForm({ date: "", type: "hearing", description: "" });
      setShowForm(false);
      loadTimeline();
    } catch { setError("Failed to add event."); }
    finally { setAdding(false); }
  };

  const total = upcoming.length + past.length;

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
        <span style={{ color: "#64748B", fontSize: 14 }}>Timeline</span>
        <button className="btn" onClick={() => navigate(-1)} style={{ background: "#F1F5F9", color: "#475569", marginLeft: "auto" }}>
          <ArrowLeft size={14} /> Back
        </button>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>📅 Case Timeline</h1>
            <p style={{ color: "#64748B" }}>Track hearings, deadlines, and important events.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => setShowForm(!showForm)}
              style={{ background: "#DCFCE7", color: "#16A34A" }}>
              <Plus size={14} /> Add Event
            </button>
            <button className="btn" onClick={handleExtract} disabled={loading}
              style={{ background: loading ? "#E2E8F0" : "#4F46E5", color: loading ? "#94A3B8" : "#fff" }}>
              {loading ? <><Spinner /> Extracting...</> : total > 0 ? <><RefreshCw size={14} /> Re-extract</> : <><Zap size={14} /> Extract</>}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Add Event Form */}
        {showForm && (
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>➕ Add Event Manually</h3>
            <div style={{ display: "grid", gridTemplateColumns: "160px 180px 1fr auto", gap: 10, alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, fontWeight: 600 }}>Date</label>
                <input type="date" value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, fontWeight: 600 }}>Type</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13 }}>
                  {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#64748B", display: "block", marginBottom: 4, fontWeight: 600 }}>Description</label>
                <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
                  placeholder="e.g. Hearing before District Court"
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13 }} />
              </div>
              <button className="btn" onClick={handleAddEvent} disabled={adding}
                style={{ background: adding ? "#E2E8F0" : "#16A34A", color: adding ? "#94A3B8" : "#fff", padding: "8px 16px" }}>
                {adding ? <Spinner /> : "Add"}
              </button>
            </div>
          </div>
        )}

        {/* Next event callout */}
        {upcoming.length > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #FEF2F2, #FFF7F7)",
            border: "1px solid #FECACA", borderRadius: 12, padding: "16px 20px",
            marginBottom: 28, display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{ fontSize: 28 }}>🔴</div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                Next Upcoming Event
              </p>
              <p style={{ fontSize: 14, color: "#0F172A" }}>
                <strong>{upcoming[0].date}</strong> — {upcoming[0].description}
              </p>
            </div>
          </div>
        )}

        {total === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
            <Calendar size={40} color="#CBD5E1" style={{ marginBottom: 12 }} />
            <p>No events yet. Extract from documents or add manually.</p>
          </div>
        )}

        {upcoming.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
              🔴 Upcoming ({upcoming.length})
            </h3>
            {upcoming.map((e, i) => <EventRow key={i} event={e} upcoming={true} />)}
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
              ✅ Past Events ({past.length})
            </h3>
            {[...past].reverse().map((e, i) => <EventRow key={i} event={e} upcoming={false} />)}
          </div>
        )}
      </div>
    </div>
  );
}
