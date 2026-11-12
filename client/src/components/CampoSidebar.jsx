import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  KeyRound,
  X
} from 'lucide-react';

/**
 * Standardized Enterprise Campo Portal Sidebar
 * Follows the centralized Campo Design System & UI Theme specifications:
 * - Dynamic CSS tokens: var(--sidebar), var(--primary), var(--border), var(--sidebar-text), var(--sidebar-muted), var(--surface)
 * - Fixed viewport layout (w-64 expanded, w-20 collapsed)
 * - Centered floating circular collapse toggle at top-[106px]
 * - Centered logo & module subtitle with bottom border divider
 * - Grouped section headings (MAIN, MANAGEMENT, OPERATIONS, ADMINISTRATION, etc.)
 * - Zero hardcoded hex colors, zero dummy badge counters
 * - Font family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif
 */
const CampoSidebar = ({
  sections = [],
  moduleSubtitle = 'Hostel Management',
  user = null,
  onLogout,
  onResetPassword,
  isCollapsed = false,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen
}) => {
  const { pathname } = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState({});

  // Auto-expand active submenus based on route
  useEffect(() => {
    sections.forEach(sec => {
      sec.items?.forEach(item => {
        if (item.hasSubmenu && item.submenu) {
          const isChildActive = item.submenu.some(sub =>
            pathname === sub.path || pathname.startsWith(`${sub.path}/`)
          );
          if (isChildActive) {
            setOpenSubmenus(prev => ({ ...prev, [item.name]: true }));
          }
        }
      });
    });
  }, [pathname, sections]);

  const toggleSubmenu = (name) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const getUserInitial = () => {
    if (!user) return 'U';
    const name = user.name || user.username || user.email || 'User';
    return name.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.name || user.username || 'User';
  };

  const getUserRole = () => {
    if (!user) return '';
    if (user.role === 'super_admin') return 'Superadmin';
    if (user.role === 'sub_admin') return 'Sub Admin';
    if (user.role === 'principal') return 'Principal';
    if (user.role === 'warden') return 'Warden';
    if (user.role === 'student') return user.rollNumber || 'Student';
    if (user.role === 'custom') return user.customRole || 'Custom';
    if (user.role) return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    return 'User';
  };

  const renderIcon = (Icon, size = 18) => {
    if (!Icon) return null;
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const IconComponent = Icon;
      return <IconComponent size={size} strokeWidth={2} className="flex-shrink-0" />;
    }
    if (typeof Icon === 'string') {
      return (
        <svg
          className="flex-shrink-0"
          style={{ width: size, height: size }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={Icon} />
        </svg>
      );
    }
    return Icon;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="campo-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col border-r transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          backgroundColor: 'var(--sidebar)',
          color: 'var(--sidebar-text)',
          borderColor: 'var(--border)',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        }}
      >
        {/* Floating Circular Collapse Button */}
        {setIsCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-[106px] z-50 w-6 h-6 rounded-full shadow-md border items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={14} strokeWidth={2.5} style={{ color: 'var(--sidebar-muted)' }} />
            ) : (
              <ChevronLeft size={14} strokeWidth={2.5} style={{ color: 'var(--sidebar-muted)' }} />
            )}
          </button>
        )}

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          style={{ color: 'var(--sidebar-text)' }}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* Top Header */}
        <div
          className={`flex flex-col items-center justify-center text-center pt-6 pb-4 border-b flex-shrink-0 transition-all ${
            isCollapsed ? 'px-2' : 'px-4'
          }`}
          style={{ borderColor: 'var(--border)' }}
        >
          <img
            src="/campo-logos/campo_logo_transparent_hq.png"
            alt="Campo"
            className="h-7 object-contain mx-auto transition-all"
            style={{ maxWidth: isCollapsed ? '48px' : '120px' }}
          />
          {!isCollapsed && (
            <p
              className="text-xs mt-1.5 font-medium tracking-tight truncate max-w-[200px]"
              style={{ color: 'var(--sidebar-muted)' }}
            >
              {moduleSubtitle}
            </p>
          )}
        </div>

        {/* Scrollable Navigation List */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-4 scrollbar-sidebar">
          {sections.map((section, sIdx) => {
            // Filter section items that are visible
            const visibleItems = (section.items || []).filter(item => item.show !== false);
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title || sIdx} className="space-y-1">
                {/* Section Heading */}
                {section.title && !isCollapsed && (
                  <div
                    className="text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 select-none"
                    style={{ color: 'var(--sidebar-muted)' }}
                  >
                    {section.title}
                  </div>
                )}
                {isCollapsed && section.title && sIdx > 0 && (
                  <div className="w-8 mx-auto my-2 border-t" style={{ borderColor: 'var(--border)' }} />
                )}

                {/* Section Items */}
                <div className="space-y-1">
                  {visibleItems.map(item => {
                    const Icon = item.icon;
                    const hasSub = item.hasSubmenu && Array.isArray(item.submenu) && item.submenu.length > 0;
                    const isSubOpen = openSubmenus[item.name];

                    // Check if current item or any child is active
                    const isExactActive = pathname === item.path;
                    const isChildActive = hasSub && item.submenu.some(sub =>
                      pathname === sub.path || pathname.startsWith(`${sub.path}/`)
                    );
                    const isActive = isExactActive || isChildActive;

                    if (hasSub) {
                      return (
                        <div key={item.name} className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              if (isCollapsed) {
                                setIsCollapsed(false);
                                setOpenSubmenus(prev => ({ ...prev, [item.name]: true }));
                              } else {
                                toggleSubmenu(item.name);
                              }
                            }}
                            className={`group relative flex items-center w-full rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer ${
                              isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5'
                            } ${
                              isActive
                                ? 'shadow-sm font-semibold'
                                : 'hover:bg-white/10 hover:text-white'
                            }`}
                            style={{
                              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                              color: 'var(--sidebar-text)'
                            }}
                            title={isCollapsed ? item.name : undefined}
                          >
                            <div className="relative flex items-center">
                              {renderIcon(Icon, 18)}
                              {item.hasNotification && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                              )}
                            </div>
                            {!isCollapsed && (
                              <>
                                <span className="ml-3 truncate flex-1 text-left">{item.name}</span>
                                {isSubOpen ? (
                                  <ChevronUp size={14} className="opacity-70 flex-shrink-0 ml-1.5" />
                                ) : (
                                  <ChevronDown size={14} className="opacity-70 flex-shrink-0 ml-1.5" />
                                )}
                              </>
                            )}
                          </button>

                          {/* Submenu Children (Expanded View) */}
                          {!isCollapsed && isSubOpen && (
                            <div
                              className="mt-1 ml-4 pl-3 border-l space-y-1"
                              style={{ borderColor: 'var(--border)' }}
                            >
                              {item.submenu
                                .filter(sub => sub.show !== false)
                                .map(sub => {
                                  const SubIcon = sub.icon;
                                  const isSubActive = pathname === sub.path || pathname.startsWith(`${sub.path}/`);
                                  return (
                                    <NavLink
                                      key={sub.path}
                                      to={sub.path}
                                      onClick={() => setIsMobileOpen?.(false)}
                                      className={`group flex items-center w-full px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                        isSubActive
                                          ? 'font-semibold shadow-xs'
                                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                                      }`}
                                      style={{
                                        backgroundColor: isSubActive ? 'var(--primary)' : 'transparent',
                                        color: isSubActive ? 'var(--sidebar-text)' : 'inherit'
                                      }}
                                    >
                                      {SubIcon && renderIcon(SubIcon, 14)}
                                      <span className={`${SubIcon ? 'ml-2' : ''} truncate`}>{sub.name}</span>
                                      {sub.hasNotification && (
                                        <span className="ml-auto w-2 h-2 rounded-full bg-red-500" />
                                      )}
                                    </NavLink>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Standard NavLink Item
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMobileOpen?.(false)}
                        className={`group relative flex items-center w-full rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer ${
                          isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5'
                        } ${
                          isActive
                            ? 'shadow-sm font-semibold'
                            : 'hover:bg-white/10 hover:text-white'
                        }`}
                        style={{
                          backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                          color: 'var(--sidebar-text)'
                        }}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <div className="relative flex items-center">
                          {renderIcon(Icon, 18)}
                          {item.hasNotification && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                          )}
                        </div>
                        {!isCollapsed && (
                          <span className="ml-3 truncate flex-1 text-left">{item.name}</span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom User Profile Card */}
        <div className="flex-shrink-0 p-3 pt-2">
          <div
            className={`rounded-2xl transition-all duration-200 flex items-center ${
              isCollapsed ? 'p-2 justify-center' : 'px-3 py-2.5 justify-between gap-1'
            }`}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            {/* Avatar Circle - Pure White with Primary Color Letter */}
            <div
              className="w-10 h-10 rounded-full bg-white font-bold flex items-center justify-center text-base flex-shrink-0 shadow-sm"
              style={{
                color: 'var(--primary, #0284c7)'
              }}
              title={getUserDisplayName()}
            >
              {getUserInitial()}
            </div>

            {/* User Info (Expanded View) */}
            {!isCollapsed && (
              <div className="flex-1 min-w-0 px-2.5">
                <p className="text-[13.5px] font-bold text-white uppercase truncate tracking-tight leading-snug">
                  {getUserDisplayName()}
                </p>
                <p
                  className="text-xs truncate capitalize font-normal mt-0.5 leading-snug"
                  style={{ color: 'var(--sidebar-muted)' }}
                >
                  {getUserRole()}
                </p>
              </div>
            )}

            {/* Actions: Reset Password + Logout */}
            <div className="flex items-center gap-1">
              {!isCollapsed && onResetPassword && (
                <button
                  type="button"
                  onClick={onResetPassword}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                  title="Reset Password"
                  aria-label="Reset Password"
                >
                  <KeyRound size={17} strokeWidth={2} />
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/85 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={19} strokeWidth={2.2} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CampoSidebar;
