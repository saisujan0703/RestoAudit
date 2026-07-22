"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Search, ShoppingCart, CheckCircle2, Utensils, ChevronRight, Loader2, Trash2, User } from "lucide-react";
import { fetchUsers, fetchMenuItems, createOrder } from "@/lib/api";
import { formatCurrency } from "@/lib/data";
import { toast } from "sonner";

const P  = "#F5F0E8";
const SA = "#C9B99A";
const OL = "#A8C5A0";
const SG = "#7A9E7E";
const BA = "#6B5E4E";
const OW = "#2D3A2E";

export default function StaffOrdersPage() {
  const [users, setUsers]               = useState<any[]>([]);
  const [menuItems, setMenuItems]       = useState<any[]>([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchItem, setSearchItem]     = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [cart, setCart]                 = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<number | null>(null);
  useEffect(() => {
    const load = async () => {
      try {
        const [u, m] = await Promise.all([fetchUsers(), fetchMenuItems()]);
        const raw = localStorage.getItem("restroaudit.currentUser");
        const current = raw ? JSON.parse(raw) : null;
        const currentBranchId = current ? Number(current.branchId ?? null) : null;
        setUsers(u.filter((user: any) => {
          if (user.userRole !== "Customer") return false;
          if (!currentBranchId) return true;
          const userBranchId = user?.branch?.branchId ?? user?.branchId ?? null;
          return Number(userBranchId) === Number(currentBranchId);
        }));
        setMenuItems(m);
      } catch { toast.error("Failed to load data"); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const filteredUsers = users.filter(u =>
    u.firstName?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchCustomer.toLowerCase())
  );
  const filteredItems = menuItems.filter(i =>
    i.itemName?.toLowerCase().includes(searchItem.toLowerCase()) ||
    i.category?.toLowerCase().includes(searchItem.toLowerCase())
  );

  const addToCart = (item: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.itemId === item.itemId);
      return ex ? prev.map(i => i.itemId === item.itemId ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.itemName} added`);
  };
  const updateQty = (id: number, d: number) => setCart(prev => prev.map(i => i.itemId === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i));
  const remove = (id: number) => setCart(prev => prev.filter(i => i.itemId !== id));
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const placeOrder = async () => {
    if (!selectedCustomer) { toast.error("Select a guest first"); return; }
    if (!cart.length) { toast.error("Cart is empty"); return; }
    setIsSubmitting(true);
    try {
      const raw = localStorage.getItem("restroaudit.currentUser");
      const current = raw ? JSON.parse(raw) : null;
      const currentBranchId = current ? Number(current.branchId ?? null) : null;
      const branchForOrder = selectedCustomer.branch?.branchId || currentBranchId;
      if (!branchForOrder) { toast.error("No valid branch assigned for this order"); return; }
      const created = await createOrder({
        user: { userId: selectedCustomer.userId },
        branch: { branchId: branchForOrder },
        orderStatus: "Pending",
        orderDetails: cart.map(i => ({ menuItem: { itemId: i.itemId }, quantity: i.quantity, subtotal: i.price * i.quantity })),
      });
      const orderId = created?.orderId ?? null;
      setLastPlacedOrderId(orderId);
      toast.success("Order placed!", { description: orderId ? `Order #${orderId} saved for ${selectedCustomer.firstName}.` : `Loyalty points credited to ${selectedCustomer.firstName}.` });
      setCart([]); setSelectedCustomer(null);
    } catch (err: any) {
      if (err?.status === 403) toast.error(err.message || "Forbidden: branch mismatch");
      else if (err?.status === 400) toast.error(err.body || "Bad request");
      else toast.error("Failed to place order");
    }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) return (
    <div style={{ display: "flex", height: "60vh", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Loader2 size={28} color={SG} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: BA, fontStyle: "italic" }}>Loading the menu…</p>
      </div>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(245,240,232,0.7)", border: "1px solid rgba(107,94,78,0.15)",
    borderRadius: 14, padding: "0.75rem 1rem 0.75rem 2.75rem", fontSize: "0.875rem", color: OW,
    fontFamily: "'Jost', sans-serif", outline: "none",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.5rem", maxWidth: 1100, margin: "0 auto", fontFamily: "'Jost', sans-serif", alignItems: "start" }}>

      {/* LEFT — Customer + Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Customer selector */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 500, color: OW, margin: 0 }}>Select Guest</h2>
            {selectedCustomer && (
              <button onClick={() => setSelectedCustomer(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, color: "var(--status-bad)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Change
              </button>
            )}
          </div>

          {!selectedCustomer ? (
            <div className="glass-card" style={{ borderRadius: 22, padding: "1.5rem" }}>
              <div style={{ position: "relative", marginBottom: "1rem" }}>
                <Search size={15} color={BA} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.55 }} />
                <input type="text" value={searchCustomer} onChange={e => setSearchCustomer(e.target.value)}
                  placeholder="Search guest by name or email…" style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                {filteredUsers.map(u => (
                  <motion.div key={u.userId} whileHover={{ x: 3 }} onClick={() => setSelectedCustomer(u)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.9rem 1rem", borderRadius: 14, background: "rgba(245,240,232,0.6)", border: "1px solid rgba(107,94,78,0.1)", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg,${OL}44,${SA}66)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 600, color: OW }}>
                        {u.firstName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: OW }}>{u.firstName} {u.lastName}</div>
                        <div style={{ fontSize: "0.72rem", color: BA, opacity: 0.7 }}>{u.email}</div>
                      </div>
                    </div>
                    <ChevronRight size={15} color={BA} style={{ opacity: 0.4 }} />
                  </motion.div>
                ))}
                {!filteredUsers.length && <p style={{ textAlign: "center", padding: "2rem", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: BA, opacity: 0.5 }}>No guests found.</p>}
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="grain" style={{
              position: "relative", borderRadius: 22, overflow: "hidden", padding: "1.75rem",
              background: `radial-gradient(circle at 80% 20%, rgba(90,140,95,0.55) 0%, transparent 55%),
                           radial-gradient(circle at 20% 80%, rgba(122,158,126,0.35) 0%, transparent 50%), ${OW}`,
            }}>
              <div className="pattern-diagonal-light" style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(168,197,160,0.15)", border: "1px solid rgba(168,197,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={24} color={OL} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 500, color: P }}>{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(245,240,232,0.5)", marginTop: 2 }}>{selectedCustomer.email}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,240,232,0.35)" }}>Loyalty Points</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 600, color: SA, lineHeight: 1 }}>{selectedCustomer.loyaltyPoints || 0}</div>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* Menu Grid */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 500, color: OW, margin: 0 }}>Menu</h2>
            <div style={{ position: "relative", width: 220 }}>
              <Search size={13} color={BA} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} />
              <input type="text" value={searchItem} onChange={e => setSearchItem(e.target.value)} placeholder="Filter dishes…"
                style={{ ...inputStyle, padding: "0.6rem 0.9rem 0.6rem 2.2rem", fontSize: "0.8rem" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            {filteredItems.map(item => (
              <motion.div key={item.itemId} whileHover={{ y: -3 }} onClick={() => addToCart(item)}
                className="glass-card" style={{ borderRadius: 18, padding: "1.1rem 1.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 13, background: `linear-gradient(135deg,${OL}33,${SA}44)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Utensils size={18} color={SG} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: OW, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.itemName}</div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: BA, opacity: 0.6 }}>{item.category}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600, color: OW }}>{formatCurrency(item.price)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
                    <Plus size={10} color={SG} />
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, color: SG, letterSpacing: "0.1em" }}>ADD</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT — Order Summary */}
      <div style={{ position: "sticky", top: 84 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 500, color: OW, margin: "0 0 1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <ShoppingCart size={20} color={SG} /> Order Summary
        </h2>

        <div className="glass-card" style={{ borderRadius: 24, overflow: "hidden" }}>
          {/* Cart items */}
          <div style={{ padding: "1.5rem", minHeight: 280 }}>
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0.35 }}>
                  <ShoppingCart size={32} color={BA} />
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: BA, fontSize: "1rem" }}>The cart awaits a selection</p>
                </motion.div>
              ) : cart.map(item => (
                <motion.div key={item.itemId} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.8rem 0", borderBottom: "1px solid rgba(107,94,78,0.08)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: OW }}>{item.itemName}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: SG }}>{formatCurrency(item.price)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(107,94,78,0.07)", borderRadius: 10, padding: "0.3rem 0.5rem" }}>
                      <button onClick={() => updateQty(item.itemId, -1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: BA }}><Minus size={12} /></button>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: OW, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.itemId, 1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: BA }}><Plus size={12} /></button>
                    </div>
                    <button onClick={() => remove(item.itemId)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: BA, opacity: 0.45 }}><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Total + CTA */}
          <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid rgba(107,94,78,0.1)", background: "rgba(245,240,232,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA }}>Total</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, color: OW }}>{formatCurrency(total)}</span>
            </div>
            <motion.button onClick={placeOrder} disabled={isSubmitting || !cart.length || !selectedCustomer}
              whileHover={!isSubmitting && cart.length && selectedCustomer ? { scale: 1.02, y: -2 } : {}}
              whileTap={{ scale: 0.97 }}
              style={{ width: "100%", padding: "1rem", borderRadius: 16, background: cart.length && selectedCustomer ? `linear-gradient(135deg,${OW},${BA})` : "rgba(107,94,78,0.1)", color: cart.length && selectedCustomer ? P : BA, fontWeight: 600, fontSize: "0.88rem", border: "none", cursor: cart.length && selectedCustomer ? "pointer" : "not-allowed", boxShadow: cart.length && selectedCustomer ? "0 6px 20px rgba(45,58,46,0.22)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.3s ease" }}>
              {isSubmitting ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : "Confirm Dine-In Order"}
            </motion.button>
          </div>
        </div>

        {selectedCustomer && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "0.875rem", padding: "0.9rem 1rem", borderRadius: 16, background: "rgba(122,158,126,0.1)", border: "1px solid rgba(122,158,126,0.2)" }}>
            <CheckCircle2 size={18} color={SG} />
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: SG }}>Verified Guest</div>
              <div style={{ fontSize: "0.78rem", color: BA }}>Points will be added to <strong>{selectedCustomer.firstName}</strong>'s account</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
