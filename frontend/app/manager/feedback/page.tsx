"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Search, MessageSquare, CheckCircle, Clock, AlertCircle, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchFeedback, fetchComplaintLogs } from "@/lib/api";

const OW = "#2D3A2E";
const SG = "#7A9E7E";
const SA = "#C9B99A";
const BA = "#6B5E4E";
const P  = "#F5F0E8";

function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} fill={i <= rating ? "#C9B99A" : "none"} color={i <= rating ? "#C9B99A" : "#C9B99A"} opacity={i <= rating ? 1 : 0.3} />
      ))}
    </div>
  );
}

export default function ManagerFeedbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"flagged"|"low">("all");

  useEffect(() => {
    (async () => {
      try {
        const [fb, cl] = await Promise.all([fetchFeedback(), fetchComplaintLogs()]);
        setFeedbacks(Array.isArray(fb) ? fb : []);
        setComplaints(Array.isArray(cl) ? cl : []);
      } catch { toast.error("Failed to load feedback data."); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const complaintFeedbackIds = new Set(complaints.map((c: any) => c?.feedback?.feedbackId ?? c?.feedbackId));

  const enriched = feedbacks.map((f: any) => ({
    ...f,
    id: f?.feedbackId,
    rating: f?.ratingScore ?? 0,
    comment: f?.textComments ?? "",
    userName: f?.user ? `${f.user.firstName ?? ""} ${f.user.lastName ?? ""}`.trim() : "Guest",
    itemName: f?.menuItem?.itemName ?? "Unknown Item",
    orderId: f?.orderId ?? "—",
    isFlagged: complaintFeedbackIds.has(f?.feedbackId),
  }));

  const filtered = enriched.filter(f => {
    const matchSearch = f.userName.toLowerCase().includes(search.toLowerCase()) ||
      f.itemName.toLowerCase().includes(search.toLowerCase()) ||
      String(f.orderId).includes(search);
    const matchFilter = filter === "all" ? true : filter === "flagged" ? f.isFlagged : f.rating <= 2;
    return matchSearch && matchFilter;
  });

  const avgRating = enriched.length ? (enriched.reduce((s, f) => s + f.rating, 0) / enriched.length).toFixed(1) : "—";
  const lowCount = enriched.filter(f => f.rating <= 2).length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "'Jost', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: BA, marginBottom: 6 }}>BRANCH OPERATIONS</p>
        <h1 style={{ fontSize: "2rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: OW, margin: 0 }}>
          Audit <em style={{ color: SG }}>Review</em>
        </h1>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Feedbacks", value: enriched.length, icon: <MessageSquare size={16} color={SG} /> },
          { label: "Avg Rating", value: avgRating + " ★", icon: <Star size={16} color={SA} /> },
          { label: "Low Ratings (≤2)", value: lowCount, icon: <AlertCircle size={16} color="#C0392B" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ padding: "1.25rem 1.5rem", borderRadius: 20, background: "#FFFDF8", border: "1px solid rgba(107,94,78,0.10)", boxShadow: "0 2px 12px rgba(107,94,78,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              {icon}
              <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA }}>{label}</span>
            </div>
            <div style={{ fontSize: "1.8rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: OW }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: BA }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer or dish..."
            style={{ width: "100%", paddingLeft: 34, padding: "0.7rem 1rem 0.7rem 34px", borderRadius: 12, border: "1px solid rgba(107,94,78,0.15)", background: "#FFFDF8", fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: OW, outline: "none", boxSizing: "border-box" }} />
        </div>
        {(["all","flagged","low"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "0.7rem 1.2rem", borderRadius: 100, border: `1px solid ${filter === f ? SG : "rgba(107,94,78,0.15)"}`, background: filter === f ? `${SG}18` : "#FFFDF8", color: filter === f ? SG : BA, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
            {f === "all" ? "All" : f === "flagged" ? "Flagged" : "Low Ratings"}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" style={{ background: "rgba(107,94,78,0.07)" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: BA }}>
          <Inbox size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0 }}>No feedback found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ padding: "1.25rem 1.5rem", borderRadius: 18, background: "#FFFDF8", border: `1px solid ${f.isFlagged ? "rgba(192,57,43,0.2)" : "rgba(107,94,78,0.08)"}`, boxShadow: "0 2px 8px rgba(107,94,78,0.04)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: OW, fontSize: "1rem" }}>{f.userName}</span>
                    {f.isFlagged && (
                      <span style={{ padding: "0.2rem 0.6rem", borderRadius: 100, background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)", color: "#C0392B", fontSize: "0.6rem", fontWeight: 700 }}>FLAGGED</span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: BA, marginBottom: 6 }}>
                    {f.itemName} · Order #{f.orderId}
                  </div>
                  <StarRow rating={f.rating} />
                  {f.comment && (
                    <p style={{ margin: "8px 0 0", fontSize: "0.82rem", color: BA, fontStyle: "italic", lineHeight: 1.5 }}>"{f.comment}"</p>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.5rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: f.rating <= 2 ? "#C0392B" : f.rating >= 4 ? SG : SA }}>
                    {f.rating}/5
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
