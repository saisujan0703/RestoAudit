"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Users, ChevronRight, Loader2, User, Star, MessageSquareWarning } from "lucide-react";
import { fetchUsers, fetchOrdersByBranch } from "@/lib/api";

const P  = "#F5F0E8";
const OL = "#A8C5A0";
const SG = "#7A9E7E";
const SA = "#C9B99A";
const BA = "#6B5E4E";
const OW = "#2D3A2E";

type UserRow = {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  userRole?: string;
  role?: string;
  loyaltyPoints?: number;
};

export default function ManagerGuestsPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [branchOrders, setBranchOrders] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("restroaudit.currentUser");
        const current = raw ? JSON.parse(raw) : null;
        const currentBranchId = current ? Number(current.branchId ?? null) : null;
        
        const [usersData, fbData] = await Promise.all([
          fetchUsers(),
          import("@/lib/api").then(m => m.fetchFeedback ? m.fetchFeedback() : Promise.resolve([])).catch(() => [])
        ]);
        
        const list = Array.isArray(usersData) ? usersData : [];
        setUsers(list.filter((u: any) => {
          if (!currentBranchId) return true;
          const userBranchId = u?.branch?.branchId ?? u?.branchId ?? null;
          return Number(userBranchId) === Number(currentBranchId);
        }));

        setFeedbacks(Array.isArray(fbData) ? fbData.filter((f: any) => {
          if (!currentBranchId) return true;
          return Number(f?.branch?.branchId ?? f?.branchId) === currentBranchId;
        }) : []);

        if (currentBranchId) {
          try {
            const orders = await fetchOrdersByBranch(currentBranchId);
            setBranchOrders(Array.isArray(orders) ? orders : []);
          } catch {}
        }
      } catch {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const calculateLoyaltyPoints = (user: UserRow) => {
    const userOrdersCount = branchOrders.filter(o => o.user?.userId === user.userId).length;
    const userFeedbacks = feedbacks.filter(f => f.user?.userId === user.userId);
    const feedbackPoints = userFeedbacks.reduce((sum, f) => sum + ((f.ratingScore || 0) * 10), 0);
    return (user.loyaltyPoints || 0) + (userOrdersCount * 50) + feedbackPoints;
  };

  const customers = useMemo(() =>
    users.filter(u => (u.userRole ?? u.role ?? "").toString().toLowerCase() === "customer" && typeof u.userId === "number")
      .map(u => {
        const userOrders = branchOrders.filter(o => o.user?.userId === u.userId);
        const sortedOrders = userOrders.sort((a,b) => new Date(b.orderTime||0).getTime() - new Date(a.orderTime||0).getTime());
        const lastVisit = sortedOrders.length > 0 && sortedOrders[0].orderTime 
          ? new Date(sortedOrders[0].orderTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : null;
        return { ...u, dynamicPoints: calculateLoyaltyPoints(u), lastVisit };
      })
  , [users, branchOrders, feedbacks]);

  const filtered = customers.filter(c =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const tier = (pts: number = 0) => pts > 1000 ? "Gold" : pts > 500 ? "Silver" : "Bronze";
  const tierColor = (pts: number = 0) => {
    const t = tier(pts);
    return t === "Gold" ? "#B5860D" : t === "Silver" ? SG : BA;
  };

  const totalFeedbacks = feedbacks.length;
  const avgRating = totalFeedbacks ? (feedbacks.reduce((s,f) => s + (f.ratingScore || 0), 0) / totalFeedbacks).toFixed(1) : "0.0";
  const lowRatings = feedbacks.filter(f => (f.ratingScore || 0) <= 2).length;

  const selectedFeedbacks = selected ? feedbacks.filter(f => f.user?.userId === selected.userId) : [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "'Jost', sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
          <Users size={14} color={SG} />
          <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: SG }}>Guest Records</span>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 500, color: OW, margin: 0, letterSpacing: "-0.02em" }}>
          Guest <em className="gradient-clip-text" style={{ backgroundImage: `linear-gradient(135deg,${SG},${OL})` }}>Lookup</em>
        </h1>
        <p style={{ fontSize: "0.875rem", color: BA, marginTop: "0.5rem" }}>View dynamic loyalty points calculated from visits and reviews.</p>
      </div>

      {/* OVERALL STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="glass-card" style={{ padding: "1.5rem", borderRadius: 20 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, marginBottom: "1rem" }}>Total Feedbacks</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 600, color: OW }}>{totalFeedbacks}</div>
        </div>
        <div className="glass-card" style={{ padding: "1.5rem", borderRadius: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, marginBottom: "1rem" }}>
            <Star size={14} /> Avg Rating
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 600, color: OW }}>{avgRating} <span style={{ fontSize: "1.5rem", color: SA }}>★</span></div>
        </div>
        <div className="glass-card" style={{ padding: "1.5rem", borderRadius: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B54A4A", marginBottom: "1rem" }}>
            <MessageSquareWarning size={14} /> Low Ratings (≤2)
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 600, color: OW }}>{lowRatings}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: "1.5rem", alignItems: "start" }}>
        <div className="glass-card" style={{ borderRadius: 24, padding: "1.5rem" }}>
          <div style={{ position: "relative", marginBottom: "1rem" }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guest by name or email…"
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 14, border: "1px solid rgba(107,94,78,0.14)", background: "rgba(245,240,232,0.7)", fontSize: "0.875rem", color: OW, fontFamily: "'Jost', sans-serif", outline: "none", boxSizing: "border-box" }} />
          </div>

          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem", gap: 10 }}>
              <Loader2 size={20} color={SG} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "0.875rem", color: BA, fontStyle: "italic" }}>Loading guests…</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflowY: "auto" }}>
              {filtered.map(c => {
                const tc = tierColor(c.dynamicPoints);
                const isActive = selected?.userId === c.userId;
                return (
                  <motion.div key={c.userId} whileHover={{ x: 3 }} onClick={() => setSelected(c)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.9rem 1rem", borderRadius: 14, cursor: "pointer", transition: "all 0.2s",
                      background: isActive ? `linear-gradient(135deg,${OW},${BA})` : "rgba(245,240,232,0.55)",
                      border: `1px solid ${isActive ? "transparent" : "rgba(107,94,78,0.1)"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: isActive ? "rgba(168,197,160,0.2)" : `linear-gradient(135deg,${OL}33,${SA}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 600, color: isActive ? OL : OW }}>
                        {c.firstName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: isActive ? P : OW }}>{c.firstName} {c.lastName}</div>
                        <div style={{ fontSize: "0.7rem", color: isActive ? "rgba(245,240,232,0.5)" : BA, opacity: 0.7 }}>{c.email}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.62rem", fontWeight: 700, color: isActive ? OL : tc, background: isActive ? "rgba(168,197,160,0.15)" : `${tc}1A`, padding: "0.2rem 0.6rem", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {tier(c.dynamicPoints)}
                      </span>
                      <ChevronRight size={14} color={isActive ? OL : BA} style={{ opacity: 0.5 }} />
                    </div>
                  </motion.div>
                );
              })}
              {!filtered.length && (
                <p style={{ textAlign: "center", padding: "2.5rem", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: BA, opacity: 0.5 }}>No guests match your search.</p>
              )}
            </div>
          )}
        </div>

        {selected && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
            <div className="grain" style={{
              borderRadius: 24, overflow: "hidden", padding: "2rem", marginBottom: "1rem",
              background: `radial-gradient(circle at 80% 20%, rgba(90,140,95,0.55) 0%, transparent 55%),
                           radial-gradient(circle at 20% 80%, rgba(122,158,126,0.35) 0%, transparent 50%), ${OW}`,
              position: "relative",
            }}>
              <div className="pattern-diagonal-light" style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(168,197,160,0.15)", border: "1px solid rgba(168,197,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                  <User size={24} color={OL} />
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 500, color: P, margin: "0 0 0.25rem" }}>{selected.firstName} {selected.lastName}</h2>
                <p style={{ fontSize: "0.78rem", color: "rgba(245,240,232,0.5)", margin: "0 0 1.5rem" }}>{selected.email}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,240,232,0.4)" }}>Loyalty Points</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 600, color: SA, lineHeight: 1 }}>{(selected as any).dynamicPoints ?? 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,240,232,0.4)" }}>Status</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600, color: SA, lineHeight: 1.2 }}>{tier((selected as any).dynamicPoints)}</div>
                  </div>
                  {(selected as any).lastVisit && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,240,232,0.4)" }}>Last Visit</div>
                      <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "1.1rem", fontWeight: 500, color: P, lineHeight: 1.5 }}>{(selected as any).lastVisit}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PREVIOUS REVIEWS */}
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 600, color: OW, marginTop: "1.5rem", marginBottom: "1rem" }}>Past Reviews</h3>
            {selectedFeedbacks.length === 0 ? (
              <p style={{ color: BA, fontStyle: "italic", fontSize: "0.85rem" }}>No reviews from this guest yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {selectedFeedbacks.map((f, i) => (
                  <div key={i} style={{ padding: "1rem 1.25rem", borderRadius: 16, border: "1px solid rgba(107,94,78,0.15)", background: "rgba(245,240,232,0.6)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} size={14} fill={idx < f.ratingScore ? SA : "transparent"} color={idx < f.ratingScore ? SA : "rgba(107,94,78,0.2)"} />
                        ))}
                        {f.ratingScore <= 2 && <span style={{ marginLeft: 8, fontSize: "0.6rem", fontWeight: 700, background: "rgba(181,74,74,0.1)", color: "#B54A4A", padding: "0.2rem 0.5rem", borderRadius: 100 }}>FLAGGED</span>}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: BA }}>Order #{f.order?.orderId}</div>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: OW, fontStyle: "italic", margin: 0 }}>"{f.comments || "No comment provided."}"</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
