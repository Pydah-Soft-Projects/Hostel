import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  AcademicCapIcon,
  PhoneIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import SEO from '../../components/SEO';

const getTodayDateInput = () => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);

const formatDateIndia = (value) => value
  ? new Date(value).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  : '—';

const formatDateDash = (value) => {
  if (!value) return '—';
  const parts = String(value).slice(0, 10).split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return formatDateIndia(value);
};

const getWeekdayIndia = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' });
};

const formatDateTimeIndia = (value) => value
  ? new Date(value).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  : '—';

const getDefaultApprovalDateRange = (days = 3) => {
  const today = getTodayDateInput();
  const from = new Date(`${today}T00:00:00.000Z`);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  return { fromDate: from.toISOString().slice(0, 10), toDate: today };
};

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [bulkOutings, setBulkOutings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkOutingsLoading, setBulkOutingsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [otp, setOtp] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeTab, setActiveTab] = useState('leaves');
  const [filters, setFilters] = useState({
    status: 'Pending OTP Verification',
    applicationType: '',
    page: 1,
    fromDate: '',
    toDate: ''
  });
  const [approvalRangeDays, setApprovalRangeDays] = useState('3');
  const [approvalDateRange, setApprovalDateRange] = useState(getDefaultApprovalDateRange);
  const [approvalSummary, setApprovalSummary] = useState([]);
  const [approvalSummaryLoading, setApprovalSummaryLoading] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState(new Set());

  const toggleType = (typeKey) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(typeKey)) {
        next.delete(typeKey);
      } else {
        next.add(typeKey);
      }
      return next;
    });
  };

  const handleExpandAllTypes = () => {
    setExpandedTypes(new Set(['Leave', 'Permission', 'Stay in Hostel', 'total']));
  };

  const handleCollapseAllTypes = () => {
    setExpandedTypes(new Set());
  };

  const sortedDays = useMemo(() => {
    return [...(approvalSummary.days || [])].sort((a, b) => a.date.localeCompare(b.date));
  }, [approvalSummary.days]);

  // Debounce filters to reduce API calls
  const debouncedFilters = useDebounce(filters, 500);
  const [expandedBulkOutings, setExpandedBulkOutings] = useState(new Set());
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(new Set());
  const [studentDetailsModal, setStudentDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [smsBalance, setSmsBalance] = useState(null);
  const [smsLoading, setSmsLoading] = useState(false);


  const [visibleOtps, setVisibleOtps] = useState({});
  const [otpValues, setOtpValues] = useState({});
  const [otpLoading, setOtpLoading] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const handleToggleOtp = async (leaveId) => {
    setVisibleOtps((prev) => ({
      ...prev,
      [leaveId]: !prev[leaveId]
    }));

    // If showing OTP and not already fetched, fetch it
    if (!visibleOtps[leaveId]) {
      setOtpLoading((prev) => ({ ...prev, [leaveId]: true }));
      try {
        const response = await api.post('/api/leave/getOtp', { leaveId });
        if (response.data.success) {
          setOtpValues((prev) => ({
            ...prev,
            [leaveId]: response.data.data.otp
          }));
        } else {
          toast.error('Failed to fetch OTP');
        }
      } catch (error) {
        toast.error('Error fetching OTP');
      } finally {
        setOtpLoading((prev) => ({ ...prev, [leaveId]: false }));
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'leaves') {
      fetchLeaves();
    } else if (activeTab === 'bulk-outings') {
      fetchBulkOutings();
    }
    fetchSMSBalance();
  }, [debouncedFilters, activeTab]);

  useEffect(() => {
    if (activeTab === 'approval-abstract') {
      fetchApprovalAbstract();
    }
  }, [activeTab, approvalDateRange]);

  const fetchSMSBalance = async () => {
    setSmsLoading(true);
    try {
      const response = await api.get('/api/admin/sms/balance');
      if (response.data.success) {
        setSmsBalance(response.data.data.balance);
      }
    } catch (error) {
      console.error('Error fetching SMS balance:', error);
    } finally {
      setSmsLoading(false);
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = { ...debouncedFilters };
      if (!params.status) delete params.status;
      if (!params.applicationType) delete params.applicationType;
      if (!params.fromDate) delete params.fromDate;
      if (!params.toDate) delete params.toDate;
      const response = await api.get('/api/admin/leave/all', { params });
      if (response.data.success) {
        setLeaves(response.data.data.leaves);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkOutings = async () => {
    setBulkOutingsLoading(true);
    try {
      const params = { ...debouncedFilters };
      if (!params.status) delete params.status;
      if (!params.applicationType) delete params.applicationType;
      if (!params.fromDate) delete params.fromDate;
      if (!params.toDate) delete params.toDate;
      const response = await api.get('/api/bulk-outing/admin', { params });
      if (response.data.success) {
        setBulkOutings(response.data.data.bulkOutings);
      }
    } catch (error) {
      console.error('Error fetching bulk outings:', error);
      toast.error('Failed to fetch bulk outing requests');
    } finally {
      setBulkOutingsLoading(false);
    }
  };

  const fetchApprovalAbstract = async () => {
    setApprovalSummaryLoading(true);
    try {
      const response = await api.get('/api/admin/leave/approval-abstract', { params: approvalDateRange });
      if (response.data.success) {
        setApprovalSummary(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching leave approval abstract:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch approval abstract');
    } finally {
      setApprovalSummaryLoading(false);
    }
  };

  const fetchBulkOutingStudents = async (outingId) => {
    // Set loading state for this specific outing
    setLoadingStudentDetails(prev => new Set(prev).add(outingId));

    try {
      const response = await api.get(`/api/bulk-outing/admin/${outingId}/students`);
      if (response.data.success) {
        // Update the specific bulk outing with student details
        setBulkOutings(prev => prev.map(outing =>
          outing._id === outingId
            ? { ...outing, students: response.data.data.students }
            : outing
        ));
      }
    } catch (error) {
      console.error('Error fetching bulk outing students:', error);
      // Don't show error toast for 404 or other expected errors
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch student details');
      }
    } finally {
      // Clear loading state for this specific outing
      setLoadingStudentDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(outingId);
        return newSet;
      });
    }
  };

  const handleApproveBulkOuting = async (bulkOutingId) => {
    try {
      const response = await api.post(`/api/bulk-outing/admin/${bulkOutingId}/approve`);
      if (response.data.success) {
        toast.success('Bulk outing request approved successfully');
        fetchBulkOutings();
      }
    } catch (error) {
      console.error('Error approving bulk outing:', error);
      toast.error(error.response?.data?.message || 'Failed to approve bulk outing');
    }
  };

  const handleRejectBulkOuting = async (bulkOutingId, reason) => {
    try {
      const response = await api.post(`/api/bulk-outing/admin/${bulkOutingId}/reject`, {
        rejectionReason: reason
      });
      if (response.data.success) {
        toast.success('Bulk outing request rejected successfully');
        fetchBulkOutings();
      }
    } catch (error) {
      console.error('Error rejecting bulk outing:', error);
      toast.error(error.response?.data?.message || 'Failed to reject bulk outing');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await api.post('/api/admin/leave/verify-otp', {
        leaveId: selectedLeave._id,
        otp
      });
      if (response.data.success) {
        toast.success(`${selectedLeave.applicationType} request approved`);
        setShowOTPModal(false);
        setOtp('');
        fetchLeaves();
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    }
  };

  const handleReject = async () => {
    try {
      const response = await api.post('/api/admin/leave/reject', {
        leaveId: selectedLeave._id,
        rejectionReason
      });
      if (response.data.success) {
        toast.success(`${selectedLeave.applicationType} request rejected`);
        setShowRejectModal(false);
        setRejectionReason('');
        fetchLeaves();
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast.error('Failed to reject request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
      case 'Principal Approved':
        return 'text-green-600 bg-green-50';
      case 'Rejected':
        return 'text-red-600 bg-red-50';
      case 'Pending':
      case 'Pending OTP Verification':
        return 'text-yellow-600 bg-yellow-50';
      case 'Warden Verified':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
      case 'Principal Approved':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'Rejected':
        return <XCircleIcon className="w-5 h-5" />;
      case 'Pending':
      case 'Pending OTP Verification':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'Warden Verified':
        return <ArrowRightIcon className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getApplicationTypeColor = (type) => {
    switch (type) {
      case 'Leave':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Permission':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDisplayDate = (leave) => {
    if (leave.applicationType === 'Leave') {
      return {
        start: formatDateIndia(leave.startDate),
        end: formatDateIndia(leave.endDate),
        duration: `${leave.numberOfDays} day${leave.numberOfDays > 1 ? 's' : ''}`,
        gatePass: formatDateTimeIndia(leave.gatePassDateTime)
      };
    } else if (leave.applicationType === 'Permission') {
      return {
        date: formatDateIndia(leave.permissionDate),
        time: `${leave.outTime} - ${leave.inTime}`,
        duration: '1 day'
      };
    }
    return {};
  };

  const toggleBulkOutingExpansion = (outingId) => {
    setExpandedBulkOutings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(outingId)) {
        newSet.delete(outingId);
      } else {
        newSet.add(outingId);
        // Fetch student details when expanding
        fetchBulkOutingStudents(outingId);
      }
      return newSet;
    });
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setFilters(f => ({
      ...f,
      status: tab === 'leaves' ? 'Pending OTP Verification' : '',
      page: 1
    }));
  };

  const openStudentDetailsModal = (student) => {
    setSelectedStudent(student);
    setStudentDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 mt-12 sm:mt-0">
        <SEO
          title="Leave & Permission Management"
          description="Manage student leave and permission requests"
          keywords="leave management, permission management, student permissions, hostel leave"
        />

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-900">Leave & Permission Management</h1>
              {!smsLoading && smsBalance !== null && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs font-semibold text-green-700 uppercase tracking-wider">SMS Credits:</span>
                  <span className="text-xs sm:text-sm font-bold text-green-800">{smsBalance}</span>
                </div>
              )}
              {smsLoading && (
                 <div className="h-6 w-24 bg-gray-100 animate-pulse rounded-lg"></div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
              Note: Leave and Permission requests now go through Warden/Admin OTP verification → Course-specific Principal approval workflow
            </p>

            {/* Mobile Filter Toggle - Below Heading */}
            {activeTab !== 'approval-abstract' && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium mt-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Filters - Collapsible on Mobile (Hidden on Leave Abstract tab) */}
          {activeTab !== 'approval-abstract' && (
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-auto`}>
              <div className="flex flex-col gap-3 sm:gap-4 bg-gray-50 lg:bg-transparent p-3 lg:p-0 rounded-lg lg:rounded-none mt-3 lg:mt-0">
                {/* Date Range Filters */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">From:</label>
                    <input
                      type="date"
                      lang="en-IN"
                      value={filters.fromDate}
                      onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value, page: 1 }))}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">To:</label>
                    <input
                      type="date"
                      lang="en-IN"
                      value={filters.toDate}
                      onChange={e => setFilters(f => ({ ...f, toDate: e.target.value, page: 1 }))}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <select
                    value={filters.applicationType}
                    onChange={(e) => setFilters({ ...filters, applicationType: e.target.value, page: 1 })}
                    className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Leave">Leave</option>
                    <option value="Permission">Permission</option>
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Pending OTP Verification">Pending OTP</option>
                    <option value="Warden Verified">Warden Verified</option>
                    <option value="Principal Approved">Principal Approved</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  {/* Clear Filters Button (Desktop & Mobile) */}
                  {(filters.fromDate || filters.toDate || filters.applicationType || filters.status) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilters({
                          status: '',
                          applicationType: '',
                          page: 1,
                          fromDate: '',
                          toDate: ''
                        });
                        setShowFilters(false);
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors text-xs font-medium self-center"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4 sm:mb-6">
          <button
            onClick={() => handleTabSwitch('leaves')}
            className={`px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors ${activeTab === 'leaves'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <span className="hidden sm:inline">Individual Requests</span>
            <span className="sm:hidden">Individual</span>
          </button>
          <button
            onClick={() => handleTabSwitch('bulk-outings')}
            className={`px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors ${activeTab === 'bulk-outings'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <span className="hidden sm:inline">Bulk Outing Requests</span>
            <span className="sm:hidden">Bulk Outings</span>
          </button>
          <button
            onClick={() => setActiveTab('approval-abstract')}
            className={`px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition-colors ${activeTab === 'approval-abstract'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Leave Abstract
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'leaves' ? (
          /* Leave List */
          <div className="w-full">
            {loading ? (
              <div className="p-4 sm:p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : leaves.length === 0 ? (
              <div className="p-4 sm:p-8 text-center text-gray-500">
                <p className="text-sm sm:text-base">No requests found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr items-stretch gap-4">
                {leaves.map((leave) => {
                  const displayInfo = formatDisplayDate(leave);
                  return (
                    <motion.div
                      key={leave._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-full rounded-lg border border-gray-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                            <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                              {getStatusIcon(leave.status)}
                              <span className="ml-1 hidden sm:inline">{leave.status}</span>
                              <span className="ml-1 sm:hidden">{leave.status === 'Pending OTP Verification' ? 'Pending OTP' : leave.status}</span>
                            </span>
                            <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getApplicationTypeColor(leave.applicationType)}`}>
                              {leave.applicationType}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 font-medium">
                              {formatDateIndia(
                                leave.applicationType === 'Leave' ? leave.startDate :
                                leave.applicationType === 'Permission' ? leave.permissionDate :
                                leave.applicationType === 'Stay in Hostel' ? leave.stayDate :
                                leave.createdAt
                              )}
                            </span>
                          </div>

                          {/* Student Details */}
                          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 mb-3">
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                              <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <button
                                onClick={() => leave.student && openStudentDetailsModal(leave.student)}
                                className={`hover:text-blue-600 hover:underline transition-colors ${leave.student ? 'cursor-pointer' : 'cursor-default'
                                  }`}
                                disabled={!leave.student}
                              >
                                {leave.student?.name || 'N/A'}
                              </button>
                            </div>
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                              <AcademicCapIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{leave.student?.rollNumber || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                              <PhoneIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{leave.parentPhone || 'N/A'}</span>
                            </div>

                            {leave.student?.course && (
                              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                                <span>Course: {leave.student.course?.name || leave.student.course}</span>
                              </div>
                            )}
                            {leave.student?.branch && (
                              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                                <span>Branch: {leave.student.branch?.name || leave.student.branch}</span>
                              </div>
                            )}
                          </div>

                          {/* Date/Time Information */}
                          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                            {leave.applicationType === 'Leave' ? (
                              <>
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>From: {displayInfo.start}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>To: {displayInfo.end}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>{displayInfo.duration}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>Date: {displayInfo.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>Time: {displayInfo.time}</span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Gate Pass Information for Leave */}
                          {leave.applicationType === 'Leave' && (
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mb-2">
                              <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Gate Pass: {displayInfo.gatePass}</span>
                            </div>
                          )}

                          <p className="text-xs sm:text-sm text-gray-700 mb-2 break-words">{leave.reason}</p>

                          {leave.rejectionReason && (
                            <p className="text-xs sm:text-sm text-red-600">
                              Rejection Reason: {leave.rejectionReason}
                            </p>
                          )}

                          {/* Action Buttons */}
                          {leave.status === 'Pending OTP Verification' && (
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                              <button
                                onClick={() => {
                                  setSelectedLeave(leave);
                                  setShowOTPModal(true);
                                }}
                                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                              >
                                Verify OTP
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedLeave(leave);
                                  setShowRejectModal(true);
                                }}
                                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleToggleOtp(leave._id)}
                                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                              >

                                {visibleOtps[leave._id] ? 'Hide OTP' : 'Show OTP'}
                              </button>
                            </div>
                          )}
                          {/* Display OTP if visible */}
                          {visibleOtps[leave._id] && (
                            <div className="mt-2 text-xs sm:text-sm text-blue-700 bg-blue-50 rounded p-2">
                              {otpLoading[leave._id]
                                ? 'Loading OTP...'
                                : otpValues[leave._id]
                                  ? <>OTP: <strong>{otpValues[leave._id]}</strong></>
                                  : 'No OTP available'}
                            </div>
                          )}


                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'bulk-outings' ? (
          /* Bulk Outing List */
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
            {bulkOutingsLoading ? (
              <div className="p-4 sm:p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : bulkOutings.length === 0 ? (
              <div className="p-4 sm:p-8 text-center text-gray-500">
                <p className="text-sm sm:text-base">No bulk outing requests found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {bulkOutings.map((outing) => (
                  <motion.div
                    key={outing._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 sm:p-4 lg:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                          <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(outing.status)}`}>
                            {getStatusIcon(outing.status)}
                            <span className="ml-1">{outing.status}</span>
                          </span>
                          <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border text-purple-600 bg-purple-50 border-purple-200">
                            Bulk Outing
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {formatDateIndia(outing.createdAt)}
                          </span>
                        </div>

                        {/* Warden Details */}
                        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 mb-3">
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                            <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Warden: {outing.createdBy?.username || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                            <span>Hostel: {outing.createdBy?.hostelType || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                            <span>Students: {outing.studentCount}</span>
                          </div>
                        </div>

                        {/* Outing Details */}
                        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Date: {formatDateIndia(outing.outingDate)}</span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-700 mb-2 break-words">{outing.reason}</p>

                        {/* Student Details Section */}
                        <div className="mt-3 sm:mt-4">
                          <button
                            onClick={() => toggleBulkOutingExpansion(outing._id)}
                            className="flex items-center gap-2 text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            <span>{expandedBulkOutings.has(outing._id) ? 'Hide' : 'Show'} Student Details</span>
                            <svg
                              className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${expandedBulkOutings.has(outing._id) ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {expandedBulkOutings.has(outing._id) && (
                            <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                              <h5 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Students in this outing:</h5>

                              {loadingStudentDetails.has(outing._id) ? (
                                <div className="flex justify-center py-3 sm:py-4">
                                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-purple-600"></div>
                                </div>
                              ) : outing.students && Array.isArray(outing.students) && outing.students.length > 0 ? (
                                (() => {
                                  const validStudents = outing.students.filter(student => student !== null && student !== undefined);
                                  return validStudents.length > 0 ? (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                      {validStudents.map((student, index) => (
                                        <div key={student._id || index} className="flex items-center justify-between p-2 bg-white rounded border">
                                          <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8">
                                              {student.studentPhoto ? (
                                                <img
                                                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover"
                                                  src={student.studentPhoto}
                                                  alt={student.name || 'Student'}
                                                />
                                              ) : (
                                                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                                  <span className="text-xs font-medium text-gray-700">
                                                    {(student.name || '?').charAt(0).toUpperCase()}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                            <div>
                                              <p className="text-xs sm:text-sm font-medium text-gray-900">{student.name || 'N/A'}</p>
                                              <p className="text-xs text-gray-500">{student.rollNumber || 'N/A'}</p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-xs text-gray-600">{(student.course?.name || student.course || 'N/A')} - {(student.branch?.name || student.branch || 'N/A')}</p>
                                            <p className="text-xs text-gray-500">Room {student.roomNumber || 'N/A'}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-3 sm:py-4 text-gray-500">
                                      <p className="text-xs sm:text-sm">No valid student data available</p>
                                    </div>
                                  );
                                })()
                              ) : (
                                <div className="text-center py-3 sm:py-4 text-gray-500">
                                  <p className="text-xs sm:text-sm">Student details not available</p>
                                  <p className="text-xs text-gray-400 mt-1">Click "Show Student Details" to load</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {outing.rejectionReason && (
                          <p className="text-xs sm:text-sm text-red-600">
                            Rejection Reason: {outing.rejectionReason}
                          </p>
                        )}

                        {/* Action Buttons */}
                        {outing.status === 'Pending' && (
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                            <button
                              onClick={() => handleApproveBulkOuting(outing._id)}
                              className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter rejection reason:');
                                if (reason) {
                                  handleRejectBulkOuting(outing._id, reason);
                                }
                              }}
                              className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Daily Request Abstract</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Leave & permission requests for dates from {formatDateIndia(approvalDateRange.fromDate)} to {formatDateIndia(approvalDateRange.toDate)} (IST).
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
                <label className="block text-xs font-medium text-gray-600">
                  Recent range
                  <select
                    value={approvalRangeDays}
                    onChange={event => {
                      const days = event.target.value;
                      setApprovalRangeDays(days);
                      if (days !== 'custom') {
                        setApprovalDateRange(getDefaultApprovalDateRange(Number(days)));
                      }
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="3">Last 3 days</option>
                    <option value="5">Last 5 days</option>
                    <option value="7">Last 7 days</option>
                    <option value="custom">Custom range</option>
                  </select>
                </label>
                <label className="block text-xs font-medium text-gray-600">
                  From <span className="text-gray-400">(DD/MM/YYYY)</span>
                  <input
                    type="date"
                    lang="en-IN"
                    value={approvalDateRange.fromDate}
                    onChange={event => {
                      setApprovalRangeDays('custom');
                      setApprovalDateRange(range => ({ ...range, fromDate: event.target.value }));
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <label className="block text-xs font-medium text-gray-600">
                  To <span className="text-gray-400">(DD/MM/YYYY)</span>
                  <input
                    type="date"
                    lang="en-IN"
                    value={approvalDateRange.toDate}
                    onChange={event => {
                      setApprovalRangeDays('custom');
                      setApprovalDateRange(range => ({ ...range, toDate: event.target.value }));
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {approvalSummaryLoading ? (
                <div className="py-12 text-center text-sm text-gray-500">Loading approval summary…</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                      <div className="text-xl font-bold text-blue-900">{approvalSummary.totals?.requests || 0}</div>
                      <div className="text-xs text-blue-700">Total Requests</div>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3 text-center">
                      <div className="text-xl font-bold text-amber-900">{approvalSummary.totals?.pending || 0}</div>
                      <div className="text-xs text-amber-700">Pending</div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3 text-center">
                      <div className="text-xl font-bold text-green-900">{approvalSummary.totals?.approved || 0}</div>
                      <div className="text-xs text-green-700">Approved</div>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3 text-center">
                      <div className="text-xl font-bold text-red-900">{approvalSummary.totals?.rejected || 0}</div>
                      <div className="text-xs text-red-700">Rejected</div>
                    </div>
                    <div className="rounded-lg bg-gray-100 p-3 text-center">
                      <div className="text-xl font-bold text-gray-900">{approvalSummary.totals?.processed || 0}</div>
                      <div className="text-xs text-gray-600">Total Processed</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Request Abstract & Type Breakdown</h3>
                      <p className="text-xs text-gray-500">
                        Dates are displayed horizontally in columns. Click on any request type row to expand its pending, approved, and rejected breakdown across dates.
                      </p>
                    </div>
                    {sortedDays.length > 0 && (
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={handleExpandAllTypes}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
                        >
                          Expand All Types
                        </button>
                        <button
                          type="button"
                          onClick={handleCollapseAllTypes}
                          className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border border-gray-200"
                        >
                          Collapse All Types
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
                    <table className="min-w-full divide-y divide-gray-200 text-left border-collapse">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="sticky left-0 z-20 bg-gray-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 border-r border-b border-gray-200 min-w-[200px] shadow-xs">
                            Request Type
                          </th>
                          {sortedDays.map((day) => {
                            const weekday = getWeekdayIndia(day.date);
                            return (
                              <th
                                key={day.date}
                                className="px-3 py-3 text-right font-semibold text-gray-700 bg-gray-50 border-r border-b border-gray-200 select-none min-w-[125px]"
                              >
                                <div className="flex flex-col items-end">
                                  <span className="text-xs font-bold text-gray-900">{formatDateDash(day.date)}</span>
                                  {weekday && <span className="text-[11px] text-gray-500 font-normal">({weekday})</span>}
                                </div>
                              </th>
                            );
                          })}
                          <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-800 bg-gray-100 border-l border-b border-gray-200 min-w-[110px]">
                            Overall Total
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 bg-white">
                        {[
                          { key: 'Leave', label: 'Leave', color: 'bg-blue-600' },
                          { key: 'Permission', label: 'Permission', color: 'bg-indigo-600' },
                          { key: 'Stay in Hostel', label: 'Stay in Hostel', color: 'bg-emerald-600' }
                        ].map((rt) => {
                          const isExpanded = expandedTypes.has(rt.key);
                          const overallItem = (approvalSummary.byType || []).find((t) => t.applicationType === rt.key) || {
                            requests: 0,
                            pending: 0,
                            approved: 0,
                            rejected: 0
                          };

                          return (
                            <tr
                              key={rt.key}
                              onClick={() => toggleType(rt.key)}
                              className={`cursor-pointer transition-colors duration-150 select-none ${
                                isExpanded ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-gray-50'
                              }`}
                            >
                              {/* Sticky Request Type Column - Clean, no status labels */}
                              <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-semibold text-gray-900 border-r border-b border-gray-200 shadow-xs">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center justify-center w-5 h-5 rounded transition-transform ${
                                      isExpanded ? 'rotate-90 text-blue-600 bg-blue-100' : 'text-gray-400 bg-gray-100'
                                    }`}
                                  >
                                    <ChevronRightIcon className="w-3.5 h-3.5" />
                                  </span>
                                  <span className={`w-2.5 h-2.5 rounded-full ${rt.color}`} />
                                  <span className="font-semibold text-gray-900">{rt.label}</span>
                                </div>
                              </td>

                              {/* Date Columns - Pending, Approved, Rejected displayed directly in this date column */}
                              {sortedDays.map((day) => {
                                const data = (day.byType || []).find((t) => t.applicationType === rt.key) || {
                                  requests: 0,
                                  pending: 0,
                                  approved: 0,
                                  rejected: 0
                                };

                                return (
                                  <td
                                    key={day.date}
                                    className={`px-3 py-3 border-r border-b border-gray-200 transition-colors ${
                                      isExpanded ? 'bg-blue-50/20' : ''
                                    }`}
                                  >
                                    {isExpanded ? (
                                      <div className="flex flex-col gap-1 py-0.5 text-xs">
                                        <div className="flex items-center justify-between gap-1.5 text-gray-700 font-semibold border-b border-gray-200 pb-0.5">
                                          <span>Total:</span>
                                          <span className="font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">{data.requests}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-1.5 text-amber-800">
                                          <span className="flex items-center gap-1 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            Pending:
                                          </span>
                                          <span className="font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">{data.pending}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-1.5 text-green-800">
                                          <span className="flex items-center gap-1 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Approved:
                                          </span>
                                          <span className="font-bold bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">{data.approved}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-1.5 text-red-800">
                                          <span className="flex items-center gap-1 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            Rejected:
                                          </span>
                                          <span className="font-bold bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">{data.rejected}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-right text-sm font-semibold text-gray-800">
                                        {data.requests}
                                      </div>
                                    )}
                                  </td>
                                );
                              })}

                              {/* Overall Total Column */}
                              <td
                                className={`px-4 py-3 text-right text-sm font-bold text-gray-900 bg-gray-50/70 border-l border-b border-gray-200 ${
                                  isExpanded ? 'bg-blue-50/30' : ''
                                }`}
                              >
                                {isExpanded ? (
                                  <div className="flex flex-col gap-1 py-0.5 text-xs">
                                    <div className="flex items-center justify-between gap-1.5 text-gray-700 font-semibold border-b border-gray-200 pb-0.5">
                                      <span>Total:</span>
                                      <span className="font-bold text-gray-900 bg-gray-200 px-1.5 py-0.5 rounded">{overallItem.requests}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-1.5 text-amber-800">
                                      <span className="font-medium">Pending:</span>
                                      <span className="font-bold bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">{overallItem.pending}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-1.5 text-green-800">
                                      <span className="font-medium">Approved:</span>
                                      <span className="font-bold bg-green-100 border border-green-300 px-1.5 py-0.5 rounded">{overallItem.approved}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-1.5 text-red-800">
                                      <span className="font-medium">Rejected:</span>
                                      <span className="font-bold bg-red-100 border border-red-300 px-1.5 py-0.5 rounded">{overallItem.rejected}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div>{overallItem.requests}</div>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                        {!sortedDays.length && (
                          <tr>
                            <td colSpan={2} className="px-4 py-8 text-center text-sm text-gray-500">
                              No requests in this date range.
                            </td>
                          </tr>
                        )}
                      </tbody>

                      {sortedDays.length > 0 && (
                        <tfoot className="border-t-2 border-gray-300">
                          {/* Total Requests Main Row */}
                          <tr
                            onClick={() => toggleType('total')}
                            className="bg-gray-50 hover:bg-blue-50/30 cursor-pointer font-bold select-none transition-colors"
                          >
                            <td className="sticky left-0 z-10 bg-gray-100 px-4 py-3 text-sm font-bold text-gray-900 border-r border-gray-200 shadow-xs">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center justify-center w-5 h-5 rounded transition-transform ${
                                    expandedTypes.has('total') ? 'rotate-90 text-blue-600 bg-blue-100' : 'text-gray-400 bg-gray-100'
                                  }`}
                                >
                                  <ChevronRightIcon className="w-3.5 h-3.5" />
                                </span>
                                <span>Total Requests</span>
                              </div>
                            </td>

                            {/* Date columns breakdown for Total Requests */}
                            {sortedDays.map((day) => (
                              <td
                                key={day.date}
                                className={`px-3 py-3 border-r border-gray-200 transition-colors ${
                                  expandedTypes.has('total') ? 'bg-blue-100/30' : 'bg-blue-50/50'
                                }`}
                              >
                                {expandedTypes.has('total') ? (
                                  <div className="flex flex-col gap-1 py-0.5 text-xs">
                                    <div className="flex items-center justify-between gap-1.5 text-blue-900 font-bold border-b border-blue-200 pb-0.5">
                                      <span>Total:</span>
                                      <span className="font-bold text-blue-900 bg-blue-200 px-1.5 py-0.5 rounded">{day.requests}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-1.5 text-amber-800">
                                      <span className="flex items-center gap-1 font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        Pending:
                                      </span>
                                      <span className="font-bold bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">{day.pending}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-1.5 text-green-800">
                                      <span className="flex items-center gap-1 font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Approved:
                                      </span>
                                      <span className="font-bold bg-green-100 border border-green-300 px-1.5 py-0.5 rounded">{day.approved}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-1.5 text-red-800">
                                      <span className="flex items-center gap-1 font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        Rejected:
                                      </span>
                                      <span className="font-bold bg-red-100 border border-red-300 px-1.5 py-0.5 rounded">{day.rejected}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-right text-sm font-bold text-blue-900">
                                    {day.requests}
                                  </div>
                                )}
                              </td>
                            ))}

                            {/* Overall Total for Total Requests */}
                            <td
                              className={`px-4 py-3 text-right text-sm font-extrabold text-blue-950 bg-blue-100/80 border-l border-gray-200 ${
                                expandedTypes.has('total') ? 'bg-blue-200/50' : ''
                              }`}
                            >
                              {expandedTypes.has('total') ? (
                                <div className="flex flex-col gap-1 py-0.5 text-xs">
                                  <div className="flex items-center justify-between gap-1.5 text-blue-950 font-bold border-b border-blue-300 pb-0.5">
                                    <span>Total:</span>
                                    <span className="font-bold bg-blue-200 px-1.5 py-0.5 rounded">{approvalSummary.totals?.requests || 0}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-1.5 text-amber-900">
                                    <span className="font-bold">Pending:</span>
                                    <span className="font-bold bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">{approvalSummary.totals?.pending || 0}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-1.5 text-green-900">
                                    <span className="font-bold">Approved:</span>
                                    <span className="font-bold bg-green-100 border border-green-300 px-1.5 py-0.5 rounded">{approvalSummary.totals?.approved || 0}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-1.5 text-red-900">
                                    <span className="font-bold">Rejected:</span>
                                    <span className="font-bold bg-red-100 border border-red-300 px-1.5 py-0.5 rounded">{approvalSummary.totals?.rejected || 0}</span>
                                  </div>
                                </div>
                              ) : (
                                <div>{approvalSummary.totals?.requests || 0}</div>
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                  {!approvalSummary.totals?.requests && !approvalSummary.totals?.processed && (
                    <p className="mt-4 text-center text-sm text-gray-500">No requests were submitted or processed in this date range.</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 w-full max-w-md"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Verify OTP</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Enter the OTP sent to the parent's phone number: {selectedLeave.parentPhone}
            </p>
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> The OTP (4 digits) was sent in both Telugu and English to the parent's phone.
              </p>
            </div>
            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[idx] || ''}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (!val) return;
                    const newOtp = otp.split('');
                    newOtp[idx] = val;
                    setOtp(newOtp.join('').slice(0, 4));
                    // Auto-focus next
                    const next = document.getElementById(`otp-input-${idx + 1}`);
                    if (next && val) next.focus();
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Backspace') {
                      if (otp[idx]) {
                        // Clear current digit only
                        const newOtp = otp.split('');
                        newOtp[idx] = '';
                        setOtp(newOtp.join(''));
                        e.preventDefault();
                      } else if (idx > 0) {
                        // Move focus to previous box
                        const prev = document.getElementById(`otp-input-${idx - 1}`);
                        if (prev) prev.focus();
                      }
                    }
                  }}
                  id={`otp-input-${idx}`}
                  name={`otp-${idx}`}
                  autoComplete="one-time-code"
                  className="w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-2xl text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ letterSpacing: '2px' }}
                  autoFocus={idx === 0}
                />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowOTPModal(false);
                  setOtp('');
                }}
                className="px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOTP}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                disabled={otp.length !== 4 || !/^[0-9]{4}$/.test(otp)}
              >
                Verify & Approve
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 w-full max-w-md"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Reject {selectedLeave.applicationType} Request</h2>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection"
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3 sm:mb-4 text-xs sm:text-sm"
              rows="4"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm"
              >
                Reject Request
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Student Details Modal */}
      {studentDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-3 sm:p-4 lg:p-6 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Student Details</h3>
              <button
                onClick={() => setStudentDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 lg:p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column - Photo and Basic Info */}
                <div className="lg:col-span-1">
                  {/* Student Photo */}
                  <div className="flex justify-center mb-4 sm:mb-6">
                    {selectedStudent.studentPhoto ? (
                      <img
                        src={selectedStudent.studentPhoto}
                        alt={selectedStudent.name}
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl sm:text-4xl font-bold shadow-lg">
                        {selectedStudent.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Basic Information</h4>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Name:</span>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm">{selectedStudent.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Roll Number:</span>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm">{selectedStudent.rollNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Hostel ID:</span>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm">{selectedStudent.hostelId || 'Not assigned'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Gender:</span>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm">{selectedStudent.gender}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Columns - Academic, Contact, and Hostel Info */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Academic Information */}
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                      <h4 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Academic Information
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-blue-700">Course:</span>
                          <span className="font-medium text-blue-900 text-xs sm:text-sm">{selectedStudent.course?.name || selectedStudent.course}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-blue-700">Branch:</span>
                          <span className="font-medium text-blue-900 text-xs sm:text-sm">{selectedStudent.branch?.name || selectedStudent.branch}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-blue-700">Year:</span>
                          <span className="font-medium text-blue-900 text-xs sm:text-sm">Year {selectedStudent.year}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-blue-700">Category:</span>
                          <span className="font-medium text-blue-900 text-xs sm:text-sm">{selectedStudent.category === 'A+' ? 'A+ (AC)' : selectedStudent.category === 'B+' ? 'B+ (AC)' : selectedStudent.category}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-blue-700">Batch:</span>
                          <span className="font-medium text-blue-900 text-xs sm:text-sm">{selectedStudent.batch}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-blue-700">Academic Year:</span>
                          <span className="font-medium text-blue-900 text-xs sm:text-sm">{selectedStudent.academicYear}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                      <h4 className="text-base sm:text-lg font-semibold text-green-800 mb-3 sm:mb-4 flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Contact Information
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-green-700">Student Phone:</span>
                          <span className="font-medium text-green-900 text-xs sm:text-sm">{selectedStudent.studentPhone}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-green-700">Parent Phone:</span>
                          <span className="font-medium text-green-900 text-xs sm:text-sm">{selectedStudent.parentPhone}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-green-700">Email:</span>
                          <span className="font-medium text-green-900 break-all text-xs sm:text-sm">{selectedStudent.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Hostel Information */}
                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                      <h4 className="text-base sm:text-lg font-semibold text-purple-800 mb-3 sm:mb-4 flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Hostel Information
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-purple-700">Room Number:</span>
                          <span className="font-medium text-purple-900 text-xs sm:text-sm">Room {selectedStudent.roomNumber}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-purple-700">Hostel Status:</span>
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${['Active','Extended'].includes(selectedStudent.applicationStatus)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {selectedStudent.applicationStatus || selectedStudent.hostelStatus}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-purple-700">Graduation Status:</span>
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedStudent.graduationStatus === 'Graduated'
                            ? 'bg-blue-100 text-blue-800'
                            : selectedStudent.graduationStatus === 'Dropped'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {selectedStudent.graduationStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 p-3 sm:p-4 lg:p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setStudentDetailsModal(false)}
                className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center text-xs sm:text-sm"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;