import { useState } from "react";
import { Upload, FileText, Download, Eye, Sparkles, Search, Filter, Bot, Zap, FileSearch } from "lucide-react";

export function Documents() {
    const [viewMode, setViewMode] = useState<"all" | "preview">("all");
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [hoveredDoc, setHoveredDoc] = useState<string | null>(null);

    const documents = [
        { id: "1", name: "FIR Document.pdf", case: "State v. Johnson", type: "FIR", date: "2026-04-15", size: "2.4 MB" },
        { id: "2", name: "Witness Statement.pdf", case: "State v. Johnson", type: "Evidence", date: "2026-04-14", size: "1.2 MB" },
        { id: "3", name: "Contract Agreement.pdf", case: "Smith Corp. v. ABC", type: "Contract", date: "2026-04-13", size: "3.8 MB" },
        { id: "4", name: "Medical Records.pdf", case: "State v. Johnson", type: "Evidence", date: "2026-04-12", size: "1.9 MB" },
        { id: "5", name: "Property Deed.pdf", case: "Estate of Williams", type: "Legal Document", date: "2026-04-10", size: "2.1 MB" },
        { id: "6", name: "Financial Statement.pdf", case: "Smith Corp. v. ABC", type: "Evidence", date: "2026-04-08", size: "4.2 MB" },
    ];

    const mockSummary = {
        title: "FIR Document.pdf",
        keyPoints: [
            "Incident reported on April 15, 2026 at 14:30 hours",
            "Alleged assault at 123 Main Street, Commercial District",
            "Two witnesses present: John Smith and Jane Doe",
            "Medical examination conducted at City Hospital",
        ],
        importantSections: [
            "Section 2: Incident Details - Pages 3-5",
            "Section 4: Witness Statements - Pages 8-12",
            "Section 6: Medical Report - Pages 15-18",
        ],
        legalInsights: "This FIR falls under IPC Section 323 (Punishment for voluntarily causing hurt). The documentation is thorough with proper witness statements and medical evidence.",
    };

    return (
        <div className="h-full flex">
            <div className="flex-1 flex flex-col">
                <div className="p-6 border-b border-border bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl mb-1">Documents</h1>
                            <p className="text-muted-foreground">Manage and analyze all case documents</p>
                        </div>
                        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                            <Upload className="w-5 h-5" />
                            Upload Documents
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search documents by name or case..."
                                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <select className="px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                            <option>All Types</option>
                            <option>FIR</option>
                            <option>Evidence</option>
                            <option>Contract</option>
                            <option>Legal Document</option>
                        </select>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {viewMode === "all" ? (
                        <div>
                            <div className="border-2 border-dashed border-border rounded-xl p-12 mb-6 text-center bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                                <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg mb-2">Drag and drop files here</h3>
                                <p className="text-muted-foreground mb-4">or click to browse your computer</p>
                                <p className="text-sm text-muted-foreground">Supports PDF, DOCX, images (max 10MB per file)</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="relative flex items-center justify-between p-5 bg-card border border-border rounded-xl hover:shadow-md transition-all hover:border-accent/50"
                                        onMouseEnter={() => setHoveredDoc(doc.id)}
                                        onMouseLeave={() => setHoveredDoc(null)}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-7 h-7 text-red-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium mb-1 truncate">{doc.name}</h3>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{doc.case}</span>
                                                    <span>•</span>
                                                    <span>{doc.type}</span>
                                                    <span>•</span>
                                                    <span>{doc.date}</span>
                                                    <span>•</span>
                                                    <span>{doc.size}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedDoc(doc.id);
                                                    setViewMode("preview");
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Summarize
                                            </button>
                                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {hoveredDoc === doc.id && (
                                            <div className="absolute right-0 top-0 -translate-y-full mt-2 mr-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                <div className="bg-gradient-to-br from-accent to-indigo-600 text-white rounded-xl shadow-lg p-4 w-80 border border-accent">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Bot className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium mb-1">AI Agent Available</h3>
                                                            <p className="text-xs text-white/80">Click to activate AI analysis</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <button className="w-full flex items-center gap-3 p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left text-sm">
                                                            <Sparkles className="w-4 h-4" />
                                                            <span>Quick Summary</span>
                                                        </button>
                                                        <button className="w-full flex items-center gap-3 p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left text-sm">
                                                            <FileSearch className="w-4 h-4" />
                                                            <span>Extract Key Points</span>
                                                        </button>
                                                        <button className="w-full flex items-center gap-3 p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left text-sm">
                                                            <Zap className="w-4 h-4" />
                                                            <span>Find Legal Issues</span>
                                                        </button>
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-white/20">
                                                        <p className="text-xs text-white/70">Powered by AI Legal Analysis Engine</p>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 right-8 translate-y-1/2 w-3 h-3 bg-accent rotate-45"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-6 h-full">
                            <div className="bg-card border border-border rounded-xl p-6 overflow-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg">Document Preview</h2>
                                    <button
                                        onClick={() => setViewMode("all")}
                                        className="text-sm text-accent hover:underline"
                                    >
                                        Back to list
                                    </button>
                                </div>
                                <div className="bg-gray-100 rounded-lg p-8 text-center min-h-[600px] flex items-center justify-center">
                                    <div>
                                        <FileText className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">PDF Preview</p>
                                        <p className="text-sm text-gray-500 mt-2">{mockSummary.title}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 overflow-auto">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-indigo-600 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-lg">AI Summary</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-medium mb-3">Key Points</h3>
                                        <ul className="space-y-2">
                                            {mockSummary.keyPoints.map((point, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                                                    <span className="text-sm text-muted-foreground">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-medium mb-3">Important Sections</h3>
                                        <ul className="space-y-2">
                                            {mockSummary.importantSections.map((section, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                                    <span className="text-sm text-muted-foreground">{section}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                                        <h3 className="font-medium mb-2 text-accent">Legal Insights</h3>
                                        <p className="text-sm text-muted-foreground">{mockSummary.legalInsights}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                                            Export Summary
                                        </button>
                                        <button className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
                                            Ask Questions
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
