import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Briefcase, Bot, FileText,
  Calendar, Settings, Scale, PenTool
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard",    path: "/",          icon: LayoutDashboard },
    { name: "Cases",        path: "/cases",      icon: Briefcase },
    { name: "AI Assistant", path: "/assistant",  icon: Bot },
    { name: "AI Drafting",  path: "/drafting",   icon: PenTool },
    { name: "Documents",    path: "/documents",  icon: FileText },
    { name: "Deadlines",    path: "/deadlines",  icon: Calendar },
    { name: "Settings",     path: "/settings",   icon: Settings },
  ];

  return (
    <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
      {/* Logo */}
      <div style={{ padding: "24px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ backgroundColor: "#1E3A8A", color: "white", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Scale size={20} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A", lineHeight: 1.2 }}>LegalFlow AI</span>
          <span style={{ fontSize: "12px", color: "#94A3B8" }}>Case Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0 12px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === "/cases" && location.pathname.startsWith("/case/"));
          return (
            <Link
              key={item.name}
              to={item.path}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 16px", borderRadius: "8px", textDecoration: "none",
                color: isActive ? "#0F172A" : "#475569",
                backgroundColor: isActive ? "#F1F5F9" : "transparent",
                fontWeight: isActive ? 600 : 500,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "#F8FAFC"; e.currentTarget.style.color = "#0F172A"; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#475569"; } }}
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={18} color={isActive ? "#4F46E5" : "#64748B"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div style={{ padding: "16px", borderTop: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#1E3A8A", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "14px" }}>
            JD
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#0F172A" }}>John Doe</span>
            <span style={{ fontSize: "12px", color: "#64748B" }}>Senior Partner</span>
          </div>
        </div>
      </div>
    </div>
  );
}
