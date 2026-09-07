// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { 
  XCircle, 
  FileText, 
  Table, 
  Mail, 
  ExternalLink, 
  CalendarX, 
  CheckCircle2, 
  FileCheck2, 
  Lock, 
  CheckCircle, 
  Clock, 
  LayoutDashboard, 
  ShieldCheck 
} from 'lucide-react';
import BorderGlow from './BorderGlow';
import ShapeBlur from './ShapeBlur';

export const ProblemSolution = () => {
  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--glow-x', `${x}px`);
    card.style.setProperty('--glow-y', `${y}px`);
    card.style.setProperty('--glow-intensity', '1');
  };

  const handleCardPointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--glow-intensity', '0');
  };

  return (
    <section className="w-full bg-parchment relative py-[4.5rem] border-b border-sand overflow-hidden" id="problem-solution">
      {/* Living Botanical Dynamic Atmosphere */}
      <div className="botanical-atmosphere" />
      
      {/* Ghost Fibers Background */}
      <div className="absolute inset-0 opacity-[0.12] mix-blend-multiply pointer-events-none overflow-hidden">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.1 0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)"></rect>
        </svg>
      </div>

      {/* Subtle botanical manuscript pattern */}
      <div className="absolute inset-0 botanical-pattern pointer-events-none opacity-40" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[1680px] mx-auto px-[1rem] md:px-[2rem] relative z-10"
      >
        <div className="max-w-3xl mb-[3rem]">
          <span className="font-body text-[12px] leading-[16px] tracking-[0.08em] uppercase font-bold text-herbal block mb-2.5">
            Architecture Convergence
          </span>
          <h2 className="font-heading text-[38px] sm:text-[44px] md:text-[48px] leading-[1.15] tracking-[-0.02em] font-[600] text-forest">
            Transforming fragmented research into <span className="text-ochre italic font-normal">unified intelligence.</span>
          </h2>
          <p className="font-body text-[17px] sm:text-[18px] leading-[28px] font-[400] text-earth mt-3">
            Replace vulnerable manual silos with an integrated, auditable clinical operating system.
          </p>
        </div>

        {/* Cohesive 3-Stage Flow Grid - Structurally Balanced */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[1.5rem] items-stretch">
          
          {/* Stage 1: Current Friction (Left) */}
          <div
            onPointerMove={handleCardPointerMove}
            onPointerLeave={handleCardPointerLeave}
            className="lg:col-span-4 rounded-2xl bg-white p-[1.75rem] border border-sand flex flex-col justify-between shadow-sm group hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden magic-bento-card--border-glow"
          >
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-multiply">
              <ShapeBlur variation={1} circleSize={0.4} />
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffdad6]/20 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-150 group-hover:opacity-50 z-0" />
            
            <div>
              <div className="flex items-center justify-between relative z-10 mb-4">
                <span className="font-body text-[11px] leading-[14px] tracking-[0.05em] uppercase tracking-wider text-[#ba1a1a] font-bold flex items-center gap-[0.35rem]">
                  <XCircle className="w-4 h-4 text-[#ba1a1a]" /> Current Friction
                </span>
                <span className="font-body text-[11px] px-[0.5rem] py-[0.125rem] rounded-[6px] bg-[#ffdad6] text-[#93000a] font-bold">
                  High Vulnerability
                </span>
              </div>
              
              <div className="space-y-[0.5rem] relative z-10">
                <div className="p-[0.75rem] rounded-xl bg-cream border border-sand flex items-center justify-between">
                  <div className="flex items-center gap-[0.5rem]">
                    <FileText className="w-[18px] h-[18px] text-[#ba1a1a]" />
                    <span className="font-body text-[14px] font-[600] text-forest font-medium">Paper CRFs</span>
                  </div>
                  <span className="font-body text-[11px] text-[#ba1a1a] font-medium">Data Loss</span>
                </div>
                <div className="p-[0.75rem] rounded-xl bg-cream border border-sand flex items-center justify-between">
                  <div className="flex items-center gap-[0.5rem]">
                    <Table className="w-[18px] h-[18px] text-[#ba1a1a]" />
                    <span className="font-body text-[14px] font-[600] text-forest font-medium">Isolated Spreadsheets</span>
                  </div>
                  <span className="font-body text-[11px] text-[#ba1a1a] font-medium">Version Drift</span>
                </div>
                <div className="p-[0.75rem] rounded-xl bg-cream border border-sand flex items-center justify-between">
                  <div className="flex items-center gap-[0.5rem]">
                    <Mail className="w-[18px] h-[18px] text-[#ba1a1a]" />
                    <span className="font-body text-[14px] font-[600] text-forest font-medium">Scattered Emails</span>
                  </div>
                  <span className="font-body text-[11px] text-[#ba1a1a] font-medium">Missed Triage</span>
                </div>
                <div className="p-[0.75rem] rounded-xl bg-cream border border-sand flex items-center justify-between">
                  <div className="flex items-center gap-[0.5rem]">
                    <ExternalLink className="w-[18px] h-[18px] text-[#ba1a1a]" />
                    <span className="font-body text-[14px] font-[600] text-forest font-medium">Separate CTRI / IEC Portals</span>
                  </div>
                  <span className="font-body text-[11px] text-[#ba1a1a] font-medium">Lapsed Clearance</span>
                </div>
                <div className="p-[0.75rem] rounded-xl bg-cream border border-sand flex items-center justify-between">
                  <div className="flex items-center gap-[0.5rem]">
                    <CalendarX className="w-[18px] h-[18px] text-[#ba1a1a]" />
                    <span className="font-body text-[14px] font-[600] text-forest font-medium">Manual Revisit Calendars</span>
                  </div>
                  <span className="font-body text-[11px] text-[#ba1a1a] font-medium">Protocol Breaches</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stage 2: AyurVedhya Central Core (Clean, Non-scrollable, Balanced) */}
          <BorderGlow
            className="lg:col-span-4 rounded-2xl bg-forest text-white shadow-md flex flex-col justify-between relative overflow-hidden text-center group hover:-translate-y-1 transition-all duration-300 h-full magic-bento-card--border-glow"
            glowColor="40 100 70"
            backgroundColor="#173B2A"
            animated={true}
            data-bg="dark"
          >
            <div 
              onPointerMove={handleCardPointerMove}
              onPointerLeave={handleCardPointerLeave}
              className="p-[1.75rem] sm:p-[2rem] relative h-full flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle mandala/geometric background for the dark card */}
              <div 
                className="absolute inset-0 opacity-10 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 pointer-events-none" 
                style={{ 
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'20\' fill=\'none\' stroke=\'%23FAF8F5\' stroke-width=\'1\'/%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'25\' fill=\'none\' stroke=\'%23FAF8F5\' stroke-width=\'0.5\'/%3E%3Cpath d=\'M30 5 L30 55 M5 30 L55 30\' stroke=\'%23FAF8F5\' stroke-width=\'0.5\'/%3E%3C/svg%3E")', 
                  backgroundPosition: 'center', 
                  backgroundRepeat: 'no-repeat', 
                  backgroundSize: '150%' 
                }} 
              />
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-deep-green pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                {/* Official Brand Logo replacing raw 'hub' icon */}
                <div className="w-16 h-16 rounded-2xl bg-white/95 p-2 text-forest flex items-center justify-center mx-auto mb-[1rem] shadow-md border border-leaf/50 group-hover:border-leaf group-hover:scale-105 transition-all duration-300">
                  <img 
                    src="/Logo/Final_Logo.png" 
                    alt="AyurVedhya Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>

                <span className="font-body text-[11px] leading-[14px] tracking-[0.05em] uppercase tracking-wider text-saffron font-bold block mb-[0.25rem]">
                  The Transformation Engine
                </span>
                <h3 className="font-heading text-[24px] leading-[32px] tracking-[-0.01em] font-[600] text-white mb-[0.75rem]">
                  AyurVedhya Central Core
                </h3>
                <p className="font-body text-[14px] leading-[22px] font-[400] text-sage mb-[1.25rem]">
                  Harmonizes disparate clinical data streams into a single immutable repository with cryptographic audit integrity.
                </p>
              </div>

              {/* Static Immutable Trust Pillars (Zero internal scroll, clean structured balance) */}
              <div className="space-y-[0.6rem] pt-[1.25rem] border-t border-deep-green/80 text-left relative z-10 w-full">
                <div className="p-[0.75rem] rounded-xl bg-white/5 border border-white/10 flex items-center gap-[0.75rem]">
                  <CheckCircle2 className="w-[18px] h-[18px] text-leaf shrink-0" />
                  <span className="font-body text-[13px] text-cream font-medium">Single Source of Truth</span>
                </div>
                <div className="p-[0.75rem] rounded-xl bg-white/5 border border-white/10 flex items-center gap-[0.75rem]">
                  <FileCheck2 className="w-[18px] h-[18px] text-leaf shrink-0" />
                  <span className="font-body text-[13px] text-cream font-medium">Zero Manual Re-transcription</span>
                </div>
                <div className="p-[0.75rem] rounded-xl bg-white/5 border border-white/10 flex items-center gap-[0.75rem]">
                  <Lock className="w-[18px] h-[18px] text-leaf shrink-0" />
                  <span className="font-body text-[13px] text-cream font-medium">Continuous 21 CFR Part 11 Auditability</span>
                </div>
              </div>
            </div>
          </BorderGlow>

          {/* Stage 3: Unified Operations (Right) */}
          <div
            onPointerMove={handleCardPointerMove}
            onPointerLeave={handleCardPointerLeave}
            className="lg:col-span-4 rounded-2xl bg-white p-[1.75rem] border border-sand flex flex-col justify-between gap-[1rem] shadow-sm group hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden magic-bento-card--border-glow"
          >
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-multiply">
              <ShapeBlur variation={1} circleSize={0.4} />
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-deep-green/5 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-150 group-hover:opacity-50 z-0" />
            
            <div>
              <div className="flex items-center justify-between relative z-10 mb-4">
                <span className="font-body text-[11px] leading-[14px] tracking-[0.05em] uppercase tracking-wider text-herbal font-bold flex items-center gap-[0.35rem]">
                  <CheckCircle2 className="w-4 h-4 text-herbal" /> Transformed Result
                </span>
                <span className="font-body text-[11px] px-[0.5rem] py-[0.125rem] rounded-[6px] border border-leaf bg-cream text-forest font-bold">
                  GCP-ASU Compliant
                </span>
              </div>
              
              <div className="space-y-[0.5rem] relative z-10">
                <div className="p-[0.75rem] rounded-xl bg-cream border border-sand flex items-center gap-[0.75rem]">
                  <CheckCircle className="w-5 h-5 text-herbal shrink-0" />
                  <div>
                    <span className="font-body text-[14px] font-[600] text-forest font-semibold block">
                      Automated Regulatory Workflows
                    </span>
                    <span className="font-body text-[12px] text-earth">
                      Instant IEC amendments &amp; renewal tracking
                    </span>
                  </div>
                </div>
                <div className="p-[0.75rem] rounded-xl bg-cream border border-sand flex items-center gap-[0.75rem]">
                  <Clock className="w-5 h-5 text-herbal shrink-0" />
                  <div>
                    <span className="font-body text-[14px] font-[600] text-forest font-semibold block">
                      24-Hour Expedited Safety Triage
                    </span>
                    <span className="font-body text-[12px] text-earth">
                      Real-time causality routing to ethics boards
                    </span>
                  </div>
                </div>
                <div className="p-[0.75rem] rounded-xl bg-cream border border-sand flex items-center gap-[0.75rem]">
                  <LayoutDashboard className="w-5 h-5 text-herbal shrink-0" />
                  <div>
                    <span className="font-body text-[14px] font-[600] text-forest font-semibold block">
                      Executive Portfolio Visibility
                    </span>
                    <span className="font-body text-[12px] text-earth">
                      Live enrollment, retention &amp; compliance metrics
                    </span>
                  </div>
                </div>
                <div className="p-[0.75rem] rounded-xl bg-cream border border-sand flex items-center gap-[0.75rem]">
                  <ShieldCheck className="w-5 h-5 text-herbal shrink-0" />
                  <div>
                    <span className="font-body text-[14px] font-[600] text-forest font-semibold block">
                      Cryptographic Data Integrity
                    </span>
                    <span className="font-body text-[12px] text-earth">
                      ALCOA+ standard SHA-256 signature sealing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
};

