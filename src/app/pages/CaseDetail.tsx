import { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Upload, FileText, Send, Bot, Search, Download, Sparkles, CheckCircle2, Circle } from "lucide-react";

export function CaseDetail() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("overview");
    const [message, setMessage] = useState("");
    const [agentMode, setAgentMode] = useState<"research" | "analysis" | "summary">("analysis");

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "documents", label: "Documents" },
        { id: "ai-insights", label: "AI Insights" },
        { id: "timeline", label: "Timeline" },
    ];

    const documents = [
        { id: "1", name: "FIR Document.pdf", type: "FIR", date: "2026-04-15", size: "2.4 MB" },
        { id: "2", name: "Witness Statement - John Smith.pdf", type: "Evidence", date: "2026-04-14", size: "1.2 MB" },
        { id: "3", name: "Forensic Report.pdf", type: "Evidence", date: "2026-04-13", size: "3.8 MB" },
        { id: "4", name: "Medical Records.pdf", type: "Evidence", date: "2026-04-12", size: "1.9 MB" },
    ];

    const chatHistory = [
        { role: "user", content: "Summarize the key evidence in this case" },
        { role: "assistant", content: "Based on the documents uploaded, the key evidence includes:\n\n1. FIR filed on April 15, 2026, alleging assault\n2. Witness testimony from John Smith corroborating the timeline\n3. Forensic evidence linking the defendant to the scene\n4. Medical records documenting injuries\n\nThe evidence chain is strong and well-documented.", mode: "analysis" },
    ];

    const timelineSteps = [
        { phase: "FIR", status: "completed", date: "2026-04-15" },
        { phase: "Investigation", status: "active", date: "In Progress" },
        { phase: "Chargesheet", status: "pending", date: "Pending" },
        { phase: "Trial", status: "pending", date: "Pending" },
        { phase: "Judgment", status: "pending", date: "Pending" },
    ];

    const suggestedPrompts = [
        "Summarize this case",
        "What are the key arguments?",
        "Find relevant laws and precedents",
        "Analyze the evidence strength",
    ];

    const aiInsights = [
        { title: "Case Strength", content: "The prosecution has strong evidence with multiple corroborating witnesses and forensic evidence.", confidence: 85 },
        { title: "Legal Precedents", content: "Found 12 relevant cases with similar circumstances. State v. Williams (2023) is particularly applicable.", confidence: 92 },
        { title: "Suggested Strategy", content: "Focus on establishing timeline discrepancies in witness statements. Request additional forensic analysis.", confidence: 78 },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="bg-white border-b border-border px-6 py-4">
                <div className="flex items-center gap-4 mb-4">
                    <Link to="/cases" className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl mb-1">State v. Johnson</h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>FIR/2026/1234</span>
                            <span>•</span>
                            <span>Criminal Defense</span>
                            <span>•</span>
                            <span>Client: Robert Johnson</span>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
                        Investigation Phase
                    </div>
                </div>

                <div className="flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-auto">
                    {activeTab === "overview" && (
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <h2 className="text-lg mb-4">Case Information</h2>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Case Type:</span>
                                            <span className="font-medium">Criminal Defense</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">FIR Number:</span>
                                            <span className="font-medium">FIR/2026/1234</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Filing Date:</span>
                                            <span className="font-medium">April 15, 2026</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Current Phase:</span>
                                            <span className="font-medium">Investigation</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Next Deadline:</span>
                                            <span className="font-medium text-orange-600">April 22, 2026</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-6">
                                    <h2 className="text-lg mb-4">Client Information</h2>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Name:</span>
                                            <span className="font-medium">Robert Johnson</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Contact:</span>
                                            <span className="font-medium">+1 555-0123</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Email:</span>
                                            <span className="font-medium">r.johnson@email.com</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Address:</span>
                                            <span className="font-medium">123 Main St, City</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6">
                                <h2 className="text-lg mb-4">Case Timeline</h2>
                                <div className="space-y-4">
                                    {timelineSteps.map((step, index) => (
                                        <div key={step.phase} className="flex items-start gap-4">
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.status === "completed" ? "bg-green-100" :
                                                        step.status === "active" ? "bg-blue-100" :
                                                            "bg-gray-100"
                                                    }`}>
                                                    {step.status === "completed" ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                    ) : step.status === "active" ? (
                                                        <Circle className="w-5 h-5 text-blue-600 fill-blue-600" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                {index < timelineSteps.length - 1 && (
                                                    <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-8 ${step.status === "completed" ? "bg-green-300" : "bg-gray-300"
                                                        }`} />
                                                )}
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <div className="font-medium">{step.phase}</div>
                                                <div className="text-sm text-muted-foreground">{step.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-accent to-indigo-600 rounded-xl p-6 text-white">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg mb-2">AI Recommendation</h3>
                                        <p className="text-white/90 mb-4">Based on the current case status and evidence, the suggested next step is to proceed with the investigation phase and gather additional witness statements.</p>
                                        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "documents" && (
                        <div className="p-6 space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg">Case Documents</h2>
                                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                                        <Upload className="w-4 h-4" />
                                        Upload Document
                                    </button>
                                </div>

                                <div className="border-2 border-dashed border-border rounded-xl p-8 mb-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground mb-1">Drag and drop files here</p>
                                    <p className="text-sm text-muted-foreground">or click to browse</p>
                                </div>

                                <div className="space-y-3">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-red-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium mb-1">{doc.name}</h3>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        <span>{doc.type}</span>
                                                        <span>•</span>
                                                        <span>{doc.date}</span>
                                                        <span>•</span>
                                                        <span>{doc.size}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="px-3 py-1.5 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity text-sm">
                                                    Summarize
                                                </button>
                                                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "ai-insights" && (
                        <div className="p-6 space-y-6">
                            <div className="bg-gradient-to-br from-accent to-indigo-600 rounded-xl p-6 text-white">
                                <h2 className="text-xl mb-2">AI-Generated Insights</h2>
                                <p className="text-white/90">Powered by advanced legal AI analysis</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {aiInsights.map((insight, index) => (
                                    <div key={index} className="bg-card border border-border rounded-xl p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="text-lg">{insight.title}</h3>
                                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                                {insight.confidence}% confidence
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground">{insight.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "timeline" && (
                        <div className="p-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h2 className="text-lg mb-6">Case Lifecycle Progress</h2>
                                <div className="space-y-6">
                                    {timelineSteps.map((step, index) => (
                                        <div key={step.phase} className="flex items-start gap-4">
                                            <div className="relative">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.status === "completed" ? "bg-green-100 border-2 border-green-600" :
                                                        step.status === "active" ? "bg-blue-100 border-2 border-blue-600" :
                                                            "bg-gray-100 border-2 border-gray-300"
                                                    }`}>
                                                    {step.status === "completed" ? (
                                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                                    ) : step.status === "active" ? (
                                                        <Circle className="w-6 h-6 text-blue-600 fill-blue-600" />
                                                    ) : (
                                                        <Circle className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                {index < timelineSteps.length - 1 && (
                                                    <div className={`absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-12 ${step.status === "completed" ? "bg-green-300" : "bg-gray-300"
                                                        }`} />
                                                )}
                                            </div>
                                            <div className="flex-1 pt-2">
                                                <div className="text-lg font-medium mb-1">{step.phase}</div>
                                                <div className="text-sm text-muted-foreground mb-2">{step.date}</div>
                                                {step.status === "active" && (
                                                    <div className="text-sm text-blue-600">Currently in progress</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-96 border-l border-border bg-white flex flex-col">
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3 mb-4">
                            <Bot className="w-6 h-6 text-accent" />
                            <h2 className="text-lg">AI Assistant</h2>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setAgentMode("research")}
                                className={`flex-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${agentMode === "research"
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                🔍 Research
                            </button>
                            <button
                                onClick={() => setAgentMode("analysis")}
                                className={`flex-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${agentMode === "analysis"
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                📄 Analysis
                            </button>
                            <button
                                onClick={() => setAgentMode("summary")}
                                className={`flex-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${agentMode === "summary"
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                ✨ Summary
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {suggestedPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => setMessage(prompt)}
                                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-xs transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4 space-y-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "assistant" && (
                                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mr-2">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] ${msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground"
                                    } rounded-2xl px-4 py-2.5`}>
                                    {msg.role === "assistant" && msg.mode && (
                                        <div className="text-xs opacity-70 mb-1">
                                            {msg.mode === "research" ? "🔍 Legal Research Mode" :
                                                msg.mode === "analysis" ? "📄 Document Analysis Mode" :
                                                    "✨ Summarization Mode"}
                                        </div>
                                    )}
                                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-border">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setMessage("");
                            }}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ask about this case..."
                                className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button
                                type="submit"
                                className="p-2.5 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
