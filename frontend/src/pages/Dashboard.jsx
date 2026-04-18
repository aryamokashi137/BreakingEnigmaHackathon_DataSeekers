import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  Clock, 
  AlertCircle,
  FileCheck,
  Zap,
  Briefcase,
  Gavel,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getCases } from '../api';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="stat-card glass"
  >
    <div className="stat-header">
      <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={20} />
      </div>
      <span className={`stat-change ${change?.startsWith('+') ? 'positive' : 'negative'}`}>
        {change || '0'}
      </span>
    </div>
    <div className="stat-body">
      <h3 className="stat-value">{value}</h3>
      <p className="stat-title">{title}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [recentCases, setRecentCases] = useState([]);
  const [stats, setStats] = useState([
    { title: 'Active Cases', value: '0', change: '+0', icon: Briefcase, color: '#6366f1' },
    { title: 'Task Backlog', value: '0', change: '+0', icon: Clock, color: '#f59e0b' },
    { title: 'Hearings', value: '0', change: '0', icon: Gavel, color: '#10b981' },
    { title: 'AI Drafts', value: '0', change: '+0', icon: FileCheck, color: '#ec4899' },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await getCases();
        if (result.success) {
          const cases = result.cases.slice(0, 3);
          setRecentCases(cases);
          
          setStats(prev => [
            { ...prev[0], value: result.total.toString() },
            { ...prev[1], value: '12' }, // Placeholder for now
            { ...prev[2], value: '2' },
            { ...prev[3], value: '5' },
          ]);
        }
      } catch (error) {
        console.error("Dashboard fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="greeting">Welcome back, Adv. Arya</h1>
          <p className="subtext">Here's what's happening with your cases today.</p>
        </div>
        <Link to="/cases" className="btn-primary">
          <Plus size={18} />
          <span>New Case</span>
        </Link>
      </header>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} icon={stat.icon} />
        ))}
      </div>

      <div className="dashboard-content">
        {!loading && recentCases.length === 0 && (
          <div className="status-alert glass warning col-span-full mb-1">
            <AlertCircle size={20} />
            <div className="alert-text">
              <strong>Backend Offline</strong>
              <p>The Legal AI API is currently unreachable. Please ensure the Flask server (port 5000) is running to see your cases and AI insights.</p>
            </div>
          </div>
        )}
        <section className="recent-cases glass">
          <div className="section-header">
            <h2>Recent Cases</h2>
            <Link to="/cases" className="text-btn">View All <ArrowUpRight size={16} /></Link>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : (
            <div className="case-list">
              {recentCases.length > 0 ? (
                recentCases.map((c) => (
                  <Link key={c.id} to={`/cases/${c.id}`} className="case-item">
                    <div className="case-info">
                      <span className="case-name">{c.name}</span>
                      <span className="case-details">{c.case_type || 'General'} • {c.jurisdiction_code}</span>
                    </div>
                    <div className="case-meta">
                      <span className={`status-badge ${c.case_status?.toLowerCase() || 'open'}`}>
                        {c.case_status || 'Open'}
                      </span>
                      <span className="case-date">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-message">No active cases found. Create one to get started.</div>
              )}
            </div>
          )}
        </section>

        <section className="ai-assistant glass">
          <div className="section-header">
            <h2><Zap size={18} fill="currentColor" /> AI Insights</h2>
          </div>
          <div className="ai-content">
            <div className="ai-alert">
              <AlertCircle size={20} className="alert-icon" />
              <div className="alert-text">
                <strong>RAG Pipeline Status</strong>
                <p>The Advanced Legal RAG pipeline is active and ready to process Canadian case law.</p>
              </div>
            </div>
            <div className="ai-actions">
              <Link to="/research" className="ai-btn">Advanced Legal Research</Link>
              <button className="ai-btn">System Health Check</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
