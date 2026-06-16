import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Github } from "lucide-react";

// Project Data with specific telemetry parameters and interactive sub-elements
const PROJECTS = [
  {
    id: "01",
    title: "SIS Failure Predictor",
    category: "SAFETY SYSTEMS",
    description:
      "A redundant digital instrument voting system that predicts failures in safety-instrumented systems (SIS) by analyzing telemetry anomalies in real-time.",
    tags: ["Digital Logic", "Verilog", "Fail-Safe Design", "RTOS"],
    accentColor: "rgba(34, 211, 238, 1)", // Neon Cyan
    accentDim: "rgba(34, 211, 238, 0.15)",
    hudText: "SIS TELEMETRY MONITOR",
    nodes: [
      { id: "A", name: "LEG A", active: "LEG A: OPERATIONAL - V_DIFF = 0.02V, SIG_STABLE" },
      { id: "B", name: "LEG B", active: "LEG B: DEGRADED - SIG_IMPEDANCE AT 1.2M OHMS" },
      { id: "C", name: "LEG C", active: "LEG C: FAULT DETECTED - OPEN CIRCUIT TRIP STATE" }
    ],
    defaultConsole: "SIS CENTRAL CONTROL - STATUS ACTIVE - VOLTAGE DELTA NOMINAL"
  },
  {
    id: "02",
    title: "Aquifer Aquatech System",
    category: "ENVIRONMENTAL CONTROL",
    description:
      "Automated telemetry logger monitoring deep soil water tables and aquifer filters. Computes real-time drainage vectors and filtration efficiency metrics.",
    tags: ["Sensors", "Low-Power", "Signal Processing", "Data Log"],
    accentColor: "rgba(236, 72, 153, 1)", // Neon Pink / Magenta
    accentDim: "rgba(236, 72, 153, 0.15)",
    hudText: "AQUIFER DRAINAGE MAP",
    nodes: [
      { id: "soil", name: "TOP SOIL", active: "ZONE A: SOIL MOISTURE AT 42% - TEMPERATURE 24C" },
      { id: "filter", name: "AQUIFER FILTER", active: "ZONE B: FILTRATION ACTIVE - DRAINAGE RATE 4.2L/S" },
      { id: "bedrock", name: "BEDROCK", active: "ZONE C: BEDROCK SATURATION - CAPACITY LEVEL CRITICAL" }
    ],
    defaultConsole: "AQUIFER FLOW MONITOR - SIGNAL STABLE - DRAINAGE NOMINAL"
  },
  {
    id: "03",
    title: "MCU Diagnostic Unit",
    category: "EMBEDDED SYSTEMS",
    description:
      "Holographic embedded controller executing live diagnostic sweep routines across standard interfaces (TX/RX serial, clock vectors, power lines).",
    tags: ["C/C++", "MCU Core", "UART/SPI", "Hardware HUD"],
    accentColor: "rgba(253, 224, 71, 1)", // Neon Gold
    accentDim: "rgba(253, 224, 71, 0.15)",
    hudText: "MCU CORE REGISTERS",
    nodes: [
      { id: "clk", name: "PIN CLK", active: "MCU PIN CLK: OSCILLATOR NOMINAL AT 16.002MHz" },
      { id: "tx", name: "PIN TX", active: "MCU PIN TX: UART BUS TRANSMITTING - 115200 BAUD" },
      { id: "rx", name: "PIN RX", active: "MCU PIN RX: UART BUS RECEIVING - PACKET CHECKSUM OK" },
      { id: "vcc", name: "PIN VCC", active: "MCU PIN VCC: VOLTAGE NOMINAL AT +3.31V CORE" }
    ],
    defaultConsole: "MCU CORE DIAGNOSTIC - SWEEPING ALL REGISTER PINS - SYSTEM OK"
  }
];

export default function BlueprintSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = Next, -1 = Prev
  const [hoveredNode, setHoveredNode] = useState(null);
  const [pingActive, setPingActive] = useState(false);

  const activeProject = PROJECTS[currentIndex];

  // Hardware instrumentation ping simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPingActive((prev) => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleNextProject = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === PROJECTS.length - 1 ? 0 : prev + 1));
    setHoveredNode(null);
  };

  const handlePrevProject = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? PROJECTS.length - 1 : prev - 1));
    setHoveredNode(null);
  };

  // Text details Framer Motion Variants (Left Column)
  const textVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 30 : -30,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.35, ease: "easeOut" }
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -30 : 30,
      transition: { duration: 0.35, ease: "easeIn" }
    })
  };

  // SVG graphic Framer Motion Variants (Right Column)
  const svgVariants = {
    enter: (dir) => ({
      opacity: 0,
      scale: 0.9,
      rotateY: dir > 0 ? 10 : -10,
    }),
    center: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: { duration: 0.4, ease: "easeInOut" }
    },
    exit: (dir) => ({
      opacity: 0,
      scale: 0.9,
      rotateY: dir > 0 ? -10 : 10,
      transition: { duration: 0.4, ease: "easeInOut" }
    })
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* 3D Perspective setup on parent wrapper */}
      <div 
        className="relative overflow-visible"
        style={{ perspective: "1200px" }}
      >
        {/* Main blurred glassy container */}
        <div className="relative w-full bg-[#070913]/85 backdrop-blur-2xl border border-white/10 rounded-[21px] p-6 md:p-10 shadow-2xl overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* 1. LEFT COLUMN — Text details and metadata */}
            <div className="col-span-1 md:col-span-5 flex flex-col justify-center min-h-[300px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeProject.id}
                  custom={direction}
                  variants={textVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex flex-col gap-5 text-left"
                >
                  {/* Category Tracker & Serial Number */}
                  <div className="flex justify-between items-center w-full">
                    <span 
                      className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full border border-white/5"
                      style={{ 
                        color: activeProject.accentColor,
                        backgroundColor: activeProject.accentDim,
                        borderColor: `${activeProject.accentColor}30`
                      }}
                    >
                      {activeProject.category}
                    </span>
                    <span 
                      className="text-2xl font-bold font-mono opacity-20"
                      style={{ color: activeProject.accentColor }}
                    >
                      {activeProject.id}
                    </span>
                  </div>

                  {/* Monospace Main Heading */}
                  <h3 className="text-3xl font-extrabold font-mono text-white tracking-tight leading-none">
                    {activeProject.title}
                  </h3>

                  {/* Technical Paragraph Description */}
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    {activeProject.description}
                  </p>

                  {/* Categorized keyword badges & Github button link */}
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-wrap gap-2">
                      {activeProject.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="text-xs font-semibold px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition duration-300 cursor-default"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <a 
                      href="https://github.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mt-2 transition duration-300 w-fit"
                    >
                      <Github size={15} />
                      <span>SOURCE CODE REPOSITORY</span>
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 2. RIGHT COLUMN — Holographic HUD Vector SVG */}
            <div className="col-span-1 md:col-span-7 flex justify-center items-center relative min-h-[300px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeProject.id}
                  custom={direction}
                  variants={svgVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full max-w-[420px] aspect-square flex items-center justify-center relative rounded-2xl bg-black/40 border border-white/5 p-4 overflow-hidden"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Flanking Corner Brackets */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <path d="M 10 20 L 10 10 L 20 10" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" fill="none" />
                    <path d="M 180 10 L 190 10 L 190 20" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" fill="none" />
                    <path d="M 10 180 L 10 190 L 20 190" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" fill="none" />
                    <path d="M 180 190 L 190 190 L 190 180" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" fill="none" />
                  </svg>

                  {/* Corner Text Overlays */}
                  <div 
                    className="absolute top-3 left-6 font-mono text-[7px] font-bold tracking-widest transition duration-300"
                    style={{ color: "#ffffff" }}
                  >
                    [SYS_ALIGN]
                  </div>
                  <div 
                    className="absolute bottom-3 right-6 font-mono text-[7px] font-bold tracking-widest transition duration-300"
                    style={{ color: "#ffffff" }}
                  >
                    [TRX_LIVE]
                  </div>

                  {/* Blueprint Vector Display */}
                  <svg 
                    viewBox="0 0 200 200" 
                    className="w-full h-full select-none"
                    style={{ 
                      color: activeProject.accentColor,
                      "--color-accent": activeProject.accentColor
                    }}
                  >
                    <defs>
                      {/* Grid Pattern definition overlay */}
                      <pattern id={`coordGrid-${activeProject.id}`} width="16" height="16" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="0.8" fill="rgba(255, 255, 255, 0.08)" />
                        <line x1="0" y1="0" x2="16" y2="0" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
                        <line x1="0" y1="0" x2="0" y2="16" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
                      </pattern>
                    </defs>

                    {/* Background Grid */}
                    <rect width="200" height="200" fill={`url(#coordGrid-${activeProject.id})`} />

                    {/* Telemetry Display Label */}
                    <text 
                      x="100" 
                      y="24" 
                      fill="#ffffff" 
                      fontSize="6" 
                      fontFamily="monospace" 
                      letterSpacing="0.08em" 
                      textAnchor="middle" 
                      fontWeight="bold"
                    >
                      {activeProject.hudText}
                    </text>

                    {/* PROJECT-SPECIFIC VECTOR CONTENT */}
                    
                    {/* Project 1: SIS Sensor Blueprint */}
                    {activeProject.id === "01" && (
                      <g className="sensor-schematic">
                        {/* Outer circular chamber */}
                        <circle cx="100" cy="85" r="44" fill="rgba(34, 211, 238, 0.02)" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
                        <circle cx="100" cy="85" r="32" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                        
                        {/* Hardware voting system alignment lines */}
                        <line x1="100" y1="41" x2="100" y2="129" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.8" strokeDasharray="1 1" />
                        <line x1="56" y1="85" x2="144" y2="85" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.8" strokeDasharray="1 1" />

                        {/* Interactive Sensor Leg node structures */}
                        {/* LEG A (Top Center) */}
                        <g 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNode("A")}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <line x1="100" y1="85" x2="100" y2="52" stroke="currentColor" strokeWidth={hoveredNode === "A" ? 2 : 1} strokeOpacity={hoveredNode === "A" ? 0.9 : 0.4} />
                          <circle 
                            cx="100" 
                            cy="52" 
                            r={hoveredNode === "A" ? 6 : 4} 
                            fill={hoveredNode === "A" ? "var(--color-accent)" : "#070913"} 
                            stroke="currentColor" 
                            strokeWidth="1.5"
                            className="transition-all duration-300"
                          />
                          <text x="100" y="44" fill="#ffffff" fontSize="5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">L1</text>
                        </g>

                        {/* LEG B (Bottom Left) */}
                        <g 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNode("B")}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <line x1="100" y1="85" x2="72" y2="101" stroke="currentColor" strokeWidth={hoveredNode === "B" ? 2 : 1} strokeOpacity={hoveredNode === "B" ? 0.9 : 0.4} />
                          <circle 
                            cx="72" 
                            cy="101" 
                            r={hoveredNode === "B" ? 6 : 4} 
                            fill={hoveredNode === "B" ? "var(--color-accent)" : "#070913"} 
                            stroke="currentColor" 
                            strokeWidth="1.5"
                            className="transition-all duration-300"
                          />
                          <text x="63" y="103" fill="#ffffff" fontSize="5" fontFamily="monospace" textAnchor="end" fontWeight="bold">L2</text>
                        </g>

                        {/* LEG C (Bottom Right) */}
                        <g 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNode("C")}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <line x1="100" y1="85" x2="128" y2="101" stroke="currentColor" strokeWidth={hoveredNode === "C" ? 2 : 1} strokeOpacity={hoveredNode === "C" ? 0.9 : 0.4} />
                          <circle 
                            cx="128" 
                            cy="101" 
                            r={hoveredNode === "C" ? 6 : 4} 
                            fill={hoveredNode === "C" ? "var(--color-accent)" : "#070913"} 
                            stroke="currentColor" 
                            strokeWidth="1.5"
                            className="transition-all duration-300"
                          />
                          <text x="137" y="103" fill="#ffffff" fontSize="5" fontFamily="monospace" textAnchor="start" fontWeight="bold">L3</text>
                        </g>

                        {/* Core active receiver */}
                        <circle cx="100" cy="85" r="8" fill="#070913" stroke="currentColor" strokeWidth="2" />
                        <circle cx="100" cy="85" r="3" fill="currentColor" />
                      </g>
                    )}

                    {/* Project 2: Aquifer Filtration Blueprint */}
                    {activeProject.id === "02" && (
                      <g className="aquifer-schematic">
                        {/* Grid boundary frame */}
                        <rect x="35" y="42" width="130" height="85" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />

                        {/* TOP SOIL Layer */}
                        <g 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNode("soil")}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <rect 
                            x="38" 
                            y="45" 
                            width="124" 
                            height="22" 
                            fill={hoveredNode === "soil" ? "rgba(236, 72, 153, 0.12)" : "rgba(236, 72, 153, 0.02)"} 
                            stroke="currentColor" 
                            strokeWidth={hoveredNode === "soil" ? 1.2 : 0.7}
                            strokeOpacity={hoveredNode === "soil" ? 0.8 : 0.3}
                            className="transition-all duration-300"
                          />
                          <text x="100" y="58" fill="#ffffff" fontSize="5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">TOP SOIL LAYER</text>
                        </g>

                        {/* AQUIFER FILTER Layer */}
                        <g 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNode("filter")}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          {/* Aquifer wave lines */}
                          <path 
                            d="M 40 82 Q 71 74 102 82 T 164 82" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth={hoveredNode === "filter" ? 1.8 : 1} 
                            strokeOpacity="0.75" 
                          />
                          <path 
                            d="M 40 88 Q 71 80 102 88 T 164 88" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth={hoveredNode === "filter" ? 1.2 : 0.7} 
                            strokeOpacity="0.4" 
                            strokeDasharray="2 2" 
                          />
                          <rect 
                            x="38" 
                            y="73" 
                            width="124" 
                            height="22" 
                            fill="transparent" 
                            stroke={hoveredNode === "filter" ? "currentColor" : "transparent"} 
                            strokeWidth="1.2"
                            className="transition-all duration-300"
                          />
                          <text x="100" y="80" fill="#ffffff" fontSize="5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">AQUIFER VEIN</text>
                        </g>

                        {/* BEDROCK Layer */}
                        <g 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNode("bedrock")}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <rect 
                            x="38" 
                            y="101" 
                            width="124" 
                            height="22" 
                            fill={hoveredNode === "bedrock" ? "rgba(236, 72, 153, 0.12)" : "rgba(236, 72, 153, 0.02)"} 
                            stroke="currentColor" 
                            strokeWidth={hoveredNode === "bedrock" ? 1.2 : 0.7}
                            strokeOpacity={hoveredNode === "bedrock" ? 0.8 : 0.3}
                            className="transition-all duration-300"
                          />
                          <text x="100" y="114" fill="#ffffff" fontSize="5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">BEDROCK BASE</text>
                        </g>
                      </g>
                    )}

                    {/* Project 3: MCU Diagnostic Blueprint */}
                    {activeProject.id === "03" && (
                      <g className="mcu-schematic">
                        {/* Microcontroller core body */}
                        <rect x="65" y="55" width="70" height="60" rx="4" fill="rgba(253, 224, 71, 0.02)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7" />
                        <rect x="73" y="63" width="54" height="44" rx="2" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeDasharray="2 1" />
                        <text x="100" y="88" fill="#ffffff" stroke="none" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">MCU-CORE</text>

                        {/* Pin CLK */}
                        <g 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNode("clk")}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <line x1="50" y1="65" x2="65" y2="65" stroke="currentColor" strokeWidth={hoveredNode === "clk" ? 2 : 1.2} />
                          <circle cx="48" cy="65" r={hoveredNode === "clk" ? 3.5 : 2.5} fill={hoveredNode === "clk" ? "var(--color-accent)" : "#070913"} stroke="currentColor" strokeWidth="1" />
                          <text x="40" y="67" fill="#ffffff" fontSize="5" fontFamily="monospace" textAnchor="end" fontWeight="bold">CLK</text>
                        </g>

                        {/* Pin TX */}
                        <g 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNode("tx")}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <line x1="50" y1="85" x2="65" y2="85" stroke="currentColor" strokeWidth={hoveredNode === "tx" ? 2 : 1.2} />
                          <circle cx="48" cy="85" r={hoveredNode === "tx" ? 3.5 : 2.5} fill={hoveredNode === "tx" ? "var(--color-accent)" : "#070913"} stroke="currentColor" strokeWidth="1" />
                          <text x="40" y="87" fill="#ffffff" fontSize="5" fontFamily="monospace" textAnchor="end" fontWeight="bold">TX</text>
                        </g>

                        {/* Pin RX */}
                        <g 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNode("rx")}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <line x1="135" y1="65" x2="150" y2="65" stroke="currentColor" strokeWidth={hoveredNode === "rx" ? 2 : 1.2} />
                          <circle cx="150" cy="65" r={hoveredNode === "rx" ? 3.5 : 2.5} fill={hoveredNode === "rx" ? "var(--color-accent)" : "#070913"} stroke="currentColor" strokeWidth="1" />
                          <text x="157" y="67" fill="#ffffff" fontSize="5" fontFamily="monospace" textAnchor="start" fontWeight="bold">RX</text>
                        </g>

                        {/* Pin VCC */}
                        <g 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNode("vcc")}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <line x1="135" y1="85" x2="150" y2="85" stroke="currentColor" strokeWidth={hoveredNode === "vcc" ? 2 : 1.2} />
                          <circle cx="150" cy="85" r={hoveredNode === "vcc" ? 3.5 : 2.5} fill={hoveredNode === "vcc" ? "var(--color-accent)" : "#070913"} stroke="currentColor" strokeWidth="1" />
                          <text x="157" y="87" fill="#ffffff" fontSize="5" fontFamily="monospace" textAnchor="start" fontWeight="bold">VCC</text>
                        </g>
                      </g>
                    )}

                    {/* LIVE HARDWARE PING INDICATOR SWEEP */}
                    {pingActive && (
                      <g className="ping-locator" opacity="0.8">
                        <circle cx="100" cy="85" r="2.5" fill={activeProject.accentColor} />
                        <circle 
                          cx="100" 
                          cy="85" 
                          r="12" 
                          fill="none" 
                          stroke={activeProject.accentColor} 
                          strokeWidth="1" 
                          className="animate-ping" 
                        />
                      </g>
                    )}

                    {/* MOVING LASER SCANLINE */}
                    <line 
                      x1="10" 
                      y1="0" 
                      x2="190" 
                      y2="0" 
                      stroke="currentColor" 
                      strokeWidth="1.2" 
                      strokeOpacity="0.45"
                      style={{
                        animation: "laserScan 3.5s linear infinite",
                        transformOrigin: "center"
                      }}
                    />

                    {/* TELEMETRY LCD CONSOLE BOX */}
                    <rect 
                      x="15" 
                      y="155" 
                      width="170" 
                      height="25" 
                      rx="4" 
                      fill="#040711" 
                      stroke="currentColor" 
                      strokeWidth="1.2" 
                      strokeOpacity="0.16" 
                    />
                    
                    {/* Console dynamic scrolling status text */}
                    <text 
                      x="100" 
                      y="170" 
                      fill="#ffffff" 
                      fontSize="5.2" 
                      fontFamily="monospace" 
                      textAnchor="middle" 
                      fontWeight="bold"
                      className="tracking-wider uppercase"
                    >
                      {hoveredNode 
                        ? activeProject.nodes.find(n => n.id === hoveredNode)?.active 
                        : activeProject.defaultConsole
                      }
                    </text>
                  </svg>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* 3. NAVIGATION CONTROLS — Prev/Next arrows at bottom-right */}
          <div className="absolute bottom-6 right-8 flex gap-3 z-20">
            <button
              onClick={handlePrevProject}
              className="w-10 h-10 rounded-full border border-white/5 bg-white/5 hover:bg-cyan-400/5 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/5 hover:text-[#00E5FF] active:scale-95 text-slate-400 flex items-center justify-center transition duration-300 outline-none"
              aria-label="Previous Project"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={handleNextProject}
              className="w-10 h-10 rounded-full border border-white/5 bg-white/5 hover:bg-cyan-400/5 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/5 hover:text-[#00E5FF] active:scale-95 text-slate-400 flex items-center justify-center transition duration-300 outline-none"
              aria-label="Next Project"
            >
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>

      {/* Dynamic Laser CSS Animation Injection */}
      <style>{`
        @keyframes laserScan {
          0% { transform: translateY(28px); opacity: 0.1; }
          50% { opacity: 0.65; }
          100% { transform: translateY(152px); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}
