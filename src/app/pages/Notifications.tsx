import { useState } from "react";
import { Bell, AlertCircle, CheckCircle2, Info, Sparkles, Calendar, FileText, X, Check } from "lucide-react";

export function Notifications() {
    const [filter, setFilter] = useState<"all" | "urgent" | "info">("all");

    const notifications = [
        {
            id: "1",
            type: "urgent",
            icon: AlertCircle,
            title: "Motion Filing Deadline Tomorrow",
            message: "Motion filing for State v. Johnson is due tomorrow at 5:00 PM",
            case: "State v. Johnson",
            time: "2 hours ago",
            read: false,
        },
        {
            id: "2",
            type: "urgent",
            icon: Calendar,
            title: "Court Hearing in 2 Days",
            message: "Hearing scheduled for April 20, 2026 at 10:00 AM",
            case: "Smith Corp. v. ABC Ltd",
            time: "4 hours ago",
            read: false,
        },
        {
            id: "3",
            type: "info",
            icon: Sparkles,
            title: "AI Analysis Complete",
            message: "Document summary for 'FIR Document.pdf' is ready to review",
            case: "State v. Johnson",
            time: "5 hours ago",
            read: false,
        },
        {
            id: "4",
            type: "info",
            icon: FileText,
            title: "New Document Uploaded",
            message: "Witness Statement.pdf has been added to the case",
            case: "State v. Johnson",
            time: "1 day ago",
            read: true,
        },
        {
            id: "5",
            type: "info",
            icon: Sparkles,
            title: "AI Suggestion Available",
            message: "Recommended next step: Proceed to Investigation Phase",
            case: "Estate of Williams",
            time: "1 day ago",
            read: true,
        },
        {
            id: "6",
            type: "urgent",
            icon: AlertCircle,
            title: "Evidence Submission Due",
            message: "Evidence submission deadline is April 25, 2026",
            case: "Estate of Williams",
            time: "2 days ago",
            read: true,
        },
        {
            id: "7",
            type: "info",
            icon: CheckCircle2,
            title: "Case Status Updated",
            message: "State v. Johnson moved to Investigation phase",
            case: "State v. Johnson",
            time: "3 days ago",
            read: true,
        },
    ];

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "all") return true;
        return n.type === filter;
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl mb-1">Notifications</h1>
                    <p className="text-muted-foreground">
                        {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm">
                        <Check className="w-4 h-4" />
                        Mark all as read
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${filter === "all"
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        All Notifications
                    </button>
                    <button
                        onClick={() => setFilter("urgent")}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${filter === "urgent"
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        Urgent
                    </button>
                    <button
                        onClick={() => setFilter("info")}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${filter === "info"
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        Informational
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                    {filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`flex items-start gap-4 p-5 rounded-xl border transition-all ${!notification.read
                                    ? "bg-card border-accent/50 shadow-sm"
                                    : "bg-card border-border hover:shadow-sm"
                                }`}
                        >
                            <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.type === "urgent"
                                        ? "bg-red-100"
                                        : notification.icon === Sparkles
                                            ? "bg-purple-100"
                                            : "bg-blue-100"
                                    }`}
                            >
                                <notification.icon
                                    className={`w-6 h-6 ${notification.type === "urgent"
                                            ? "text-red-600"
                                            : notification.icon === Sparkles
                                                ? "text-purple-600"
                                                : "text-blue-600"
                                        }`}
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-medium mb-1">{notification.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{notification.case}</span>
                                            <span>•</span>
                                            <span>{notification.time}</span>
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2" />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {!notification.read && (
                                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg mb-4">Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Notifications</span>
                                <span className="font-semibold">{notifications.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Unread</span>
                                <span className="font-semibold text-accent">{unreadCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Urgent</span>
                                <span className="font-semibold text-red-600">
                                    {notifications.filter((n) => n.type === "urgent").length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-medium mb-1 text-orange-900">Urgent Items</h3>
                                <p className="text-sm text-orange-700 mb-3">
                                    You have {notifications.filter((n) => n.type === "urgent" && !n.read).length} urgent
                                    notifications requiring attention
                                </p>
                                <button className="text-sm text-orange-700 hover:underline">View all urgent →</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg mb-4">Notification Settings</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Email Notifications</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Push Notifications</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">AI Suggestions</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
