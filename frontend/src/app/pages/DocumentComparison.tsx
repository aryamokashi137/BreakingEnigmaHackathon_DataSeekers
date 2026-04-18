import { useState } from "react";
import { ArrowLeft, FileText, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { AIConfidence } from "../components/ui/AIConfidence";

export function DocumentComparison() {
    const [selectedDocs, setSelectedDocs] = useState(["1", "2"]);

    const documents = [
        { id: "1", name: "Original Contract.pdf", case: "Smith Corp. v. ABC", date: "2026-03-15" },
        { id: "2", name: "Amended Contract.pdf", case: "Smith Corp. v. ABC", date: "2026-04-10" },
    ];

    const differences = [
        {
            section: "Payment Terms - Clause 3.2",
            doc1: "$50,000 payable within 30 days",
            doc2: "$75,000 payable within 45 days",
            type: "modified",
            significance: "high",
        },
        {
            section: "Termination Clause - Section 7",
            doc1: "30-day notice required",
            doc2: "60-day notice required",
            type: "modified",
            significance: "medium",
        },
        {
            section: "Arbitration Clause - Section 9.5",
            doc1: "Not present",
            doc2: "Mandatory arbitration in Delaware",
            type: "added",
            significance: "high",
        },
        {
            section: "Liability Cap - Section 5.3",
            doc1: "Unlimited liability",
            doc2: "Liability capped at $100,000",
            type: "modified",
            significance: "high",
        },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="bg-white border-b border-border px-6 py-4">
                <div className="flex items-center gap-4 mb-4">
                    <Link to="/documents" className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl mb-1">Document Comparison</h1>
                        <p className="text-sm text-muted-foreground">AI-powered analysis of document differences</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
                <div className="bg-gradient-to-br from-accent to-indigo-600 rounded-xl p-6 text-white">
                    <div className="flex items-start gap-4">
                        <Sparkles className="w-8 h-8 flex-shrink-0" />
                        <div>
                            <h2 className="text-xl mb-2">AI Analysis Summary</h2>
                            <p className="text-white/90 mb-4">
                                Found {differences.length} significant differences between the documents. {differences.filter(d => d.significance === "high").length} require immediate attention.
                            </p>
                            <AIConfidence
                                confidence={92}
                                explanation="Analysis based on clause-by-clause comparison using legal document parsing AI. All differences have been verified."
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {documents.map((doc) => (
                        <div key={doc.id} className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{doc.name}</h3>
                                    <p className="text-sm text-muted-foreground">{doc.date}</p>
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center text-muted-foreground">
                                Document Preview
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-xl mb-4">Key Differences</h2>
                    <div className="space-y-4">
                        {differences.map((diff, index) => (
                            <div
                                key={index}
                                className={`p-5 rounded-lg border-l-4 ${diff.significance === "high"
                                        ? "bg-red-50 border-red-600"
                                        : "bg-yellow-50 border-yellow-600"
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium">{diff.section}</h3>
                                        {diff.significance === "high" ? (
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 text-yellow-600" />
                                        )}
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs ${diff.type === "added" ? "bg-green-100 text-green-700" :
                                            diff.type === "modified" ? "bg-blue-100 text-blue-700" :
                                                "bg-red-100 text-red-700"
                                        }`}>
                                        {diff.type.charAt(0).toUpperCase() + diff.type.slice(1)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-2">Original Contract</div>
                                        <div className="p-3 bg-white rounded border border-border">
                                            <p className="text-sm">{diff.doc1}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-2">Amended Contract</div>
                                        <div className="p-3 bg-white rounded border border-border">
                                            <p className="text-sm">{diff.doc2}</p>
                                        </div>
                                    </div>
                                </div>

                                {diff.significance === "high" && (
                                    <div className="mt-3 p-3 bg-white rounded border border-red-200">
                                        <p className="text-sm text-red-800">
                                            <strong>⚠️ Legal Alert:</strong> This change significantly alters the contractual obligations.
                                            Review recommended before signing.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-xl mb-4">Recommendations</h2>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-blue-900 mb-1">Review Payment Terms</h3>
                                <p className="text-sm text-blue-700">
                                    The payment amount increased by 50%. Ensure client is aware of this change.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-purple-900 mb-1">New Arbitration Clause</h3>
                                <p className="text-sm text-purple-700">
                                    Mandatory arbitration clause added. This removes right to jury trial. Critical review needed.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                            <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-green-900 mb-1">Liability Protection</h3>
                                <p className="text-sm text-green-700">
                                    Liability cap added which may benefit your client. Consider as negotiation point.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
