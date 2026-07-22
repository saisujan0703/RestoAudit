"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, ChevronDown, Utensils, Pizza, Salad, Coffee, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchMenuItems, deleteMenuItem } from "@/lib/api";

const staggerContainer = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const OW = "#2D3A2E";
const SG = "#7A9E7E";
const BA = "#6B5E4E";

const categoryIcons: Record<string, React.ElementType> = {
  "Main Course": Utensils, "Starter": Pizza, "Salad": Salad, "Beverage": Coffee,
};

export default function AdminMenuPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const [activeBranchId, setActiveBranchId] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        let currentId = 0;
        const rawActive = localStorage.getItem("restroaudit.adminSelectedBranch");
        if (rawActive && rawActive !== "undefined") {
          currentId = Number(rawActive);
        }
        setActiveBranchId(currentId);

        const data = await fetchMenuItems();
        
        let branchItems = [];
        try {
            const raw = localStorage.getItem(`restroaudit.menu.${currentId}`);
            if (raw) {
              const storedMenu = JSON.parse(raw);
              branchItems = Array.isArray(data) ? data.filter(m => storedMenu.includes(m.itemId ?? m.item_id)) : [];
            } else {
              // Fallback: Show all items if no specific branch mapping exists
              branchItems = Array.isArray(data) ? data : [];
            }
        } catch { branchItems = Array.isArray(data) ? data : []; }

        setMenuItems(branchItems);
      } catch (e) {
        toast.error("Failed to load menu items from database.");
      } finally { setIsLoading(false); }
    })();
  }, []);

  const normalised = menuItems.map(m => ({
    id: m?.itemId ?? m?.item_id,
    name: m?.itemName ?? m?.item_name ?? "Unknown",
    price: parseFloat(String(m?.price ?? 0)),
    category: m?.category ?? "Other",
  }));

  const filtered = normalised.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(normalised.map(m => m.category))];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" style={{ background: "var(--bg-surface)" }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" style={{ background: "var(--bg-surface)" }} />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6"
      style={{ fontFamily: "'Jost', sans-serif" }}>

      <motion.div variants={fadeInUp} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 500, color: OW, margin: 0 }}>
            Menu <em style={{ color: SG }}>Management</em>
          </h1>
          <p style={{ color: BA, marginTop: 4, fontSize: "0.9rem" }}>Branch #{activeBranchId} database — {normalised.length} items</p>
        </div>
        <button onClick={() => toast.info("Add menu item form would open here")}
          style={{ background: SG, color: "#F5F0E8", border: "none", borderRadius: 12, padding: "0.6rem 1.4rem", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Add Item
        </button>
      </motion.div>

      <motion.div variants={fadeInUp} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} color={BA} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.55 }} />
          <input placeholder="Search menu items…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "0.72rem 1rem 0.72rem 2.6rem", borderRadius: 14, border: "1px solid rgba(107,94,78,0.15)", background: "rgba(245,240,232,0.7)", fontSize: "0.875rem", color: OW, fontFamily: "'Jost', sans-serif", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSearchQuery(searchQuery === cat ? "" : cat)}
            style={{ padding: "0.42rem 1rem", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", border: "1px solid", transition: "all 0.2s",
              background: searchQuery === cat ? SG : "rgba(122,158,126,0.08)",
              color: searchQuery === cat ? "#F5F0E8" : BA,
              borderColor: searchQuery === cat ? SG : "rgba(107,94,78,0.15)" }}>
            {cat}
          </button>
        ))}
      </motion.div>

      <motion.div variants={staggerContainer}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {filtered.map(item => {
          const Icon = categoryIcons[item.category] || Utensils;
          const isExpanded = expandedItem === item.id;
          return (
            <motion.div key={item.id} variants={fadeInUp}>
              <div style={{ background: "rgba(255,253,248,0.9)", borderRadius: 20, border: `1px solid ${isExpanded ? SG : "rgba(107,94,78,0.12)"}`, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
                onClick={() => setExpandedItem(isExpanded ? null : item.id)}>
                <div style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(122,158,126,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon className="h-5 w-5" style={{ color: SG }} />
                    </div>
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.25rem 0.75rem", borderRadius: 100, background: "rgba(107,94,78,0.08)", color: BA }}>
                      {item.category}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 500, color: OW, margin: "0 0 0.5rem" }}>{item.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, color: SG }}>₹{item.price.toFixed(2)}</span>
                    <ChevronDown size={18} color={BA} style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      style={{ borderTop: "1px solid rgba(107,94,78,0.1)", background: "rgba(168,197,160,0.06)", padding: "0.75rem 1.5rem" }}>
                      <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, marginBottom: 4 }}>Item ID</p>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: OW, marginBottom: "0.75rem" }}>#{item.id}</p>
                      {confirmId === item.id ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={async (e) => { e.stopPropagation(); setDeletingId(item.id); try { await deleteMenuItem(item.id); setMenuItems(prev => prev.filter(m => (m?.itemId ?? m?.item_id) !== item.id)); setExpandedItem(null); setConfirmId(null); toast.success(`"${item.name}" removed.`); } catch { toast.error("Failed to remove item."); } finally { setDeletingId(null); } }}
                            disabled={deletingId === item.id}
                            style={{ flex: 1, padding: "0.5rem", borderRadius: 10, background: "#c0392b", color: "#fff", fontSize: "0.72rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
                            {deletingId === item.id ? "Removing…" : "Yes, Remove"}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}
                            style={{ flex: 1, padding: "0.5rem", borderRadius: 10, background: "rgba(107,94,78,0.1)", color: BA, fontSize: "0.72rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmId(item.id); }}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.45rem 1rem", borderRadius: 10, background: "rgba(192,57,43,0.08)", color: "#c0392b", border: "1px solid rgba(192,57,43,0.2)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                          <Trash2 size={13} /> Remove Item
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: BA, opacity: 0.5 }}>
            No menu items found.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
