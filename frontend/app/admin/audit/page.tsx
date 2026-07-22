"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Search, Database, Clock, Activity, FileText } from "lucide-react";
import { fetchAuditLogs } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const up = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } };

const P  = "#F5F0E8";
const SG = "#7A9E7E";
const BA = "#6B5E4E";
const OW = "#2D3A2E";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadLogs = () => {
    fetchAuditLogs(500)
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => {
    const s = searchTerm.toLowerCase();
    return (
      (log.tableName && log.tableName.toLowerCase().includes(s)) ||
      (log.actionType && log.actionType.toLowerCase().includes(s)) ||
      (log.details && log.details.toLowerCase().includes(s))
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" style={{ background: "var(--bg-elevated)" }} />
        <Skeleton className="h-[600px] rounded-3xl" style={{ background: "var(--bg-elevated)" }} />
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-6xl mx-auto space-y-8" style={{ fontFamily: "'Jost', sans-serif" }}>
      
      {/* Header */}
      <motion.div variants={up} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} color={SG} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: SG }}>Security & Logging</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.8rem", fontWeight: 500, color: OW, margin: 0, lineHeight: 1.1 }}>
            System <em style={{ color: SG }}>Audit Trail</em>
          </h1>
          <p className="mt-3 text-sm" style={{ color: BA, maxWidth: 500 }}>
            Immutable ledger of all critical database operations, including authentication events, inventory updates, and transactional changes.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" color={OW} />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by table, action, or details..."
            style={{
              width: "100%", padding: "0.8rem 1rem 0.8rem 2.8rem", borderRadius: 100,
              border: "1px solid rgba(107,94,78,0.2)", background: "rgba(255,253,248,0.6)",
              fontSize: "0.85rem", color: OW, outline: "none",
            }}
          />
        </div>
      </motion.div>

      {/* Stats/Summary Row */}
      <motion.div variants={up} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events Captured", val: logs.length, icon: Database },
          { label: "Recent 24 Hours", val: logs.filter(l => new Date().getTime() - new Date(l.actionTimestamp).getTime() < 86400000).length, icon: Clock },
          { label: "Updates", val: logs.filter(l => l.actionType === "UPDATE").length, icon: Activity },
          { label: "Inserts", val: logs.filter(l => l.actionType === "INSERT").length, icon: FileText },
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl flex items-center gap-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(122,158,126,0.12)" }}>
              <stat.icon size={18} color={SG} />
            </div>
            <div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: OW, lineHeight: 1 }}>{stat.val}</div>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BA, marginTop: 4 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Log List */}
      <motion.div variants={up} className="rounded-2xl border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(107,94,78,0.03)" }}>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: 700, color: BA, textTransform: "uppercase", letterSpacing: "0.1em" }}>Timestamp</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: 700, color: BA, textTransform: "uppercase", letterSpacing: "0.1em" }}>Action</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: 700, color: BA, textTransform: "uppercase", letterSpacing: "0.1em" }}>Target Table</th>
                <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: 700, color: BA, textTransform: "uppercase", letterSpacing: "0.1em" }}>Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" color={OW} />
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontStyle: "italic", color: BA }}>No audit events found.</p>
                  </td>
                </tr>
              ) : filteredLogs.map((log) => {
                const isInsert = log.actionType === "INSERT";
                const isUpdate = log.actionType === "UPDATE";
                const badgeColor = isInsert ? "var(--status-good)" : isUpdate ? SG : "var(--status-bad)";
                const badgeBg = isInsert ? "var(--status-good-bg)" : isUpdate ? "rgba(122,158,126,0.1)" : "var(--status-bad-bg)";

                return (
                  <tr key={log.auditId} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.8rem", color: BA }}>
                      {new Date(log.actionTimestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" })}
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span style={{ 
                        padding: "0.3rem 0.6rem", borderRadius: 6, fontSize: "0.65rem", 
                        fontWeight: 700, letterSpacing: "0.1em", color: badgeColor, background: badgeBg 
                      }}>
                        {log.actionType}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: OW }}>
                      {log.tableName}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", color: OW, maxWidth: 400 }}>
                      <div className="truncate" title={log.details || `Record ID modified: ${log.recordId}`}>
                        {log.details || `Record ID modified: ${log.recordId}`}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

    </motion.div>
  );
}
