import { UserCheck, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import SoftAurora from './SoftAurora';

export const CTA = () => {
  return (
    <section className="w-full bg-forest text-parchment py-[5.5rem] relative overflow-hidden" id="cta">
        {/* Intensified Green CTA Aurora */}
        <div className="absolute inset-0 z-0">
            <SoftAurora 
                color1="#173B2A" 
                color2="#52B788" 
                speed={0.5} 
                brightness={1.65}
                scale={1.6}
            />
        </div>
        
        {/* Layered Botanical Ambient Backlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-herbal/25 to-transparent pointer-events-none z-0" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-herbal/35 rounded-full blur-[130px] -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-leaf/25 rounded-full blur-[130px] -ml-48 -mb-48 pointer-events-none" />
        
        <div className="w-full max-w-[1680px] mx-auto px-[1rem] md:px-[2rem] relative z-10 text-center">
            <div className="max-w-3xl mx-auto flex flex-col items-center gap-[1.25rem]">
                <img 
                    alt="AyurVedhya Brand Logo"
                    className="h-16 w-auto object-contain rounded-2xl bg-white/10 p-3 border border-white/20 mb-[0.5rem] backdrop-blur-md shadow-md"
                    src="/Logo/Final_Logo.png" 
                />
                <span className="font-body text-[13px] leading-[14px] tracking-[0.1em] uppercase text-sage font-bold">
                    Institutional Onboarding
                </span>
                <h2 className="font-heading text-[38px] md:text-[48px] leading-[1.2] tracking-[-0.02em] font-[600] text-parchment tracking-tight">
                    Bring every Ayurveda clinical trial into one connected workspace.
                </h2>
                <p className="font-body text-[18px] leading-[28px] font-[400] text-sand max-w-2xl">
                    From study setup to safety monitoring and verified results, AyurVedhya unifies clinical
                    workflows, regulatory compliance, and data governance for AIIA.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-[1rem] pt-[1rem]">
                    {/* Primary Button */}
                    <Link 
                        className="group relative overflow-hidden inline-flex items-center gap-[0.6rem] px-[2.5rem] py-[1rem] rounded-full bg-herbal text-white font-body text-[16px] leading-[24px] tracking-[-0.01em] font-bold shadow-xl hover:bg-leaf transition-all hover:-translate-y-0.5 active:translate-y-0 border border-leaf/40"
                        to="/login"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none z-0" />
                        <UserCheck className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Request Institutional Access</span>
                    </Link>
                    {/* Secondary Button */}
                    <a 
                        className="inline-flex items-center gap-[0.6rem] px-[2.5rem] py-[1rem] rounded-full bg-transparent hover:bg-sage/15 text-parchment font-body text-[16px] leading-[24px] tracking-[-0.01em] font-bold backdrop-blur-md border border-sage/40 hover:border-sage transition-all hover:-translate-y-0.5 active:translate-y-0"
                        href="#"
                    >
                        <Calendar className="w-5 h-5 text-sage" />
                        <span>Schedule AIIA Research Demo</span>
                    </a>
                </div>
                <p className="font-body text-[12px] leading-[16px] tracking-[0.05em] font-[600] text-parchment/65 pt-[1rem] uppercase tracking-wider">
                    Designed for AIIA Clinical Investigators, IEC Members &amp; Research Leadership
                </p>
            </div>
        </div>
    </section>
  );
};
