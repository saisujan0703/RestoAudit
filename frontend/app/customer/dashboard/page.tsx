"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Coins, History, ChevronRight, Utensils, Store, Leaf, CreditCard, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMenuItems, fetchOrdersByUser, fetchUserById, updateOrder } from "@/lib/api";
import { formatCurrency } from "@/lib/data";
import { toast } from "sonner";

const P  = "#F5F0E8";
const SA = "#C9B99A";
const OL = "#A8C5A0";
const SG = "#7A9E7E";
const BA = "#6B5E4E";
const OW = "#2D3A2E";

const stagger = { animate: { transition: { staggerChildren: 0.09 } } };
const up = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.55 } } };

export default function CustomerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const [pendingBills, setPendingBills] = useState<any[]>([]);
  const [isPaying, setIsPaying] = useState(false);

  const loadData = async () => {
    try {
      const raw = localStorage.getItem("restroaudit.currentUser");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const userId = parsed?.userId;
      if (parsed?.firstName) {
        setUser({ firstName: parsed.firstName, lastName: parsed.lastName, loyaltyPoints: 0 });
      }
      if (userId) {
        const [userData, orders, menuItems, fbData] = await Promise.all([
          fetchUserById(userId), fetchOrdersByUser(userId), fetchMenuItems(),
          import("@/lib/api").then(m => m.fetchFeedback ? m.fetchFeedback() : Promise.resolve([])).catch(() => [])
        ]);

        const safeOrders = Array.isArray(orders) ? orders : [];
        const safeFb = Array.isArray(fbData) ? fbData : [];

        const userOrdersCount = safeOrders.length;
        const userFeedbacks = safeFb.filter((f: any) => f.user?.userId === userId);
        const feedbackPoints = userFeedbacks.reduce((sum: number, f: any) => sum + ((f.ratingScore || 0) * 10), 0);
        const dynamicPoints = (userData?.loyaltyPoints || 0) + (userOrdersCount * 50) + feedbackPoints;

        const mergedUser = {
          ...userData,
          firstName: userData?.firstName || parsed?.firstName,
          lastName: userData?.lastName || parsed?.lastName,
          dynamicPoints
        };
        setUser(mergedUser);

        const orderedItemIds = new Set<number>();
        
        // Extract pending bills
        const awaitingPayment = safeOrders.filter(o => o.orderStatus === "AWAITING_PAYMENT");
        setPendingBills(awaitingPayment);

        for (const order of safeOrders) {
          const orderUserId = order?.user?.userId ?? order?.userId;
          if (orderUserId && Number(orderUserId) !== Number(userId)) continue;
          const details = Array.isArray(order?.orderDetails) ? order.orderDetails : [];
          for (const detail of details) {
            const id = detail?.menuItem?.itemId ?? detail?.item_id;
            if (typeof id === "number" && id > 0) orderedItemIds.add(id);
          }
        }
        const favs = orderedItemIds.size > 0
          ? (Array.isArray(menuItems) ? menuItems : []).filter(
              (m: any) => orderedItemIds.has(m?.itemId ?? m?.item_id)
            )
          : [];
        setFavoriteItems(favs);
      }
    } catch (err) { console.error("Failed to load customer data", err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Polling for live bill updates
    return () => clearInterval(interval);
  }, []);

  const handlePayBill = async (orderId: number) => {
    setIsPaying(true);
    try {
      const orderToUpdate = pendingBills.find(o => o.orderId === orderId);
      if (orderToUpdate) {
        await updateOrder(orderId, { ...orderToUpdate, orderStatus: "PAID" });
        toast.success("Payment successful! Thank you.");
        loadData(); // refresh immediately
      }
    } catch (error) {
      toast.error("Payment failed. Please try again or see the manager.");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 rounded-3xl" style={{ background: "rgba(107,94,78,0.08)" }} />
        <div className="grid lg:grid-cols-3 gap-5">
          <Skeleton className="h-52 rounded-3xl lg:col-span-2" style={{ background: "rgba(107,94,78,0.08)" }} />
          <Skeleton className="h-52 rounded-3xl" style={{ background: "rgba(107,94,78,0.08)" }} />
        </div>
      </div>
    );
  }

  const pts = user?.dynamicPoints ?? user?.loyaltyPoints ?? 0;
  const tier = pts > 1000 ? "Gold" : pts > 500 ? "Silver" : "Bronze";
  const tierColor = tier === "Gold" ? "#B5860D" : tier === "Silver" ? SG : BA;
  const tierBg    = tier === "Gold" ? "rgba(181,134,13,0.1)" : tier === "Silver" ? "rgba(122,158,126,0.1)" : "rgba(107,94,78,0.1)";
  const nextTarget = tier === "Gold" ? 2000 : tier === "Silver" ? 1000 : 500;
  const progress  = Math.min(((pts % 500) / 500) * 100, 100);

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} style={{ width: "100%", margin: "0 auto", fontFamily: "'Jost', sans-serif", background: "transparent" }}>

      {/* ── PENDING BILLS NOTIFICATION ─────────────── */}
      {pendingBills.length > 0 && (
        <motion.div variants={up} style={{ marginBottom: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {pendingBills.map(bill => {
            const total = Array.isArray(bill.orderDetails) 
              ? bill.orderDetails.reduce((s: number, d: any) => s + Number(d.subtotal || 0), 0)
              : 0;
            return (
              <div key={bill.orderId} className="grain" style={{ padding: "2rem", borderRadius: 24, background: `linear-gradient(135deg, ${OW}, ${BA})`, color: P, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", boxShadow: "0 10px 30px rgba(45,58,46,0.2)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
                    <CreditCard size={18} color={SA} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: SA }}>Pending Bill Approval</span>
                  </div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 500, margin: 0, color: P }}>Order #{bill.orderId}</h2>
                  <p style={{ fontSize: "0.9rem", color: "rgba(245,240,232,0.7)", margin: "0.25rem 0 0" }}>Your branch manager has requested payment for this order.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(245,240,232,0.6)" }}>Total Due</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 600, color: SA, lineHeight: 1 }}>{formatCurrency(total)}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button 
                      onClick={() => handlePayBill(bill.orderId)}
                      disabled={isPaying}
                      style={{ padding: "0.8rem 1.8rem", borderRadius: 12, background: `linear-gradient(135deg, ${SA}, ${OL})`, color: OW, fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", cursor: "pointer", border: "none", boxShadow: "0 4px 15px rgba(201,185,154,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                      {isPaying ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                      {isPaying ? "Processing..." : "Approve & Pay"}
                    </button>
                    <Link href="/customer/history" style={{ textDecoration: "none", width: "100%" }}>
                      <button style={{ width: "100%", padding: "0.6rem 1rem", borderRadius: 10, background: "rgba(255,255,255,0.1)", color: P, border: "1px solid rgba(255,255,255,0.2)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <Star size={14} /> Leave a Review
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* ── HERO WELCOME ────────────────────────────── */}
      <motion.div variants={up} className="grain" style={{
        position: "relative", borderRadius: 24, overflow: "hidden", marginBottom: "1.25rem",
        background: `radial-gradient(ellipse 70% 80% at 85% 20%, rgba(122,158,126,0.45) 0%, transparent 55%),
                     radial-gradient(ellipse 55% 60% at 10% 80%, rgba(201,185,154,0.35) 0%, transparent 55%),
                     #EDE7D5`,
        padding: "1.5rem 2.5rem",
      }}>
        <div className="pattern-dots" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
              <Leaf size={12} color={SG} />
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: SG }}>Guest Experience</span>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 500, color: OW, margin: "0 0 0.25rem", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
              Bonjour, <em className="gradient-clip-text" style={{ backgroundImage: `linear-gradient(135deg,${SG},${OL})` }}>{user?.firstName || "Guest"}</em>
            </h1>
            <p style={{ fontSize: "0.85rem", color: BA, maxWidth: 480, lineHeight: 1.5, margin: 0, fontWeight: 400 }}>
              Your culinary journey continues. Relive past delights and watch your loyalty grow with every visit.
            </p>
          </div>
          <Link href="/customer/history" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", gap: 8, background: `linear-gradient(135deg,${OW},${BA})`, color: P, padding: "0.6rem 1.4rem", borderRadius: 100, fontWeight: 600, fontSize: "0.8rem", border: "none", cursor: "pointer", boxShadow: "0 4px 15px rgba(45,58,46,0.2)" }}>
              <History size={14} /> Visit History <ChevronRight size={12} />
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* ── LOYALTY + TIER ──────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem", marginBottom: "1.75rem" }}>

        {/* Loyalty card */}
        <motion.div variants={up} className="grain" style={{
          position: "relative", borderRadius: 24, overflow: "hidden", padding: "2.5rem",
          background: `radial-gradient(ellipse 65% 70% at 85% 15%, rgba(201,185,154,0.5) 0%, transparent 55%),
                       radial-gradient(ellipse 50% 55% at 10% 80%, rgba(122,158,126,0.25) 0%, transparent 50%),
                       rgba(255,253,248,0.9)`,
          border: "1px solid rgba(107,94,78,0.12)",
          backdropFilter: "blur(16px)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: "1.5rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${SA},${OL})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Coins size={20} color={OW} />
            </div>
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: BA, marginBottom: 2 }}>Loyalty Points</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "4rem", fontWeight: 600, color: OW, lineHeight: 1, letterSpacing: "-0.02em" }}>{pts.toLocaleString()}</div>
            </div>
          </div>

          {/* Tier badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "0.45rem 1rem", borderRadius: 100, background: tierBg, border: `1px solid ${tierColor}33`, marginBottom: "1.5rem" }}>
            <Star size={13} fill={tierColor} color={tierColor} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", color: tierColor, textTransform: "uppercase" }}>{tier} Status</span>
          </div>

          {/* Progress to next perk */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: BA }}>Next Perk</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: SG }}>{nextTarget - pts > 0 ? nextTarget - pts : 0} pts away</span>
            </div>
            <div style={{ height: 6, borderRadius: 100, background: "rgba(107,94,78,0.1)", overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: "100%", borderRadius: 100, background: `linear-gradient(90deg,${SG},${OL})` }} />
            </div>
            <p style={{ fontSize: "0.78rem", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: BA, marginTop: 8 }}>
              "Earn {nextTarget - pts > 0 ? nextTarget - pts : 0} more points for a Complimentary Signature Dessert"
            </p>
          </div>
        </motion.div>

        {/* Dine-in priority card */}
        <motion.div variants={up} className="grain" style={{
          position: "relative", borderRadius: 24, overflow: "hidden", padding: "2rem",
          background: `radial-gradient(ellipse 70% 60% at 20% 20%, rgba(90,140,95,0.55) 0%, transparent 55%),
                       radial-gradient(ellipse 60% 50% at 80% 80%, rgba(122,158,126,0.35) 0%, transparent 55%),
                       ${OW}`,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div className="pattern-diagonal-light" style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: "rgba(168,197,160,0.15)", border: "1px solid rgba(168,197,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <Store size={20} color={OL} />
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 500, color: P, margin: "0 0 0.5rem", lineHeight: 1.2 }}>Dine-In Priority</h3>
            <p style={{ fontSize: "0.82rem", color: "rgba(245,240,232,0.5)", lineHeight: 1.65, margin: 0 }}>As a {tier} member, enjoy priority seating and exclusive table-side service.</p>
          </div>
          <div style={{ position: "relative", zIndex: 1, marginTop: "1.5rem" }}>
            <button style={{ width: "100%", padding: "0.7rem", borderRadius: 14, background: "rgba(168,197,160,0.15)", border: "1px solid rgba(168,197,160,0.2)", color: OL, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.1em", cursor: "pointer" }}>
              View Rewards
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── CULINARY FAVORITES ──────────────────────── */}
      <motion.div variants={up}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 500, color: OW, margin: "0 0 0.1rem" }}>Culinary Favorites</h2>
            <p style={{ fontSize: "0.75rem", color: BA, margin: 0 }}>Refined flavors from your previous visits</p>
          </div>
          <Link href="/customer/history" style={{ textDecoration: "none" }}>
            <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, color: SG, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              View All <ChevronRight size={14} />
            </button>
          </Link>
        </div>

        {favoriteItems.length === 0 ? (
          <div style={{ borderRadius: 24, border: "2px dashed rgba(107,94,78,0.15)", padding: "2.5rem", textAlign: "center" }}>
            <Utensils size={32} color={BA} style={{ margin: "0 auto 0.75rem", opacity: 0.25 }} />
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: BA, fontSize: "1.05rem", margin: 0, opacity: 0.6 }}>Your favorites will appear once our staff records your first visit.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
            {favoriteItems.slice(0, 4).map((item, idx) => (
              <motion.div key={item.itemId ?? idx} whileHover={{ y: -4 }} className="glass-card" style={{ borderRadius: 20, overflow: "hidden", cursor: "default" }}>
                <div style={{ height: 80, background: `linear-gradient(135deg,${OL}22,${SA}33)`, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(107,94,78,0.08)" }}>
                  <Utensils size={24} color={SG} style={{ opacity: 0.6 }} />
                </div>
                <div style={{ padding: "0.85rem 1rem" }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 600, color: OW, margin: "0 0 0.2rem", lineHeight: 1.2 }}>{item.itemName ?? "Signature Dish"}</h3>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, opacity: 0.6, margin: "0 0 0.5rem" }}>{item.category || "Main"}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid rgba(107,94,78,0.08)" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600, color: OW }}>{formatCurrency(item.price)}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Star size={10} fill={SA} color={SA} />
                      <span style={{ fontSize: "0.7rem", fontWeight: 600, color: BA }}>4.9</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── SHARE YOUR EXPERIENCE ───────────────────── */}
      <motion.div variants={up} className="grain" style={{
        position: "relative", borderRadius: 24, overflow: "hidden", padding: "2rem", textAlign: "center", marginTop: "1.25rem",
        background: `radial-gradient(ellipse 60% 55% at 20% 30%, rgba(201,185,154,0.4) 0%, transparent 55%),
                     radial-gradient(ellipse 55% 50% at 80% 70%, rgba(168,197,160,0.3) 0%, transparent 50%),
                     #EDE7D5`,
      }}>
        <div className="pattern-diagonal" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", gap: 5, marginBottom: "0.75rem" }}>
            {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={SA} color={SA} />)}
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 500, color: OW, margin: "0 0 0.5rem" }}>Share Your Experience</h2>
          <p style={{ fontSize: "0.85rem", color: BA, maxWidth: 480, margin: "0 auto 1.25rem", lineHeight: 1.5 }}>Your feedback is the secret ingredient of our perfection. Review your latest visit and earn bonus points.</p>
          <Link href="/customer/history" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.7rem 2rem", borderRadius: 100, background: `linear-gradient(135deg,${OW},${BA})`, color: P, fontWeight: 600, fontSize: "0.8rem", border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(45,58,46,0.2)" }}>
              Rate My Last Visit
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
