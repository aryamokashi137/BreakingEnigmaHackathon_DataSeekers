import { useState } from "react";
import { Bell, Shield, CreditCard, HardDrive, User, Lock, Mail, ChevronRight, Zap, Calendar } from "lucide-react";

export default function Settings() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [deadlineNotif, setDeadlineNotif] = useState(true);
  const [aiNotif, setAiNotif] = useState(false);

  const handleUpdatePassword = () => {
    alert("Security settings updated successfully!");
  };

  return (
    <div className="main-content fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* Header */}
      <div>
        <h1 style={{ marginBottom: "8px" }}>Settings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "500" }}>Manage your account, security, and application preferences</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.8fr) minmax(0, 1.2fr)", gap: "32px" }}>
        
        {/* Left Column: Preferences & Security */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Notifications Section */}
          <div className="premium-card" style={{ padding: "0" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={20} />
              </div>
              <h3 style={{ fontSize: "18px" }}>Preferences</h3>
            </div>
            
            <div style={{ padding: "16px 32px" }}>
              {[
                { 
                  id: "email", 
                  title: "Email Communications", 
                  desc: "Receive case digests and platform updates", 
                  active: emailNotif, 
                  setter: setEmailNotif,
                  icon: Mail
                },
                { 
                  id: "deadline", 
                  title: "Deadline Alerts", 
                  desc: "Get critical notifications 24h before any deadline", 
                  active: deadlineNotif, 
                  setter: setDeadlineNotif,
                  icon: Calendar
                },
                { 
                  id: "ai", 
                  title: "AI Analysis Insights", 
                  desc: "Get notified when AI discovers new precedents", 
                  active: aiNotif, 
                  setter: setAiNotif,
                  icon: Zap
                }
              ].map((item, i) => (
                <div key={item.id} style={{ 
                  display: "flex", justifyContent: "space-between", alignItems: "center", 
                  padding: "24px 0", borderBottom: i < 2 ? "1px solid var(--border-subtle)" : "none" 
                }}>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ color: "var(--text-light)", marginTop: "2px" }}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "16px", marginBottom: "4px" }}>{item.title}</h4>
                      <p style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "500" }}>{item.desc}</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => item.setter(!item.active)}
                    style={{ 
                      width: "48px", height: "26px", 
                      background: item.active ? "var(--primary)" : "var(--border-subtle)", 
                      borderRadius: "13px", position: "relative", cursor: "pointer", 
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" 
                    }}
                  >
                    <div style={{ 
                      width: "20px", height: "20px", background: "#fff", 
                      borderRadius: "50%", position: "absolute", top: "3px", 
                      left: item.active ? "25px" : "3px", 
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Section */}
          <div className="premium-card">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FEE2E2", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={20} />
              </div>
              <h3 style={{ fontSize: "18px" }}>Account Security</h3>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Current Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>New Password</label>
                <input type="password" placeholder="Min 8 characters" />
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleUpdatePassword} style={{ borderRadius: "10px", padding: "12px 32px" }}>
              Update Security Credentials
            </button>
          </div>
        </div>

        {/* Right Column: Storage & Plan */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Storage Section */}
          <div className="premium-card">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-main)", color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HardDrive size={20} />
              </div>
              <h3 style={{ fontSize: "16px" }}>Cloud Storage</h3>
            </div>
            
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "600" }}>4.2 GB of 10 GB used</span>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--primary)" }}>42%</span>
              </div>
              <div style={{ width: "100%", height: "10px", background: "var(--bg-main)", borderRadius: "5px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                <div style={{ width: "42%", height: "100%", background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)" }}></div>
              </div>
            </div>
            
            <button className="btn btn-outline" style={{ width: "100%", borderRadius: "12px" }}>
              Analyze Storage Usage
            </button>
          </div>

          {/* Premium Subscription Section */}
          <div className="premium-card" style={{ 
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", 
            color: "white", border: "none", padding: "32px",
            boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ 
                width: "44px", height: "44px", borderRadius: "14px", 
                background: "rgba(255,255,255,0.1)", color: "white", 
                display: "flex", alignItems: "center", justifyContent: "center" 
              }}>
                <CreditCard size={24} />
              </div>
              <div>
                <h3 style={{ color: "white", fontSize: "18px", marginBottom: "2px" }}>Enterprise Tier</h3>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: "600" }}>Active Subscription</p>
              </div>
            </div>
            <p style={{ fontSize: "14px", opacity: 0.8, lineHeight: "1.7", marginBottom: "28px" }}>
              Unlock unlimited AI document drafting, large-scale RAG indexing, and multi-partner collaboration tools.
            </p>
            <button 
              className="btn" 
              onClick={() => alert("Redirecting to billing portal...")} 
              style={{ width: "100%", background: "#fff", color: "#0F172A", border: "none", borderRadius: "12px", padding: "14px", fontWeight: "700" }}
            >
              Manage Subscription
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
