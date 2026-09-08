import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header
        className="fixed top-0 left-0 right-0 w-full z-50 bg-cream/95 backdrop-blur-md border-b border-sand transition-all duration-300 shadow-sm"
        id="main-header">
        <div
            className="h-20 md:h-22 w-full max-w-[1680px] mx-auto px-[1rem] md:px-[2rem] flex items-center justify-between gap-[1.5rem]">
            {/* Top Left: Structured Brand Logo & Title Lockup */}
            <Link className="flex items-center gap-[0.75rem] group" to="/">
                <img alt="AyurVedhya Logo"
                    className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    src="/Logo/Final_Logo.png" />
                <div className="flex flex-col">
                    <span className="font-heading text-[22px] md:text-[25px] font-[700] text-forest tracking-[-0.01em] leading-[1.1]">
                        AyurVedhya
                    </span>
                    <span className="font-body text-[10px] md:text-[11px] tracking-[0.08em] uppercase text-earth font-semibold leading-none mt-0.5">
                        Clinical Research OS
                    </span>
                </div>
            </Link>
            
            {/* Navigation Links with Increased Font Size & Structure */}
            <nav className="hidden md:flex items-center gap-[2rem] lg:gap-[2.75rem]">
                <a className="font-body text-[16px] md:text-[17px] font-[600] text-forest hover:text-saffron transition-colors tracking-[-0.01em]"
                    href="#problem-solution">Overview</a>
                <a className="font-body text-[16px] md:text-[17px] font-[600] text-forest hover:text-saffron transition-colors tracking-[-0.01em]"
                    href="#modules">Platform</a>
                <a className="font-body text-[16px] md:text-[17px] font-[600] text-forest hover:text-saffron transition-colors tracking-[-0.01em]"
                    href="#lifecycle">Lifecycle</a>
                <a className="font-body text-[16px] md:text-[17px] font-[600] text-forest hover:text-saffron transition-colors tracking-[-0.01em]"
                    href="#ayurveda-rigor">Ayurveda Rigor</a>
                <a className="font-body text-[16px] md:text-[17px] font-[600] text-forest hover:text-saffron transition-colors tracking-[-0.01em]"
                    href="#cta">Compliance</a>
            </nav>

            {/* Right CTAs with Increased Font Size & Padding */}
            <div className="flex items-center gap-[0.75rem] md:gap-[1rem]">
                <Link className="inline-flex items-center gap-[0.45rem] px-[1.15rem] py-[0.55rem] rounded-[10px] border border-sand/80 bg-white/60 hover:bg-parchment text-forest transition-colors font-body text-[15px] md:text-[16px] font-[600]"
                    to="/login">
                    <Lock className="w-4 h-4 text-herbal" />
                    <span>Sign In</span>
                </Link>
                <Link className="group relative overflow-hidden inline-flex items-center px-[1.4rem] py-[0.55rem] rounded-[10px] bg-forest text-white font-body text-[15px] md:text-[16px] font-[600] shadow-sm hover:bg-deep-green transition-all"
                    to="/signup">
                    <span className="relative z-10">Request Access</span>
                    {/* ReactBits Glare Hover Effect */}
                    <span className="absolute top-0 left-[-100%] w-[120%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-[glare_0.6s_ease-out_forwards]"></span>
                </Link>
            </div>
        </div>
        <style>{`
            @keyframes glare {
                100% {
                    left: 100%;
                }
            }
        `}</style>
    </header>
  );
};
