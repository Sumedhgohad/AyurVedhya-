// @ts-nocheck
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import SoftAurora from './SoftAurora';
import { SpecularButton } from './ui/SpecularButton';

export const Hero = () => {
    const { scrollY } = useScroll();
    const scale = useTransform(scrollY, [0, 500], [1, 1.05]);
    const heroRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!heroRef.current) return;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const clientX = e.clientX;
        const clientY = e.clientY;
        rafRef.current = requestAnimationFrame(() => {
            if (!heroRef.current) return;
            const heroRect = heroRef.current.getBoundingClientRect();

            if (spotlightRef.current) {
                const x = clientX - heroRect.left;
                const y = clientY - heroRect.top;
                spotlightRef.current.style.background = `radial-gradient(800px circle at ${x}px ${y}px, rgba(168, 184, 154, 0.25), transparent 65%)`;
            }

            // 3D tilt follows mouse motion anywhere in the hero section
            const card = document.getElementById('hero-tilt-card');
            if (card) {
                const cardRect = card.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2;
                const cardCenterY = cardRect.top + cardRect.height / 2;
                const deltaX = clientX - cardCenterX;
                const deltaY = clientY - cardCenterY;
                const maxRange = Math.max(heroRect.width, heroRect.height) / 2;
                const rotX = Math.max(-7, Math.min(7, (deltaY / maxRange) * -7));
                const rotY = Math.max(-7, Math.min(7, (deltaX / maxRange) * 7));
                card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
            }
        });
    };

    const handlePointerLeave = () => {
        const card = document.getElementById('hero-tilt-card');
        if (card) {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        }
    };

    return (
        <div 
            ref={heroRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="pb-[3rem] pt-[4rem] sm:pt-[2rem] h-auto min-h-screen relative overflow-hidden bg-[#173B2A]" 
            id="hero-section"
        >
            {/* Intensified SoftAurora Effect matching CTA section */}
            <div className="absolute inset-0 z-0 opacity-100">
                <SoftAurora 
                    color1="#173B2A" 
                    color2="#52B788" 
                    speed={0.5} 
                    brightness={1.65} 
                    scale={1.6} 
                />
            </div>
            
            {/* Intensified Layered Atmospheric Green Beams & Glow */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-1/4 left-1/4 w-[700px] h-[700px] bg-herbal/35 rounded-full blur-[140px] mix-blend-screen animate-pulse" style={{ animationDuration: '9s' }} />
                <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-leaf/30 rounded-full blur-[140px] mix-blend-screen" />
                <div className="absolute -bottom-20 left-10 w-[550px] h-[550px] bg-deep-green/60 rounded-full blur-[120px]" />
            </div>

            {/* Ambient Spotlight Follows Cursor */}
            <div 
                ref={spotlightRef}
                className="pointer-events-none absolute inset-0 transition-opacity duration-500 z-0 opacity-60" 
                id="hero-spotlight"
                style={{ background: 'radial-gradient(800px circle at 50% 30%, rgba(168, 184, 154, 0.2), transparent 60%)' }}
            />

            {/* Decorative botanical element (Subtle Leaf SVG) */}
            <div className="absolute top-0 right-0 pointer-events-none opacity-[0.06] w-[600px] h-[600px] -mt-[100px] -mr-[100px] text-sage z-0">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 100C50 100 0 80 0 40C0 20 15 0 40 0C60 0 80 15 100 40C100 80 50 100 50 100Z" fill="currentColor"/>
                </svg>
            </div>
            
            <div className="w-full max-w-[1680px] mx-auto px-[1rem] md:px-[2rem] pt-[6rem] md:pt-[8rem] relative z-10">
                {/* Eyebrow Tag */}
                <div className="flex flex-wrap items-center gap-[0.5rem] mb-[1.5rem]">
                    <div className="inline-flex items-center gap-[0.35rem] px-[1rem] py-[0.35rem] rounded-full bg-deep-green/50 backdrop-blur-md border border-leaf/30">
                        <span className="w-2 h-2 rounded-full bg-saffron animate-ping"></span>
                        <span className="font-body text-[11px] leading-[14px] tracking-[0.05em] uppercase text-cream font-semibold">
                            Intelligent Clinical Research CTMS
                        </span>
                    </div>
                    <div className="inline-flex items-center gap-[0.35rem] px-[1rem] py-[0.35rem] rounded-full bg-deep-green/50 backdrop-blur-sm border border-leaf/30">
                        <CheckCircle2 className="w-4 h-4 text-sage" />
                        <span className="font-body text-[11px] leading-[14px] tracking-[0.05em] text-cream font-medium tracking-wide">
                            All India Institute of Ayurveda (AIIA)
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-[3rem] items-center">
                    {/* Hero Text Column */}
                    <div className="lg:col-span-6 flex flex-col gap-[1.5rem]">
                        <h1 className="font-heading text-[48px] md:text-[56px] leading-[1.1] tracking-[-0.02em] font-[600] text-white">
                            One connected platform for <span className="text-ochre italic font-normal block mt-2">Ayurveda clinical research.</span>
                        </h1>
                        <p className="font-body text-[18px] leading-[28px] font-[400] text-white/85 max-w-xl">
                            Manage clinical trials, protocol compliance, safety triage, and research telemetry in
                            one unified, auditable workspace.
                        </p>

                        {/* Hero CTAs */}
                        <div className="flex flex-wrap items-center gap-[1rem] pt-[1rem]">
                            <SpecularButton href="#modules" className="bg-ochre hover:bg-saffron border-none">
                                <span>Explore the Platform</span>
                                <ArrowRight className="w-5 h-5" />
                            </SpecularButton>
                            <a 
                                className="inline-flex items-center gap-[0.5rem] px-[2rem] py-[0.85rem] rounded-[10px] bg-transparent hover:bg-sage/10 text-white font-body text-[15px] font-[600] backdrop-blur-md border border-sage/30 transition-all"
                                href="#cta"
                            >
                                <ShieldCheck className="w-4 h-4 text-sage" />
                                <span>Request Access</span>
                            </a>
                        </div>

                        {/* Metrics Row */}
                        <div className="grid grid-cols-3 gap-[1rem] pt-[1.5rem] border-t border-sage/20 mt-[1rem]">
                            <div className="flex flex-col">
                                <span className="font-heading text-[28px] leading-[36px] font-[600] text-white">12</span>
                                <span className="font-body text-[12px] tracking-[0.05em] font-[600] text-sage uppercase">
                                    Active AIIA Trials
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-heading text-[28px] leading-[36px] font-[600] text-white">1,840</span>
                                <span className="font-body text-[12px] tracking-[0.05em] font-[600] text-sage uppercase">
                                    Enrolled Subjects
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-heading text-[28px] leading-[36px] font-[600] text-white">94.2%</span>
                                <span className="font-body text-[12px] tracking-[0.05em] font-[600] text-sage uppercase">
                                    Protocol Compliance
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Hero Visual: Framed Official AyurVedhya Logo with 3D Tilt */}
                    <motion.div 
                        className="lg:col-span-6 relative tilt-container z-10" 
                        id="hero-card-wrap" 
                        style={{ scale }}
                    >
                        {/* Framed Institutional Brand Surface */}
                        <div
                            className="tilt-inner rounded-3xl bg-cream/95 shadow-2xl p-6 sm:p-8 md:p-10 text-forest overflow-hidden border-2 border-sand/80 transition-transform duration-200 ease-out relative group"
                            id="hero-tilt-card"
                        >
                            {/* Subtle botanical corner motifs & watermark */}
                            <div 
                                className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{
                                    backgroundImage: 'radial-gradient(circle at center, rgba(63, 107, 69, 0.15) 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}
                            />
                            
                            {/* Top Institutional Header */}
                            <div className="flex items-center justify-between pb-4 mb-6 border-b border-sand/70 relative z-10">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-saffron animate-pulse" />
                                    <span className="font-body text-[12px] tracking-[0.06em] uppercase font-bold text-herbal">
                                        All India Institute of Ayurveda
                                    </span>
                                </div>
                                <span className="font-body text-[11px] tracking-[0.05em] uppercase px-2.5 py-1 bg-herbal/10 rounded-full text-herbal font-bold border border-herbal/20">
                                    Official CTMS
                                </span>
                            </div>

                            {/* Centered Brand Logo */}
                            <div className="py-4 sm:py-6 flex flex-col items-center justify-center relative z-10">
                                <div className="relative p-6 sm:p-8 rounded-2xl bg-white/70 border border-sand/60 shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
                                    <img 
                                        src="/Logo/Final_Logo.png" 
                                        alt="AyurVedhya Brand Logo" 
                                        className="w-full max-w-[320px] sm:max-w-[380px] h-auto object-contain mx-auto drop-shadow-sm" 
                                    />
                                </div>
                            </div>

                            {/* Bottom Ledger Verification Bar */}
                            <div className="mt-6 pt-4 border-t border-sand/70 flex flex-wrap items-center justify-between gap-3 text-[12px] text-earth relative z-10">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-herbal" />
                                    <span>GCP-ASU Compliant</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-medium">
                                    <Lock className="w-4 h-4 text-herbal" />
                                    <span>21 CFR Part 11 Aligned</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-leaf" />
                                    <span>CTRI Registry Ready</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
