import { useState } from "react";
import { Bot, Send, Search, Sparkles, BookOpen, FileText, Scale } from "lucide-react";

export function AIAssistant() {
    const [message, setMessage] = useState("");
    const [activeMode, setActiveMode] = useState<"research" | "analysis" | "summary" | "draft">("research");
    
    const [chatHistory, setChatHistory] = useState([
        {
            role: "assistant",
            content: "Hello! I'm your AI Legal Assistant. I can help you with:\n\n• Legal research and case law\n• Document analysis and summarization\n• Drafting legal documents\n• Finding relevant precedents\n\nHow can I assist you today?",
        },
    ]);

    const handleModeChange = (mode: "research" | "analysis" | "summary" | "draft") => {
        setActiveMode(mode);
        
        let promptMessage = "";
        switch(mode) {
            case "research": promptMessage = "Switched to **Legal Research Mode**. I can help find precedents, acts, and case laws. What are we looking for?"; break;
            case "analysis": promptMessage = "Switched to **Document Analysis Mode**. I can review case files and extract key legal arguments and loopholes. What document should we analyze?"; break;
            case "summary": promptMessage = "Switched to **Summarization Mode**. Paste any lengthy legal judgment or affidavit and I'll create a concise summary."; break;
            case "draft": promptMessage = "Switched to **Legal Drafting Mode**. I can assist with drafting motions, legal notices, and applications. What do you need drafted?"; break;
        }

        setChatHistory(prev => [...prev, { role: "assistant", content: promptMessage }]);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        const userMsg = message;
        const updatedHistory = [...chatHistory, { role: "user", content: userMsg }];
        
        setChatHistory(updatedHistory);
        setMessage("");

        // Simulate AI response
        setTimeout(() => {
            setChatHistory([
                ...updatedHistory, 
                { role: "assistant", content: `I have received your request regarding "${userMsg}". In the live environment, I would perform ${activeMode} on this and return a structured legal response.` }
            ]);
        }, 1000);
    };

    const handleSuggestedQuery = (queryText: string, mode: "research" | "analysis" | "summary" | "draft") => {
        if (activeMode !== mode) {
            handleModeChange(mode);
        }
        setMessage(queryText);
    };

    const suggestedQueries = [
        { icon: Search, text: "Search for precedents on assault cases", mode: "research" as const },
        { icon: FileText, text: "Analyze uploaded evidence document", mode: "analysis" as const },
        { icon: BookOpen, text: "Explain IPC Section 323", mode: "research" as const },
        { icon: Scale, text: "Draft a bail application", mode: "draft" as const },
    ];

    const recentSearches = [
        "IPC Section 420 - Cheating",
        "Bail application procedures",
        "Evidence admissibility rules",
        "State v. Williams precedent",
    ];

    return (
        <div className="h-full flex">
            <div className="flex-1 flex flex-col">
                <div className="p-6 border-b border-border bg-card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent to-indigo-600 rounded-xl flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl">AI Legal Assistant</h1>
                            <p className="text-muted-foreground">Advanced AI for legal research and analysis</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleModeChange("research")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeMode === "research"
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            <Search className="w-4 h-4" />
                            Legal Research
                        </button>
                        <button
                            onClick={() => handleModeChange("analysis")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeMode === "analysis"
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            Document Analysis
                        </button>
                        <button
                            onClick={() => handleModeChange("summary")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeMode === "summary"
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            Summarization
                        </button>
                        <button
                            onClick={() => handleModeChange("draft")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeMode === "draft"
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            <Scale className="w-4 h-4" />
                            Legal Drafting
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6 scroll-smooth">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                {msg.role === "assistant" && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] ${msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card border border-border"
                                    } rounded-2xl px-6 py-4 shadow-sm`}>
                                    <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 py-4">
                            <div className="col-span-2">
                                <h2 className="text-lg mb-4">Suggested Queries</h2>
                            </div>
                            {suggestedQueries.map((query, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestedQuery(query.text, query.mode)}
                                    className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-shadow text-left"
                                >
                                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <query.icon className="w-5 h-5 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium mb-1">{query.text}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {query.mode === "research" ? "🔍 Research Mode" :
                                                query.mode === "analysis" ? "📄 Analysis Mode" :
                                                    query.mode === "draft" ? "📝 Drafting Mode" : "✨ Summary Mode"}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-card">
                    <div className="max-w-4xl mx-auto">
                        <form
                            onSubmit={handleSendMessage}
                            className="flex gap-3"
                        >
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={
                                    activeMode === "research" ? "Search laws, sections, precedents..." :
                                        activeMode === "analysis" ? "Ask about documents..." :
                                            activeMode === "summary" ? "What would you like summarized?" :
                                                "What legal document do you need?"
                                }
                                className="flex-1 px-6 py-3.5 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className="px-6 py-3.5 bg-accent text-accent-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                <span>Send</span>
                            </button>
                        </form>
                        <p className="text-xs text-muted-foreground text-center mt-3">
                            AI responses are suggestions only. Always verify legal information.
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-80 border-l border-border bg-white p-6">
                <h2 className="text-lg mb-4">Recent Searches</h2>
                <div className="space-y-2 mb-6">
                    {recentSearches.map((search, index) => (
                        <button
                            key={index}
                            onClick={() => setMessage(search)}
                            className="w-full text-left px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm"
                        >
                            {search}
                        </button>
                    ))}
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <h3 className="font-medium mb-2">💡 Pro Tip</h3>
                    <p className="text-sm text-muted-foreground">
                        Use specific case numbers or legal sections for more accurate results. Example: "IPC Section 302"
                    </p>
                </div>

                <div className="mt-6 bg-card border border-border rounded-xl p-4">
                    <h3 className="font-medium mb-3">Current Context</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Mode:</span>
                            <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                                {activeMode === "research" ? "🔍 Research" :
                                    activeMode === "analysis" ? "📄 Analysis" :
                                        activeMode === "summary" ? "✨ Summary" : "📝 Drafting"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Documents:</span>
                            <span className="font-medium">0 loaded</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
