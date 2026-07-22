"use client";

import { useState, useEffect } from "react";
import { Loader2, Activity } from "lucide-react";
import { fetchOrdersByBranch, updateOrder } from "@/lib/api";
import { toast } from "sonner";

const P  = "#F5F0E8";
const SA = "#C9B99A";
const OL = "#A8C5A0";
const SG = "#7A9E7E";
const BA = "#6B5E4E";
const OW = "#2D3A2E";

export default function LiveOrdersPage() {
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [tableNumbers, setTableNumbers] = useState<Record<number, string>>({});
  const [editingTable, setEditingTable] = useState<number | null>(null);
  const [editTableVal, setEditTableVal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadActiveOrders = async () => {
    try {
      const raw = localStorage.getItem("restroaudit.currentUser");
      const current = raw ? JSON.parse(raw) : null;
      if (current?.branchId) {
        const orders = await fetchOrdersByBranch(current.branchId);
        if (Array.isArray(orders)) {
          setActiveOrders(orders
            .filter(o => o.orderStatus === "Pending" || o.orderStatus === "Ready")
            .sort((a,b) => new Date(b.orderTime||0).getTime() - new Date(a.orderTime||0).getTime() || b.orderId - a.orderId));
        }
      }
    } catch {
      setActiveOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActiveOrders();
    const interval = setInterval(loadActiveOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return (
    <div style={{ display: "flex", height: "60vh", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Loader2 size={28} color={SG} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: BA, fontStyle: "italic" }}>Loading active tables…</p>
      </div>
    </div>
  );

  const groupedTables: Record<string, { name: string; userId: any; orders: any[] }> = {};
  activeOrders.forEach((order: any) => {
    const uid = String(order.user?.userId ?? "unknown");
    const name = order.user ? `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() : "Guest";
    if (!groupedTables[uid]) groupedTables[uid] = { name, userId: uid, orders: [] };
    groupedTables[uid].orders.push(order);
  });
  const groupedTableList = Object.values(groupedTables).sort((a,b) => {
    const maxA = Math.max(...a.orders.map(o => new Date(o.orderTime||0).getTime() || o.orderId));
    const maxB = Math.max(...b.orders.map(o => new Date(o.orderTime||0).getTime() || o.orderId));
    return maxB - maxA;
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", fontFamily: "'Jost', sans-serif" }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 500, color: OW, margin: "0 0 1.5rem", display: "flex", alignItems: "center", gap: 10 }}>
        <Activity size={24} color={SG} /> Live Orders
      </h2>
      
      <div className="glass-card" style={{ borderRadius: 22, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(107,94,78,0.08)" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA }}>Active Tables</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: OW }}>Live orders by guest</div>
        </div>
        <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: 12 }}>
          {activeOrders.length === 0 ? (
            <p style={{ margin: 0, fontSize: "0.9rem", color: BA, fontStyle: "italic", textAlign: "center", padding: "2rem 1rem" }}>No active tables right now.</p>
          ) : groupedTableList.map(({ name, userId, orders: custOrders }) => {
            const allDetails = custOrders.flatMap((o) => (Array.isArray(o.orderDetails) ? o.orderDetails.map((d) => ({ ...d, orderId: o.orderId ?? o.order_id, orderStatus: o.orderStatus })) : []));
            const grandTotal = allDetails.reduce((s, d) => s + Number(d.subtotal || 0), 0);
            const hasReady = custOrders.some((o) => o.orderStatus === "Ready");
            const tableKey = custOrders[0]?.orderId ?? userId;
            const tableNo = tableNumbers[tableKey] ?? "";
            const borderColor = hasReady ? "rgba(122,158,126,0.4)" : "rgba(107,94,78,0.1)";
            const bgColor = hasReady ? "rgba(168,197,160,0.08)" : "rgba(245,240,232,0.5)";
            const tableBorderBtn = "1px solid " + (tableNo ? "rgba(122,158,126,0.3)" : "rgba(107,94,78,0.15)");
            const tableBgBtn = tableNo ? "rgba(122,158,126,0.12)" : "rgba(107,94,78,0.07)";
            return (
              <div key={userId} style={{ borderRadius: 18, border: "1.5px solid " + borderColor, background: bgColor, overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(107,94,78,0.08)", background: "rgba(45,58,46,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,rgba(168,197,160,0.33),rgba(201,185,154,0.4))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "1.1rem", color: "#2D3A2E" }}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#2D3A2E" }}>{name}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {editingTable === tableKey ? (
                      <input autoFocus value={editTableVal} onChange={e => setEditTableVal(e.target.value)}
                        onBlur={() => { setTableNumbers(prev => ({ ...prev, [tableKey]: editTableVal })); setEditingTable(null); }}
                        onKeyDown={e => { if (e.key === "Enter") { setTableNumbers(prev => ({ ...prev, [tableKey]: editTableVal })); setEditingTable(null); } }}
                        style={{ width: 60, padding: "0.3rem 0.6rem", borderRadius: 8, border: "1px solid #7A9E7E", fontSize: "0.85rem", outline: "none", textAlign: "center", fontFamily: "'Jost',sans-serif" }} />
                    ) : (
                      <button onClick={() => { setEditingTable(tableKey); setEditTableVal(tableNo); }}
                        style={{ background: tableBgBtn, border: tableBorderBtn, borderRadius: 8, padding: "0.3rem 0.75rem", fontSize: "0.8rem", fontWeight: 700, color: tableNo ? "#7A9E7E" : "#6B5E4E", cursor: "pointer" }}>
                        {"Table" + (tableNo ? " " + tableNo : " #")}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
                  {allDetails.map((d, idx) => {
                    const itemBadgeBg = d.orderStatus === "Ready" ? "rgba(122,158,126,0.15)" : "rgba(107,94,78,0.08)";
                    const itemBadgeBorder = "1px solid " + (d.orderStatus === "Ready" ? "rgba(122,158,126,0.3)" : "rgba(107,94,78,0.15)");
                    const itemBadgeColor = d.orderStatus === "Ready" ? "#7A9E7E" : "#6B5E4E";
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(107,94,78,0.06)" }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#2D3A2E" }}>{d.menuItem?.itemName ?? "Item"}</span>
                          <span style={{ fontSize: "0.8rem", color: "#6B5E4E", marginLeft: 8 }}>x{d.quantity}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", color: "#2D3A2E" }}>{"Rs." + Number(d.subtotal || 0).toFixed(0)}</span>
                          <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", padding: "0.25rem 0.65rem", borderRadius: 100, background: itemBadgeBg, color: itemBadgeColor, border: itemBadgeBorder }}>
                            {d.orderStatus === "Ready" ? "READY" : "PENDING"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: "0.8rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(107,94,78,0.08)", background: "rgba(245,240,232,0.4)" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 700, color: "#2D3A2E" }}>{"Rs." + grandTotal.toFixed(0)}</div>
                  {hasReady && (
                    <button onClick={async () => {
                      setIsSubmitting(true);
                      try {
                        for (const o of custOrders.filter((o) => o.orderStatus === "Ready")) {
                          await updateOrder(o.orderId ?? o.order_id, { ...o, orderStatus: "COMPLETED" });
                        }
                        const msg = "Bill generated for " + name + (tableNo ? " - Table " + tableNo : "") + "!";
                        toast.success(msg);
                        loadActiveOrders();
                      } catch { toast.error("Failed to generate bill."); }
                      finally { setIsSubmitting(false); }
                    }} disabled={isSubmitting}
                      style={{ padding: "0.6rem 1.25rem", borderRadius: 12, background: "linear-gradient(135deg,#2D3A2E,#6B5E4E)", color: "#F5F0E8", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(45,58,46,0.25)" }}>
                      Generate Final Bill
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
