import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [glitchActive, setGlitchActive] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isExiting, setIsExiting] = useState(false);
  const [seed, setSeed] = useState(0);

  const progressRef = useRef(0);
  const logIndexRef = useRef(0);

  const logPool = [
    "SCANNING COGNITIVE OVERLAY...",
    "BRAIN DENSITY: CRITICAL OVERLOAD",
    "INJECTING EINSTEIN COEFFICIENTS...",
    "SMARTPERSON DETECTED: KAYILAINATHAN",
    "IQ INDEX: SIGNIFICANT OVERFLOW",
    "SYNAPSE TRANSMISSION: MAXIMUM",
    "LOGIC MATRIX: NOMINAL LOCK"
  ];

  // Wiggle filter seed loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSeed((s) => (s + 1) % 10);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Main loader ticker and state updates
  useEffect(() => {
    const progressInterval = setInterval(() => {
      const current = progressRef.current;
      if (current >= 100) {
        clearInterval(progressInterval);
        return;
      }

      let increment = 1;
      if (current < 30) {
        // Phase 1 - Intro: slow (random 1 to 2)
        increment = Math.floor(Math.random() * 2) + 1;
      } else if (current >= 30 && current < 65) {
        // Phase 2 - Folder Decryption: speed up (random 2 to 4)
        increment = Math.floor(Math.random() * 3) + 2;
      } else if (current >= 65 && current < 90) {
        // Phase 3 - Core Calibration: slow down (random 1 to 2)
        increment = Math.floor(Math.random() * 2) + 1;
      } else {
        // Phase 4 - Success Unlock: speed to completion (random 3 to 6)
        increment = Math.floor(Math.random() * 4) + 3;
      }

      const next = Math.min(current + increment, 100);
      const prev = current;
      progressRef.current = next;
      setProgress(next);

      // Transition glitches
      const checkThreshold = (val, prevVal, thresh) =>
        prevVal < thresh && val >= thresh;

      if (checkThreshold(next, prev, 31) || checkThreshold(next, prev, 66) || checkThreshold(next, prev, 91)) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 250);
      }

      // Update phases and logs
      if (next <= 30) {
        setPhase("intro");
      } else if (next > 30 && next <= 65) {
        setPhase("folder");
      } else if (next > 65 && next <= 90) {
        setPhase("core");
        // Update telemetry log stream every 4 increments
        const lastDiv = Math.floor(prev / 4);
        const nextDiv = Math.floor(next / 4);
        if (nextDiv > lastDiv) {
          const logIdx = logIndexRef.current % logPool.length;
          logIndexRef.current += 1;
          setLogs((l) => [...l, logPool[logIdx]].slice(-4));
        }
      } else {
        setPhase("finished");
      }

      if (next === 100) {
        clearInterval(progressInterval);
        // Wait exactly 1500ms before starting exit sequence
        setTimeout(() => {
          setIsExiting(true);
        }, 1500);
      }
    }, 60);

    return () => clearInterval(progressInterval);
  }, []);

  // Handle exiting component removal
  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isExiting, onComplete]);

  // White hand cursor coordinates
  const getCursorProps = () => {
    if (progress < 27) {
      const ratio = progress / 27;
      return {
        x: 280 + (145 - 280) * ratio,
        y: 220 + (120 - 220) * ratio,
        scale: 1,
        visible: true
      };
    } else if (progress >= 27 && progress <= 30) {
      return {
        x: 145,
        y: 120,
        scale: 0.85,
        visible: true
      };
    } else {
      return {
        x: 500,
        y: 500,
        scale: 1,
        visible: false
      };
    }
  };

  const cursor = getCursorProps();

  return (
    <div className="fixed inset-0 z-[99999] bg-[#03050a] text-white flex flex-col items-center justify-center p-4 overflow-hidden select-none font-sans">

      {/* SVG wiggle filter */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="vector-wiggle" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed={seed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* State-wide high contrast flash */}
      {glitchActive && (
        <div className="absolute inset-0 bg-white/25 mix-blend-difference z-[99999] pointer-events-none" />
      )}

      {/* Heavy Shutter Columns Background Panels */}
      <div className="absolute inset-0 z-0 pointer-events-none flex overflow-hidden">
        {[...Array(3)].map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ translateY: "0%" }}
            animate={isExiting ? { translateY: "-100%" } : { translateY: "0%" }}
            transition={{
              duration: 0.8,
              delay: idx * 0.1,
              ease: [0.76, 0, 0.24, 1]
            }}
            className="w-[33.333%] h-full bg-[#0d0f14] border-x border-slate-900 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"
          />
        ))}
      </div>

      {/* Preloader desk scene content */}
      <motion.div
        animate={isExiting ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex flex-col items-center max-w-full scale-[0.85] sm:scale-100"
        style={{ perspective: "1000px" }}
      >

        {/* RETRO CRT COMPUTER MONITOR CASE */}
        <div className="relative w-[350px] h-[330px] bg-gradient-to-b from-[#efeede] via-[#dedccb] to-[#cecbba] rounded-[32px] border-[10px] border-[#dedccb] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),inset_0_4px_0_rgba(255,255,255,0.6)] flex flex-col justify-between p-4 overflow-visible">

          {/* Top ventilation slits of retro CRT casing */}
          <div className="absolute top-[-10px] left-12 right-12 h-2 bg-[#b6b4a3] rounded-b border-b border-white/10 flex gap-[3px] px-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-1 bg-slate-950/80 h-full" />
            ))}
          </div>

          {/* ACTIVE CRT GLASS SCREEN AREA */}
          <div className="relative w-full h-[230px] bg-[#0a0d13] rounded-2xl overflow-hidden border-[5px] border-[#a09e91] select-none shadow-[inset_0_12px_24px_rgba(0,0,0,0.95)]">

            {/* Curved glass screen reflections & scanlines */}
            <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.22]"
              style={{
                background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.28) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.04))",
                backgroundSize: "100% 3px, 6px 100%"
              }}
            />
            <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]" />
            <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-tr from-white/[0.02] to-white/[0.07] bg-no-repeat" />

            {/* SCREEN CONTENT CONTAINER */}
            <div className="w-full h-full relative overflow-hidden" style={{ animation: "crt-flicker 0.15s infinite" }}>

              {/* PHASE 1: DANGER-RED INTRO */}
              {phase === "intro" && (
                <div className="w-full h-full bg-[#f43f5e] flex flex-col items-center justify-center p-3 relative">
                  <div className="absolute top-2 left-3 text-[7px] font-mono text-white/70 tracking-widest font-bold">
                    SYSTEM GATEWAY VERSION 19.6.7
                  </div>
                  <div className="flex flex-col items-center leading-[0.95] text-white select-none pointer-events-none text-center" style={{ filter: "url(#vector-wiggle)" }}>
                    <span className="text-[52px] font-black tracking-tight drop-shadow-[4px_4px_0_#0f172a]">PORT</span>
                    <span className="text-[52px] font-black tracking-tight drop-shadow-[4px_4px_0_#0f172a]">FOLIO</span>
                  </div>
                </div>
              )}

              {/* PHASE 2: INDIGO DECRYPTING FOLDER */}
              {phase === "folder" && (
                <div className="w-full h-full bg-[#0a0e1a] flex flex-col items-center justify-center p-4 relative">
                  <div className="flex flex-col items-center gap-2 relative z-10 scale-95">
                    <div className="relative w-28 h-20 flex items-center justify-center" style={{ perspective: "400px" }}>
                      <div className="absolute w-12 h-12 rounded-full bg-orange-500/35 blur-md top-4 animate-pulse" />
                      <svg viewBox="0 0 100 80" className="w-full h-full text-amber-500 overflow-visible" style={{ filter: "url(#vector-wiggle)" }}>
                        <path d="M10,15 L35,15 L43,23 L90,23 L90,70 L10,70 Z" fill="#1e1b4b" stroke="#000000" strokeWidth="2.5" />
                        <path d="M20,22 L80,22 L80,68 L20,68 Z" fill="#fbbf24" stroke="#000000" strokeWidth="2" />
                        <g>
                          <rect x="28" y="30" width="22" height="2.5" fill="#c2410c" />
                          <rect x="28" y="38" width="34" height="2.5" fill="#c2410c" />
                          <rect x="28" y="46" width="18" height="2.5" fill="#c2410c" />
                        </g>
                        <motion.path
                          d="M10,23 L90,23 L90,70 L10,70 Z"
                          fill="#4338ca"
                          stroke="#000000"
                          strokeWidth="3"
                          style={{ transformOrigin: "50px 70px" }}
                          animate={{ rotateX: [0, -25, -45, -25, 0] }}
                          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        />
                      </svg>
                    </div>
                    <span className="font-mono text-[9px] text-orange-400 font-black tracking-widest mt-1 animate-pulse">
                      DECRYPTING ARCHIVE VOLUMES...
                    </span>
                  </div>
                </div>
              )}

              {/* PHASE 3: TELEMETRY CALIBRATION CORE */}
              {phase === "core" && (
                <div className="w-full h-full bg-[#05080e] flex flex-col justify-between p-3.5 relative">
                  <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-500 pb-1.5 border-b border-slate-800/80">
                    <span>KAYILAINATHAN PORTFOLIO LOADING</span>
                    <span className="text-[#10b981] font-bold animate-pulse">STATUS: CALIBRATING</span>
                  </div>

                  <div className="flex gap-4 items-center flex-1 py-2">
                    <div className="relative shrink-0 flex items-center justify-center w-[76px] h-[76px] bg-slate-950 rounded-xl border border-slate-800/70">
                      <div className="absolute w-12 h-12 border border-emerald-500/10 rounded-full animate-ping" />
                      <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                        viewBox="0 0 100 100"
                        className="w-[52px] h-[52px] text-emerald-500 overflow-visible"
                        style={{ filter: "url(#vector-wiggle)" }}
                      >
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4.5" strokeDasharray="12 12" fill="none" />
                        <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" fill="none" opacity="0.6" />
                        <circle cx="20" cy="50" r="10" fill="currentColor" stroke="#000000" strokeWidth="3" />
                        <circle cx="80" cy="50" r="10" fill="currentColor" stroke="#000000" strokeWidth="3" />
                        <circle cx="50" cy="20" r="10" fill="#f59e0b" stroke="#000000" strokeWidth="3" />
                        <circle cx="50" cy="80" r="10" fill="#ea580c" stroke="#000000" strokeWidth="3" />
                        <text x="20" y="53.5" fontFamily="monospace" fontSize="9" fontWeight="900" fill="black" textAnchor="middle">K</text>
                        <text x="80" y="53.5" fontFamily="monospace" fontSize="9" fontWeight="900" fill="black" textAnchor="middle">J</text>
                        <text x="50" y="22.5" fontFamily="monospace" fontSize="5.5" fontWeight="900" fill="black" textAnchor="middle">HELLO</text>
                        <text x="50" y="82.5" fontFamily="monospace" fontSize="4.5" fontWeight="900" fill="black" textAnchor="middle">A WHILE</text>
                      </motion.svg>
                    </div>

                    <div className="flex-1 flex flex-col gap-0.5 font-mono text-[7px] text-slate-400 text-left select-none overflow-hidden h-[95px] justify-end">
                      {logs.map((log, i) => (
                        <div key={i} className="truncate tracking-wider">
                          <span className="text-[#10b981] font-bold mr-1">&gt;</span>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[7px] font-mono text-slate-500 pt-1.5 border-t border-slate-800/80">
                    <span>CALIBRATING CORE MATRIX</span>
                    <span className="text-amber-400 font-bold animate-pulse">hello a while nodes</span>
                  </div>
                </div>
              )}

              {/* PHASE 4: PHOSPHORUS-GREEN UNLOCKED */}
              {phase === "finished" && (
                <div className="w-full h-full bg-[#1e2e2a] flex flex-col items-center justify-center p-3 relative">
                  {/* corner crosshairs */}
                  <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-emerald-500/40" />
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-emerald-500/40" />
                  <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-emerald-500/40" />
                  <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-emerald-500/40" />

                  <div className="flex flex-col items-center leading-[0.95] text-emerald-400 text-center select-none" style={{ filter: "url(#vector-wiggle)" }}>
                    <span className="text-[12px] font-mono tracking-widest font-black opacity-85 mb-1.5">SUCCESSFULLY SECURED</span>
                    <span className="text-[38px] font-black tracking-tight drop-shadow-[2.5px_2.5px_0_#05150f] text-[#10b981]">UNLOCKED</span>
                  </div>
                </div>
              )}

            </div>

            {/* PROGRESS VALUE COUNTER */}
            <div className="absolute bottom-2.5 right-3 font-mono text-[9px] text-[#10b981] bg-slate-950/85 px-2 py-0.5 rounded border border-slate-800 select-none flex items-center gap-1.5 z-30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>LOAD: {progress}%</span>
            </div>

            {/* WHITE MOUSE CURSOR */}
            {cursor.visible && (
              <div
                className="absolute pointer-events-none select-none z-50 transition-transform duration-[60ms] ease-out"
                style={{
                  left: `${cursor.x}px`,
                  top: `${cursor.y}px`,
                  transform: `scale(${cursor.scale})`
                }}
              >
                <svg width="42" height="42" viewBox="0 0 100 100" fill="none" className="drop-shadow-[2px_10px_6px_rgba(0,0,0,0.65)]">
                  <path d="M10,12 L82,46 L49,54 L85,88 L70,98 L34,64 L10,82 Z" fill="#ffffff" stroke="#000000" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
                  {progress >= 27 && progress <= 30 && (
                    <circle cx="10" cy="12" r="14" fill="none" stroke="#f43f5e" strokeWidth="3" className="animate-ping" />
                  )}
                </svg>
              </div>
            )}

          </div>

          {/* BOTTOM BEZEL CONTROLS */}
          <div className="relative z-10 w-full flex justify-between items-center px-1 select-none">
            <div className="flex items-center gap-2">
              <div className="w-20 h-3 bg-slate-950/90 rounded border-t border-slate-700/35 flex justify-between px-1.5 items-center relative overflow-hidden">
                <div className="w-14 h-[2.5px] bg-[#1a1f29]" />
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${progress < 30 ? "bg-[#ea580c] shadow-[0_0_5px_#ea580c]" : progress >= 30 && progress < 90 ? "bg-[#10b981] shadow-[0_0_5px_#10b981]" : "bg-[#f59e0b] shadow-[0_0_5px_#f59e0b] animate-pulse"
                  }`} />
              </div>
              <span className="text-[7px] font-mono font-bold text-slate-500/80">3.5" HD</span>
            </div>

            <div className="font-mono text-[9px] font-bold text-slate-500 tracking-wider absolute left-1/2 transform -translate-x-1/2 select-none" style={{ filter: "url(#vector-wiggle)" }}>
              kayilai // PORTFOLIO
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-gradient-to-b from-slate-400 to-slate-500 border border-slate-600/40 flex items-center justify-center shadow-inner">
                  <div className="w-[1.2px] h-[6px] bg-slate-800 transform rotate-45" />
                </div>
                <div className="w-3 h-3 rounded-full bg-gradient-to-b from-slate-400 to-slate-500 border border-slate-600/40 flex items-center justify-center shadow-inner">
                  <div className="w-[1.2px] h-[6px] bg-slate-800 transform rotate-[-12deg]" />
                </div>
              </div>
              <div className="flex items-center gap-1 bg-slate-900/10 px-1 py-0.5 rounded border border-slate-800/35">
                <div className="w-2.5 h-1.5 bg-slate-800 rounded-sm relative overflow-hidden flex items-end justify-center">
                  <div className="w-full h-1/2 bg-emerald-500" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 border border-emerald-500/30 shadow-[0_0_6px_#10b981] animate-pulse" />
              </div>
            </div>
          </div>

        </div>

      </motion.div>

      {/* Retro Exit sequence overlays on progress = 100 */}
      {phase === "finished" && progress === 100 && (
        <div className="absolute inset-0 z-[10000] pointer-events-none flex items-center justify-center">
          {/* Horizontal contracting scanner line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.18, delay: 0.45 }}
            className="absolute inset-x-0 h-[3px] bg-white z-[10002]"
          />
          {/* Screen blackout curtain */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22, delay: 0.55 }}
            className="absolute inset-0 bg-slate-950 z-[10001]"
          />
          {/* Phosphor fading dot */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 0.2, delay: 0.7 }}
            className="absolute w-[18px] h-[18px] rounded-full bg-white z-[10003] blur-xs"
          />
        </div>
      )}

      {/* Styled animation keyframes inside preloader container */}
      <style>{`
        @keyframes crt-flicker {
          0% { opacity: 0.975; }
          50% { opacity: 1; }
          100% { opacity: 0.98; }
        }
      `}</style>

    </div>
  );
}
