import { Search, Bell, Menu, User, ChevronDown } from "lucide-react";

export default function Topbar({ toggleSidebar }) {
  return (
    <div style={{
      height: "72px",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-subtle)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1 }}>
        <button 
          className="mobile-menu-btn" 
          onClick={toggleSidebar} 
          style={{ 
            background: "var(--bg-main)", 
            border: "1px solid var(--border-subtle)", 
            borderRadius: "10px",
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Menu size={20} color="var(--text-main)" />
        </button>
        
        <div style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "var(--bg-main)",
          borderRadius: "12px",
          padding: "10px 16px",
          width: "100%",
          maxWidth: "480px",
          border: "1.5px solid transparent",
          transition: "all 0.2s ease",
          boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.02)"
        }}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.boxShadow = "0 0 0 4px rgba(79, 70, 229, 0.1)";
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.backgroundColor = "var(--bg-main)";
            e.currentTarget.style.boxShadow = "inset 0 2px 4px 0 rgba(0,0,0,0.02)";
          }}
        >
          <Search size={18} color="var(--text-light)" />
          <input 
            type="text" 
            placeholder="Search cases, legal sections, or documents..." 
            style={{
              border: "none",
              backgroundColor: "transparent",
              marginLeft: "12px",
              outline: "none",
              width: "100%",
              fontSize: "14px",
              fontWeight: "500",
              color: "var(--text-main)"
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button style={{
          background: "var(--bg-main)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "10px",
          cursor: "pointer",
          position: "relative",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#fff"}
        onMouseLeave={e => e.currentTarget.style.background = "var(--bg-main)"}
        >
          <Bell size={20} color="var(--text-muted)" />
          <span style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "8px",
            height: "8px",
            backgroundColor: "var(--danger)",
            borderRadius: "50%",
            border: "2px solid #fff"
          }}></span>
        </button>

        <div style={{ 
          height: "32px", 
          width: "1px", 
          background: "var(--border-subtle)",
          margin: "0 8px"
        }}></div>

        <div style={{ 
          display: "flex", alignItems: "center", gap: "10px",
          cursor: "pointer", padding: "6px 12px", borderRadius: "10px",
          transition: "all 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-main)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ 
            width: "32px", height: "32px", borderRadius: "8px", 
            background: "var(--primary)", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: "700"
          }}>
            JD
          </div>
          <ChevronDown size={14} color="var(--text-light)" />
        </div>
      </div>
    </div>
  );
}
