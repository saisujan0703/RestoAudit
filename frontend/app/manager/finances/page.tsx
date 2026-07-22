"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, DollarSign, Settings, Plus, TrendingUp, Save, Wallet, Building2, ShieldCheck, AlertTriangle, Trash2, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const staggerContainer = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const OW = "#2D3A2E";
const SG = "#7A9E7E";
const BA = "#6B5E4E";
const P  = "#F5F0E8";
const SA = "#C9B99A";
const OL = "#A8C5A0";

type MiscExpense = { id: string; reason: string; amount: number; date: string };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function ManagerFinancesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [managerBranchId, setManagerBranchId] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [finances, setFinances] = useState({ salary: 0, maintenance: 0, stockCost: 0, misc: [] as MiscExpense[] });
  
  // Local state for the inputs so it doesn't auto-apply until they hit OK
  const [inputSalary, setInputSalary] = useState("");
  const [inputMaintenance, setInputMaintenance] = useState("");

  const [newMiscReason, setNewMiscReason] = useState("");
  const [newMiscAmount, setNewMiscAmount] = useState("");

  useEffect(() => {
    try {
      let currentBranchId = 0;
      const raw = localStorage.getItem("restroaudit.currentUser");
      if (raw) {
        const current = JSON.parse(raw);
        setUser(current);
        if (current.branchId) currentBranchId = Number(current.branchId);
        else if (current.branch?.branchId) currentBranchId = Number(current.branch?.branchId);
        setManagerBranchId(currentBranchId);
      }

      const finRaw = localStorage.getItem(`restroaudit.finances.${currentBranchId}`);
      if (finRaw) {
        const parsed = JSON.parse(finRaw);
        if (!parsed.misc) parsed.misc = [];
        setFinances(parsed);
        setInputSalary(parsed.salary ? parsed.salary.toString() : "");
        setInputMaintenance(parsed.maintenance ? parsed.maintenance.toString() : "");
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const handleSaveAll = (updatedFinances = finances) => {
    localStorage.setItem(`restroaudit.finances.${managerBranchId}`, JSON.stringify(updatedFinances));
    toast.success("Financial Ledgers Updated", { description: "These costs have been securely synchronized with the Super Admin dashboard." });
  };

  const handleUpdateFixedCost = (type: "salary" | "maintenance") => {
    const val = type === "salary" ? Number(inputSalary) : Number(inputMaintenance);
    if (isNaN(val)) return;
    const newFinances = { ...finances, [type]: val };
    setFinances(newFinances);
    handleSaveAll(newFinances);
  };

  const handleAddMisc = () => {
    if (!newMiscReason.trim() || !newMiscAmount.trim()) {
      toast.error("Invalid Input", { description: "Please enter both a reason and an amount." });
      return;
    }
    const amt = Number(newMiscAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid Amount", { description: "Please enter a valid expense amount." });
      return;
    }

    const newExpense: MiscExpense = {
      id: Math.random().toString(36).substr(2, 9),
      reason: newMiscReason.trim(),
      amount: amt,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };

    const newFinances = { ...finances, misc: [newExpense, ...finances.misc] };
    setFinances(newFinances);
    setNewMiscReason("");
    setNewMiscAmount("");
    handleSaveAll(newFinances);
  };

  const handleDeleteMisc = (id: string) => {
    const newFinances = { ...finances, misc: finances.misc.filter(m => m.id !== id) };
    setFinances(newFinances);
    handleSaveAll(newFinances);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64 rounded-xl" style={{ background: "var(--bg-surface)" }} />
        <Skeleton className="h-48 rounded-3xl" style={{ background: "var(--bg-surface)" }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-3xl" style={{ background: "var(--bg-surface)" }} />
          <Skeleton className="h-64 rounded-3xl" style={{ background: "var(--bg-surface)" }} />
        </div>
      </div>
    );
  }

  const miscTotal = finances.misc.reduce((sum, item) => sum + item.amount, 0);
  const totalCosts = finances.salary + finances.maintenance + finances.stockCost + miscTotal;

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-4 max-w-6xl mx-auto" style={{ fontFamily: "'Jost', sans-serif" }}>
      
      {/* Hidden CSS to remove number input spinners */}
      <style dangerouslySetInnerHTML={{__html: `
        input[type="number"]::-webkit-inner-spin-button, 
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}} />

      {/* Header */}
      <motion.div variants={fadeInUp} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.25rem" }}>
            <Wallet size={14} color={SG} />
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: SG }}>Financial Ledgers</span>
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", fontWeight: 400, color: "rgba(107,94,78,0.6)", margin: "0 0 0.5rem" }}>
            {getGreeting()}, <strong style={{ color: OW, fontWeight: 600 }}>{user?.firstName || "Manager"}</strong> — here's your operational overview.
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 500, color: OW, margin: 0, letterSpacing: "-0.02em" }}>
            Operational <em className="gradient-clip-text" style={{ backgroundImage: `linear-gradient(135deg,${SG},${OL})` }}>Costs</em>
          </h1>
          <p style={{ fontSize: "0.8rem", color: BA, marginTop: "0.25rem", marginBottom: 0 }}>Manage and record daily overheads for accurate net revenue reporting.</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main KPI Card */}
        <motion.div variants={fadeInUp} className="lg:col-span-3 grain" style={{
          position: "relative", borderRadius: 24, overflow: "hidden", padding: "1.5rem 2rem",
          background: `radial-gradient(ellipse 60% 80% at 80% 20%, rgba(122,158,126,0.4) 0%, transparent 55%),
                       radial-gradient(ellipse 50% 60% at 20% 80%, rgba(201,185,154,0.3) 0%, transparent 55%), ${OW}`,
          boxShadow: "0 10px 40px rgba(45,58,46,0.25)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem"
        }}>
          <div className="pattern-dots" style={{ position: "absolute", inset: 0, opacity: 0.3 }} />
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.5rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(168,197,160,0.15)", border: "1px solid rgba(168,197,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={18} color={OL} />
              </div>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: SA }}>Total Branch Overhead</span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.5rem", fontWeight: 500, color: P, lineHeight: 1, letterSpacing: "-0.03em" }}>
              <span style={{ fontSize: "2rem", opacity: 0.5, verticalAlign: "top", marginRight: 4 }}>₹</span>
              {totalCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "2rem" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,240,232,0.4)" }}>Branch ID</p>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "1.2rem", fontWeight: 600, color: P }}>#{managerBranchId}</p>
            </div>
            <div style={{ width: 1, background: "rgba(245,240,232,0.1)" }} />
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,240,232,0.4)" }}>Status</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: OL }} />
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "1.2rem", fontWeight: 600, color: OL }}>Active Sync</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Manual Inputs & Ad-Hoc */}
        <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-4">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600, color: OW, margin: "0 0 0.5rem" }}>Manual Adjustments</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1.5rem", alignItems: "stretch" }}>
            {/* Salary */}
            <div className="glass-card" style={{ padding: "1.25rem", borderRadius: 20, border: "1px solid rgba(107,94,78,0.12)", background: "rgba(255,253,248,0.6)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${SA}44,${OL}44)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Activity size={16} color={OW} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: OW }}>Staff Payroll</span>
              </div>
              <div style={{ flexGrow: 1 }} />
              <Label style={{ fontSize: "0.6rem", fontWeight: 700, color: BA, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, display: "block" }}>Monthly Allocation</Label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: BA, fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>₹</span>
                  <Input 
                    type="number" value={inputSalary} placeholder="0.00"
                    onChange={(e) => setInputSalary(e.target.value)} 
                    style={{ width: "100%", padding: "0.8rem 0.8rem 0.8rem 2.2rem", borderRadius: 12, border: "1px solid rgba(107,94,78,0.15)", background: "#FFF", fontSize: "1.1rem", fontWeight: 600, color: OW, fontFamily: "'Jost', sans-serif" }} 
                  />
                </div>
                <button 
                  onClick={() => handleUpdateFixedCost("salary")}
                  style={{ background: SG, color: P, border: "none", borderRadius: 12, width: "48px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
                  <Check size={18} />
                </button>
              </div>
            </div>

            {/* Maintenance */}
            <div className="glass-card" style={{ padding: "1.25rem", borderRadius: 20, border: "1px solid rgba(107,94,78,0.12)", background: "rgba(255,253,248,0.6)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${BA}22,${OW}22)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Settings size={16} color={OW} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: OW }}>Facility Upkeep</span>
              </div>
              <div style={{ flexGrow: 1 }} />
              <Label style={{ fontSize: "0.6rem", fontWeight: 700, color: BA, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, display: "block" }}>Maintenance Cost</Label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: BA, fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem" }}>₹</span>
                  <Input 
                    type="number" value={inputMaintenance} placeholder="0.00"
                    onChange={(e) => setInputMaintenance(e.target.value)} 
                    style={{ width: "100%", padding: "0.8rem 0.8rem 0.8rem 2.2rem", borderRadius: 12, border: "1px solid rgba(107,94,78,0.15)", background: "#FFF", fontSize: "1.1rem", fontWeight: 600, color: OW, fontFamily: "'Jost', sans-serif" }} 
                  />
                </div>
                <button 
                  onClick={() => handleUpdateFixedCost("maintenance")}
                  style={{ background: SG, color: P, border: "none", borderRadius: 12, width: "48px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
                  <Check size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Ad-Hoc / Emergencies */}
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: 20, border: "1px solid rgba(107,94,78,0.12)", background: "rgba(255,253,248,0.8)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,#D9888844,#B54A4A44)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={16} color="#B54A4A" />
              </div>
              <div>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: OW, display: "block" }}>Ad-Hoc & Emergency Expenses</span>
                <span style={{ fontSize: "0.65rem", color: BA, fontStyle: "italic" }}>Log unexpected plumbing, electrical, or miscellaneous costs.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", marginBottom: "1rem" }}>
              <div style={{ flex: 2 }}>
                <Label style={{ fontSize: "0.6rem", fontWeight: 700, color: BA, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, display: "block" }}>Reason / Description</Label>
                <Input 
                  type="text" value={newMiscReason} placeholder="e.g., Emergency Plumbing"
                  onChange={(e) => setNewMiscReason(e.target.value)} 
                  style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: 12, border: "1px solid rgba(107,94,78,0.15)", background: "#FFF", fontSize: "0.9rem", color: OW, fontFamily: "'Jost', sans-serif" }} 
                />
              </div>
              <div style={{ flex: 1, position: "relative" }}>
                <Label style={{ fontSize: "0.6rem", fontWeight: 700, color: BA, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, display: "block" }}>Cost (₹)</Label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: BA, fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>₹</span>
                  <Input 
                    type="number" value={newMiscAmount} placeholder="0.00"
                    onChange={(e) => setNewMiscAmount(e.target.value)} 
                    style={{ width: "100%", padding: "0.8rem 0.8rem 0.8rem 1.8rem", borderRadius: 12, border: "1px solid rgba(107,94,78,0.15)", background: "#FFF", fontSize: "0.9rem", fontWeight: 600, color: OW, fontFamily: "'Jost', sans-serif" }} 
                  />
                </div>
              </div>
              <button 
                onClick={handleAddMisc}
                style={{ background: OW, color: P, border: "none", borderRadius: 12, padding: "0 1.25rem", height: "42px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", boxShadow: "0 4px 15px rgba(45,58,46,0.2)" }}>
                Add
              </button>
            </div>

            {/* List of Misc Expenses */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "150px", overflowY: "auto", paddingRight: "0.25rem" }}>
              <AnimatePresence>
                {finances.misc.map(expense => (
                  <motion.div key={expense.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.8rem 1.25rem", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(107,94,78,0.1)", borderRadius: 12 }}>
                      <div>
                        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: OW, margin: 0 }}>{expense.reason}</p>
                        <p style={{ fontSize: "0.65rem", color: BA, margin: 0, marginTop: 2 }}>{expense.date}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 600, color: OW }}>
                          ₹{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <button onClick={() => handleDeleteMisc(expense.id)} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.5 }}>
                          <Trash2 size={16} color="#B54A4A" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {finances.misc.length === 0 && (
                <p style={{ textAlign: "center", fontSize: "0.8rem", color: BA, fontStyle: "italic", margin: "1rem 0" }}>No ad-hoc expenses logged.</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Automated Tracking Side Panel */}
        <motion.div variants={fadeInUp} className="space-y-4">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600, color: OW, margin: "0 0 0.5rem" }}>Automated Tracking</h2>
          
          <div className="grain" style={{ padding: "1.25rem", borderRadius: 20, border: `1px solid ${SG}44`, background: `radial-gradient(circle at top right, ${SG}22, transparent), rgba(168,197,160,0.1)` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: SG, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 15px ${SG}44` }}>
                  <Plus size={16} color={P} />
                </div>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: SG }}>Stock Inventory</span>
              </div>
              <ShieldCheck size={14} color={SG} />
            </div>
            
            <p style={{ fontSize: "0.8rem", color: OW, margin: "0 0 1rem", lineHeight: 1.4 }}>
              Raw material costs are tracked autonomously whenever stock is replenished in the Inventory module.
            </p>

            <Label style={{ fontSize: "0.6rem", fontWeight: 700, color: SG, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, display: "block" }}>Cumulative Stock Additions</Label>
            <div style={{ background: "rgba(255,255,255,0.5)", border: `1px solid ${SG}33`, padding: "0.75rem", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, color: OW }}>
                ₹{finances.stockCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: SG, background: `${SG}22`, padding: "0.25rem 0.5rem", borderRadius: 100 }}>System Managed</span>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
