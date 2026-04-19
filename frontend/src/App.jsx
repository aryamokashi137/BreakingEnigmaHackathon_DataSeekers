import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
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

export default function App() {
  return (
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
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
