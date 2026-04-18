import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cases />} />
        <Route path="/case/:caseId" element={<CaseDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
