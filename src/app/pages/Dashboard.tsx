import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Briefcase, Clock, AlertCircle, Plus, FileText, ArrowRight, TrendingUp, Calendar, X } from "lucide-react";

export function Dashboard() {
    const navigate = useNavigate();
    const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);

    const stats = [
        { label: "Total Cases", value: "24", icon: Briefcase, change: "+3 this month", trend: "up" },
        { label: "Active Cases", value: "12", icon: Clock, change: "8 pending review", trend: "neutral" },
        { label: "Upcoming Deadlines", value: "5", icon: AlertCircle, change: "Next 7 days", trend: "warning" },
    ];

    const recentCases = [
        { id: "1", name: "State v. Johnson", type: "Criminal Defense", firNumber: "FIR/2026/1234", status: "Investigation", date: "2026-04-15" },
        { id: "2", name: "Smith Corp. v. ABC Ltd", type: "Corporate", firNumber: "FIR/2026/1235", status: "Chargesheet", date: "2026-04-10" },
        { id: "3", name: "Estate of Williams", type: "Civil", firNumber: "FIR/2026/1236", status: "Trial", date: "2026-04-08" },
    ];

    const continueWorking = [
        { id: "1", title: "Review Evidence - State v. Johnson", type: "Document Analysis", progress: 65 },
        { id: "2", title: "Draft Motion - Smith Corp.", type: "Legal Draft", progress: 40 },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl mb-1">Welcome back, John</h1>
                    <p className="text-muted-foreground">Here's what's happening with your cases today</p>
                </div>
                <button
                    onClick={() => setIsNewCaseModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    New Case
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.trend === "warning" ? "bg-orange-100" : "bg-blue-50"
                                }`}>
                                <stat.icon className={`w-6 h-6 ${stat.trend === "warning" ? "text-orange-600" : "text-primary"}`} />
                            </div>
                            {stat.trend === "up" && <TrendingUp className="w-5 h-5 text-green-600" />}
                        </div>
                        <div className="text-3xl font-semibold mb-1">{stat.value}</div>
                        <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
                        <div className="text-xs text-muted-foreground">{stat.change}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl">Recent Cases</h2>
                            <Link to="/cases" className="text-accent hover:underline text-sm">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentCases.map((caseItem) => (
                                <Link
                                    key={caseItem.id}
                                    to={`/cases/${caseItem.id}`}
                                    className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium mb-1">{caseItem.name}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{caseItem.type}</span>
                                                <span>•</span>
                                                <span>{caseItem.firNumber}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`inline-block px-3 py-1 rounded-full text-xs mb-2 ${caseItem.status === "Investigation" ? "bg-blue-100 text-blue-700" :
                                                    caseItem.status === "Chargesheet" ? "bg-purple-100 text-purple-700" :
                                                        "bg-orange-100 text-orange-700"
                                                }`}>
                                                {caseItem.status}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{caseItem.date}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl mb-4">Continue Working</h2>
                        <div className="space-y-3">
                            {continueWorking.map((item) => (
                                <div key={item.id} className="p-4 border border-border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-medium mb-1">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground">{item.type}</p>
                                        </div>
                                        <button className="text-accent hover:text-accent/80">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-accent h-2 rounded-full transition-all"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">{item.progress}% complete</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-accent to-indigo-600 rounded-xl p-6 text-white shadow-sm">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl mb-2">Quick Actions</h2>
                        <p className="text-white/80 text-sm mb-4">Common tasks to speed up your workflow</p>
                        <div className="space-y-2">
                            <Link to="/documents" className="block w-full bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-lg text-left transition-colors">
                                Upload Document
                            </Link>
                            <Link to="/ai-assistant" className="block w-full bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-lg text-left transition-colors">
                                Search Legal Database
                            </Link>
                            <Link to="/ai-assistant" className="block w-full bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-lg text-left transition-colors">
                                Generate Draft
                            </Link>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="w-5 h-5 text-primary" />
                            <h2 className="text-xl">Upcoming Deadlines</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="text-sm font-medium text-red-900">Motion Filing</div>
                                <div className="text-xs text-red-700">Tomorrow, 5:00 PM</div>
                            </div>
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="text-sm font-medium text-orange-900">Court Hearing</div>
                                <div className="text-xs text-orange-700">April 20, 10:00 AM</div>
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="text-sm font-medium text-blue-900">Evidence Submission</div>
                                <div className="text-xs text-blue-700">April 25, 3:00 PM</div>
                            </div>
                        </div>
                        <Link to="/deadlines" className="block mt-4 text-center text-sm text-accent hover:underline">
                            View all deadlines
                        </Link>
                    </div>
                </div>
            </div>

            {isNewCaseModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
                            <h2 className="text-xl font-semibold text-foreground">Create New Case</h2>
                            <button 
                                onClick={() => setIsNewCaseModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Case Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., State v. Johnson" 
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Client Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Robert Johnson" 
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Case Type</label>
                                    <select className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm appearance-none">
                                        <option>Criminal Defense</option>
                                        <option>Corporate</option>
                                        <option>Civil</option>
                                        <option>Tax Law</option>
                                        <option>Employment Law</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">FIR / Reference</label>
                                    <input 
                                        type="text" 
                                        placeholder="FIR/YYYY/XXXX" 
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/30">
                            <button 
                                onClick={() => setIsNewCaseModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-transparent hover:bg-muted rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setIsNewCaseModalOpen(false);
                                    navigate("/cases");
                                }}
                                className="px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Create Case
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
