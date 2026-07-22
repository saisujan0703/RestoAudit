"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, MessageSquare, Package, ShoppingBag, Bell, LogOut, ShieldCheck, Leaf, ChevronRight, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

const P  = "#F5F0E8";
const OL = "#A8C5A0";
const SG = "#7A9E7E";
const SA = "#C9B99A";
const OW = "#2D3A2E";

const sidebarLinks = [
  { href: "/manager/dashboard", label: "Intelligence",  icon: LayoutDashboard, accent: OL },
  { href: "/manager/finances",  label: "Finances",      icon: TrendingUp,      accent: SG },
  { href: "/manager/staff",     label: "Human Capital", icon: Users,           accent: SA },
  { href: "/manager/inventory", label: "Stock Control", icon: Package,         accent: SA },
  { href: "/manager/orders",    label: "Operations",    icon: ShoppingBag,     accent: OL },
  { href: "/manager/guests",    label: "Guest Lookup",  icon: Users,           accent: SA },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const branchLabel = user?.branchName ?? user?.branch?.addressLine ?? (user?.branchId ?? user?.branch?.branchId ? `Branch #${user?.branchId ?? user?.branch?.branchId}` : null);

  useEffect(() => {
    const raw = localStorage.getItem("restroaudit.currentUser");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.userRole !== "Manager" && parsed.role !== "Manager") {
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

      {/* ═══ SIDEBAR ═══ */}
      <aside className="grain" style={{
        position: "fixed", left: 0, top: 0, zIndex: 40, width: 260, height: "100vh",
        display: "flex", flexDirection: "column",
        background: `radial-gradient(circle at 30% 20%, rgba(90,140,95,0.55) 0%, transparent 55%),
                     radial-gradient(circle at 80% 80%, rgba(122,158,126,0.35) 0%, transparent 55%),
                     ${OW}`,
        borderRight: "1px solid rgba(168,197,160,0.08)",
      }}>
        {/* diagonal texture */}
        <div className="pattern-diagonal-light" style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none", zIndex: 0 }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, padding: "2rem 1.75rem 1.5rem", borderBottom: "1px solid rgba(245,240,232,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(168,197,160,0.15)", border: "1px solid rgba(168,197,160,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={18} color={OL} />
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: P, lineHeight: 1.2 }}>Restro Audit</div>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: OL, opacity: 0.7 }}>Branch Manager</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "1.5rem 1rem", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(245,240,232,0.3)", padding: "0 0.75rem", marginBottom: "0.75rem" }}>Operations</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sidebarLinks.map(link => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "0.7rem 0.75rem", borderRadius: 14,
                    transition: "all 0.2s ease",
                    background: active ? "rgba(168,197,160,0.15)" : "transparent",
                    color: active ? OL : "rgba(245,240,232,0.45)",
                    position: "relative",
                  }}>
                    {active && (
                      <motion.div layoutId="mgr-active" style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: 4, background: OL }} />
                    )}
                    <link.icon size={16} />
                    <span style={{ fontSize: "0.875rem", fontWeight: active ? 600 : 500, marginLeft: 4 }}>{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User + signout */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(245,240,232,0.07)", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 0.75rem", borderRadius: 14, background: "rgba(245,240,232,0.05)", marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg,${SG},${OL})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: OW, flexShrink: 0 }}>
              {user?.firstName?.substring(0, 2).toUpperCase() || "MG"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: P, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: "0.65rem", color: "rgba(245,240,232,0.4)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Manager</div>
            </div>
          </div>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 0.75rem", borderRadius: 12, color: "rgba(245,240,232,0.3)", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s" }}
              onMouseOver={e => (e.currentTarget.style.color = "rgba(245,240,232,0.7)")}
              onMouseOut={e => (e.currentTarget.style.color = "rgba(245,240,232,0.3)")}>
              <LogOut size={14} /> Sign Out
            </div>
          </Link>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div style={{ flex: 1, marginLeft: 260, display: "flex", flexDirection: "column" }}>

        {/* Header */}
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
                <span style={{ fontSize: "0.75rem", fontWeight: i === arr.length - 1 ? 700 : 500, letterSpacing: "0.1em", textTransform: "uppercase", color: i === arr.length - 1 ? OW : "rgba(107,94,78,0.5)" }}>{seg}</span>
                {i < arr.length - 1 && <ChevronRight size={12} color="rgba(107,94,78,0.35)" />}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ padding: "0.3rem 1rem", borderRadius: 100, fontSize: "0.72rem", fontWeight: 600, background: "rgba(122,158,126,0.12)", color: SG, border: "1px solid rgba(122,158,126,0.2)" }}>
              {branchLabel ?? "Branch Unset"}
            </span>
            <button style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(107,94,78,0.15)", background: "rgba(255,253,248,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <Bell size={16} color={OW} />
              <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: SG, border: "1.5px solid #F5F0E8" }} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.4rem 0.75rem", borderRadius: 100, border: "1px solid rgba(107,94,78,0.15)", background: "rgba(255,253,248,0.7)", cursor: "pointer" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${OW},#4A6B4E)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: P }}>
                    {user?.firstName?.substring(0, 2).toUpperCase() || "MG"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: OW }}>{user?.firstName}</span>
                    <span style={{ fontSize: "0.62rem", color: "rgba(107,94,78,0.6)", letterSpacing: "0.1em" }}>Manager</span>
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

        <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ flex: 1, padding: "0.5rem 2rem 1.5rem" }}>
          {children}
        </motion.main>
      </div>
    </div>
  );
}
