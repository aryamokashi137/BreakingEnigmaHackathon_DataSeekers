import { useState } from "react";
import { useNavigate } from "react-router";
import { Scale, Briefcase, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export function Onboarding() {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const handleComplete = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
                    <div className="flex items-center justify-center mb-8">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                            <Scale className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${s <= step ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                                    </div>
                                    {s < 3 && (
                                        <div
                                            className={`w-16 h-1 mx-2 ${s < step ? "bg-accent" : "bg-muted"}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="text-center max-w-2xl mx-auto">
                            <h1 className="text-3xl mb-4">Welcome to LegalFlow AI</h1>
                            <p className="text-muted-foreground text-lg mb-8">
                                Your AI-powered legal workflow assistant. Let's get you set up in just a few steps.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="p-6 bg-muted rounded-xl">
                                    <Briefcase className="w-10 h-10 text-primary mx-auto mb-3" />
                                    <h3 className="font-medium mb-2">Manage Cases</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Track all your legal cases in one place
                                    </p>
                                </div>
                                <div className="p-6 bg-muted rounded-xl">
                                    <FileText className="w-10 h-10 text-primary mx-auto mb-3" />
                                    <h3 className="font-medium mb-2">Analyze Documents</h3>
                                    <p className="text-sm text-muted-foreground">
                                        AI-powered document analysis and summarization
                                    </p>
                                </div>
                                <div className="p-6 bg-muted rounded-xl">
                                    <Scale className="w-10 h-10 text-primary mx-auto mb-3" />
                                    <h3 className="font-medium mb-2">Legal Research</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Find relevant laws and precedents instantly
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:opacity-90 transition-opacity mx-auto"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="max-w-xl mx-auto">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl mb-4">Create Your First Case</h1>
                                <p className="text-muted-foreground">
                                    Let's start by setting up your first legal case
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm mb-2">Case Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., State v. Johnson"
                                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-2">Client Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Robert Johnson"
                                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-2">Case Type</label>
                                    <select className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                                        <option>Criminal Defense</option>
                                        <option>Civil Litigation</option>
                                        <option>Corporate Law</option>
                                        <option>Family Law</option>
                                        <option>Tax Law</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm mb-2">FIR Number (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., FIR/2026/1234"
                                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Continue
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="max-w-xl mx-auto">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl mb-4">Upload Your First Document</h1>
                                <p className="text-muted-foreground">
                                    Add case documents to get AI-powered insights
                                </p>
                            </div>

                            <div className="border-2 border-dashed border-border rounded-xl p-12 mb-8 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg mb-2">Drag and drop files here</h3>
                                <p className="text-muted-foreground mb-4">or click to browse</p>
                                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                                    Choose Files
                                </button>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <Scale className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-blue-900 mb-1">AI Analysis Ready</h3>
                                        <p className="text-sm text-blue-700">
                                            Once you upload documents, our AI will automatically analyze and summarize them,
                                            extract key points, and identify relevant legal issues.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleComplete}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Complete Setup
                                    <CheckCircle2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="text-center mt-6">
                                <button
                                    onClick={handleComplete}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Skip for now
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
