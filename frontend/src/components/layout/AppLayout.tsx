import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export const AppLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000000',
        color: '#ffffff',
        fontFamily:
          "'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <TopNav />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            padding: '40px 48px',
            overflowY: 'auto',
            minHeight: 'calc(100vh - 44px)',
            maxWidth: 1200,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
