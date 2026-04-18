import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseDetails from './pages/CaseDetails';
import Research from './pages/Research';
import Drafting from './pages/Drafting';
import Schedule from './pages/Schedule';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import { initializeAgent } from './api';

function App() {
  useEffect(() => {
    // Automatically initialize the Legal AI agent on app startup
    const init = async () => {
      try {
        await initializeAgent('openai/gpt-4o-mini'); // Using a fast, reliable model via OpenRouter
        console.log("Legal AI Agent Initialized");
      } catch (err) {
        console.error("Agent init failed:", err);
      }
    };
    init();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="cases" element={<Cases />} />
        <Route path="cases/:id" element={<CaseDetails />} />
        <Route path="research" element={<Research />} />
        <Route path="drafting" element={<Drafting />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="clients" element={<Clients />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
