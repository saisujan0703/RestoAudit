"use client";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { Leaf, ArrowRight, ShieldCheck, Coins, History, MessageSquare, ChefHat, Users, BarChart3, Package, UtensilsCrossed } from "lucide-react";

const P="#F5F0E8",SA="#C9B99A",OL="#A8C5A0",SG="#7A9E7E",BA="#6B5E4E",OW="#2D3A2E";
const I:React.CSSProperties={width:"100%",maxWidth:1120,marginLeft:"auto",marginRight:"auto",paddingLeft:"2rem",paddingRight:"2rem"};

const NAV_EDGE_PADDING = "clamp(1.25rem, 3vw, 2.25rem)";
const HERO_AXIS_GAP_PX = 32;

const TICKER=["Fine Dining","Loyalty Points","Staff Operations","Live Inventory","Dining Archives","Curated Feedback","Artisan Quality","Guest Experience","Real-time Audits","Zero-waste Stock"];

const FEATURES=[
  {icon:Coins,        t:"Loyalty Points",   d:"Every visit earns exclusive points redeemable for premium table-side privileges.",
    bg:"linear-gradient(140deg,rgba(168,197,160,0.35) 0%,rgba(245,240,232,0.8) 60%)",    ic:"rgba(122,158,126,0.18)"},
  {icon:UtensilsCrossed,t:"Staff-led Orders",d:"Expert staff handle every order — guests simply arrive, dine, and enjoy.",
    bg:"linear-gradient(140deg,rgba(201,185,154,0.32) 0%,rgba(245,240,232,0.8) 60%)",    ic:"rgba(201,185,154,0.35)"},
  {icon:History,      t:"Dining Archives",  d:"Every visit preserved — relive favourite dishes and track your culinary journey.",
    bg:"linear-gradient(140deg,rgba(122,158,126,0.3) 0%,rgba(245,240,232,0.8) 60%)",     ic:"rgba(122,158,126,0.2)"},
  {icon:MessageSquare,t:"Curated Feedback", d:"Post-visit reviews help chefs refine each dish driven by real guest experience.",
    bg:"linear-gradient(140deg,rgba(168,197,160,0.28) 0%,rgba(245,240,232,0.8) 60%)",    ic:"rgba(168,197,160,0.3)"},
  {icon:BarChart3,    t:"Live Intelligence",d:"Management dashboards surface inventory, staff, and loyalty metrics in real time.",
    bg:"linear-gradient(140deg,rgba(201,185,154,0.28) 0%,rgba(245,240,232,0.8) 60%)",    ic:"rgba(201,185,154,0.3)"},
  {icon:Package,      t:"Zero-waste Stock", d:"Automated inventory deduction on every order keeps supply chain lean.",
    bg:"linear-gradient(140deg,rgba(107,94,78,0.14) 0%,rgba(245,240,232,0.8) 60%)",      ic:"rgba(107,94,78,0.15)"},
];

const ROLES=[
  {l:"Guest",   d:"Earn loyalty, view history, leave feedback",       icon:Users,    dark:false,
    bg:"linear-gradient(140deg,rgba(168,197,160,0.45) 0%,rgba(245,240,232,0.75) 100%)"},
  {l:"Staff",   d:"Place dine-in orders, monitor live inventory",     icon:ChefHat,  dark:false,
    bg:"linear-gradient(140deg,rgba(201,185,154,0.45) 0%,rgba(245,240,232,0.75) 100%)"},
  {l:"Manager", d:"Oversee branch operations, review staff & stock", icon:BarChart3, dark:false,
    bg:"linear-gradient(140deg,rgba(122,158,126,0.4) 0%,rgba(235,245,235,0.75) 100%)"},
  {l:"Admin",   d:"Full system control — users, menu, audit logs",   icon:ShieldCheck,dark:true,
    bg:`linear-gradient(140deg,${OW} 0%,#3D4E3E 100%)`},
];

function FloatingOrb({x,y,size,color,delay}: Readonly<{x:string,y:string,size:number,color:string,delay:number}>){
  return(
    <motion.div animate={{y:[0,-20,0],scale:[1,1.08,1],opacity:[0.55,0.75,0.55]}}
      transition={{duration:8+delay,repeat:Infinity,ease:"easeInOut",delay}}
      style={{position:"absolute",left:x,top:y,width:size,height:size,borderRadius:"50%",background:color,filter:"blur(80px)",pointerEvents:"none",zIndex:0}}/>
  );
}

export default function LandingPage(){
  const ref=useRef<HTMLDivElement>(null);
  const {scrollYProgress}=useScroll({target:ref,offset:["start start","end end"]});
  const heroY=useTransform(scrollYProgress,[0,0.18],[0,-40]);
  const heroOp=useTransform(scrollYProgress,[0,0.16],[1,0]);
  const [tick,setTick]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setTick(t=>(t+1)%TICKER.length),2200);return()=>clearInterval(id);},[]);

  return(
    <div ref={ref} style={{fontFamily:"'Jost',sans-serif",color:OW,overflowX:"hidden",background:"transparent"}}>

      {/* NAV — perfectly symmetrical edge padding */}
      <nav style={{position:"sticky",top:0,zIndex:60,width:"100%",backdropFilter:"blur(28px) saturate(1.8)",WebkitBackdropFilter:"blur(28px) saturate(1.8)",background:"rgba(200,222,196,0.45)",boxShadow:"0 1px 0 rgba(107,94,78,0.1)"}}>
        <div style={{width:"100%",padding:`0 ${NAV_EDGE_PADDING}`,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",boxSizing:"border-box"}}>
          <Link href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
            <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${OW},${SG})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(45,58,46,0.25)"}}>
              <Leaf size={17} color={OL}/>
            </div>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.35rem",fontWeight:600,color:OW,whiteSpace:"nowrap"}}>Restro Audit</span>
          </Link>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <Link href="/login"><motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}} style={{background:`linear-gradient(135deg,${OW},${BA})`,color:P,padding:"0.55rem 1.35rem",borderRadius:100,fontSize:"0.83rem",fontWeight:600,border:"none",cursor:"pointer",boxShadow:"0 4px 16px rgba(45,58,46,0.28)",whiteSpace:"nowrap"}}>Enter Portal</motion.button></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{position:"relative",minHeight:"calc(100vh - 64px)",display:"flex",alignItems:"flex-start",justifyContent:"center",overflow:"hidden",background:"transparent",paddingTop:"12vh"}}>
        <FloatingOrb x="75%" y="5%" size={500} color={`rgba(122,158,126,0.35)`} delay={0}/>
        <FloatingOrb x="-5%" y="55%" size={420} color={`rgba(168,197,160,0.3)`} delay={2.5}/>
        <FloatingOrb x="45%" y="60%" size={360} color={`rgba(201,185,154,0.22)`} delay={4}/>
        <div className="pattern-dots" style={{position:"absolute",inset:0,opacity:0.35,pointerEvents:"none"}}/>

        {/* HERO CONTENT — perfectly centred column */}
        <motion.div style={{y:heroY,position:"relative",zIndex:2,width:"100%"}}>
          <div style={{width:"100%",maxWidth:1120,margin:"0 auto",padding:"0 2rem 6rem",boxSizing:"border-box",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>

            {/* pill */}
            <motion.div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"0.42rem 1.1rem",borderRadius:100,background:"rgba(107,94,78,0.09)",border:"1px solid rgba(107,94,78,0.16)",marginBottom:12}}>
              <Leaf size={12} color={BA}/>
              <span style={{fontSize:"0.65rem",fontWeight:700,letterSpacing:"0.32em",textTransform:"uppercase",color:BA}}>Dine-In Management Portal</span>
            </motion.div>

            {/* headline */}
            <motion.div style={{width:"100%", opacity: heroOp}}>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:500,lineHeight:1.02,margin:`0 0 ${HERO_AXIS_GAP_PX}px`,textAlign:"center"}}>
                <span style={{display:"block",fontSize:"clamp(2.6rem,6vw,5.8rem)",color:OW,letterSpacing:"-0.02em"}}>The Art of</span>
                <span style={{display:"inline-block",fontSize:"clamp(3rem,8vw,7.5rem)",fontStyle:"italic",letterSpacing:"-0.03em",
                  background:`linear-gradient(135deg,${SG},${OL} 50%,${SA})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                  backgroundClip:"text",lineHeight:1.1,paddingBottom:"0.08em"}}>
                  Fine Dining
                </span>
                <span style={{display:"block",fontSize:"clamp(2.6rem,6vw,5.8rem)",color:OW,letterSpacing:"-0.02em",paddingLeft:"0.5rem"}}>Perfected.</span>
              </h1>
            </motion.div>

            {/* animated rotating word */}
            <motion.div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:"2rem"}}>
              <div style={{height:1,width:60,background:`linear-gradient(to right, transparent, ${SA})`}}/>
              <div style={{height:28,overflow:"hidden",position:"relative",minWidth:180}}>
                <AnimatePresence mode="wait">
                  <motion.span key={tick} initial={{y:28,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-28,opacity:0}} transition={{duration:0.45,ease:[0.22,1,0.36,1]}}
                    style={{display:"block",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.3em",textTransform:"uppercase",color:SG,textAlign:"center"}}>
                    {TICKER[tick]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div style={{height:1,width:60,background:`linear-gradient(to left, transparent, ${SA})`}}/>
            </motion.div>

            <motion.p style={{fontSize:"1.05rem",color:BA,lineHeight:1.8,maxWidth:520,margin:"0 auto 2.5rem",fontWeight:400,textAlign:"center"}}>
              An intelligent dine-in management system built for precision — staff handle every order, guests earn loyalty, and management gets full operational intelligence.
            </motion.p>

            <motion.div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,flexWrap:"wrap",marginBottom:"3rem"}}>
              <Link href="/login">
                <motion.button whileHover={{scale:1.05,y:-3}} whileTap={{scale:0.97}}
                  style={{display:"flex",alignItems:"center",gap:10,background:`linear-gradient(135deg,${OW},${BA})`,color:P,padding:"1rem 2.4rem",borderRadius:100,fontSize:"0.92rem",fontWeight:600,border:"none",cursor:"pointer",boxShadow:"0 10px 30px rgba(45,58,46,0.3)"}}>
                  Enter the Portal <ArrowRight size={15}/>
                </motion.button>
              </Link>
              <Link href="/signup">
                <motion.button whileHover={{scale:1.05,y:-3}} whileTap={{scale:0.97}}
                  style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,253,248,0.6)",backdropFilter:"blur(12px)",color:OW,padding:"1rem 2.4rem",borderRadius:100,fontSize:"0.92rem",fontWeight:600,border:`1.5px solid rgba(107,94,78,0.2)`,cursor:"pointer"}}>
                  Guest Signup
                </motion.button>
              </Link>
            </motion.div>

            {/* trust row */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.55}}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
              {[{v:"500+",l:"Loyal Members"},{v:"10K+",l:"Points Awarded"},{v:"4.9★",l:"Guest Rating"}].map(s=>(
                <div key={s.l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.8rem",fontWeight:600,color:OW,lineHeight:1}}>{s.v}</span>
                  <span style={{fontSize:"0.62rem",fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:BA,opacity:0.65}}>{s.l}</span>
                </div>
              ))}
              <div style={{width:1,height:40,background:`rgba(107,94,78,0.15)`,display:"flex"}}/>
              <div className="glass-card" style={{display:"inline-flex",alignItems:"center",gap:7,padding:"0.55rem 1.2rem",borderRadius:100}}>
                <ShieldCheck size={13} color={SG}/>
                <span style={{fontSize:"0.68rem",fontWeight:600,color:BA}}>SRMIST · DBMS 21CSC205P</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section style={{padding:"9rem 0",background:"transparent"}}>
        <div style={I}>
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} style={{textAlign:"center",marginBottom:"5rem"}}>
            <div style={{fontSize:"0.62rem",fontWeight:700,letterSpacing:"0.4em",textTransform:"uppercase",color:BA,opacity:0.5,marginBottom:"0.75rem"}}>Platform Features</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2.4rem,5vw,4rem)",fontWeight:500,color:OW,margin:0}}>
              Crafted for <em className="gradient-clip-text" style={{backgroundImage:`linear-gradient(135deg,${SG},${BA})`}}>Excellence</em>
            </h2>
          </motion.div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"1.25rem"}}>
            {FEATURES.map((f,i)=>(
              <motion.div key={f.t} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                whileHover={{y:-10,boxShadow:"0 24px 64px rgba(45,58,46,0.14)"}}
                style={{padding:"2.4rem",borderRadius:24,position:"relative",overflow:"hidden",cursor:"default",
                  background:f.bg,
                  border:"1px solid rgba(45,58,46,0.08)",
                  boxShadow:"0 2px 20px rgba(45,58,46,0.06)",
                  transition:"box-shadow 0.35s ease, transform 0.35s ease"}}>
                {/* Corner accent */}
                <div style={{position:"absolute",top:0,right:0,width:100,height:100,
                  background:"radial-gradient(circle at top right, rgba(255,255,255,0.45) 0%, transparent 70%)",
                  borderRadius:"0 24px 0 100%",pointerEvents:"none"}}/>
                <div style={{width:50,height:50,borderRadius:16,background:f.ic,
                  border:"1px solid rgba(255,255,255,0.6)",backdropFilter:"blur(8px)",
                  display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1.5rem",
                  boxShadow:"0 4px 12px rgba(45,58,46,0.08)"}}>
                  <f.icon size={22} color={SG}/>
                </div>
                <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.45rem",fontWeight:600,color:OW,margin:"0 0 0.65rem",letterSpacing:"-0.01em"}}>{f.t}</h3>
                <p style={{fontSize:"0.875rem",color:BA,lineHeight:1.75,margin:0}}>{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section style={{padding:"8rem 0",background:"transparent"}}>
        <div style={I}>
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} style={{textAlign:"center",marginBottom:"4.5rem"}}>
            <div style={{fontSize:"0.62rem",fontWeight:700,letterSpacing:"0.4em",textTransform:"uppercase",color:SG,marginBottom:"0.75rem"}}>Role-based Access</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2.4rem,5vw,4rem)",fontWeight:500,color:OW,margin:0}}>
              One Portal, <em className="gradient-clip-text" style={{backgroundImage:`linear-gradient(135deg,${SG},${OL})`}}>Every Role</em>
            </h2>
          </motion.div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"1.25rem"}}>
            {ROLES.map((r,i)=>(
              <motion.div key={r.l} initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
                whileHover={{y:-10,scale:1.025,boxShadow:"0 24px 64px rgba(45,58,46,0.16)"}}
                style={{borderRadius:24,padding:"2.5rem",position:"relative",overflow:"hidden",cursor:"default",
                  background:r.bg,
                  border:r.dark?"1px solid rgba(168,197,160,0.15)":"1px solid rgba(45,58,46,0.07)",
                  boxShadow:r.dark?"0 8px 32px rgba(45,58,46,0.35)":"0 2px 20px rgba(45,58,46,0.06)",
                  transition:"all 0.35s ease"}}>
                {/* Radial highlight */}
                <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",
                  background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.22) 0%, transparent 100%)",
                  pointerEvents:"none"}}/>
                <div style={{position:"relative",zIndex:1}}>
                  <div style={{width:52,height:52,borderRadius:16,
                    background:r.dark?"rgba(168,197,160,0.12)":"rgba(255,255,255,0.45)",
                    border:r.dark?"1px solid rgba(168,197,160,0.25)":"1px solid rgba(255,255,255,0.7)",
                    backdropFilter:"blur(8px)",
                    display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1.5rem",
                    boxShadow:"0 4px 12px rgba(45,58,46,0.1)"}}>
                    <r.icon size={22} color={r.dark?OL:SG}/>
                  </div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",fontWeight:600,
                    color:r.dark?P:OW,marginBottom:"0.5rem",letterSpacing:"-0.01em"}}>{r.l}</div>
                  <p style={{fontSize:"0.85rem",color:r.dark?"rgba(245,240,232,0.65)":BA,margin:"0 0 1.75rem",lineHeight:1.7}}>{r.d}</p>
                  <Link href="/login" style={{textDecoration:"none"}}>
                    <motion.div whileHover={{x:5}} style={{display:"inline-flex",alignItems:"center",gap:6,
                      fontSize:"0.78rem",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",
                      color:r.dark?OL:SG}}>
                      Sign In <ArrowRight size={13}/>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"6rem 0",background:"transparent"}}>
        <div style={I}>
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.8}}
            className="glass-card-dark grain" style={{borderRadius:36,padding:"5rem 3rem",textAlign:"center",position:"relative",overflow:"hidden"}}>
            <div className="pattern-grid" style={{position:"absolute",inset:0,opacity:0.1}}/>
            <FloatingOrb x="10%" y="20%" size={300} color="rgba(90,140,95,0.35)" delay={1}/>
            <FloatingOrb x="70%" y="50%" size={250} color="rgba(122,158,126,0.25)" delay={3}/>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{fontSize:"0.62rem",fontWeight:700,letterSpacing:"0.4em",textTransform:"uppercase",color:OL,opacity:0.75,marginBottom:"1rem"}}>Get Started</div>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2.6rem,6vw,5rem)",fontWeight:500,color:P,lineHeight:1.05,margin:"0 auto 1.25rem",maxWidth:660}}>
                Ready to Elevate{" "}
                <em className="gradient-clip-text" style={{backgroundImage:`linear-gradient(135deg,${OL},${SA})`}}>Your Experience?</em>
              </h2>
              <p style={{fontSize:"1rem",color:"rgba(245,240,232,0.52)",margin:"0 auto 2.5rem",lineHeight:1.8,maxWidth:460}}>
                Join the portal — whether you're staff, management, or a valued guest.
              </p>
              <div style={{display:"flex",justifyContent:"center",gap:14,flexWrap:"wrap"}}>
                <Link href="/login"><motion.button whileHover={{scale:1.05,y:-2}} whileTap={{scale:0.97}} style={{background:`linear-gradient(135deg,${P},${SA})`,color:OW,padding:"1rem 2.4rem",borderRadius:100,fontWeight:700,fontSize:"0.9rem",border:"none",cursor:"pointer",boxShadow:"0 8px 28px rgba(0,0,0,0.2)"}}>Management Portal</motion.button></Link>
                <Link href="/signup"><motion.button whileHover={{scale:1.05,y:-2}} whileTap={{scale:0.97}} style={{background:"rgba(255,253,248,0.08)",backdropFilter:"blur(10px)",color:P,padding:"1rem 2.4rem",borderRadius:100,fontWeight:600,fontSize:"0.9rem",border:"1.5px solid rgba(245,240,232,0.2)",cursor:"pointer"}}>Guest Signup</motion.button></Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{padding:"2.5rem 0",background:"transparent",borderTop:`1px solid rgba(107,94,78,0.1)`}}>
        <div style={{...I,display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${OW},${SG})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Leaf size={14} color={OL}/>
            </div>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",fontWeight:600,color:OW}}>Restro Audit</span>
          </div>
          <div style={{textAlign:"center",fontSize:"0.76rem",lineHeight:2,color:BA}}>
            <div style={{fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase"}}>DBMS Mini Project · 21CSC205P</div>
            <div style={{color:SG}}>SRM Institute of Science &amp; Technology</div>
            <div>Nikhil Karur &amp; Sai Sujan Balaji</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
