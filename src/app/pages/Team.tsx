import { useState } from "react";
import { Users, UserPlus, Mail, MoreVertical, Shield, Crown, User as UserIcon } from "lucide-react";

export function Team() {
    const [showInviteModal, setShowInviteModal] = useState(false);

    const teamMembers = [
        { id: "1", name: "John Doe", email: "john.doe@smithlaw.com", role: "admin", status: "active", cases: 12, avatar: "JD" },
        { id: "2", name: "Sarah Williams", email: "sarah.w@smithlaw.com", role: "lawyer", status: "active", cases: 8, avatar: "SW" },
        { id: "3", name: "Michael Chen", email: "m.chen@smithlaw.com", role: "lawyer", status: "active", cases: 15, avatar: "MC" },
        { id: "4", name: "Emily Rodriguez", email: "emily.r@smithlaw.com", role: "paralegal", status: "active", cases: 6, avatar: "ER" },
        { id: "5", name: "David Kim", email: "d.kim@smithlaw.com", role: "lawyer", status: "invited", cases: 0, avatar: "DK" },
    ];

    const roleColors = {
        admin: "bg-purple-100 text-purple-700",
        lawyer: "bg-blue-100 text-blue-700",
        paralegal: "bg-green-100 text-green-700",
    };

    const roleIcons = {
        admin: Crown,
        lawyer: Shield,
        paralegal: UserIcon,
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl mb-1">Team & Collaboration</h1>
                    <p className="text-muted-foreground">Manage team members and assign cases</p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                    <UserPlus className="w-5 h-5" />
                    Invite Team Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="font-medium">Total Members</h3>
                    </div>
                    <div className="text-3xl font-semibold">{teamMembers.length}</div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h3 className="font-medium">Lawyers</h3>
                    </div>
                    <div className="text-3xl font-semibold">{teamMembers.filter((m) => m.role === "lawyer").length}</div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Crown className="w-5 h-5 text-purple-600" />
                        <h3 className="font-medium">Admins</h3>
                    </div>
                    <div className="text-3xl font-semibold">{teamMembers.filter((m) => m.role === "admin").length}</div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-5 h-5 text-orange-600" />
                        <h3 className="font-medium">Pending Invites</h3>
                    </div>
                    <div className="text-3xl font-semibold">{teamMembers.filter((m) => m.status === "invited").length}</div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-medium">Member</th>
                            <th className="text-left px-6 py-3 text-sm font-medium">Email</th>
                            <th className="text-left px-6 py-3 text-sm font-medium">Role</th>
                            <th className="text-left px-6 py-3 text-sm font-medium">Active Cases</th>
                            <th className="text-left px-6 py-3 text-sm font-medium">Status</th>
                            <th className="text-left px-6 py-3 text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamMembers.map((member) => {
                            const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
                            return (
                                <tr key={member.id} className="border-b border-border hover:bg-muted/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                                                {member.avatar}
                                            </div>
                                            <span className="font-medium">{member.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{member.email}</td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${roleColors[member.role as keyof typeof roleColors]}`}>
                                            <RoleIcon className="w-3 h-3" />
                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{member.cases}</td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs ${member.status === "active" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                            }`}>
                                            {member.status === "active" ? "Active" : "Invited"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
                        <h2 className="text-xl mb-4">Invite Team Member</h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="colleague@firm.com"
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-2">Role</label>
                                <select className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option value="lawyer">Lawyer</option>
                                    <option value="paralegal">Paralegal</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-2">Assign Cases (Optional)</label>
                                <select className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option value="">None</option>
                                    <option value="1">State v. Johnson</option>
                                    <option value="2">Smith Corp. v. ABC Ltd</option>
                                    <option value="3">Estate of Williams</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
