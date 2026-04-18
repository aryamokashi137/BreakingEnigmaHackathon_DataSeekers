import { Outlet, NavLink } from "react-router";
import { LayoutDashboard, Briefcase, Bot, FileText, Calendar, Settings, Search, Bell, User } from "lucide-react";

export function MainLayout() {
    const navItems = [
        { path: "/", label: "Dashboard", icon: LayoutDashboard },
        { path: "/cases", label: "Cases", icon: Briefcase },
        { path: "/ai-assistant", label: "AI Assistant", icon: Bot },
        { path: "/documents", label: "Documents", icon: FileText },
        { path: "/deadlines", label: "Deadlines", icon: Calendar },
        { path: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-background">
            <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
                <div className="p-6 border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
                            <span className="text-xl">⚖️</span>
                        </div>
                        <div>
                            <h1 className="font-semibold text-sidebar-foreground">LegalFlow AI</h1>
                            <p className="text-xs text-muted-foreground">Case Management</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.path === "/"}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-sidebar-border">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
                            <p className="text-xs text-muted-foreground truncate">Senior Partner</p>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-border px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 max-w-2xl">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search cases, laws, documents..."
                                    className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 ml-6">
                            <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                                <Bell className="w-5 h-5 text-foreground" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
