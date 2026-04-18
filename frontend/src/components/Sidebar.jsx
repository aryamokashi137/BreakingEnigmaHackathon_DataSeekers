import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Search, 
  FileText, 
  Calendar, 
  Settings, 
  Users,
  Gavel
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Briefcase size={20} />, label: 'Cases', path: '/cases' },
    { icon: <Search size={20} />, label: 'AI Research', path: '/research' },
    { icon: <FileText size={20} />, label: 'Drafting', path: '/drafting' },
    { icon: <Calendar size={20} />, label: 'Schedule', path: '/schedule' },
    { icon: <Users size={20} />, label: 'Clients', path: '/clients' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Gavel className="logo-icon" size={32} color="var(--primary)" />
        <span className="logo-text">LegalAI</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className="nav-link">
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
