import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import {
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  UserIcon,
  KeyIcon,
  CheckIcon,
  ShieldCheckIcon,
  HomeIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  PlusIcon,
  Squares2X2Icon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';

const getPermissionIcon = (permissionId) => {
  const icons = {
    'dashboard_home': (
      <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    ),
    'room_management': (
      <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    'student_management': (
      <svg className="w-5 h-5 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    'maintenance_ticket_management': (
      <svg className="w-5 h-5 text-orange-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    'leave_management': (
      <svg className="w-5 h-5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    'announcement_management': (
      <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    'poll_management': (
      <svg className="w-5 h-5 text-pink-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    'menu_management': (
      <svg className="w-5 h-5 text-yellow-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
      </svg>
    ),
    'course_management': (
      <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    'attendance_management': (
      <svg className="w-5 h-5 text-cyan-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    'found_lost_management': (
      <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
      </svg>
    ),
    'fee_management': (
      <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    'concession_management': (
      <svg className="w-5 h-5 text-lime-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
      </svg>
    ),
    'noc_management': (
      <svg className="w-5 h-5 text-sky-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    'security_management': (
      <svg className="w-5 h-5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    'staff_guests_management': (
      <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    'feature_controls': (
      <svg className="w-5 h-5 text-violet-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  };
  return icons[permissionId] || (
    <svg className="w-5 h-5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

const PERMISSIONS = [
  { id: 'dashboard_home', label: 'Dashboard Home' },
  { id: 'room_management', label: 'Room Management' },
  { id: 'student_management', label: 'Student Management' },
  { id: 'maintenance_ticket_management', label: 'Complaints Management' },
  { id: 'leave_management', label: 'Leave Management' },
  { id: 'announcement_management', label: 'Announcements' },
  { id: 'poll_management', label: 'Poll Management' },
  { id: 'menu_management', label: 'Menu Management' },
  { id: 'course_management', label: 'Course Management' },
  { id: 'attendance_management', label: 'Attendance Management' },
  { id: 'found_lost_management', label: 'Found & Lost Management' },
  { id: 'fee_management', label: 'Fee Management' },
  { id: 'concession_management', label: 'Concession Management' },
  { id: 'noc_management', label: 'NOC Management' },
  { id: 'security_management', label: 'Security Management' },
  { id: 'staff_guests_management', label: 'Staff/Guests Management' },
  { id: 'feature_controls', label: 'Feature Controls' }
];

const STAFF_GUEST_ACCESS_TABS = [
  { id: 'management', label: 'Management' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'settings', label: 'Settings' }
];

const StaffGuestsAccessSelector = ({ accessLevels, onAccessLevelChange }) => (
  <div className="ml-4 sm:ml-6 mt-2 p-2 sm:p-3 bg-blue-50 rounded-lg space-y-2">
    <div className="text-xs sm:text-sm font-medium text-blue-700">Staff/Guests Tab Access</div>
    {STAFF_GUEST_ACCESS_TABS.map(tab => {
      const accessKey = `staff_guests_management:${tab.id}`;
      const accessLevel = accessLevels[accessKey] || accessLevels.staff_guests_management || 'view';
      return (
        <div key={tab.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-blue-100 pt-2 first:border-0 first:pt-0">
          <span className="text-xs font-medium text-blue-800">{tab.label}</span>
          <div className="flex gap-3">
            {[
              { value: 'view', label: 'Read' },
              { value: 'full', label: 'Write' }
            ].map(option => (
              <label key={option.value} className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name={`access_${accessKey}`}
                  value={option.value}
                  checked={accessLevel === option.value}
                  onChange={() => onAccessLevelChange(accessKey, option.value)}
                  className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-xs text-blue-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

// Course assignment permissions that need course selection
const COURSE_ASSIGNMENT_PERMISSIONS = ['leave_management', 'student_management', 'attendance_management'];

const ToggleSwitch = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <span className="text-gray-800 font-medium">{label}</span>
    <span className="relative inline-block w-12 h-6 align-middle">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <span
        className={`block w-12 h-6 rounded-full transition-colors duration-300
          ${checked ? 'bg-blue-600' : 'bg-gray-300'}
        `}
      ></span>
      <span
        className={`absolute left-0 top-0 w-6 h-6 bg-white border border-gray-300 rounded-full shadow transform transition-transform duration-300
          ${checked ? 'translate-x-6 border-blue-600' : ''}
        `}
      ></span>
    </span>
  </label>
);

const AccessLevelSelector = ({ permissionId, permissionLabel, accessLevel, onAccessLevelChange, disabled }) => {
  console.log('🔧 AccessLevelSelector props:', { permissionId, permissionLabel, accessLevel, disabled });

  return (
    <div className="ml-4 sm:ml-6 mt-2 p-2 sm:p-3 bg-blue-50 rounded-lg">
      <label className="block text-xs sm:text-sm font-medium text-blue-700 mb-2">
        Access Level for {permissionLabel}
      </label>
      <div className="flex gap-3">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`access_${permissionId}`}
            value="view"
            checked={accessLevel === 'view'}
            onChange={() => {
              console.log('🔧 Radio change - View:', permissionId);
              onAccessLevelChange(permissionId, 'view');
            }}
            disabled={disabled}
            className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-xs text-blue-700">View Access</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`access_${permissionId}`}
            value="full"
            checked={accessLevel === 'full'}
            onChange={() => {
              console.log('🔧 Radio change - Full:', permissionId);
              onAccessLevelChange(permissionId, 'full');
            }}
            disabled={disabled}
            className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-xs text-blue-700">Full Access</span>
        </label>
      </div>
      <div className="mt-2 text-xs text-blue-600">
        {accessLevel === 'view' ? (
          <span>• Can view data but cannot edit, add, or delete</span>
        ) : (
          <span>• Can view, edit, add, and delete data</span>
        )}
      </div>
    </div>
  );
};

const AdminManagement = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('sub-admins');
  const [subAdmins, setSubAdmins] = useState([]);
  const [wardens, setWardens] = useState([]);
  const [principals, setPrincipals] = useState([]);
  const [customRoles, setCustomRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [passwordResetData, setPasswordResetData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    permissions: [],
    permissionAccessLevels: {}, // New field for access levels
    hostelType: '',
    assignedHostelId: '',
    course: '',
    branch: '', // Branch for principal (optional)
    leaveManagementCourses: [], // New field for course selection
    passwordDeliveryMethod: '', // New field for password delivery
    email: '', // New field for email
    phoneNumber: '', // New field for phone number
    customRoleId: '', // New field for custom role assignment
    principalEmail: '', // Email for principal (for leave notifications)
    principalCourses: [], // New field for principal multi-course selection
    assignedCollegeIds: [], // New field for principal colleges (multi-select)
    assignedCollegeScopes: [],
    assignedLevels: [], // New field for principal levels (Diploma, UG, PG)
    employeeId: '',
    hrmsUserId: '',
    hrmsEmployeeRef: '',
    hrmsLinkType: '',
    name: ''
  });
  const [hrmsSearchQuery, setHrmsSearchQuery] = useState('');
  const [hrmsSearchResults, setHrmsSearchResults] = useState([]);
  const [hrmsSearching, setHrmsSearching] = useState(false);
  const [selectedHrmsEmployee, setSelectedHrmsEmployee] = useState(null);
  const [roleType, setRoleType] = useState('sub_admin'); // Track selected role type
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    permissionAccessLevels: {},
    courseAssignment: 'all',
    assignedCourses: [],
    assignedBranches: [],
    assignedCollegeIds: [],
    assignedCollegeScopes: []
  });
  const [roleModalStep, setRoleModalStep] = useState(1);
  const [roleCollegeSearchQuery, setRoleCollegeSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [colleges, setColleges] = useState([]); // New state for colleges
  const [hostels, setHostels] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);

  // State for College Builder UI (Principal)
  const [selectedCollegeToAdd, setSelectedCollegeToAdd] = useState('');
  const [selectedLevelsToAdd, setSelectedLevelsToAdd] = useState([]);
  const [userCollegeSearchQuery, setUserCollegeSearchQuery] = useState('');
  const [expandedCollegeScopeId, setExpandedCollegeScopeId] = useState(null);
  const [userModalStep, setUserModalStep] = useState(1); // 1 = Identity, Colleges, Courses & Branches; 2 = Permissions & Role

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!showAddModal && !showEditModal) return;

    if (!hrmsSearchQuery || hrmsSearchQuery.trim().length < 2) {
      setHrmsSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setHrmsSearching(true);
      try {
        const response = await api.get('/api/admin-management/hrms-employees/search', {
          params: { q: hrmsSearchQuery.trim() }
        });
        if (response.data.success) {
          setHrmsSearchResults(response.data.data || []);
        }
      } catch (error) {
        console.error('HRMS search error:', error);
        toast.error('Failed to search HRMS employees');
      } finally {
        setHrmsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [hrmsSearchQuery, showAddModal, showEditModal]);

  const handleSelectHrmsEmployee = (employee) => {
    setSelectedHrmsEmployee(employee);
    setFormData(prev => ({
      ...prev,
      employeeId: employee.employeeId || '',
      hrmsUserId: employee.hrmsUserId || '',
      hrmsEmployeeRef: employee.hrmsEmployeeRef || '',
      hrmsLinkType: employee.linkType || '',
      name: employee.name || '',
      email: prev.email || employee.email || '',
      phoneNumber: prev.phoneNumber || employee.phone || '',
      principalEmail: prev.principalEmail || employee.email || '',
      username: employee.employeeId || prev.username
    }));
    setHrmsSearchQuery('');
    setHrmsSearchResults([]);
    const linkLabel = employee.linkType === 'user' ? 'User Account' : 'Employee Record';
    toast.success(`Linked ${linkLabel}: ${employee.name || employee.employeeId}`);
  };

  const clearHrmsSelection = () => {
    setSelectedHrmsEmployee(null);
    setFormData(prev => ({
      ...prev,
      employeeId: '',
      hrmsUserId: '',
      hrmsEmployeeRef: '',
      hrmsLinkType: '',
      name: ''
    }));
  };

  const fetchData = async () => {
    try {
      const [subAdminsRes, wardensRes, principalsRes, customRolesRes] = await Promise.all([
        api.get('/api/admin-management/sub-admins'),
        api.get('/api/admin-management/wardens'),
        api.get('/api/admin-management/principals'),
        api.get('/api/admin-management/custom-roles')
      ]);

      console.log('🔍 Admin data responses:', {
        subAdmins: subAdminsRes.data,
        wardens: wardensRes.data,
        principals: principalsRes.data,
        customRoles: customRolesRes.data
      });

      if (subAdminsRes.data.success) {
        setSubAdmins(subAdminsRes.data.data || []);
      }
      if (wardensRes.data.success) {
        setWardens(wardensRes.data.data || []);
      }
      if (principalsRes.data.success) {
        setPrincipals(principalsRes.data.data || []);
      }
      if (customRolesRes.data.success) {
        setCustomRoles(customRolesRes.data.data || []);
      }

      // Fetch colleges
      const collegesRes = await api.get('/api/course-management/colleges');
      if (collegesRes.data.success) {
        setColleges(collegesRes.data.data);
      }

      // Fetch hostels for warden assignment
      const hostelsRes = await api.get('/api/hostels');
      if (hostelsRes.data.success) {
        setHostels((hostelsRes.data.data || []).filter(h => h.isActive !== false));
      }

      // Fetch courses
      const coursesRes = await api.get('/api/course-management/courses');
      if (coursesRes.data.success) {
        setCourses(coursesRes.data.data);
      }

      // Fetch branches
      const branchesRes = await api.get('/api/course-management/branches');
      if (branchesRes.data.success) {
        setBranches(branchesRes.data.data || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };



  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => {
        const newPermissions = checked
          ? [...prev.permissions, value]
          : prev.permissions.filter(p => p !== value);

        // If leave_management is being unchecked, clear course selections
        if (value === 'leave_management' && !checked) {
          return {
            ...prev,
            permissions: newPermissions,
            leaveManagementCourses: []
          };
        }

        // Set default access level when permission is added
        let newAccessLevels = { ...prev.permissionAccessLevels };
        if (checked) {
          // Set default access level to 'view' for new permissions
          newAccessLevels[value] = 'view';
        } else {
          // Remove access level when permission is unchecked
          delete newAccessLevels[value];
          if (value === 'staff_guests_management') {
            Object.keys(newAccessLevels)
              .filter(key => key.startsWith('staff_guests_management:'))
              .forEach(key => delete newAccessLevels[key]);
          }
        }

        return {
          ...prev,
          permissions: newPermissions,
          permissionAccessLevels: newAccessLevels
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle course selection for leave management or principal courses
  const handleCourseSelection = (courseName, checked, fieldDataName = 'leaveManagementCourses') => {
    setFormData(prev => ({
      ...prev,
      [fieldDataName]: checked
        ? [...prev[fieldDataName], courseName]
        : prev[fieldDataName].filter(name => name !== courseName)
    }));
  };

  const handlePrincipalCollegeSelection = (collegeId, checked) => {
    setFormData(prev => ({
      ...prev,
      assignedCollegeScopes: checked
        ? [...prev.assignedCollegeScopes, { collegeId: Number(collegeId), levels: [] }]
        : prev.assignedCollegeScopes.filter(scope => Number(scope.collegeId) !== Number(collegeId)),
      assignedCollegeIds: checked
        ? [...prev.assignedCollegeIds, Number(collegeId)]
        : prev.assignedCollegeIds.filter(id => Number(id) !== Number(collegeId)),
      assignedLevels: [...new Set((checked
        ? prev.assignedCollegeScopes
        : prev.assignedCollegeScopes.filter(scope => Number(scope.collegeId) !== Number(collegeId)))
        .flatMap(scope => scope.levels))]
    }));
  };

  const handlePrincipalCollegeLevelSelection = (collegeId, level, checked) => {
    setFormData(prev => {
      const assignedCollegeScopes = prev.assignedCollegeScopes.map(scope => {
        if (Number(scope.collegeId) !== Number(collegeId)) return scope;
        return {
          ...scope,
          levels: checked
            ? [...new Set([...scope.levels, level])]
            : scope.levels.filter(item => item !== level)
        };
      });
      return {
        ...prev,
        assignedCollegeScopes,
        assignedLevels: [...new Set(assignedCollegeScopes.flatMap(scope => scope.levels))]
      };
    });
  };

  // Handle role form changes
  const handleRoleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setRoleFormData(prev => {
        const newPermissions = checked
          ? [...prev.permissions, value]
          : prev.permissions.filter(p => p !== value);

        // Set default access level when permission is added
        let newAccessLevels = { ...prev.permissionAccessLevels };
        if (checked) {
          newAccessLevels[value] = 'view';
        } else {
          delete newAccessLevels[value];
          if (value === 'staff_guests_management') {
            Object.keys(newAccessLevels)
              .filter(key => key.startsWith('staff_guests_management:'))
              .forEach(key => delete newAccessLevels[key]);
          }
        }

        return {
          ...prev,
          permissions: newPermissions,
          permissionAccessLevels: newAccessLevels
        };
      });
    } else {
      setRoleFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle role access level changes
  const handleRoleAccessLevelChange = (permission, accessLevel) => {
    setRoleFormData(prev => ({
      ...prev,
      permissionAccessLevels: {
        ...prev.permissionAccessLevels,
        [permission]: accessLevel
      }
    }));
  };

  // Handle role course assignment - store course names
  const handleRoleCourseSelection = (courseName, checked) => {
    console.log('🔧 Role course selection:', { courseName, checked });
    setRoleFormData(prev => {
      const newAssignedCourses = checked
        ? [...prev.assignedCourses, courseName]
        : prev.assignedCourses.filter(name => name !== courseName);

      console.log('🔧 Updated assigned courses:', newAssignedCourses);

      return {
        ...prev,
        assignedCourses: newAssignedCourses
      };
    });
  };

  // Scope handlers for Custom Roles
  const handleRoleCollegeToggle = (collegeId) => {
    const cId = Number(collegeId);
    setRoleFormData(prev => {
      const isSelected = prev.assignedCollegeIds?.includes(cId);
      const newIds = isSelected
        ? prev.assignedCollegeIds.filter(id => id !== cId)
        : [...(prev.assignedCollegeIds || []), cId];

      const newScopes = isSelected
        ? (prev.assignedCollegeScopes || []).filter(s => Number(s.collegeId) !== cId)
        : [...(prev.assignedCollegeScopes || []), { collegeId: cId, levels: [], courses: [], branches: [] }];

      return {
        ...prev,
        assignedCollegeIds: newIds,
        assignedCollegeScopes: newScopes
      };
    });
  };

  const handleRoleSelectAllColleges = () => {
    const allIds = colleges.map(c => Number(c.id));
    setRoleFormData(prev => ({
      ...prev,
      assignedCollegeIds: allIds,
      assignedCollegeScopes: allIds.map(cId => ({ collegeId: cId, levels: [], courses: [], branches: [] }))
    }));
  };

  const handleRoleClearAllColleges = () => {
    setRoleFormData(prev => ({
      ...prev,
      assignedCollegeIds: [],
      assignedCollegeScopes: []
    }));
  };

  const handleRoleToggleCollegeCourse = (collegeId, courseName, allCollegeCourses = []) => {
    const cId = Number(collegeId);
    setRoleFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const scopeIndex = currentScopes.findIndex(s => Number(s.collegeId) === cId);
      const scope = scopeIndex >= 0 ? { ...currentScopes[scopeIndex] } : { collegeId: cId, levels: [], courses: [], branches: [] };
      
      const isNoneCourses = scope.courses && scope.courses.length === 1 && scope.courses[0] === '__NONE__';
      const isAllCurrently = !scope.courses || scope.courses.length === 0;

      let updatedCourses;
      if (isAllCurrently || isNoneCourses) {
        updatedCourses = [courseName];
      } else if (scope.courses.includes(courseName)) {
        updatedCourses = scope.courses.filter(c => c !== courseName);
      } else {
        updatedCourses = [...scope.courses, courseName];
      }

      let updatedBranches = (scope.branches || []).filter(b => b !== '__NONE__');
      if (updatedBranches.length > 0 && updatedCourses.length > 0) {
        const validBranchNames = branches
          .filter(b => {
            const bColId = Number(b.college?.id);
            const bCourse = b.courseName || b.course?.name || b.course;
            return (bColId === cId || !bColId) && updatedCourses.includes(bCourse);
          })
          .map(b => b.name);
        updatedBranches = updatedBranches.filter(bn => validBranchNames.includes(bn));
      }

      const updatedScope = {
        ...scope,
        courses: updatedCourses.length === 0 ? ['__NONE__'] : updatedCourses,
        branches: updatedBranches
      };

      const newScopes = scopeIndex >= 0
        ? currentScopes.map((s, idx) => idx === scopeIndex ? updatedScope : s)
        : [...currentScopes, updatedScope];

      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleRoleSelectAllCollegeCourses = (collegeId, allCourseNames) => {
    const cId = Number(collegeId);
    setRoleFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const scopeIndex = currentScopes.findIndex(s => Number(s.collegeId) === cId);
      const scope = scopeIndex >= 0 ? { ...currentScopes[scopeIndex] } : { collegeId: cId, levels: [], courses: [], branches: [] };

      const updatedScope = { ...scope, courses: allCourseNames };
      const newScopes = scopeIndex >= 0
        ? currentScopes.map((s, idx) => idx === scopeIndex ? updatedScope : s)
        : [...currentScopes, updatedScope];
      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleRoleClearCollegeCourses = (collegeId) => {
    const cId = Number(collegeId);
    setRoleFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const scopeIndex = currentScopes.findIndex(s => Number(s.collegeId) === cId);
      const scope = scopeIndex >= 0 ? { ...currentScopes[scopeIndex] } : { collegeId: cId, levels: [], courses: [], branches: [] };

      const updatedScope = { ...scope, courses: ['__NONE__'], branches: ['__NONE__'] };
      const newScopes = scopeIndex >= 0
        ? currentScopes.map((s, idx) => idx === scopeIndex ? updatedScope : s)
        : [...currentScopes, updatedScope];
      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleRoleToggleCollegeBranch = (collegeId, branchName, allCollegeBranches = []) => {
    const cId = Number(collegeId);
    setRoleFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const scopeIndex = currentScopes.findIndex(s => Number(s.collegeId) === cId);
      const scope = scopeIndex >= 0 ? { ...currentScopes[scopeIndex] } : { collegeId: cId, levels: [], courses: [], branches: [] };

      const isNoneBranches = scope.branches && scope.branches.length === 1 && scope.branches[0] === '__NONE__';
      const isAllCurrently = !scope.branches || scope.branches.length === 0;

      let updatedBranches;
      if (isAllCurrently || isNoneBranches) {
        updatedBranches = [branchName];
      } else if (scope.branches.includes(branchName)) {
        updatedBranches = scope.branches.filter(b => b !== branchName);
      } else {
        updatedBranches = [...scope.branches, branchName];
      }

      const updatedScope = {
        ...scope,
        branches: updatedBranches.length === 0 ? ['__NONE__'] : updatedBranches
      };

      const newScopes = scopeIndex >= 0
        ? currentScopes.map((s, idx) => idx === scopeIndex ? updatedScope : s)
        : [...currentScopes, updatedScope];

      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleRoleSelectAllCollegeBranches = (collegeId) => {
    const cId = Number(collegeId);
    setRoleFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const scopeIndex = currentScopes.findIndex(s => Number(s.collegeId) === cId);
      const scope = scopeIndex >= 0 ? { ...currentScopes[scopeIndex] } : { collegeId: cId, levels: [], courses: [], branches: [] };

      const updatedScope = { ...scope, branches: [] };
      const newScopes = scopeIndex >= 0
        ? currentScopes.map((s, idx) => idx === scopeIndex ? updatedScope : s)
        : [...currentScopes, updatedScope];
      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleRoleClearCollegeBranches = (collegeId) => {
    const cId = Number(collegeId);
    setRoleFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const scopeIndex = currentScopes.findIndex(s => Number(s.collegeId) === cId);
      const scope = scopeIndex >= 0 ? { ...currentScopes[scopeIndex] } : { collegeId: cId, levels: [], courses: [], branches: [] };

      const updatedScope = { ...scope, branches: ['__NONE__'] };
      const newScopes = scopeIndex >= 0
        ? currentScopes.map((s, idx) => idx === scopeIndex ? updatedScope : s)
        : [...currentScopes, updatedScope];
      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleProceedToRolePermissions = () => {
    if (!roleFormData.name || !roleFormData.name.trim()) {
      toast.error('Please enter a role name');
      return;
    }
    if (!roleFormData.assignedCollegeIds || roleFormData.assignedCollegeIds.length === 0) {
      toast.error('Please select at least one college in Card 1');
      return;
    }
    setRoleModalStep(2);
  };

  // Handle access level changes for permissions
  const handleAccessLevelChange = (permission, accessLevel) => {
    console.log('🔧 Access level change:', { permission, accessLevel });
    setFormData(prev => {
      const newData = {
        ...prev,
        permissionAccessLevels: {
          ...prev.permissionAccessLevels,
          [permission]: accessLevel
        }
      };
      console.log('🔧 Updated form data:', newData.permissionAccessLevels);
      return newData;
    });
  };

  // College & permission helpers for Users
  const handleUserCollegeToggle = (collegeId) => {
    const cId = Number(collegeId);
    setFormData(prev => {
      const isSelected = prev.assignedCollegeIds?.includes(cId);
      const newIds = isSelected
        ? prev.assignedCollegeIds.filter(id => id !== cId)
        : [...(prev.assignedCollegeIds || []), cId];

      const newScopes = isSelected
        ? (prev.assignedCollegeScopes || []).filter(s => Number(s.collegeId) !== cId)
        : [...(prev.assignedCollegeScopes || []), { collegeId: cId, levels: [], courses: [], branches: [] }];

      const allowedCourseNames = courses
        .filter(c => {
          const cColId = c.college?.id != null ? Number(c.college.id) : (c.college != null ? Number(c.college) : null);
          return cColId && newIds.includes(cColId);
        })
        .map(c => c.name);

      const newLeaveCourses = (prev.leaveManagementCourses || []).filter(cName =>
        allowedCourseNames.length > 0 ? allowedCourseNames.includes(cName) : true
      );

      return {
        ...prev,
        assignedCollegeIds: newIds,
        assignedCollegeScopes: newScopes,
        leaveManagementCourses: newLeaveCourses
      };
    });
  };

  const handleSelectAllColleges = () => {
    const allIds = colleges.map(c => Number(c.id));
    setFormData(prev => ({
      ...prev,
      assignedCollegeIds: allIds,
      assignedCollegeScopes: allIds.map(cId => ({ collegeId: cId, levels: [], courses: [], branches: [] }))
    }));
  };

  const handleClearAllColleges = () => {
    setFormData(prev => ({
      ...prev,
      assignedCollegeIds: [],
      assignedCollegeScopes: [],
      leaveManagementCourses: []
    }));
  };

  // College Academic Scope: Course & Branch helpers
  const handleCustomCollegeCoursesInit = (collegeId, allCourseNames) => {
    const cId = Number(collegeId);
    setFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const scopeIndex = currentScopes.findIndex(s => Number(s.collegeId) === cId);
      const scope = scopeIndex >= 0 ? { ...currentScopes[scopeIndex] } : { collegeId: cId, levels: [], courses: [], branches: [] };
      const updatedScope = { ...scope, courses: allCourseNames };
      const newScopes = scopeIndex >= 0
        ? currentScopes.map((s, idx) => idx === scopeIndex ? updatedScope : s)
        : [...currentScopes, updatedScope];
      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleToggleCollegeCourse = (collegeId, courseName, allCollegeCourses = []) => {
    const cId = Number(collegeId);
    setFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const scopeIndex = currentScopes.findIndex(s => Number(s.collegeId) === cId);
      const scope = scopeIndex >= 0 ? { ...currentScopes[scopeIndex] } : { collegeId: cId, levels: [], courses: [], branches: [] };
      
      const isNoneCourses = scope.courses && scope.courses.length === 1 && scope.courses[0] === '__NONE__';
      const isAllCurrently = !scope.courses || scope.courses.length === 0;

      let updatedCourses;
      if (isAllCurrently || isNoneCourses) {
        // If All or None were active, clicking a course pill means selecting ONLY this course
        updatedCourses = [courseName];
      } else if (scope.courses.includes(courseName)) {
        updatedCourses = scope.courses.filter(c => c !== courseName);
      } else {
        updatedCourses = [...scope.courses, courseName];
      }

      // Filter branches that no longer match the selected courses
      let updatedBranches = (scope.branches || []).filter(b => b !== '__NONE__');
      if (updatedBranches.length > 0 && updatedCourses.length > 0) {
        const validBranchNames = branches
          .filter(b => {
            const bColId = Number(b.college?.id);
            const bCourse = b.courseName || b.course?.name || b.course;
            return (bColId === cId || !bColId) && updatedCourses.includes(bCourse);
          })
          .map(b => b.name);
        updatedBranches = updatedBranches.filter(bn => validBranchNames.includes(bn));
      }

      const updatedScope = { ...scope, courses: updatedCourses, branches: updatedBranches };
      const newScopes = scopeIndex >= 0
        ? currentScopes.map((s, idx) => idx === scopeIndex ? updatedScope : s)
        : [...currentScopes, updatedScope];

      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleSelectAllCollegeCourses = (collegeId) => {
    const cId = Number(collegeId);
    setFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const newScopes = currentScopes.map(s => {
        if (Number(s.collegeId) === cId) {
          return { ...s, courses: [] }; // empty means all courses in this college
        }
        return s;
      });
      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleClearCollegeCourses = (collegeId) => {
    const cId = Number(collegeId);
    setFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const newScopes = currentScopes.map(s => {
        if (Number(s.collegeId) === cId) {
          return { ...s, courses: ['__NONE__'], branches: ['__NONE__'] };
        }
        return s;
      });
      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleCustomCollegeBranchesInit = (collegeId, allBranchNames) => {
    const cId = Number(collegeId);
    setFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const scopeIndex = currentScopes.findIndex(s => Number(s.collegeId) === cId);
      const scope = scopeIndex >= 0 ? { ...currentScopes[scopeIndex] } : { collegeId: cId, levels: [], courses: [], branches: [] };
      const updatedScope = { ...scope, branches: allBranchNames };
      const newScopes = scopeIndex >= 0
        ? currentScopes.map((s, idx) => idx === scopeIndex ? updatedScope : s)
        : [...currentScopes, updatedScope];
      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleToggleCollegeBranch = (collegeId, branchName, allColBranches = []) => {
    const cId = Number(collegeId);
    setFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const scopeIndex = currentScopes.findIndex(s => Number(s.collegeId) === cId);
      const scope = scopeIndex >= 0 ? { ...currentScopes[scopeIndex] } : { collegeId: cId, levels: [], courses: [], branches: [] };

      const isNoneBranches = scope.branches && scope.branches.length === 1 && scope.branches[0] === '__NONE__';
      const isAllCurrently = !scope.branches || scope.branches.length === 0;

      let updatedBranches;
      if (isAllCurrently || isNoneBranches) {
        // If All or None were active, clicking a branch pill means selecting ONLY this branch
        updatedBranches = [branchName];
      } else if (scope.branches.includes(branchName)) {
        updatedBranches = scope.branches.filter(b => b !== branchName);
      } else {
        updatedBranches = [...scope.branches, branchName];
      }

      const updatedScope = { ...scope, branches: updatedBranches };
      const newScopes = scopeIndex >= 0
        ? currentScopes.map((s, idx) => idx === scopeIndex ? updatedScope : s)
        : [...currentScopes, updatedScope];

      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleClearCollegeBranches = (collegeId) => {
    const cId = Number(collegeId);
    setFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const newScopes = currentScopes.map(s => {
        if (Number(s.collegeId) === cId) {
          return { ...s, branches: ['__NONE__'] };
        }
        return s;
      });
      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleSelectAllCollegeBranches = (collegeId) => {
    const cId = Number(collegeId);
    setFormData(prev => {
      const currentScopes = prev.assignedCollegeScopes || [];
      const newScopes = currentScopes.map(s => {
        if (Number(s.collegeId) === cId) {
          return { ...s, branches: [] }; // empty means all branches in the selected courses
        }
        return s;
      });
      return { ...prev, assignedCollegeScopes: newScopes };
    });
  };

  const handleSelectAllPermissions = () => {
    const allPermIds = PERMISSIONS.map(p => p.id);
    const defaultLevels = { ...formData.permissionAccessLevels };
    allPermIds.forEach(id => {
      if (!defaultLevels[id]) defaultLevels[id] = 'full';
    });
    setFormData(prev => ({
      ...prev,
      permissions: allPermIds,
      permissionAccessLevels: defaultLevels
    }));
  };

  const handleClearAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: [],
      permissionAccessLevels: {},
      leaveManagementCourses: []
    }));
  };

  const handleSelectAllScopedCourses = (scopedCourses) => {
    const courseNames = scopedCourses.map(c => c.name);
    setFormData(prev => ({
      ...prev,
      leaveManagementCourses: [...new Set([...(prev.leaveManagementCourses || []), ...courseNames])]
    }));
  };

  const handleClearScopedCourses = () => {
    setFormData(prev => ({
      ...prev,
      leaveManagementCourses: []
    }));
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.hrmsLinkType) {
      toast.error('Please link an HRMS employee or user record before creating');
      return;
    }

    try {
      let endpoint;
      let requestData;

      const hrmsFields = {
        employeeId: formData.employeeId || undefined,
        hrmsUserId: formData.hrmsUserId || undefined,
        hrmsEmployeeRef: formData.hrmsEmployeeRef || undefined,
        hrmsLinkType: formData.hrmsLinkType || undefined,
        name: formData.name || undefined
      };

      if (activeTab === 'sub-admins') {
        if (!formData.assignedCollegeIds || formData.assignedCollegeIds.length === 0) {
          toast.error('Please select at least one college for this user');
          return;
        }
        if (roleType === 'sub_admin' && (!formData.permissions || formData.permissions.length === 0)) {
          toast.error('Please select at least one permission for this user');
          return;
        }

        // Compute resolved courses and branches from assignedCollegeScopes
        const resolvedCourses = [];
        const resolvedBranches = [];

        (formData.assignedCollegeScopes || []).forEach(scope => {
          const cId = Number(scope.collegeId);
          const collegeCourses = courses.filter(c => Number(c.college?.id) === cId);

          const targetCourses = (scope.courses && scope.courses.length > 0)
            ? collegeCourses.filter(c => scope.courses.includes(c.name))
            : collegeCourses;

          targetCourses.forEach(c => {
            if (c.name) resolvedCourses.push(c.name.trim());
          });

          const targetCourseNames = targetCourses.map(c => c.name.trim().toLowerCase());
          const collegeBranches = branches.filter(b => {
            const bColId = Number(b.college?.id);
            const bCourseName = (b.courseName || b.course?.name || b.course || '').trim().toLowerCase();
            return (bColId === cId || targetCourseNames.includes(bCourseName)) && targetCourseNames.includes(bCourseName);
          });

          const targetBranches = (scope.branches && scope.branches.length > 0)
            ? collegeBranches.filter(b => scope.branches.some(sb => sb.trim().toLowerCase() === b.name.trim().toLowerCase()))
            : collegeBranches;

          targetBranches.forEach(b => {
            if (b.name) resolvedBranches.push(b.name.trim());
          });
        });

        const uniqueAssignedCourses = [...new Set(resolvedCourses)];
        const uniqueAssignedBranches = [...new Set(resolvedBranches)];

        endpoint = '/api/admin-management/sub-admins';
        requestData = {
          ...hrmsFields,
          permissions: formData.permissions,
          permissionAccessLevels: formData.permissionAccessLevels,
          leaveManagementCourses: formData.leaveManagementCourses,
          customRoleId: roleType === 'custom' ? (formData.customRoleId || undefined) : undefined,
          email: formData.email || undefined,
          assignedCollegeIds: formData.assignedCollegeIds,
          assignedCollegeScopes: formData.assignedCollegeScopes,
          assignedCourses: uniqueAssignedCourses,
          assignedBranches: uniqueAssignedBranches
        };
      } else if (activeTab === 'wardens') {
        endpoint = '/api/admin-management/wardens';
        if (!formData.assignedHostelId) {
          toast.error('Please select a hostel for the warden');
          return;
        }
        requestData = { ...hrmsFields, assignedHostelId: formData.assignedHostelId };
      } else if (activeTab === 'principals') {
        endpoint = '/api/admin-management/principals';
        requestData = {
          assignedCollegeIds: formData.assignedCollegeScopes.map(scope => scope.collegeId),
          assignedCollegeScopes: formData.assignedCollegeScopes,
          assignedLevels: [...new Set(formData.assignedCollegeScopes.flatMap(scope => scope.levels))],
          email: formData.principalEmail,
          ...hrmsFields
        };
      }

      const response = await api.post(endpoint, requestData);
      if (response.data.success) {
        const userType = activeTab === 'sub-admins' ? 'User' :
          activeTab === 'wardens' ? 'Warden' : 'Principal';

        toast.success(`${userType} added successfully! Login with HRMS employee ID and password.`);

        setShowAddModal(false);
        setFormData({
          username: '',
          password: '',
          permissions: [],
          permissionAccessLevels: {},
          hostelType: '',
          assignedHostelId: '',
          course: '',
          branch: '',
          leaveManagementCourses: [],
          passwordDeliveryMethod: '',
          email: '',
          phoneNumber: '',
          principalEmail: '',
          assignedCollegeIds: [],
          assignedCollegeScopes: [],
          assignedLevels: [],
          employeeId: '',
          hrmsUserId: '',
          hrmsEmployeeRef: '',
          hrmsLinkType: '',
          name: ''
        });
        setSelectedHrmsEmployee(null);
        setHrmsSearchQuery('');
        setHrmsSearchResults([]);
        setUserCollegeSearchQuery('');
        setFilteredBranches([]);
        fetchData();
      }
    } catch (error) {
      const userType = activeTab === 'sub-admins' ? 'user' :
        activeTab === 'wardens' ? 'warden' : 'principal';
      toast.error(error.response?.data?.message || `Failed to add ${userType}`);
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    try {
      console.log('🔧 Frontend: Sending update data:', formData);

      let endpoint;
      let updateData = {
        username: formData.username,
        permissions: formData.permissions
      };

      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      if (activeTab === 'sub-admins') {
        if (!formData.assignedCollegeIds || formData.assignedCollegeIds.length === 0) {
          toast.error('Please select at least one college for this user');
          return;
        }
        // Compute resolved courses and branches from assignedCollegeScopes
        const resolvedCourses = [];
        const resolvedBranches = [];

        (formData.assignedCollegeScopes || []).forEach(scope => {
          const cId = Number(scope.collegeId);
          const collegeCourses = courses.filter(c => Number(c.college?.id) === cId);

          const targetCourses = (scope.courses && scope.courses.length > 0)
            ? collegeCourses.filter(c => scope.courses.includes(c.name))
            : collegeCourses;

          targetCourses.forEach(c => {
            if (c.name) resolvedCourses.push(c.name.trim());
          });

          const targetCourseNames = targetCourses.map(c => c.name.trim().toLowerCase());
          const collegeBranches = branches.filter(b => {
            const bColId = Number(b.college?.id);
            const bCourseName = (b.courseName || b.course?.name || b.course || '').trim().toLowerCase();
            return (bColId === cId || targetCourseNames.includes(bCourseName)) && targetCourseNames.includes(bCourseName);
          });

          const targetBranches = (scope.branches && scope.branches.length > 0)
            ? collegeBranches.filter(b => scope.branches.some(sb => sb.trim().toLowerCase() === b.name.trim().toLowerCase()))
            : collegeBranches;

          targetBranches.forEach(b => {
            if (b.name) resolvedBranches.push(b.name.trim());
          });
        });

        endpoint = `/api/admin-management/sub-admins/${selectedAdmin._id}`;
        updateData.leaveManagementCourses = formData.leaveManagementCourses;
        updateData.permissionAccessLevels = formData.permissionAccessLevels;
        updateData.assignedCollegeIds = formData.assignedCollegeIds;
        updateData.assignedCollegeScopes = formData.assignedCollegeScopes;
        updateData.assignedCourses = [...new Set(resolvedCourses)];
        updateData.assignedBranches = [...new Set(resolvedBranches)];
        updateData.customRoleId = roleType === 'custom' ? (formData.customRoleId || null) : null;
      } else if (activeTab === 'wardens') {
        endpoint = `/api/admin-management/wardens/${selectedAdmin._id}`;
        if (formData.assignedHostelId) {
          updateData.assignedHostelId = formData.assignedHostelId;
        } else if (formData.hostelType) {
          updateData.hostelType = formData.hostelType;
        }
      } else if (activeTab === 'principals') {
        endpoint = `/api/admin-management/principals/${selectedAdmin._id}`;
        updateData.assignedCollegeIds = formData.assignedCollegeScopes.map(scope => scope.collegeId);
        updateData.assignedCollegeScopes = formData.assignedCollegeScopes;
        updateData.assignedLevels = [...new Set(formData.assignedCollegeScopes.flatMap(scope => scope.levels))];
        // Always include email for principals (can be empty to clear it)
        updateData.email = formData.principalEmail;
      }

      updateData.employeeId = formData.employeeId || '';
      updateData.hrmsUserId = formData.hrmsUserId || '';
      updateData.hrmsEmployeeRef = formData.hrmsEmployeeRef || '';
      updateData.hrmsLinkType = formData.hrmsLinkType || '';
      updateData.name = formData.name || '';

      console.log('🔧 Frontend: Final update data:', updateData);

      const response = await api.put(endpoint, updateData);
      if (response.data.success) {
        const userType = activeTab === 'sub-admins' ? 'User' :
          activeTab === 'wardens' ? 'Warden' : 'Principal';
        toast.success(`${userType} updated successfully`);

        // If the current user is being edited, refresh their data
        if (selectedAdmin && selectedAdmin._id === user?._id) {
          console.log('🔄 Current user updated, refreshing user data...');
          try {
            // Re-validate token to get updated user data
            const validationResponse = await api.get('/api/admin-management/validate');
            if (validationResponse.data.success && validationResponse.data.data?.user) {
              const updatedUserData = validationResponse.data.data.user;
              console.log('🔄 Updated user data:', updatedUserData);
              updateUser(updatedUserData);
            }
          } catch (error) {
            console.error('🔄 Error refreshing user data:', error);
          }
        }

        setShowEditModal(false);
        setSelectedAdmin(null);
        setFormData({
          username: '',
          password: '',
          permissions: [],
          permissionAccessLevels: {},
          hostelType: '',
          assignedHostelId: '',
          course: '',
          branch: '',
          leaveManagementCourses: [],
          passwordDeliveryMethod: '',
          email: '',
          phoneNumber: '',
          principalEmail: '',
          principalCourses: [],
          assignedCollegeIds: [],
          assignedCollegeScopes: [],
          assignedLevels: [],
          employeeId: '',
          hrmsUserId: '',
          hrmsEmployeeRef: '',
          hrmsLinkType: '',
          name: ''
        });
        setSelectedHrmsEmployee(null);
        setHrmsSearchQuery('');
        setHrmsSearchResults([]);
        setUserCollegeSearchQuery('');
        setFilteredBranches([]);
        fetchData();
      }
    } catch (error) {
      console.error('🔧 Frontend: Error updating:', error);
      const userType = activeTab === 'sub-admins' ? 'user' :
        activeTab === 'wardens' ? 'warden' : 'principal';
      toast.error(error.response?.data?.message || `Failed to update ${userType}`);
    }
  };

  const handleProceedToPermissions = () => {
    if (showAddModal && !formData.employeeId && !selectedHrmsEmployee && !formData.username) {
      toast.error('Please link an HRMS record before proceeding');
      return;
    }
    if (!formData.assignedCollegeIds || formData.assignedCollegeIds.length === 0) {
      toast.error('Please select at least one college before proceeding');
      return;
    }
    setUserModalStep(2);
  };

  const handleUserModalSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'sub-admins') {
      if (userModalStep === 1) {
        handleProceedToPermissions();
        return;
      }
      if (showAddModal) {
        handleAddAdmin(e);
      } else {
        handleEditAdmin(e);
      }
      return;
    }
    if (showAddModal) {
      handleAddAdmin(e);
    } else {
      handleEditAdmin(e);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    const userType = activeTab === 'sub-admins' ? 'user' :
      activeTab === 'wardens' ? 'warden' : 'principal';
    if (!window.confirm(`Are you sure you want to delete this ${userType}?`)) return;

    try {
      let endpoint;
      if (activeTab === 'sub-admins') {
        endpoint = `/api/admin-management/sub-admins/${adminId}`;
      } else if (activeTab === 'wardens') {
        endpoint = `/api/admin-management/wardens/${adminId}`;
      } else if (activeTab === 'principals') {
        endpoint = `/api/admin-management/principals/${adminId}`;
      }

      const response = await api.delete(endpoint);
      if (response.data.success) {
        const userType = activeTab === 'sub-admins' ? 'User' :
          activeTab === 'wardens' ? 'Warden' : 'Principal';
        toast.success(`${userType} deleted successfully`);
        fetchData();
      }
    } catch (error) {
      const userType = activeTab === 'sub-admins' ? 'user' :
        activeTab === 'wardens' ? 'warden' : 'principal';
      toast.error(error.response?.data?.message || `Failed to delete ${userType}`);
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setRoleType(admin.role === 'custom' ? 'custom' : 'sub_admin');

    // Convert leaveManagementCourses to proper format for editing (now stores course names)
    const leaveManagementCourses = admin.leaveManagementCourses ? admin.leaveManagementCourses.map(course =>
      typeof course === 'object' ? course.name : course // If object, get name; otherwise it's already a name
    ) : [];

    console.log('🔧 Editing admin with leave management courses:', leaveManagementCourses);

    const assignedCollegeScopes = admin.assignedCollegeScopes?.length
      ? admin.assignedCollegeScopes.map(scope => ({
          collegeId: Number(scope.collegeId),
          levels: scope.levels || [],
          courses: scope.courses || [],
          branches: scope.branches || []
        }))
      : (admin.assignedCollegeIds?.length ? admin.assignedCollegeIds : admin.assignedCollegeId ? [admin.assignedCollegeId] : [])
        .map(collegeId => ({
          collegeId: Number(collegeId),
          levels: admin.assignedLevels || [],
          courses: admin.assignedCourses || [],
          branches: admin.assignedBranches || []
        }));

    setFormData({
      username: admin.username,
      password: '',
      permissions: admin.permissions || [],
      permissionAccessLevels: admin.permissionAccessLevels || {},
      hostelType: admin.hostelType || '',
      assignedHostelId: admin.assignedHostelId?._id || admin.assignedHostelId || '',
      course: admin.course?.name || admin.course || '', // Course is now a string (name)
      branch: admin.branch || '', // Branch is now a string (name)
      leaveManagementCourses: leaveManagementCourses,
      // Don't include password delivery fields for editing
      passwordDeliveryMethod: '',
      email: '',
      phoneNumber: '',
      customRoleId: admin.customRoleId || '',
      principalEmail: admin.email || '', // Load principal's email
      principalCourses: admin.assignedCourses || (admin.course ? [admin.course] : []), // Load principal's courses
      assignedCollegeIds: assignedCollegeScopes.map(scope => scope.collegeId),
      assignedCollegeScopes,
      assignedCourses: admin.assignedCourses || [],
      assignedBranches: admin.assignedBranches || [],
      assignedLevels: [...new Set(assignedCollegeScopes.flatMap(scope => scope.levels))],
      employeeId: admin.employeeId || '',
      hrmsUserId: admin.hrmsUserId || '',
      hrmsEmployeeRef: admin.hrmsEmployeeRef || '',
      hrmsLinkType: admin.hrmsLinkType || '',
      name: admin.name || ''
    });
    setSelectedHrmsEmployee(admin.employeeId ? {
      employeeId: admin.employeeId,
      name: admin.name,
      hrmsUserId: admin.hrmsUserId,
      hrmsEmployeeRef: admin.hrmsEmployeeRef,
      linkType: admin.hrmsLinkType,
      label: admin.hrmsLinkType === 'user' ? 'User Account' : 'Employee Record'
    } : null);
    setHrmsSearchQuery('');
    setHrmsSearchResults([]);
    setUserModalStep(1);
    setShowEditModal(true);
  };

  const handleAddCollegeToPrincipal = () => {
    if (!selectedCollegeToAdd || selectedLevelsToAdd.length === 0) {
      toast.error('Please select a college and at least one level');
      return;
    }

    setFormData(prev => {
      const collegeId = Number(selectedCollegeToAdd);
      const scopes = prev.assignedCollegeScopes || [];
      const newScopes = scopes.some(scope => Number(scope.collegeId) === collegeId)
        ? scopes.map(scope => Number(scope.collegeId) === collegeId ? { ...scope, levels: selectedLevelsToAdd } : scope)
        : [...scopes, { collegeId, levels: selectedLevelsToAdd }];

      return {
        ...prev,
        assignedCollegeIds: newScopes.map(scope => scope.collegeId),
        assignedCollegeScopes: newScopes,
        assignedLevels: [...new Set(newScopes.flatMap(scope => scope.levels))]
      };
    });

    // Reset Builder State
    setSelectedCollegeToAdd('');
    setSelectedLevelsToAdd([]);
    toast.success('College added successfully');
  };

  const openPasswordResetModal = (admin) => {
    setSelectedAdmin(admin);
    setPasswordResetData({
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordResetModal(true);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // Validate password matching only
    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await api.put(`/api/admin-management/sub-admins/${selectedAdmin._id}`, {
        password: passwordResetData.newPassword
      });

      if (response.data.success) {
        toast.success('Password reset successfully');
        setShowPasswordResetModal(false);
        setPasswordResetData({
          newPassword: '',
          confirmPassword: ''
        });
        setSelectedAdmin(null);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const resetForm = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowRoleModal(false);
    setShowPasswordResetModal(false);
    setSelectedAdmin(null);
    setSelectedRole(null);
    setRoleType('sub_admin');
    setUserModalStep(1);
    setFormData({
      username: '',
      password: '',
      permissions: [],
      permissionAccessLevels: {},
      hostelType: '',
      assignedHostelId: '',
      course: '',
      branch: '',
      leaveManagementCourses: [],
      passwordDeliveryMethod: '',
      email: '',
      phoneNumber: '',
      customRoleId: '',
      principalEmail: '',
      principalCourses: [],
      assignedCollegeIds: [],
      assignedCollegeScopes: [],
      assignedLevels: [],
      employeeId: '',
      hrmsUserId: '',
      hrmsEmployeeRef: '',
      hrmsLinkType: '',
      name: ''
    });
    setSelectedHrmsEmployee(null);
    setHrmsSearchQuery('');
    setHrmsSearchResults([]);
    setUserCollegeSearchQuery('');
    setPasswordResetData({
      newPassword: '',
      confirmPassword: ''
    });
    setRoleModalStep(1);
    setRoleCollegeSearchQuery('');
    setRoleFormData({
      name: '',
      description: '',
      permissions: [],
      permissionAccessLevels: {},
      courseAssignment: 'all',
      assignedCourses: [],
      assignedBranches: [],
      assignedCollegeIds: [],
      assignedCollegeScopes: []
    });
  };

// Custom Role Management Functions
  const handleCreateRole = async (e) => {
    e.preventDefault();

    if (!roleFormData.name || !roleFormData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    if (!roleFormData.assignedCollegeIds || roleFormData.assignedCollegeIds.length === 0) {
      toast.error('Please select at least one college');
      return;
    }
    if (!roleFormData.permissions || roleFormData.permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    try {
      const resolvedCourses = [];
      const resolvedBranches = [];

      (roleFormData.assignedCollegeScopes || []).forEach(scope => {
        const cId = Number(scope.collegeId);
        const collegeCourses = courses.filter(c => Number(c.college?.id) === cId);

        const targetCourses = (scope.courses && scope.courses.length > 0)
          ? collegeCourses.filter(c => scope.courses.includes(c.name))
          : collegeCourses;

        targetCourses.forEach(c => {
          if (c.name) resolvedCourses.push(c.name.trim());
        });

        const targetCourseNames = targetCourses.map(c => c.name.trim().toLowerCase());
        const collegeBranches = branches.filter(b => {
          const bColId = Number(b.college?.id);
          const bCourseName = (b.courseName || b.course?.name || b.course || '').trim().toLowerCase();
          return (bColId === cId || targetCourseNames.includes(bCourseName)) && targetCourseNames.includes(bCourseName);
        });

        const targetBranches = (scope.branches && scope.branches.length > 0)
          ? collegeBranches.filter(b => scope.branches.some(sb => sb.trim().toLowerCase() === b.name.trim().toLowerCase()))
          : collegeBranches;

        targetBranches.forEach(b => {
          if (b.name) resolvedBranches.push(b.name.trim());
        });
      });

      const uniqueAssignedCourses = [...new Set(resolvedCourses)];
      const uniqueAssignedBranches = [...new Set(resolvedBranches)];

      const cleanedScopes = (roleFormData.assignedCollegeScopes || []).map(scope => ({
        collegeId: Number(scope.collegeId),
        levels: scope.levels || [],
        courses: (scope.courses || []).filter(c => c && c !== '__NONE__'),
        branches: (scope.branches || []).filter(b => b && b !== '__NONE__')
      }));

      const payload = {
        name: roleFormData.name.trim(),
        description: roleFormData.description,
        permissions: roleFormData.permissions,
        permissionAccessLevels: roleFormData.permissionAccessLevels,
        assignedCollegeIds: roleFormData.assignedCollegeIds,
        assignedCollegeScopes: cleanedScopes,
        assignedCourses: uniqueAssignedCourses,
        assignedBranches: uniqueAssignedBranches,
        courseAssignment: uniqueAssignedCourses.length > 0 ? 'selected' : 'all'
      };

      const response = await api.post('/api/admin-management/custom-roles', payload);
      if (response.data.success) {
        toast.success('Custom role created successfully');
        setShowRoleModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create custom role');
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();

    if (!roleFormData.name || !roleFormData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    if (!roleFormData.assignedCollegeIds || roleFormData.assignedCollegeIds.length === 0) {
      toast.error('Please select at least one college');
      return;
    }
    if (!roleFormData.permissions || roleFormData.permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    try {
      const resolvedCourses = [];
      const resolvedBranches = [];

      (roleFormData.assignedCollegeScopes || []).forEach(scope => {
        const cId = Number(scope.collegeId);
        const collegeCourses = courses.filter(c => Number(c.college?.id) === cId);

        const targetCourses = (scope.courses && scope.courses.length > 0)
          ? collegeCourses.filter(c => scope.courses.includes(c.name))
          : collegeCourses;

        targetCourses.forEach(c => {
          if (c.name) resolvedCourses.push(c.name.trim());
        });

        const targetCourseNames = targetCourses.map(c => c.name.trim().toLowerCase());
        const collegeBranches = branches.filter(b => {
          const bColId = Number(b.college?.id);
          const bCourseName = (b.courseName || b.course?.name || b.course || '').trim().toLowerCase();
          return (bColId === cId || targetCourseNames.includes(bCourseName)) && targetCourseNames.includes(bCourseName);
        });

        const targetBranches = (scope.branches && scope.branches.length > 0)
          ? collegeBranches.filter(b => scope.branches.some(sb => sb.trim().toLowerCase() === b.name.trim().toLowerCase()))
          : collegeBranches;

        targetBranches.forEach(b => {
          if (b.name) resolvedBranches.push(b.name.trim());
        });
      });

      const uniqueAssignedCourses = [...new Set(resolvedCourses)];
      const uniqueAssignedBranches = [...new Set(resolvedBranches)];

      const cleanedScopes = (roleFormData.assignedCollegeScopes || []).map(scope => ({
        collegeId: Number(scope.collegeId),
        levels: scope.levels || [],
        courses: (scope.courses || []).filter(c => c && c !== '__NONE__'),
        branches: (scope.branches || []).filter(b => b && b !== '__NONE__')
      }));

      const payload = {
        name: roleFormData.name.trim(),
        description: roleFormData.description,
        permissions: roleFormData.permissions,
        permissionAccessLevels: roleFormData.permissionAccessLevels,
        assignedCollegeIds: roleFormData.assignedCollegeIds,
        assignedCollegeScopes: cleanedScopes,
        assignedCourses: uniqueAssignedCourses,
        assignedBranches: uniqueAssignedBranches,
        courseAssignment: uniqueAssignedCourses.length > 0 ? 'selected' : 'all'
      };

      const response = await api.put(`/api/admin-management/custom-roles/${selectedRole._id}`, payload);
      if (response.data.success) {
        toast.success('Custom role updated successfully');
        setShowRoleModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update custom role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this custom role?')) return;

    try {
      const response = await api.delete(`/api/admin-management/custom-roles/${roleId}`);
      if (response.data.success) {
        toast.success('Custom role deleted successfully');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete custom role');
    }
  };

  const openRoleModal = (role = null) => {
    setRoleModalStep(1);
    setRoleCollegeSearchQuery('');
    if (role) {
      setSelectedRole(role);
      const assignedCourses = role.assignedCourses ? role.assignedCourses.map(course =>
        typeof course === 'object' ? course.name : course
      ) : [];
      const assignedBranches = role.assignedBranches ? role.assignedBranches.map(branch =>
        typeof branch === 'object' ? branch.name : branch
      ) : [];

      const assignedCollegeIds = (role.assignedCollegeIds || []).map(Number);
      const assignedCollegeScopes = (role.assignedCollegeScopes && role.assignedCollegeScopes.length > 0)
        ? role.assignedCollegeScopes.map(scope => ({
            collegeId: Number(scope.collegeId),
            levels: scope.levels || [],
            courses: scope.courses || [],
            branches: scope.branches || []
          }))
        : assignedCollegeIds.map(cId => ({
            collegeId: Number(cId),
            levels: [],
            courses: assignedCourses,
            branches: assignedBranches
          }));

      setRoleFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || [],
        permissionAccessLevels: role.permissionAccessLevels || {},
        courseAssignment: role.courseAssignment || (assignedCourses.length > 0 ? 'selected' : 'all'),
        assignedCourses: assignedCourses,
        assignedBranches: assignedBranches,
        assignedCollegeIds: assignedCollegeIds,
        assignedCollegeScopes: assignedCollegeScopes
      });
    } else {
      setSelectedRole(null);
      setRoleFormData({
        name: '',
        description: '',
        permissions: [],
        permissionAccessLevels: {},
        courseAssignment: 'all',
        assignedCourses: [],
        assignedBranches: [],
        assignedCollegeIds: [],
        assignedCollegeScopes: []
      });
    }
    setShowRoleModal(true);
  };



  // Fetch courses is now handled in fetchData on mount
  // Removed redundant useEffect to prevent race conditions and excessive API calls

  // Fetch branches when course is selected for principal
  useEffect(() => {
    // Only fetch branches if exactly one course is selected
    if (activeTab === 'principals' && (showAddModal || showEditModal) && formData.principalCourses.length === 1) {
      const courseName = formData.principalCourses[0];
      console.log('🔍 Fetching branches for course:', courseName);
      // Find course ID from course name
      const selectedCourse = courses.find(c => c.name === courseName);
      if (selectedCourse) {
        api.get(`/api/course-management/branches/${selectedCourse._id}`)
          .then(res => {
            console.log('✅ Branches fetched successfully:', res.data);
            if (res.data.success) {
              setFilteredBranches(res.data.data);
            } else {
              setFilteredBranches([]);
            }
          })
          .catch(error => {
            console.error('❌ Error fetching branches:', error);
            setFilteredBranches([]);
          });
      } else {
        setFilteredBranches([]);
      }
    } else {
      setFilteredBranches([]);
      // Clear branch selection if multiple courses or no course selected
      if (formData.branch) {
        setFormData(prev => ({ ...prev, branch: '' }));
      }
    }
  }, [activeTab, showAddModal, showEditModal, formData.principalCourses, courses]);

  if (loading) return <LoadingSpinner />;

  const currentData = activeTab === 'sub-admins' ? subAdmins :
    activeTab === 'wardens' ? wardens : principals;
  const isWardenTab = activeTab === 'wardens';
  const isPrincipalTab = activeTab === 'principals';

  return (
    <div className="mx-auto mt-12 md:mt-2 px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <SEO title="Admin Management" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Admin Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage users, warden, and principal accounts</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'custom-roles') {
              openRoleModal();
            } else {
              setUserModalStep(1);
              setShowAddModal(true);
            }
          }}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium shadow-sm"
        >
          <UserPlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          {activeTab === 'custom-roles' ? 'Add Custom Role' :
            isWardenTab ? 'Add Warden' :
              isPrincipalTab ? 'Add Principal' : 'Create User'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap sm:flex-nowrap space-x-1 bg-gray-100 p-1 rounded-lg mb-4 sm:mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sub-admins')}
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-colors whitespace-nowrap text-xs sm:text-sm font-medium ${activeTab === 'sub-admins'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <UserGroupIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('wardens')}
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-colors whitespace-nowrap text-xs sm:text-sm ${activeTab === 'wardens'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          Wardens
        </button>
        <button
          onClick={() => setActiveTab('principals')}
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-colors whitespace-nowrap text-xs sm:text-sm ${activeTab === 'principals'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <AcademicCapIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          Principals
        </button>
        <button
          onClick={() => setActiveTab('custom-roles')}
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-colors whitespace-nowrap text-xs sm:text-sm ${activeTab === 'custom-roles'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <ShieldCheckIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          Custom Roles
        </button>
      </div>


      {/* Custom Roles Tab */}
      {activeTab === 'custom-roles' && (
        <>
          {/* Custom Roles List */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
            {customRoles.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <ShieldCheckIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                <p className="text-sm sm:text-base text-gray-500">No custom roles found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {customRoles.map((role) => (
                  <div key={role._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{role.name}</h3>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex-shrink-0`}>
                            {role.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {role.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">{role.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {role.permissions && role.permissions.map(permission => {
                            const permissionLabel = PERMISSIONS.find(p => p.id === permission)?.label || permission;
                            const accessLevel = role.permissionAccessLevels?.[permission] || 'view';
                            return (
                              <span key={permission} className="px-1.5 sm:px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs flex items-center gap-1">
                                <span className="truncate">{permissionLabel}</span>
                                <span className={`px-1 py-0.5 rounded text-xs flex-shrink-0 ${accessLevel === 'full'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                                  }`}>
                                  {accessLevel === 'full' ? 'Full' : 'View'}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                        {/* Scope badges */}
                        {role.assignedCollegeIds && role.assignedCollegeIds.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t border-gray-100">
                            <span className="text-xs font-semibold text-gray-700">Scope:</span>
                            {role.assignedCollegeIds.map(cId => {
                              const col = colleges.find(c => Number(c.id) === Number(cId));
                              return (
                                <span key={cId} className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[11px] font-semibold">
                                  {col?.code || col?.name || cId}
                                </span>
                              );
                            })}
                            {role.assignedCourses && role.assignedCourses.length > 0 ? (
                              <span className="text-xs text-indigo-700 font-medium">
                                • {role.assignedCourses.length} course{role.assignedCourses.length > 1 ? 's' : ''} ({role.assignedCourses.slice(0, 3).join(', ')}{role.assignedCourses.length > 3 ? '...' : ''})
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">• All Courses</span>
                            )}
                            {role.assignedBranches && role.assignedBranches.length > 0 && (
                              <span className="text-xs text-purple-700 font-medium">
                                • {role.assignedBranches.length} branch{role.assignedBranches.length > 1 ? 'es' : ''}
                              </span>
                            )}
                          </div>
                        )}
                        {!role.assignedCollegeIds?.length && role.courseAssignment && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-600">
                              Course Assignment: {role.courseAssignment === 'all' ? 'All Courses' : (
                                role.assignedCourses && role.assignedCourses.length > 0 ? (
                                  <span>
                                    {role.assignedCourses.map((course, index) => (
                                      <span key={course._id || course}>
                                        {typeof course === 'object' ? course.name : course}
                                        {index < role.assignedCourses.length - 1 ? ', ' : ''}
                                      </span>
                                    ))}
                                  </span>
                                ) : 'No courses selected'
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => openRoleModal(role)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role._id)}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Admin Management Content */}
      {activeTab !== 'custom-roles' && (
        <>
          {/* Users List - Card Layout */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
            {currentData.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <UserIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                <p className="text-sm sm:text-base text-gray-500">No {isWardenTab ? 'wardens' : isPrincipalTab ? 'principals' : 'users'} found</p>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {currentData.filter(admin => admin && admin._id).map((admin) => (
                    <div key={admin._id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-all duration-200 hover:border-gray-300 flex flex-col h-full">
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isWardenTab ? 'bg-green-100' : isPrincipalTab ? 'bg-purple-100' : 'bg-blue-100'}`}>
                            {isWardenTab ? (
                              <HomeIcon className="w-5 h-5 text-green-600" />
                            ) : isPrincipalTab ? (
                              <AcademicCapIcon className="w-5 h-5 text-purple-600" />
                            ) : (
                              <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{admin.name || admin.username}</h3>
                            {admin.employeeId && (
                              <p className="text-xs text-gray-500">
                                Emp ID: {admin.employeeId}
                                {admin.hrmsLinkType && (
                                  <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${admin.hrmsLinkType === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {admin.hrmsLinkType === 'user' ? 'User' : 'Employee'}
                                  </span>
                                )}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 truncate">
                              @{admin.username}
                              {admin.usesHrmsAuth && (
                                <span className="ml-1 text-indigo-600 font-medium">HRMS login</span>
                              )}
                            </p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {admin.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(admin)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={!isWardenTab && !isPrincipalTab ? 'Edit User' : isWardenTab ? 'Edit Warden' : 'Edit Principal'}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          {!isWardenTab && !isPrincipalTab && !admin.usesHrmsAuth && (
                            <button
                              onClick={() => openPasswordResetModal(admin)}
                              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Reset Password"
                            >
                              <KeyIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAdmin(admin._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={!isWardenTab && !isPrincipalTab ? 'Delete User' : isWardenTab ? 'Delete Warden' : 'Delete Principal'}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="space-y-3">
                        {/* Role Information */}
                        {!isWardenTab && !isPrincipalTab && (
                          <div>
                            {admin.role === 'custom' && admin.customRoleId && (
                              <div className="mb-2">
                                <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                  </svg>
                                  {admin.customRole || 'Unknown Role'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Warden/Principal Specific Info */}
                        {isWardenTab && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {admin.assignedHostelId?.name
                                || hostels.find(h => h._id === (admin.assignedHostelId?._id || admin.assignedHostelId))?.name
                                || (admin.hostelType === 'boys' ? 'Boys Hostel' : admin.hostelType === 'girls' ? 'Girls Hostel' : 'No hostel assigned')}
                            </span>
                          </div>
                        )}

                        {isPrincipalTab && (
                          <div className="flex flex-col gap-3">
                            {/* 1. Display Assigned Colleges */}
                            {admin.assignedCollegeIds && admin.assignedCollegeIds.length > 0 ? (
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2 text-sm text-gray-800">
                                  <svg className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <div className="flex flex-wrap gap-1.5">
                                    {admin.assignedCollegeIds.map(id => {
                                      const college = colleges.find(c => c.id === id);
                                      return (
                                        <span key={id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                          {college?.name || 'Unknown College'}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Levels */}
                                {admin.assignedCollegeScopes?.length ? (
                                  <div className="ml-6 space-y-1">
                                    {admin.assignedCollegeScopes.map(scope => (
                                      <div key={scope.collegeId} className="flex flex-wrap items-center gap-1">
                                        <span className="text-[10px] text-gray-500">{colleges.find(college => Number(college.id) === Number(scope.collegeId))?.name || scope.collegeId}:</span>
                                        {scope.levels.map(level => (
                                          <span key={level} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] uppercase border border-gray-200">{level}</span>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-1 ml-6">
                                    {admin.assignedLevels?.map(level => (
                                      <span key={level} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] uppercase border border-gray-200">{level}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : admin.assignedCollegeId ? (
                              /* Fallback for legacy single ID */
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  {colleges.find(c => c.id === admin.assignedCollegeId)?.name || 'Unknown College'}
                                </div>
                                <div className="flex flex-wrap gap-1 ml-6">
                                  {admin.assignedLevels && admin.assignedLevels.map(level => (
                                    <span key={level} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] uppercase border border-gray-200">
                                      {level}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            {/* 2. Display Matching Courses */}
                            <div className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  // Determine IDs to filter by (support both new array and old single ID)
                                  const targetCollegeIds = admin.assignedCollegeIds && admin.assignedCollegeIds.length > 0
                                    ? admin.assignedCollegeIds
                                    : admin.assignedCollegeId ? [admin.assignedCollegeId] : [];

                                  if (targetCollegeIds.length > 0) {
                                    // Filter courses matching ANY of the college IDs AND matching the levels
                                    const filteredCourses = courses.filter(course => {
                                      const scope = admin.assignedCollegeScopes?.find(item => Number(item.collegeId) === Number(course.college?.id));
                                      const levels = scope?.levels || admin.assignedLevels || [];
                                      return course.college &&
                                        targetCollegeIds.includes(course.college.id) &&
                                        levels.map(level => level.toLowerCase()).includes(course.level?.toLowerCase());
                                    });

                                    if (filteredCourses.length > 0) {
                                      // Limit display to 5 courses + "x more"
                                      const displayCourses = filteredCourses.slice(0, 5);
                                      const remaining = filteredCourses.length - 5;

                                      return (
                                        <>
                                          {displayCourses.map((course) => (
                                            <span key={course._id} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-medium border border-indigo-100 truncate max-w-[150px]">
                                              {course.name}
                                            </span>
                                          ))}
                                          {remaining > 0 && (
                                            <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-[11px] border border-gray-200">
                                              +{remaining} more
                                            </span>
                                          )}
                                        </>
                                      );
                                    } else {
                                      return <span className="text-xs text-gray-400 italic">No matching courses found</span>;
                                    }
                                  } else {
                                    // Legacy: assignedCourses or course
                                    if (admin.assignedCourses && admin.assignedCourses.length > 0) {
                                      return admin.assignedCourses.map((course, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-medium truncate max-w-[150px]">
                                          {course}
                                        </span>
                                      ));
                                    } else if (admin.course) {
                                      return (
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-medium truncate max-w-[150px]">
                                          {typeof admin.course === 'object' ? admin.course.name : admin.course}
                                        </span>
                                      );
                                    }
                                    return <span className="text-xs text-gray-400 italic">No college/course assigned</span>;
                                  }
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                        {isPrincipalTab && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {admin.email ? (
                              <span className="text-xs text-gray-600 truncate max-w-[200px]" title={admin.email}>
                                {admin.email}
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                                No email configured
                              </span>
                            )}
                          </div>
                        )}

                        {/* Assigned Colleges & Academic Scope for Users */}
                        {!isWardenTab && !isPrincipalTab && admin.assignedCollegeIds && admin.assignedCollegeIds.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                              <BuildingOfficeIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>Colleges & Academic Scope ({admin.assignedCollegeIds.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {admin.assignedCollegeIds.map(id => {
                                const college = colleges.find(c => Number(c.id) === Number(id));
                                const scope = admin.assignedCollegeScopes?.find(s => Number(s.collegeId) === Number(id));
                                const hasCourseFilter = scope?.courses && scope.courses.length > 0;
                                const hasBranchFilter = scope?.branches && scope.branches.length > 0;

                                return (
                                  <div key={id} className="inline-flex flex-col gap-0.5 px-2 py-1 rounded-lg bg-blue-50/80 border border-blue-100 text-xs">
                                    <span className="font-semibold text-blue-900">
                                      {college?.code || college?.name || `College ${id}`}
                                    </span>
                                    {(hasCourseFilter || hasBranchFilter) ? (
                                      <div className="text-[10px] text-blue-700 flex flex-wrap gap-1 mt-0.5">
                                        {hasCourseFilter && (
                                          <span className="px-1 py-0.2 bg-white/90 rounded border border-blue-200 font-medium">
                                            {scope.courses.join(', ')}
                                          </span>
                                        )}
                                        {hasBranchFilter && (
                                          <span className="px-1 py-0.2 bg-white/90 rounded border border-blue-200 font-medium">
                                            {scope.branches.join(', ')}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-blue-600/80">All Courses & Branches</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Permissions for Sub-Admins */}
                        {!isWardenTab && !isPrincipalTab && admin.permissions && admin.permissions.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-600 mb-2">Permissions ({admin.permissions.length})</div>
                            <div className="flex flex-wrap gap-1">
                              {admin.permissions.slice(0, 3).map(permission => {
                                const permissionLabel = PERMISSIONS.find(p => p.id === permission)?.label || permission;
                                const accessLevel = admin.permissionAccessLevels?.[permission] || 'view';
                                return (
                                  <span key={permission} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                    <span className="truncate">{permissionLabel}</span>
                                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${accessLevel === 'full'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-600'
                                      }`}>
                                      {accessLevel === 'full' ? 'Full' : 'View'}
                                    </span>
                                  </span>
                                );
                              })}
                              {admin.permissions.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  +{admin.permissions.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Role Type Badge */}
                        <div className="pt-2 border-t border-gray-100">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isWardenTab
                            ? 'bg-green-50 text-green-700'
                            : isPrincipalTab
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-blue-50 text-blue-700'
                            }`}>
                            {isWardenTab ? 'Warden' : isPrincipalTab ? 'Principal' : 'User'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 w-full ${!isWardenTab && !isPrincipalTab ? 'max-w-6xl' : 'max-w-4xl'} mx-2 sm:mx-4 max-h-[95vh] overflow-y-auto`}
            >
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                  {showAddModal
                    ? (activeTab === 'sub-admins' ? 'Create New User' : `Add New ${isWardenTab ? 'Warden' : 'Principal'}`)
                    : (activeTab === 'sub-admins' ? 'Edit User' : `Edit ${isWardenTab ? 'Warden' : 'Principal'}`)}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-1 sm:p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </button>
              </div>

              <form onSubmit={handleUserModalSubmit} className="space-y-4">
                {activeTab === 'sub-admins' ? (
                  /* TWO-STEP WIZARD FOR USER MANAGEMENT */
                  <div className="space-y-4">
                    {/* Stepper Progress Bar */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 shadow-2xs">
                      <div className="flex items-center justify-between gap-2 max-w-xl mx-auto">
                        <button
                          type="button"
                          onClick={() => setUserModalStep(1)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            userModalStep === 1
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            userModalStep === 1 ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700'
                          }`}>
                            1
                          </span>
                          <span>Card 1 & 2: Colleges & Scope</span>
                          {formData.assignedCollegeIds?.length > 0 && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              userModalStep === 1 ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {formData.assignedCollegeIds.length}
                            </span>
                          )}
                        </button>

                        <div className={`flex-1 h-0.5 rounded-full transition-colors ${userModalStep === 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />

                        <button
                          type="button"
                          onClick={() => {
                            if (!formData.assignedCollegeIds || formData.assignedCollegeIds.length === 0) {
                              toast.error('Please select at least one college in Step 1 first');
                              return;
                            }
                            setUserModalStep(2);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            userModalStep === 2
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            userModalStep === 2 ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700'
                          }`}>
                            2
                          </span>
                          <span>Permissions & Role Mode</span>
                          {formData.permissions?.length > 0 && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              userModalStep === 2 ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {formData.permissions.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {userModalStep === 1 ? (
                      /* STEP 1: CARD 1 & CARD 2 */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
                    {/* CARD 1: HRMS Record & College Selection */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 flex flex-col">
                      {/* Card 1 Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm">
                            1
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">User Identity & Colleges</h3>
                            <p className="text-xs text-gray-500">Link HRMS identity & select colleges</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          Card 1
                        </span>
                      </div>

                      {/* 1. HRMS Record Search & Link */}
                      <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold uppercase tracking-wider text-indigo-900">
                            Link HRMS Record <span className="text-red-500">*</span>
                          </label>
                          {selectedHrmsEmployee && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              selectedHrmsEmployee.linkType === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {selectedHrmsEmployee.linkType === 'user' ? 'User Account' : 'Employee Record'}
                            </span>
                          )}
                        </div>

                        {selectedHrmsEmployee ? (
                          <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-indigo-200 shadow-sm">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{selectedHrmsEmployee.name || 'Employee'}</p>
                              <p className="text-xs text-gray-600 truncate">
                                ID: <strong className="text-indigo-700">{selectedHrmsEmployee.employeeId || 'N/A'}</strong>
                                {selectedHrmsEmployee.department ? ` • ${selectedHrmsEmployee.department}` : ''}
                                {selectedHrmsEmployee.designation ? ` • ${selectedHrmsEmployee.designation}` : ''}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {selectedHrmsEmployee.linkType === 'user' ? 'Uses HRMS user password' : 'Uses HRMS employee password'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={clearHrmsSelection}
                              className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={hrmsSearchQuery}
                              onChange={(e) => setHrmsSearchQuery(e.target.value)}
                              placeholder="Search HRMS by emp ID, name, email, phone..."
                              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {hrmsSearching && (
                              <p className="text-xs text-indigo-600 mt-1 animate-pulse">Searching HRMS database...</p>
                            )}
                            {hrmsSearchResults.length > 0 && (
                              <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-y-auto">
                                {hrmsSearchResults.map((emp) => (
                                  <button
                                    key={`${emp.linkType}_${emp.recordId}`}
                                    type="button"
                                    onClick={() => handleSelectHrmsEmployee(emp)}
                                    className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-sm font-medium text-gray-900">{emp.name || 'Unknown'}</p>
                                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                        emp.linkType === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                      }`}>
                                        {emp.label || (emp.linkType === 'user' ? 'User' : 'Employee')}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      ID: {emp.employeeId || 'N/A'}{emp.department ? ` • ${emp.department}` : ''}{emp.designation ? ` • ${emp.designation}` : ''}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-[11px] text-indigo-700">
                          {showAddModal
                            ? 'Users authenticate using their HRMS ID and HRMS password.'
                            : 'Select corresponding HRMS record if changing account link.'}
                        </p>
                      </div>

                      {/* Legacy credentials if editing non-HRMS user */}
                      {showEditModal && !selectedAdmin?.usesHrmsAuth && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleFormChange}
                              required
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Password <span className="text-gray-400 text-[10px]">(leave blank to keep)</span>
                            </label>
                            <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleFormChange}
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* 2. College Selection (Multi-select) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-800">
                              Assigned Colleges <span className="text-red-500">*</span>
                            </label>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              formData.assignedCollegeIds?.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {formData.assignedCollegeIds?.length || 0} selected
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <button
                              type="button"
                              onClick={handleSelectAllColleges}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Select All
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              type="button"
                              onClick={handleClearAllColleges}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* College search filter if multiple colleges */}
                        {colleges.length > 4 && (
                          <div className="relative">
                            <input
                              type="text"
                              value={userCollegeSearchQuery}
                              onChange={(e) => setUserCollegeSearchQuery(e.target.value)}
                              placeholder="Filter colleges..."
                              className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        {/* Selected colleges badge pills */}
                        {formData.assignedCollegeIds?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 p-2 bg-blue-50/50 rounded-lg border border-blue-100 max-h-24 overflow-y-auto">
                            {formData.assignedCollegeIds.map(id => {
                              const col = colleges.find(c => Number(c.id) === Number(id));
                              return (
                                <span
                                  key={id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-white text-blue-800 border border-blue-200 shadow-2xs"
                                >
                                  <span>{col?.code || col?.name || `College ${id}`}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUserCollegeToggle(id)}
                                    className="text-blue-400 hover:text-red-500 font-bold ml-0.5"
                                    title="Remove"
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* College options list */}
                        <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100 bg-white">
                          {colleges
                            .filter(c => {
                              if (!userCollegeSearchQuery) return true;
                              const q = userCollegeSearchQuery.toLowerCase();
                              return (
                                (c.name && c.name.toLowerCase().includes(q)) ||
                                (c.code && c.code.toLowerCase().includes(q))
                              );
                            })
                            .map(college => {
                              const isChecked = formData.assignedCollegeIds?.includes(Number(college.id));
                              return (
                                <label
                                  key={college.id}
                                  className={`flex items-center gap-3 p-2.5 cursor-pointer transition-colors ${
                                    isChecked ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleUserCollegeToggle(college.id)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900 truncate">{college.name}</span>
                                      {college.code && (
                                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono font-semibold shrink-0">
                                          {college.code}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          {colleges.length === 0 && (
                            <div className="p-4 text-center text-xs text-gray-500">No colleges available</div>
                          )}
                        </div>
                        {(!formData.assignedCollegeIds || formData.assignedCollegeIds.length === 0) && (
                          <p className="text-xs text-amber-600 font-medium">
                            ⚠️ Select at least one college to configure Courses & Branches in Card 2.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* CARD 2: Branch and Course Selection (Academic Scope) */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 flex flex-col">
                      {/* Card 2 Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${
                            formData.assignedCollegeIds?.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'
                          }`}>
                            2
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">Branch & Course Scope</h3>
                            <p className="text-xs text-gray-500">
                              {formData.assignedCollegeIds?.length > 0
                                ? `Filtering student access for ${formData.assignedCollegeIds.length} college${formData.assignedCollegeIds.length > 1 ? 's' : ''}`
                                : 'Pending college selection'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          formData.assignedCollegeIds?.length > 0
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            : 'bg-gray-100 text-gray-400 border-gray-200'
                        }`}>
                          Card 2
                        </span>
                      </div>

                      {/* Card 2 Body */}
                      {(!formData.assignedCollegeIds || formData.assignedCollegeIds.length === 0) ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-500 flex items-center justify-center mb-3 shadow-inner">
                            <AcademicCapIcon className="w-7 h-7" />
                          </div>
                          <h4 className="text-base font-semibold text-gray-800 mb-1">Select Colleges in Card 1</h4>
                          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                            Select one or more colleges on the left to configure branch and course restrictions for this user.
                          </p>
                          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-medium text-gray-600 shadow-2xs">
                            <span>👈 Select College in Card 1 first</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-lg flex items-center justify-between text-xs text-indigo-900">
                            <span className="font-medium">
                              Students in portal will be strictly limited to these branches and courses.
                            </span>
                            <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                              {formData.assignedCollegeIds.length} College{formData.assignedCollegeIds.length > 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* List of College Scopes */}
                          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                            {formData.assignedCollegeIds.map(cId => {
                              const collegeId = Number(cId);
                              const col = colleges.find(c => Number(c.id) === collegeId);
                              if (!col) return null;

                              const scope = (formData.assignedCollegeScopes || []).find(s => Number(s.collegeId) === collegeId) || { collegeId, courses: [], branches: [] };
                              const colCourses = courses.filter(c => Number(c.college?.id) === collegeId);
                              const isNoneCourses = scope.courses && scope.courses.length === 1 && scope.courses[0] === '__NONE__';
                              const isAllCourses = !isNoneCourses && (!scope.courses || scope.courses.length === 0);
                              const selectedCourses = isNoneCourses ? [] : (isAllCourses ? colCourses.map(c => c.name) : scope.courses);

                              const colBranches = branches.filter(b => {
                                const bColId = Number(b.college?.id);
                                const bCourse = b.courseName || b.course?.name || b.course;
                                return (bColId === collegeId || !bColId) && selectedCourses.includes(bCourse);
                              });
                              const isNoneBranches = scope.branches && scope.branches.length === 1 && scope.branches[0] === '__NONE__';
                              const isAllBranches = !isNoneBranches && (!scope.branches || scope.branches.length === 0);
                              const selectedBranches = isNoneBranches ? [] : (isAllBranches ? colBranches.map(b => b.name) : scope.branches);

                              return (
                                <div
                                  key={collegeId}
                                  className="border border-indigo-100 rounded-xl overflow-hidden bg-white shadow-2xs"
                                >
                                  {/* College Header */}
                                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-white border-b border-indigo-100">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                        {col.code || 'CLG'}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-gray-900 truncate">
                                          {col.name}
                                        </div>
                                        <div className="text-[10px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                                          <span className={`px-1.5 py-0.2 rounded font-medium ${
                                            isAllCourses ? 'bg-blue-100/70 text-blue-700' : (isNoneCourses ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700')
                                          }`}>
                                            {isAllCourses ? `All Courses (${colCourses.length})` : (isNoneCourses ? 'No Courses' : `${scope.courses.length} Course${scope.courses.length > 1 ? 's' : ''}`)}
                                          </span>
                                          <span>•</span>
                                          <span className={`px-1.5 py-0.2 rounded font-medium ${
                                            isAllBranches ? 'bg-indigo-100/70 text-indigo-700' : (isNoneBranches ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700')
                                          }`}>
                                            {isAllBranches ? `All Branches (${colBranches.length})` : (isNoneBranches ? 'No Branches' : `${scope.branches.length} Branch${scope.branches.length > 1 ? 'es' : ''}`)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Courses & Branches Config */}
                                  <div className="p-3 bg-slate-50/50 space-y-3">
                                    {/* Course Selection */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                          <AcademicCapIcon className="w-3.5 h-3.5 text-blue-600" />
                                          Courses ({colCourses.length})
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleSelectAllCollegeCourses(collegeId)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                              isAllCourses
                                                ? 'bg-blue-600 text-white shadow-2xs'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                          >
                                            All
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleClearCollegeCourses(collegeId)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                              isNoneCourses
                                                ? 'bg-rose-600 text-white shadow-2xs'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                          >
                                            Clear
                                          </button>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-1.5 pt-1">
                                        {colCourses.map(course => {
                                          const isSelected = selectedCourses.includes(course.name);
                                          return (
                                            <button
                                              key={course._id || course.name}
                                              type="button"
                                              onClick={() => handleToggleCollegeCourse(collegeId, course.name, colCourses)}
                                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                                isSelected
                                                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50 opacity-60'
                                              }`}
                                            >
                                              {isSelected ? (
                                                <CheckIcon className="w-3 h-3" />
                                              ) : (
                                                <PlusIcon className="w-3 h-3" />
                                              )}
                                              <span>{course.name}</span>
                                            </button>
                                          );
                                        })}
                                        {colCourses.length === 0 && (
                                          <span className="text-xs text-gray-400 italic">No courses found for this college</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Branch Selection */}
                                    <div className="space-y-1.5 pt-2.5 border-t border-gray-200/70">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                          <Squares2X2Icon className="w-3.5 h-3.5 text-indigo-600" />
                                          Branches ({colBranches.length})
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleSelectAllCollegeBranches(collegeId)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                              isAllBranches
                                                ? 'bg-indigo-600 text-white shadow-2xs'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                          >
                                            All
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleClearCollegeBranches(collegeId)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                              isNoneBranches
                                                ? 'bg-rose-600 text-white shadow-2xs'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                          >
                                            Clear
                                          </button>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1.5 bg-white border border-gray-200 rounded-lg">
                                        {colBranches.map(branch => {
                                          const isSelected = selectedBranches.includes(branch.name);
                                          return (
                                            <button
                                              key={branch._id || branch.name}
                                              type="button"
                                              onClick={() => handleToggleCollegeBranch(collegeId, branch.name, colBranches)}
                                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all ${
                                                isSelected
                                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50 opacity-60'
                                              }`}
                                            >
                                              {isSelected ? (
                                                <CheckIcon className="w-3 h-3" />
                                              ) : (
                                                <PlusIcon className="w-3 h-3" />
                                              )}
                                              <span>{branch.name}</span>
                                              {branch.courseName && (
                                                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                                                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                  {branch.courseName}
                                                </span>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {colBranches.length === 0 && (
                                          <span className="text-xs text-gray-400 italic p-1">
                                            {colCourses.length === 0 ? 'No branches available' : 'Select at least one course above to see branches'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 1 Navigation Footer */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToPermissions}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center gap-2 shadow-sm transition-all"
                    >
                      <span>Next: Permissions & Access Control</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* STEP 2: PERMISSIONS & ROLE */
                <div className="space-y-4">
                  {/* Summary Scope Banner */}
                  <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 border border-blue-200/80 rounded-xl p-3 sm:p-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-gray-900">
                            {formData.name || selectedHrmsEmployee?.name || formData.username || 'User'}
                          </span>
                          {(formData.employeeId || selectedHrmsEmployee?.employeeId) && (
                            <span className="px-2 py-0.5 bg-white text-indigo-700 border border-indigo-200 rounded text-xs font-mono font-semibold">
                              ID: {formData.employeeId || selectedHrmsEmployee?.employeeId}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[11px] font-semibold">
                            Step 2: Permissions & Role
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-600">
                          <span className="font-semibold text-gray-700">Active Colleges:</span>
                          {formData.assignedCollegeIds?.map(id => {
                            const col = colleges.find(c => Number(c.id) === Number(id));
                            return (
                              <span key={id} className="px-2 py-0.5 bg-white text-blue-800 border border-blue-200 rounded text-[11px] font-semibold shadow-2xs">
                                {col?.code || col?.name || id}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setUserModalStep(1)}
                        className="self-start sm:self-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                      >
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                        <span>Edit Colleges & Scope</span>
                      </button>
                    </div>
                  </div>

                  {/* 2-Column Grid for Step 2 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
                    {/* COLUMN 1: Role Mode */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 lg:col-span-1">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shadow-sm">
                            3
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">Role Mode</h3>
                            <p className="text-[11px] text-gray-500">Access assignment mode</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <label className={`flex items-start gap-2.5 p-3 border rounded-xl cursor-pointer transition-all ${
                          roleType === 'sub_admin' ? 'border-blue-500 bg-blue-50/50 shadow-2xs ring-1 ring-blue-500/20' : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="userRoleType"
                            value="sub_admin"
                            checked={roleType === 'sub_admin'}
                            onChange={() => {
                              setRoleType('sub_admin');
                              setFormData(prev => ({ ...prev, customRoleId: '' }));
                            }}
                            className="w-4 h-4 text-blue-600 mt-0.5"
                          />
                          <div>
                            <div className="text-xs font-bold text-gray-900">User</div>
                            <div className="text-[11px] text-gray-500">Configure custom granular permissions</div>
                          </div>
                        </label>

                        <label className={`flex items-start gap-2.5 p-3 border rounded-xl cursor-pointer transition-all ${
                          roleType === 'custom' ? 'border-purple-500 bg-purple-50/50 shadow-2xs ring-1 ring-purple-500/20' : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="userRoleType"
                            value="custom"
                            checked={roleType === 'custom'}
                            onChange={() => {
                              setRoleType('custom');
                              setFormData(prev => ({
                                ...prev,
                                permissions: [],
                                permissionAccessLevels: {},
                                leaveManagementCourses: []
                              }));
                            }}
                            className="w-4 h-4 text-purple-600 mt-0.5"
                          />
                          <div>
                            <div className="text-xs font-bold text-gray-900">Custom Role</div>
                            <div className="text-[11px] text-gray-500">Apply a predefined role template</div>
                          </div>
                        </label>
                      </div>

                      {roleType === 'custom' && (
                        <div className="pt-2 border-t border-gray-100">
                          <label className="text-xs font-semibold text-gray-700 block mb-1.5">Select Role Template *</label>
                          <select
                            name="customRoleId"
                            value={formData.customRoleId}
                            onChange={handleFormChange}
                            required
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">-- Choose a Custom Role --</option>
                            {customRoles.filter(r => r.isActive).map(r => (
                              <option key={r._id} value={r._id}>{r.name} - {r.description}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <KeyIcon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Authentication</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          User will sign in with their HRMS employee ID and HRMS employee password.
                        </p>
                      </div>
                    </div>

                    {/* COLUMN 2: Permissions & Access Control */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 lg:col-span-2">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shadow-sm">
                            4
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">Permissions & Access Control</h3>
                            <p className="text-[11px] text-gray-500">
                              Grant module read/write privileges
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                          Card Permissions
                        </span>
                      </div>

                      {roleType === 'custom' ? (
                        // Custom Role Preview
                        <div className="space-y-3">
                          {(() => {
                            const role = customRoles.find(r => r._id === formData.customRoleId);
                            if (!role) {
                              return (
                                <div className="p-8 text-center text-xs text-gray-500 border border-gray-200 rounded-lg">
                                  Please choose a custom role in the left panel to preview its permissions.
                                </div>
                              );
                            }
                            return (
                              <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl space-y-3">
                                <div>
                                  <div className="text-sm font-semibold text-purple-900">{role.name}</div>
                                  <p className="text-xs text-purple-700 mt-0.5">{role.description}</p>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-purple-800 mb-2">Inherited Permissions ({role.permissions?.length || 0}):</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {role.permissions?.map(perm => (
                                      <span key={perm} className="px-2 py-1 bg-white border border-purple-200 text-purple-800 rounded-md text-xs font-medium">
                                        {PERMISSIONS.find(p => p.id === perm)?.label || perm}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        // Active Permissions configuration
                        <div className="space-y-3">
                          {/* Quick Actions Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-purple-50/60 border border-purple-100 rounded-lg">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-semibold text-purple-900 uppercase">Scope:</span>
                              {formData.assignedCollegeIds.map(id => {
                                const col = colleges.find(c => Number(c.id) === Number(id));
                                return (
                                  <span key={id} className="px-1.5 py-0.5 bg-white text-purple-700 border border-purple-200 rounded text-[11px] font-semibold">
                                    {col?.code || col?.name || id}
                                  </span>
                                );
                              })}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={handleSelectAllPermissions}
                                className="text-purple-700 hover:text-purple-900 font-medium"
                              >
                                Select All
                              </button>
                              <span className="text-purple-200">|</span>
                              <button
                                type="button"
                                onClick={handleClearAllPermissions}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>

                          {/* Permissions list */}
                          <div className="max-h-[460px] overflow-y-auto space-y-2.5 pr-1">
                            {PERMISSIONS.map(permission => {
                              const isSelected = formData.permissions.includes(permission.id);
                              return (
                                <div
                                  key={permission.id}
                                  className={`border rounded-lg p-3 transition-all ${
                                    isSelected ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200 hover:bg-gray-50/70'
                                  }`}
                                >
                                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      value={permission.id}
                                      checked={isSelected}
                                      onChange={handleFormChange}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    {getPermissionIcon(permission.id)}
                                    <span className="text-sm font-medium text-gray-800">{permission.label}</span>
                                  </label>

                                  {/* Access Level Selector if checked */}
                                  {isSelected && (
                                    permission.id === 'staff_guests_management' ? (
                                      <StaffGuestsAccessSelector
                                        accessLevels={formData.permissionAccessLevels}
                                        onAccessLevelChange={handleAccessLevelChange}
                                      />
                                    ) : (
                                      <div className="mt-2.5 ml-6 p-2 bg-blue-50/80 rounded-lg flex items-center justify-between">
                                        <span className="text-xs font-medium text-blue-800">Access Level:</span>
                                        <div className="flex items-center gap-3">
                                          <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                              type="radio"
                                              name={`access_${permission.id}`}
                                              value="view"
                                              checked={formData.permissionAccessLevels[permission.id] === 'view'}
                                              onChange={() => handleAccessLevelChange(permission.id, 'view')}
                                              className="w-3 h-3 text-blue-600"
                                            />
                                            <span className="text-xs text-blue-700">View (Read)</span>
                                          </label>
                                          <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                              type="radio"
                                              name={`access_${permission.id}`}
                                              value="full"
                                              checked={formData.permissionAccessLevels[permission.id] === 'full'}
                                              onChange={() => handleAccessLevelChange(permission.id, 'full')}
                                              className="w-3 h-3 text-blue-600"
                                            />
                                            <span className="text-xs text-blue-700 font-medium">Full (Write)</span>
                                          </label>
                                        </div>
                                      </div>
                                    )
                                  )}

                                  {/* Scoped Course selection for Leave Management */}
                                  {permission.id === 'leave_management' && isSelected && (
                                    <div className="mt-2.5 ml-6 p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg space-y-2">
                                      {(() => {
                                        // Filter courses belonging to the selected colleges
                                        const relevantCourses = courses.filter(c => {
                                          if (!c) return false;
                                          const cCollegeId = c.college?.id != null ? Number(c.college.id) : (c.college != null ? Number(c.college) : null);
                                          return cCollegeId && formData.assignedCollegeIds.includes(cCollegeId);
                                        });

                                        const displayCourses = relevantCourses.length > 0 ? relevantCourses : courses;

                                        return (
                                          <>
                                            <div className="flex items-center justify-between">
                                              <label className="text-xs font-semibold text-indigo-900">
                                                Courses for Leave Management
                                                {relevantCourses.length > 0 && (
                                                  <span className="ml-1 text-[11px] font-normal text-indigo-700">
                                                    (Scoped to selected colleges: {relevantCourses.length})
                                                  </span>
                                                )}
                                              </label>
                                              <div className="flex items-center gap-2 text-[11px]">
                                                <button
                                                  type="button"
                                                  onClick={() => handleSelectAllScopedCourses(displayCourses)}
                                                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                  Select All
                                                </button>
                                                <span className="text-indigo-200">|</span>
                                                <button
                                                  type="button"
                                                  onClick={handleClearScopedCourses}
                                                  className="text-gray-500 hover:text-gray-700"
                                                >
                                                  Clear
                                                </button>
                                              </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                                              {displayCourses.length > 0 ? (
                                                displayCourses.map(course => {
                                                  const isCourseChecked = formData.leaveManagementCourses.includes(course.name);
                                                  const col = colleges.find(c => Number(c.id) === Number(course.college?.id || course.college));
                                                  return (
                                                    <label
                                                      key={course._id}
                                                      className={`flex items-center gap-2 p-1.5 rounded border text-xs cursor-pointer ${
                                                        isCourseChecked ? 'bg-white border-indigo-300 text-indigo-900 shadow-2xs' : 'bg-transparent border-transparent hover:bg-white text-gray-700'
                                                      }`}
                                                    >
                                                      <input
                                                        type="checkbox"
                                                        checked={isCourseChecked}
                                                        onChange={(e) => handleCourseSelection(course.name, e.target.checked)}
                                                        className="w-3.5 h-3.5 text-indigo-600 rounded"
                                                      />
                                                      <span className="truncate flex-1 font-medium">{course.name}</span>
                                                      {col && (
                                                        <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-100 text-indigo-700 shrink-0 font-mono">
                                                          {col.code || col.name}
                                                        </span>
                                                      )}
                                                    </label>
                                                  );
                                                })
                                              ) : (
                                                <p className="text-xs text-indigo-600 col-span-2">No courses available for selected colleges</p>
                                              )}
                                            </div>
                                            {formData.leaveManagementCourses.length === 0 && (
                                              <p className="text-[11px] text-red-600">Please select at least one course for leave management.</p>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2 Navigation Footer */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setUserModalStep(1)}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      <span>Back to Colleges & Branches</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <CheckIcon className="w-4 h-4" />
                        <span>{showAddModal ? 'Create User' : 'Update User'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
                  /* WARDEN & PRINCIPAL SECTIONS */
                  <>
                    {/* HRMS Employee Search */}
                    <div className="p-3 sm:p-4 bg-indigo-50 border border-indigo-100 rounded-lg space-y-3">
                      <label className="block text-sm font-medium text-indigo-900">
                        Link HRMS Record (shows Employee and User separately)
                      </label>
                      {selectedHrmsEmployee ? (
                        <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900">{selectedHrmsEmployee.name || 'Employee'}</p>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${selectedHrmsEmployee.linkType === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                {selectedHrmsEmployee.label || (selectedHrmsEmployee.linkType === 'user' ? 'User Account' : 'Employee Record')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              ID: {selectedHrmsEmployee.employeeId || 'N/A'}
                              {selectedHrmsEmployee.linkType === 'user' ? ' • Uses HRMS user password' : ' • Uses HRMS employee password'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={clearHrmsSelection}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Clear
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={hrmsSearchQuery}
                            onChange={(e) => setHrmsSearchQuery(e.target.value)}
                            placeholder="Search by employee ID, name, email, or phone..."
                            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          {hrmsSearching && (
                            <p className="text-xs text-indigo-600 mt-1">Searching HRMS database...</p>
                          )}
                          {hrmsSearchResults.length > 0 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                              {hrmsSearchResults.map((emp) => (
                                <button
                                  key={`${emp.linkType}_${emp.recordId}`}
                                  type="button"
                                  onClick={() => handleSelectHrmsEmployee(emp)}
                                  className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium text-gray-900">{emp.name || 'Unknown'}</p>
                                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold ${emp.linkType === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {emp.label || (emp.linkType === 'user' ? 'User Account' : 'Employee Record')}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {emp.employeeId ? `ID: ${emp.employeeId}` : 'No employee ID'}
                                    {emp.department ? ` • ${emp.department}` : ''}
                                    {emp.designation ? ` • ${emp.designation}` : ''}
                                  </p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Principal Specific Two-Column Layout */}
                    {isPrincipalTab && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* LEFT COLUMN: Credentials & Email & Preview */}
                        <div className="space-y-4">
                          {showEditModal && !selectedAdmin?.usesHrmsAuth && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                <input
                                  type="text"
                                  name="username"
                                  value={formData.username}
                                  onChange={handleFormChange}
                                  required
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter username"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Password <span className="text-gray-500 text-xs">(leave blank to keep)</span>
                                </label>
                                <input
                                  type="password"
                                  name="password"
                                  value={formData.password}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter new password"
                                />
                              </div>
                            </>
                          )}

                          {/* Principal Email */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email Address <span className="text-gray-500 text-xs">(Optional)</span>
                              </div>
                            </label>
                            <input
                              type="email"
                              name="principalEmail"
                              value={formData.principalEmail}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter principal's email"
                            />
                          </div>

                          {/* Course Preview */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assigned Courses Preview
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto space-y-3">
                              {(() => {
                                if (!formData.assignedCollegeIds || formData.assignedCollegeIds.length === 0) {
                                  return <p className="text-xs text-gray-500 italic">Select at least one college to see courses</p>;
                                }

                                const relevantCourses = courses.filter(course =>
                                  course.college && formData.assignedCollegeIds.includes(course.college.id)
                                );

                                if (relevantCourses.length === 0) {
                                  return <p className="text-xs text-gray-500 italic">No courses found for the selected colleges.</p>;
                                }

                                const coursesByCollege = relevantCourses.reduce((acc, course) => {
                                  const collegeName = course.college.name;
                                  if (!acc[collegeName]) acc[collegeName] = [];
                                  acc[collegeName].push(course);
                                  return acc;
                                }, {});

                                return Object.entries(coursesByCollege).map(([collegeName, collegeCourses]) => (
                                  <div key={collegeName}>
                                    <div className="text-xs font-semibold text-gray-800 mb-1">{collegeName}</div>
                                    <div className="flex flex-wrap gap-2">
                                      {collegeCourses.filter(c => {
                                        const scope = formData.assignedCollegeScopes.find(item => Number(item.collegeId) === Number(c.college.id));
                                        return scope?.levels.some(level => c.level && c.level.toLowerCase() === level.toLowerCase());
                                      }).map(course => (
                                        <span key={course._id} className="inline-flex items-center px-2 py-1 bg-white border border-indigo-100 text-indigo-700 rounded-md text-xs font-medium shadow-sm gap-1">
                                          {course.name}
                                          {course.level && (
                                            <span className="px-1 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] rounded uppercase ml-1">
                                              {course.level}
                                            </span>
                                          )}
                                        </span>
                                      ))}
                                      {collegeCourses.filter(c => {
                                        const scope = formData.assignedCollegeScopes.find(item => Number(item.collegeId) === Number(c.college.id));
                                        return scope?.levels.some(level => c.level && c.level.toLowerCase() === level.toLowerCase());
                                      }).length === 0 && (
                                        <span className="text-xs text-gray-400 italic">No courses match selected levels</span>
                                      )}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Configuration (Builder Pattern) */}
                        <div className="space-y-6">
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Assign New College
                            </h3>

                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Select College</label>
                              <select
                                value={selectedCollegeToAdd}
                                onChange={(e) => setSelectedCollegeToAdd(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              >
                                <option value="">-- Choose a College --</option>
                                {colleges
                                  .filter(c => !formData.assignedCollegeIds?.includes(c.id))
                                  .map(college => (
                                    <option key={college.id} value={college.id}>
                                      {college.name}
                                    </option>
                                  ))}
                              </select>
                            </div>

                            {selectedCollegeToAdd && (
                              <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Select Levels</label>
                                <div className="flex gap-2">
                                  {['diploma', 'ug', 'pg'].map(level => (
                                    <label key={level} className="flex-1 flex items-center justify-center gap-2 p-2 border border-gray-200 bg-white rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition-all">
                                      <input
                                        type="checkbox"
                                        checked={selectedLevelsToAdd.includes(level)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedLevelsToAdd(prev => [...prev, level]);
                                          } else {
                                            setSelectedLevelsToAdd(prev => prev.filter(l => l !== level));
                                          }
                                        }}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                      />
                                      <span className="text-xs font-medium text-gray-700 uppercase">{level}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={handleAddCollegeToPrincipal}
                              disabled={!selectedCollegeToAdd || selectedLevelsToAdd.length === 0}
                              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                !selectedCollegeToAdd || selectedLevelsToAdd.length === 0
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                              }`}
                            >
                              <span className="text-lg leading-none">+</span> Add College
                            </button>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assigned Colleges ({formData.assignedCollegeIds?.length || 0})
                            </label>

                            {(!formData.assignedCollegeIds || formData.assignedCollegeIds.length === 0) ? (
                              <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                                No colleges assigned yet. Use the form above to add one.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {formData.assignedCollegeIds.map(id => {
                                  const college = colleges.find(c => c.id === id);
                                  return (
                                    <div key={id} className="flex items-center justify-between p-3 bg-white border border-purple-100 rounded-lg shadow-sm">
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">{college?.name || 'Unknown College'}</div>
                                        <div className="flex gap-1 mt-1">
                                          {(formData.assignedCollegeScopes.find(scope => Number(scope.collegeId) === Number(id))?.levels || []).map(level => (
                                            <span key={level} className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100 uppercase font-medium">
                                              {level}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFormData(prev => ({
                                            ...prev,
                                            assignedCollegeIds: prev.assignedCollegeIds.filter(cid => Number(cid) !== Number(id)),
                                            assignedCollegeScopes: prev.assignedCollegeScopes.filter(scope => Number(scope.collegeId) !== Number(id)),
                                            assignedLevels: [...new Set(prev.assignedCollegeScopes
                                              .filter(scope => Number(scope.collegeId) !== Number(id))
                                              .flatMap(scope => scope.levels))]
                                          }));
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove College"
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Warden Specific Section */}
                    {isWardenTab && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <h3 className="text-sm font-medium mb-1">Warden Permissions</h3>
                          <p className="text-xs text-gray-700">
                            Wardens have access to student oversight, complaint management, leave approval, room monitoring, announcements, discipline management, and attendance tracking.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assigned Hostel <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="assignedHostelId"
                              value={formData.assignedHostelId}
                              onChange={handleFormChange}
                              required={isWardenTab}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Hostel</option>
                              {hostels.map((hostel) => (
                                <option key={hostel._id} value={hostel._id}>
                                  {hostel.name}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              Warden will only see students and rooms for this hostel.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab !== 'sub-admins' && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
                    >
                      <CheckIcon className="w-4 h-4" />
                      {showAddModal
                        ? `Add ${isWardenTab ? 'Warden' : 'Principal'}`
                        : `Update ${isWardenTab ? 'Warden' : 'Principal'}`}
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Role Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-5xl sm:max-w-6xl mx-2 sm:mx-4 max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-gray-100 mb-4 sm:mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg shadow-sm">
                    <ShieldCheckIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                      {selectedRole ? 'Edit Custom Role' : 'Create Custom Role'}
                    </h2>
                    <p className="text-xs text-gray-500">Configure role identity, academic college scope, and permission levels</p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Stepper Header */}
              <div className="mb-5 sm:mb-6 px-1">
                <div className="flex items-center justify-between max-w-xl mx-auto">
                  {/* Step 1 Pill */}
                  <div
                    onClick={() => setRoleModalStep(1)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                      roleModalStep === 1
                        ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      roleModalStep === 1 ? 'bg-white text-purple-600' : 'bg-gray-200 text-gray-700'
                    }`}>
                      1
                    </span>
                    <span>Role Identity & Scope</span>
                  </div>

                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${roleModalStep === 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />

                  {/* Step 2 Pill */}
                  <div
                    onClick={() => {
                      if (roleFormData.name?.trim() && roleFormData.assignedCollegeIds?.length > 0) {
                        setRoleModalStep(2);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      roleModalStep === 2
                        ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      roleModalStep === 2 ? 'bg-white text-purple-600' : 'bg-gray-200 text-gray-700'
                    }`}>
                      2
                    </span>
                    <span>Permissions & Access</span>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={selectedRole ? handleUpdateRole : handleCreateRole} className="space-y-4">
                {roleModalStep === 1 ? (
                  /* STEP 1: CARD 1 & CARD 2 */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
                      {/* CARD 1: Role Information & College Selection */}
                      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shadow-sm">
                              1
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Role Info & Colleges</h3>
                              <p className="text-xs text-gray-500">Define role identity & link colleges</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                            Card 1
                          </span>
                        </div>

                        {/* Name & Description */}
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                              Role Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={roleFormData.name}
                              onChange={handleRoleFormChange}
                              required
                              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="e.g. Campus Officer, Academic Coordinator"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              name="description"
                              value={roleFormData.description}
                              onChange={handleRoleFormChange}
                              rows="2"
                              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Brief description of this custom role..."
                            />
                          </div>
                        </div>

                        {/* College Selection */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                              <BuildingOffice2Icon className="w-4 h-4 text-purple-600" />
                              Assigned Colleges <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={handleRoleSelectAllColleges}
                                className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2 py-0.5 rounded hover:bg-purple-50"
                              >
                                Select All
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                type="button"
                                onClick={handleRoleClearAllColleges}
                                className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-0.5 rounded hover:bg-gray-100"
                              >
                                Clear
                              </button>
                            </div>
                          </div>

                          {/* College Search input */}
                          <div className="relative">
                            <input
                              type="text"
                              value={roleCollegeSearchQuery}
                              onChange={(e) => setRoleCollegeSearchQuery(e.target.value)}
                              placeholder="Search colleges..."
                              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-purple-500"
                            />
                            <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                          </div>

                          {/* Selected Colleges Pills */}
                          {roleFormData.assignedCollegeIds?.length > 0 && (
                            <div className="flex flex-wrap gap-1 p-2 bg-purple-50/50 rounded-lg border border-purple-100 max-h-24 overflow-y-auto">
                              {roleFormData.assignedCollegeIds.map(id => {
                                const col = colleges.find(c => Number(c.id) === Number(id));
                                return (
                                  <span
                                    key={id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-purple-200 text-purple-800 rounded text-xs font-medium shadow-2xs"
                                  >
                                    <span className="truncate max-w-[140px]">{col?.name || `College ${id}`}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRoleCollegeToggle(id)}
                                      className="text-purple-400 hover:text-purple-700 ml-0.5"
                                    >
                                      ×
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {/* College Checkbox List */}
                          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-56 overflow-y-auto bg-white">
                            {colleges
                              .filter(c => {
                                if (!roleCollegeSearchQuery) return true;
                                const q = roleCollegeSearchQuery.toLowerCase();
                                return (
                                  (c.name && c.name.toLowerCase().includes(q)) ||
                                  (c.code && c.code.toLowerCase().includes(q))
                                );
                              })
                              .map(college => {
                                const isChecked = roleFormData.assignedCollegeIds?.includes(Number(college.id));
                                return (
                                  <label
                                    key={college.id}
                                    className={`flex items-center gap-3 p-2.5 cursor-pointer transition-colors ${
                                      isChecked ? 'bg-purple-50/60 hover:bg-purple-50' : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleRoleCollegeToggle(college.id)}
                                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900 truncate">{college.name}</span>
                                        {college.code && (
                                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono font-semibold shrink-0">
                                            {college.code}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            {colleges.length === 0 && (
                              <div className="p-4 text-center text-xs text-gray-500">No colleges available</div>
                            )}
                          </div>
                          {(!roleFormData.assignedCollegeIds || roleFormData.assignedCollegeIds.length === 0) && (
                            <p className="text-xs text-amber-600 font-medium">
                              ⚠️ Select at least one college to configure Courses & Branches in Card 2.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* CARD 2: Branch & Course Scope */}
                      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${
                              roleFormData.assignedCollegeIds?.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'
                            }`}>
                              2
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Branch & Course Scope</h3>
                              <p className="text-xs text-gray-500">
                                {roleFormData.assignedCollegeIds?.length > 0
                                  ? `Limiting scope for ${roleFormData.assignedCollegeIds.length} college${roleFormData.assignedCollegeIds.length > 1 ? 's' : ''}`
                                  : 'Pending college selection'}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            roleFormData.assignedCollegeIds?.length > 0
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                              : 'bg-gray-100 text-gray-400 border-gray-200'
                          }`}>
                            Card 2
                          </span>
                        </div>

                        {/* Card 2 Body */}
                        {(!roleFormData.assignedCollegeIds || roleFormData.assignedCollegeIds.length === 0) ? (
                          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-100 text-purple-600 flex items-center justify-center mb-3 shadow-inner">
                              <AcademicCapIcon className="w-7 h-7" />
                            </div>
                            <h4 className="text-base font-semibold text-gray-800 mb-1">Select Colleges in Card 1</h4>
                            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                              Select one or more colleges on the left to configure branch and course restrictions for this custom role.
                            </p>
                            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-medium text-gray-600 shadow-2xs">
                              <span>👈 Select College in Card 1 first</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-lg flex items-center justify-between text-xs text-indigo-900">
                              <span className="font-medium">
                                Users with this role will be strictly limited to these branches and courses.
                              </span>
                              <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                                {roleFormData.assignedCollegeIds.length} College{roleFormData.assignedCollegeIds.length > 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* List of College Scopes */}
                            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                              {roleFormData.assignedCollegeIds.map(cId => {
                                const collegeId = Number(cId);
                                const col = colleges.find(c => Number(c.id) === collegeId);
                                if (!col) return null;

                                const scope = (roleFormData.assignedCollegeScopes || []).find(s => Number(s.collegeId) === collegeId) || { collegeId, courses: [], branches: [] };
                                const colCourses = courses.filter(c => Number(c.college?.id) === collegeId);
                                const isNoneCourses = scope.courses && scope.courses.length === 1 && scope.courses[0] === '__NONE__';
                                const isAllCourses = !isNoneCourses && (!scope.courses || scope.courses.length === 0);
                                const selectedCourses = isNoneCourses ? [] : (isAllCourses ? colCourses.map(c => c.name) : scope.courses);

                                const colBranches = branches.filter(b => {
                                  const bColId = Number(b.college?.id);
                                  const bCourse = b.courseName || b.course?.name || b.course;
                                  return (bColId === collegeId || !bColId) && selectedCourses.includes(bCourse);
                                });
                                const isNoneBranches = scope.branches && scope.branches.length === 1 && scope.branches[0] === '__NONE__';
                                const isAllBranches = !isNoneBranches && (!scope.branches || scope.branches.length === 0);
                                const selectedBranches = isNoneBranches ? [] : (isAllBranches ? colBranches.map(b => b.name) : scope.branches);

                                return (
                                  <div key={collegeId} className="border border-gray-200 rounded-lg p-3 bg-gray-50/40 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-gray-900">{col.name}</span>
                                        {col.code && (
                                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-mono font-bold">
                                            {col.code}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Course Selection */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                          <AcademicCapIcon className="w-3.5 h-3.5 text-indigo-600" />
                                          Courses ({colCourses.length})
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleRoleSelectAllCollegeCourses(collegeId, colCourses.map(c => c.name))}
                                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                              isAllCourses
                                                ? 'bg-indigo-600 text-white shadow-2xs'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                          >
                                            All
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleRoleClearCollegeCourses(collegeId)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                              isNoneCourses
                                                ? 'bg-rose-600 text-white shadow-2xs'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                          >
                                            Clear
                                          </button>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1.5 bg-white border border-gray-200 rounded-lg">
                                        {colCourses.map(course => {
                                          const isSelected = selectedCourses.includes(course.name);
                                          return (
                                            <button
                                              key={course._id || course.name}
                                              type="button"
                                              onClick={() => handleRoleToggleCollegeCourse(collegeId, course.name, colCourses)}
                                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all ${
                                                isSelected
                                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50 opacity-60'
                                              }`}
                                            >
                                              {isSelected ? (
                                                <CheckIcon className="w-3 h-3" />
                                              ) : (
                                                <PlusIcon className="w-3 h-3" />
                                              )}
                                              <span>{course.name}</span>
                                            </button>
                                          );
                                        })}
                                        {colCourses.length === 0 && (
                                          <span className="text-xs text-gray-400 italic">No courses found for this college</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Branch Selection */}
                                    <div className="space-y-1.5 pt-2.5 border-t border-gray-200/70">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                          <Squares2X2Icon className="w-3.5 h-3.5 text-indigo-600" />
                                          Branches ({colBranches.length})
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleRoleSelectAllCollegeBranches(collegeId)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                              isAllBranches
                                                ? 'bg-indigo-600 text-white shadow-2xs'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                          >
                                            All
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleRoleClearCollegeBranches(collegeId)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                              isNoneBranches
                                                ? 'bg-rose-600 text-white shadow-2xs'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                          >
                                            Clear
                                          </button>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1.5 bg-white border border-gray-200 rounded-lg">
                                        {colBranches.map(branch => {
                                          const isSelected = selectedBranches.includes(branch.name);
                                          return (
                                            <button
                                              key={branch._id || branch.name}
                                              type="button"
                                              onClick={() => handleRoleToggleCollegeBranch(collegeId, branch.name, colBranches)}
                                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all ${
                                                isSelected
                                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50 opacity-60'
                                              }`}
                                            >
                                              {isSelected ? (
                                                <CheckIcon className="w-3 h-3" />
                                              ) : (
                                                <PlusIcon className="w-3 h-3" />
                                              )}
                                              <span>{branch.name}</span>
                                              {branch.courseName && (
                                                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                                                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                  {branch.courseName}
                                                </span>
                                              )}
                                            </button>
                                          );
                                        })}
                                        {colBranches.length === 0 && (
                                          <span className="text-xs text-gray-400 italic p-1">
                                            {colCourses.length === 0 ? 'No branches available' : 'Select at least one course above to see branches'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 1 Navigation Footer */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleProceedToRolePermissions}
                        className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm flex items-center gap-2 shadow-sm transition-all"
                      >
                        <span>Next: Permissions & Access Control</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STEP 2: PERMISSIONS & ACCESS CONTROL */
                  <div className="space-y-4">
                    {/* Summary Scope Banner */}
                    <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-xl p-3 sm:p-4 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-900">{roleFormData.name || 'Custom Role'}</span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[11px] font-semibold">
                              Step 2: Permissions & Access Control
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-600">
                            <span className="font-semibold text-gray-700">Scoped Colleges:</span>
                            {roleFormData.assignedCollegeIds?.map(id => {
                              const col = colleges.find(c => Number(c.id) === Number(id));
                              return (
                                <span key={id} className="px-2 py-0.5 bg-white text-purple-800 border border-purple-200 rounded text-[11px] font-semibold shadow-2xs">
                                  {col?.code || col?.name || id}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setRoleModalStep(1)}
                          className="self-start sm:self-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                        >
                          <ArrowLeftIcon className="w-3.5 h-3.5" />
                          <span>Edit Scope & Colleges</span>
                        </button>
                      </div>
                    </div>

                    {/* Permissions Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Permissions & Access Levels</h3>
                          <p className="text-xs text-gray-500">Toggle permissions and choose View vs Full access</p>
                        </div>
                        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                          {roleFormData.permissions.length} Selected
                        </span>
                      </div>

                      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                        {PERMISSIONS.map(permission => (
                          <div key={permission.id} className="p-3 bg-gray-50/70 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={permission.id}
                                  checked={roleFormData.permissions.includes(permission.id)}
                                  onChange={handleRoleFormChange}
                                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-800">{permission.label}</span>
                              </label>

                              {/* Access Level Selector */}
                              {roleFormData.permissions.includes(permission.id) && (
                                permission.id === 'staff_guests_management' ? (
                                  <StaffGuestsAccessSelector
                                    accessLevels={roleFormData.permissionAccessLevels || {}}
                                    onAccessLevelChange={handleRoleAccessLevelChange}
                                  />
                                ) : (
                                  <AccessLevelSelector
                                    permissionId={permission.id}
                                    permissionLabel={permission.label}
                                    accessLevel={(roleFormData.permissionAccessLevels && roleFormData.permissionAccessLevels[permission.id]) || 'view'}
                                    onAccessLevelChange={handleRoleAccessLevelChange}
                                    disabled={false}
                                  />
                                )
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 2 Navigation Footer */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoleModalStep(1)}
                          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium flex items-center gap-1.5"
                        >
                          <ArrowLeftIcon className="w-3.5 h-3.5" />
                          <span>Back to Scope</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm flex items-center gap-2 shadow-sm transition-all"
                      >
                        <CheckIcon className="w-4 h-4" />
                        <span>{selectedRole ? 'Update Custom Role' : 'Create Custom Role'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showPasswordResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4"
            >
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                  Reset Password
                </h2>
                <button
                  onClick={resetForm}
                  className="p-1 sm:p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Reset password for: <span className="font-semibold text-gray-900">{selectedAdmin?.username}</span>
                </p>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordResetData.newPassword}
                    onChange={(e) => setPasswordResetData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    className="w-full px-2.5 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordResetData.confirmPassword}
                    onChange={(e) => setPasswordResetData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="w-full px-2.5 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-2.5 sm:px-3 lg:px-4 py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 sm:px-3 lg:px-4 py-2 text-sm sm:text-base bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <KeyIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    Reset Password
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminManagement; 