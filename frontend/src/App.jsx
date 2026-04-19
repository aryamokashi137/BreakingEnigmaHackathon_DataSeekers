import { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import AIAssistant from "./pages/AIAssistant";
import Documents from "./pages/Documents";
import Deadlines from "./pages/Deadlines";
import Settings from "./pages/Settings";
import CaseAnalysis from "./pages/CaseAnalysis";
import Timeline from "./pages/Timeline";
import Drafting from "./pages/Drafting";

// ── Auth Context ───────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [lawyer, setLawyer] = useState(() => {
    const stored = localStorage.getItem("lawyer");
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (lawyerData) => {
    localStorage.setItem("lawyer", JSON.stringify(lawyerData));
    setLawyer(lawyerData);
  };

  const handleLogout = () => {
    localStorage.removeItem("lawyer");
    setLawyer(null);
  };

  if (!lawyer) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AuthContext.Provider value={{ lawyer, logout: handleLogout }}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/case/:caseId" element={<CaseDetail />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/deadlines" element={<Deadlines />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/drafting" element={<Drafting />} />
            <Route path="/case/:caseId/analysis" element={<CaseAnalysis />} />
            <Route path="/case/:caseId/timeline" element={<Timeline />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
