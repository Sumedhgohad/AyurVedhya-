import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { FONT_STACK, PARCHMENT, INK } from '../../design';

export const AppLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: PARCHMENT,
      color: INK,
      fontFamily: FONT_STACK,
      WebkitFontSmoothing: 'antialiased',
    }}>
      <TopNav onToggleMobile={() => setMobileNavOpen(v => !v)} />
      <div style={{ display: 'flex' }}>
        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <main
          className="flex-1 p-4 sm:p-6 lg:p-10 min-h-[calc(100vh-52px)] w-full max-w-[1600px] mx-auto overflow-x-hidden"
          style={{ boxSizing: 'border-box' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
