"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Clock, Star, MessageSquare, Inbox,
  FileText, ArrowRight, Loader2, Calendar, Utensils
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/data";
import { toast } from "sonner";
import { fetchMenuItems, createFeedback, fetchOrdersByUser, fetchFeedback } from "@/lib/api";

const P  = "#F5F0E8";
const OL = "#A8C5A0";
const SG = "#7A9E7E";
const SA = "#C9B99A";
const BA = "#6B5E4E";
const OW = "#2D3A2E";

function ratingLabel(r: number) {
  return ["", "Critical Deficiency", "Subpar Delivery", "Satisfactory Experience", "Highly Commendable", "Exquisite Excellence"][r] || "";
}

function enrichOrder(order: any, menuItems: any[]) {
  const details = Array.isArray(order?.orderDetails) ? order.orderDetails : [];
  const items = details.map((d: any) => {
    // API returns d.menuItem.itemId (nested object), not d.itemId
    const itemId = d?.menuItem?.itemId ?? d?.itemId;
    const menuItem = menuItems.find((m: any) => m?.itemId === itemId) ||
      d?.menuItem || { itemId, itemName: "Signature Selection", price: 0 };
    return { ...d, item_id: itemId, item: menuItem, itemName: menuItem?.itemName };
  });
  // Sum subtotals since backend has no totalAmount field
  const total = items.reduce((sum: number, d: any) => sum + (d.subtotal || 0), 0);
  return {
    ...order,
    items, total,
    order_id: order.orderId || order.order_id,
    order_time: order.orderTime || order.orderTimestamp || new Date().toISOString(),
  };
}

export default function CustomerHistoryPage() {
  const [isLoading, setIsLoading]         = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{isOpen: boolean, itemId: number | null, itemName: string, orderId: number | null}>({
    isOpen: false, itemId: null, itemName: "", orderId: null
  });
  const [hoverRating, setHoverRating]     = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedbackText, setFeedbackText]   = useState("");
  const [enrichedOrders, setEnrichedOrders] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [menuItems, setMenuItems]         = useState<any[]>([]);
  const [ratedOrderIds, setRatedOrderIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem("restroaudit.currentUser");
      const parsed = raw ? JSON.parse(raw) : null;
      setCurrentUserId(typeof parsed?.userId === "number" ? parsed.userId : null);
    } catch { setCurrentUserId(null); }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    (async () => {
      setIsLoading(true);
      try {
        const [ordersData, menuItemsData, feedbackData] = await Promise.all([
          fetchOrdersByUser(currentUserId), fetchMenuItems(), fetchFeedback()
        ]);
        const safe = Array.isArray(menuItemsData) ? menuItemsData : [];
        setMenuItems(safe);
        // Build set of already-rated order IDs
        if (Array.isArray(feedbackData)) {
          const rated = new Set<number>(feedbackData
            .filter((f: any) => f?.user?.userId === currentUserId || f?.userId === currentUserId)
            .map((f: any) => Number(f?.orderId)).filter(Boolean));
          setRatedOrderIds(rated);
        }
        setEnrichedOrders((Array.isArray(ordersData) ? ordersData : [])
          .map((o: any) => enrichOrder(o, safe))
          .sort((a: any, b: any) => new Date(b.order_time).getTime() - new Date(a.order_time).getTime()));
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [currentUserId]);

  const submitFeedback = async () => {
    if (!selectedRating || !feedbackModal.itemId || !currentUserId || !feedbackModal.orderId) { toast.error("Please provide all details"); return; }
    try {
      const order = enrichedOrders.find((o: any) => o.order_id === feedbackModal.orderId);
      const branchId = order?.branch?.branchId ?? order?.branch_id ?? 0;
      await createFeedback({ ratingScore: selectedRating, textComments: feedbackText, userId: currentUserId, itemId: feedbackModal.itemId, orderId: feedbackModal.orderId, branchId });
      toast.success("Feedback submitted!", { description: "Thank you for your review." });
      setRatedOrderIds(prev => new Set(prev).add(feedbackModal.orderId!));
      setFeedbackModal({ isOpen: false, itemId: null, itemName: "", orderId: null });
      setSelectedRating(0); setFeedbackText("");
    } catch (err: any) {
      if (err?.status === 409 || (err?.message && err.message.includes("already been rated"))) {
        toast.error("Already rated", { description: "This order already has feedback." });
      } else {
        toast.error("Submission failed", { description: err?.message || "Please try again." });
      }
    }
  };

  if (isLoading) return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Skeleton className="h-10 w-64 rounded-2xl mb-3" style={{ background: "rgba(107,94,78,0.08)" }} />
        <Skeleton className="h-6 w-48 rounded-xl" style={{ background: "rgba(107,94,78,0.06)" }} />
      </div>
      {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl mb-4" style={{ background: "rgba(107,94,78,0.07)" }} />)}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", margin: "0 auto", fontFamily: "'Jost', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
            <Calendar size={14} color={SG} />
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: SG }}>Personal Archives</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 500, color: OW, margin: 0, letterSpacing: "-0.02em" }}>
            Visit <em className="gradient-clip-text" style={{ backgroundImage: `linear-gradient(135deg,${SG},${OL})` }}>Chronicles</em>
          </h1>
        </div>
        <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
          onClick={() => toast.info("Select an order item below to rate it.")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1.5rem", borderRadius: 100, background: "rgba(122,158,126,0.12)", border: "1px solid rgba(122,158,126,0.25)", color: SG, fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
          <MessageSquare size={15} /> General Feedback
        </motion.button>
      </div>

      {/* Orders */}
      {enrichedOrders.length === 0 ? (
        <div className="glass-card" style={{ borderRadius: 24, padding: "4rem 2rem", textAlign: "center" }}>
          <Inbox size={40} color={BA} style={{ margin: "0 auto 1rem", opacity: 0.2 }} />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontStyle: "italic", color: BA, opacity: 0.55 }}>No visits recorded yet. Our staff will log your first dine-in experience.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {enrichedOrders.map((order) => {
            const expanded = expandedOrder === order.order_id;
            return (
              <motion.div key={order.order_id} layout>
                <div className="glass-card" style={{ borderRadius: 22, overflow: "hidden", border: expanded ? `1px solid rgba(122,158,126,0.3)` : "1px solid rgba(107,94,78,0.1)" }}>

                  {/* Order header — clickable */}
                  <div onClick={() => setExpandedOrder(expanded ? null : order.order_id)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s",
                        background: expanded ? `linear-gradient(135deg,${SG},${OL})` : "rgba(107,94,78,0.08)" }}>
                        <FileText size={19} color={expanded ? OW : BA} />
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: OW }}>
                          Receipt #{order.order_id}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                          <Clock size={11} color={BA} style={{ opacity: 0.5 }} />
                          <span style={{ fontSize: "0.7rem", color: BA, opacity: 0.6 }}>{formatDate(order.order_time)}</span>
                          <span style={{ width: 3, height: 3, borderRadius: "50%", background: BA, opacity: 0.3 }} />
                          <span style={{ fontSize: "0.7rem", color: BA, opacity: 0.6 }}>{order.items.length} items</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: BA, opacity: 0.55 }}>Amount</div>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600, color: OW }}>{formatCurrency(order.total)}</div>
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(107,94,78,0.15)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.3s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                        <ChevronDown size={15} color={BA} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded items */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                        <div style={{ borderTop: "1px solid rgba(107,94,78,0.08)", padding: "1.25rem 1.5rem", background: "rgba(245,240,232,0.4)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: SG, marginBottom: "0.5rem" }}>Detailed Manifest</p>
                          {order.items.map((item: any, i: number) => (
                            <motion.div key={item.item_id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.9rem 1rem", borderRadius: 16, background: "rgba(255,253,248,0.7)", border: "1px solid rgba(107,94,78,0.08)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 11, background: `linear-gradient(135deg,${OL}33,${SA}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: OW }}>
                                  {item.quantity}×
                                </div>
                                <div>
                                  <div style={{ fontSize: "0.9rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: OW }}>{item.item?.itemName}</div>
                                  <div style={{ fontSize: "0.65rem", color: BA, opacity: 0.6 }}>Unit: {formatCurrency(item.item?.price)}</div>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600, color: OW }}>{formatCurrency(item.subtotal || item.quantity * item.item?.price)}</span>
                                {ratedOrderIds.has(Number(order.order_id)) ? (
                                  <span style={{ padding: "0.4rem 0.9rem", borderRadius: 100, background: "rgba(122,158,126,0.15)", border: "1px solid rgba(122,158,126,0.3)", color: SG, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em" }}>
                                    Rated ✓
                                  </span>
                                ) : (
                                  <button onClick={() => setFeedbackModal({ isOpen: true, itemId: item.item_id, itemName: item.item?.itemName, orderId: order.order_id })}
                                    style={{ padding: "0.4rem 0.9rem", borderRadius: 100, background: "rgba(122,158,126,0.1)", border: "1px solid rgba(122,158,126,0.2)", color: SG, fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", letterSpacing: "0.08em" }}>
                                    Rate
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── FEEDBACK DIALOG ── */}
      <Dialog open={feedbackModal.isOpen} onOpenChange={open => !open && setFeedbackModal({ isOpen: false, itemId: null, itemName: "", orderId: null })}>
        <DialogContent className="rounded-3xl p-0 max-w-lg overflow-hidden" style={{ background: P, border: "1px solid rgba(107,94,78,0.12)" }}>
          {/* Dialog top gradient strip */}
          <div className="grain" style={{ background: `radial-gradient(circle at 30% 30%, rgba(90,140,95,0.6) 0%, transparent 55%), ${OW}`, padding: "2rem", position: "relative" }}>
            <div className="pattern-diagonal-light" style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(168,197,160,0.15)", border: "1px solid rgba(168,197,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Utensils size={18} color={OL} />
              </div>
              <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.9rem", fontWeight: 500, color: P, margin: "0 0 0.25rem" }}>
                Culinary <em>Verdict</em>
              </DialogTitle>
              <DialogDescription style={{ fontSize: "0.78rem", color: "rgba(245,240,232,0.5)" }}>
                Reviewing: <span style={{ color: OL }}>{feedbackModal.itemName || "your experience"}</span>
              </DialogDescription>
            </div>
          </div>

          <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Item selector */}
            <div>
              <Label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 8 }}>Select Dish</Label>
              <Select value={feedbackModal.itemId ? String(feedbackModal.itemId) : ""} onValueChange={v => { const id = Number(v); const found = menuItems.find((m: any) => m?.itemId === id); setFeedbackModal({ ...feedbackModal, itemId: id, itemName: found?.itemName || "" }); }}>
                <SelectTrigger style={{ background: "rgba(255,253,248,0.7)", border: "1px solid rgba(107,94,78,0.15)", borderRadius: 14, height: 48, fontFamily: "'Jost', sans-serif" }}>
                  <SelectValue placeholder="Choose a dish to rate" />
                </SelectTrigger>
                <SelectContent style={{ borderRadius: 16, border: "1px solid rgba(107,94,78,0.12)" }}>
                  {menuItems.map((m: any) => (
                    <SelectItem key={m.itemId} value={String(m.itemId)}>{m.itemName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Star rating */}
            <div style={{ background: "rgba(107,94,78,0.05)", borderRadius: 18, padding: "1.5rem", textAlign: "center" }}>
              <Label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: BA, display: "block", marginBottom: "1rem" }}>Your Rating</Label>
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                {[1,2,3,4,5].map(star => (
                  <button key={star} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setSelectedRating(star)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, transition: "transform 0.15s", transform: star <= (hoverRating || selectedRating) ? "scale(1.2)" : "scale(1)" }}>
                    <Star size={32} fill={star <= (hoverRating || selectedRating) ? SA : "none"} color={star <= (hoverRating || selectedRating) ? SA : "rgba(107,94,78,0.25)"} />
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {selectedRating > 0 && (
                  <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: SG, marginTop: "0.75rem", fontSize: "1rem" }}>
                    "{ratingLabel(selectedRating)}"
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Comments */}
            <div>
              <Label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 8 }}>Comments (Optional)</Label>
              <Textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                placeholder="Tell us about the flavor, presentation, and service…"
                style={{ background: "rgba(255,253,248,0.7)", border: "1px solid rgba(107,94,78,0.14)", borderRadius: 14, minHeight: 100, fontFamily: "'Jost', sans-serif", fontSize: "0.875rem", color: OW, padding: "0.875rem 1rem" }} />
            </div>

            <motion.button onClick={submitFeedback} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "1rem", borderRadius: 16, background: `linear-gradient(135deg,${OW},${BA})`, color: P, fontWeight: 600, fontSize: "0.9rem", border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(45,58,46,0.22)" }}>
              Submit Verdict <ArrowRight size={16} color={SA} />
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
