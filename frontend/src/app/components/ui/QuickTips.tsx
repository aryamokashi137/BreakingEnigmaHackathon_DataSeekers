import { useState } from "react";
import { X, Lightbulb, Keyboard, Zap } from "lucide-react";

export function QuickTips() {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    const tips = [
        { icon: Keyboard, title: "Quick Search", description: "Press Cmd+K (or Ctrl+K) to open global search anytime" },
        { icon: Zap, title: "AI Assistant", description: "Ask the AI assistant for legal research, document analysis, or case insights" },
        { icon: Lightbulb, title: "Smart Tags", description: "Use tags to organize and filter your cases efficiently" },
    ];

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Quick Tips</h3>
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                >
                    <X className="w-4 h-4 text-blue-600" />
                </button>
            </div>

            <div className="space-y-2">
                {tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <tip.icon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="text-sm font-medium text-blue-900">{tip.title}:</span>{" "}
                            <span className="text-sm text-blue-700">{tip.description}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
