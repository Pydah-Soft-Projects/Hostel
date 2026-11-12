import React, { useState } from 'react';
import CampoSidebar, { DEFAULT_LIBRARY_SECTIONS } from '../components/Sidebar';
import SEO from '../components/SEO';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const mockUser = {
    name: 'DAMERLA SAI S...',
    role: 'super_admin'
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex font-jakarta">
      <SEO title="Sidebar" />

      {/* Enterprise Library Management Sidebar */}
      <CampoSidebar
        sections={DEFAULT_LIBRARY_SECTIONS}
        moduleSubtitle="Library Management"
        user={mockUser}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Page Area */}
      <main
        className={`flex-1 min-h-screen transition-all duration-200 ease-in-out p-6 lg:p-10 ${
          isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[256px]'
        }`}
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-main">
                Sidebar
              </h1>
              <p className="text-xs text-text-sub mt-1">
                Standardized Campo Design System · Library Management Sidebar
              </p>
            </div>

            {/* Mobile toggle button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-surface border border-border shadow-sm text-text-sub hover:text-text-main"
              aria-label="Open sidebar"
            >
              Menu
            </button>
          </div>

          {/* Details / Preview Card */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-text-main">
              Sidebar Configuration & Specifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-sub">
              <div className="p-4 rounded-xl bg-background border border-border/60 space-y-2">
                <p className="font-semibold text-text-main">Layout & Dimensions</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Expanded Width: <strong>256px</strong></li>
                  <li>Collapsed Width: <strong>80px</strong></li>
                  <li>Transition Duration: <strong>200ms</strong></li>
                  <li>Right Border Shadow: <strong>4px 0 24px -2px rgba(10, 20, 35, 0.45)</strong></li>
                  <li>Toggle Button: <strong>24×24px</strong> at <strong>top 106px</strong>, <strong>-12px</strong> offset</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border/60 space-y-2">
                <p className="font-semibold text-text-main">Typography & Tokens</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Font Family: <strong>Plus Jakarta Sans</strong></li>
                  <li>Nav Item Labels: <strong>13px (medium / semibold)</strong></li>
                  <li>Section Headings: <strong>11px (bold, 0.06em tracking)</strong></li>
                  <li>Subtitle: <strong>12px (medium)</strong></li>
                  <li>Profile Card: <strong>64px height</strong>, <strong>40×40px avatar</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
