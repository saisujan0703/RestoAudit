"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Star, ShieldCheck, Package,
  TrendingUp, Activity, ArrowUpRight, Zap, Building2, ChevronDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { fetchAuditLogs, fetchOrders, fetchUsers, fetchFeedback, fetchBranches } from "@/lib/api";
import { calculateOrderTotal } from "@/lib/data";
import Link from "next/link";

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const up = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } };

const P  = "#F5F0E8";
const SG = "#7A9E7E";
const OL = "#A8C5A0";
const SA = "#C9B99A";
const BA = "#6B5E4E";
const OW = "#2D3A2E";

// Build hourly order count chart from real order timestamps
function buildHourlyChart(orders: any[], branchId: number | null) {
  const slots = [
    "8AM","9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM","5PM","6PM","7PM","8PM","9PM","10PM",
  ];
  const map: Record<number, number> = {};
  const todayStr = new Date().toDateString();
  orders.forEach(o => {
    const bid = Number(o?.branch?.branchId ?? o?.branchId ?? 0);
    if (branchId !== null && bid !== branchId) return;
    if (!o.orderTime) return;
    const d = new Date(o.orderTime);
    if (d.toDateString() !== todayStr) return;
    const h = d.getHours();
    map[h] = (map[h] || 0) + 1;
  });
  return [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map((h, i) => ({
    time: slots[i],
    orders: map[h] ?? 0,
  }));
}

// Build daily order count (last 7 days)
function buildDailyChart(orders: any[], branchId: number | null) {
  const days: Record<string, number> = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
    days[key] = 0;
  }
  orders.forEach(o => {
    const bid = Number(o?.branch?.branchId ?? o?.branchId ?? 0);
    if (branchId !== null && bid !== branchId) return;
    if (!o.orderTime) return;
    const d = new Date(o.orderTime);
    const key = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
    if (key in days) days[key]++;
  });
  return Object.entries(days).map(([day, orders]) => ({ day, orders }));
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allUsers, setAllUsers]   = useState<any[]>([]);
  const [allFeedback, setAllFeedback] = useState<any[]>([]);
  const [branches, setBranches]   = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(0);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [chartMode, setChartMode] = useState<"hourly"|"daily">("hourly");

  const loadData = async () => {
    try {
      const storedBranch = localStorage.getItem("restroaudit.adminSelectedBranch");
      if (storedBranch) {
        setSelectedBranchId(Number(storedBranch));
      }
      
      const [orders, users, feedback, audits, branchList] = await Promise.all([
        fetchOrders(), fetchUsers(), fetchFeedback(), fetchAuditLogs(10), fetchBranches(),
      ]);
      setAllOrders(Array.isArray(orders) ? orders : []);
      setAllUsers(Array.isArray(users) ? users : []);
      setAllFeedback(Array.isArray(feedback) ? feedback : []);
      setAuditLogs(Array.isArray(audits) ? audits : []);
      setBranches(Array.isArray(branchList) ? branchList : []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Derive stats for selected branch
  const stats = useMemo(() => {
    const bid = selectedBranchId;
    const branchOrders = allOrders.filter(o => Number(o?.branch?.branchId ?? o?.branchId) === bid);
    const branchUsers  = allUsers.filter(u => Number(u?.branch?.branchId ?? u?.branchId) === bid);
    const validRatings = allFeedback.filter(f => typeof f?.ratingScore === "number" && Number(f?.branch?.branchId ?? f?.branchId) === bid);
    const avg = validRatings.length > 0
      ? validRatings.reduce((s, f) => s + f.ratingScore, 0) / validRatings.length : 0;
    return {
      totalOrders: branchOrders.length,
      totalUsers: branchUsers.length,
      avgRating: parseFloat(avg.toFixed(1)),
    };
  }, [selectedBranchId, allOrders, allUsers, allFeedback]);

  const financialStats = useMemo(() => {
    const bid = selectedBranchId;
    let relevantOrders = allOrders.filter(o => Number(o?.branch?.branchId ?? o?.branchId) === bid);
    
    const todayStr = new Date().toDateString();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    relevantOrders = relevantOrders.filter(o => {
        if (!o.orderTime) return false;
        const d = new Date(o.orderTime);
        if (chartMode === "hourly") return d.toDateString() === todayStr;
        return d >= sevenDaysAgo;
    });

    const grossRevenue = relevantOrders.reduce((sum, o) => {
      return sum + calculateOrderTotal(o);
    }, 0);

    let costs = { salary: 0, maintenance: 0, stockCost: 0, misc: [] as any[] };
    try {
        const rawFin = localStorage.getItem(`restroaudit.finances.${bid}`);
        if (rawFin) costs = JSON.parse(rawFin);
    } catch {}

    const miscTotal = Array.isArray(costs.misc) ? costs.misc.reduce((sum, item) => sum + (item.amount || 0), 0) : 0;
    const totalCosts = (costs.salary || 0) + (costs.maintenance || 0) + (costs.stockCost || 0) + miscTotal;
    const netRevenue = grossRevenue - totalCosts;

    return { grossRevenue, totalCosts, netRevenue };
  }, [selectedBranchId, allOrders, chartMode]);

  const hourlyData = useMemo(() => buildHourlyChart(allOrders, selectedBranchId), [allOrders, selectedBranchId]);
  const dailyData  = useMemo(() => buildDailyChart(allOrders, selectedBranchId), [allOrders, selectedBranchId]);
  const chartData  = chartMode === "hourly" ? hourlyData : dailyData;
  const dataKey    = chartMode === "hourly" ? "orders" : "orders";
  const xKey       = chartMode === "hourly" ? "time" : "day";

  const selectedBranch = branches.find(b => b.branchId === selectedBranchId);
  const branchLabel = selectedBranch?.addressLine ?? `Branch #${selectedBranchId}`;
  const isActiveBranch = stats.totalOrders > 0;

  const kpiCards = [
    { title: "Transactions",    value: stats.totalOrders.toString(),  icon: ShoppingCart, accent: SG, bg: "rgba(122,158,126,0.12)" },
    { title: "Platform Guests", value: stats.totalUsers.toString(),   icon: Activity,     accent: OL, bg: "rgba(168,197,160,0.15)" },
    { title: "Quality Index",   value: stats.avgRating > 0 ? stats.avgRating.toString() : "—", icon: Star, accent: SA, bg: "rgba(201,185,154,0.15)" },
    { title: "Audit Integrity", value: "Verified",                    icon: ShieldCheck,  accent: BA, bg: "rgba(107,94,78,0.10)"  },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-72 rounded-xl" style={{ background: "var(--bg-elevated)" }} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-2xl" style={{ background: "var(--bg-elevated)" }} />)}
        </div>
        <Skeleton className="h-96 rounded-3xl" style={{ background: "var(--bg-elevated)" }} />
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-8 max-w-7xl mx-auto"
      style={{ fontFamily: "'Jost', sans-serif", color: OW }}>

      {/* Header with Branch Toggle */}
      <motion.div variants={up} className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: SG }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: SG }}>System Core</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 500, color: OW, margin: 0 }}>
            Grand <em style={{ color: SG }}>Overview</em>
          </h1>

          {/* Branch Toggle */}
          <div style={{ marginTop: 12, position: "relative", display: "inline-block" }}>
            <button
              onClick={() => setShowBranchDropdown(p => !p)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "0.4rem 1rem 0.4rem 0.8rem",
                borderRadius: 100, background: isActiveBranch ? "rgba(122,158,126,0.12)" : "rgba(107,94,78,0.06)",
                border: `1px solid ${isActiveBranch ? "rgba(122,158,126,0.3)" : "rgba(107,94,78,0.15)"}`,
                cursor: "pointer", fontFamily: "'Jost', sans-serif",
              }}>
              <Building2 size={13} color={isActiveBranch ? SG : BA} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", color: isActiveBranch ? SG : BA }}>
                BRANCH {selectedBranchId} — {branchLabel.toUpperCase()} · {isActiveBranch ? "ACTIVE" : "NO DATA"}
              </span>
              <ChevronDown size={12} color={isActiveBranch ? SG : BA} />
            </button>
            {showBranchDropdown && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50,
                background: "#FFFDF8", borderRadius: 14, border: "1px solid rgba(107,94,78,0.15)",
                boxShadow: "0 8px 32px rgba(107,94,78,0.12)", minWidth: 200, overflow: "hidden",
              }}>
                {branches.map(b => {
                  const bid = b.branchId;
                  const bOrders = allOrders.filter(o => Number(o?.branch?.branchId ?? o?.branchId) === bid).length;
                  const active = bOrders > 0;
                  return (
                    <button key={bid}
                      onClick={() => { 
                        setSelectedBranchId(bid); 
                        setShowBranchDropdown(false); 
                        localStorage.setItem("restroaudit.adminSelectedBranch", String(bid));
                      }}
                      style={{
                        width: "100%", textAlign: "left", padding: "0.8rem 1rem", display: "flex",
                        alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                        background: bid === selectedBranchId ? "rgba(122,158,126,0.08)" : "transparent",
                        border: "none", fontFamily: "'Jost', sans-serif",
                      }}>
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: OW }}>
                          {b.addressLine ?? `Branch #${bid}`}
                        </div>
                        <div style={{ fontSize: "0.65rem", color: BA }}>{bOrders} orders</div>
                      </div>
                      <span style={{
                        padding: "0.15rem 0.5rem", borderRadius: 100, fontSize: "0.6rem", fontWeight: 700,
                        background: active ? "rgba(122,158,126,0.12)" : "rgba(107,94,78,0.06)",
                        color: active ? SG : BA,
                        border: `1px solid ${active ? "rgba(122,158,126,0.25)" : "rgba(107,94,78,0.1)"}`,
                      }}>
                        {active ? "ACTIVE" : "NO DATA"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map(kpi => (
          <motion.div key={kpi.title} variants={up}>
            <div className="p-7 rounded-2xl border group hover:shadow-md transition-all"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.accent }} />
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: OW }} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>{kpi.title}</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", fontWeight: 600, color: OW, lineHeight: 1 }}>{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart */}
      <motion.div variants={up}>
          <div className="p-8 rounded-2xl border h-full" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5" style={{ color: SG }} />
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600, color: OW, margin: 0 }}>
                  Order Velocity
                </h2>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["hourly","daily"] as const).map(m => (
                  <button key={m} onClick={() => setChartMode(m)}
                    style={{
                      padding: "0.3rem 0.8rem", borderRadius: 100, fontSize: "0.65rem", fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                      background: chartMode === m ? OW : "rgba(107,94,78,0.06)",
                      color: chartMode === m ? P : BA,
                      border: `1px solid ${chartMode === m ? OW : "rgba(107,94,78,0.12)"}`,
                    }}>
                    {m === "hourly" ? "By Hour" : "Last 7 Days"}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "var(--text-muted)" }}>
              {chartMode === "hourly" ? "Orders per hour of day · Branch " + selectedBranchId : "Orders per day · Last 7 days · Branch " + selectedBranchId}
            </p>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === "hourly" ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={SG} stopOpacity={0.28} />
                        <stop offset="95%" stopColor={SG} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,94,78,0.08)" vertical={false} />
                    <XAxis dataKey={xKey} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: P, border: "1px solid rgba(107,94,78,0.15)", borderRadius: 10, color: OW, fontSize: 12 }}
                      itemStyle={{ color: SG, fontWeight: 600 }}
                      formatter={(v: any) => [`${v} orders`, "Orders"]}
                    />
                    <Area type="monotone" dataKey={dataKey} stroke={SG} strokeWidth={2.5} fillOpacity={1} fill="url(#perfFill)" animationDuration={1200} />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,94,78,0.08)" vertical={false} />
                    <XAxis dataKey={xKey} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: P, border: "1px solid rgba(107,94,78,0.15)", borderRadius: 10, color: OW, fontSize: 12 }}
                      itemStyle={{ color: SG, fontWeight: 600 }}
                      formatter={(v: any) => [`${v} orders`, "Orders"]}
                    />
                    <Bar dataKey={dataKey} fill={SG} radius={[6,6,0,0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            {chartData.every((d: any) => d.orders === 0) && (
              <div style={{ textAlign: "center", marginTop: 12, fontSize: "0.8rem", color: BA, opacity: 0.6, fontStyle: "italic" }}>
                No order data for Branch {selectedBranchId} in this view
              </div>
            )}
          </div>
      </motion.div>

      {/* Branch Financial Report */}
      <motion.div variants={up} className="p-7 rounded-2xl border" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5" style={{ color: SG }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600, color: OW, margin: 0 }}>
              Revenue & Expense Report
            </h2>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: "rgba(122,158,126,0.12)", color: SG }}>
            {chartMode === "hourly" ? "Today" : "Last 7 Days"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border" style={{ background: "#FFFDF8", borderColor: "rgba(107,94,78,0.1)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-green-700">Gross Revenue (Est.)</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 600, color: OW, margin: 0 }}>
              ₹{financialStats.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-5 rounded-xl border" style={{ background: "#FFFDF8", borderColor: "rgba(107,94,78,0.1)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-red-700">Total Operational Costs</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 600, color: OW, margin: 0 }}>
              ₹{financialStats.totalCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] mt-2" style={{ color: BA }}>Includes Staff Salary, Maintenance & Stock</p>
          </div>
          <div className="p-5 rounded-xl border" style={{ background: financialStats.netRevenue >= 0 ? "rgba(122,158,126,0.1)" : "rgba(192,57,43,0.1)", borderColor: financialStats.netRevenue >= 0 ? "rgba(122,158,126,0.2)" : "rgba(192,57,43,0.2)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: financialStats.netRevenue >= 0 ? SG : "#c0392b" }}>Net Profit/Loss</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 600, color: financialStats.netRevenue >= 0 ? SG : "#c0392b", margin: 0 }}>
              {financialStats.netRevenue >= 0 ? "+" : "-"}₹{Math.abs(financialStats.netRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
