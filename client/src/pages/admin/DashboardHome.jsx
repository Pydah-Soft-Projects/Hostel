import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../../utils/axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserPlusIcon,
  MegaphoneIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissionUtils';

// Normalize text for consistent grouping
const normalizeText = (value) => (value || '').toString().trim().toUpperCase();

const summarizeAttendanceByCourse = (records = []) => records.reduce((summary, record) => {
  const course = record.student?.course;
  const courseName = typeof course === 'object' ? course?.name : course;
  const courseKey = normalizeText(courseName);
  if (!courseKey || record.student?.isOnLeave) return summary;

  if (!summary[courseKey]) {
    summary[courseKey] = { total: 0, fullyPresent: 0, partiallyPresent: 0, absent: 0, percentage: 0 };
  }

  const courseSummary = summary[courseKey];
  courseSummary.total += 1;
  const markedSessions = [record.morning, record.evening, record.night].filter(Boolean).length;
  if (markedSessions === 3) courseSummary.fullyPresent += 1;
  else if (markedSessions > 0) courseSummary.partiallyPresent += 1;
  else courseSummary.absent += 1;
  courseSummary.percentage = Math.round(
    ((courseSummary.fullyPresent + courseSummary.partiallyPresent * 0.33) / courseSummary.total) * 100
  );
  return summary;
}, {});

// Executive KPI Metric Card (Non-financial)
const ExecutiveKpiCard = ({ icon: Icon, label, value, subtext, badge, badgeColor = 'bg-blue-50 text-blue-700', iconBg = 'bg-blue-50 text-blue-600', borderColor = 'hover:border-blue-300', onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${borderColor} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border border-current/10 ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">
          {value}
        </div>
        <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
          {label}
        </div>
        {subtext && (
          <div className="text-[11px] text-gray-500 font-medium truncate">
            {subtext}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Polished Module Section Container
const ModuleSection = ({ title, subtitle, icon: Icon, iconColor = 'bg-primary text-white', rightAction, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200/80 shadow-xs p-4 sm:p-5 flex flex-col ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-2xs ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate leading-tight">{title}</h2>
            {subtitle && <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsMode, setAnalyticsMode] = useState('live'); // 'live' or 'ay'
  const currentYearNum = new Date().getFullYear();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(`${currentYearNum}-${currentYearNum + 1}`);

  const ACADEMIC_YEARS = [
    `${currentYearNum}-${currentYearNum + 1}`,
    `${currentYearNum - 1}-${currentYearNum}`,
    `${currentYearNum - 2}-${currentYearNum - 1}`,
    `${currentYearNum - 3}-${currentYearNum - 2}`,
    `${currentYearNum - 4}-${currentYearNum - 3}`
  ];

  // States for Newly Admitted Students (last 15 days)
  const [newStudents, setNewStudents] = useState([]);
  const [loadingNewStudents, setLoadingNewStudents] = useState(false);
  const [joiningDates, setJoiningDates] = useState({});
  const [savingJoiningDate, setSavingJoiningDate] = useState({});

  const fetchRecentAdmissions = useCallback(async () => {
    setLoadingNewStudents(true);
    try {
      const res = await api.get('/api/admin/students/recent-admissions?days=15');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setNewStudents(res.data.data);
        const initialDates = {};
        res.data.data.forEach(s => {
          if (s.joiningDate) {
            initialDates[s._id] = new Date(s.joiningDate).toISOString().slice(0, 10);
          }
        });
        setJoiningDates(initialDates);
      }
    } catch (error) {
      console.error('Error fetching recent admissions:', error);
    } finally {
      setLoadingNewStudents(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentAdmissions();
  }, [fetchRecentAdmissions]);

  const handleSaveJoiningDate = async (studentId) => {
    const dateVal = joiningDates[studentId];
    if (!dateVal) {
      toast.error('Please select a valid joining date');
      return;
    }

    setSavingJoiningDate(prev => ({ ...prev, [studentId]: true }));
    try {
      await api.put('/api/admin/students/' + studentId, {
        joiningDate: dateVal
      });
      toast.success('Hostel joining date saved successfully');
      setNewStudents(prev => prev.map(s => s._id === studentId ? { ...s, joiningDate: dateVal } : s));
    } catch (error) {
      console.error('Error saving joining date:', error);
      toast.error(error.response?.data?.message || 'Failed to save hostel joining date');
    } finally {
      setSavingJoiningDate(prev => ({ ...prev, [studentId]: false }));
    }
  };

  // Check if user is super admin
  const isSuperAdmin = useMemo(() => user?.role === 'super_admin', [user]);

  // Permission checks - bypass for super_admin
  const canViewStudents = useMemo(() => isSuperAdmin || hasPermission(user, 'student_management') || user?.role === 'warden', [user, isSuperAdmin]);
  const canViewAttendance = useMemo(() => isSuperAdmin || hasPermission(user, 'attendance_management') || user?.role === 'warden', [user, isSuperAdmin]);
  const canViewComplaints = useMemo(() => isSuperAdmin || hasPermission(user, 'maintenance_ticket_management') || user?.role === 'warden', [user, isSuperAdmin]);
  const canViewLeaves = useMemo(() => isSuperAdmin || hasPermission(user, 'leave_management') || user?.role === 'warden', [user, isSuperAdmin]);
  const canViewMenu = useMemo(() => isSuperAdmin || hasPermission(user, 'menu_management'), [user, isSuperAdmin]);
  const canViewRooms = useMemo(() => isSuperAdmin || hasPermission(user, 'room_management') || user?.role === 'warden', [user, isSuperAdmin]);
  const canViewAnnouncements = useMemo(() => isSuperAdmin || hasPermission(user, 'announcement_management') || user?.role === 'warden', [user, isSuperAdmin]);
  const canViewPolls = useMemo(() => isSuperAdmin || hasPermission(user, 'poll_management') || user?.role === 'warden', [user, isSuperAdmin]);
  const canViewCommunication = useMemo(() => canViewAnnouncements || canViewPolls, [canViewAnnouncements, canViewPolls]);

  const hasAnyPermission = useMemo(() => {
    return isSuperAdmin || canViewStudents || canViewAttendance || canViewComplaints ||
      canViewLeaves || canViewMenu || canViewRooms || canViewCommunication;
  }, [isSuperAdmin, canViewStudents, canViewAttendance, canViewComplaints,
    canViewLeaves, canViewMenu, canViewRooms, canViewCommunication]);

  // Operational State
  const [stats, setStats] = useState({
    students: {
      total: 0,
      active: 0,
      inactive: 0,
      newThisWeek: 0,
      byCourse: []
    },
    attendance: {
      byCourseToday: {},
      byCourseYesterday: {},
      today: {
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0,
        fullyPresent: 0,
        partiallyPresent: 0,
        morningPresent: 0,
        eveningPresent: 0,
        nightPresent: 0,
        byCourseToday: {},
        byCourseYesterday: {}
      },
      trend: []
    },
    complaints: {
      total: 0,
      pending: 0,
      active: 0,
      resolved: 0,
      inProgress: 0,
      resolvedThisWeek: 0,
      avgResolutionTime: 0
    },
    leaves: {
      pending: 0,
      approvedToday: 0,
      rejectedToday: 0,
      thisWeek: []
    },
    rooms: {
      total: 0,
      occupied: 0,
      available: 0,
      occupancyRate: 0,
      byGender: [],
      byHostel: []
    },
    communication: {
      activeAnnouncements: 0,
      activePolls: 0,
      recentAnnouncements: [],
      recentPolls: []
    },
    menu: {
      todaysMenu: null,
      hasMenu: false
    }
  });

  const isInitialMount = React.useRef(true);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const summaryEndpoint = analyticsMode === 'ay'
        ? `/api/admin/dashboard-summary?academicYear=${selectedAcademicYear}`
        : '/api/admin/dashboard-summary';

      // Primary summary
      const summaryRes = await api.get(summaryEndpoint).catch(() => null);
      if (summaryRes?.data?.success) {
        const sData = summaryRes.data.data;
        setStats(prev => ({
          ...prev,
          students: sData.students || prev.students,
          complaints: sData.complaints || prev.complaints,
          leaves: sData.leaves || prev.leaves,
          rooms: sData.rooms || prev.rooms,
          communication: sData.communication || prev.communication
        }));
      }

      // Room stats
      if (canViewRooms) {
        const roomStatsEndpoint = analyticsMode === 'ay'
          ? `/api/admin/rooms/stats?academicYear=${selectedAcademicYear}`
          : '/api/admin/rooms/stats';
        const roomStatsRes = await api.get(roomStatsEndpoint).catch(() => null);
        if (roomStatsRes?.data?.success) {
          const roomData = roomStatsRes.data.data;
          const overall = roomData.overall || {};
          setStats(prev => ({
            ...prev,
            rooms: {
              ...prev.rooms,
              total: overall.totalRooms ?? prev.rooms.total,
              occupied: overall.filledBeds ?? prev.rooms.occupied,
              available: overall.availableBeds ?? prev.rooms.available,
              occupancyRate: overall.totalBeds > 0
                ? Math.round((overall.filledBeds / overall.totalBeds) * 100)
                : 0,
              byHostel: roomData.byHostel || []
            }
          }));
        }
      }

      // Attendance
      if (canViewAttendance) {
        const yesterdayDate = new Date(`${today}T00:00:00.000Z`);
        yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];
        const academicYearParam = analyticsMode === 'ay'
          ? `&academicYear=${encodeURIComponent(selectedAcademicYear)}`
          : '';
        const [todayAttendanceRes, yesterdayAttendanceRes] = await Promise.all([
          api.get(`/api/attendance/date?date=${today}${academicYearParam}`).catch(() => null),
          api.get(`/api/attendance/date?date=${yesterday}${academicYearParam}`).catch(() => null)
        ]);

        setStats(prev => ({
          ...prev,
          attendance: {
            ...prev.attendance,
            byCourseToday: todayAttendanceRes?.data?.success
              ? summarizeAttendanceByCourse(todayAttendanceRes.data.data.attendance)
              : prev.attendance.byCourseToday,
            byCourseYesterday: yesterdayAttendanceRes?.data?.success
              ? summarizeAttendanceByCourse(yesterdayAttendanceRes.data.data.attendance)
              : prev.attendance.byCourseYesterday
          }
        }));
      }

      // Fetch static attendance statistics & cafeteria menu
      if (isInitialMount.current || isManualRefresh) {
        isInitialMount.current = false;
        const [attendanceStatsRes, todaysMenuRes] = await Promise.allSettled([
          api.get(`/api/attendance/stats?date=${today}`),
          api.get('/api/cafeteria/menu/today')
        ]);

        if (attendanceStatsRes.status === 'fulfilled' && attendanceStatsRes.value?.data?.success) {
          const attendanceData = attendanceStatsRes.value.data.data.statistics || {};
          setStats(prev => ({
            ...prev,
            attendance: {
              ...prev.attendance,
              today: {
                total: attendanceData.totalStudents || 0,
                present: attendanceData.fullyPresent || 0,
                absent: attendanceData.absent || 0,
                percentage: attendanceData.percentages?.fullyPresentPercentage || 0,
                fullyPresent: attendanceData.fullyPresent || 0,
                partiallyPresent: attendanceData.partiallyPresent || 0,
                morningPresent: attendanceData.morningPresent || 0,
                eveningPresent: attendanceData.eveningPresent || 0,
                nightPresent: attendanceData.nightPresent || 0
              }
            }
          }));
        }

        if (todaysMenuRes.status === 'fulfilled' && todaysMenuRes.value?.data?.success) {
          const menuData = todaysMenuRes.value.data.data;
          setStats(prev => ({
            ...prev,
            menu: {
              todaysMenu: menuData,
              hasMenu: !!menuData && !!menuData.meals
            }
          }));
        }
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [analyticsMode, selectedAcademicYear, canViewRooms, canViewAttendance]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Scoped courses for non-super-admin users
  const displayCourses = useMemo(() => {
    let list = stats.students.byCourse || [];
    if (user?.role !== 'super_admin' && (user?.assignedCourses?.length > 0 || user?.assignedCollegeIds?.length > 0)) {
      if (user?.assignedCourses?.length > 0) {
        const allowedLower = user.assignedCourses.map(c => c.trim().toLowerCase());
        list = list.filter(c => allowedLower.includes((c.name || '').trim().toLowerCase()));
      }
    }
    return list;
  }, [stats.students.byCourse, user]);

  // Show message if user has no permissions
  if (!hasAnyPermission && !loading) {
    return (
      <>
        <SEO
          title="Admin Dashboard"
          description="Admin dashboard for hostel management system"
          keywords="Admin Dashboard, Hostel Management"
        />
        <div className="mx-auto mt-12 sm:mt-0 w-full flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center max-w-md">
            <ExclamationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Access</h2>
            <p className="text-sm text-gray-600">
              You don't have permission to view any dashboard modules. Please contact your administrator.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Admin Dashboard"
        description="Comprehensive admin dashboard for hostel management system with real-time statistics and insights."
        keywords="Admin Dashboard, Hostel Management, Statistics, Analytics"
      />

      <div className="mx-auto mt-8 sm:mt-0 space-y-5 sm:space-y-6 pb-8">

        {/* =========================================================================
            HEADER COMMAND BAR (Title, Mode Toggle, AY Selector & Refresh)
        ========================================================================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 sm:p-5 rounded-xl border border-gray-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Dashboard Overview
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Operations
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Hostel capacity, resident attendance, and campus service governance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Live vs AY Mode Pill */}
            <div className="relative grid grid-cols-2 items-center bg-gray-100 p-1 rounded-xl w-60 sm:w-64 border border-gray-200/60 shadow-inner">
              <motion.div
                className="absolute top-1 bottom-1 bg-primary rounded-lg shadow-sm"
                initial={false}
                animate={{
                  left: analyticsMode === 'live' ? '4px' : 'calc(50% + 2px)',
                  width: 'calc(50% - 6px)'
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />

              <button
                type="button"
                onClick={() => setAnalyticsMode('live')}
                className={`relative z-10 py-1.5 text-xs font-semibold text-center transition-colors duration-150 select-none ${
                  analyticsMode === 'live' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Live Analytics
              </button>

              <button
                type="button"
                onClick={() => setAnalyticsMode('ay')}
                className={`relative z-10 py-1.5 text-xs font-semibold text-center transition-colors duration-150 select-none ${
                  analyticsMode === 'ay' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                AY Wise
              </button>
            </div>

            {/* Academic Year Dropdown */}
            <select
              value={selectedAcademicYear}
              disabled={analyticsMode === 'live'}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary shadow-xs ${
                analyticsMode === 'live'
                  ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 cursor-pointer'
              }`}
              title={analyticsMode === 'live' ? 'Switch to AY Wise to select academic year' : 'Select Academic Year'}
            >
              {ACADEMIC_YEARS.map((ay) => (
                <option key={ay} value={ay}>
                  AY {ay}
                </option>
              ))}
            </select>

            {/* Manual Sync / Refresh Button */}
            <button
              type="button"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors shadow-2xs"
              title="Refresh Dashboard Data"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </div>

        {/* Inline Loading Indicator */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-xs border border-gray-200">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* =========================================================================
                TIER 1: 4 EXECUTIVE KPI HERO CARDS (Non-Financial)
            ========================================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {/* Card 1: Active Residents */}
              <ExecutiveKpiCard
                icon={AcademicCapIcon}
                label="Active Residents"
                value={stats.students.active.toLocaleString()}
                subtext={`${stats.students.total.toLocaleString()} total registered · +${stats.students.newThisWeek || 0} this week`}
                badge="Students"
                badgeColor="bg-blue-50 text-blue-700"
                iconBg="bg-blue-50 text-blue-600"
                borderColor="hover:border-blue-400"
                onClick={() => navigate('/admin/dashboard/students')}
              />

              {/* Card 2: Hostel Bed Occupancy */}
              <ExecutiveKpiCard
                icon={BuildingOfficeIcon}
                label="Hostel Bed Occupancy"
                value={`${stats.rooms.occupancyRate}%`}
                subtext={`${stats.rooms.occupied} filled · ${stats.rooms.available} available beds`}
                badge={`${stats.rooms.total} Rooms`}
                badgeColor="bg-teal-50 text-teal-700"
                iconBg="bg-teal-50 text-teal-700"
                borderColor="hover:border-teal-400"
                onClick={() => navigate('/admin/dashboard/rooms')}
              />

              {/* Card 3: Today's Daily Attendance */}
              <ExecutiveKpiCard
                icon={ClipboardDocumentCheckIcon}
                label="Today's Attendance Rate"
                value={`${stats.attendance.today.percentage || 0}%`}
                subtext={`${stats.attendance.today.fullyPresent || 0} present · ${stats.attendance.today.absent || 0} absent`}
                badge="Daily Roll"
                badgeColor="bg-emerald-50 text-emerald-700"
                iconBg="bg-emerald-50 text-emerald-600"
                borderColor="hover:border-emerald-400"
                onClick={() => navigate('/admin/dashboard/attendance')}
              />

              {/* Card 4: Action Queue (Leaves & Tickets) */}
              <ExecutiveKpiCard
                icon={ClockIcon}
                label="Pending Action Items"
                value={(stats.leaves.pending || 0) + (stats.complaints.pending || 0)}
                subtext={`${stats.leaves.pending || 0} pending leaves · ${stats.complaints.pending || 0} open tickets`}
                badge="Urgent Queue"
                badgeColor="bg-amber-50 text-amber-800"
                iconBg="bg-amber-50 text-amber-600"
                borderColor="hover:border-amber-400"
                onClick={() => navigate('/admin/dashboard/leave')}
              />
            </div>

            {/* =========================================================================
                TIER 2: BALANCED MASTER OPERATIONS GRID (Left 58% / Right 42%)
            ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">

              {/* LEFT COLUMN: Operations & Capacity (7 cols on lg) */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">

                {/* 1. Hostel Occupancy & Capacity Matrix */}
                {canViewRooms && (
                  <ModuleSection
                    title="Hostel Occupancy & Bed Distribution"
                    subtitle={analyticsMode === 'ay' ? `Academic Year ${selectedAcademicYear}` : 'Real-time occupied & available bed inventory'}
                    icon={BuildingOfficeIcon}
                    iconColor="bg-teal-600 text-white"
                    rightAction={
                      <button
                        onClick={() => navigate('/admin/dashboard/rooms')}
                        className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                      >
                        Manage Rooms <ArrowRightIcon className="w-3.5 h-3.5" />
                      </button>
                    }
                  >
                    <div className="space-y-4">
                      {/* Overall Capacity Bar */}
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5">
                          <span>Overall Bed Capacity</span>
                          <span className="text-teal-700 font-bold">{stats.rooms.occupancyRate}% Occupied</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden flex">
                          <div
                            className="bg-teal-600 h-full transition-all duration-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, stats.rooms.occupancyRate))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 font-medium">
                          <span>Filled: <strong className="text-gray-800">{stats.rooms.occupied}</strong></span>
                          <span>Vacant: <strong className="text-emerald-700">{stats.rooms.available}</strong></span>
                          <span>Total Beds: <strong className="text-gray-800">{stats.rooms.occupied + stats.rooms.available}</strong></span>
                        </div>
                      </div>

                      {/* Hostel Table */}
                      {stats.rooms.byHostel?.length ? (
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200 text-left">
                            <thead className="bg-gray-50/75">
                              <tr>
                                <th className="px-3.5 py-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider">Hostel Block</th>
                                <th className="px-3.5 py-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                                <th className="px-3.5 py-2.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Filled / Total</th>
                                <th className="px-3.5 py-2.5 text-right text-xs font-bold text-emerald-700 uppercase tracking-wider">Vacant</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {stats.rooms.byHostel
                                .flatMap(hostel => (hostel.categories || []).map(category => ({ hostel, category })))
                                .map(({ hostel, category }) => {
                                  const totalBeds = category.totalBeds || 0;
                                  const filledBeds = category.filledBeds || 0;
                                  const vacantBeds = category.availableBeds ?? Math.max(0, totalBeds - filledBeds);
                                  const filledPercentage = totalBeds > 0 ? Math.round((filledBeds / totalBeds) * 100) : 0;

                                  return (
                                    <tr key={`${hostel.hostelId}-${category.categoryId}`} className="hover:bg-gray-50/75 transition-colors">
                                      <td className="px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-900">{hostel.hostelName}</td>
                                      <td className="px-3.5 py-2.5 text-xs text-gray-600 font-medium">{category.categoryName}</td>
                                      <td className="px-3.5 py-2.5 text-right text-xs sm:text-sm">
                                        <div className="font-bold text-gray-900">{filledBeds} / {totalBeds}</div>
                                        <div className="text-[11px] text-gray-500 font-medium">{filledPercentage}% filled</div>
                                      </td>
                                      <td className="px-3.5 py-2.5 text-right text-xs sm:text-sm">
                                        <span className={`inline-block font-bold px-2 py-0.5 rounded-full text-xs ${
                                          vacantBeds > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                          {vacantBeds}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-xs text-gray-500">
                          No hostel occupancy data available.
                        </div>
                      )}
                    </div>
                  </ModuleSection>
                )}

                {/* 2. Course-wise Enrollment & Attendance Matrix */}
                {(canViewStudents || canViewAttendance) && (
                  <ModuleSection
                    title="Course-wise Attendance & Enrollment"
                    subtitle="Admitted student roll breakdown with session attendance rate"
                    icon={AcademicCapIcon}
                    iconColor="bg-blue-600 text-white"
                    rightAction={
                      <button
                        onClick={() => navigate('/admin/dashboard/attendance')}
                        className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                      >
                        Attendance Log <ArrowRightIcon className="w-3.5 h-3.5" />
                      </button>
                    }
                  >
                    <div className="space-y-4">
                      {/* Attendance Session Summary Pills */}
                      {canViewAttendance && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-2.5">
                            <div className="text-xs text-emerald-800 font-medium">Fully Present</div>
                            <div className="text-base sm:text-lg font-bold text-emerald-900 mt-0.5">
                              {stats.attendance.today.fullyPresent ?? 0}
                            </div>
                          </div>
                          <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-2.5">
                            <div className="text-xs text-amber-800 font-medium">Partially Present</div>
                            <div className="text-base sm:text-lg font-bold text-amber-900 mt-0.5">
                              {stats.attendance.today.partiallyPresent ?? 0}
                            </div>
                          </div>
                          <div className="bg-rose-50/70 border border-rose-100 rounded-lg p-2.5">
                            <div className="text-xs text-rose-800 font-medium">Absent Students</div>
                            <div className="text-base sm:text-lg font-bold text-rose-900 mt-0.5">
                              {stats.attendance.today.absent ?? 0}
                            </div>
                          </div>
                          <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-2.5">
                            <div className="text-xs text-blue-800 font-medium">Daily Rate</div>
                            <div className="text-base sm:text-lg font-bold text-blue-900 mt-0.5">
                              {stats.attendance.today.percentage ?? 0}%
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Course Attendance Table */}
                      {canViewStudents && (
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200 text-left">
                            <thead className="bg-gray-50/75">
                              <tr>
                                <th className="px-3.5 py-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider">Course</th>
                                <th className="px-3.5 py-2.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Admitted</th>
                                <th className="px-3.5 py-2.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Today Attendance</th>
                                <th className="px-3.5 py-2.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Yesterday</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {displayCourses.length > 0 ? displayCourses.map(course => {
                                const courseKey = normalizeText(course.name);
                                const todayAttendance = stats?.attendance?.byCourseToday?.[courseKey] || stats?.attendance?.today?.byCourseToday?.[courseKey];
                                const yesterdayAttendance = stats?.attendance?.byCourseYesterday?.[courseKey] || stats?.attendance?.today?.byCourseYesterday?.[courseKey];

                                const renderAttendance = (summary) => summary ? (
                                  <div>
                                    <div className="text-xs sm:text-sm font-bold text-gray-900">
                                      {summary.fullyPresent} / {summary.total}
                                    </div>
                                    <div className="text-[11px] text-gray-500 font-medium">
                                      {summary.percentage}% · {summary.partiallyPresent} part
                                    </div>
                                  </div>
                                ) : <span className="text-xs text-gray-400 font-medium">—</span>;

                                return (
                                  <tr key={course.name} className="hover:bg-gray-50/75 transition-colors">
                                    <td className="px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-800">{course.name}</td>
                                    <td className="px-3.5 py-2.5 text-right text-xs sm:text-sm font-bold text-gray-900">{course.count}</td>
                                    <td className="px-3.5 py-2.5 text-right">{renderAttendance(todayAttendance)}</td>
                                    <td className="px-3.5 py-2.5 text-right">{renderAttendance(yesterdayAttendance)}</td>
                                  </tr>
                                );
                              }) : (
                                <tr>
                                  <td colSpan="4" className="px-3.5 py-6 text-center text-xs text-gray-500">No course data available.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </ModuleSection>
                )}

              </div>

              {/* RIGHT COLUMN: Governance, Tickets & Campus Life (5 cols on lg) */}
              <div className="lg:col-span-5 space-y-5 sm:space-y-6">

                {/* 1. Action Center: Complaints & Leave Requests */}
                {(canViewComplaints || canViewLeaves) && (
                  <ModuleSection
                    title="Urgent Action Center"
                    subtitle="Live complaint tickets & leave permission queue"
                    icon={ClockIcon}
                    iconColor="bg-amber-500 text-white"
                  >
                    <div className="space-y-4">
                      {/* Complaints Block */}
                      {canViewComplaints && (
                        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
                              Maintenance Tickets
                            </span>
                            <button
                              onClick={() => navigate('/admin/dashboard/complaints')}
                              className="text-[11px] font-semibold text-primary hover:underline"
                            >
                              View All →
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white rounded-lg p-2 border border-gray-200/80 shadow-2xs">
                              <div className="text-base sm:text-lg font-extrabold text-amber-700">{stats.complaints.pending}</div>
                              <div className="text-[10px] text-gray-500 font-semibold uppercase">Pending</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-gray-200/80 shadow-2xs">
                              <div className="text-base sm:text-lg font-extrabold text-blue-700">{stats.complaints.inProgress}</div>
                              <div className="text-[10px] text-gray-500 font-semibold uppercase">In Progress</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-gray-200/80 shadow-2xs">
                              <div className="text-base sm:text-lg font-extrabold text-emerald-700">{stats.complaints.resolved}</div>
                              <div className="text-[10px] text-gray-500 font-semibold uppercase">Resolved</div>
                            </div>
                          </div>
                          {stats.complaints.avgResolutionTime > 0 && (
                            <p className="text-[11px] text-gray-500 font-medium mt-2 text-center">
                              Avg. Resolution Time: <strong className="text-gray-800">{stats.complaints.avgResolutionTime} days</strong>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Leaves Block */}
                      {canViewLeaves && (
                        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                              <CalendarIcon className="w-4 h-4 text-indigo-600" />
                              Leave & Permission Requests
                            </span>
                            <button
                              onClick={() => navigate('/admin/dashboard/leave')}
                              className="text-[11px] font-semibold text-primary hover:underline"
                            >
                              Review →
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white rounded-lg p-2 border border-gray-200/80 shadow-2xs">
                              <div className="text-base sm:text-lg font-extrabold text-indigo-700">{stats.leaves.pending}</div>
                              <div className="text-[10px] text-gray-500 font-semibold uppercase">Awaiting</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-gray-200/80 shadow-2xs">
                              <div className="text-base sm:text-lg font-extrabold text-emerald-700">{stats.leaves.approvedToday}</div>
                              <div className="text-[10px] text-gray-500 font-semibold uppercase">Approved</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-gray-200/80 shadow-2xs">
                              <div className="text-base sm:text-lg font-extrabold text-rose-700">{stats.leaves.rejectedToday}</div>
                              <div className="text-[10px] text-gray-500 font-semibold uppercase">Rejected</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ModuleSection>
                )}

                {/* 2. Today's Cafeteria Menu */}
                {canViewMenu && (
                  <ModuleSection
                    title="Today's Meal Schedule"
                    subtitle="Live menu served across hostel dining halls"
                    icon={ChartBarIcon}
                    iconColor="bg-orange-500 text-white"
                    rightAction={
                      <button
                        onClick={() => navigate('/admin/dashboard/cafeteria/menu')}
                        className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                      >
                        Menu <ArrowRightIcon className="w-3.5 h-3.5" />
                      </button>
                    }
                  >
                    {stats.menu.hasMenu && stats.menu.todaysMenu ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => {
                          const mealItems = stats.menu.todaysMenu.meals?.[meal] || [];
                          const mealEmojis = {
                            breakfast: '🥞',
                            lunch: '🍛',
                            snacks: '☕',
                            dinner: '🍽️'
                          };
                          return (
                            <div key={meal} className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-200/70">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-base">{mealEmojis[meal]}</span>
                                <span className="text-xs font-bold text-gray-800 capitalize truncate">{meal}</span>
                              </div>
                              <div className="text-[11px] text-gray-600 line-clamp-2 font-medium">
                                {mealItems.length > 0 ? (
                                  mealItems.map(item => (typeof item === 'string' ? item : (item.name || item))).join(', ')
                                ) : (
                                  <span className="text-gray-400 italic">Not set</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-5 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <div className="text-2xl mb-1">🍽️</div>
                        <p className="text-xs text-gray-500 font-medium mb-2">No menu configured for today</p>
                        <button
                          onClick={() => navigate('/admin/dashboard/cafeteria/menu')}
                          className="px-3 py-1 bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors shadow-2xs"
                        >
                          Configure Menu
                        </button>
                      </div>
                    )}
                  </ModuleSection>
                )}

                {/* 3. Campus Communication */}
                {canViewCommunication && (
                  <ModuleSection
                    title="Campus Communication"
                    subtitle="Broadcast notices and active student polls"
                    icon={MegaphoneIcon}
                    iconColor="bg-pink-600 text-white"
                    rightAction={
                      <button
                        onClick={() => navigate('/admin/dashboard/announcements')}
                        className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                      >
                        Notices <ArrowRightIcon className="w-3.5 h-3.5" />
                      </button>
                    }
                  >
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-pink-50/70 rounded-xl p-2.5 border border-pink-100">
                          <div className="text-base sm:text-lg font-bold text-pink-900">{stats.communication.activeAnnouncements}</div>
                          <div className="text-[11px] text-pink-700 font-medium">Active Notices</div>
                        </div>
                        <div className="bg-purple-50/70 rounded-xl p-2.5 border border-purple-100">
                          <div className="text-base sm:text-lg font-bold text-purple-900">{stats.communication.activePolls}</div>
                          <div className="text-[11px] text-purple-700 font-medium">Active Polls</div>
                        </div>
                      </div>

                      {stats.communication.recentAnnouncements.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Recent Announcements</div>
                          {stats.communication.recentAnnouncements.slice(0, 2).map((announcement, idx) => (
                            <div key={idx} className="text-xs text-gray-700 font-medium truncate bg-gray-50 p-2 rounded-lg border border-gray-100">
                              📢 {announcement.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ModuleSection>
                )}

                {/* 4. Quick Actions Command Launcher */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-gray-100">
                    <ShieldCheckIcon className="w-4 h-4 text-primary" />
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">Quick Command Launcher</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate('/admin/dashboard/students/register-from-sql')}
                      className="text-left p-2.5 text-xs font-semibold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg border border-gray-200/70 transition-all flex items-center gap-2"
                    >
                      <UserPlusIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="truncate">Add Student</span>
                    </button>
                    <button
                      onClick={() => navigate('/admin/dashboard/attendance')}
                      className="text-left p-2.5 text-xs font-semibold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg border border-gray-200/70 transition-all flex items-center gap-2"
                    >
                      <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">Mark Roll</span>
                    </button>
                    <button
                      onClick={() => navigate('/admin/dashboard/announcements')}
                      className="text-left p-2.5 text-xs font-semibold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg border border-gray-200/70 transition-all flex items-center gap-2"
                    >
                      <MegaphoneIcon className="w-4 h-4 text-pink-600 flex-shrink-0" />
                      <span className="truncate">Post Notice</span>
                    </button>
                    <button
                      onClick={() => navigate('/admin/dashboard/rooms')}
                      className="text-left p-2.5 text-xs font-semibold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg border border-gray-200/70 transition-all flex items-center gap-2"
                    >
                      <BuildingOfficeIcon className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span className="truncate">Room Config</span>
                    </button>
                    <button
                      onClick={() => navigate('/admin/dashboard/noc-management')}
                      className="text-left p-2.5 text-xs font-semibold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg border border-gray-200/70 transition-all flex items-center gap-2"
                    >
                      <DocumentTextIcon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="truncate">NOC Clearances</span>
                    </button>
                    <button
                      onClick={() => navigate('/admin/dashboard/reports')}
                      className="text-left p-2.5 text-xs font-semibold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg border border-gray-200/70 transition-all flex items-center gap-2"
                    >
                      <UserGroupIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="truncate">Student Reports</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* =========================================================================
                TIER 3: NEWLY ADMITTED STUDENTS ONBOARDING QUEUE (Positioned Cleanly at Bottom)
            ========================================================================= */}
            <ModuleSection
              title="Newly Admitted Students Onboarding"
              subtitle="Students admitted within the last 15 days requiring official hostel joining date verification"
              icon={UserPlusIcon}
              iconColor="bg-emerald-600 text-white"
              rightAction={
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {newStudents.length} {newStudents.length === 1 ? 'New Admission' : 'New Admissions'}
                </span>
              }
            >
              {loadingNewStudents ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : newStudents.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                  <UserPlusIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No new students admitted in the last 15 days</p>
                  <p className="text-xs text-gray-400 mt-0.5">Recently admitted students will appear here for onboarding</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {newStudents.map(student => {
                    const isSaving = !!savingJoiningDate[student._id];
                    const currentVal = joiningDates[student._id] || (student.joiningDate ? new Date(student.joiningDate).toISOString().slice(0, 10) : '');

                    return (
                      <div
                        key={student._id}
                        className="p-3.5 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        {/* Student Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="text-sm font-bold text-gray-900">{student.name}</h4>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                              {student.rollNumber || student.admissionNumber || 'N/A'}
                            </span>
                            {student.joiningDate && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                                <CheckCircleIcon className="w-3.5 h-3.5" /> Joined
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 font-medium">
                            <span>{student.course || 'Course N/A'}</span>
                            {student.branch && <span>• {student.branch}</span>}
                            {student.year && <span>• Year {student.year}</span>}
                            {student.hostel?.name && <span>• {student.hostel.name}</span>}
                            {student.roomNumber && <span className="font-semibold text-gray-700">• Room {student.roomNumber}</span>}
                          </div>
                          <div className="text-[11px] text-gray-400 font-medium mt-1">
                            Admitted: {new Date(student.admitDate || student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>

                        {/* Joining Date Form Controls */}
                        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                          <div>
                            <input
                              type="date"
                              value={currentVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                setJoiningDates(prev => ({ ...prev, [student._id]: val }));
                              }}
                              className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full sm:w-auto text-gray-700 font-medium bg-gray-50/50 hover:bg-white"
                              title="Enter hostel joining date"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSaveJoiningDate(student._id)}
                            disabled={isSaving || !currentVal}
                            className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                          >
                            {isSaving ? (
                              <>
                                <LoadingSpinner size="xs" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                <span>Save Joining Date</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ModuleSection>

          </>
        )}
      </div>
    </>
  );
};

export default DashboardHome;