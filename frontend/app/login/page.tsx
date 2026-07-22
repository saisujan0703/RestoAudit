"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck, UserCog, ChefHat, User, Mail, Lock, ArrowRight, Leaf, Eye, EyeOff, CheckCircle2
} from "lucide-react";
import { fetchUsers, registerUser } from "@/lib/api";
import { toast } from "sonner";

/* ── palette ── */
const P  = "#F5F0E8";
const SA = "#C9B99A";
const OL = "#A8C5A0";
const SG = "#7A9E7E";
const BA = "#6B5E4E";
const OW = "#2D3A2E";

type Role = "Admin" | "Manager" | "Staff" | "Customer";

const roles: { id: Role; label: string; icon: typeof ShieldCheck; desc: string }[] = [
  { id: "Admin",    label: "Admin",    icon: ShieldCheck, desc: "Full system control" },
  { id: "Manager",  label: "Manager",  icon: UserCog,     desc: "Branch operations"  },
  { id: "Staff",    label: "Staff",    icon: ChefHat,     desc: "Table-side service" },
  { id: "Customer", label: "Guest",    icon: User,        desc: "Loyalty & history"  },
];

const demoCredentials: Record<Role, { email: string; password: string; branchId?: string }> = {
  Admin:    { email: "karurnikhil@mail.com", password: "password123" },
  Manager:  { email: "saisujan@mail.com",    password: "password123", branchId: "101" },
  Staff:    { email: "priya@mail.com",       password: "password123", branchId: "101" },
  Customer: { email: "rahul@gmail.com",      password: "pass" },
};

const roleRoutes: Record<Role, string> = {
  Admin: "/admin/dashboard", Manager: "/manager/dashboard",
  Staff: "/staff/orders",    Customer: "/customer/dashboard",
};

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignup, setIsSignup]   = useState(false);
  const [role, setRole]           = useState<Role>("Customer");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [branchId, setBranchId]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);

  const requiresBranch = role === "Manager" || role === "Staff";

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsSignup(true);
      try { localStorage.removeItem("restroaudit.currentUser"); } catch {}
    }
    if (mode === "login") setIsSignup(false);
  }, [searchParams]);

  useEffect(() => {
    if (isSignup) setRole("Customer");
  }, [isSignup]);

  useEffect(() => {
    if (!requiresBranch) setBranchId("");
  }, [requiresBranch]);

  useEffect(() => {
    if (requiresBranch) {
      try {
        const raw = localStorage.getItem("restroaudit.currentUser");
        const current = raw ? JSON.parse(raw) : null;
        if (current && current.branchId) setBranchId(String(current.branchId));
      } catch (e) {}
    }
  }, [requiresBranch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const users = await fetchUsers();
      const enteredBranchId = branchId ? Number(branchId) : null;
      if (requiresBranch && (!enteredBranchId || Number.isNaN(enteredBranchId))) {
        toast.error("Enter a valid branch ID.");
        setLoading(false);
        return;
      }

      const match = users.find((u: any) => {
        const sameEmail = u.email?.toLowerCase() === email.toLowerCase();
        const sameRole = u.userRole === role;
        const userBranchId = u?.branch?.branchId ?? u?.branchId ?? null;
        const sameBranch = !requiresBranch || Number(userBranchId) === enteredBranchId;
        return sameEmail && sameRole && sameBranch;
      });

      if (!match) {
        toast.error(requiresBranch ? "Invalid credentials or branch ID." : "Invalid credentials for this role.");
        setLoading(false);
        return;
      }

      const matchBranchId = match?.branch?.branchId ?? match?.branchId ?? null;
      const matchBranchLabel = match?.branch?.addressLine ?? (matchBranchId ? `Branch #${matchBranchId}` : null);
      localStorage.setItem("restroaudit.currentUser", JSON.stringify({
        userId: match.userId, firstName: match.firstName, lastName: match.lastName,
        email: match.email, role: match.userRole, branchId: matchBranchId, branchName: matchBranchLabel,
      }));
      toast.success(`Welcome back, ${match.firstName}!`);
      router.push(roleRoutes[role]);
    } catch { toast.error("Server error. Please try again."); setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      try { localStorage.removeItem("restroaudit.currentUser"); } catch {}
      await registerUser({ firstName, lastName, email, userRole: "Customer" });
      toast.success("Account created! Please sign in.");
      setIsSignup(false);
      setRole("Customer");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setLoading(false);
    } catch { toast.error("Registration failed."); setLoading(false); }
  };

  const fillDemo = () => {
    const creds = demoCredentials[role];
    setEmail(creds.email); setPassword(creds.password);
    if (creds.branchId) setBranchId(creds.branchId);
  };

  /* ── shared input style ── */
  const inputWrap: React.CSSProperties = {
    position: "relative", display: "flex", alignItems: "center",
    background: "rgba(255,253,248,0.65)", backdropFilter: "blur(12px)",
    border: `1px solid rgba(107,94,78,0.15)`, borderRadius: 16,
    padding: "0.95rem 1.25rem", gap: 12, transition: "all 0.3s ease",
    boxShadow: "inset 0 2px 4px rgba(255,255,255,0.4), 0 2px 8px rgba(107,94,78,0.03)"
  };
  const inputStyle: React.CSSProperties = {
    flex: 1, background: "none", border: "none", outline: "none",
    fontSize: "0.95rem", color: OW, fontFamily: "'Jost', sans-serif",
    fontWeight: 500,
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Jost', sans-serif" }}>

      {/* ══ LEFT PANEL — deep green gradient + grain ════ */}
      <div className="grain" style={{
        position: "relative", width: "45%", flexShrink: 0, overflow: "hidden",
        background: `radial-gradient(circle at 20% 30%, rgba(90,145,100,0.7) 0%, transparent 60%),
                     radial-gradient(circle at 80% 80%, rgba(122,158,126,0.55) 0%, transparent 60%),
                     radial-gradient(circle at 50% 50%, rgba(168,197,160,0.2) 0%, transparent 50%),
                     #2D3A2E`,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "4rem",
      }} >
        {/* botanical grid & sharp diagonal overlay */}
        <div className="pattern-diagonal-light" style={{ position: "absolute", inset: 0, opacity: 0.7, zIndex: 0 }} />
        <div className="pattern-grid" style={{ position: "absolute", inset: 0, opacity: 0.1, zIndex: 0 }} />

        {/* logo */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(168,197,160,0.15)", border: "1px solid rgba(168,197,160,0.25)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>
            <Leaf size={22} color={OL} />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, color: P, letterSpacing: "0.02em" }}>Restro Audit</span>
        </div>

        {/* headline */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} 
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 5vw, 4.5rem)", fontWeight: 400, color: P, lineHeight: 1.05, margin: "0 0 1.5rem", letterSpacing: "-0.02em" }}>
            Fine dining,<br />
            <em className="gradient-clip-text" style={{ backgroundImage: `linear-gradient(135deg,${OL},${SA})`, fontStyle: "italic" }}>brilliantly</em><br />
            managed.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
             style={{ fontSize: "1rem", color: "rgba(245,240,232,0.65)", lineHeight: 1.7, maxWidth: 380, fontWeight: 300 }}>
            An elegant, seamless operations system designed to elevate every aspect of your establishment.
          </motion.p>

          {/* feature pills */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: "3rem" }}>
            {[
              { icon: CheckCircle2, text: "Real-time Stock" },
              { icon: CheckCircle2, text: "Loyalty Points" },
              { icon: CheckCircle2, text: "Audit Trail" }
            ].map(tag => (
              <span key={tag.text} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1.25rem", borderRadius: 100, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                background: "rgba(168,197,160,0.1)", border: "1px solid rgba(168,197,160,0.2)", color: OL, backdropFilter: "blur(10px)" }}>
                <tag.icon size={13} color={OL} />
                {tag.text}
              </span>
            ))}
          </motion.div>
        </div>

        {/* bottom credit */}
        <div style={{ position: "relative", zIndex: 1, fontSize: "0.75rem", color: "rgba(245,240,232,0.3)", letterSpacing: "0.2em", fontWeight: 500, textTransform: "uppercase" }}>
          DBMS Mini Project · SRM IST
        </div>
      </div>

      {/* ══ RIGHT PANEL — parchment + grain ════════════ */}
      <div className="grain" style={{
        flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        overflowY: "auto",
        background: `radial-gradient(circle at 85% 15%, rgba(201,185,154,0.45) 0%, transparent 55%),
                     radial-gradient(circle at 15% 85%, rgba(168,197,160,0.25) 0%, transparent 50%),
                     #F5F0E8`,
        padding: "4rem 2rem",
      }}>
        <div className="pattern-diagonal" style={{ position: "absolute", inset: 0, opacity: 0.8, zIndex: 0 }} />
        <div className="pattern-dots" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480 }}>

          {/* back link */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: "3rem", fontSize: "0.85rem", fontWeight: 600, color: BA, textDecoration: "none", opacity: 0.6, transition: "opacity 0.2s" }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "0.6")}>
            ← Return Home
          </Link>

          <AnimatePresence mode="wait">
            <motion.div key={isSignup ? "signup" : "login"} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              {!isSignup ? (
                /* ── LOGIN ── */
                <div className="glass-card" style={{ padding: "3rem", borderRadius: 32 }}>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.8rem", fontWeight: 500, color: OW, margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>Welcome back</h2>
                  <p style={{ fontSize: "0.95rem", color: BA, marginBottom: "2.5rem", fontWeight: 400 }}>Select your designation to proceed.</p>

                  {/* Role tabs */}
                  <div style={{ display: "flex", gap: 8, marginBottom: "2.5rem", background: "rgba(107,94,78,0.06)", padding: "0.35rem", borderRadius: 20 }}>
                    {roles.map(r => {
                      const active = role === r.id;
                      return (
                        <motion.button key={r.id} whileTap={{ scale: 0.95 }} onClick={() => setRole(r.id)}
                          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "0.85rem 0.25rem", borderRadius: 16, border: "none", cursor: "pointer", transition: "all 0.3s ease",
                            background: active ? `linear-gradient(135deg,${OW},${BA})` : "transparent",
                            boxShadow: active ? "0 4px 12px rgba(45,58,46,0.2)" : "none",
                          }}>
                          <r.icon size={18} color={active ? SA : BA} style={{ opacity: active ? 1 : 0.6 }} />
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", color: active ? P : BA, opacity: active ? 1 : 0.7 }}>{r.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* email */}
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 10, marginLeft: 4 }}>Email Address</label>
                      <div style={inputWrap}>
                        <Mail size={16} color={BA} style={{ opacity: 0.5, flexShrink: 0 }} />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={demoCredentials[role].email}
                          style={inputStyle} />
                      </div>
                    </div>

                    {/* password */}
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 10, marginLeft: 4 }}>Password</label>
                      <div style={inputWrap}>
                        <Lock size={16} color={BA} style={{ opacity: 0.5, flexShrink: 0 }} />
                        <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                          style={inputStyle} />
                        <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: BA, opacity: 0.5 }}>
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {requiresBranch && (
                      <div>
                        <label style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 10, marginLeft: 4 }}>Branch ID</label>
                        <div style={inputWrap}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: SG, flexShrink: 0 }}>#</span>
                          <input
                            type="number"
                            min="1"
                            value={branchId}
                            onChange={e => setBranchId(e.target.value)}
                            placeholder="Enter branch ID"
                            style={inputStyle}
                            required={requiresBranch}
                          />
                        </div>
                      </div>
                    )}

                    {/* demo credentials display */}
                    <div style={{ marginTop: "-0.2rem", padding: "0.75rem", background: "rgba(122,158,126,0.1)", borderRadius: 12, border: "1px dashed rgba(122,158,126,0.3)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: SG, marginBottom: 2 }}>Demo Access</div>
                        <div style={{ fontSize: "0.85rem", color: OW, fontWeight: 500 }}>{demoCredentials[role].email}</div>
                      </div>
                      <button type="button" onClick={fillDemo}
                        style={{ background: `linear-gradient(135deg,${SG},${OL})`, border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, color: P, padding: "0.4rem 0.8rem", borderRadius: 8, transition: "transform 0.2s", boxShadow: "0 2px 8px rgba(122,158,126,0.3)" }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                        Auto-fill
                      </button>
                    </div>

                    {/* submit */}
                    <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}
                      style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        background: `linear-gradient(135deg,${OW},${BA})`, color: P, padding: "1.1rem", borderRadius: 16,
                        fontSize: "0.95rem", fontWeight: 600, border: "none", cursor: "pointer",
                        boxShadow: "0 8px 24px rgba(45,58,46,0.25)", opacity: loading ? 0.7 : 1, transition: "box-shadow 0.3s ease" }}>
                      {loading ? "Authenticating…" : `Enter as ${roles.find(r => r.id === role)?.label}`}
                      {!loading && <ArrowRight size={16} color={SA} />}
                    </motion.button>
                  </form>

                  <div style={{ marginTop: "2.5rem", textAlign: "center", borderTop: "1px solid rgba(107,94,78,0.1)", paddingTop: "1.5rem" }}>
                    <p style={{ fontSize: "0.85rem", color: BA, margin: 0 }}>
                      New to the experience?{" "}
                      <button onClick={() => setIsSignup(true)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, color: OW, textDecoration: "underline", textDecorationColor: SG, textUnderlineOffset: 4 }}>
                        Register as Guest
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                /* ── SIGNUP ── */
                <div className="glass-card" style={{ padding: "3rem", borderRadius: 32 }}>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.8rem", fontWeight: 500, color: OW, margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>Become a Guest</h2>
                  <p style={{ fontSize: "0.95rem", color: BA, marginBottom: "2.5rem", fontWeight: 400 }}>Join our exclusive dining registry.</p>

                  <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                      {[{ label: "First Name", val: firstName, set: setFirstName }, { label: "Last Name", val: lastName, set: setLastName }].map(f => (
                        <div key={f.label}>
                          <label style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 10, marginLeft: 4 }}>{f.label}</label>
                          <div style={inputWrap}>
                            <input type="text" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.label} required style={inputStyle} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 10, marginLeft: 4 }}>Email Address</label>
                      <div style={inputWrap}>
                        <Mail size={16} color={BA} style={{ opacity: 0.5 }} />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: BA, display: "block", marginBottom: 10, marginLeft: 4 }}>Secure Password</label>
                      <div style={inputWrap}>
                        <Lock size={16} color={BA} style={{ opacity: 0.5 }} />
                        <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
                        <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: BA, opacity: 0.5 }}>
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}
                      style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        background: `linear-gradient(135deg,${OW},${BA})`, color: P, padding: "1.1rem", borderRadius: 16,
                        fontSize: "0.95rem", fontWeight: 600, border: "none", cursor: "pointer",
                        boxShadow: "0 8px 24px rgba(45,58,46,0.25)", opacity: loading ? 0.7 : 1, transition: "box-shadow 0.3s ease" }}>
                      {loading ? "Registering…" : "Complete Registration"}
                      {!loading && <ArrowRight size={16} color={SA} />}
                    </motion.button>
                  </form>

                  <div style={{ marginTop: "2.5rem", textAlign: "center", borderTop: "1px solid rgba(107,94,78,0.1)", paddingTop: "1.5rem" }}>
                    <p style={{ fontSize: "0.85rem", color: BA, margin: 0 }}>
                      Already registered?{" "}
                      <button onClick={() => setIsSignup(false)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, color: OW, textDecoration: "underline", textDecorationColor: SG, textUnderlineOffset: 4 }}>
                        Sign In Here
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
