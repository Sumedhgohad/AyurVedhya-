import React from 'react';


export const Footer = () => {
  return (
    <footer className="w-full bg-forest border-t border-herbal/30 text-parchment">
        <div className="w-full max-w-[1680px] mx-auto px-[1rem] md:px-[2rem] pt-[3.5rem] pb-[2.5rem]">
            <div
                className="flex flex-col lg:flex-row items-center justify-between gap-[2rem] pb-[2rem] border-b border-herbal/30">
                {/* Logo & Description */}
                <div className="flex flex-col sm:flex-row items-center gap-[1rem] text-center sm:text-left">
                    <img alt="AyurVedhya Logo" className="h-12 w-auto object-contain bg-cream p-1.5 rounded-lg"
                        src="/Logo/Final_Logo.png" />
                    <p className="font-body text-[13px] leading-[20px] font-[400] text-parchment/80 max-w-md">
                        Intelligent Clinical Research Management Platform — All India Institute of Ayurveda (AIIA).
                        Accelerating GCP-ASU clinical validation.
                    </p>
                </div>
                {/* Compact Navigation Links */}
                <div
                    className="flex flex-wrap items-center justify-center gap-[1.5rem] font-body text-[15px] font-bold text-parchment/90">
                    <a className="hover:text-sage transition-colors" href="#modules">Platform</a>
                    <a className="hover:text-sage transition-colors" href="#lifecycle">Lifecycle</a>
                    <a className="hover:text-sage transition-colors" href="#ayurveda-rigor">Ayurveda Rigor</a>
                    <a className="hover:text-sage transition-colors" href="#ayurveda-rigor">Safety &amp; Compliance</a>
                    <a className="hover:text-sage transition-colors" href="#cta">Contact</a>
                </div>
            </div>
            {/* Copyright & System Status */}
            <div
                className="pt-[1.5rem] flex flex-col md:flex-row items-center justify-between gap-[1rem] font-body text-[13px] font-[400] text-parchment/60">
                <div className="flex items-center gap-[0.5rem]">
                    <span className="">© 2026 AyurVedhya CTMS. All India Institute of Ayurveda.</span>
                    <span className="">•</span>
                    <a className="hover:text-parchment transition-colors" href="#">Privacy &amp; Security</a>
                </div>
                <div
                    className="flex items-center gap-[0.5rem] px-[1rem] py-[0.375rem] rounded-full bg-herbal/20 border border-herbal/40 font-body text-[12px] font-bold text-parchment shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-sage animate-pulse"></span>
                    <span className="text-sage">All Systems Operational</span>
                    <span className="text-parchment/40">•</span>
                    <span className="text-parchment/60">Audit Log Live</span>
                </div>
            </div>
        </div>
    </footer>
  );
};
