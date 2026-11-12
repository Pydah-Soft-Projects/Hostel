import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, NavLink, Outlet, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import NotificationBell from '../../components/NotificationBell';
import CampoSidebar from '../../components/CampoSidebar';
import {
  LayoutDashboard,
  CalendarCheck,
  TicketCheck,
  CalendarDays,
  Users,
  Receipt,
  Zap,
  BedDouble,
  Sliders,
  FileSpreadsheet,
  Bell,
  Menu
} from 'lucide-react';

// Permission Denied Component
const PermissionDenied = ({ sectionName }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <ShieldExclamationIcon className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access the <strong>{sectionName}</strong> section.
          Please contact your admin to request access.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Available sections:</strong> Check the sidebar for sections you can access.
          </p>
        </div>
      </div>
    </div>
  );
};

const WardenDashboard = () => {
  return <WardenDashboardLayout />;
};

const WardenDashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('campo_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('campo_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  const wardenSections = [
    {
      title: 'MAIN',
      items: [
        {
          name: 'Dashboard Home',
          icon: LayoutDashboard,
          path: '/warden/dashboard',
          show: true
        }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          name: 'Room Changes',
          icon: BedDouble,
          path: '/warden/dashboard/room-change-requests',
          show: true
        },
        {
          name: 'Category Changes',
          icon: Sliders,
          path: '/warden/dashboard/category-change-requests',
          show: true
        },
        {
          name: 'Electricity Bills',
          icon: Zap,
          path: '/warden/dashboard/electricity-bills',
          show: true
        },
        {
          name: 'NOC Management',
          icon: FileSpreadsheet,
          path: '/warden/dashboard/noc-management',
          show: true
        }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          name: 'Attendance',
          icon: CalendarCheck,
          path: '/warden/dashboard/attendance',
          show: true,
          hasSubmenu: true,
          submenu: [
            {
              name: 'Mark Attendance',
              path: '/warden/dashboard/take-attendance',
              icon: CalendarCheck
            },
            {
              name: 'View Attendance',
              path: '/warden/dashboard/view-attendance',
              icon: Users
            }
          ]
        },
        {
          name: 'Complaints',
          icon: TicketCheck,
          path: '/warden/dashboard/complaints',
          show: true,
          hasSubmenu: true,
          submenu: [
            {
              name: 'Raise Complaint',
              path: '/warden/dashboard/complaints/raise',
              icon: TicketCheck
            },
            {
              name: 'View Complaints',
              path: '/warden/dashboard/complaints/view',
              icon: Users
            }
          ]
        },
        {
          name: 'Leaves & Stays',
          icon: CalendarDays,
          path: '/warden/dashboard/leave-management',
          show: true,
          hasSubmenu: true,
          submenu: [
            {
              name: 'Leaves',
              path: '/warden/dashboard/leave-management',
              icon: CalendarDays
            },
            {
              name: 'Apply on Behalf',
              path: '/warden/dashboard/leave-management/apply-on-behalf',
              icon: Users
            },
            {
              name: "Stay In's",
              path: '/warden/dashboard/stay-in-hostel-requests',
              icon: BedDouble
            }
          ]
        },
        {
          name: 'Bulk Outing',
          icon: Users,
          path: '/warden/dashboard/bulk-outing',
          show: true
        },
        {
          name: 'Fee Management',
          icon: Receipt,
          path: '/warden/dashboard/fee-management',
          show: true
        },
        {
          name: 'Notifications',
          icon: Bell,
          path: '/warden/dashboard/notifications',
          show: true
        }
      ]
    }
  ];
  const [expandedItems, setExpandedItems] = useState(new Set());
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Auto-expand complaints section when on complaints pages
  useEffect(() => {
    if (pathname.includes('/complaints')) {
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        newSet.add('Complaints');
        return newSet;
      });
    }
  }, [pathname]);

  // Auto-expand attendance section when on attendance pages
  useEffect(() => {
    if (pathname.includes('/take-attendance') || pathname.includes('/view-attendance')) {
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        newSet.add('Attendance');
        return newSet;
      });
    }
  }, [pathname]);

  // Auto-expand leave & stay requests section when on leave or stay pages
  useEffect(() => {
    if (pathname.includes('/leave-management') || pathname.includes('/stay-in-hostel-requests')) {
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        newSet.add('Leaves & Stays');
        newSet.add('Leave & Stay Requests');
        return newSet;
      });
    }
  }, [pathname]);

  const toggleExpanded = (itemName) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const menuItems = [
    {
      name: 'Dashboard Home',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
      path: '/warden/dashboard',
      show: true,
      locked: false
    },
    {
      name: 'Attendance',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      path: '/warden/dashboard/attendance',
      show: true,
      locked: false,
      subItems: [
        {
          name: 'Mark Attendance',
          path: '/warden/dashboard/take-attendance',
          icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        },
        {
          name: 'View Attendance',
          path: '/warden/dashboard/view-attendance',
          icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
        },
      ],
    },
    {
      name: 'Complaints',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      path: '/warden/dashboard/complaints',
      show: true,
      locked: false,
      subItems: [
        {
          name: 'Raise Complaint',
          path: '/warden/dashboard/complaints/raise',
          icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
          name: 'View Complaints',
          path: '/warden/dashboard/complaints/view',
          icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
        }
      ]
    },
    {
      name: 'Leaves & Stays',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      path: '/warden/dashboard/leave-management',
      show: true,
      locked: false,
      subItems: [
        {
          name: 'Leaves',
          path: '/warden/dashboard/leave-management',
          icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        },
        {
          name: 'Apply on Behalf',
          path: '/warden/dashboard/leave-management/apply-on-behalf',
          icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
          name: "Stay In's",
          path: '/warden/dashboard/stay-in-hostel-requests',
          icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2 M12 12v3 M12 12a2 2 0 100-4 2 2 0 000 4z'
        }
      ]
    },
    {
      name: 'Bulk Outing',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      path: '/warden/dashboard/bulk-outing',
      show: true,
      locked: false
    },
    {
      name: 'Fee Management',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      path: '/warden/dashboard/fee-management',
      show: true,
      locked: false
    },
    {
      name: 'Electricity Bills',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      path: '/warden/dashboard/electricity-bills',
      show: true,
      locked: false
    },
    {
      name: 'Room Changes',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      path: '/warden/dashboard/room-change-requests',
      show: true,
      locked: false
    },
    {
      name: 'Category Changes',
      icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
      path: '/warden/dashboard/category-change-requests',
      show: true,
      locked: false
    },
    {
      name: 'NOC Management',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      path: '/warden/dashboard/noc-management',
      show: true,
      locked: false
    },
    {
      name: 'Notifications',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      path: '/warden/dashboard/notifications',
      show: true,
      locked: false
    }
  ];

  const mobilePageTitle = (() => {
    let best = { name: 'Warden', len: -1 };
    for (const item of menuItems) {
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (
            (pathname === sub.path || pathname.startsWith(`${sub.path}/`)) &&
            sub.path.length > best.len
          ) {
            best = { name: sub.name, len: sub.path.length };
          }
        }
      }
      if (item.path === '/warden/dashboard') {
        if (pathname === '/warden/dashboard' || pathname === '/warden/dashboard/') {
          return item.name;
        }
      } else if (
        (pathname === item.path || pathname.startsWith(`${item.path}/`)) &&
        item.path.length > best.len
      ) {
        best = { name: item.name, len: item.path.length };
      }
    }
    return best.name;
  })();

  return (
      <div className="h-screen flex bg-background overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-surface shadow-md border hover:bg-background transition-colors"
        style={{ borderColor: 'var(--border)' }}
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5 text-sidebar-muted" />
      </button>

      {/* Enterprise Campo Sidebar */}
      <CampoSidebar
        sections={wardenSections}
        moduleSubtitle="Hostel · Warden Portal"
        user={user}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isSidebarOpen}
        setIsMobileOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto flex flex-col min-h-0 bg-background transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="lg:hidden sticky top-0 z-40 h-14 flex-shrink-0 relative bg-surface/95 backdrop-blur-sm border-b border-border shadow-sm flex items-center px-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="relative z-10 p-2 rounded-lg bg-white shadow border border-gray-100 hover:bg-gray-50 transition-colors duration-200 flex-shrink-0"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="pointer-events-none absolute inset-x-0 top-0 h-14 flex items-center justify-center px-14">
            <span className="text-base font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent truncate max-w-full text-center">
              {mobilePageTitle}
            </span>
          </h1>
          <div className="relative z-10 ml-auto flex-shrink-0">
            <NotificationBell />
          </div>
        </header>
        <div className="max-w-7xl mx-auto p-4 lg:p-8 w-full flex-1">
          <div className="hidden lg:flex justify-end mb-4">
            <NotificationBell />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default WardenDashboard;
