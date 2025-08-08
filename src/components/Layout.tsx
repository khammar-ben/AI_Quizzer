import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)', transition: 'background 0.3s, color 0.3s' }}>
      <Navigation />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
