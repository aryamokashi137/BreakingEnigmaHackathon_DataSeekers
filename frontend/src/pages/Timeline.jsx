import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { extractDeadlines, getTimeline, addEvent } from "../api";

const TYPE_COLORS = {
  hearing:          { bg: "#dbeafe", color: "#1d4ed8", label: "🏛️ Hearing" },
  filing_deadline:  { bg: "#fee2e2", color: "#b91c1c", label: "📌 Filing Deadline" },
  submission:       { bg: "#fef9c3", color: "#92400e", label: "📤 Submission" },
  judgment:         { bg: "#dcfce7", color: "#15803d", label: "⚖️ Judgment" },
  notice:           { bg: "#f3e8ff", color: "#7e22ce", label: "📬 Notice" },
  other:            { bg: "#f1f5f9", color: "#475569", label: "📅 Event" },
};

const badge = (type) => {
  const t = TYPE_COLORS[type] || TYPE_COLORS.other;
  return (
    <span style={{ background: t.bg, color: t.color, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: "bold" }}>
      {t.label}
    </span>
  );
};

const EventCard = ({ event, upcoming }) => (
  <div style={{
    display: "flex", gap: 16, alignItems: "flex-start",
    padding: "12px 16px", marginBottom: 10,
    border: `1px solid ${upcoming ? "#fca5a5" : "#e2e8f0"}`,
    borderLeft: `4px solid ${upcoming ? "#ef4444" : "#94a3b8"}`,
    borderRadius: 6,
    background: upcoming ? "#fff7f7" : "#fff",
  }}>
    <div style={{ minWidth: 90, textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: "bold", color: upcoming ? "#dc2626" : "#475569" }}>
        {event.date || "Unknown"}
      </div>
      {upcoming && <div style={{ fontSize: 10, color: "#dc2626", marginTop: 2 }}>UPCOMING</div>}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ marginBottom: 4 }}>{badge(event.type)}</div>
      <div style={{ fontSize: 14, color: "#1e293b" }}>{event.description}</div>
    </div>
  </div>
);

export default function Timeline() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ date: "", type: "hearing", description: "" });
  const [adding, setAdding] = useState(false);

  const loadTimeline = () => {
    getTimeline(caseId).then((r) => {
      setUpcoming(r.data.upcoming || []);
      setPast(r.data.past || []);
    }).catch(() => {});
  };

  useEffect(() => { loadTimeline(); }, [caseId]);

  const handleExtract = async () => {
    setLoading(true);
    setError("");
    try {
      await extractDeadlines(caseId);
      loadTimeline();
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to extract deadlines. Make sure documents are uploaded.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!form.date || !form.description.trim()) {
      setError("Please fill in date and description.");
      return;
    }
    setAdding(true);
    setError("");
    try {
      await addEvent(caseId, form);
      setForm({ date: "", type: "hearing", description: "" });
      loadTimeline();
    } catch {
      setError("Failed to add event.");
    } finally {
      setAdding(false);
    }
  };

  const total = upcoming.length + past.length;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>📅 Case Timeline & Deadlines</h2>
        <button
          onClick={handleExtract}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: loading ? "#ccc" : "#0070f3",
            color: "#fff", border: "none", borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Extracting..." : total > 0 ? "🔄 Re-extract" : "⚡ Extract Deadlines"}
        </button>
      </div>
      <p style={{ color: "#666", marginTop: 0 }}>
        AI extracts all dates and events from your uploaded documents.
      </p>

      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 4, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Next hearing callout */}
      {upcoming.length > 0 && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fca5a5",
          borderRadius: 6, padding: "12px 16px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>🔴</span>
          <div>
            <div style={{ fontWeight: "bold", color: "#dc2626" }}>Next Upcoming Event</div>
            <div style={{ fontSize: 14 }}>
              <strong>{upcoming[0].date}</strong> — {upcoming[0].description}
            </div>
          </div>
        </div>
      )}

      {total === 0 && !loading && (
        <p style={{ color: "#aaa", textAlign: "center", marginTop: 40 }}>
          No events found. Click "Extract Deadlines" to scan your documents.
        </p>
      )}

      {/* Manual Add Event */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: 16, marginBottom: 24, background: "#f8fafc" }}>
        <h4 style={{ margin: "0 0 12px" }}>➕ Add Event Manually</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              style={{ padding: 7 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              style={{ padding: 7 }}
            >
              {Object.entries(TYPE_COLORS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Description</label>
            <input
              style={{ width: "100%", padding: 7, boxSizing: "border-box" }}
              placeholder="e.g. Next hearing before District Court"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
            />
          </div>
          <button
            onClick={handleAddEvent}
            disabled={adding}
            style={{ padding: "7px 16px", background: adding ? "#ccc" : "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: adding ? "not-allowed" : "pointer" }}
          >
            {adding ? "Adding..." : "+ Add"}
          </button>
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: "#dc2626", marginBottom: 12 }}>🔴 Upcoming ({upcoming.length})</h3>
          {upcoming.map((e, i) => <EventCard key={i} event={e} upcoming={true} />)}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 style={{ color: "#64748b", marginBottom: 12 }}>✅ Past Events ({past.length})</h3>
          {[...past].reverse().map((e, i) => <EventCard key={i} event={e} upcoming={false} />)}
        </div>
      )}
    </div>
  );
}
