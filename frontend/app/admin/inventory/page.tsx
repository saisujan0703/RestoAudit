"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { fetchIngredients } from "@/lib/api";

const staggerContainer = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const OW = "#2D3A2E";
const SG = "#7A9E7E";
const OL = "#A8C5A0";
const SA = "#C9B99A";
const BA = "#6B5E4E";
const P  = "#F5F0E8";

function getStockStatus(quantity: number) {
  if (quantity < 20) return { color: "var(--status-bad)",  label: "Critical", bg: "var(--status-bad-bg)",  border: "var(--status-bad-border)"  };
  if (quantity < 50) return { color: "var(--status-warn)", label: "Low",      bg: "var(--status-warn-bg)", border: "var(--status-warn-border)" };
  return               { color: "var(--status-good)", label: "Good",     bg: "var(--status-good-bg)", border: "var(--status-good-border)" };
}

export default function AdminInventoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchIngredients();
        setIngredients(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load inventory from database.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Normalise BigDecimal (comes as string "45.00") to number
  const normalised = ingredients.map(i => ({
    ...i,
    qty: parseFloat(String(i?.stockQuantity ?? 0)),
    name: i?.ingName ?? i?.ing_name ?? "Unknown",
    expiry: i?.expiryDate ?? i?.expiry_date ?? null,
    id: i?.ingId ?? i?.ing_id,
  }));

  const filtered = normalised.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const maxStock = Math.max(...normalised.map(i => i.qty), 1);
  const lowCount = normalised.filter(i => i.qty < 50).length;
  const critCount = normalised.filter(i => i.qty < 20).length;
  const expiringCount = normalised.filter(i => {
    if (!i.expiry) return false;
    const d = new Date(i.expiry);
    const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" style={{ background: "var(--bg-surface)" }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" style={{ background: "var(--bg-surface)" }} />)}
        </div>
        <Skeleton className="h-96 rounded-xl" style={{ background: "var(--bg-surface)" }} />
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6"
      style={{ fontFamily: "'Jost', sans-serif" }}>

      {/* Header */}
      <motion.div variants={fadeInUp}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
          <Package size={16} color={SG} />
          <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: SG }}>Stock Control</span>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 500, color: OW, margin: 0 }}>
          Inventory <em style={{ color: SG }}>Overview</em>
        </h1>
        <p style={{ color: BA, marginTop: 4, fontSize: "0.9rem" }}>Live stock levels from the database</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeInUp} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[
          { label: "Total Items",    value: normalised.length, color: SG, icon: Package    },
          { label: "Low Stock",      value: lowCount,          color: "var(--status-warn)", icon: AlertTriangle },
          { label: "Expiring (7d)",  value: expiringCount,     color: "var(--status-bad)",  icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ padding: "1.5rem", borderRadius: 18, background: "rgba(255,253,248,0.88)", border: "1px solid rgba(107,94,78,0.12)", backdropFilter: "blur(10px)" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, marginBottom: 6 }}>{label}</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 600, color, lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeInUp} style={{ position: "relative", maxWidth: 400 }}>
        <Search size={15} color={BA} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.55 }} />
        <input
          placeholder="Search ingredients…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: "100%", paddingLeft: "2.5rem", padding: "0.75rem 1rem 0.75rem 2.75rem", borderRadius: 14, border: "1px solid rgba(107,94,78,0.15)", background: "rgba(245,240,232,0.7)", fontSize: "0.875rem", color: OW, fontFamily: "'Jost', sans-serif", outline: "none", boxSizing: "border-box" }}
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp}>
        <div style={{ background: "rgba(255,253,248,0.88)", borderRadius: 20, border: "1px solid rgba(107,94,78,0.12)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(107,94,78,0.1)" }}>
                {["Ingredient", "Stock Level", "Quantity", "Expiry Date", "Status"].map(h => (
                  <th key={h} style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: BA, opacity: 0.5 }}>
                    No ingredients found.
                  </td>
                </tr>
              ) : filtered.map((ing, idx) => {
                const status = getStockStatus(ing.qty);
                const pct = (ing.qty / maxStock) * 100;
                const expiryStr = ing.expiry ? new Date(ing.expiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                return (
                  <tr key={ing.id ?? idx} style={{ borderBottom: "1px solid rgba(107,94,78,0.06)", transition: "background 0.15s" }}
                    onMouseOver={e => (e.currentTarget.style.background = "rgba(168,197,160,0.08)")}
                    onMouseOut={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(122,158,126,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Package size={16} color={SG} />
                        </div>
                        <span style={{ fontWeight: 600, color: OW, fontSize: "0.9rem" }}>{ing.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", width: 180 }}>
                      <div style={{ height: 6, borderRadius: 100, background: "rgba(107,94,78,0.1)", overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: 100, background: status.color, transition: "width 0.8s ease" }} />
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.9rem", color: OW, fontWeight: 500 }}>
                      {ing.qty.toFixed(0)} units
                    </td>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", color: BA }}>
                      {expiryStr}
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "0.25rem 0.75rem", borderRadius: 100, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: status.color, background: status.bg, border: `1px solid ${status.border}` }}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
