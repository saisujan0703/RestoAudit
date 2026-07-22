"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Phone, Users, Building2, ShoppingCart, Star,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Plus
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { fetchBranches, fetchUsers, fetchOrders, fetchFeedback, createBranch } from "@/lib/api";

const OW = "#2D3A2E";
const SG = "#7A9E7E";
const OL = "#A8C5A0";
const SA = "#C9B99A";
const BA = "#6B5E4E";
const P  = "#F5F0E8";

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const up      = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function AdminBranchesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches]   = useState<any[]>([]);
  const [users, setUsers]         = useState<any[]>([]);
  const [orders, setOrders]       = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [formOpen, setFormOpen]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBranch, setNewBranch] = useState({ addressLine: "", streetNo: "", pinCode: "", phoneNo: "" });

  const handleCreateBranch = async () => {
    if (!newBranch.addressLine) { toast.error("Branch name/address is required."); return; }
    setIsSubmitting(true);
    try {
      await createBranch(newBranch);
      toast.success("Branch initialized successfully!");
      setFormOpen(false);
      setNewBranch({ addressLine: "", streetNo: "", pinCode: "", phoneNo: "" });
      const b = await fetchBranches();
      setBranches(Array.isArray(b) ? b : []);
    } catch (err: any) {
      toast.error("Failed to initialize branch", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectBranch = (branchId: number) => {
    try {
      localStorage.setItem("restroaudit.adminSelectedBranch", String(branchId));
      toast.success("Branch context updated!", { description: `Switched to Branch #${branchId}` });
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error("Failed to switch branch", err);
    }
  };

  const [activeContextBranchId, setActiveContextBranchId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("restroaudit.adminSelectedBranch");
      if (stored) {
        setActiveContextBranchId(Number(stored));
      }
    } catch {}

    (async () => {
      try {
        const [b, u, o, f] = await Promise.all([
          fetchBranches(), fetchUsers(), fetchOrders(), fetchFeedback(),
        ]);
        setBranches(Array.isArray(b) ? b : []);
        setUsers(Array.isArray(u) ? u : []);
        setOrders(Array.isArray(o) ? o : []);
        setFeedbacks(Array.isArray(f) ? f : []);
        if (Array.isArray(b) && b.length > 0) setExpanded(b[0]?.branchId ?? b[0]?.branch_id ?? null);
      } catch { toast.error("Failed to load branch data."); }
      finally { setIsLoading(false); }
    })();
  }, []);

  function getBranchStats(branchId: number) {
    const branchUsers  = users.filter(u => Number(u?.branch?.branchId ?? u?.branchId) === branchId);
    const staffCount   = branchUsers.filter(u => u?.userRole !== "Customer" && u?.userRole !== "customer").length;
    const custCount    = branchUsers.filter(u => u?.userRole === "Customer" || u?.userRole === "customer").length;
    const branchOrders = orders.filter(o => Number(o?.branch?.branchId ?? o?.branch_id ?? o?.branchId) === branchId);
    const manager      = branchUsers.find(u => u?.userRole === "Manager" || u?.userRole === "manager");
    const branchFb     = feedbacks.filter(f => Number(f?.branch?.branchId ?? f?.branchId) === branchId);
    const avgRating    = branchFb.length
      ? (branchFb.reduce((s, f) => s + (f?.ratingScore ?? 0), 0) / branchFb.length).toFixed(1)
      : "—";
    const hasData      = staffCount > 0 || branchOrders.length > 0;
    return { staffCount, custCount, orderCount: branchOrders.length, manager, avgRating, hasData };
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Skeleton className="h-10 w-64 rounded-2xl mb-8" style={{ background: "rgba(107,94,78,0.07)" }} />
        {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-2xl mb-4" style={{ background: "rgba(107,94,78,0.06)" }} />)}
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger}
      style={{ maxWidth: 900, margin: "0 auto", fontFamily: "'Jost', sans-serif" }}>

      {/* Header */}
      <motion.div variants={up} style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: BA, marginBottom: 6 }}>
            ADMIN CONSOLE
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 600, color: OW, margin: 0 }}>
            Branch <em style={{ color: SG }}>Management</em>
          </h1>
          <p style={{ fontSize: "0.85rem", color: BA, marginTop: 6 }}>
            {branches.length} registered branches · Data scoped per branch
          </p>
        </div>
        <button onClick={() => setFormOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1.5rem", borderRadius: 100, background: `linear-gradient(135deg,${OW},${BA})`, color: P, fontWeight: 600, fontSize: "0.82rem", border: "none", cursor: "pointer", boxShadow: "0 4px 15px rgba(45,58,46,0.2)" }}>
          <Plus size={15} /> Initialize Branch
        </button>
      </motion.div>

      {/* Branch Cards */}
      {branches.map((branch, idx) => {
        const id     = branch?.branchId ?? branch?.branch_id;
        const name   = branch?.addressLine ?? branch?.address_line ?? `Branch #${id}`;
        const street = branch?.streetNo ?? branch?.street_no ?? "";
        const pin    = branch?.pinCode ?? branch?.pin_code ?? "";
        const phone  = branch?.phoneNo ?? branch?.phone_no ?? "—";
        const stats  = getBranchStats(id);
        const isOpen = expanded === id;
        const isSelected = activeContextBranchId === id;

        return (
          <motion.div key={id} variants={up} style={{ marginBottom: "1.25rem" }}>
            <div style={{
              borderRadius: 22,
              background: "#FFFDF8",
              border: `1px solid ${isSelected ? "rgba(122,158,126,0.25)" : "rgba(107,94,78,0.10)"}`,
              boxShadow: isSelected ? "0 4px 24px rgba(122,158,126,0.1)" : "0 2px 8px rgba(107,94,78,0.04)",
              overflow: "hidden",
            }}>
              {/* Branch Header Row */}
              <div
                onClick={() => setExpanded(isOpen ? null : id)}
                style={{ padding: "1.5rem 1.75rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: isSelected ? `${OL}33` : "rgba(107,94,78,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Building2 size={22} color={isSelected ? SG : BA} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 600, color: OW, margin: 0 }}>
                        {name}
                      </h2>
                      {isSelected ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "0.2rem 0.7rem", borderRadius: 100, background: "rgba(122,158,126,0.12)", border: "1px solid rgba(122,158,126,0.25)", color: SG, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: SG, animation: "pulse 2s infinite" }} />
                          ACTIVE
                        </span>
                      ) : stats.hasData ? (
                        <span style={{ padding: "0.2rem 0.7rem", borderRadius: 100, background: "rgba(107,94,78,0.08)", border: "1px solid rgba(107,94,78,0.15)", color: BA, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em" }}>
                          STANDBY
                        </span>
                      ) : (
                        <span style={{ padding: "0.2rem 0.7rem", borderRadius: 100, background: "rgba(107,94,78,0.08)", border: "1px solid rgba(107,94,78,0.15)", color: BA, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em" }}>
                          NO DATA
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "0.75rem", color: BA, margin: 0 }}>Branch ID #{id} · {phone}</p>
                  </div>
                </div>

                {/* Quick KPIs on right */}
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  {[
                    { label: "Orders", value: stats.orderCount, icon: <ShoppingCart size={12} /> },
                    { label: "Staff", value: stats.staffCount, icon: <Users size={12} /> },
                    { label: "Rating", value: stats.avgRating, icon: <Star size={12} /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center", color: BA, marginBottom: 2, fontSize: "0.65rem" }}>{icon}{label}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 700, color: OW }}>{value}</div>
                    </div>
                  ))}
                  <div style={{ marginLeft: 8 }}>
                    {isOpen ? <ChevronUp size={16} color={BA} /> : <ChevronDown size={16} color={BA} />}
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              {isOpen && (
                <div style={{ borderTop: "1px solid rgba(107,94,78,0.08)", padding: "1.5rem 1.75rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                  {/* Location */}
                  <div>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: BA, marginBottom: 8 }}>Location</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: OW }}>
                        <MapPin size={13} color={BA} /> {street}{pin ? `, PIN ${pin}` : ""}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: OW }}>
                        <Phone size={13} color={BA} /> {phone}
                      </div>
                    </div>
                  </div>

                  {/* People */}
                  <div>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: BA, marginBottom: 8 }}>People</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                        <span style={{ color: BA }}>Manager</span>
                        <span style={{ color: stats.manager ? SG : BA, fontWeight: 600 }}>
                          {stats.manager ? `${stats.manager.firstName ?? ""} ${stats.manager.lastName ?? ""}`.trim() || "Assigned" : "—"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                        <span style={{ color: BA }}>Staff</span>
                        <span style={{ color: OW, fontWeight: 600 }}>{stats.staffCount}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                        <span style={{ color: BA }}>Customers</span>
                        <span style={{ color: OW, fontWeight: 600 }}>{stats.custCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operations */}
                  <div>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: BA, marginBottom: 8 }}>Operations</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                        <span style={{ color: BA }}>Total Orders</span>
                        <span style={{ color: OW, fontWeight: 600 }}>{stats.orderCount}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                        <span style={{ color: BA }}>Avg Rating</span>
                        <span style={{ color: stats.avgRating !== "—" ? SG : BA, fontWeight: 600 }}>{stats.avgRating}{stats.avgRating !== "—" ? " ★" : ""}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                        <span style={{ color: BA }}>Context Status</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, color: isSelected ? SG : BA, fontWeight: 600 }}>
                          {isSelected ? <><CheckCircle2 size={11} /> Selected</> : <><AlertCircle size={11} /> Inactive</>}
                        </span>
                      </div>
                      <div style={{ marginTop: "0.5rem" }}>
                        <button onClick={(e) => { e.stopPropagation(); handleSelectBranch(id); }} style={{ width: "100%", padding: "0.5rem", borderRadius: 8, background: "rgba(122,158,126,0.1)", border: "1px solid rgba(122,158,126,0.2)", color: SG, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                          Set as Active Context
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* INITIALIZE BRANCH DIALOG */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="rounded-3xl p-0 max-w-md overflow-hidden" style={{ background: P, border: "1px solid rgba(107,94,78,0.12)" }}>
          <div className="grain" style={{ background: `radial-gradient(circle at 30% 30%, rgba(122,158,126,0.4) 0%, transparent 55%), ${OW}`, padding: "2rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(168,197,160,0.15)", border: "1px solid rgba(168,197,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <Building2 size={18} color={OL} />
            </div>
            <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.9rem", fontWeight: 500, color: P, margin: "0 0 0.25rem" }}>
              Initialize <em style={{ color: OL }}>Branch</em>
            </DialogTitle>
            <DialogDescription style={{ fontSize: "0.78rem", color: "rgba(245,240,232,0.5)" }}>
              Establish a new dining location in the system.
            </DialogDescription>
          </div>
          <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 6 }}>Branch Name / Area</label>
              <input value={newBranch.addressLine} onChange={e => setNewBranch({...newBranch, addressLine: e.target.value})} placeholder="e.g. Chennai-Alwarpet" style={{ width: "100%", background: "rgba(255,253,248,0.7)", border: "1px solid rgba(107,94,78,0.15)", borderRadius: 12, padding: "0.75rem 1rem", fontSize: "0.9rem", color: OW, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 6 }}>Street Details</label>
              <input value={newBranch.streetNo} onChange={e => setNewBranch({...newBranch, streetNo: e.target.value})} placeholder="e.g. TTK Road" style={{ width: "100%", background: "rgba(255,253,248,0.7)", border: "1px solid rgba(107,94,78,0.15)", borderRadius: 12, padding: "0.75rem 1rem", fontSize: "0.9rem", color: OW, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 6 }}>PIN Code</label>
                <input value={newBranch.pinCode} onChange={e => setNewBranch({...newBranch, pinCode: e.target.value})} placeholder="600018" style={{ width: "100%", background: "rgba(255,253,248,0.7)", border: "1px solid rgba(107,94,78,0.15)", borderRadius: 12, padding: "0.75rem 1rem", fontSize: "0.9rem", color: OW, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 6 }}>Phone Number</label>
                <input value={newBranch.phoneNo} onChange={e => setNewBranch({...newBranch, phoneNo: e.target.value})} placeholder="9876543210" style={{ width: "100%", background: "rgba(255,253,248,0.7)", border: "1px solid rgba(107,94,78,0.15)", borderRadius: 12, padding: "0.75rem 1rem", fontSize: "0.9rem", color: OW, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <button onClick={handleCreateBranch} disabled={isSubmitting} style={{ marginTop: "0.5rem", padding: "0.85rem", borderRadius: 14, background: `linear-gradient(135deg,${SG},${OL})`, color: OW, fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: isSubmitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {isSubmitting ? "Initializing..." : "Initialize Branch"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
