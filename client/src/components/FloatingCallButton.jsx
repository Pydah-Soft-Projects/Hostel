import React, { useState } from 'react';
import { PhoneIcon, XMarkIcon, HomeIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const FloatingCallButton = ({ isSidebarOpen = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Get course name from user object (handle both populated and unpopulated data)
  const getCourseName = (course) => {
    if (!course) return 'Unknown';
    if (typeof course === 'string') return course;
    return course.name || course;
  };

  // Define contact numbers based on gender and course
  const getCallOptions = () => {
    const studentGender = user?.gender?.toLowerCase();
    const studentCourse = getCourseName(user?.course)?.toLowerCase();

    // Warden numbers based on gender
    const wardenNumbers = {
      male: '+91-9966814695',    // Boys Warden
      female: '+91-8333068321',  // Girls Warden
      default: '+91-9966814695'  // Default fallback
    };

    // AO numbers based on course (matching the actual courses from seed file)
    const aoNumbers = {
      'b.tech': '+91-9490484418',        // B.Tech AO
      'diploma': '+91-8688553555',       // Diploma AO
      'pharmacy': '+91-8886728886',      // Pharmacy AO
      'degree': '+91-9490484418',        // Degree AO
      default: '+91-9490484418'          // Default fallback
    };

    // Get appropriate warden number
    const wardenPhone = wardenNumbers[studentGender] || wardenNumbers.default;
    const wardenTitle = studentGender === 'female' ? 'Call Girls Warden' : 'Call Boys Warden';
    const wardenSubtitle = studentGender === 'female' ? 'Girls Hostel Warden' : 'Boys Hostel Warden';

    // Get appropriate AO number
    const aoPhone = aoNumbers[studentCourse] || aoNumbers.default;
    const aoTitle = `Call ${getCourseName(user?.course)} AO`;
    const aoSubtitle = `${getCourseName(user?.course)} Administrative Officer`;

    return [
      {
        id: 'warden',
        title: wardenTitle,
        subtitle: wardenSubtitle,
        phone: wardenPhone,
        icon: HomeIcon,
        color: 'bg-primary'
      },
      {
        id: 'ao',
        title: aoTitle,
        subtitle: aoSubtitle,
        phone: aoPhone,
        icon: UserIcon,
        color: 'bg-green-500'
      },
      {
        id: 'security',
        title: 'Call Security',
        subtitle: 'Security Office',
        phone: '+91-8317612655',
        icon: ShieldCheckIcon,
        color: 'bg-red-500'
      }
    ];
  };

  const callOptions = getCallOptions();

  const handleCall = (phoneNumber) => {
    // Clean the phone number and ensure proper tel: format
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  const toggleMenu = () => {
    console.log('Button clicked! Current state:', isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed bottom-6 left-6 z-[9999] transition-all duration-300 ${
      // Hide on larger screens (lg breakpoint and above)
      'lg:hidden ' + 
      (isSidebarOpen ? 'opacity-0 pointer-events-none transform scale-0' : 'opacity-100 pointer-events-auto transform scale-100')
    }`}>
      {/* Debug indicator
      <div className="absolute -top-8 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
        {isOpen ? 'OPEN' : 'CLOSED'}
      </div> */}
      
      {/* Call Options Popup */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 mb-2 bg-surface rounded-xl shadow-2xl border border-border p-4 min-w-[280px] z-[10000]">
          <div className="text-center border-b border-border pb-3 mb-4">
            <h3 className="font-bold text-text-main text-lg">Quick Call</h3>
          </div>
          
          <div className="space-y-3">
            {callOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <div
                  key={option.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-background cursor-pointer transition-colors group"
                  onClick={() => {
                    console.log('Calling:', option.phone);
                    handleCall(option.phone);
                  }}
                >
                  <div className={`w-10 h-10 ${option.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-text-main text-sm">{option.title}</div>
                    <div className="text-xs text-text-sub">{option.subtitle}</div>
                  </div>
                  <PhoneIcon className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={toggleMenu}
        className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 border-2 animate-pulse ${
          isOpen 
            ? 'bg-danger hover:opacity-90 border-red-300' 
            : 'bg-primary hover:bg-primary-hover border-primary-light'
        }`}
        style={{ 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          animation: isOpen ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-white" />
        ) : (
          <PhoneIcon className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
};

export default FloatingCallButton;