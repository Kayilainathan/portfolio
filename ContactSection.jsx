import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Github, MapPin, Check, Send } from "lucide-react";

// ============================================================================
// SUB-COMPONENTS & SVG LOGOS
// ============================================================================

// Custom LinkedIn Logo
const LinkedInLogoOnly = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM8 19H5V8h3v11zM6.5 6.73a1.77 1.77 0 110-3.54 1.77 1.77 0 010 3.54zM20 19h-3v-5.6c0-3.37-4-3.12-4 0V19h-3V8h3v1.77C14.4 7.17 20 6.97 20 12.29V19z" />
  </svg>
);

// High-fidelity Techy Vector Avatar for Profile Preview
const ProfileVectorAvatar = () => (
  <svg className="w-full h-full text-[#00ffcc]" viewBox="0 0 100 100" fill="none">
    {/* Dark background circle */}
    <circle cx="50" cy="50" r="50" fill="#111827" />
    {/* Concentric grid lines for tech look */}
    <circle cx="50" cy="50" r="42" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
    <circle cx="50" cy="50" r="30" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" />
    {/* Hair/Head backing */}
    <path d="M50 22 C37 22 30 30 30 40 C30 43 33 46 36 46 C39 46 41 43 43 40 C43 36 46 33 50 33 C54 33 57 36 57 40 C59 43 61 46 64 46 C67 46 70 43 70 40 C70 30 63 22 50 22 Z" fill="rgba(6, 182, 212, 0.45)" stroke="rgba(6, 182, 212, 0.8)" strokeWidth="1" />
    {/* Face */}
    <circle cx="50" cy="46" r="13" fill="#1f2937" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="1.2" />
    {/* Glasses */}
    <rect x="42" y="42" width="6" height="4" rx="1" stroke="#00ffcc" strokeWidth="1.2" fill="none" />
    <rect x="52" y="42" width="6" height="4" rx="1" stroke="#00ffcc" strokeWidth="1.2" fill="none" />
    <line x1="48" y1="44" x2="52" y2="44" stroke="#00ffcc" strokeWidth="1.2" />
    {/* Shoulders / Body */}
    <path d="M26 80 C26 66 36 60 50 60 C64 60 74 66 74 80" fill="rgba(139, 92, 246, 0.35)" stroke="rgba(139, 92, 246, 0.7)" strokeWidth="1.2" />
  </svg>
);

// Backdrop HTML5 Canvas rendering subtle vector waves reacting to hover position
export function ContactWavesCanvas({ hoverX, hoverY }) {
  const canvasRef = useRef(null);
  const hoverRef = useRef({ x: 0, y: 0 });

  // Update hoverRef when props change to keep coords current without resetting the animation loop
  useEffect(() => {
    hoverRef.current = { x: hoverX, y: hoverY };
  }, [hoverX, hoverY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let targetHover = { x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2 };
    let currentHover = { x: targetHover.x, y: targetHover.y };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (hoverRef.current.x === 0 && hoverRef.current.y === 0) {
        targetHover.x = canvas.width / 2;
        targetHover.y = canvas.height / 2;
        currentHover.x = targetHover.x;
        currentHover.y = targetHover.y;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let offset = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      offset += 0.006;

      // Update target from current hover coordinates (default to center if 0)
      if (hoverRef.current.x !== 0 || hoverRef.current.y !== 0) {
        targetHover.x = hoverRef.current.x;
        targetHover.y = hoverRef.current.y;
      } else {
        targetHover.x = canvas.width / 2;
        targetHover.y = canvas.height / 2;
      }

      // Smoothly transition coordinates via LERPing
      currentHover.x += (targetHover.x - currentHover.x) * 0.05;
      currentHover.y += (targetHover.y - currentHover.y) * 0.05;

      // Draw multiple wave lines
      const waveCount = 3;
      const colors = [
        "rgba(6, 182, 212, 0.08)",   // Neon Cyan
        "rgba(139, 92, 246, 0.08)",  // Neon Purple
        "rgba(244, 63, 94, 0.04)"     // Neon Rose
      ];

      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        ctx.lineWidth = 1.6 - i * 0.3;
        ctx.strokeStyle = colors[i % colors.length];

        const amplitude = 30 + i * 8 + (currentHover.y / canvas.height) * 12;
        const frequency = 0.003 + i * 0.0008 + (currentHover.x / canvas.width) * 0.0015;
        const speed = offset * (1 + i * 0.15);

        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + Math.sin(x * frequency + speed) * amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ============================================================================
// MAIN CONTACT SECTION COMPONENT
// ============================================================================
export default function ContactSection() {
  const parentRef = useRef(null);

  // States
  const [activeTab, setActiveTab] = useState("email");
  const [canvasHover, setCanvasHover] = useState({ x: 0, y: 0 });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [currentTime, setCurrentTime] = useState("16:22");
  const [isGlitching, setIsGlitching] = useState(false);

  // Email App States
  const [emailSubject, setEmailSubject] = useState("Industrial SIS Failure Predictor Inquiry");
  const [emailBody, setEmailBody] = useState("Hello Kayilainathan J,\n\nI visited your portfolio and would like to interface regarding your embedded electronics projects.");
  const [emailSuccess, setEmailSuccess] = useState(false);

  // LinkedIn State
  const [linkedInState, setLinkedInState] = useState("idle"); // idle, connecting, invited

  // Phone Mockup Tilt Rotation
  const [tilt, setTilt] = useState({ hover: false, rotateX: 0, rotateY: 0 });

  // Handle Parent Grid Cursor Position (Waves Reactivity)
  const handleMouseMove = (e) => {
    if (!parentRef.current) return;
    const rect = parentRef.current.getBoundingClientRect();
    setCanvasHover({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Smartphone Tilt Calculations (Reduced tilt factors for softer magnetic movement)
  const handleSmartphoneMouseMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Limit pitch and yaw rotations to 4deg (softened tilt multipliers)
    const rotateX = -(y / (rect.height / 2)) * 4;
    const rotateY = (x / (rect.width / 2)) * 4;
    setTilt({ hover: true, rotateX, rotateY });
  };

  const handleSmartphoneMouseLeave = () => {
    setTilt({ hover: false, rotateX: 0, rotateY: 0 });
  };

  // Clock Update Effect (updates status bar time instantly on transition)
  useEffect(() => {
    const clockUpdater = () => {
      const now = new Date();
      let hr = now.getHours();
      let mn = now.getMinutes();
      const hrStr = hr < 10 ? "0" + hr : hr;
      const mnStr = mn < 10 ? "0" + mn : mn;
      setCurrentTime(`${hrStr}:${mnStr}`);
    };
    clockUpdater();
    const interval = setInterval(clockUpdater, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Glitch Screen Trigger (Triggered when switching tabs)
  const triggerGlitch = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 280);
  };

  // Auto-rotation of simulated app views (4.5s Interval)
  useEffect(() => {
    const tabs = ["email", "linkedin", "github"];
    const interval = setInterval(() => {
      setActiveTab((prevTab) => {
        const nextIndex = (tabs.indexOf(prevTab) + 1) % tabs.length;
        triggerGlitch();
        return tabs[nextIndex];
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText("kayilainathan19@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendDraft = () => {
    setEmailSuccess(true);
    setTimeout(() => {
      setEmailSuccess(false);
      window.open(
        `mailto:kayilainathan19@gmail.com?subject=${encodeURIComponent(
          emailSubject
        )}&body=${encodeURIComponent(emailBody)}`
      );
    }, 1500);
  };

  const startLinkedInConnection = () => {
    setLinkedInState("connecting");
    setTimeout(() => {
      setLinkedInState("invited");
    }, 1500);
  };

  const triggerGitHubFollow = () => {
    window.open("https://github.com/Kayilainathan", "_blank", "noopener,noreferrer");
  };

  // GitHub contribution grid setup (16 x 4 array grid structure)
  const githubContributions = Array.from({ length: 64 }, (_, i) => {
    // Generate organic-looking distribution
    const r = Math.random();
    let weight = 0;
    if (r > 0.82) weight = 4;
    else if (r > 0.68) weight = 3;
    else if (r > 0.52) weight = 2;
    else if (r > 0.32) weight = 1;
    return { index: i, weight };
  });

  return (
    <div
      ref={parentRef}
      onMouseMove={handleMouseMove}
      className="w-full relative rounded-3xl p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-transparent overflow-hidden shadow-2xl transition-all duration-300"
    >
      <style dangerouslySetInnerHTML={{__html: `
        .app-email-textarea {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
        .app-email-textarea::-webkit-scrollbar {
          width: 4px;
        }
        .app-email-textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        .app-email-textarea::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 99px;
        }
        .app-email-textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      {/* Wave pattern backdrop container */}
      <div className="absolute inset-0 bg-[#07090e]/95 rounded-3xl overflow-hidden -z-10">
        <ContactWavesCanvas hoverX={canvasHover.x} hoverY={canvasHover.y} />
        {/* Techy background mesh or gradient radial */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#06b6d4]/5 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#8b5cf6]/5 rounded-full filter blur-[120px] pointer-events-none" />
      </div>

      <div className="px-6 py-12 md:p-12 lg:p-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN: Narrative description & Interactive selector buttons */}
        <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-8 text-left">
          <div className="space-y-4">
            {/* Title */}
            <h2 className="font-display font-medium text-3xl md:text-5xl text-white uppercase leading-none tracking-tight">
              Establish <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#f43f5e] font-extrabold">Connection</span>
            </h2>

            {/* Premium minimal description */}
            <p className="text-slate-400 text-sm md:text-base font-sans leading-relaxed max-w-xl">
              Let's build something epic. Drop a message in the simulator, or tap one of the portals to link up.
            </p>
          </div>

          {/* Redesigned Connect Section: Minimalist, clean and super premium glass buttons */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl w-full">
            
            {/* EMAIL PORTAL */}
            <motion.a
              href="mailto:kayilainathan19@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              data-umami-event="Email Click Bottom Portal"
              whileHover={{ y: -3, scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-[24px] transition-all duration-300 relative overflow-hidden text-center cursor-pointer border bg-white/[0.01] border-white/5 hover:border-[#06b6d4]/30 hover:bg-[#06b6d4]/[0.02] group no-underline"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-800 bg-black/40 group-hover:border-[#06b6d4]/50 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] transition-all duration-300">
                <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400 group-hover:text-[#06b6d4] transition-colors" />
              </div>
              <span className="font-sans text-[11px] font-medium tracking-wide mt-3 text-slate-400 group-hover:text-white transition-colors">Email</span>
            </motion.a>

            {/* LINKEDIN PORTAL */}
            <motion.a
              href="https://linkedin.com/in/kayilainathan-j-170267305"
              target="_blank"
              rel="noopener noreferrer"
              data-umami-event="LinkedIn Click Bottom Portal"
              whileHover={{ y: -3, scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-[24px] transition-all duration-300 relative overflow-hidden text-center cursor-pointer border bg-white/[0.01] border-white/5 hover:border-blue-500/30 hover:bg-blue-500/[0.02] group no-underline"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-800 bg-black/40 group-hover:border-blue-400/50 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.2)] transition-all duration-300">
                <LinkedInLogoOnly className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </div>
              <span className="font-sans text-[11px] font-medium tracking-wide mt-3 text-slate-400 group-hover:text-white transition-colors">LinkedIn</span>
            </motion.a>

            {/* GITHUB PORTAL */}
            <motion.a
              href="https://github.com/Kayilainathan"
              target="_blank"
              rel="noopener noreferrer"
              data-umami-event="GitHub Click Bottom Portal"
              whileHover={{ y: -3, scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-[24px] transition-all duration-300 relative overflow-hidden text-center cursor-pointer border bg-white/[0.01] border-white/5 hover:border-[#f43f5e]/30 hover:bg-[#f43f5e]/[0.02] group no-underline"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-800 bg-black/40 group-hover:border-[#f43f5e]/50 group-hover:shadow-[0_0_12px_rgba(244,63,94,0.2)] transition-all duration-300">
                <Github className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400 group-hover:text-[#f43f5e] transition-colors" />
              </div>
              <span className="font-sans text-[11px] font-medium tracking-wide mt-3 text-slate-400 group-hover:text-white transition-colors">GitHub</span>
            </motion.a>
          </div>

          {/* Clean and Elegant metadata block */}
          <div className="p-3.5 sm:p-4 rounded-[20px] sm:rounded-[26px] bg-slate-950/40 backdrop-blur-md border border-white/5 font-mono text-[10.5px] text-slate-500 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 max-w-xl shadow-xl w-full">
            <div className="flex items-center justify-between sm:justify-start gap-2 border-b border-white/5 sm:border-b-0 pb-2 sm:pb-0 w-full sm:w-auto text-left">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse" />
                <span className="text-slate-600">LOCATION:</span>
              </div>
              <span className="text-slate-300 font-sans font-medium tracking-wide">Chennai, TN, India</span>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
              <span className="text-slate-600">ZONE:</span>
              <span className="text-slate-400">GMT +5:30</span>
            </div>
            <div className="w-full sm:w-auto">
              <motion.button
                onClick={copyEmailToClipboard}
                data-umami-event="Copy Email Button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`hover:text-white text-slate-300 uppercase tracking-wider text-[9.5px] font-black font-mono flex items-center justify-center gap-1.5 border px-4 py-2 w-full sm:w-auto rounded-full bg-black/50 transition-all duration-300 outline-none cursor-pointer ${
                  copiedEmail
                    ? "border-[#10b981] text-white bg-[#10b981]/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : "border-white/15 hover:border-[#06b6d4] hover:bg-[#06b6d4]/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                }`}
              >
                <svg className={`transition-colors duration-300 ${copiedEmail ? "text-[#10b981]" : "text-[#cbd5e1] group-hover:text-[#06b6d4]"}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                {copiedEmail ? "COPIED!" : "COPY EMAIL"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Rotating, Tilting 3D Smartphone Device with active-app interactive portals */}
        <div id="contact-device-frame" className="lg:col-span-6 flex items-center justify-center relative mt-4 lg:mt-0 p-4 select-none">
          
          {/* 3D Wrapper Layer containing the Smartphone */}
          <div
            onMouseMove={handleSmartphoneMouseMove}
            onMouseLeave={handleSmartphoneMouseLeave}
            style={{
              perspective: "1200px",
              transformStyle: "preserve-3d"
            }}
            className="relative z-10 py-4 cursor-grab active:cursor-grabbing w-[280px] h-[550px]"
          >
            
            {/* Dynamic Cloud Backlight Glow - Shifts colors gracefully to match the active application client */}
            <motion.div
              initial={{ y: 440, opacity: 0, scale: 0.72, rotateX: 38, rotateY: -15 }}
              whileInView={{ y: 0, opacity: 0.7, scale: 1, rotateX: 1.5, rotateY: -3 }}
              viewport={{ once: false, amount: 0.15 }}
              animate={tilt.hover ? { rotateX: tilt.rotateX, rotateY: tilt.rotateY, scale: 1.015, y: 0, opacity: 0.85 } : { rotateX: 1.5, rotateY: -3, scale: 1, y: [0, -10, 0], opacity: 0.7 }}
              transition={tilt.hover ? {
                type: "spring",
                stiffness: 110,
                damping: 18
              } : {
                type: "spring",
                stiffness: 45,
                damping: 15,
                mass: 1.2,
                y: {
                  repeat: Infinity,
                  repeatType: "mirror",
                  duration: 3,
                  ease: "easeInOut"
                }
              }}
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden"
              }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full filter blur-[90px] transition-all duration-700 pointer-events-none -z-10 mix-blend-screen opacity-65 ${
                activeTab === "email" ? "bg-blue-600/35" :
                activeTab === "linkedin" ? "bg-cyan-500/35" :
                "bg-rose-500/35"
              }`}
            />
            
            {/* The Smartphone container - Solid, high-fidelity responsive layout */}
            <motion.div
              initial={{ y: 440, opacity: 0, scale: 0.72, rotateX: 38, rotateY: -15 }}
              whileInView={{ y: 0, opacity: 1, scale: 1, rotateX: 1.5, rotateY: -3 }}
              viewport={{ once: false, amount: 0.15 }}
              animate={tilt.hover ? { rotateX: tilt.rotateX, rotateY: tilt.rotateY, scale: 1.015, y: 0 } : { rotateX: 1.5, rotateY: -3, scale: 1, y: [0, -10, 0] }}
              transition={tilt.hover ? {
                type: "spring",
                stiffness: 110,
                damping: 18
              } : {
                type: "spring",
                stiffness: 45,
                damping: 15,
                mass: 1.2,
                y: {
                  repeat: Infinity,
                  repeatType: "mirror",
                  duration: 3,
                  ease: "easeInOut"
                }
              }}
              style={{
                transformStyle: "preserve-3d"
              }}
              className="w-[280px] h-[550px] rounded-[38px] bg-[#1a1b22] border-[6px] border-[#2c2d35] p-[3px] relative shadow-2xl overflow-hidden shadow-black/90 flex flex-col justify-between"
            >
                
                {/* Dynamic Island Pill Notch */}
                <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[76px] h-[21px] rounded-full bg-black z-50 flex items-center justify-end px-2.5 gap-1 shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="w-1 h-1 rounded-full bg-indigo-500" />
                </div>

                {/* Speaker Grill */}
                <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[34px] h-[2px] rounded-full bg-[#1e1e24] z-50" />

                {/* Side physical buttons */}
                <div className="absolute -left-[9px] top-[95px] w-[3px] h-[20px] rounded-r-md bg-[#2d2e36]" />
                <div className="absolute -left-[9px] top-[132px] w-[3px] h-[40px] rounded-r-md bg-[#2d2e36]" />
                <div className="absolute -left-[9px] top-[182px] w-[3px] h-[40px] rounded-r-md bg-[#2d2e36]" />
                <div className="absolute -right-[9px] top-[125px] w-[3px] h-[55px] rounded-l-md bg-[#2d2e36]" />

                {/* App Screen Content Wrapper */}
                <div className="w-full h-full rounded-[30px] overflow-hidden bg-[#07090d] flex flex-col justify-between relative shadow-inner">
                  
                  {/* Telemetry Glitch Displacement Effect */}
                  {isGlitching && (
                    <div className="absolute inset-0 bg-black/40 z-50 pointer-events-none flex flex-col justify-between overflow-hidden">
                      <div className="absolute inset-0 bg-cyan-500/10 mix-blend-screen animate-pulse" />
                      <div className="absolute inset-0 bg-rose-500/10 mix-blend-screen animate-pulse" style={{ animationDelay: '100ms' }} />
                      
                      <div className="h-[3px] bg-[#06b6d4]/30 w-full animate-[ping_0.1s_infinite] absolute" style={{ top: '15%' }} />
                      <div className="h-[2px] bg-[#f43f5e]/40 w-full animate-[bounce_0.15s_infinite] absolute" style={{ top: '48%' }} />
                      <div className="h-[6px] bg-[#8b5cf6]/20 w-full animate-[pulse_0.08s_infinite] absolute" style={{ top: '75%' }} />

                      <div className="absolute top-[35%] left-[8%] font-mono text-[8.5px] text-[#00ffcc] font-black tracking-widest bg-black/85 px-1.5 py-0.5 rounded border border-[#00ffcc]/40 shadow-lg">
                        SYSTEM_RESET_SHIFT
                      </div>
                      <div className="absolute bottom-[30%] right-[8%] font-mono text-[7px] text-[#f43f5e] font-black tracking-widest bg-black/85 px-1.5 py-0.5 rounded border border-[#f43f5e]/40">
                        MUT_INDEX_WARP
                      </div>

                      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,0.5) 50%)] bg-[length:100%_4px]" />
                    </div>
                  )}
                  
                  {/* 1. Custom iOS Status Bar */}
                  <div className="w-full h-[34px] px-5 pt-2 flex items-center justify-between text-[10px] font-mono tracking-widest text-slate-400 z-40 bg-black/50 backdrop-blur-md select-none shrink-0 border-b border-white/5">
                    <div className="font-sans font-bold text-[11.5px] text-white tracking-normal">{currentTime}</div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M15.384 6.115a.485.485 0 0 0-.047-.736A12.444 12.444 0 0 0 8 3 12.44 12.44 0 0 0 .663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c2.507 0 4.827.802 6.716 2.164a.517.517 0 0 0 .668-.049z"/>
                        <path d="M13.229 8.271a.482.482 0 0 0-.063-.745A9.455 9.455 0 0 0 8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 7a8.46 8.46 0 0 1 4.577 1.336.525.525 0 0 0 .652-.065zm-2.183 2.183c.226-.207.22-.569-.024-.741A6.5 6.5 0 0 0 8 9c-1.285 0-2.46.37-3.447.994-.244.172-.25.534-.024.741a.53.53 0 0 0 .633.053A5.474 5.474 0 0 1 8 10c1.07 0 2.054.307 2.885.835a.53.53 0 0 0 .633-.053zm-1.892 1.892c.262-.236.216-.692-.12-.835A3.483 3.483 0 0 0 8 11c-.518 0-1 .112-1.434.314-.336.143-.382.6-.12.835.215.193.532.15.719-.074A2.478 2.478 0 0 1 8 12c.31 0 .597.056.835.158a.49.49 0 0 0 .717-.074z"/>
                      </svg>
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-[4px] select-none">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[8px] font-mono font-medium text-slate-300 tracking-wider">6G</span>
                      </div>
                      <div className="w-4 h-2 rounded-[3px] border border-slate-400 p-[1px] flex items-center">
                        <div className="h-full w-[85%] bg-slate-100 rounded-[1.5px]" />
                      </div>
                    </div>
                  </div>

                  {/* 2. Interactive App Screen Root */}
                  <div className="w-full h-full relative overflow-y-auto px-3 pb-10 pt-2.5 scrollbar-none flex flex-col bg-[#050608]">
                    
                    <AnimatePresence mode="wait">
                      
                      {/* TAB 1: EMAIL CORNER */}
                      {activeTab === "email" && (
                        <motion.div
                          key="emailApp"
                          initial={{ opacity: 0, scale: 0.88, y: 35, skewX: -6, filter: "blur(14px) brightness(1.5)" }}
                          animate={{ opacity: 1, scale: 1, y: 0, skewX: 0, filter: "blur(0px) brightness(1)" }}
                          exit={{ opacity: 0, scale: 1.12, y: -35, skewX: 6, filter: "blur(14px) brightness(0.7)" }}
                          transition={{ 
                            type: "spring",
                            stiffness: 110,
                            damping: 18,
                            staggerChildren: 0.08,
                            delayChildren: 0.1
                          }}
                          className="w-full h-full flex flex-col justify-between py-1"
                        >
                          <div className="space-y-3.5">
                            
                            <motion.div 
                              variants={{
                                hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                                visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                              }}
                              className="flex items-center justify-between pb-2 border-b border-white/5 mt-1"
                            >
                              <a 
                                href={`mailto:kayilainathan19@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer group/mail"
                              >
                                <div className="w-4.5 h-4.5 rounded bg-[#007aff] flex items-center justify-center text-white transition-transform group-hover/mail:scale-110">
                                  <Mail className="w-2.5 h-2.5 text-white" />
                                </div>
                                <span className="text-[11px] font-bold text-white tracking-wide group-hover/mail:underline">SecureMail</span>
                              </a>
                              <span className="text-[9px] text-slate-500 font-mono tracking-wider">v3.5_SECURE</span>
                            </motion.div>

                            <motion.div 
                              variants={{
                                hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                                visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                              }}
                              className="space-y-1.5 rounded-xl bg-white/[0.03] p-3 border border-white/5 text-[10.5px]"
                            >
                              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                <span className="text-slate-500 font-mono text-[8px] uppercase">To:</span>
                                <span className="text-[#06b6d4] font-semibold text-right truncate max-w-[150px]">kayilainathan19@gmail.com</span>
                              </div>

                              <div className="flex justify-between items-center border-b border-white/5 pb-1 pt-0.5">
                                <span className="text-slate-500 font-mono text-[8px] uppercase">From:</span>
                                <span className="text-slate-300 font-mono truncate max-w-[140px]">guest@industrial-sis.io</span>
                              </div>

                              <div className="flex flex-col gap-0.5 pt-1 text-left">
                                <label className="text-slate-500 font-mono text-[8px] uppercase">Subject:</label>
                                <input
                                  type="text"
                                  value={emailSubject}
                                  onChange={(e) => setEmailSubject(e.target.value)}
                                  className="w-full bg-black/60 border border-white/5 hover:border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none focus:border-[#06b6d4]/40"
                                />
                              </div>
                            </motion.div>

                            <motion.div 
                              variants={{
                                hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                                visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                              }}
                              className="flex flex-col gap-1 text-[10.5px] text-left"
                            >
                              <label className="text-slate-500 font-mono text-[8px] tracking-wider uppercase">Project message:</label>
                              <textarea
                                rows={4}
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl p-2.5 text-white text-[10px] leading-relaxed focus:outline-none focus:border-[#06b6d4]/40 resize-none font-sans app-email-textarea"
                              />
                            </motion.div>

                          </div>

                      <motion.div 
                        variants={{
                          hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                          visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                        }}
                        className="pt-3 border-t border-white/5"
                      >
                        <button
                          onClick={handleSendDraft}
                          disabled={emailSuccess}
                          className={`w-full py-2.5 px-3 rounded-lg font-bold font-mono tracking-wider text-[10px] uppercase flex items-center justify-center gap-1.5 transition-all duration-300 shadow-lg ${
                            emailSuccess
                              ? "bg-emerald-500 text-white shadow-emerald-500/20 cursor-default"
                              : "bg-gradient-to-r from-[#06b6d4] to-blue-500 text-white shadow-[#06b6d4]/15 hover:scale-[1.04] hover:brightness-[1.2] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] active:scale-[0.975]"
                          }`}
                        >
                          {emailSuccess ? (
                            <>
                              <Check className="w-3 h-3 animate-bounce" />
                              TELEPORTING DRAFT...
                            </>
                          ) : (
                            <>
                              <motion.div
                                animate={activeTab === "email" ? { x: [0, 1.5, -1.5, 0], y: [0, -1.5, 1.5, 0], rotate: [0, 12, -12, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                              >
                                <Send className="w-3 h-3" />
                              </motion.div>
                              LAUNCH EMAIL CLIENT
                            </>
                          )}
                        </button>
                      </motion.div>

                    </motion.div>
                  )}

                  {/* TAB 2: LINKEDIN PORTRAIT CARD */}
                  {activeTab === "linkedin" && (
                    <motion.div
                      key="linkedinApp"
                      initial={{ opacity: 0, scale: 0.88, y: 35, skewX: -6, filter: "blur(14px) brightness(1.5)" }}
                      animate={{ opacity: 1, scale: 1, y: 0, skewX: 0, filter: "blur(0px) brightness(1)" }}
                      exit={{ opacity: 0, scale: 1.12, y: -35, skewX: 6, filter: "blur(14px) brightness(0.7)" }}
                      transition={{ 
                        type: "spring",
                        stiffness: 110,
                        damping: 18,
                        staggerChildren: 0.08,
                        delayChildren: 0.1
                      }}
                      className="w-full h-full flex flex-col justify-between py-1"
                    >
                      <div className="space-y-3.5">
                        
                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                            visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                          }}
                          className="flex items-center gap-1.5 px-0.5 pb-1.5 mt-0.5 border-b border-white/5 cursor-pointer"
                        >
                          <a 
                            href="https://linkedin.com/in/kayilainathan-j-170267305" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 w-full hover:opacity-85 group/ln"
                          >
                            <div className="text-[#0077b5] flex items-center justify-center transition-transform hover:scale-115 shrink-0">
                              <LinkedInLogoOnly className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex-1 px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9.5px] text-slate-400 truncate flex items-center gap-1 text-left transition-all duration-300 hover:border-blue-400/40 hover:bg-white/[0.08] hover:text-white hover:scale-[1.01]">
                              <span>🔍</span>
                              <span className="truncate group-hover/ln:underline">linkedin.com/in/kayilainathan-j</span>
                            </div>
                          </a>
                        </motion.div>

                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                            visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                          }}
                          className="rounded-xl border border-white/5 overflow-hidden bg-[#12151e] shadow-lg"
                        >
                          <div className="h-[50px] bg-[#dfd6cb] relative p-1.5 flex justify-between items-center select-none overflow-hidden">
                            <span className="absolute -left-1 bottom-[-15px] font-serif text-[60px] font-bold text-[#cfc2b3] leading-none opacity-40">K</span>
                            <div className="text-right flex flex-col justify-center ml-auto font-sans leading-none">
                              <span className="text-[#3a342a] text-[6.5px] tracking-widest font-black uppercase">KAYILAINATHAN J</span>
                              <span className="text-[#554c3c] text-[3.8px] tracking-wider font-extrabold uppercase mt-0.5">MADRAS INSTITUTE OF TECHNOLOGY</span>
                              <span className="text-[#554c3c] text-[3.2px] tracking-widest font-bold uppercase">ANNA UNIVERSITY</span>
                            </div>
                          </div>

                          <div className="px-3 pb-3 pt-0.5 relative">
                            <div className="absolute top-[-26px] left-3 w-[44px] h-[44px] rounded-full p-[1px] bg-[#12151e] shadow-lg">
                              <ProfileVectorAvatar />
                            </div>

                            <div className="pt-6 mt-1 flex flex-col space-y-0.5 text-left">
                              <div className="flex items-baseline gap-1">
                                <h3 className="font-sans font-bold text-[12px] text-white tracking-wide leading-tight">
                                  KAYILAINATHAN J
                                </h3>
                                <div className="w-3 h-3 rounded-full bg-[#1da1f2] flex items-center justify-center p-[1px] shadow shadow-black/45 self-center">
                                  <span className="text-white text-[6px] leading-none font-bold">✓</span>
                                </div>
                              </div>

                              <p className="text-[8.5px] text-slate-300 font-sans leading-relaxed tracking-wide font-normal">
                                Sophomore @ MIT, Anna University | IEEE Member | Ex-Intern NLCIL
                              </p>

                              <div className="flex items-center gap-1.5 text-[8px] text-slate-400 font-mono py-0.5">
                                <MapPin className="w-2.5 h-2.5 text-[#8b5cf6] shrink-0" />
                                <span>Chennai, Tamil Nadu</span>
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <div className="w-5 h-5 rounded-md bg-[#a31d1d] flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(163,29,29,0.3)]">
                                  <span className="text-white font-sans text-[6.5px] font-black tracking-tighter">MIT</span>
                                </div>
                                <span className="text-[8px] font-semibold text-slate-300">
                                  Madras Institute of Technology
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                      </div>

                      <motion.div 
                        variants={{
                          hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                          visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                        }}
                        className="pt-3 border-t border-white/5 space-y-1.5"
                      >
                        <button
                          onClick={startLinkedInConnection}
                          disabled={linkedInState !== "idle"}
                          className={`w-full py-2 px-3 rounded-lg font-bold font-mono tracking-widest text-[9px] uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                            linkedInState === "invited"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                              : linkedInState === "connecting"
                              ? "bg-[#4f46e5]/25 text-[#cbd5e1] border border-[#6366f1]/20 animate-pulse cursor-default"
                              : "bg-[#0077b5] text-white shadow-[#0077b5]/15 hover:scale-[1.04] hover:brightness-[1.2] hover:shadow-[0_0_20px_rgba(0,119,181,0.6)] active:scale-[0.975]"
                          }`}
                        >
                          <motion.div
                            animate={activeTab === "linkedin" ? { opacity: [0.75, 1, 0.75], scale: [1, 1.05, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                          >
                            <LinkedInLogoOnly className="w-3.5 h-3.5" />
                          </motion.div>
                          {linkedInState === "invited" ? "INVITATION SENT ✓" : linkedInState === "connecting" ? "CONNECTING..." : "CONNECT ON LINKEDIN"}
                        </button>
                        
                        <div className="flex justify-between text-[8px] font-mono text-slate-500 px-0.5">
                          <span>150+ NODES</span>
                          <span>PEER-CHECKED LOGIC</span>
                        </div>
                      </motion.div>

                    </motion.div>
                  )}

                  {/* TAB 3: GITHUB SUMMARY */}
                  {activeTab === "github" && (
                    <motion.div
                      key="githubApp"
                      initial={{ opacity: 0, scale: 0.88, y: 35, skewX: -6, filter: "blur(14px) brightness(1.5)" }}
                      animate={{ opacity: 1, scale: 1, y: 0, skewX: 0, filter: "blur(0px) brightness(1)" }}
                      exit={{ opacity: 0, scale: 1.12, y: -35, skewX: 6, filter: "blur(14px) brightness(0.7)" }}
                      transition={{ 
                        type: "spring",
                        stiffness: 110,
                        damping: 18,
                        staggerChildren: 0.08,
                        delayChildren: 0.1
                      }}
                      className="w-full h-full flex flex-col justify-between py-1"
                    >
                      <div className="space-y-3.5">
                        
                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                            visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                          }}
                          className="flex items-center justify-between pb-1.5 border-b border-white/5 mt-1 cursor-pointer"
                        >
                          <a 
                            href="https://github.com/Kayilainathan" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:opacity-85 group/gh"
                          >
                            <Github className="w-4.5 h-4.5 text-[#00ffcc] transition-transform group-hover/gh:scale-110" />
                            <span className="text-[11px] font-bold text-white font-mono group-hover/gh:underline">github.com/Kayilainathan</span>
                          </a>
                          <span className="text-[8px] text-slate-500 font-mono tracking-wider">stats board</span>
                        </motion.div>

                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                            visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                          }}
                          className="rounded-xl bg-white/[0.01] border border-white/5 p-2.5 space-y-2 text-left"
                        >
                          <div className="flex gap-2 items-center">
                            <div className="w-9 h-9 rounded-full border border-white/10 overflow-hidden shrink-0">
                              <ProfileVectorAvatar />
                            </div>
                            <div className="leading-tight">
                              <div className="text-[11px] font-bold text-white">Kayilainathan J</div>
                              <div className="text-[8.5px] text-slate-500 font-mono">@kayilainathan19</div>
                            </div>
                          </div>
                          
                          <p className="text-[8px] text-slate-300 font-sans leading-normal">
                            Designing from first principles. Exploring Digital Logic, Analog Electronics & ML equations.
                          </p>

                          <div className="grid grid-cols-3 gap-1.5 text-center pt-1.5 border-t border-white/5">
                            <div className="bg-black/40 p-1 rounded">
                              <div className="text-[10px] font-bold font-mono text-white">14</div>
                              <div className="text-[7px] text-slate-500 uppercase font-mono">Repos</div>
                            </div>
                            <div className="bg-black/40 p-1 rounded">
                              <div className="text-[10px] font-bold font-mono text-white">52</div>
                              <div className="text-[7px] text-slate-500 uppercase font-mono">Contrib</div>
                            </div>
                            <div className="bg-black/40 p-1 rounded">
                              <div className="text-[10px] font-bold font-mono text-white">32</div>
                              <div className="text-[7px] text-slate-500 uppercase font-mono">Follow</div>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                            visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                          }}
                          className="rounded-xl border border-white/5 p-2.5 bg-black/40 space-y-1 text-left"
                        >
                          <div className="text-[7px] font-bold font-mono text-slate-500 tracking-wider uppercase">
                            52 Contributions over past period
                          </div>
                          
                          <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                            {githubContributions.map((node) => (
                              <div
                                key={node.index}
                                className={`aspect-square rounded-[1px] transition-all duration-200 ${
                                  node.weight === 4
                                    ? "bg-emerald-300 shadow-sm shadow-emerald-400/20"
                                    : node.weight === 3
                                    ? "bg-emerald-500"
                                    : node.weight === 2
                                    ? "bg-emerald-700"
                                    : node.weight === 1
                                    ? "bg-emerald-900"
                                    : "bg-slate-800 hover:bg-slate-750"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-0.5 text-[6.5px] font-mono text-slate-500 uppercase">
                            <span>Less</span>
                            <div className="flex gap-[1.5px]">
                              <span className="w-1.5 h-1.5 rounded-[0.5px] bg-slate-800" />
                              <span className="w-1.5 h-1.5 rounded-[0.5px] bg-emerald-900" />
                              <span className="w-1.5 h-1.5 rounded-[0.5px] bg-emerald-700" />
                              <span className="w-1.5 h-1.5 rounded-[0.5px] bg-emerald-500" />
                              <span className="w-1.5 h-1.5 rounded-[0.5px] bg-emerald-300" />
                            </div>
                            <span>More</span>
                          </div>
                        </motion.div>

                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                            visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                          }}
                          className="text-left space-y-1"
                        >
                          <div className="text-[7.5px] font-mono font-bold text-slate-600 uppercase">PINNED REPOS</div>
                          <div className="bg-white/[0.01] border border-white/5 p-1.5 rounded-lg text-left transition-all duration-300 hover:border-[#00ffcc]/35 hover:bg-white/[0.03] hover:scale-[1.015]">
                            <span className="text-[9px] font-bold text-[#00ffcc] font-mono hover:underline">Verilog-4Bit-ALU</span>
                            <p className="text-[7.5px] text-slate-400 leading-normal truncate mt-0.5">
                              High fidelity 4-bit ALU programmed on Verilog HDL.
                            </p>
                          </div>
                        </motion.div>

                      </div>

                      <motion.div 
                        variants={{
                          hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
                          visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                        }}
                        className="pt-3 border-t border-white/5"
                      >
                        <button
                          onClick={triggerGitHubFollow}
                          data-umami-event="GitHub Click Bottom"
                          className="w-full py-2 px-3 rounded-lg bg-white font-bold font-mono tracking-widest text-[9px] text-black uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:bg-slate-100 hover:scale-[1.04] hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] active:scale-[0.975]"
                        >
                          <motion.div
                            animate={activeTab === "github" ? { y: [0, -2, 0], scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] } : {}}
                            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                          >
                            <Github className="w-3.5 h-3.5 text-black" />
                          </motion.div>
                          FOLLOW ON GITHUB
                        </button>
                      </motion.div>

                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* 3. iOS Home Slider Indicator */}
              <div className="w-full h-[12px] flex items-center justify-center pointer-events-none select-none z-40 bg-[#07090d] shrink-0 absolute bottom-0 left-0">
                <div className="w-[70px] h-[3px] rounded-full bg-slate-600 mb-1" />
              </div>

            </div>

        </motion.div>
      </div>
    </div>
  </div>
</div>
);
}
