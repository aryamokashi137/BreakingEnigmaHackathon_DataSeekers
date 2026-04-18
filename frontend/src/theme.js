export const colors = {
  primary: "#4F46E5",
  primaryHover: "#4338CA",
  success: "#16A34A",
  danger: "#DC2626",
  warning: "#D97706",
  info: "#0891B2",
  purple: "#7C3AED",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#64748B",
  textLight: "#94A3B8",
};

export const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  md: "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
  lg: "0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)",
};

export const radius = { sm: 6, md: 10, lg: 14 };

export const btn = {
  base: {
    border: "none", borderRadius: 8, cursor: "pointer",
    fontWeight: 600, fontSize: 13, transition: "all 0.15s",
    display: "inline-flex", alignItems: "center", gap: 6,
  },
  primary: { background: "#4F46E5", color: "#fff", padding: "8px 16px" },
  success: { background: "#16A34A", color: "#fff", padding: "8px 16px" },
  danger:  { background: "#DC2626", color: "#fff", padding: "8px 16px" },
  info:    { background: "#0891B2", color: "#fff", padding: "8px 16px" },
  purple:  { background: "#7C3AED", color: "#fff", padding: "8px 16px" },
  ghost:   { background: "#F1F5F9", color: "#475569", padding: "8px 16px" },
  disabled:{ background: "#CBD5E1", color: "#94A3B8", padding: "8px 16px", cursor: "not-allowed" },
};

export const card = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  padding: 20,
};

export const intentMeta = {
  summarize:      { color: "#7C3AED", bg: "#F3E8FF", label: "📄 Summarizer" },
  legal_research: { color: "#0891B2", bg: "#E0F2FE", label: "🔍 Legal Research" },
  document_qa:    { color: "#16A34A", bg: "#DCFCE7", label: "📚 Document Q&A" },
};
