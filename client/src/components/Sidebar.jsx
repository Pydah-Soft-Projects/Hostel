import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  BookOpen,
  PlusCircle,
  ArrowLeftRight,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  X
} from 'lucide-react';

/**
 * Standard Library Management Sidebar Navigation
 * Matches exact layout, typography, token variables, and dimensions:
 * - Expanded width: 256px | Collapsed width: 80px
 * - Right border + subtle shadow: 4px 0 24px -2px rgba(10, 20, 35, 0.45)
 * - 200ms smooth transition
 * - Font: Plus Jakarta Sans
 * - Brand header: logo 28px height, max-w 120px; collapsed 36px icon
 * - Circular collapse button: 24x24px, -12px outside right edge, top 106px
 * - Bottom profile card: 64px height, 16px radius, 40x40px avatar with 14px bold initial
 */

// Default Library Management Navigation Sections
export const DEFAULT_LIBRARY_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      {
        name: 'Dashboard',
        icon: LayoutGrid,
        path: '/dashboard',
        aliases: ['/sidebar', '/']
      }
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      {
        name: 'All Books',
        icon: BookOpen,
        path: '/books'
      },
      {
        name: 'Create Book',
        icon: PlusCircle,
        path: '/books/create'
      }
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      {
        name: 'Issues & Returns',
        icon: ArrowLeftRight,
        path: '/circulation'
      }
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      {
        name: 'User Management',
        icon: Users,
        path: '/users'
      },
      {
        name: 'Settings',
        icon: Settings,
        path: '/settings'
      }
    ]
  }
];

const Sidebar = ({
  sections = null,
  moduleSubtitle = 'Library Management',
  user = null,
  onLogout = null,
  isCollapsed = false,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen
}) => {
  const { pathname } = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState({});

  // Active navigation items (use provided sections or default to Library Management)
  const navSections = Array.isArray(sections) && sections.length > 0 ? sections : DEFAULT_LIBRARY_SECTIONS;

  // Auto-expand submenus if child route is active
  useEffect(() => {
    navSections.forEach(sec => {
      sec.items?.forEach(item => {
        if (item.hasSubmenu && Array.isArray(item.submenu)) {
          const isChildActive = item.submenu.some(sub =>
            pathname === sub.path || pathname.startsWith(`${sub.path}/`)
          );
          if (isChildActive) {
            setOpenSubmenus(prev => ({ ...prev, [item.name]: true }));
          }
        }
      });
    });
  }, [pathname, navSections]);

  const toggleSubmenu = (name) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const getUserInitial = () => {
    if (!user) return 'D';
    const name = user.name || user.username || user.email || 'D';
    return name.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return 'DAMERLA SAI S...';
    return user.name || user.username || 'DAMERLA SAI S...';
  };

  const getUserRole = () => {
    if (!user) return 'Superadmin';
    if (user.role === 'super_admin') return 'Superadmin';
    if (user.role === 'sub_admin') return 'Sub Admin';
    if (user.role === 'principal') return 'Principal';
    if (user.role === 'warden') return 'Warden';
    if (user.role === 'student') return user.rollNumber || 'Student';
    if (user.role === 'custom') return user.customRole || 'Custom';
    if (user.role) return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    return 'Superadmin';
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
          style={{ width: `${size}px`, height: `${size}px` }}
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
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen?.(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="sidebar"
        className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col justify-between border-r transition-all duration-200 ease-in-out select-none ${
          isCollapsed ? 'w-[80px]' : 'w-[256px]'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          backgroundColor: 'var(--sidebar, #1E3150)',
          color: 'var(--sidebar-text, #FFFFFF)',
          borderColor: 'var(--border, rgba(255, 255, 255, 0.1))',
          boxShadow: '4px 0 24px -2px rgba(10, 20, 35, 0.45)',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Floating Circular Collapse Control */}
        {setIsCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-[12px] top-[106px] z-50 w-[24px] h-[24px] rounded-full shadow-md border items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: 'var(--surface, #FFFFFF)',
              borderColor: 'var(--border, #DCEBE7)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.18)'
            }}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={14} strokeWidth={2.5} style={{ color: 'var(--sidebar-muted, #1E3150)' }} />
            ) : (
              <ChevronLeft size={14} strokeWidth={2.5} style={{ color: 'var(--sidebar-muted, #1E3150)' }} />
            )}
          </button>
        )}

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen?.(false)}
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          style={{ color: 'var(--sidebar-text, #FFFFFF)' }}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* Top Section: Brand Header & Navigation Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Brand Header */}
          <div
            className={`flex flex-col items-center justify-center text-center border-b flex-shrink-0 transition-all duration-200 ${
              isCollapsed ? 'pt-[24px] pb-[16px] px-[8px]' : 'pt-[24px] pb-[16px] px-[24px]'
            }`}
            style={{ borderColor: 'var(--border, rgba(255, 255, 255, 0.1))' }}
          >
            {isCollapsed ? (
              <img
                src="/campo-logos/icon-192.png"
                onError={(e) => { e.currentTarget.src = '/campo-logos/favicon-32x32.png'; }}
                alt="Campo"
                className="w-[36px] h-[36px] rounded-lg object-contain mx-auto"
              />
            ) : (
              <>
                <img
                  src="/campo-logos/campo_logo_transparent_hq.png"
                  alt="Campo"
                  className="h-[28px] max-w-[120px] object-contain mx-auto"
                />
                <p
                  className="text-[12px] font-medium tracking-tight truncate max-w-[208px] mt-[8px]"
                  style={{ color: 'var(--sidebar-muted, #AABBD4)' }}
                >
                  {moduleSubtitle}
                </p>
              </>
            )}
          </div>

          {/* Navigation Area (Scrollable without visible scrollbar) */}
          <nav
            className="flex-1 overflow-y-auto overflow-x-hidden px-[14px] pt-[12px] pb-[16px] space-y-[24px] no-scrollbar scrollbar-none scrollbar-hide scrollbar-sidebar"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {navSections.map((section, sIdx) => {
              const visibleItems = (section.items || []).filter(item => item.show !== false);
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title || sIdx}>
                  {/* Section Heading */}
                  {section.title && !isCollapsed && (
                    <div
                      className="px-[14px] pt-[4px] pb-[8px] text-[11px] font-bold uppercase tracking-[0.06em]"
                      style={{ color: 'var(--sidebar-muted, #AABBD4)' }}
                    >
                      {section.title}
                    </div>
                  )}

                  {/* Collapsed Section Divider */}
                  {isCollapsed && section.title && sIdx > 0 && (
                    <div
                      className="w-8 mx-auto my-2 border-t"
                      style={{ borderColor: 'var(--border, rgba(255, 255, 255, 0.1))' }}
                    />
                  )}

                  {/* Section Items */}
                  <div className="space-y-[4px]">
                    {visibleItems.map(item => {
                      const Icon = item.icon;
                      const hasSub = item.hasSubmenu && Array.isArray(item.submenu) && item.submenu.length > 0;
                      const isSubOpen = openSubmenus[item.name];

                      // Active matching (exact, path prefix, or aliases)
                      const isExactActive = pathname === item.path;
                      const isAliasActive = Array.isArray(item.aliases) && item.aliases.includes(pathname);
                      const isChildActive = hasSub && item.submenu.some(sub =>
                        pathname === sub.path || pathname.startsWith(`${sub.path}/`)
                      );
                      const isActive = isExactActive || isAliasActive || isChildActive;

                      if (hasSub) {
                        return (
                          <div key={item.name} className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                if (isCollapsed) {
                                  setIsCollapsed?.(false);
                                  setOpenSubmenus(prev => ({ ...prev, [item.name]: true }));
                                } else {
                                  toggleSubmenu(item.name);
                                }
                              }}
                              className={`group relative flex items-center w-full rounded-[12px] text-[13px] transition-all duration-150 cursor-pointer ${
                                isCollapsed ? 'justify-center p-[10px]' : 'px-[14px] py-[10px] gap-[14px]'
                              } ${
                                isActive
                                  ? 'font-semibold shadow-sm'
                                  : 'font-medium text-white/90 hover:bg-white/10 hover:text-white'
                              }`}
                              style={{
                                backgroundColor: isActive ? 'var(--primary, #0369a1)' : 'transparent',
                                color: 'var(--sidebar-text, #FFFFFF)',
                                boxShadow: isActive ? '0 2px 8px -1px rgba(0, 0, 0, 0.25)' : 'none'
                              }}
                              title={isCollapsed ? item.name : undefined}
                            >
                              <div className="relative flex items-center justify-center">
                                {renderIcon(Icon, isCollapsed ? 20 : 18)}
                                {item.hasNotification && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                                )}
                              </div>
                              {!isCollapsed && (
                                <>
                                  <span className="truncate flex-1 text-left">{item.name}</span>
                                  {isSubOpen ? (
                                    <ChevronUp size={14} className="opacity-75 flex-shrink-0" />
                                  ) : (
                                    <ChevronDown size={14} className="opacity-75 flex-shrink-0" />
                                  )}
                                </>
                              )}
                            </button>

                            {/* Submenu Children */}
                            {!isCollapsed && isSubOpen && (
                              <div
                                className="mt-1 ml-4 pl-3 border-l space-y-1"
                                style={{ borderColor: 'var(--border, rgba(255, 255, 255, 0.1))' }}
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
                                            : 'text-white/75 hover:bg-white/10 hover:text-white'
                                        }`}
                                        style={{
                                          backgroundColor: isSubActive ? 'var(--primary, #0369a1)' : 'transparent',
                                          color: isSubActive ? 'var(--sidebar-text, #FFFFFF)' : 'inherit'
                                        }}
                                      >
                                        {SubIcon && renderIcon(SubIcon, 14)}
                                        <span className={`${SubIcon ? 'ml-2' : ''} truncate`}>{sub.name}</span>
                                      </NavLink>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Regular Navigation Link
                      return (
                        <NavLink
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsMobileOpen?.(false)}
                          className={`group relative flex items-center w-full rounded-[12px] text-[13px] transition-all duration-150 cursor-pointer ${
                            isCollapsed ? 'justify-center p-[10px]' : 'px-[14px] py-[10px] gap-[14px]'
                          } ${
                            isActive
                              ? 'font-semibold'
                              : 'font-medium text-white/90 hover:bg-white/10 hover:text-white'
                          }`}
                          style={{
                            backgroundColor: isActive ? 'var(--primary, #0369a1)' : 'transparent',
                            color: 'var(--sidebar-text, #FFFFFF)',
                            boxShadow: isActive ? '0 2px 8px -1px rgba(0, 0, 0, 0.25)' : 'none'
                          }}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <div className="relative flex items-center justify-center">
                            {renderIcon(Icon, isCollapsed ? 20 : 18)}
                            {item.hasNotification && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                            )}
                          </div>
                          {!isCollapsed && (
                            <span className="truncate flex-1 text-left">{item.name}</span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-[14px] pt-[8px] flex-shrink-0">
          <div
            className={`h-[64px] rounded-[16px] transition-all duration-200 flex items-center ${
              isCollapsed ? 'p-2 justify-center' : 'px-[14px] justify-between'
            }`}
            style={{
              backgroundColor: 'rgba(10, 20, 35, 0.45)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
            title={isCollapsed ? `${getUserDisplayName()} (${getUserRole()})` : undefined}
          >
            {/* White 40x40px Circular Avatar with 15px bold primary initial */}
            <div
              className="w-[40px] h-[40px] rounded-full bg-white font-bold flex items-center justify-center text-[15px] flex-shrink-0 shadow-sm"
              style={{
                color: 'var(--primary, #0369a1)'
              }}
            >
              {getUserInitial()}
            </div>

            {/* User details (Expanded view) */}
            {!isCollapsed && (
              <div className="flex-1 min-w-0 ml-[12px] mr-1">
                <p className="text-[14px] font-bold text-white uppercase truncate tracking-tight leading-snug">
                  {getUserDisplayName()}
                </p>
                <p
                  className="text-[12px] font-normal truncate capitalize mt-[1px] leading-snug"
                  style={{ color: 'var(--sidebar-muted, #AABBD4)' }}
                >
                  {getUserRole()}
                </p>
              </div>
            )}

            {/* Logout Action (Expanded view) */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={onLogout || (() => {})}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={18} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
