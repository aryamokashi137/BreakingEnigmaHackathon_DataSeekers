import { useState } from "react";
import { Calendar as CalendarIcon, Plus, Clock, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";

export function Deadlines() {
    const [view, setView] = useState<"calendar" | "list">("list");
    const [currentMonth] = useState("April 2026");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const deadlines = [
        { id: "1", title: "Motion Filing", case: "State v. Johnson", date: "2026-04-19", time: "5:00 PM", priority: "high", type: "Filing" },
        { id: "2", title: "Court Hearing", case: "Smith Corp. v. ABC", date: "2026-04-20", time: "10:00 AM", priority: "high", type: "Hearing" },
        { id: "3", title: "Evidence Submission", case: "Estate of Williams", date: "2026-04-25", time: "3:00 PM", priority: "medium", type: "Submission" },
        { id: "4", title: "Client Meeting", case: "State v. Johnson", date: "2026-04-22", time: "2:00 PM", priority: "low", type: "Meeting" },
        { id: "5", title: "Discovery Deadline", case: "Brown v. Tax Authority", date: "2026-04-28", time: "11:59 PM", priority: "medium", type: "Deadline" },
        { id: "6", title: "Mediation Session", case: "Davis Employment", date: "2026-04-30", time: "9:00 AM", priority: "high", type: "Hearing" },
    ];

    const today = new Date("2026-04-18");
    const sortedDeadlines = [...deadlines].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const getDeadlineStatus = (date: string) => {
        const deadlineDate = new Date(date);
        const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return "overdue";
        if (diffDays === 0) return "today";
        if (diffDays === 1) return "tomorrow";
        if (diffDays <= 7) return "week";
        return "future";
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl mb-1">Deadlines & Calendar</h1>
                    <p className="text-muted-foreground">Track important dates and court schedules</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    Add Deadline
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="flex gap-2">
                    <button
                        onClick={() => setView("list")}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${view === "list"
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setView("calendar")}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${view === "calendar"
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        Calendar View
                    </button>
                </div>
            </div>

            {view === "list" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {sortedDeadlines.map((deadline) => {
                            const status = getDeadlineStatus(deadline.date);
                            return (
                                <div
                                    key={deadline.id}
                                    className={`p-5 rounded-xl border-l-4 ${status === "overdue" ? "bg-red-50 border-red-600" :
                                            status === "today" || status === "tomorrow" ? "bg-orange-50 border-orange-600" :
                                                status === "week" ? "bg-blue-50 border-blue-600" :
                                                    "bg-card border-gray-300"
                                        } border border-border shadow-sm`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">{deadline.title}</h3>
                                                {status === "today" && (
                                                    <span className="px-2 py-1 bg-orange-600 text-white rounded-full text-xs">
                                                        Today
                                                    </span>
                                                )}
                                                {status === "tomorrow" && (
                                                    <span className="px-2 py-1 bg-orange-500 text-white rounded-full text-xs">
                                                        Tomorrow
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground mb-3">{deadline.case}</p>
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span>{new Date(deadline.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                                    <span>{deadline.time}</span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs ${deadline.priority === "high" ? "bg-red-100 text-red-700" :
                                                        deadline.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                                                            "bg-green-100 text-green-700"
                                                    }`}>
                                                    {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)} Priority
                                                </span>
                                            </div>
                                        </div>
                                        <button className="p-2 hover:bg-white rounded-lg transition-colors">
                                            <CheckCircle2 className="w-6 h-6 text-muted-foreground hover:text-green-600" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg mb-4">Upcoming This Week</h2>
                            <div className="space-y-3">
                                {sortedDeadlines.filter(d => getDeadlineStatus(d.date) === "week" || getDeadlineStatus(d.date) === "today" || getDeadlineStatus(d.date) === "tomorrow").map((deadline) => (
                                    <div key={deadline.id} className="p-3 bg-muted rounded-lg">
                                        <div className="font-medium mb-1">{deadline.title}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(deadline.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {deadline.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium mb-1 text-red-900">Urgent Deadlines</h3>
                                    <p className="text-sm text-red-700 mb-3">
                                        {sortedDeadlines.filter(d => getDeadlineStatus(d.date) === "today" || getDeadlineStatus(d.date) === "tomorrow").length} deadlines need immediate attention
                                    </p>
                                    <button className="text-sm text-red-700 hover:underline">
                                        View details →
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg mb-4">Statistics</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Total Deadlines</span>
                                    <span className="font-semibold">{deadlines.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">This Week</span>
                                    <span className="font-semibold text-orange-600">
                                        {sortedDeadlines.filter(d => getDeadlineStatus(d.date) === "week" || getDeadlineStatus(d.date) === "today" || getDeadlineStatus(d.date) === "tomorrow").length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">High Priority</span>
                                    <span className="font-semibold text-red-600">
                                        {deadlines.filter(d => d.priority === "high").length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">{currentMonth}</h2>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day} className="text-center font-medium text-muted-foreground py-2">
                                {day}
                            </div>
                        ))}

                        {Array.from({ length: 3 }, (_, i) => (
                            <div key={`empty-${i}`} className="aspect-square p-2 text-muted-foreground" />
                        ))}

                        {Array.from({ length: 30 }, (_, i) => {
                            const day = i + 1;
                            const hasDeadline = deadlines.some(d => new Date(d.date).getDate() === day);
                            const isToday = day === 18;

                            return (
                                <div
                                    key={day}
                                    className={`aspect-square p-2 border rounded-lg ${isToday ? "bg-accent text-accent-foreground border-accent" :
                                            hasDeadline ? "bg-orange-50 border-orange-200" :
                                                "bg-muted/30 border-border"
                                        } hover:bg-muted transition-colors cursor-pointer`}
                                >
                                    <div className="text-sm font-medium">{day}</div>
                                    {hasDeadline && (
                                        <div className="mt-1">
                                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            Click on any date to view or add deadlines
                        </p>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
                            <h2 className="text-xl font-semibold text-foreground">Add New Deadline</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Motion Filing" 
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Related Case</label>
                                <select className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm appearance-none">
                                    <option>State v. Johnson</option>
                                    <option>Smith Corp. v. ABC</option>
                                    <option>Estate of Williams</option>
                                    <option>Brown v. Tax Authority</option>
                                    <option>Davis Employment</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Time</label>
                                    <input 
                                        type="time" 
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Priority</label>
                                    <select className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm appearance-none">
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Type</label>
                                    <select className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm appearance-none">
                                        <option>Filing</option>
                                        <option>Hearing</option>
                                        <option>Submission</option>
                                        <option>Meeting</option>
                                        <option>Deadline</option>
                                    </select>
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
                                Add Deadline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
