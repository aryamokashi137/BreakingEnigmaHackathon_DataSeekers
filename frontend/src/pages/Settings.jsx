import React from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Database, Globe, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  return (
    <div className="settings-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="subtext">Configure your workspace and LegalAI preferences.</p>
        </div>
      </header>

      <div className="settings-grid">
        <aside className="settings-nav glass">
          <div className="nav-item active"><User size={18} /> Profile</div>
          <div className="nav-item"><Shield size={18} /> Security</div>
          <div className="nav-item"><Bell size={18} /> Notifications</div>
          <div className="nav-item"><Database size={18} /> Database</div>
          <div className="nav-item"><Globe size={18} /> Jurisdiction</div>
        </aside>

        <div className="settings-content glass">
          <section className="settings-section">
            <h3>Profile Information</h3>
            <div className="form-group mt-1">
              <label>Full Name</label>
              <input type="text" defaultValue="Adv. Arya Mokashi" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" defaultValue="arya.mokashi@legalai.co" />
            </div>
            <div className="form-group">
              <label>Bar Council Number</label>
              <input type="text" defaultValue="MAH/1234/2024" />
            </div>
          </section>

          <section className="settings-section mt-2 border-t pt-2">
            <h3>AI Configuration</h3>
            <div className="flex items-center justify-between mt-1">
              <div>
                <h4 className="font-bold">Model Selection</h4>
                <p className="text-xs text-muted">GPT-4o Mini (Default for performance)</p>
              </div>
              <button className="text-btn">Change Model</button>
            </div>
          </section>

          <div className="mt-3 flex justify-end gap-1">
            <button className="btn-secondary">Reset Changes</button>
            <button className="btn-primary">Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
