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
    <div className={`sidebar-container ${isOpen ? "open" : ""}`} style={{ boxShadow: "var(--shadow-premium)" }}>
      {/* Logo */}
      <div style={{ padding: "32px 24px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ 
          background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", 
          color: "white", padding: "10px", borderRadius: "12px", 
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 16px -4px rgba(79, 70, 229, 0.4)"
        }}>
          <Scale size={24} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>LegalFlow AI</span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Case Intelligence</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0 16px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === "/cases" && location.pathname.startsWith("/case/"));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-link ${isActive ? "active" : ""}`}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: isActive ? "600" : "500",
              }}
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div style={{ padding: "24px 16px", borderTop: "1px solid var(--border-subtle)", marginTop: "auto" }}>
        <div style={{ 
          display: "flex", alignItems: "center", gap: "12px", 
          padding: "12px", borderRadius: "12px", background: "var(--bg-main)",
          border: "1px solid var(--border-subtle)"
        }}>
          <div style={{ 
            width: "40px", height: "40px", borderRadius: "10px", 
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)", 
            color: "white", display: "flex", alignItems: "center", justifyContent: "center", 
            fontWeight: "700", fontSize: "14px" 
          }}>
            JD
          </div>
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>John Doe</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}>Senior Partner</span>
          </div>
        </div>
      </div>
    </div>
  );
}
