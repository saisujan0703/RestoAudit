"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Activity, Settings, Plus, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchOrders, fetchBranches } from "@/lib/api";
import { calculateOrderTotal } from "@/lib/data";
import { toast } from "sonner";

const staggerContainer = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const OW = "#2D3A2E";
const SG = "#7A9E7E";
const BA = "#6B5E4E";
const P  = "#F5F0E8";

export default function AdminFinancesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeBranchId, setActiveBranchId] = useState<number>(0);
  const [branchName, setBranchName] = useState("Branch");
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [finances, setFinances] = useState({ salary: 0, maintenance: 0, stockCost: 0 });

  async function loadData() {
    setIsLoading(true);
    try {
      let currentId = 0;
      
      const rawActive = localStorage.getItem("restroaudit.adminSelectedBranch");
      if (rawActive && rawActive !== "undefined") {
        currentId = Number(rawActive);
      }
      setActiveBranchId(currentId);

      const [orders, branches] = await Promise.all([fetchOrders(), fetchBranches()]);
      setAllOrders(Array.isArray(orders) ? orders : []);
      
      const bList = Array.isArray(branches) ? branches : [];
      const currB = bList.find(b => b.branchId === currentId);
      if (currB) setBranchName(currB.addressLine || `Branch #${currentId}`);
      else setBranchName(`Branch #${currentId}`);

      const rawFin = localStorage.getItem(`restroaudit.finances.${currentId}`);
      if (rawFin) setFinances(JSON.parse(rawFin));
      else setFinances({ salary: 0, maintenance: 0, stockCost: 0 });

    } catch (e) {
      toast.error("Failed to load financial data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    const branchOrders = allOrders.filter(o => Number(o?.branch?.branchId ?? o?.branchId) === activeBranchId);
    const grossRevenue = branchOrders.reduce((sum, o) => {
      return sum + calculateOrderTotal(o);
    }, 0);
    
    const totalCosts = finances.salary + finances.maintenance + finances.stockCost;
    const netRevenue = grossRevenue - totalCosts;
    
    return { grossRevenue, totalCosts, netRevenue, totalOrders: branchOrders.length };
  }, [allOrders, activeBranchId, finances]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" style={{ background: "var(--bg-surface)" }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-xl" style={{ background: "var(--bg-surface)" }} />)}
        </div>
      </div>
    );
  }

  const isProfitable = stats.netRevenue >= 0;

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-4 max-w-6xl mx-auto" style={{ fontFamily: "'Jost', sans-serif", paddingBottom: "1rem" }}>
      
      <motion.div variants={fadeInUp} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: BA, marginBottom: 6 }}>{branchName} Operations</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", fontWeight: 500, color: OW, margin: 0 }}>
            Financial <em style={{ color: SG }}>Overview</em>
          </h1>
        </div>
        <button onClick={loadData} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", borderRadius: 100, background: "rgba(122,158,126,0.1)", border: "1px solid rgba(122,158,126,0.2)", color: SG, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </motion.div>

      {/* Main KPI Row */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="p-6 rounded-2xl border flex flex-col justify-between" style={{ background: "#FFFDF8", borderColor: "rgba(107,94,78,0.1)", minHeight: "140px" }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: SG }}>Gross Revenue</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.6rem", fontWeight: 600, color: OW, margin: 0, lineHeight: 1 }}>
              ₹{stats.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <p className="text-[11px] font-semibold text-gray-500 mt-4 uppercase tracking-widest">Derived from {stats.totalOrders} live orders</p>
        </motion.div>

        <motion.div variants={fadeInUp} className="p-6 rounded-2xl border flex flex-col justify-between" style={{ background: "#FFFDF8", borderColor: "rgba(107,94,78,0.1)", minHeight: "140px" }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-red-700">Total Operating Expenses</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.6rem", fontWeight: 600, color: OW, margin: 0, lineHeight: 1 }}>
              ₹{stats.totalCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <p className="text-[11px] font-semibold text-gray-500 mt-4 uppercase tracking-widest">Salary + Maint. + Stock</p>
        </motion.div>

        <motion.div variants={fadeInUp} className="p-6 rounded-2xl border flex flex-col justify-between" style={{ background: isProfitable ? "rgba(122,158,126,0.12)" : "rgba(192,57,43,0.1)", borderColor: isProfitable ? "rgba(122,158,126,0.25)" : "rgba(192,57,43,0.25)", minHeight: "140px" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isProfitable ? <TrendingUp size={14} color={SG} /> : <TrendingDown size={14} color="#C0392B" />}
              <p className="text-[10px] font-bold uppercase tracking-widest m-0" style={{ color: isProfitable ? SG : "#C0392B" }}>Net Profit/Loss</p>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.6rem", fontWeight: 600, color: isProfitable ? SG : "#C0392B", margin: 0, lineHeight: 1 }}>
              {isProfitable ? "+" : "-"}₹{Math.abs(stats.netRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <p className="text-[11px] font-semibold mt-4 uppercase tracking-widest" style={{ color: isProfitable ? SG : "#C0392B" }}>
            {isProfitable ? "Branch is profitable" : "Branch is operating at a loss"}
          </p>
        </motion.div>
      </motion.div>

      {/* Expense Breakdown */}
      <motion.div variants={fadeInUp}>
        <div className="px-6 py-5 rounded-2xl border h-full" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5" style={{ color: SG }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600, color: OW, margin: 0 }}>
              Expense Breakdown
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border flex items-center justify-between" style={{ background: "rgba(245,240,232,0.4)", borderColor: "rgba(107,94,78,0.1)" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Staff Salary</p>
                <p style={{ fontSize: "1.4rem", fontWeight: 600, color: OW, margin: 0 }}>₹{finances.salary.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                <DollarSign size={16} color={BA} />
              </div>
            </div>

            <div className="p-5 rounded-xl border flex items-center justify-between" style={{ background: "rgba(245,240,232,0.4)", borderColor: "rgba(107,94,78,0.1)" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Facility Maintenance</p>
                <p style={{ fontSize: "1.4rem", fontWeight: 600, color: OW, margin: 0 }}>₹{finances.maintenance.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                <Settings size={16} color={BA} />
              </div>
            </div>

            <div className="p-5 rounded-xl border flex items-center justify-between" style={{ background: "rgba(245,240,232,0.4)", borderColor: "rgba(107,94,78,0.1)" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Inventory / Stock Costs</p>
                <p style={{ fontSize: "1.4rem", fontWeight: 600, color: OW, margin: 0 }}>₹{finances.stockCost.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(122,158,126,0.15)" }}>
                <Plus size={16} color={SG} />
              </div>
            </div>
          </div>
          <p className="text-sm mt-4 text-gray-500 font-medium">
            Note: These values are inputted directly by the Branch Manager through their localized dashboard. Adding new stock dynamically increases Inventory Cost.
          </p>
        </div>
      </motion.div>

    </motion.div>
  );
}
