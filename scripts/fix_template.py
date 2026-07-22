with open('frontend/app/staff/orders/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Lines 308 to 390 (0-indexed: 307 to 389) are the IIFE block
# Replace with clean groupedTableList.map()
replacement = '''            ) : groupedTableList.map(({ name, userId, orders: custOrders }) => {
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
                <div key={userId} style={{ borderRadius: 16, border: "1.5px solid " + borderColor, background: bgColor, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(107,94,78,0.08)", background: "rgba(45,58,46,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,rgba(168,197,160,0.33),rgba(201,185,154,0.4))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "1rem", color: "#2D3A2E" }}>
                        {name[0]?.toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#2D3A2E" }}>{name}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {editingTable === tableKey ? (
                        <input autoFocus value={editTableVal} onChange={e => setEditTableVal(e.target.value)}
                          onBlur={() => { setTableNumbers(prev => ({ ...prev, [tableKey]: editTableVal })); setEditingTable(null); }}
                          onKeyDown={e => { if (e.key === "Enter") { setTableNumbers(prev => ({ ...prev, [tableKey]: editTableVal })); setEditingTable(null); } }}
                          style={{ width: 52, padding: "0.25rem 0.5rem", borderRadius: 8, border: "1px solid #7A9E7E", fontSize: "0.78rem", outline: "none", textAlign: "center", fontFamily: "'Jost',sans-serif" }} />
                      ) : (
                        <button onClick={() => { setEditingTable(tableKey); setEditTableVal(tableNo); }}
                          style={{ background: tableBgBtn, border: tableBorderBtn, borderRadius: 8, padding: "0.25rem 0.6rem", fontSize: "0.72rem", fontWeight: 700, color: tableNo ? "#7A9E7E" : "#6B5E4E", cursor: "pointer" }}>
                          {"Table" + (tableNo ? " " + tableNo : " #")}
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: "0.5rem 1rem", display: "flex", flexDirection: "column", gap: 6 }}>
                    {allDetails.map((d, idx) => {
                      const itemBadgeBg = d.orderStatus === "Ready" ? "rgba(122,158,126,0.15)" : "rgba(107,94,78,0.08)";
                      const itemBadgeBorder = "1px solid " + (d.orderStatus === "Ready" ? "rgba(122,158,126,0.3)" : "rgba(107,94,78,0.15)");
                      const itemBadgeColor = d.orderStatus === "Ready" ? "#7A9E7E" : "#6B5E4E";
                      return (
                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid rgba(107,94,78,0.06)" }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#2D3A2E" }}>{d.menuItem?.itemName ?? "Item"}</span>
                            <span style={{ fontSize: "0.72rem", color: "#6B5E4E", marginLeft: 6 }}>x{d.quantity}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.95rem", color: "#2D3A2E" }}>{"Rs." + Number(d.subtotal || 0).toFixed(0)}</span>
                            <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", padding: "0.2rem 0.55rem", borderRadius: 100, background: itemBadgeBg, color: itemBadgeColor, border: itemBadgeBorder }}>
                              {d.orderStatus === "Ready" ? "READY" : "PENDING"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: "0.6rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(107,94,78,0.08)", background: "rgba(245,240,232,0.4)" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", fontWeight: 700, color: "#2D3A2E" }}>{"Rs." + grandTotal.toFixed(0)}</div>
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
                        style={{ padding: "0.45rem 1rem", borderRadius: 10, background: "linear-gradient(135deg,#2D3A2E,#6B5E4E)", color: "#F5F0E8", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(45,58,46,0.25)" }}>
                        Generate Final Bill
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
'''

new_lines = lines[:307] + [replacement] + lines[390:]
with open('frontend/app/staff/orders/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('Done, total lines:', len(new_lines))
