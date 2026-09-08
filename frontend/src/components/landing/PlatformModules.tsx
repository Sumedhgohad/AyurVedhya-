import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderKanban, 
  UserCheck, 
  AlertTriangle, 
  BellRing, 
  Scale, 
  CheckCircle2, 
  ChevronRight, 
  FileCheck2, 
  Lock 
} from 'lucide-react';

export const PlatformModules = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!spotlightRef.current || !sectionRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      if (!spotlightRef.current || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      spotlightRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(168,184,154, 0.18), transparent 75%)`;
    });
  }, []);

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

  const modulesLeft = [
    {
      id: "MOD-01",
      IconComponent: FolderKanban,
      title: "Study Management",
      desc: "Setup to close-out, eTMF allocation, and milestone scheduling.",
      tag: "Multi-Center Orchestration"
    },
    {
      id: "MOD-02",
      IconComponent: UserCheck,
      title: "Patients & Visits",
      desc: "Enrolment tracking, automated visit windows, and classical Prakriti eCRFs.",
      tag: "Automated Window Alerts"
    },
    {
      id: "MOD-03",
      IconComponent: AlertTriangle,
      title: "Safety & Pharmacovigilance",
      desc: "AE/SAE triage with 24-hr expedited notifications.",
      tag: "24h Expedited Routing"
    }
  ];

  const modulesRight = [
    {
      id: "MOD-04",
      IconComponent: BellRing,
      title: "Compliance & Alerts",
      desc: "Proactive risk engine for regulatory renewals and protocol deviations.",
      tag: "Proactive Risk Engine"
    },
    {
      id: "MOD-05",
      IconComponent: Scale,
      title: "Ethics & CTRI",
      desc: "Institutional IEC dossiers, protocol amendments, and CTRI updates.",
      tag: "Regulatory Governance"
    },
    {
      id: "MOD-06",
      IconComponent: CheckCircle2,
      title: "Audit & Data Integrity",
      desc: "21 CFR Part 11 compliant cryptographically verified immutable logs.",
      tag: "21 CFR / ALCOA+ Ready"
    }
  ];

  const cardVariantsLeft = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.25, 1, 0.5, 1] as const }
    })
  };

  const cardVariantsRight = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.25, 1, 0.5, 1] as const }
    })
  };

  const renderModuleCard = (mod: typeof modulesLeft[0], index: number, isLeft: boolean) => {
    const Icon = mod.IconComponent;
    return (
      <motion.div
        key={mod.id}
        custom={index}
        variants={isLeft ? cardVariantsLeft : cardVariantsRight}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        onPointerMove={handleCardPointerMove}
        onPointerLeave={handleCardPointerLeave}
        className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-parchment border border-sand hover:border-herbal/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden magic-bento-card--border-glow"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-125 duration-500 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-[10px] bg-white border border-sand text-herbal flex items-center justify-center shadow-xs group-hover:border-herbal/30 transition-colors">
              <Icon className="w-5 h-5 text-herbal" />
            </div>
            <span className="font-body text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-earth uppercase bg-white/60 px-2 py-0.5 rounded border border-sand/60">
              {mod.id}
            </span>
          </div>
          <h3 className="font-heading text-[21px] leading-[28px] tracking-[-0.01em] font-semibold text-forest mb-2">
            {mod.title}
          </h3>
          <p className="font-body text-[14px] leading-[22px] font-normal text-earth">
            {mod.desc}
          </p>
        </div>

        <div className="pt-3.5 mt-4 flex items-center justify-between border-t border-sand/60 relative z-10">
          <span className="font-body text-[11px] leading-[14px] tracking-[0.05em] font-semibold text-herbal uppercase">
            {mod.tag}
          </span>
          <ChevronRight className="w-4 h-4 text-herbal group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.div>
    );
  };

  return (
    <section 
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      className="w-full bg-cream relative py-16 sm:py-20 border-b border-sand overflow-hidden" 
      id="modules"
    >
      {/* Dynamic Botanical Living Atmosphere */}
      <div className="botanical-atmosphere" />
      <div className="absolute inset-0 botanical-pattern pointer-events-none opacity-35" />

      {/* Throttled Ambient Spotlight */}
      <div 
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0 opacity-70"
        style={{ background: 'radial-gradient(600px circle at 50% 30%, rgba(168,184,154, 0.15), transparent 75%)' }}
      />
      
      {/* Subtle background wash */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-parchment/40 to-transparent pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 md:px-8 relative z-10"
      >
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="font-body text-[12px] leading-[16px] tracking-[0.08em] uppercase font-bold text-herbal block mb-2.5">
            Platform Modules
          </span>
          <h2 className="font-heading text-[38px] sm:text-[44px] md:text-[48px] leading-[1.15] tracking-[-0.02em] font-[600] text-forest">
            From fragmented workflows to <span className="text-ochre italic font-normal">one connected platform.</span>
          </h2>
          <p className="font-body text-[17px] sm:text-[18px] leading-[28px] font-[400] text-earth mt-3">
            Six integrated modules built for institutional rigor and Good Clinical Practice standards.
          </p>
        </div>
        
        {/* Symmetrical Orchestration Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Wing (Modules 01 - 03) */}
          <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
            {modulesLeft.map((mod, i) => renderModuleCard(mod, i, true))}
          </div>

          {/* Central Visual Anchor (AyurVedhya Central Core with Official Logo) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            onPointerMove={handleCardPointerMove}
            onPointerLeave={handleCardPointerLeave}
            className="lg:col-span-4 rounded-2xl bg-forest text-white p-7 sm:p-8 shadow-md border border-leaf/30 flex flex-col justify-between relative overflow-hidden text-center group magic-bento-card--border-glow"
          >
            {/* Subtle radial & geometric decorative elements */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-deep-green/60 pointer-events-none blur-xl" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-herbal/30 pointer-events-none blur-xl" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Brand Logo replacing raw 'hub' icon */}
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-white/95 p-2.5 text-forest flex items-center justify-center shadow-md border border-leaf/50 group-hover:border-leaf group-hover:scale-105 transition-all duration-300">
                  <img 
                    src="/Logo/Final_Logo.png" 
                    alt="AyurVedhya Brand Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-saffron" />
                </span>
              </div>

              {/* Central Core Meta */}
              <span className="font-body text-[11px] leading-[14px] tracking-[0.06em] uppercase text-saffron font-bold block mb-2">
                The Transformation Engine
              </span>
              <h3 className="font-heading text-[26px] sm:text-[28px] leading-[34px] tracking-[-0.01em] font-semibold text-white mb-3">
                AyurVedhya Central Core
              </h3>
              <p className="font-body text-[14px] leading-[22px] font-normal text-sage max-w-sm mx-auto mb-6">
                Harmonizes disparate clinical data streams into a single immutable repository with cryptographic audit integrity.
              </p>

              {/* Symmetrical Connection Badges */}
              <div className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 border border-white/10 mb-6">
                <span className="w-2 h-2 rounded-full bg-leaf animate-pulse" />
                <span className="font-body text-[12px] font-medium text-cream/90">
                  Six Clinical Streams Interconnected
                </span>
              </div>
            </div>

            {/* Central Core Trust Ledger */}
            <div className="space-y-3 pt-5 border-t border-deep-green text-left relative z-10">
              <div className="flex items-center gap-2.5 text-[13px] text-cream">
                <CheckCircle2 className="w-[18px] h-[18px] text-leaf shrink-0" />
                <span className="font-body">Single Source of Truth</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-cream">
                <FileCheck2 className="w-[18px] h-[18px] text-leaf shrink-0" />
                <span className="font-body">Zero Manual Re-transcription</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-cream">
                <Lock className="w-[18px] h-[18px] text-leaf shrink-0" />
                <span className="font-body">Continuous 21 CFR Part 11 Auditability</span>
              </div>
            </div>
          </motion.div>

          {/* Right Wing (Modules 04 - 06) */}
          <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
            {modulesRight.map((mod, i) => renderModuleCard(mod, i, false))}
          </div>

        </div>
      </motion.div>
    </section>
  );
};

