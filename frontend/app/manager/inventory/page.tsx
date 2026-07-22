"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, Search, Loader2, RefreshCw, Plus, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { fetchIngredients, createIngredient, updateIngredient } from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const OW = "#2D3A2E";
const SG = "#7A9E7E";
const OL = "#A8C5A0";
const SA = "#C9B99A";
const BA = "#6B5E4E";
const P  = "#F5F0E8";

function getStockStatus(qty: number) {
  if (qty < 20) return { color: "#C0392B", label: "Critical", bg: "rgba(192,57,43,0.08)", border: "rgba(192,57,43,0.2)" };
  if (qty < 50) return { color: "#D4A017", label: "Low",      bg: "rgba(212,160,23,0.08)", border: "rgba(212,160,23,0.2)" };
  return          { color: SG,       label: "Good",    bg: "rgba(122,158,126,0.08)", border: "rgba(122,158,126,0.2)" };
}

export default function ManagerInventoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [managerBranchId, setManagerBranchId] = useState(0);

  // Add Stock state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restock state
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<any>(null);
  const [restockQty, setRestockQty] = useState("");
  const [restockPrice, setRestockPrice] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("restroaudit.currentUser");
      if (raw) {
        const current = JSON.parse(raw);
        if (current.branchId) setManagerBranchId(Number(current.branchId));
        else if (current.branch?.branchId) setManagerBranchId(Number(current.branch?.branchId));
      }
    } catch {}
  }, []);

  async function load() {
    setIsLoading(true);
    try {
      const data = await fetchIngredients();
      setIngredients(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load stock data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleStockChange(item: any, delta: number) {
    const newQuantity = Math.max(0, item.qty + delta);
    try {
      await updateIngredient(item.id, { stockQuantity: newQuantity });
      toast.success(`${item.name} updated to ${newQuantity}`);
      load();
    } catch {
      toast.error("Failed to update stock");
    }
  }

  async function handleRestock() {
    if (!restockItem || !restockQty || !restockPrice) return toast.error("Please fill all fields");
    try {
      setIsSubmitting(true);
      const newQuantity = restockItem.qty + Number(restockQty);
      await updateIngredient(restockItem.id, { stockQuantity: newQuantity });

      // Log the cost to branch finances
      if (managerBranchId !== 0) {
        let fin = { salary: 0, maintenance: 0, stockCost: 0 };
        try {
          const rawFin = localStorage.getItem(`restroaudit.finances.${managerBranchId}`);
          if (rawFin) fin = JSON.parse(rawFin);
        } catch {}
        fin.stockCost += Number(restockPrice);
        localStorage.setItem(`restroaudit.finances.${managerBranchId}`, JSON.stringify(fin));
      }

      toast.success("Batch Added", { description: `${restockQty} units of ${restockItem.name} added. Cost logged.` });
      setIsRestockOpen(false);
      setRestockQty(""); setRestockPrice("");
      load();
    } catch {
      toast.error("Failed to restock");
    } finally {
      setIsSubmitting(false);
    }
  }

  const [filtered, setFiltered] = useState<any[]>([]);
  const [maxStock, setMaxStock] = useState(1);
  const [criticalCount, setCriticalCount] = useState(0);
  const [lowCount, setLowCount] = useState(0);

  useEffect(() => {
    // Always show all ingredients for now to ensure visibility
    let branchIngredients = ingredients;
    try {
        const raw = localStorage.getItem(`restroaudit.inventory.${managerBranchId}`);
        if (raw) {
          // You could use this to highlight branch-specific items, but we'll show all for now
        }
    } catch {}

    const normalised = branchIngredients.map(i => ({
      id: i?.ingId ?? i?.ing_id,
      name: i?.ingName ?? i?.ing_name ?? "Unknown",
      qty: parseFloat(String(i?.stockQuantity ?? 0)),
      expiry: i?.expiryDate ?? i?.expiry_date ?? null,
    }));

    const result = normalised.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
    setMaxStock(Math.max(...normalised.map(i => i.qty), 1));
    setCriticalCount(normalised.filter(i => i.qty < 20).length);
    setLowCount(normalised.filter(i => i.qty >= 20 && i.qty < 50).length);
  }, [ingredients, search, managerBranchId]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "'Jost', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: BA, marginBottom: 6 }}>BRANCH OPERATIONS</p>
          <h1 style={{ fontSize: "2rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: OW, margin: 0 }}>
            Stock <em style={{ color: SG }}>Control</em>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {criticalCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", borderRadius: 100, background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)", fontSize: "0.75rem", fontWeight: 600, color: "#C0392B" }}>
              <AlertTriangle size={13} /> {criticalCount} Critical
            </div>
          )}
          <button onClick={() => setIsAddOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", borderRadius: 100, background: OW, color: P, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", border: "none" }}>
            + Add Stock
          </button>
          <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", borderRadius: 100, background: "rgba(122,158,126,0.1)", border: "1px solid rgba(122,158,126,0.2)", color: SG, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Items", value: filtered.length, color: OW },
          { label: "Low Stock", value: lowCount, color: "#D4A017" },
          { label: "Critical", value: criticalCount, color: "#C0392B" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: "1.25rem 1.5rem", borderRadius: 20, background: "#FFFDF8", border: "1px solid rgba(107,94,78,0.10)", boxShadow: "0 2px 12px rgba(107,94,78,0.06)" }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: BA, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: "2rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.5rem" }}>
        <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: BA }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search ingredients..."
          style={{ width: "100%", paddingLeft: 38, padding: "0.75rem 1rem 0.75rem 38px", borderRadius: 14, border: "1px solid rgba(107,94,78,0.15)", background: "#FFFDF8", fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", color: OW, outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 rounded-2xl" style={{ background: "rgba(107,94,78,0.07)" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: BA }}>
          <Package size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0 }}>No ingredients found.</p>
        </div>
      ) : (
        <motion.div initial="initial" animate="animate" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((item, i) => {
            const s = getStockStatus(item.qty);
            const pct = Math.min(100, (item.qty / maxStock) * 100);
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ padding: "1rem 1.25rem", borderRadius: 18, background: "#FFFDF8", border: "1px solid rgba(107,94,78,0.08)", boxShadow: "0 2px 8px rgba(107,94,78,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: `${OL}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Package size={16} color={SG} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: OW, fontSize: "1rem" }}>{item.name}</div>
                      {item.expiry && <div style={{ fontSize: "0.65rem", color: BA, opacity: 0.7 }}>Expires: {item.expiry}</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => { setRestockItem(item); setIsRestockOpen(true); }} style={{ padding: "0.35rem 0.85rem", borderRadius: 100, background: "rgba(122,158,126,0.1)", border: "1px solid rgba(122,158,126,0.2)", color: SG, fontSize: "0.65rem", fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}>Restock</button>
                    <div style={{ display: "flex", alignItems: "center", background: "rgba(107,94,78,0.05)", borderRadius: 100, padding: "2px" }}>
                      <button onClick={() => handleStockChange(item, -1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", color: BA, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ width: 32, textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 700, color: OW }}>{item.qty}</span>
                      <button onClick={() => handleStockChange(item, 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", color: BA, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <span style={{ padding: "0.25rem 0.75rem", borderRadius: 100, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em" }}>{s.label}</span>
                  </div>
                </div>
                <Progress value={pct} className="h-1.5" style={{ background: "rgba(107,94,78,0.08)" }} />
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Add Stock Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#FFFDF8] border-[rgba(107,94,78,0.15)] max-w-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", color: OW, fontWeight: 600 }}>Add New Stock</DialogTitle>
            <DialogDescription style={{ color: BA }}>Register new ingredients and input their stock cost. Costs automatically reflect in the Admin Revenue Report.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label style={{ color: BA, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Ingredient Name</Label>
              <Input placeholder="e.g. Olive Oil" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} style={{ background: "rgba(245,240,232,0.6)", border: "1px solid rgba(107,94,78,0.2)", color: OW }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: BA, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Quantity (Units)</Label>
              <Input type="number" placeholder="50" value={newQty} onChange={(e) => setNewQty(e.target.value)} style={{ background: "rgba(245,240,232,0.6)", border: "1px solid rgba(107,94,78,0.2)", color: OW }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: BA, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Cost (₹)</Label>
              <Input type="number" placeholder="1200" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} style={{ background: "rgba(245,240,232,0.6)", border: "1px solid rgba(107,94,78,0.2)", color: OW }} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} style={{ color: BA }} disabled={isSubmitting}>Cancel</Button>
            <Button disabled={isSubmitting} onClick={async () => {
              if (!newItemName || !newQty || !newPrice) return toast.error("Please fill all fields");
              try {
                setIsSubmitting(true);
                const newIng = await createIngredient({ ingName: newItemName, stockQuantity: Number(newQty) });
                
                // Track branch inventory
                if (managerBranchId !== 0 && newIng && (newIng.ingId || newIng.ing_id)) {
                  const id = newIng.ingId || newIng.ing_id;
                  let storedIngs = [];
                  try { 
                    const raw = localStorage.getItem(`restroaudit.inventory.${managerBranchId}`);
                    if (raw) {
                      storedIngs = JSON.parse(raw);
                    } else {
                      // If first time adding to this branch, include existing items so they don't disappear
                      storedIngs = ingredients.map(i => i?.ingId ?? i?.ing_id).filter(Boolean);
                    }
                  } catch {}
                  
                  if (!storedIngs.includes(id)) {
                      storedIngs.push(id);
                      localStorage.setItem(`restroaudit.inventory.${managerBranchId}`, JSON.stringify(storedIngs));
                  }
                }

                // Add the price to localStorage finances for Admin Dashboard
                let fin = { salary: 0, maintenance: 0, stockCost: 0 };
                try {
                  const rawFin = localStorage.getItem(`restroaudit.finances.${managerBranchId}`);
                  if (rawFin) fin = JSON.parse(rawFin);
                } catch {}
                fin.stockCost += Number(newPrice);
                localStorage.setItem(`restroaudit.finances.${managerBranchId}`, JSON.stringify(fin));

                toast.success("Stock Added", { description: `${newItemName} added. Cost logged to branch finances.` });
                setNewItemName(""); setNewQty(""); setNewPrice("");
                setIsAddOpen(false);
                load();
              } catch (e) {
                toast.error("Failed to add stock");
              } finally {
                setIsSubmitting(false);
              }
            }} style={{ background: SG, color: P }}>{isSubmitting ? "Adding..." : "Confirm Stock"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restock Modal */}
      <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
        <DialogContent className="bg-[#FFFDF8] border-[rgba(107,94,78,0.15)] max-w-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", color: OW, fontWeight: 600 }}>Restock {restockItem?.name}</DialogTitle>
            <DialogDescription style={{ color: BA }}>Add new stock and log the purchase cost for financial reporting.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label style={{ color: BA, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Quantity to Add</Label>
              <Input type="number" placeholder="e.g. 24" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} style={{ background: "rgba(245,240,232,0.6)", border: "1px solid rgba(107,94,78,0.2)", color: OW }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: BA, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Purchase Cost (₹)</Label>
              <Input type="number" placeholder="e.g. 450" value={restockPrice} onChange={(e) => setRestockPrice(e.target.value)} style={{ background: "rgba(245,240,232,0.6)", border: "1px solid rgba(107,94,78,0.2)", color: OW }} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setIsRestockOpen(false)} style={{ color: BA }} disabled={isSubmitting}>Cancel</Button>
            <Button disabled={isSubmitting} onClick={handleRestock} style={{ background: SG, color: P }}>{isSubmitting ? "Restocking..." : "Log Batch & Update"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
