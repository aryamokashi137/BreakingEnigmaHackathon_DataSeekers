import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-main)" }}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="main-content-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 90
          }}
        />
      )}
    </div>
  );
}
