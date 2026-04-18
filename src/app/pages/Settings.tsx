import { User, Bell, Shield, Palette, Database, CreditCard } from "lucide-react";

export function Settings() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl mb-1">Settings</h1>
                <p className="text-muted-foreground">Manage your account and application preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-6 h-6 text-primary" />
                            <h2 className="text-xl">Profile Information</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue="John Doe"
                                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-2">Law Firm</label>
                                    <input
                                        type="text"
                                        defaultValue="Smith & Associates"
                                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Email</label>
                                <input
                                    type="email"
                                    defaultValue="john.doe@smithlaw.com"
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Phone</label>
                                <input
                                    type="tel"
                                    defaultValue="+1 555-0123"
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="w-6 h-6 text-primary" />
                            <h2 className="text-xl">Notifications</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div>
                                    <div className="font-medium mb-1">Email Notifications</div>
                                    <div className="text-sm text-muted-foreground">Receive updates about your cases via email</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div>
                                    <div className="font-medium mb-1">Deadline Reminders</div>
                                    <div className="text-sm text-muted-foreground">Get notified 24 hours before deadlines</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div>
                                    <div className="font-medium mb-1">AI Insights</div>
                                    <div className="text-sm text-muted-foreground">Receive AI-generated case insights</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="w-6 h-6 text-primary" />
                            <h2 className="text-xl">Security</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm mb-2">Current Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-2">New Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Palette className="w-6 h-6 text-primary" />
                            <h2 className="text-xl">Appearance</h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm mb-2">Theme</label>
                                <select className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option>Light</option>
                                    <option>Dark</option>
                                    <option>Auto</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Language</label>
                                <select className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Spanish</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-6 h-6 text-primary" />
                            <h2 className="text-xl">Data & Storage</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Documents</span>
                                <span className="font-medium">2.4 GB</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Cases</span>
                                <span className="font-medium">856 MB</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Used</span>
                                <span className="font-medium">3.2 GB / 50 GB</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                                <div className="bg-accent h-2 rounded-full" style={{ width: "6.4%" }} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-accent to-indigo-600 rounded-xl p-6 text-white">
                        <CreditCard className="w-8 h-8 mb-3" />
                        <h3 className="text-lg mb-2">Upgrade to Pro</h3>
                        <p className="text-white/90 text-sm mb-4">Unlock unlimited AI queries, advanced analytics, and priority support</p>
                        <button className="w-full bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                            View Plans
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
