import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

export const Lifecycle = () => {
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

  const milestones = [
    {
      step: "01",
      phase: "Protocol Phase",
      title: "Protocol Setup",
      desc: "Trial authoring, site allocation, and customized eCRF definitions.",
      status: "eTMF Initialized",
      statusBg: "bg-sage/20 text-forest",
      nodeBg: "bg-forest text-white"
    },
    {
      step: "02",
      phase: "Regulatory",
      title: "Regulatory & CTRI",
      desc: "IEC dossier approvals, registry baseline lock, and CTRI registration.",
      status: "IEC Cleared",
      statusBg: "bg-herbal/10 text-forest",
      nodeBg: "bg-herbal text-white"
    },
    {
      step: "03",
      phase: "Execution",
      title: "Enrolment & Visits",
      desc: "Digital consent, visit intervals, laboratory telemetry, and Prakriti logs.",
      status: "Active Cohort",
      statusBg: "bg-sage/20 text-forest",
      nodeBg: "bg-forest text-white"
    },
    {
      step: "04",
      phase: "Pharmacovigilance",
      title: "Safety Triage",
      desc: "AE/SAE expedited logging, causality triage, and DSMB notifications.",
      status: "24h Expedited",
      statusBg: "bg-[#ba1a1a]/10 text-[#ba1a1a]",
      nodeBg: "bg-[#ba1a1a] text-white",
      tagColor: "text-[#ba1a1a]"
    },
    {
      step: "05",
      phase: "Supervision",
      title: "Compliance Audits",
      desc: "Automated monitoring, query resolution, and deviation tracking.",
      status: "GCP Verified",
      statusBg: "bg-herbal/10 text-forest",
      nodeBg: "bg-herbal text-white"
    },
    {
      step: "06",
      phase: "Completion",
      title: "Data Lock",
      desc: "Database double-freeze, CDISC SDTM/ADaM packaging, and publication.",
      status: "CDISC Packaged",
      statusBg: "bg-sage/20 text-forest",
      nodeBg: "bg-forest text-white"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 1, 0.5, 1] as const
      }
    }
  };

  return (
    <section 
      className="w-full bg-sage/10 py-16 sm:py-20 border-y border-sand relative overflow-hidden"
      id="lifecycle"
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
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="font-body text-[12px] leading-[16px] tracking-[0.08em] uppercase font-bold text-herbal block mb-2.5">
            Standardized Progression
          </span>
          <h2 className="font-heading text-[38px] sm:text-[44px] md:text-[48px] leading-[1.15] tracking-[-0.02em] font-[600] text-forest">
            Follow every study from setup to <span className="text-ochre italic font-normal">verified results.</span>
          </h2>
          <p className="font-body text-[17px] sm:text-[18px] leading-[28px] font-[400] text-earth mt-3">
            Six sequential milestones enforce clinical data integrity across the institutional pipeline.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP VIEW: Continuous Horizontal Progression Track (lg+)               */}
        {/* ========================================================================= */}
        <div className="hidden lg:block relative">
          {/* Continuous Progression Rail Line running behind milestone badge circles */}
          <div 
            className="absolute top-[24px] left-[5%] right-[5%] h-[3px] bg-gradient-to-r from-forest via-herbal to-sage rounded-full shadow-xs z-0"
            aria-hidden="true"
          />

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-6 gap-4 relative z-10 w-full items-stretch"
          >
            {milestones.map((m, index) => (
              <motion.div
                key={m.step}
                variants={itemVariants}
                onPointerMove={handleCardPointerMove}
                onPointerLeave={handleCardPointerLeave}
                className="group p-5 rounded-2xl bg-cream border border-sand hover:border-herbal/40 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative h-full magic-bento-card--border-glow"
              >
                <div>
                  {/* Circular Milestone Step Node */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full ${m.nodeBg} flex items-center justify-center font-body text-[15px] font-bold shadow-xs ring-4 ring-cream transition-transform group-hover:scale-105`}>
                      {m.step}
                    </div>
                    <span className="font-body text-[11px] text-earth/60 font-semibold uppercase tracking-wider">
                      Step {index + 1}
                    </span>
                  </div>

                  <span className={`font-body text-[11px] leading-[14px] tracking-[0.05em] uppercase font-bold block mb-1.5 ${m.tagColor || 'text-herbal'}`}>
                    {m.phase}
                  </span>
                  
                  <h4 className="font-heading text-[19px] leading-[26px] tracking-[-0.01em] font-semibold text-forest mb-2">
                    {m.title}
                  </h4>
                  
                  <p className="font-body text-[13px] leading-[21px] font-normal text-earth">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-sand/70 flex items-center justify-between">
                  <span className={`font-body text-[11px] px-2 py-1 rounded-[6px] font-bold ${m.statusBg}`}>
                    {m.status}
                  </span>
                  {index < milestones.length - 1 ? (
                    <ChevronRight className="w-4 h-4 text-herbal/60 group-hover:translate-x-1 transition-transform" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-herbal" />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* TABLET & MOBILE VIEW: Continuous Vertical Progression Timeline (< lg)     */}
        {/* ========================================================================= */}
        <div className="block lg:hidden relative pl-2 sm:pl-4">
          {/* Vertical Continuous Progression Rail */}
          <div 
            className="absolute left-[28px] sm:left-[36px] top-6 bottom-6 w-[3px] bg-gradient-to-b from-forest via-herbal to-sage rounded-full z-0"
            aria-hidden="true"
          />

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-30px" }}
            className="flex flex-col gap-6 relative z-10"
          >
            {milestones.map((m) => (
              <motion.div
                key={m.step}
                variants={itemVariants}
                className="flex items-start gap-4 sm:gap-6 relative"
              >
                {/* Milestone Node on the Vertical Rail */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${m.nodeBg} shrink-0 flex items-center justify-center font-body text-[14px] sm:text-[15px] font-bold shadow-xs ring-4 ring-cream z-10`}>
                  {m.step}
                </div>

                {/* Milestone Card */}
                <div className="flex-1 p-5 sm:p-6 rounded-2xl bg-cream border border-sand shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className={`font-body text-[11px] leading-[14px] tracking-[0.05em] uppercase font-bold ${m.tagColor || 'text-herbal'}`}>
                      {m.phase}
                    </span>
                    <span className={`font-body text-[11px] px-2 py-0.5 rounded font-bold ${m.statusBg}`}>
                      {m.status}
                    </span>
                  </div>

                  <h4 className="font-heading text-[20px] leading-[28px] tracking-[-0.01em] font-semibold text-forest mb-2">
                    {m.title}
                  </h4>

                  <p className="font-body text-[14px] leading-[22px] font-normal text-earth">
                    {m.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </motion.div>
    </section>
  );
};

