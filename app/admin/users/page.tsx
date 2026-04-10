"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AdminSideNav = dynamic(() => import("@/components/AdminSideNav"), { ssr: false });
const AdminTopNav = dynamic(() => import("@/components/AdminTopNav"), { ssr: false });
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "creator" | "guest";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin: string;
}

export default function UsersManagementPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }
    if (user && !isAdmin) {
      router.push("/dashboard");
    }
  }, [user, isAdmin, loading, router]);
  const [formData, setFormData] = useState({ email: "", name: "", role: "creator" });
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", { credentials: "include", cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users || []);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({ email: "", name: "", role: "creator" });
        setShowCreateForm(false);
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE", credentials: "include" });
      if (response.ok) fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (response.ok) fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-red-500/10 text-red-400 border border-red-500/20",
      creator: "bg-primary/10 text-primary border border-primary/20",
      guest: "bg-surface-container-highest text-on-surface-variant border border-outline-variant/20",
    };
    return styles[role] || styles.guest;
  };

  return (
    <div className="dark min-h-screen bg-background text-on-background font-body">
      <AdminSideNav activePage="users" />
      <AdminTopNav activePage="users" />

      <main className="md:ml-64 pt-20 min-h-screen p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="text-5xl font-extrabold font-headline tracking-tighter text-white mb-2">
              User <span className="text-primary italic">Management</span>
            </h2>
            <p className="text-on-surface-variant text-sm">Manage platform users, roles and permissions.</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-linear-to-r from-primary to-primary-container text-on-primary-fixed font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-xs"
          >
            <span className="material-symbols-outlined text-sm mr-1">person_add</span>
            Add User
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: "group", color: "text-white" },
              { label: "Active", value: stats.activeUsers, icon: "radio_button_checked", color: "text-green-400" },
              { label: "Admins", value: stats.adminUsers, icon: "shield_person", color: "text-red-400" },
              { label: "Creators", value: stats.creatorUsers, icon: "edit_note", color: "text-primary" },
            ].map((s) => (
              <Card key={s.label} className="bg-surface-container-low/50 backdrop-blur border-outline-variant/10">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`material-symbols-outlined text-sm ${s.color}`}>{s.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{s.label}</span>
                  </div>
                  <span className="text-2xl font-extrabold font-headline">{s.value || 0}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create User Form */}
        {showCreateForm && (
          <Card className="bg-surface-container-low/50 backdrop-blur border-outline-variant/10 mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold font-headline mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-surface-container-low border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50"
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-surface-container-low border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50"
                    required
                  />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary/50"
                  >
                    <option value="creator">Creator</option>
                    <option value="admin">Admin</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" size="sm">Create User</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-surface-container-low border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50"
            />
          </div>
          <div className="flex gap-2">
            {["all", "admin", "creator", "guest"].map((r) => (
              <Button
                key={r}
                variant={roleFilter === r ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter(r)}
                className="text-xs font-bold uppercase tracking-wider"
              >
                {r}
              </Button>
            ))}
          </div>
          <div className="flex gap-1 bg-surface-container-high rounded-lg p-1">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="h-8 w-8">
              <span className="material-symbols-outlined text-sm">grid_view</span>
            </Button>
            <Button variant={viewMode === "table" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("table")} className="h-8 w-8">
              <span className="material-symbols-outlined text-sm">view_list</span>
            </Button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUsers.map((u) => (
              <Card key={u.id} className="bg-surface-container-low/50 backdrop-blur border-outline-variant/10 group hover:border-primary/20 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <Avatar className="h-12 w-12 rounded-xl">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} />
                      <AvatarFallback className="rounded-xl">{(u.name || "U").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Badge variant="outline" className={`text-[10px] font-bold uppercase ${roleBadge(u.role)}`}>
                      {u.role}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold truncate">{u.name || "Unnamed"}</h4>
                  <p className="text-xs text-on-surface-variant truncate mb-3">{u.email}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-green-400" : u.status === "inactive" ? "bg-yellow-400" : "bg-red-400"}`}></div>
                    <span className="text-[10px] text-on-surface-variant capitalize">{u.status || "active"}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                      className="flex-1 px-2 py-1.5 bg-surface-container-low border border-outline-variant/20 rounded text-[10px] text-on-surface focus:outline-none"
                    >
                      <option value="creator">Creator</option>
                      <option value="admin">Admin</option>
                      <option value="guest">Guest</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(u.id)}
                      className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Table View */
          <Card className="bg-surface-container-low/50 backdrop-blur border-outline-variant/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">User</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Role</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Joined</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} />
                            <AvatarFallback className="rounded-lg">{(u.name || "U").charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold">{u.name || "Unnamed"}</p>
                            <p className="text-xs text-on-surface-variant">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase ${roleBadge(u.role)}`}>{u.role}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-green-400" : u.status === "inactive" ? "bg-yellow-400" : "bg-red-400"}`}></div>
                          <span className="text-xs capitalize">{u.status || "active"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant">{u.createdAt || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                            className="px-2 py-1 bg-surface-container-low border border-outline-variant/20 rounded text-[10px] text-on-surface focus:outline-none"
                          >
                            <option value="creator">Creator</option>
                            <option value="admin">Admin</option>
                            <option value="guest">Guest</option>
                          </select>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} className="h-7 w-7 text-red-400 hover:bg-red-500/10 hover:text-red-400">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                <p className="text-sm">No users match your filters</p>
              </div>
            )}
          </Card>
        )}

        {filteredUsers.length === 0 && viewMode === "grid" && (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 block">group_off</span>
            <p className="text-sm">No users found</p>
          </div>
        )}
      </main>
    </div>
  );
}
