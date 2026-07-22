"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, LogOut, Bell, ChevronRight, ChefHat, Activity } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

const P  = "#F5F0E8";
const SA = "#C9B99A";
const BA = "#6B5E4E";
const OW = "#2D3A2E";

const sidebarLinks = [
  { href: "/staff/orders",      label: "Place Order", icon: ShoppingBag },
  { href: "/staff/live-orders", label: "Live Orders", icon: Activity },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const branchLabel = user?.branchName ?? user?.branch?.addressLine ?? (user?.branchId ?? user?.branch?.branchId ? `Branch #${user?.branchId ?? user?.branch?.branchId}` : null);

  useEffect(() => {
    const raw = localStorage.getItem("restroaudit.currentUser");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.userRole !== "Staff" && parsed.role !== "Staff") {
        window.location.href = "/login";
        return;
      }
      setUser(parsed);
    } else {
      window.location.href = "/login";
    }
  }, []);

  const crumbs = pathname.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1));

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Jost', sans-serif", background: "transparent" }}>

      {/* ═══ SIDEBAR — Bark warm brown ═══ */}
      <aside className="grain" style={{
        position: "fixed", left: 0, top: 0, zIndex: 40, width: 260, height: "100vh",
        display: "flex", flexDirection: "column",
        background: `radial-gradient(circle at 30% 25%, rgba(140,110,80,0.65) 0%, transparent 55%),
                     radial-gradient(circle at 80% 80%, rgba(107,94,78,0.5) 0%, transparent 55%),
                     #3D2E22`,
        borderRight: "1px solid rgba(245,240,232,0.06)",
      }}>
        <div className="pattern-diagonal-light" style={{ position: "absolute", inset: 0, opacity: 0.6, pointerEvents: "none", zIndex: 0 }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, padding: "2rem 1.75rem 1.5rem", borderBottom: "1px solid rgba(245,240,232,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(245,240,232,0.1)", border: "1px solid rgba(245,240,232,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChefHat size={18} color={SA} />
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: P, lineHeight: 1.2 }}>Restro Audit</div>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: SA, opacity: 0.7 }}>Staff Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "1.5rem 1rem", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(245,240,232,0.25)", padding: "0 0.75rem", marginBottom: "0.75rem" }}>Service</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sidebarLinks.map(link => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "0.8rem 0.75rem", borderRadius: 14,
                    transition: "all 0.2s ease",
                    background: active ? "rgba(245,240,232,0.1)" : "transparent",
                    color: active ? P : "rgba(245,240,232,0.42)",
                    position: "relative",
                  }}>
                    {active && (
                      <motion.div layoutId="stf-active" style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: 4, background: SA }} />
                    )}
                    <link.icon size={16} />
                    <span style={{ fontSize: "0.875rem", fontWeight: active ? 700 : 500, marginLeft: 4 }}>{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Shift info card */}
          <div style={{ marginTop: "2.5rem", padding: "1rem 1.25rem", borderRadius: 16, background: "rgba(245,240,232,0.06)", border: "1px solid rgba(245,240,232,0.1)" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,240,232,0.35)", marginBottom: 6 }}>Current Shift</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, color: SA, lineHeight: 1 }}>
              {new Date().getHours() < 15 ? "Lunch" : "Dinner"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(245,240,232,0.4)", marginTop: 4 }}>Service in progress</div>
          </div>
        </nav>

        {/* User */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(245,240,232,0.07)", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 0.75rem", borderRadius: 14, background: "rgba(245,240,232,0.05)", marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg,${BA},#8A7060)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: P, flexShrink: 0 }}>
              {user?.firstName?.substring(0, 2).toUpperCase() || "ST"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: P, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <div style={{ fontSize: "0.62rem", color: "rgba(245,240,232,0.35)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Staff</div>
                {branchLabel && (
                  <div style={{ fontSize: "0.62rem", fontWeight: 700, color: SA, textTransform: "uppercase", letterSpacing: "0.14em" }}>
                    {branchLabel}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 0.75rem", borderRadius: 12, color: "rgba(245,240,232,0.3)", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s" }}
              onMouseOver={e => (e.currentTarget.style.color = "rgba(245,240,232,0.65)")}
              onMouseOut={e => (e.currentTarget.style.color = "rgba(245,240,232,0.3)")}>
              <LogOut size={14} /> Sign Out
            </div>
          </Link>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div style={{ flex: 1, marginLeft: 260, display: "flex", flexDirection: "column" }}>
        <header style={{
          position: "sticky", top: 0, zIndex: 30, height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 2rem",
          background: "rgba(245,240,232,0.88)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(107,94,78,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {crumbs.map((seg, i, arr) => (
              <span key={seg} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: i === arr.length - 1 ? 700 : 500, letterSpacing: "0.1em", textTransform: "uppercase", color: i === arr.length - 1 ? BA : "rgba(107,94,78,0.45)" }}>{seg}</span>
                {i < arr.length - 1 && <ChevronRight size={12} color="rgba(107,94,78,0.3)" />}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(107,94,78,0.15)", background: "rgba(255,253,248,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <Bell size={16} color={OW} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.4rem 0.75rem", borderRadius: 100, border: "1px solid rgba(107,94,78,0.15)", background: "rgba(255,253,248,0.7)", cursor: "pointer" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${BA},#8A7060)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: P }}>
                    {user?.firstName?.substring(0, 2).toUpperCase() || "ST"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: OW }}>{user?.firstName}</span>
                    <span style={{ fontSize: "0.62rem", color: "rgba(107,94,78,0.55)" }}>Staff</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl p-2 w-44" style={{ background: "rgba(255,253,248,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(107,94,78,0.12)" }}>
                <DropdownMenuSeparator style={{ background: "rgba(107,94,78,0.08)" }} />
                <Link href="/login"><DropdownMenuItem className="rounded-xl text-sm" style={{ color: "var(--status-bad)" }}>Sign Out</DropdownMenuItem></Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Greeting */}
        <div style={{ padding: "1.25rem 2rem 1.25rem", background: "linear-gradient(to bottom, #F5F0E8 0%, rgba(245,240,232,0) 100%)", display: "flex", alignItems: "center", minHeight: 56 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 400, lineHeight: 1.2, color: "rgba(107,94,78,0.6)", margin: 0 }}>
            {getGreeting()}, <strong style={{ color: OW }}>{user?.firstName || "Staff"}</strong>.
          </p>
        </div>

        <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ flex: 1, padding: "1.5rem 2rem 3rem" }}>
          {children}
        </motion.main>
      </div>
    </div>
  );
}
