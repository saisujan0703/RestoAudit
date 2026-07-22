"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Home, Clock, LogOut, Star } from "lucide-react";
import { fetchUsers } from "@/lib/api";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const P  = "#F5F0E8";
const SA = "#C9B99A";
const OL = "#A8C5A0";
const SG = "#7A9E7E";
const BA = "#6B5E4E";
const OW = "#2D3A2E";

const navLinks = [
  { href: "/customer/dashboard", label: "Home",    icon: Home  },
  { href: "/customer/history",   label: "History", icon: Clock },
];

const STORAGE_KEY = "restroaudit.currentUser";

type CurrentUser = {
  userId?: number; firstName?: string; lastName?: string;
  email?: string; role?: string; loyaltyPoints?: number;
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function CustomerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed: CurrentUser = JSON.parse(raw);
        setCurrentUser(parsed);
        if (typeof parsed?.userId === "number" || !parsed?.email) return;
        const users = await fetchUsers();
        const match = (Array.isArray(users) ? users : []).find(
          (u: any) => typeof u?.email === "string" && u.email.toLowerCase() === parsed.email!.toLowerCase()
        );
        if (typeof match?.userId === "number") {
          const updated = { ...parsed, userId: match.userId };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          setCurrentUser(updated);
        }
      } catch {}
    };
    load();
  }, []);

  const displayName = useMemo(() =>
    `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() || "Guest",
    [currentUser?.firstName, currentUser?.lastName]
  );
  const initials = useMemo(() => {
    const f = (currentUser?.firstName ?? "").trim()[0] ?? "";
    const l = (currentUser?.lastName  ?? "").trim()[0] ?? "";
    return `${f}${l}`.toUpperCase() || "GU";
  }, [currentUser?.firstName, currentUser?.lastName]);

  const pts       = currentUser?.loyaltyPoints || 0;
  const tier      = pts > 1000 ? "Gold" : pts > 500 ? "Silver" : "Bronze";
  const tierColor = tier === "Gold" ? "#B5860D" : tier === "Silver" ? SG : BA;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Jost', sans-serif", background: "transparent" }}>

      {/* ══ SEAMLESS TOP NAV ══════════════════════════════ */}
      {/* No hard bottom border — blends straight into content */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        /* soft frosted glass — no bottom border line */
        background: "rgba(245,240,232,0.82)",
        backdropFilter: "blur(22px) saturate(1.5)",
        WebkitBackdropFilter: "blur(22px) saturate(1.5)",
        /* very faint shadow instead of border so it "floats" */
        boxShadow: "0 1px 0 rgba(107,94,78,0.08), 0 4px 24px rgba(45,58,46,0.05)",
      }}>
        {/* subtle diagonal texture inside nav */}
        <div className="pattern-diagonal" style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }} />

        {/* Main nav row */}
        <div style={{
          width: "100%", margin: "0 auto",
          padding: "0 clamp(1.25rem, 3vw, 2.25rem)", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "relative", zIndex: 1, boxSizing: "border-box"
        }}>
          {/* Brand */}
          <Link href="/customer/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: OW, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(45,58,46,0.2)" }}>
              <Leaf size={17} color={OL} />
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 600, color: OW, letterSpacing: "0.01em" }}>Restro Audit</span>
          </Link>

          {/* Pill group */}
          <div style={{ display: "flex", gap: 4, background: "rgba(107,94,78,0.07)", padding: "0.3rem", borderRadius: 100 }}>
            {navLinks.map(link => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "0.45rem 1.1rem", borderRadius: 100,
                    background: active ? P : "transparent",
                    color: active ? OW : BA,
                    boxShadow: active ? "0 2px 8px rgba(45,58,46,0.1)" : "none",
                    transition: "all 0.22s ease",
                  }}>
                    <link.icon size={14} color={active ? SG : BA} />
                    <span style={{ fontSize: "0.82rem", fontWeight: active ? 700 : 500 }}>{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.4rem 0.9rem 0.4rem 0.4rem", borderRadius: 100, border: "1px solid rgba(107,94,78,0.15)", background: "rgba(255,253,248,0.7)", cursor: "pointer" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${SA},${OL})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, color: OW }}>
                  {initials}
                </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: OW }}>{displayName}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.62rem", fontWeight: 700, color: tierColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          <Star size={9} fill={tierColor} color={tierColor} /> {tier}
                        </span>
                      </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-2 w-52" style={{ background: "rgba(255,253,248,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(107,94,78,0.12)" }}>
              <div style={{ padding: "0.75rem 1rem 0.5rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA }}>Loyalty Points</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 600, color: OW, lineHeight: 1 }}>{pts.toLocaleString()}</div>
                <div style={{ fontSize: "0.7rem", color: tierColor, fontWeight: 600 }}>{tier} Status</div>
              </div>
                {/* show branch on customer dropdown if present (helps identify location) */}
                {currentUser?.branchName && (
                  <div style={{ padding: '0.5rem 1rem 0.5rem', fontSize: 12, color: '#6b5e4e', fontWeight: 700 }}>
                    Branch: {currentUser.branchName}
                  </div>
                )}
              <DropdownMenuSeparator style={{ background: "rgba(107,94,78,0.08)" }} />
              <Link href="/login">
                <DropdownMenuItem className="rounded-xl text-sm flex items-center gap-2" style={{ color: "var(--status-bad)" }}
                  onSelect={() => { try { localStorage.removeItem(STORAGE_KEY); } catch {} }}>
                  <LogOut size={14} /> Sign Out
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Greeting sub-row — tighter, no extra bottom padding */}
        <div style={{
          width: "100%", margin: "0 auto",
          padding: "0 clamp(1.25rem, 3vw, 2.25rem) 0.55rem",
          position: "relative", zIndex: 1, boxSizing: "border-box"
        }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem", fontWeight: 400, color: "rgba(107,94,78,0.55)", margin: 0 }}>
            {getGreeting()}, <strong style={{ color: OW, fontWeight: 600 }}>{currentUser?.firstName || "Guest"}</strong> — welcome to your dining experience.
          </p>
        </div>
      </nav>

      {/* ══ CONTENT — starts immediately under nav, no gap ══ */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%", margin: "0 auto", boxSizing: "border-box",
          padding: "0.5rem clamp(1.25rem, 3vw, 2.25rem) 2rem",
        }}
      >
        {children}
      </motion.main>
    </div>
  );
}
