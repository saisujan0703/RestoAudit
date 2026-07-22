"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Mail, 
  Phone, 
  Shield, 
  Search, 
  Loader2,
  X,
  Check
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  fetchUsers, 
  registerUser 
} from "@/lib/api";
import { toast } from "sonner";

export default function StaffManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    userRole: "Staff",
    branch: { branchId: 0 }
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUsers();
      const raw = localStorage.getItem("restroaudit.currentUser");
      const current = raw ? JSON.parse(raw) : null;
      const currentBranchId = current ? Number(current.branchId ?? null) : null;
      const currentBranchName = current ? current.branchName ?? null : null;
      const list = Array.isArray(data) ? data : [];
      // Filter only staff and manager roles and scope to current branch when available
      setUsers(list.filter(u => {
        if (!(u.userRole === "Staff" || u.userRole === "Manager")) return false;
        if (!currentBranchId) return true;
        const userBranchId = u?.branch?.branchId ?? u?.branchId ?? null;
        return Number(userBranchId) === Number(currentBranchId);
      }));
      if (currentBranchName) setNewStaff(prev => ({ ...prev, branch: { branchId: currentBranchId } }));
    } catch (err) {
      toast.error("Failed to load staff members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const raw = localStorage.getItem("restroaudit.currentUser");
      const current = raw ? JSON.parse(raw) : null;
      const currentBranchId = current ? Number(current.branchId ?? null) : null;
      const payload = { ...newStaff };
      if (currentBranchId) payload.branch = { branchId: currentBranchId };
      await registerUser(payload);
      toast.success("Staff member added successfully");
      setIsAddingStaff(false);
      setNewStaff({
        firstName: "",
        lastName: "",
        email: "",
        phoneNo: "",
        userRole: "Staff",
        branch: { branchId: currentBranchId ?? 0 }
      });
      loadUsers();
    } catch (err: any) {
      if (err?.status === 403) toast.error(err.message || "Forbidden: cannot create for other branch");
      else if (err?.status === 400) toast.error(err.body || "Bad request");
      else toast.error("Failed to add staff member");
    }
  };

  const filteredStaff = users.filter(u => 
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && users.length === 0) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-serif text-[var(--text-1)]">
             Human <span className="italic text-[var(--accent-primary)]">Capital</span>
           </h1>
           <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs mt-2">Manage branch personnel and access</p>
        </div>
        <Button 
          onClick={() => setIsAddingStaff(true)}
          className="bg-[var(--accent-primary)] text-black hover:bg-[var(--accent-primary-hover)] rounded-2xl px-8 py-7 h-auto font-black uppercase tracking-widest text-sm shadow-xl shadow-[var(--accent-primary-glow)]"
        >
          <UserPlus className="w-5 h-5 mr-3" />
          Onboard Staff
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid md:grid-cols-3 gap-8">
         <div className="md:col-span-2 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-[var(--text-muted)]" />
            <Input 
              placeholder="Search personnel by name, email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-16 h-20 bg-[var(--bg-surface)] border-[var(--border-subtle)] rounded-[2rem] text-lg text-[var(--text-1)] focus:ring-4 focus:ring-[var(--accent-primary-dim)]"
            />
         </div>
         <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] rounded-[2rem] flex items-center px-10">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary-dim)] flex items-center justify-center">
                  <Users className="w-7 h-7 text-[var(--accent-primary)]" />
               </div>
               <div>
                  <p className="text-4xl font-serif font-black text-[var(--text-1)]">{users.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Active Personnel</p>
               </div>
            </div>
         </Card>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredStaff.map((staff) => (
            <motion.div
              key={staff.userId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] rounded-[2.5rem] overflow-hidden group hover:border-[var(--accent-primary)] transition-all shadow-xl">
                <div className="h-24 bg-gradient-to-r from-[var(--accent-primary-dim)] to-transparent relative">
                   <div className="absolute -bottom-10 left-8">
                      <div className="w-20 h-20 rounded-3xl bg-[var(--bg-primary)] border-4 border-[var(--bg-surface)] flex items-center justify-center text-3xl font-serif font-black text-[var(--accent-primary)] shadow-2xl">
                         {staff.firstName[0]}
                      </div>
                   </div>
                   <div className="absolute top-4 right-6 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center gap-2">
                      <Shield className="w-3 h-3 text-[var(--accent-primary)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">{staff.userRole}</span>
                   </div>
                </div>
                <CardContent className="p-8 pt-16">
                  <h3 className="text-2xl font-serif font-black text-[var(--text-1)] mb-1">
                    {staff.firstName} {staff.lastName}
                  </h3>
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center gap-4 text-[var(--text-muted)]">
                      <Mail className="w-4 h-4 text-[var(--accent-primary)]" />
                      <span className="text-sm font-bold truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[var(--text-muted)]">
                      <Phone className="w-4 h-4 text-[var(--accent-primary)]" />
                      <span className="text-sm font-bold">{staff.phoneNo || "No phone listed"}</span>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex gap-4">
                    {(() => {
                      const raw = localStorage.getItem("restroaudit.currentUser");
                      const currentId = raw ? JSON.parse(raw).userId : null;
                      if (currentId && Number(staff.userId) === Number(currentId)) {
                        return (
                          <div className="flex-1 text-center text-xs font-black uppercase tracking-widest text-[var(--accent-primary)] py-2">
                            Current Session
                          </div>
                        );
                      }
                      return (
                        <Button variant="ghost" className="flex-1 rounded-xl text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deactivate
                        </Button>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Staff Modal Overlay */}
      <AnimatePresence>
        {isAddingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingStaff(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-12">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-serif font-black text-[var(--text-1)]">Onboard New Personnel</h2>
                  <button onClick={() => setIsAddingStaff(false)} className="p-3 rounded-full hover:bg-[var(--bg-hover)]">
                    <X className="w-6 h-6 text-[var(--text-muted)]" />
                  </button>
                </div>

                <form onSubmit={handleAddStaff} className="space-y-6">
                    {newStaff.branch?.branchId && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Branch</Label>
                        <div className="h-14 bg-[var(--bg-primary)] border-[var(--border-subtle)] rounded-2xl px-6 flex items-center">
                          <span className="font-bold">{`Branch #${newStaff.branch.branchId}`}</span>
                        </div>
                      </div>
                    )}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">First Name</Label>
                      <Input 
                        value={newStaff.firstName}
                        onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})}
                        className="h-14 bg-[var(--bg-primary)] border-[var(--border-subtle)] rounded-2xl px-6 text-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Last Name</Label>
                      <Input 
                        value={newStaff.lastName}
                        onChange={(e) => setNewStaff({...newStaff, lastName: e.target.value})}
                        className="h-14 bg-[var(--bg-primary)] border-[var(--border-subtle)] rounded-2xl px-6 text-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Email Address</Label>
                    <Input 
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                      className="h-14 bg-[var(--bg-primary)] border-[var(--border-subtle)] rounded-2xl px-6 text-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Phone Number</Label>
                    <Input 
                      value={newStaff.phoneNo}
                      onChange={(e) => setNewStaff({...newStaff, phoneNo: e.target.value})}
                      className="h-14 bg-[var(--bg-primary)] border-[var(--border-subtle)] rounded-2xl px-6 text-lg"
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>

                  <div className="pt-8">
                    <Button 
                      type="submit" 
                      className="w-full h-20 bg-[var(--accent-primary)] text-black hover:bg-[var(--accent-primary-hover)] rounded-3xl font-black uppercase tracking-[0.2em] text-lg shadow-xl shadow-[var(--accent-primary-glow)]"
                    >
                      Initialize Account
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
