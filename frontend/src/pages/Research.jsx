import React, { useState, useEffect } from 'react';
import { Search, Sparkles, BookOpen, ExternalLink, MessageSquare, History, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCases, askQuestion, loadCase, default as api } from '../api';

const Research = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [advice, setAdvice] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [casesRes, adviceRes] = await Promise.all([
          getCases(),
          api.get('/get_general_advice').then(r => r.data)
        ]);
        if (casesRes.success) setCases(casesRes.cases);
        if (adviceRes.success) setAdvice(adviceRes);
      } catch (err) {
        console.error("Fetch failed");
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query || !selectedCaseId) {
      setError('Please select a case and enter a search query.');
      return;
    }

    setError('');
    setIsSearching(true);
    
    try {
      // First ensure the case is loaded in the session
      await loadCase(selectedCaseId, "");
      
      // Use the #web command to force a RAG web search
      const result = await askQuestion(`#web ${query}`);
      
      if (result.success) {
        // We push the result to the history/results list
        setResults(prev => [{
          title: `Research Analysis: ${query}`,
          citation: "Powered by CanLII & RAG Pipeline",
          summary: result.answer,
          tags: ["AI Search", "Precedents"]
        }, ...prev]);
        setQuery('');
      }
    } catch (err) {
      setError('Search failed. Ensure the backend is initialized.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="research-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">AI Legal Research</h1>
          <p className="subtext">Search across millions of case laws, statutes, and precedents using the RAG Pipeline.</p>
        </div>
      </header>

      <div className="research-search-container">
        <div className="case-selector glass mb-1">
          <select 
            value={selectedCaseId} 
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full"
          >
            <option value="">-- Select Active Case Context --</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSearch} className="search-box-large glass">
          <Search size={24} className="search-icon" />
          <input 
            type="text" 
            placeholder="Describe your legal query (e.g., 'liability in medical negligence')..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="search-btn" disabled={isSearching}>
            {isSearching ? <Loader2 className="animate-spin" size={24} /> : <><Sparkles size={18} /><span>Analyze</span></>}
          </button>
        </form>
        
        {error && (
          <div className="error-message flex items-center justify-center gap-0.5 text-red-500 font-bold mb-1">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="search-suggestions">
          <span>Try:</span>
          <button className="suggestion-tag" onClick={() => setQuery("Section 138 NI Act precedents")}>Section 138 NI Act</button>
          <button className="suggestion-tag" onClick={() => setQuery("Anticipatory bail conditions")}>Anticipatory bail</button>
        </div>
      </div>

      <div className="research-grid">
        <div className="results-section">
          <div className="section-header">
            <h2>Search Results</h2>
            <div className="result-stats">Found {results.length} relevant analyses</div>
          </div>
          
          <div className="results-list">
            {results.length > 0 ? (
              results.map((res, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="result-card glass"
                >
                  <div className="result-header">
                    <div className="result-title-group">
                      <BookOpen size={18} className="result-icon" />
                      <h3 className="result-title">{res.title}</h3>
                    </div>
                    <button className="btn-icon"><ExternalLink size={16} /></button>
                  </div>
                  <p className="result-citation">{res.citation}</p>
                  <div className="result-summary text-justify whitespace-pre-wrap">{res.summary}</div>
                  <div className="result-footer">
                    <div className="result-tags">
                      {res.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="empty-results glass">
                <Search size={48} className="text-muted mb-1" />
                <p>Enter a query to begin AI-powered legal research.</p>
              </div>
            )}
          </div>
        </div>

        <aside className="research-sidebar">
          <section className="research-mini-section glass">
            <h3><History size={16} /> Recent Researches</h3>
            <div className="mini-list">
              <div className="mini-item">Property rights of daughters</div>
              <div className="mini-item">Environmental law penalties</div>
              <div className="mini-item">Corporate fraud sentencing</div>
            </div>
          </section>

          <section className="research-mini-section glass help-section">
            <h3>RAG Intelligence</h3>
            <p className="whitespace-pre-wrap">{advice?.advice || "Our agent uses a retrieval-augmented generation pipeline to cross-reference your query with CanLII and your uploaded case documents simultaneously."}</p>
            {advice?.resources?.length > 0 && (
              <div className="mt-1">
                <h4 className="text-xs font-bold uppercase text-muted mb-0.5">Helpful Resources</h4>
                <div className="mini-list">
                  {advice.resources.map((link, idx) => (
                    <a key={idx} href={link.includes('http') ? link : '#'} target="_blank" rel="noreferrer" className="mini-item flex items-center gap-0.5">
                      <ExternalLink size={12} /> {link.split('://')[1]?.split('/')[0] || link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Research;
