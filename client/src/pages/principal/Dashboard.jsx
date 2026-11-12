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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface shadow-lg hover:bg-background transition-colors duration-200"
      >
        <Bars3Icon className="w-6 h-6 text-gray-600" />
      </button>

      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed lg:relative top-0 left-0 bottom-0 w-56 bg-sidebar text-sidebar-text border-r border-sidebar-muted/20 shadow-lg flex flex-col z-50 lg:translate-x-0 lg:!transform-none"
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-sidebar-text transition-colors duration-200"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 mb-2 border-b border-sidebar-muted/20 flex-shrink-0 pr-12 lg:pr-5">
          <img
            src="/campo-logos/campo_logo_transparent_hq.png"
            alt="Campo Hostel"
            className="h-8 w-auto object-contain object-left"
          />
          <p className="text-[11px] font-medium text-sidebar-muted mt-1.5 truncate">
            {user?.assignedCollegeDetails && user.assignedCollegeDetails.length > 0
              ? (user.assignedCollegeDetails.length > 1
                ? `${user.assignedCollegeDetails.length} Colleges`
                : user.assignedCollegeDetails[0].name)
              : 'Hostel · Principal Portal'}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top fade indicator */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-sidebar to-transparent pointer-events-none z-10 opacity-0 transition-opacity duration-300"
            id="top-fade"></div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto min-h-0 scrollbar-sidebar"
            onScroll={(e) => {
              const target = e.target;
              const topFade = document.getElementById('top-fade');
              const bottomFade = document.getElementById('bottom-fade');

              if (topFade && bottomFade) {
                // Show top fade when scrolled down
                topFade.style.opacity = target.scrollTop > 10 ? '1' : '0';

                // Show bottom fade when not at bottom
                const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 5;
                bottomFade.style.opacity = isAtBottom ? '0' : '1';
              }
            }}>
            {menuItems.filter(item => item.show).map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.locked ? (
                  // Locked item - show as disabled (icon + faded label only)
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-muted/50 cursor-not-allowed opacity-60 select-none">
                    <div className="relative">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={item.icon}
                        />
                      </svg>
                    </div>
                    <span className="flex-1 text-sm font-normal">{item.name}</span>
                  </div>
                ) : (
                  // Active item - normal NavLink
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-normal transition-all duration-300 ${isActive
                        ? "bg-primary text-white shadow-md font-semibold"
                        : "text-sidebar-text/80 hover:bg-white/10 hover:text-white"
                      }`
                    }
                    end
                  >
                    {({ isActive }) => (
                      <>
                        <div className="relative z-10">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d={item.icon}
                            />
                          </svg>
                          {item.notificationType && notificationStates[item.notificationType] && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                            >
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [1, 0.5, 1]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className="w-full h-full bg-red-500 rounded-full"
                              />
                            </motion.div>
                          )}
                        </div>
                        <span className="relative z-10">{item.name}</span>
                        {isActive && (
                          <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer pointer-events-none"></span>
                        )}
                      </>
                    )}
                  </NavLink>
                )}
              </motion.div>
            ))}
          </nav>

          {/* Bottom fade indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-sidebar to-transparent pointer-events-none z-10 opacity-0 transition-opacity duration-300"
            id="bottom-fade"></div>
        </div>

        {/* User Profile and Logout */}
        <div className="p-4 border-t border-sidebar-muted/20 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-md text-sm lg:text-base">
              {(user?.name || user?.username) ? (user?.name || user?.username).charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs lg:text-sm font-semibold text-sidebar-text truncate" title={user?.name || user?.username || 'Principal'}>
                {user?.name || user?.username || 'Principal'}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-sidebar-muted truncate max-w-[120px]" title={user?.assignedCollegeDetails?.map(c => c.name).join(', ') || 'Principal'}>
                  {user?.assignedCollegeDetails && user.assignedCollegeDetails.length > 0
                    ? (user.assignedCollegeDetails.length > 1
                      ? `${user.assignedCollegeDetails.length} Colleges`
                      : user.assignedCollegeDetails[0].name)
                    : 'Principal'}
                </div>
                {/* Password Reset Icon */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowResetPasswordModal(true)}
                  className="p-1.5 hover:text-primary-light hover:bg-white/10 rounded-full transition-all duration-200"
                  title="Reset Password"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 lg:px-4 py-2 text-xs font-normal text-white bg-primary hover:bg-primary-hover rounded-lg transition-all duration-300 shadow hover:shadow-md"
          >
            <svg
              className="w-3 h-3 lg:w-4 lg:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
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