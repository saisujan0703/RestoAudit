"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldCheck, UserCog, ChefHat, User, Mail, Phone, Building2, X, Check, Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fetchUsers, registerUser } from "@/lib/api";
import { toast } from "sonner";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const SG = "#7A9E7E"; const OW = "#2D3A2E"; const BA = "#6B5E4E"; const P = "#F5F0E8"; const OL = "#A8C5A0";

const roleConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Admin:    { icon: ShieldCheck, color: "#B5860D", bg: "rgba(181,134,13,0.1)"  },
  Manager:  { icon: UserCog,     color: "#3B82F6", bg: "rgba(59,130,246,0.1)"  },
  Staff:    { icon: ChefHat,     color: "#10B981", bg: "rgba(16,185,129,0.1)"  },
  Customer: { icon: User,        color: BA,        bg: "rgba(107,94,78,0.08)"  },
};
const ALL_ROLES = ["Admin", "Manager", "Staff", "Customer"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.5rem 0.75rem", borderRadius: 10,
  border: "1px solid rgba(107,94,78,0.2)", background: "rgba(245,240,232,0.7)",
  fontSize: "0.82rem", color: OW, fontFamily: "'Jost', sans-serif", outline: "none", boxSizing: "border-box",
};

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter]  = useState("all");
  const [dbUsers, setDbUsers]        = useState<any[]>([]);
  const [editingId, setEditingId]    = useState<number | null>(null);
  const [editForm, setEditForm]      = useState<any>({});
  const [isSaving, setIsSaving]      = useState(false);
  const [isDeleting, setIsDeleting]  = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const [activeContextBranchId, setActiveContextBranchId] = useState<number>(0);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", phoneNo: "", password: "", userRole: "Staff" });
  const [isCreating, setIsCreating] = useState(false);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("restroaudit.currentUser") || "{}"); } catch { return {}; }
  })();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("restroaudit.adminSelectedBranch");
      if (stored) {
        setActiveContextBranchId(Number(stored));
      }
    } catch {}

    (async () => {
      try { setDbUsers(await fetchUsers()); }
      catch { toast.error("Failed to fetch users"); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.email || !newUser.password) {
      toast.error("Please fill in required fields (Name, Email, Password)");
      return;
    }
    setIsCreating(true);
    try {
      const payload = { ...newUser, branch: { branchId: activeContextBranchId } };
      await registerUser(payload);
      toast.success(`${newUser.userRole} created successfully!`);
      setShowCreate(false);
      setNewUser({ firstName: "", lastName: "", email: "", phoneNo: "", password: "", userRole: "Staff" });
      const users = await fetchUsers();
      setDbUsers(Array.isArray(users) ? users : []);
    } catch (e: any) {
      toast.error("Failed to create user: " + e.message);
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (user: any) => {
    setEditingId(user.userId);
    setEditForm({
      firstName: user.firstName || "",
      lastName:  user.lastName  || "",
      email:     user.email     || "",
      phoneNo:   user.phoneNo   || "",
      userRole:  user.userRole  || "Customer",
    });
  };

  const saveEdit = async (user: any) => {
    const isSelf = Number(user.userId) === Number(currentUser.userId);
    if (isSelf && editForm.userRole !== user.userRole) {
      toast.error("You cannot change your own role.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:8080/api/users/${user.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error(await res.text());
      setDbUsers(prev => prev.map(u => u.userId === user.userId ? { ...u, ...editForm } : u));
      toast.success(`${editForm.firstName}'s profile updated!`);
      setEditingId(null);
    } catch (e: any) {
      toast.error("Failed to save: " + (e.message || "Unknown error"));
    } finally { setIsSaving(false); }
  };

  const deleteUser = async (user: any) => {
    const isSelf = Number(user.userId) === Number(currentUser.userId);
    if (isSelf) {
      toast.error("You cannot delete yourself.");
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/users/${user.userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      setDbUsers(prev => prev.filter(u => u.userId !== user.userId));
      toast.success(`${user.firstName} has been removed.`);
      setEditingId(null);
      setConfirmDeleteId(null);
    } catch (e: any) {
      toast.error("Failed to delete user: " + (e.message || "Unknown error"));
    } finally { setIsDeleting(false); }
  };

  const getBranchName = (user: any) => user?.branch?.addressLine ?? user?.branch?.address_line ?? "—";
  const getDeptName   = (user: any) => user?.department?.deptName ?? null;

  const filteredUsers = dbUsers.filter(u => {
    const bid = Number(u?.branch?.branchId ?? u?.branchId);
    if (bid !== activeContextBranchId && u.userRole !== "Admin" && u.userRole !== "admin") return false;

    const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    return (name.includes(searchQuery.toLowerCase()) || (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()))
      && (roleFilter === "all" || u.userRole === roleFilter);
  });

  const roles = ["all", ...new Set(dbUsers.map(u => u.userRole))];

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" style={{ background: "var(--bg-surface)" }} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" style={{ background: "var(--bg-surface)" }} />)}
      </div>
    </div>
  );

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6"
      style={{ fontFamily: "'Jost', sans-serif" }}>

      {/* Header */}
      <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 500, color: OW, margin: 0 }}>
            User <em style={{ color: SG }}>Management</em>
          </h1>
          <p style={{ color: BA, marginTop: 4, fontSize: "0.9rem" }}>Showing {filteredUsers.length} users for Branch #{activeContextBranchId}</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1.5rem", borderRadius: 100, background: `linear-gradient(135deg,${OW},${BA})`, color: P, fontWeight: 600, fontSize: "0.82rem", border: "none", cursor: "pointer", boxShadow: "0 4px 15px rgba(45,58,46,0.2)" }}>
          <Plus size={15} /> Add Staff/Manager
        </button>
      </motion.div>

      {/* Search + Filter */}
      <motion.div variants={fadeUp} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} color={BA} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.55 }} />
          <input placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, padding: "0.72rem 1rem 0.72rem 2.6rem", borderRadius: 14 }} />
        </div>
        {roles.map(role => (
          <button key={role} onClick={() => setRoleFilter(role)}
            style={{ padding: "0.42rem 1rem", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "capitalize", cursor: "pointer", border: "1px solid", transition: "all 0.2s",
              background: roleFilter === role ? OW : "rgba(107,94,78,0.06)",
              color: roleFilter === role ? P : BA,
              borderColor: roleFilter === role ? OW : "rgba(107,94,78,0.15)" }}>
            {role === "all" ? "All Roles" : role}
          </button>
        ))}
      </motion.div>

      {/* Users Grid */}
      <motion.div variants={stagger} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {filteredUsers.map(user => {
          const config = roleConfig[user.userRole] || roleConfig["Customer"];
          const Icon = config.icon;
          const isEditing = editingId === user.userId;
          const isSelf = Number(user.userId) === Number(currentUser.userId);

          return (
            <motion.div key={user.userId} variants={fadeUp}>
              <Card style={{ background: "rgba(255,253,248,0.9)", border: `1px solid ${isEditing ? SG : "rgba(107,94,78,0.12)"}`, borderRadius: 20, overflow: "hidden", transition: "border 0.2s" }}>
                <CardContent style={{ padding: "1.5rem" }}>

                  {/* Avatar + name */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: "1rem" }}>
                    <Avatar style={{ width: 48, height: 48 }}>
                      <AvatarFallback style={{ background: config.bg, color: config.color, fontWeight: 600 }}>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: OW, fontSize: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
                        {user.firstName} {user.lastName}
                        {isSelf && <span style={{ fontSize: "0.58rem", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: 4, background: "rgba(122,158,126,0.15)", color: SG, letterSpacing: "0.1em" }}>YOU</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <Icon style={{ width: 14, height: 14, color: config.color }} />
                        <span style={{ fontSize: "0.82rem", color: config.color, fontWeight: 600 }}>{user.userRole}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact info (shown when NOT editing) */}
                  {!isEditing && (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: BA }}>
                          <Mail size={13} style={{ opacity: 0.6 }} /> {user.email}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: BA }}>
                          <Phone size={13} style={{ opacity: 0.6 }} /> {user.phoneNo}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: BA }}>
                          <Building2 size={13} style={{ opacity: 0.6 }} /> {getBranchName(user)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginBottom: "1rem" }}>
                        <span style={{ padding: "0.2rem 0.7rem", borderRadius: 100, fontSize: "0.65rem", fontWeight: 700, background: config.bg, color: config.color, border: `1px solid ${config.color}33` }}>
                          {user.userRole}
                        </span>
                        {getDeptName(user) && (
                          <span style={{ padding: "0.2rem 0.7rem", borderRadius: 100, fontSize: "0.65rem", fontWeight: 700, background: "rgba(107,94,78,0.06)", color: BA, border: "1px solid rgba(107,94,78,0.12)" }}>
                            {getDeptName(user)}
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {/* Edit form (shown when editing) */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                          <div>
                            <label style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 4 }}>First Name</label>
                            <input style={inputStyle} value={editForm.firstName} onChange={e => setEditForm((p: any) => ({ ...p, firstName: e.target.value }))} />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 4 }}>Last Name</label>
                            <input style={inputStyle} value={editForm.lastName} onChange={e => setEditForm((p: any) => ({ ...p, lastName: e.target.value }))} />
                          </div>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <label style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 4 }}>Email</label>
                          <input style={inputStyle} value={editForm.email} onChange={e => setEditForm((p: any) => ({ ...p, email: e.target.value }))} />
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 4 }}>Phone</label>
                          <input style={inputStyle} value={editForm.phoneNo} onChange={e => setEditForm((p: any) => ({ ...p, phoneNo: e.target.value }))} />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 6 }}>Role</label>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {ALL_ROLES.map(r => (
                              <button key={r} onClick={() => !isSelf && setEditForm((p: any) => ({ ...p, userRole: r }))}
                                disabled={isSelf}
                                style={{ padding: "0.3rem 0.8rem", borderRadius: 8, fontSize: "0.7rem", fontWeight: 700, cursor: isSelf ? "not-allowed" : "pointer", border: "1px solid", transition: "all 0.15s",
                                  background: editForm.userRole === r ? OW : "rgba(107,94,78,0.05)",
                                  color: editForm.userRole === r ? P : BA,
                                  borderColor: editForm.userRole === r ? OW : "rgba(107,94,78,0.15)",
                                  opacity: isSelf ? 0.4 : 1 }}>
                                {r}
                              </button>
                            ))}
                          </div>
                          {isSelf && <p style={{ fontSize: "0.68rem", color: "rgba(192,57,43,0.8)", marginTop: 6, fontStyle: "italic" }}>You cannot change your own role.</p>}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          {confirmDeleteId === user.userId ? (
                            <>
                              <button onClick={() => deleteUser(user)} disabled={isDeleting}
                                style={{ flex: 1, padding: "0.55rem", borderRadius: 10, background: "#c0392b", color: "#fff", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: isDeleting ? "not-allowed" : "pointer" }}>
                                {isDeleting ? "Deleting..." : "Yes, Delete"}
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)}
                                style={{ flex: 1, padding: "0.55rem", borderRadius: 10, background: "rgba(107,94,78,0.1)", color: BA, fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => saveEdit(user)} disabled={isSaving}
                                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0.55rem", borderRadius: 10, background: isSaving ? "rgba(107,94,78,0.1)" : OW, color: isSaving ? BA : P, fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: isSaving ? "not-allowed" : "pointer" }}>
                                {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                {isSaving ? "Saving…" : "Save Changes"}
                              </button>
                              <button onClick={() => setEditingId(null)}
                                style={{ padding: "0.55rem 1rem", borderRadius: 10, background: "rgba(107,94,78,0.08)", color: BA, fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                                <X size={13} /> Cancel
                              </button>
                              {!isSelf && (
                                <button onClick={() => setConfirmDeleteId(user.userId)}
                                  style={{ padding: "0.55rem 1rem", borderRadius: 10, background: "rgba(192,57,43,0.08)", color: "#c0392b", fontSize: "0.75rem", fontWeight: 700, border: "1px solid rgba(192,57,43,0.2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                                  <Trash2 size={13} /> Delete
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer edit button */}
                  {!isEditing && (
                    <div style={{ borderTop: "1px solid rgba(107,94,78,0.1)", paddingTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
                      <button onClick={() => openEdit(user)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.4rem 1rem", borderRadius: 10, background: SG, color: P, fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
                        <Pencil size={12} /> Edit
                      </button>
                    </div>
                  )}

                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CREATE USER DIALOG */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="rounded-3xl p-0 max-w-md overflow-hidden" style={{ background: P, border: "1px solid rgba(107,94,78,0.12)" }}>
          <div className="grain" style={{ background: `radial-gradient(circle at 30% 30%, rgba(122,158,126,0.4) 0%, transparent 55%), ${OW}`, padding: "2rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(168,197,160,0.15)", border: "1px solid rgba(168,197,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <UserCog size={18} color={OL} />
            </div>
            <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.9rem", fontWeight: 500, color: P, margin: "0 0 0.25rem" }}>
              Add <em style={{ color: OL }}>Staff</em>
            </DialogTitle>
            <DialogDescription style={{ fontSize: "0.78rem", color: "rgba(245,240,232,0.5)" }}>
              Assign new personnel to Branch #{activeContextBranchId}
            </DialogDescription>
          </div>
          <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 6 }}>First Name</label>
                <input value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 6 }}>Last Name</label>
                <input value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 6 }}>Email Address</label>
              <input value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} type="email" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 6 }}>Phone No</label>
                <input value={newUser.phoneNo} onChange={e => setNewUser({...newUser, phoneNo: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 6 }}>Temporary Password</label>
                <input value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} type="password" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 6 }}>Role Assignment</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["Manager", "Staff"].map(r => (
                  <button key={r} onClick={() => setNewUser({...newUser, userRole: r})}
                    style={{ flex: 1, padding: "0.6rem", borderRadius: 10, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", border: "1px solid", transition: "all 0.15s",
                      background: newUser.userRole === r ? OW : "rgba(107,94,78,0.05)",
                      color: newUser.userRole === r ? P : BA,
                      borderColor: newUser.userRole === r ? OW : "rgba(107,94,78,0.15)" }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleCreateUser} disabled={isCreating} style={{ marginTop: "0.5rem", padding: "0.85rem", borderRadius: 14, background: `linear-gradient(135deg,${SG},${OL})`, color: OW, fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: isCreating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {isCreating ? "Creating..." : "Create Profile"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
