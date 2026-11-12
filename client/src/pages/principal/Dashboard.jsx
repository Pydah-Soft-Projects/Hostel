import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import api from '../../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import NotificationBell from '../../components/NotificationBell';
import ResetPasswordModal from '../admin/ResetPasswordModal';
import CampoSidebar from '../../components/CampoSidebar';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  TicketCheck,
  CalendarDays,
  BedDouble,
  FileSpreadsheet,
  Menu
} from 'lucide-react';

// Helper function to get course name consistently
const getCourseName = (course) => {
  if (!course) return 'Course Management';
  if (typeof course === 'object' && course.name) return course.name;
  if (typeof course === 'string') return course;
  return 'Course Management';
};

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
          Please contact your super admin to request access.
        </p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800">
            <strong>Available sections:</strong> Check the sidebar for sections you can access.
          </p>
        </div>
      </div>
    </div>
  );
};

// Protected Section Component
const ProtectedSection = ({ permission, sectionName, children }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const hasPerm = isSuperAdmin || !user?.permissions || !Array.isArray(user.permissions) || user.permissions.length === 0 || user.permissions.includes(permission);

  if (!hasPerm) {
    return <PermissionDenied sectionName={sectionName} />;
  }

  return children;
};

const PrincipalDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Debug: Log user data to see what permissions principals have
  console.log('🎓 Principal Dashboard - User Data:', {
    role: user?.role,
    permissions: user?.permissions,
    course: user?.course,
    username: user?.username
  });
  // Removed notificationCount state - NotificationBell component handles notifications
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('campo_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('campo_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  const principalSections = [
    {
      title: 'MAIN',
      items: [
        {
          name: 'Dashboard Home',
          icon: LayoutDashboard,
          path: '/principal/dashboard',
          show: hasPageAccess('dashboard_home')
        }
      ]
    },
    {
      title: 'MANAGEMENT & OVERSIGHT',
      items: [
        {
          name: 'Students',
          icon: Users,
          path: '/principal/dashboard/students',
          show: hasPageAccess('students')
        },
        {
          name: 'Reports',
          icon: FileSpreadsheet,
          path: '/principal/dashboard/reports',
          show: hasPageAccess('reports')
        }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          name: 'Attendance',
          icon: CalendarCheck,
          path: '/principal/dashboard/attendance',
          show: hasPageAccess('attendance')
        },
        {
          name: 'Complaints',
          icon: TicketCheck,
          path: '/principal/dashboard/complaints',
          show: hasPageAccess('complaints')
        },
        {
          name: 'Leaves',
          icon: CalendarDays,
          path: '/principal/dashboard/leave-management',
          show: hasPageAccess('leaves')
        },
        {
          name: 'Stay in Requests',
          icon: BedDouble,
          path: '/principal/dashboard/stay-in-hostel-requests',
          show: hasPageAccess('stay_in_requests')
        }
      ]
    }
  ];
  const [notificationStates, setNotificationStates] = useState({
    complaint: false,
    announcement: false,
    poll: false
  });
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Removed duplicate notification polling - NotificationBell component already handles this
  // This was causing duplicate API calls and console spam

  const hasPermission = (permission) => {
    const isSuperAdmin = user?.role === 'super_admin';
    const isPrincipal = user?.role === 'principal';

    console.log('🔐 Permission check:', {
      permission,
      userRole: user?.role,
      userPermissions: user?.permissions,
      isSuperAdmin,
      isPrincipal,
      hasPermission: isSuperAdmin || isPrincipal || user?.permissions?.includes(permission)
    });
    // Principals should have access to their own sections
    return isSuperAdmin || isPrincipal || user?.permissions?.includes(permission);
  };

  const hasPageAccess = (pageKey) => {
    if (user?.role === 'super_admin') return true;
    if (!user?.permissions || !Array.isArray(user.permissions) || user.permissions.length === 0) return true;

    const perms = user.permissions;
    switch (pageKey) {
      case 'dashboard_home':
        return perms.includes('dashboard_home') || perms.includes('principal_dashboard_home');
      case 'attendance':
        return perms.includes('attendance_management') || perms.includes('principal_attendance_oversight');
      case 'students':
        return perms.includes('student_management') || perms.includes('principal_student_oversight');
      case 'complaints':
        return perms.includes('maintenance_ticket_management') || perms.includes('complaints_management');
      case 'leaves':
        return perms.includes('leave_management');
      case 'stay_in_requests':
        return perms.includes('room_management') || perms.includes('stay_in_hostel_requests');
      case 'reports':
        return perms.includes('course_management') || perms.includes('principal_course_management') || perms.includes('student_count_reports');
      default:
        return perms.includes(pageKey);
    }
  };

  const menuItems = [
    {
      name: 'Dashboard Home',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
      path: '/principal/dashboard',
      show: hasPageAccess('dashboard_home'),
      locked: false
    },
    {
      name: 'Attendance',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      path: '/principal/dashboard/attendance',
      show: hasPageAccess('attendance'),
      locked: false
    },
    {
      name: 'Students',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      path: '/principal/dashboard/students',
      show: hasPageAccess('students'),
      locked: false
    },
    {
      name: 'Complaints',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      path: '/principal/dashboard/complaints',
      show: hasPageAccess('complaints'),
      locked: false
    },
    {
      name: 'Leaves',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      path: '/principal/dashboard/leave-management',
      show: hasPageAccess('leaves'),
      locked: false
    },
    {
      name: 'Stay in Requests',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2 M12 12v3 M12 12a2 2 0 100-4 2 2 0 000 4z',
      path: '/principal/dashboard/stay-in-hostel-requests',
      show: hasPageAccess('stay_in_requests'),
      locked: false
    },
    {
      name: 'Reports',
      icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
      path: '/principal/dashboard/reports',
      show: hasPageAccess('reports'),
      locked: false
    }
  ];

  return (
    <div className="h-screen flex bg-background">
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
        sections={principalSections}
        moduleSubtitle="Hostel · Principal Portal"
        user={user}
        onLogout={handleLogout}
        onResetPassword={() => setShowResetPasswordModal(true)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isSidebarOpen}
        setIsMobileOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="mx-auto p-4 lg:p-8">
          <div className="flex justify-end mb-4">
            <NotificationBell />
          </div>
          <Outlet />
        </div>
      </main>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
      />
    </div>
  );
};

export default PrincipalDashboard; 