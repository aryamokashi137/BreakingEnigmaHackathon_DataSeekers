import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import Drafting from "./pages/Drafting";
import CaseAnalysis from "./pages/CaseAnalysis";
import Timeline from "./pages/Timeline";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cases />} />
        <Route path="/case/:caseId" element={<CaseDetail />} />
        <Route path="/drafting" element={<Drafting />} />
        <Route path="/case/:caseId/analysis" element={<CaseAnalysis />} />
        <Route path="/case/:caseId/timeline" element={<Timeline />} />
      </Routes>
    </BrowserRouter>
  );
}
