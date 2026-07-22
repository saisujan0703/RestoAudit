"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Loader2 } from "lucide-react";
import { fetchOrdersByBranch, updateOrder } from "@/lib/api";

const P  = "#F5F0E8";
const OL = "#A8C5A0";
const SG = "#7A9E7E";
const SA = "#C9B99A";
const BA = "#6B5E4E";
const OW = "#2D3A2E";

export default function ManagerOperationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [branchOrders, setBranchOrders] = useState<any[]>([]);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("restroaudit.currentUser");
        const current = raw ? JSON.parse(raw) : null;
        const currentBranchId = current ? Number(current.branchId ?? null) : null;
        
        if (currentBranchId) {
          try {
            const orders = await fetchOrdersByBranch(currentBranchId);
            setBranchOrders(Array.isArray(orders) ? orders.sort((a,b) => new Date(b.orderTime||0).getTime() - new Date(a.orderTime||0).getTime() || b.orderId - a.orderId) : []);
          } catch {}
        }
      } catch {
        toast.error("Failed to load operations data");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const kitchenQueue = branchOrders.filter(o => o.orderStatus === "Pending" || o.orderStatus === "Ready" || o.orderStatus === "Preparing");
  const completedOrders = branchOrders.filter(o => o.orderStatus === "COMPLETED" || o.orderStatus === "AWAITING_PAYMENT");

  const billsByGuest = useMemo(() => {
    const map: Record<string, { user: any, orders: any[], total: number }> = {};
    completedOrders.forEach(o => {
      const uid = o.user?.userId || `guest_${o.orderId}`;
      if (!map[uid]) map[uid] = { user: o.user, orders: [], total: 0 };
      map[uid].orders.push(o);
      const orderTotal = Array.isArray(o.orderDetails) 
        ? o.orderDetails.reduce((sum: number, d: any) => sum + Number(d.subtotal || 0), 0)
        : 0;
      map[uid].total += orderTotal;
    });
    return Object.values(map).sort((a,b) => {
      const maxA = Math.max(...a.orders.map(o => new Date(o.orderTime||0).getTime() || o.orderId));
      const maxB = Math.max(...b.orders.map(o => new Date(o.orderTime||0).getTime() || o.orderId));
      return maxB - maxA;
    });
  }, [completedOrders]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem", gap: 10 }}>
        <Loader2 size={20} color={SG} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "0.875rem", color: BA, fontStyle: "italic" }}>Loading operations…</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "'Jost', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
          <ShoppingBag size={14} color={SG} />
          <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: SG }}>Branch Operations</span>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 500, color: OW, margin: 0, letterSpacing: "-0.02em" }}>
          Active <em className="gradient-clip-text" style={{ backgroundImage: `linear-gradient(135deg,${SG},${OL})` }}>Service</em>
        </h1>
        <p style={{ fontSize: "0.875rem", color: BA, marginTop: "0.5rem" }}>Monitor kitchen queues and settle guest bills.</p>
      </div>

      {/* OPERATIONS VIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem', alignItems: 'start' }}>
        
        {/* Kitchen Queue */}
        <div className="glass-card" style={{ borderRadius: 24, padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: OW, marginBottom: 16 }}>Kitchen Queue</h3>
          {kitchenQueue.length === 0 ? (
            <p style={{ color: '#6b5e4e', fontStyle: 'italic', fontSize: '0.875rem' }}>No pending orders.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {kitchenQueue.map(o => (
                <div key={o.orderId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 16, border: '1px solid rgba(107,94,78,0.08)', background: o.orderStatus === "Pending" ? "rgba(201,185,154,0.15)" : "rgba(168,197,160,0.15)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: OW, fontSize: "1rem" }}>{o.orderId ? `Order #${o.orderId}` : 'Order'}</div>
                    <div style={{ fontSize: 13, color: BA, margin: "2px 0 6px" }}>{o.user ? `${o.user.firstName ?? ''} ${o.user.lastName ?? ''}` : '—'}</div>
                    
                    {/* Item names */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                      {Array.isArray(o.orderDetails) && o.orderDetails.map((d: any, i: number) => (
                        <span key={i} style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", background: "rgba(107,94,78,0.06)", borderRadius: 4, color: BA }}>
                          {d.quantity}x {d.menuItem?.itemName || "Item"}
                        </span>
                      ))}
                    </div>

                    <div style={{ fontSize: 10, color: BA, opacity: 0.8 }}>{o.orderTime ? new Date(o.orderTime).toLocaleTimeString() : ''}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.75rem", color: o.orderStatus === "Pending" ? SA : OL, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                      {o.orderStatus}
                    </div>
                    {o.orderStatus === "Pending" && (
                      <button 
                        onClick={async () => {
                          setIsUpdatingOrder(true);
                          try {
                            await updateOrder(o.orderId, { ...o, orderStatus: "Ready" });
                            toast.success(`Order #${o.orderId} marked as Ready!`);
                            const current = JSON.parse(localStorage.getItem("restroaudit.currentUser") || "{}");
                            if (current.branchId) {
                              const orders = await fetchOrdersByBranch(current.branchId);
                              setBranchOrders(Array.isArray(orders) ? orders : []);
                            }
                          } catch {
                            toast.error("Failed to update status");
                          } finally {
                            setIsUpdatingOrder(false);
                          }
                        }}
                        disabled={isUpdatingOrder}
                        style={{ padding: "0.45rem 0.9rem", borderRadius: 10, background: `linear-gradient(135deg,${SG},${OL})`, color: P, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", cursor: "pointer", border: "none" }}
                      >
                        {isUpdatingOrder ? "..." : "Mark as Ready"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Bills */}
        <div className="glass-card" style={{ borderRadius: 24, padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: OW, marginBottom: 16 }}>Awaiting Payment</h3>
          {billsByGuest.length === 0 ? (
            <p style={{ color: '#6b5e4e', fontStyle: 'italic', fontSize: '0.875rem' }}>No bills awaiting payment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {billsByGuest.map(bill => (
                <div key={bill.user?.userId || Math.random()} style={{ padding: '1.25rem', borderRadius: 16, border: '1px solid rgba(107,94,78,0.15)', background: "rgba(245,240,232,0.6)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid rgba(107,94,78,0.1)", paddingBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(107,94,78,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: OW, fontSize: "1.1rem" }}>
                        {bill.user?.firstName?.[0] || 'G'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: OW, fontSize: "1.05rem" }}>{bill.user ? `${bill.user.firstName} ${bill.user.lastName}` : 'Guest'}</div>
                        <div style={{ fontSize: "0.75rem", color: BA }}>{bill.orders.length} order{bill.orders.length > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: BA }}>Total Due</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 700, color: OW }}>Rs. {bill.total.toFixed(0)}</div>
                    </div>
                  </div>
                  
                  {/* Items list snippet */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {bill.orders.flatMap(o => Array.isArray(o.orderDetails) ? o.orderDetails : []).slice(0, 4).map((d: any, i: number) => (
                      <span key={i} style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", background: "rgba(255,255,255,0.5)", borderRadius: 6, color: BA, border: "1px solid rgba(107,94,78,0.05)" }}>
                        {d.quantity}x {d.menuItem?.itemName || "Item"}
                      </span>
                    ))}
                    {bill.orders.flatMap(o => Array.isArray(o.orderDetails) ? o.orderDetails : []).length > 4 && (
                      <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", color: BA }}>...</span>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexWrap: "wrap" }}>
                    {bill.orders.some(o => o.orderStatus === "AWAITING_PAYMENT") ? (
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: SA, padding: "0.7rem 1.4rem", background: "rgba(201,185,154,0.15)", borderRadius: 12, border: `1px solid ${SA}40`, display: "flex", alignItems: "center" }}>
                        Waiting on Customer...
                      </span>
                    ) : (
                      <>
                        <button 
                          onClick={async () => {
                            setIsUpdatingOrder(true);
                            try {
                              for (const o of bill.orders) {
                                await updateOrder(o.orderId, { ...o, orderStatus: "AWAITING_PAYMENT" });
                              }
                              toast.success(`Approval requested from ${bill.user?.firstName || 'Guest'}!`);
                              const current = JSON.parse(localStorage.getItem("restroaudit.currentUser") || "{}");
                              if (current.branchId) {
                                const orders = await fetchOrdersByBranch(current.branchId);
                                setBranchOrders(Array.isArray(orders) ? orders.sort((a,b) => new Date(b.orderTime||0).getTime() - new Date(a.orderTime||0).getTime() || b.orderId - a.orderId) : []);
                              }
                            } catch {
                              toast.error("Failed to request approval");
                            } finally {
                              setIsUpdatingOrder(false);
                            }
                          }}
                          disabled={isUpdatingOrder}
                          title="Send bill to the customer's app for approval and payment"
                          style={{ padding: "0.7rem 1rem", borderRadius: 12, background: "rgba(107,94,78,0.1)", color: OW, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", cursor: "pointer", border: "1px solid rgba(107,94,78,0.2)" }}
                        >
                          {isUpdatingOrder ? "..." : "Request App Approval"}
                        </button>

                        <button 
                          onClick={async () => {
                            setIsUpdatingOrder(true);
                            try {
                              for (const o of bill.orders) {
                                await updateOrder(o.orderId, { ...o, orderStatus: "PAID" });
                              }
                              toast.success(`Direct payment settled for ${bill.user?.firstName || 'Guest'}!`);
                              const current = JSON.parse(localStorage.getItem("restroaudit.currentUser") || "{}");
                              if (current.branchId) {
                                const orders = await fetchOrdersByBranch(current.branchId);
                                setBranchOrders(Array.isArray(orders) ? orders.sort((a,b) => new Date(b.orderTime||0).getTime() - new Date(a.orderTime||0).getTime() || b.orderId - a.orderId) : []);
                              }
                            } catch {
                              toast.error("Failed to process payment");
                            } finally {
                              setIsUpdatingOrder(false);
                            }
                          }}
                          disabled={isUpdatingOrder}
                          title="Settle directly without customer app approval"
                          style={{ padding: "0.7rem 1.4rem", borderRadius: 12, background: `linear-gradient(135deg,${OW},${BA})`, color: P, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", cursor: "pointer", border: "none", boxShadow: "0 6px 16px rgba(45,58,46,0.15)" }}
                        >
                          {isUpdatingOrder ? "..." : "Settle Directly"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
