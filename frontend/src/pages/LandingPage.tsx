// @ts-nocheck
import React from 'react';
import './landingpage.css';
import '../components/landing/MagicBento.css';
import { Header } from '../components/landing/Header';
import { Hero } from '../components/landing/Hero';
import { ProblemSolution } from '../components/landing/ProblemSolution';
import { PlatformModules } from '../components/landing/PlatformModules';
import { Lifecycle } from '../components/landing/Lifecycle';
import { AyurvedaRigor } from '../components/landing/AyurvedaRigor';
import { CTA } from '../components/landing/CTA';
import { Footer } from '../components/landing/Footer';

import GlowCursor from '../components/landing/GlowCursor';

export const LandingPage = () => {
  return (
    <GlowCursor className="w-full h-full min-h-screen" style={{ overflow: 'visible' }}>
      <div id="ayurvedhya-landing-page" className="scroll-smooth font-['Inter',_sans-serif] relative">
        <Header />
        <main>
          <Hero />
          <ProblemSolution />
          <PlatformModules />
          <Lifecycle />
          <AyurvedaRigor />
          <CTA />
        </main>
        <Footer />
      </div>
    </GlowCursor>
  );
};

export default LandingPage;
