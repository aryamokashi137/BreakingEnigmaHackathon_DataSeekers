import { useState, useEffect } from "react";
import { Search, X, FileText, Briefcase, BookOpen, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "cases" | "documents" | "research">("all");
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyboard = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                if (!isOpen) return;
            }
        };

        document.addEventListener("keydown", handleKeyboard);
        return () => document.removeEventListener("keydown", handleKeyboard);
    }, [isOpen, onClose]);

    useEffect(() => {
        const handleGlobalShortcut = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                if (!isOpen) {
                    const event = new CustomEvent("openSearch");
                    window.dispatchEvent(event);
                }
            }
        };

        window.addEventListener("keydown", handleGlobalShortcut);
        return () => window.removeEventListener("keydown", handleGlobalShortcut);
    }, [isOpen]);

    if (!isOpen) return null;

    const suggestions = query.length > 0 ? [
        "IPC Section 302",
        "Bail application procedures",
        "Evidence admissibility",
        "State v. Williams precedent",
    ] : [];

    const results = {
        cases: query.length > 0 ? [
            { id: "1", title: "State v. Johnson", type: "Criminal Defense", fir: "FIR/2026/1234", status: "Investigation" },
            { id: "2", title: "Smith Corp. v. ABC Ltd", type: "Corporate", fir: "FIR/2026/1235", status: "Chargesheet" },
        ] : [],
        documents: query.length > 0 ? [
            { id: "1", name: "FIR Document.pdf", case: "State v. Johnson", type: "FIR", date: "2026-04-15" },
            { id: "2", name: "Witness Statement.pdf", case: "State v. Johnson", type: "Evidence", date: "2026-04-14" },
        ] : [],
        research: query.length > 0 ? [
            { id: "1", title: "IPC Section 323 - Voluntarily Causing Hurt", relevance: 95 },
            { id: "2", title: "State v. Williams (2023) - Similar Assault Case", relevance: 88 },
        ] : [],
    };

    const recentSearches = [
        { text: "State v. Johnson", icon: Briefcase, type: "case" },
        { text: "IPC Section 420", icon: BookOpen, type: "research" },
        { text: "Evidence submission deadline", icon: Clock, type: "deadline" },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search cases, documents, laws, precedents..."
                            className="flex-1 bg-transparent text-lg focus:outline-none"
                            autoFocus
                        />
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setActiveFilter("all")}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeFilter === "all" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            All Results
                        </button>
                        <button
                            onClick={() => setActiveFilter("cases")}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeFilter === "cases" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            Cases
                        </button>
                        <button
                            onClick={() => setActiveFilter("documents")}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeFilter === "documents" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            Documents
                        </button>
                        <button
                            onClick={() => setActiveFilter("research")}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeFilter === "research" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            Legal Research
                        </button>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-auto">
                    {query.length === 0 ? (
                        <div className="p-6">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Searches</h3>
                            <div className="space-y-2">
                                {recentSearches.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setQuery(item.text)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                                    >
                                        <item.icon className="w-5 h-5 text-muted-foreground" />
                                        <span>{item.text}</span>
                                        <span className="ml-auto text-xs text-muted-foreground">{item.type}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Trending Searches</h3>
                                <div className="flex flex-wrap gap-2">
                                    {["IPC Section 302", "Bail procedures", "Evidence rules", "Criminal appeals"].map((trend) => (
                                        <button
                                            key={trend}
                                            onClick={() => setQuery(trend)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-sm transition-colors"
                                        >
                                            <TrendingUp className="w-3 h-3" />
                                            {trend}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 space-y-6">
                            {suggestions.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Suggestions</h3>
                                    <div className="space-y-1">
                                        {suggestions.map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                onClick={() => setQuery(suggestion)}
                                                className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg transition-colors text-sm"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(activeFilter === "all" || activeFilter === "cases") && results.cases.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Cases</h3>
                                    <div className="space-y-2">
                                        {results.cases.map((caseItem) => (
                                            <button
                                                key={caseItem.id}
                                                onClick={() => {
                                                    navigate(`/cases/${caseItem.id}`);
                                                    onClose();
                                                }}
                                                className="w-full flex items-start gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                                            >
                                                <Briefcase className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium mb-1">{caseItem.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {caseItem.type} • {caseItem.fir}
                                                    </div>
                                                </div>
                                                <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                    {caseItem.status}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(activeFilter === "all" || activeFilter === "documents") && results.documents.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Documents</h3>
                                    <div className="space-y-2">
                                        {results.documents.map((doc) => (
                                            <button
                                                key={doc.id}
                                                onClick={onClose}
                                                className="w-full flex items-start gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                                            >
                                                <FileText className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium mb-1">{doc.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {doc.case} • {doc.type}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground">{doc.date}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(activeFilter === "all" || activeFilter === "research") && results.research.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Legal Research</h3>
                                    <div className="space-y-2">
                                        {results.research.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={onClose}
                                                className="w-full flex items-start gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                                            >
                                                <BookOpen className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium">{item.title}</div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-green-600">
                                                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                                                    {item.relevance}% match
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-muted/30">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span><kbd className="px-2 py-1 bg-white border border-border rounded">↑↓</kbd> Navigate</span>
                            <span><kbd className="px-2 py-1 bg-white border border-border rounded">Enter</kbd> Select</span>
                            <span><kbd className="px-2 py-1 bg-white border border-border rounded">Esc</kbd> Close</span>
                        </div>
                        <span>Powered by AI Search</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
