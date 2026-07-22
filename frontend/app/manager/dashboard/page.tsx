"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Star, AlertTriangle, Users, TrendingUp,
  ShieldCheck, Package, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchOrders, fetchUsers, fetchIngredients, fetchFeedback, fetchAuditLogs } from "@/lib/api";
import Link from "next/link";

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const up = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };


/* ── Olive Garden tokens ── */
const P  = "#F5F0E8"; /* parchment  */
const SG = "#7A9E7E";
const OL = "#A8C5A0";
const SA = "#C9B99A";
const BA = "#6B5E4E";
const OW = "#2D3A2E";

const SHIFT_OPTIONS = ["Lunch", "Dinner", "Night"];


const HOUR_SLOTS = [
  { label: "9AM",  h: 9  }, { label: "10AM", h: 10 }, { label: "11AM", h: 11 },
  { label: "12PM", h: 12 }, { label: "1PM",  h: 13 }, { label: "2PM",  h: 14 },
  { label: "3PM",  h: 15 }, { label: "4PM",  h: 16 }, { label: "5PM",  h: 17 },
  { label: "6PM",  h: 18 }, { label: "7PM",  h: 19 }, { label: "8PM",  h: 20 },
];

function buildHourlyChart(orders: any[], branchId: number) {
  const map: Record<number, number> = {};
  const todayStr = new Date().toDateString();
  orders.forEach(o => {
    if (!o.orderTime) return;
    const bid = Number(o?.branch?.branchId ?? o?.branchId ?? 0);
    if (bid !== branchId) return;
    
    const d = new Date(o.orderTime);
    if (d.toDateString() !== todayStr) return;

    const h = d.getHours();
    map[h] = (map[h] || 0) + 1;
  });
  return HOUR_SLOTS.map(({ label, h }) => ({ time: label, orders: map[h] ?? 0 }));
}

export default function ManagerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ todayOrders: 0, avgRating: 0, staffCount: 0, lowStockCount: 0, auditCount: 0 });
  const [activeShift, setActiveShift] = useState("Lunch");
  const [chartData, setChartData] = useState<{ time: string; orders: number }[]>([]);
  const [managerBranchId, setManagerBranchId] = useState<number>(0);

  // Removed inline finances state because it moved to a dedicated page

  useEffect(() => {
    const storedShift = localStorage.getItem("restroaudit.managerShift");
    if (storedShift && SHIFT_OPTIONS.includes(storedShift)) {
      setActiveShift(storedShift);
      return;
    }
    const hour = new Date().getHours();
    setActiveShift(hour < 15 ? "Lunch" : hour < 20 ? "Dinner" : "Night");
  }, []);

  useEffect(() => {
    localStorage.setItem("restroaudit.managerShift", activeShift);
  }, [activeShift]);

  useEffect(() => {
    const load = async () => {
      try {
        let currentBranchId = 0;
        try {
          const raw = localStorage.getItem("restroaudit.currentUser");
          if (raw) {
            const current = JSON.parse(raw);
            if (current.branchId) currentBranchId = Number(current.branchId);
            else if (current.branch?.branchId) currentBranchId = Number(current.branch?.branchId);
            setManagerBranchId(currentBranchId);
          }

          // (Finances are now handled on their dedicated page)
        } catch {}

        const [orders, users, ingredients, feedback, audits] = await Promise.all([
          fetchOrders(), fetchUsers(), fetchIngredients(), fetchFeedback(), fetchAuditLogs(50),
        ]);
        const todayStr = new Date().toDateString();
        const branchOrdersToday = Array.isArray(orders)
          ? orders.filter((o: any) => {
              if (Number(o?.branch?.branchId ?? o?.branchId) !== currentBranchId) return false;
              if (!o.orderTime) return false;
              return new Date(o.orderTime).toDateString() === todayStr;
            })
          : [];
        const branchStaff = Array.isArray(users) ? users.filter((u: any) => (u.userRole === "Staff" || u.userRole === "Manager") && Number(u?.branch?.branchId ?? u?.branchId) === currentBranchId).length : 0;
        
        const validFeedback = Array.isArray(feedback) ? feedback.filter((f: any) => typeof f?.ratingScore === "number" && Number(f?.branch?.branchId ?? f?.branchId) === currentBranchId) : [];
        const avgRating = validFeedback.length > 0
          ? validFeedback.reduce((s: number, f: any) => s + f.ratingScore, 0) / validFeedback.length
          : 0;

        let branchIngredients = [];
        try {
            const storedIngs = JSON.parse(localStorage.getItem(`restroaudit.inventory.${currentBranchId}`) || "[]");
            branchIngredients = Array.isArray(ingredients) ? ingredients.filter(i => storedIngs.includes(i.ingId ?? i.ing_id)) : [];
        } catch { branchIngredients = []; }

        const lowStock = branchIngredients.filter((i: any) => parseFloat(String(i?.stockQuantity ?? 9999)) < 50).length;
        
        setChartData(buildHourlyChart(Array.isArray(orders) ? orders : [], currentBranchId));
        setStats({ todayOrders: branchOrdersToday.length, avgRating: parseFloat(avgRating.toFixed(1)), staffCount: branchStaff, lowStockCount: lowStock, auditCount: branchOrdersToday.length > 0 ? (Array.isArray(audits) ? audits.length : 0) : 0 });
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const kpiCards = [
    { title: "Orders Today",      value: stats.todayOrders.toString(),  icon: ShoppingCart, accent: SG, bg: "rgba(122,158,126,0.12)" },
    { title: "Avg Guest Rating",  value: stats.avgRating > 0 ? stats.avgRating.toString() : "—", icon: Star, accent: SA, bg: "rgba(201,185,154,0.15)" },
    { title: "Staff Members",     value: stats.staffCount.toString(),   icon: Users,        accent: OL, bg: "rgba(168,197,160,0.15)" },
    { title: "Audit Events",      value: stats.auditCount.toString(),   icon: ShieldCheck,  accent: BA, bg: "rgba(107,94,78,0.10)"  },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" style={{ background: 'var(--bg-elevated)' }} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" style={{ background: 'var(--bg-elevated)' }} />)}
        </div>
        <Skeleton className="h-96 rounded-3xl" style={{ background: 'var(--bg-elevated)' }} />
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-8 max-w-7xl mx-auto"
      style={{ fontFamily: "'Jost', sans-serif", color: OW }}>

      {/* Header */}
      <motion.div variants={up} className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: SG }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: SG }}>Live Operations</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 500, color: OW, margin: 0 }}>
            Executive <em style={{ color: SG }}>Intelligence</em>
          </h1>
        </div>
        <div className="flex gap-3">
          <Link href="/manager/finances">
            <Button variant="outline" className="rounded-xl px-5 py-2 text-sm font-semibold border-dashed" style={{ borderColor: SG, color: SG }}>
              Branch Finances
            </Button>
          </Link>
          <Link href="/manager/staff">
            <Button className="rounded-xl px-5 py-2 text-sm font-semibold" style={{ background: OW, color: P }}>Manage Staff</Button>
          </Link>
          <Link href="/manager/inventory">
            <Button variant="outline" className="rounded-xl px-5 py-2 text-sm font-semibold" style={{ borderColor: 'var(--border-medium)', color: OW }}>Audit Stock</Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map(kpi => (
          <motion.div key={kpi.title} variants={up}>
            <div className="p-7 rounded-2xl border group hover:shadow-md transition-all" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.accent }} />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{kpi.title}</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 600, color: OW, lineHeight: 1 }}>{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + Side Panel */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div variants={up} className="lg:col-span-2">
          <div className="p-8 rounded-2xl border h-full" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-3 mb-1">
              <TrendingUp className="w-5 h-5" style={{ color: SG }} />
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600, color: OW, margin: 0 }}>
                Operational Velocity
              </h2>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>Order Throughput — Live</p>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sageFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={SG} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={SG} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,94,78,0.08)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: P, border: '1px solid rgba(107,94,78,0.15)', borderRadius: 10, color: OW, fontSize: 12 }}
                    itemStyle={{ color: SG, fontWeight: 600 }}
                    formatter={(v: any) => [`${v} orders`, 'Orders']}
                  />
                  <Area type="monotone" dataKey="orders" stroke={SG} strokeWidth={2.5} fillOpacity={1} fill="url(#sageFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Side */}
        <div className="space-y-5">
          {/* Stock Alert */}
          <motion.div variants={up}>
            <div className="p-7 rounded-2xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4" style={{ color: 'var(--status-bad)' }} />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: OW, margin: 0 }}>Critical Inventory</h3>
              </div>
              {stats.lowStockCount === 0 ? (
                <div className="text-center py-8" style={{ opacity: 0.4 }}>
                  <Package className="w-10 h-10 mx-auto mb-3" style={{ color: OW }} />
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: OW }}>All systems optimal.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--status-bad-bg)' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--status-bad)' }}>
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-bold" style={{ color: 'var(--status-bad)' }}>{stats.lowStockCount}</p>
                      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--status-bad)', opacity: 0.7 }}>Low Stock Items</p>
                    </div>
                  </div>
                  <Link href="/manager/inventory">
                    <Button variant="ghost" className="w-full rounded-xl text-xs font-semibold uppercase tracking-widest border border-dashed py-4"
                      style={{ color: 'var(--status-bad)', borderColor: 'rgba(155,74,42,0.2)' }}>
                      Resolve <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Audit Card */}
          <motion.div variants={up}>
            <div className="p-7 rounded-2xl" style={{ background: OW }}>
              <ShieldCheck className="w-9 h-9 mb-4" style={{ color: OL, opacity: 0.8 }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: P, margin: "0 0 0.5rem" }}>Internal Audit</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(245,240,232,0.45)' }}>
                All transactions recorded to the immutable audit log in real-time.
              </p>
              <Link href="/admin/dashboard">
                <Button className="w-full rounded-xl text-xs font-semibold uppercase tracking-widest py-3"
                  style={{ background: 'rgba(168,197,160,0.15)', color: OL, border: '1px solid rgba(168,197,160,0.2)' }}>
                  View Audit Log
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Shift Control */}
          <motion.div variants={up}>
            <div className="p-7 rounded-2xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4" style={{ color: SG }} />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: OW, margin: 0 }}>Shift Control</h3>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Current Shift</p>
              <div className="grid grid-cols-3 gap-2">
                {SHIFT_OPTIONS.map((shift) => {
                  const active = activeShift === shift;
                  return (
                    <button
                      key={shift}
                      type="button"
                      onClick={() => setActiveShift(shift)}
                      className="rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-widest transition-all"
                      style={{
                        background: active ? OW : 'rgba(107,94,78,0.06)',
                        color: active ? P : BA,
                        border: active ? `1px solid ${OW}` : '1px solid rgba(107,94,78,0.1)',
                      }}
                    >
                      {shift}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-sm" style={{ color: BA, lineHeight: 1.6 }}>
                Managers can switch the active branch service window from here.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
