import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Zap, RefreshCw, Plus, Scale, Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { extractDeadlines, getTimeline, addEvent } from "../api";

const Spinner = () => <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />;

const TYPE_META = {
  hearing:         { bg: "#E0E7FF", color: "#4338CA", label: "🏛️ Hearing" },
  filing_deadline: { bg: "#FEE2E2", color: "#B91C1C", label: "📌 Filing" },
  submission:      { bg: "#FEF9C3", color: "#92400E", label: "📤 Submission" },
  judgment:        { bg: "#DCFCE7", color: "#15803D", label: "⚖️ Judgment" },
  notice:          { bg: "#F3E8FF", color: "#7E22CE", label: "📬 Notice" },
  other:           { bg: "var(--bg-main)", color: "var(--text-muted)", label: "📅 Event" },
};

const EventCard = ({ event, upcoming }) => {
  const m = TYPE_META[event.type] || TYPE_META.other;
  return (
    <div style={{ display: "flex", gap: "24px", position: "relative" }}>
      {/* Timeline Connector */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "40px", flexShrink: 0 }}>
        <div style={{ 
          width: "40px", height: "40px", borderRadius: "12px", 
          background: upcoming ? "var(--danger)" : "var(--border-subtle)", 
          display: "flex", alignItems: "center", justifyContent: "center", color: "white",
          boxShadow: upcoming ? "0 4px 12px rgba(239, 68, 68, 0.2)" : "none",
          zIndex: 2
        }}>
          {upcoming ? <Clock size={20} /> : <CheckCircle2 size={20} color="var(--text-muted)" />}
        </div>
        <div style={{ width: "2px", flex: 1, background: "var(--border-subtle)", marginTop: "8px", marginBottom: "8px" }} />
      </div>

      {/* Content Card */}
      <div className="premium-card" style={{ 
        flex: 1, padding: "20px 24px", marginBottom: "24px",
        borderLeft: `4px solid ${upcoming ? "var(--danger)" : "var(--border-subtle)"}`,
        background: upcoming ? "white" : "var(--bg-main)",
        opacity: upcoming ? 1 : 0.8
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ padding: "4px 12px", borderRadius: "20px", background: m.bg, color: m.color, fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {m.label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "800", color: upcoming ? "var(--danger)" : "var(--text-main)" }}>
            <Calendar size={14} /> {event.date}
          </div>
        </div>
        <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-main)", lineHeight: "1.6" }}>{event.description}</p>
        {upcoming && (
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--danger)", fontWeight: "700" }}>
            <AlertCircle size={14} /> Action Required
          </div>
        )}
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
    <div className="main-content fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>Case Chronology</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "500" }}>A chronological view of all procedural events and upcoming deadlines.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={() => setShowForm(!showForm)} style={{ borderRadius: "12px" }}>
            <Plus size={18} /> Add Event
          </button>
          <button className="btn btn-primary" onClick={handleExtract} disabled={loading} style={{ borderRadius: "12px" }}>
            {loading ? <Spinner /> : <><Zap size={18} /> AI Sync</>}
          </button>
          <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ borderRadius: "12px" }}>
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", padding: "16px 20px", borderRadius: "12px", fontWeight: "600" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Form Overlay-like section */}
      {showForm && (
        <div className="premium-card scale-in" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Add Event Manually</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: "16px", alignItems: "flex-end" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "8px", fontWeight: "700" }}>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "8px", fontWeight: "700" }}>Event Type</label>
              <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}>
                {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "8px", fontWeight: "700" }}>Event Description</label>
              <input placeholder="e.g. Evidence submission" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleAddEvent()} />
            </div>
            <button className="btn btn-primary" onClick={handleAddEvent} disabled={adding} style={{ height: "42px", padding: "0 24px", borderRadius: "8px" }}>
              {adding ? <Spinner /> : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Timeline Stream */}
      <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        
        {total === 0 && !loading && (
          <div className="premium-card" style={{ padding: "64px", textAlign: "center" }}>
            <Calendar size={64} color="var(--border-subtle)" style={{ marginBottom: "20px", opacity: 0.5 }} />
            <h3 style={{ marginBottom: "8px" }}>No Chronology Data</h3>
            <p style={{ color: "var(--text-muted)", maxWidth: "340px", margin: "0 auto" }}>Use the AI Sync button to extract the case timeline from your documents.</p>
          </div>
        )}

        {upcoming.length > 0 && (
          <div style={{ marginBottom: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#FEE2E2", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={16} />
              </div>
              <h3 style={{ fontSize: "14px", fontWeight: "800", color: "var(--danger)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Upcoming Matters ({upcoming.length})</h3>
            </div>
            {upcoming.map((e, i) => <EventCard key={i} event={e} upcoming={true} />)}
          </div>
        )}

        {past.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-main)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={16} />
              </div>
              <h3 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Completed History ({past.length})</h3>
            </div>
            {[...past].reverse().map((e, i) => <EventCard key={i} event={e} upcoming={false} />)}
          </div>
        )}
      </div>
    </div>
  );
}
