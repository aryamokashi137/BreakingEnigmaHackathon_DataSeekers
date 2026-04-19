import { Search, Bell, Menu } from "lucide-react";

export default function Topbar({ toggleSidebar }) {
  return (
    <div style={{
      height: "70px",
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #E2E8F0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
        <button className="mobile-menu-btn" onClick={toggleSidebar} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <Menu size={24} color="#0F172A" />
        </button>
        <div style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#F1F5F9",
          borderRadius: "8px",
          padding: "8px 16px",
          width: "100%",
          maxWidth: "400px"
        }}>
          <Search size={18} color="#94A3B8" />
          <input 
            type="text" 
            placeholder="Search cases, laws, documents..." 
            style={{
              border: "none",
              backgroundColor: "transparent",
              marginLeft: "12px",
              outline: "none",
              width: "100%",
              fontSize: "14px",
              color: "#0F172A"
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: "8px"
        }}>
          <Bell size={20} color="#64748B" />
          <span style={{
            position: "absolute",
            top: "6px",
            right: "8px",
            width: "8px",
            height: "8px",
            backgroundColor: "#EF4444",
            borderRadius: "50%"
          }}></span>
        </button>
      </div>
    </div>
  );
}
