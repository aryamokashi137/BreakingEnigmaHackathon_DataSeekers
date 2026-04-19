import { useState } from "react";
import { Bell, Shield, CreditCard, HardDrive } from "lucide-react";

export default function Settings() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [deadlineNotif, setDeadlineNotif] = useState(true);
  const [aiNotif, setAiNotif] = useState(false);

  const handleUpdatePassword = () => {
    alert("Password updated successfully!");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0F172A", marginBottom: "4px" }}>Settings</h1>
        <p style={{ color: "#64748B", fontSize: "15px" }}>Manage your account and application preferences</p>
      </div>

      <div className="grid-layout">
        
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Notifications */}
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Bell size={20} color="#6366F1" />
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0F172A" }}>Notifications</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#0F172A" }}>Email Notifications</h4>
                  <p style={{ fontSize: "13px", color: "#64748B" }}>Receive weekly summaries and important updates</p>
                </div>
                <div 
                  onClick={() => setEmailNotif(!emailNotif)}
                  style={{ width: "44px", height: "24px", background: emailNotif ? "#6366F1" : "#E2E8F0", borderRadius: "12px", position: "relative", cursor: "pointer", transition: "background 0.2s" }}
                >
                  <div style={{ width: "18px", height: "18px", background: "#fff", borderRadius: "50%", position: "absolute", top: "3px", left: emailNotif ? "23px" : "3px", transition: "left 0.2s" }}></div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#0F172A" }}>Deadline Reminders</h4>
                  <p style={{ fontSize: "13px", color: "#64748B" }}>Get notified 24 hours before any deadline</p>
                </div>
                <div 
                  onClick={() => setDeadlineNotif(!deadlineNotif)}
                  style={{ width: "44px", height: "24px", background: deadlineNotif ? "#6366F1" : "#E2E8F0", borderRadius: "12px", position: "relative", cursor: "pointer", transition: "background 0.2s" }}
                >
                  <div style={{ width: "18px", height: "18px", background: "#fff", borderRadius: "50%", position: "absolute", top: "3px", left: deadlineNotif ? "23px" : "3px", transition: "left 0.2s" }}></div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: "600", color: "#0F172A" }}>AI Case Insights</h4>
                  <p style={{ fontSize: "13px", color: "#64748B" }}>Get notifications when AI finds new precedents</p>
                </div>
                <div 
                  onClick={() => setAiNotif(!aiNotif)}
                  style={{ width: "44px", height: "24px", background: aiNotif ? "#6366F1" : "#E2E8F0", borderRadius: "12px", position: "relative", cursor: "pointer", transition: "background 0.2s" }}
                >
                  <div style={{ width: "18px", height: "18px", background: "#fff", borderRadius: "50%", position: "absolute", top: "3px", left: aiNotif ? "23px" : "3px", transition: "left 0.2s" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Shield size={20} color="#6366F1" />
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0F172A" }}>Security</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>Current Password</label>
                <input type="password" style={{ padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: "8px", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>New Password</label>
                <input type="password" style={{ padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: "8px", outline: "none" }} />
              </div>
              <button onClick={handleUpdatePassword} style={{ width: "fit-content", padding: "10px 20px", background: "#1E3A8A", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Storage */}
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <HardDrive size={20} color="#6366F1" />
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A" }}>Storage</h3>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "#64748B" }}>Used</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>4.2 GB / 10 GB</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "#F1F5F9", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "42%", height: "100%", background: "#6366F1" }}></div>
              </div>
            </div>
            
            <button style={{ width: "100%", padding: "10px", border: "1px solid #E2E8F0", borderRadius: "8px", background: "transparent", fontSize: "14px", fontWeight: "600", color: "#475569", cursor: "pointer" }}>
              Manage Documents
            </button>
          </div>

          {/* Subscription */}
          <div style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #312E81 100%)", borderRadius: "12px", padding: "24px", color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <CreditCard size={20} color="#fff" />
              <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Pro Plan</h3>
            </div>
            <p style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5", marginBottom: "20px" }}>
              Get unlimited storage, advanced AI drafting, and multi-user collaboration.
            </p>
            <button onClick={() => alert("Redirecting to plans page...")} style={{ width: "100%", padding: "12px", background: "#fff", color: "#1E3A8A", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
              View Plans
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
