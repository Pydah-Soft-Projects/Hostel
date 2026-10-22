import React, { useEffect, useState } from 'react';
import { UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import TakeAttendance from './TakeAttendance';
import TakeStaffAttendance from './TakeStaffAttendance';

const AttendanceManagement = ({ initialTab = 'students' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-4">
      <nav className="flex gap-2 border-b border-gray-200" aria-label="Attendance type">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'students'}
          onClick={() => setActiveTab('students')}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'students'
            ? 'border-blue-600 text-blue-700'
            : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
        >
          <UserIcon className="h-4 w-4" />
          Students
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'staff'}
          onClick={() => setActiveTab('staff')}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'staff'
            ? 'border-emerald-600 text-emerald-700'
            : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
        >
          <UserGroupIcon className="h-4 w-4" />
          Staff/Guests
        </button>
      </nav>

      <div role="tabpanel">
        {activeTab === 'students' ? <TakeAttendance /> : <TakeStaffAttendance />}
      </div>
    </div>
  );
};

export default AttendanceManagement;