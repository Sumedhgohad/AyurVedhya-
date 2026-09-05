import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { FONT_STACK, PARCHMENT, INK } from '../../design';

export const AppLayout: React.FC = () => (
  <div style={{
    minHeight: '100vh',
    background: PARCHMENT,
    color: INK,
    fontFamily: FONT_STACK,
    WebkitFontSmoothing: 'antialiased',
  }}>
    <TopNav />
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        padding: '40px 48px',
        minHeight: 'calc(100vh - 44px)',
        maxWidth: 1280,
        overflowX: 'hidden',
      }}>
        <Outlet />
      </main>
    </div>
  </div>
);
