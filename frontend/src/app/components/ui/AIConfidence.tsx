import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, BookOpen } from "lucide-react";

interface AIConfidenceProps {
    confidence: number;
    explanation?: string;
    sources?: string[];
}

export function AIConfidence({ confidence, explanation, sources }: AIConfidenceProps) {
    const [expanded, setExpanded] = useState(false);

    const getConfidenceColor = (score: number) => {
        if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
        if (score >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-orange-100 text-orange-700 border-orange-200";
    };

    const getConfidenceLabel = (score: number) => {
        if (score >= 80) return "High Confidence";
        if (score >= 60) return "Medium Confidence";
        return "Low Confidence";
    };

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <span className="font-medium">AI Analysis</span>
                    <div className={`px-3 py-1 rounded-full text-xs border ${getConfidenceColor(confidence)}`}>
                        {getConfidenceLabel(confidence)} • {confidence}%
                    </div>
                </div>
                {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {expanded && (
                <div className="p-4 border-t border-border bg-muted/30 space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${confidence >= 80 ? "bg-green-600" :
                                        confidence >= 60 ? "bg-yellow-600" :
                                            "bg-orange-600"
                                    }`}
                                style={{ width: `${confidence}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium">{confidence}%</span>
                    </div>

                    {explanation && (
                        <div>
                            <h4 className="text-sm font-medium mb-2">Why this analysis?</h4>
                            <p className="text-sm text-muted-foreground">{explanation}</p>
                        </div>
                    )}

                    {sources && sources.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Sources Referenced
                            </h4>
                            <ul className="space-y-1">
                                {sources.map((source, index) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="text-accent">•</span>
                                        <span>{source}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
