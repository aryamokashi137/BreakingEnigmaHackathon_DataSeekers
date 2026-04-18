import { useState } from "react";
import { Search, Plus, Filter, LayoutGrid, List, Clock, X } from "lucide-react";

export function Cases() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const cases = [
        {
            id: 1,
            name: "State v. Johnson",
            client: "Robert Johnson",
            type: "Criminal Defense",
            fir: "FIR/2026/1234",
            status: "Investigation",
            statusColor: "bg-blue-100 text-blue-700",
            date: "2026-04-15",
            progress: 35,
        },
        {
            id: 2,
            name: "Smith Corp. v. ABC Ltd",
            client: "Smith Corporation",
            type: "Corporate",
            fir: "FIR/2026/1235",
            status: "Chargesheet",
            statusColor: "bg-purple-100 text-purple-700",
            date: "2026-04-10",
            progress: 60,
        },
        {
            id: 3,
            name: "Estate of Williams",
            client: "Williams Family",
            type: "Civil",
            fir: "FIR/2026/1236",
            status: "Trial",
            statusColor: "bg-orange-100 text-orange-700",
            date: "2026-04-08",
            progress: 75,
        },
        {
            id: 4,
            name: "Brown v. State Tax Authority",
            client: "James Brown",
            type: "Tax Law",
            fir: "FIR/2026/1237",
            status: "Investigation",
            statusColor: "bg-blue-100 text-blue-700",
            date: "2026-04-05",
            progress: 20,
        },
        {
            id: 5,
            name: "Green Industries Merger",
            client: "Green Industries",
            type: "Corporate",
            fir: "FIR/2026/1238",
            status: "Chargesheet",
            statusColor: "bg-purple-100 text-purple-700",
            date: "2026-04-01",
            progress: 85,
        },
        {
            id: 6,
            name: "Davis Employment Dispute",
            client: "Sarah Davis",
            type: "Employment Law",
            fir: "FIR/2026/1239",
            status: "Trial",
            statusColor: "bg-orange-100 text-orange-700",
            date: "2026-03-28",
            progress: 90,
        },
    ];

    return (
        <div className="flex-1 p-8 overflow-auto h-full relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Cases</h1>
                    <p className="text-muted-foreground mt-1">Manage and track all your legal cases</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                    <Plus className="w-4 h-4" />
                    New Case
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 mb-8 flex flex-row items-center justify-between shadow-sm">
                <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search cases by name, client, or FIR number..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fb] border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    <select className="bg-[#f8f9fb] border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground appearance-none min-w-[120px]">
                        <option>All Cases</option>
                        <option>Active</option>
                        <option>Closed</option>
                    </select>
                    <button className="p-2.5 border border-border rounded-lg hover:bg-muted text-muted-foreground transition-colors flex items-center justify-center">
                        <Filter className="w-4 h-4" />
                    </button>
                    <div className="flex items-center border border-border rounded-lg p-1 bg-[#f8f9fb]">
                        <button className="p-1.5 bg-card shadow-sm rounded-md text-foreground">
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-muted-foreground hover:text-foreground">
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.map((c) => (
                    <div key={c.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-center mb-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.statusColor}`}>
                                {c.status}
                            </span>
                            <div className="flex items-center text-muted-foreground text-xs gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{c.date}</span>
                            </div>
                        </div>
                        
                        <h3 className="text-[1.1rem] font-medium text-foreground truncate">{c.name}</h3>
                        <p className="text-[13px] text-muted-foreground mt-1 truncate">{c.client}</p>
                        
                        <div className="flex justify-between items-center mt-5 text-[13px]">
                            <span className="text-muted-foreground">{c.type}</span>
                            <span className="text-muted-foreground">{c.fir}</span>
                        </div>
                        
                        <div className="mt-6">
                            <div className="flex justify-between items-center text-xs mb-2">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="text-muted-foreground">{c.progress}%</span>
                            </div>
                            <div className="w-full bg-[#f1f5f9] rounded-full h-1.5">
                                <div 
                                    className="bg-accent h-1.5 rounded-full" 
                                    style={{ width: `${c.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
                            <h2 className="text-xl font-semibold text-foreground">Create New Case</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
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
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-transparent hover:bg-muted rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => setIsModalOpen(false)}
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
