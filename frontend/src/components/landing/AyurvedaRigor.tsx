// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, FlaskConical, BookOpen } from 'lucide-react';
import { StarBorder } from './ui/StarBorder';
import LogoLoop from './LogoLoop';

export const AyurvedaRigor = () => {
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

  const complianceLogos = [
    { node: <div className="p-3 rounded-xl bg-parchment border border-sand text-center hover:border-herbal/50 hover:bg-cream transition-all shadow-xs w-[160px] h-[72px] flex flex-col justify-center"><span className="font-body text-[14px] leading-[20px] font-bold text-herbal block">GCP-ASU</span><span className="font-body text-[11px] leading-[14px] text-earth">AYUSH 2013</span></div> },
    { node: <div className="p-3 rounded-xl bg-parchment border border-sand text-center hover:border-herbal/50 hover:bg-cream transition-all shadow-xs w-[160px] h-[72px] flex flex-col justify-center"><span className="font-body text-[14px] leading-[20px] font-bold text-herbal block">ICMR</span><span className="font-body text-[11px] leading-[14px] text-earth">Ethical Guides</span></div> },
    { node: <div className="p-3 rounded-xl bg-parchment border border-sand text-center hover:border-herbal/50 hover:bg-cream transition-all shadow-xs w-[160px] h-[72px] flex flex-col justify-center"><span className="font-body text-[14px] leading-[20px] font-bold text-herbal block">NDCT 2019</span><span className="font-body text-[11px] leading-[14px] text-earth">Clinical Rules</span></div> },
    { node: <div className="p-3 rounded-xl bg-parchment border border-sand text-center hover:border-herbal/50 hover:bg-cream transition-all shadow-xs w-[160px] h-[72px] flex flex-col justify-center"><span className="font-body text-[14px] leading-[20px] font-bold text-herbal block">CTRI</span><span className="font-body text-[11px] leading-[14px] text-earth">Registry Match</span></div> },
    { node: <div className="p-3 rounded-xl bg-parchment border border-sand text-center hover:border-herbal/50 hover:bg-cream transition-all shadow-xs w-[160px] h-[72px] flex flex-col justify-center"><span className="font-body text-[14px] leading-[20px] font-bold text-herbal block">DPDP Act</span><span className="font-body text-[11px] leading-[14px] text-earth">Data Privacy</span></div> },
    { node: <div className="p-3 rounded-xl bg-parchment border border-sand text-center hover:border-herbal/50 hover:bg-cream transition-all shadow-xs w-[160px] h-[72px] flex flex-col justify-center"><span className="font-body text-[14px] leading-[20px] font-bold text-herbal block">ALCOA+</span><span className="font-body text-[11px] leading-[14px] text-earth">Data Integrity</span></div> },
    { node: <div className="p-3 rounded-xl bg-parchment border border-sand text-center hover:border-herbal/50 hover:bg-cream transition-all shadow-xs w-[160px] h-[72px] flex flex-col justify-center"><span className="font-body text-[14px] leading-[20px] font-bold text-herbal block">21 CFR 11</span><span className="font-body text-[11px] leading-[14px] text-earth">Electronic Signs</span></div> },
    { node: <div className="p-3 rounded-xl bg-parchment border border-sand text-center hover:border-herbal/50 hover:bg-cream transition-all shadow-xs w-[160px] h-[72px] flex flex-col justify-center"><span className="font-body text-[14px] leading-[20px] font-bold text-herbal block">CDISC</span><span className="font-body text-[11px] leading-[14px] text-earth">SDTM / ADaM</span></div> }
  ];

  return (
    <section 
      className="w-full bg-cream py-16 sm:py-20 relative overflow-hidden border-b border-sand" 
      id="ayurveda-rigor"
    >
      {/* Living Botanical Dynamic Atmosphere */}
      <div className="botanical-atmosphere" />
      <div className="absolute inset-0 botanical-pattern pointer-events-none opacity-30" />

      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 md:px-8 relative z-10"
      >
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-14">
          <span className="font-body text-[12px] leading-[16px] tracking-[0.08em] uppercase font-bold text-herbal block mb-2.5">
            Ayurveda Precision &amp; Governance
          </span>
          <h2 className="font-heading text-[38px] sm:text-[44px] md:text-[48px] leading-[1.15] tracking-[-0.02em] font-[600] text-forest">
            Ayurvedic precision with <span className="text-ochre italic font-normal">uncompromising institutional rigor.</span>
          </h2>
          <p className="font-body text-[17px] sm:text-[18px] leading-[28px] font-[400] text-earth mt-3">
            Harmonizing classical diagnostic methodologies with international biomedical standards.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 3 Balanced Diagnostic & Governance Pillars (Tri-Card Glowing Green Border) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch mb-14 sm:mb-16 w-full">
          
          {/* Pillar 1: Traditional Assessments (Classical Diagnostic Wing) */}
          <StarBorder 
            as={motion.div}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            onPointerMove={handleCardPointerMove}
            onPointerLeave={handleCardPointerLeave}
            color="#22C55E"
            speed="6s"
            className="group rounded-2xl border border-herbal/30 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-lg flex flex-col justify-between relative h-full ring-1 ring-herbal/20 magic-bento-card--border-glow"
            innerClassName="p-6 sm:p-7 flex flex-col justify-between h-full relative overflow-hidden bg-parchment"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/40 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-125 duration-500 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-[10px] bg-white border border-sand text-herbal flex items-center justify-center shadow-xs">
                  <Activity className="w-6 h-6 text-herbal" />
                </div>
                <span className="font-body text-[11px] font-semibold text-forest/70 uppercase tracking-wider bg-white/60 px-2.5 py-0.5 rounded border border-sand/60">
                  Classical Baseline
                </span>
              </div>
              <h3 className="font-heading text-[22px] leading-[30px] tracking-[-0.01em] font-semibold text-forest mb-2">
                Traditional Assessments
              </h3>
              <p className="font-body text-[14px] leading-[22px] text-earth mb-5">
                Structured eCRFs for Prakriti baseline, Doshic scoring, Agni balance, and Rasayana markers.
              </p>
            </div>

            <div className="p-3.5 bg-white/80 rounded-xl border border-sand/60 relative z-10 mt-auto">
              <span className="font-body text-[11px] leading-[14px] uppercase text-herbal font-bold block mb-1">
                Parameters:
              </span>
              <span className="font-body text-[13px] leading-[20px] text-forest/90">
                VPK index, Kostha type, Jihwa, and Nadi pariksha metrics.
              </span>
            </div>
          </StarBorder>

          {/* Pillar 2: Modern Lab Telemetry (Primary Focal Anchor - StarBorder Elevated) */}
          <StarBorder 
            as={motion.div}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            onPointerMove={handleCardPointerMove}
            onPointerLeave={handleCardPointerLeave}
            color="#22C55E"
            speed="6s"
            className="group rounded-2xl border border-herbal/30 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-lg flex flex-col justify-between relative h-full ring-1 ring-herbal/20 magic-bento-card--border-glow"
            innerClassName="p-6 sm:p-7 flex flex-col justify-between h-full relative overflow-hidden bg-parchment"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-125 duration-500 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-[10px] bg-white border border-sand text-herbal flex items-center justify-center shadow-xs">
                  <FlaskConical className="w-6 h-6 text-herbal" />
                </div>
                <span className="font-body text-[11px] font-bold text-herbal uppercase tracking-wider bg-herbal/10 px-2.5 py-0.5 rounded border border-herbal/30">
                  Primary Bridge
                </span>
              </div>
              <h3 className="font-heading text-[22px] leading-[30px] tracking-[-0.01em] font-semibold text-forest mb-2">
                Modern Lab Telemetry
              </h3>
              <p className="font-body text-[14px] leading-[22px] text-earth mb-5">
                Automated ingestion of biochemistry, inflammatory cytokines, renal/hepatic panels, and PROMs.
              </p>
            </div>

            <div className="p-3.5 bg-white/80 rounded-xl border border-sand/60 relative z-10 mt-auto">
              <span className="font-body text-[11px] leading-[14px] uppercase text-herbal font-bold block mb-1">
                Safety Telemetry:
              </span>
              <span className="font-body text-[13px] leading-[20px] text-forest/90">
                Continuous delta calculations against baseline organ toxicity limits.
              </span>
            </div>
          </StarBorder>

          {/* Pillar 3: Standardized Terminology (Global Harmonization Wing) */}
          <StarBorder 
            as={motion.div}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
            onPointerMove={handleCardPointerMove}
            onPointerLeave={handleCardPointerLeave}
            color="#22C55E"
            speed="6s"
            className="group rounded-2xl border border-herbal/30 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-lg flex flex-col justify-between relative h-full ring-1 ring-herbal/20 magic-bento-card--border-glow"
            innerClassName="p-6 sm:p-7 flex flex-col justify-between h-full relative overflow-hidden bg-parchment"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/40 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-125 duration-500 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-[10px] bg-white border border-sand text-herbal flex items-center justify-center shadow-xs">
                  <BookOpen className="w-6 h-6 text-herbal" />
                </div>
                <span className="font-body text-[11px] font-semibold text-forest/70 uppercase tracking-wider bg-white/60 px-2.5 py-0.5 rounded border border-sand/60">
                  Global Ontologies
                </span>
              </div>
              <h3 className="font-heading text-[22px] leading-[30px] tracking-[-0.01em] font-semibold text-forest mb-2">
                Standardized Terminology
              </h3>
              <p className="font-body text-[14px] leading-[22px] text-earth mb-5">
                Native mapping to AYUSH NAMASTE portal, WHO ICD-11 TM2, and ASU pharmacopoeia.
              </p>
            </div>

            <div className="p-3.5 bg-white/80 rounded-xl border border-sand/60 relative z-10 mt-auto">
              <span className="font-body text-[11px] leading-[14px] uppercase text-herbal font-bold block mb-1">
                Coding Schemas:
              </span>
              <span className="font-body text-[13px] leading-[20px] text-forest/90">
                WHO ICD-11 TM2, AYUSH NAMASTE, ASU Botanical Vocabularies.
              </span>
            </div>
          </StarBorder>

        </div>

        {/* ========================================================================= */}
        {/* Compliance & Legal Frameworks Loop                                        */}
        {/* ========================================================================= */}
        <div className="relative z-20">
          <div className="flex items-center justify-between mb-4">
            <span className="font-body text-[11px] leading-[14px] tracking-[0.05em] uppercase text-forest/70 font-bold block">
              Compliance &amp; Legal Frameworks
            </span>
            <span className="font-body text-[11px] text-earth/60 font-medium hidden sm:inline-block">
              Institutional Certification Standards
            </span>
          </div>

          <LogoLoop 
            speed={35} 
            gap={24}
            fadeOut={true}
            fadeOutColor="#FBF7ED"
            logos={complianceLogos} 
          />
        </div>

      </motion.div>
    </section>
  );
};

