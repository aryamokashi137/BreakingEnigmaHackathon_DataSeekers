import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Save, 
  Download, 
  History, 
  Search,
  ChevronRight,
  Loader2,
  CheckCircle,
  FileEdit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getCases, loadCase, askQuestion, default as api } from '../api';

const Drafting = () => {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    getCases().then(res => {
      if (res.success) setCases(res.cases);
    });
  }, []);

  const handleGenerate = async () => {
    if (!selectedCaseId || !prompt) {
      alert("Please select a case and describe the document you need.");
      return;
    }

    setIsGenerating(true);
    setStatus('Analyzing case context...');
    try {
      await loadCase(selectedCaseId, "");
      setStatus('Generating legal draft...');
      const res = await askQuestion(`#web Draft a ${prompt} based on the case documents and applicable precedents.`);
      if (res.success) {
        setDraftContent(res.answer);
      }
    } catch (err) {
      alert("Generation failed. Check backend connection.");
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  const handleSaveDraft = async () => {
    if (!draftContent || !selectedCaseId) return;
    setIsSaving(true);
    try {
      // Backend /api/save saves advice/text to a case
      const res = await api.post('/save', { 
        id: selectedCaseId, 
        advice: draftContent 
      });
      if (res.data.success) {
        alert("Draft saved to case logs successfully!");
      }
    } catch (err) {
      alert("Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="drafting-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">AI Document Drafting</h1>
          <p className="subtext">Generate court-ready documents using case context and RAG intelligence.</p>
        </div>
      </header>

      <div className="drafting-layout">
        <div className="editor-main glass">
          <div className="editor-header">
            <div className="flex items-center gap-1">
              <FileEdit size={20} className="text-primary" />
              <input 
                type="text" 
                placeholder="Untitled Draft..." 
                className="draft-title-input"
              />
            </div>
            <div className="editor-actions">
              <button className="btn-secondary" onClick={handleSaveDraft} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                <span>Save to Case</span>
              </button>
              <button className="btn-primary">
                <Download size={18} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
          
          <textarea 
            className="draft-editor"
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            placeholder="Generated draft will appear here. You can manually edit it before saving..."
          />
        </div>

        <aside className="drafting-sidebar">
          <section className="draft-generator-box glass">
            <h3><Sparkles size={18} className="text-primary" /> AI Composer</h3>
            <p className="text-xs text-muted mb-1">Select a case and describe the document (e.g., 'Demand Notice' or 'Bail Application').</p>
            
            <div className="form-group">
              <label>Select Case Context</label>
              <select 
                value={selectedCaseId} 
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full"
              >
                <option value="">-- Select Case --</option>
                {cases.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>What should we draft?</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A formal legal notice for breach of contract..."
                rows={4}
              />
            </div>

            <button 
              className="btn-primary w-full justify-center mt-1" 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              <span>{isGenerating ? 'Generating...' : 'Compose Draft'}</span>
            </button>
            
            {status && <div className="mt-1 text-xs text-primary font-bold animate-pulse">{status}</div>}
          </section>

          <section className="templates-box glass mt-1">
            <h3>Quick Templates</h3>
            <div className="mini-list">
              <div className="mini-item">Affidavit of Service</div>
              <div className="mini-item">Power of Attorney</div>
              <div className="mini-item">Cease and Desist</div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Drafting;
