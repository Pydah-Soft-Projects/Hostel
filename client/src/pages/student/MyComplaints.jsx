import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';
import jsPDF from 'jspdf';
import { 
  UserIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon, 
  PhotoIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  WrenchScrewdriverIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const formatComplaintDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} - ${month} - ${year}`;
};

const getStatusBadgeConfig = (status) => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'pending':
      return {
        label: 'Pending',
        classes: 'bg-amber-100 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        description: 'Complaint submitted and awaiting review by the maintenance team.'
      };
    case 'approaching':
      return {
        label: 'Approaching',
        classes: 'bg-blue-100 text-blue-800 border-blue-200',
        dot: 'bg-blue-500',
        description: 'Technician assigned and approaching for on-site inspection.'
      };
    case 'resolving':
    case 'in progress':
      return {
        label: 'Resolving',
        classes: 'bg-purple-100 text-purple-800 border-purple-200',
        dot: 'bg-purple-500',
        description: 'Work is currently in progress to resolve the issue.'
      };
    case 'completed':
    case 'resolved':
      return {
        label: 'Completed',
        classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        description: 'Work completed by technician. Please verify and provide feedback.'
      };
    case 'closed':
      return {
        label: 'Closed',
        classes: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-500',
        description: 'Complaint verified and closed.'
      };
    case 'rejected':
      return {
        label: 'Rejected',
        classes: 'bg-rose-100 text-rose-800 border-rose-200',
        dot: 'bg-rose-500',
        description: 'Complaint could not be accepted or was rejected.'
      };
    default:
      return {
        label: status || 'Pending',
        classes: 'bg-gray-100 text-gray-800 border-gray-200',
        dot: 'bg-gray-500',
        description: ''
      };
  }
};

const AssignedMemberCard = ({ member }) => {
  if (!member) return null;
  return (
    <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-blue-50/90 border border-blue-200/80 rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
              {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-gray-900 text-xs sm:text-sm break-words">{member.name}</span>
                {member.role && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                    {member.role}
                  </span>
                )}
              </div>
              {member.category && (
                <p className="text-xs text-blue-700 font-medium mt-0.5 truncate">{member.category}</p>
              )}
            </div>
          </div>
          {member.phone && (
            <a
              href={`tel:${member.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex-shrink-0 touch-manipulation min-h-[36px]"
              title="Call Assigned Technician"
              onClick={(e) => e.stopPropagation()}
            >
              <PhoneIcon className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-blue-100/90 flex flex-col gap-1 text-xs text-gray-600">
          {member.phone && (
            <div className="flex items-center gap-1.5 min-w-0">
              <PhoneIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <a href={`tel:${member.phone}`} className="hover:text-blue-600 font-medium truncate">
                {member.phone}
              </a>
            </div>
          )}
          {member.email && (
            <div className="flex items-center gap-1.5 min-w-0">
              <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <a href={`mailto:${member.email}`} className="hover:text-blue-600 truncate">
                {member.email}
              </a>
            </div>
          )}
          {member.notes && (
            <div className="mt-1 p-2 bg-white/80 rounded-md border border-blue-100 text-xs text-gray-700 break-words leading-relaxed">
              <span className="font-semibold text-blue-900">Task note: </span>
              {member.notes}
            </div>
          )}
        </div>
      </div>

      {member.assignedAt && (
        <div className="text-[11px] text-gray-400 mt-2 pt-1 border-t border-blue-100/40">
          Assigned: {formatComplaintDate(member.assignedAt)}
        </div>
      )}
    </div>
  );
};

const TimelineItem = ({ status, timestamp, note, assignedTo, isLast }) => {
  const badgeConfig = getStatusBadgeConfig(status);
  return (
    <div className="group relative py-2 sm:py-3 pl-7 sm:pl-32">
      {/* Timeline connector line */}
      <div className="before:absolute before:left-2.5 sm:before:left-[6.5rem] before:h-full before:-translate-x-1/2 before:translate-y-2 sm:before:translate-y-3 before:bg-slate-200 before:w-0.5 group-last:before:hidden after:absolute after:left-2.5 sm:after:left-[6.5rem] after:box-content after:h-2 after:w-2 after:-translate-x-1/2 after:translate-y-1.5 after:rounded-full after:border-2 sm:after:border-4 after:border-white after:bg-blue-600 after:shadow-xs">
        {/* Date time chip */}
        <time className="mb-1.5 sm:mb-0 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 text-[11px] sm:text-xs font-semibold text-slate-700 sm:absolute sm:left-0 sm:w-24 sm:top-1.5 whitespace-nowrap">
          {formatComplaintDate(timestamp)}
        </time>

        {/* Status Badge & Label */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeConfig.classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dot}`}></span>
            {badgeConfig.label}
          </span>
        </div>
      </div>

      {/* Note */}
      {note && note.trim() && (
        <div className="text-slate-600 text-xs sm:text-sm mt-1 mb-1.5 break-words leading-relaxed pl-0">
          {note}
        </div>
      )}

      {/* Assigned Staff Chip */}
      {assignedTo && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-700 bg-blue-50/70 px-2.5 py-1 rounded-lg border border-blue-100 flex-wrap max-w-full">
          <UserIcon className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="font-medium text-blue-900 truncate">Assigned: {assignedTo.name}</span>
          {assignedTo.role && (
            <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
              {assignedTo.role}
            </span>
          )}
          {assignedTo.phone && (
            <a 
              href={`tel:${assignedTo.phone}`} 
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold ml-auto text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
            >
              <PhoneIcon className="w-3 h-3" />
              <span>{assignedTo.phone}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

const MyComplaints = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [photoModal, setPhotoModal] = useState({ open: false, src: '', name: '' });


  // Add event listener for complaint submission
  useEffect(() => {
    const handleComplaintSubmitted = () => {
      console.log('Complaint submitted event received, refreshing complaints...');
      fetchComplaints();
    };

    window.addEventListener('complaint-submitted', handleComplaintSubmitted);
    return () => {
      window.removeEventListener('complaint-submitted', handleComplaintSubmitted);
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    if (user) {
      console.log('Initial fetch of complaints for user:', user);
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching complaints...');
      const res = await api.get('/api/complaints/my');
      console.log('Complaints response:', res.data);
      
      // Handle the new response format
      let complaintsData;
      if (res.data?.success && res.data.data?.complaints) {
        complaintsData = res.data.data.complaints;
      } else if (Array.isArray(res.data)) {
        // Fallback for old format
        complaintsData = res.data;
      } else {
        console.error('Invalid complaints data format:', res.data);
        setError('Received invalid data format from server');
        return;
      }

      // Log sample complaint data for debugging
      if (complaintsData.length > 0) {
        console.log('Sample complaint data:', {
          id: complaintsData[0]._id,
          title: complaintsData[0].title,
          hasAssignedTo: !!complaintsData[0].assignedTo,
          assignedToDetails: complaintsData[0].assignedTo
        });
      }

      // Sort complaints by date (newest first)
      complaintsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComplaints(complaintsData);
      
    } catch (err) {
      console.error('Error fetching complaints:', err);
      if (err.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      } else {
        setError('Failed to fetch complaints. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async complaint => {
    if (!complaint || typeof complaint !== 'object') {
      console.error('Invalid complaint object:', complaint);
      toast.error('Invalid complaint data');
      return;
    }

    console.log('Opening complaint details:', {
      id: complaint._id,
      title: complaint.title,
      hasAssignedTo: !!complaint.assignedTo,
      assignedToDetails: complaint.assignedTo
    });

    const complaintId = complaint._id;
    if (!complaintId) {
      console.error('Complaint missing ID:', complaint);
      toast.error('Invalid complaint data');
      return;
    }

    // Set the selected complaint with the data we already have
    setSelected(complaint);
    setTimeline([]);
    setTimelineLoading(true);
    setFeedback('');
    setFeedbackComment('');

    try {
      // Fetch timeline data
      console.log('Fetching timeline for complaint:', complaintId);
      const res = await api.get(`/api/complaints/${complaintId}/timeline`);
      console.log('Timeline response:', res.data);
      
      if (res.data?.success && res.data.data) {
        const { timeline: timelineData, currentAssignedTo, assignments } = res.data.data;
        
        // Update the selected complaint with the current assigned member(s)
        setSelected(prev => ({
          ...prev,
          assignedTo: currentAssignedTo || prev.assignedTo,
          assignments: (assignments && assignments.length > 0) ? assignments : prev.assignments
        }));

        // Sort timeline by date (oldest first)
        const sortedTimeline = timelineData.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        console.log('Timeline data received:', sortedTimeline);
        console.log('Timeline entries with notes:', sortedTimeline.filter(entry => entry.note));
        
        setTimeline(sortedTimeline);
      } else {
        console.error('Invalid timeline data format:', res.data);
        setTimeline([{
          status: complaint.currentStatus,
          timestamp: complaint.createdAt || new Date().toISOString(),
          note: 'Complaint created',
          assignedTo: complaint.assignedTo
        }]);
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setTimeline([{
        status: complaint.currentStatus,
        timestamp: complaint.createdAt || new Date().toISOString(),
        note: 'Complaint created',
        assignedTo: complaint.assignedTo
      }]);
      
      if (err.response?.status !== 404) {
        toast.error('Failed to load complaint timeline. Showing initial status.');
      }
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleFeedback = async e => {
    e.preventDefault();
    if (!selected) return;
    if (submittingFeedback) return;
    
    setSubmittingFeedback(true);
    try {
      const res = await api.post(`/api/complaints/${selected._id}/feedback`, {
        isSatisfied: feedback === 'satisfied',
        comment: feedbackComment
      });
      
      if (res.data.success) {
        // Update the selected complaint with the feedback
        setSelected(prev => ({
          ...prev,
          feedback: {
            isSatisfied: feedback === 'satisfied',
            comment: feedbackComment,
            timestamp: new Date().toISOString()
          }
        }));
        
        // Update the complaints list
        setComplaints(prev => 
          prev.map(c => 
            c._id === selected._id 
              ? {
                  ...c,
                  feedback: {
                    isSatisfied: feedback === 'satisfied',
                    comment: feedbackComment,
                    timestamp: new Date().toISOString()
                  }
                }
              : c
          )
        );

        // Refresh timeline to show any status changes from feedback
        try {
          const timelineRes = await api.get(`/api/complaints/${selected._id}/timeline`);
          if (timelineRes.data?.success && timelineRes.data.data) {
            const { timeline: timelineData, currentAssignedTo } = timelineRes.data.data;
            const sortedTimeline = timelineData.sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            );
            setTimeline(sortedTimeline);
            
            // Update selected complaint with new status if changed
            if (timelineData.length > 0) {
              const latestStatus = timelineData[timelineData.length - 1].status;
              setSelected(prev => ({
                ...prev,
                currentStatus: latestStatus,
                assignedTo: currentAssignedTo
              }));
            }
          }
        } catch (timelineError) {
          console.error('Error refreshing timeline after feedback:', timelineError);
        }

        toast.success('Feedback submitted successfully');
        setFeedback('');
        setFeedbackComment('');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      if (err.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
      }
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDownload = () => {
    if (!selected) return;

    try {
      // Initialize PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      // Set fonts and colors
      doc.setFont("helvetica");
      doc.setTextColor(59, 130, 246); // Blue color
      
      // Simple header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Complaint Details", margin, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, 20);
      
      // Add a line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, 25, pageWidth - margin, 25);
      
      // Content starts here
      let y = 35;
      
      // Student Details Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246); // Blue
      doc.text("Student Details", margin, y);
      y += 7;
      
      // Get student details
      const studentName = selected.student?.name || 'N/A';
      const studentRoll = selected.student?.rollNumber || selected.student?.roll || 'N/A';
      
      
      // Display student details
      doc.text(`Name: ${studentName}`, margin, y);
      y += 5;
      doc.text(`Roll Number: ${studentRoll}`, margin, y);
      y += 5;
      if (selected.complaintNumber) {
        doc.text(`Ticket Number: ${selected.complaintNumber}`, margin, y);
        y += 5;
      }
      
      // Status badge
      const sLower = (selected.currentStatus || '').toLowerCase();
      const statusColor = (sLower === 'resolved' || sLower === 'completed') ? [16, 185, 129] : // emerald
                         sLower === 'approaching' ? [59, 130, 246] : // blue
                         (sLower === 'resolving' || sLower === 'in progress') ? [147, 51, 234] : // purple
                         sLower === 'closed' ? [100, 116, 139] : // slate
                         sLower === 'rejected' ? [239, 68, 68] : // rose
                         [245, 158, 11]; // amber
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2], 0.1);
      doc.roundedRect(margin, y, 65, 8, 2, 2, "F");
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(selected.currentStatus || 'Pending', margin + 5, y + 6);
      
      y += 15;
      
      // Category and Sub-category
      doc.setTextColor(59, 130, 246); // Blue
      doc.setFont("helvetica", "bold");
      doc.text("Category:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(selected.category, margin + 25, y);
      
      if (selected.subCategory) {
        y += 7;
        doc.setFont("helvetica", "bold");
        doc.text("Sub-Category:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(selected.subCategory, margin + 30, y);
      }
      
      y += 12;
      
      // Description
      doc.setFont("helvetica", "bold");
      doc.text("Description:", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      const splitDescription = doc.splitTextToSize(selected.description, contentWidth);
      doc.text(splitDescription, margin, y);
      y += splitDescription.length * 5 + 10;
      
      // Timeline section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Status Timeline", margin, y);
      y += 8;
      
      // Draw timeline line
      const timelineStartY = y;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin + 4, timelineStartY, margin + 4, 250);
      
      doc.setFontSize(9);
      timeline.forEach((item, index) => {
        // Status icon
        const iconColor = item.status === 'Resolved' ? [34, 197, 94] : // green
                         item.status === 'In Progress' ? [59, 130, 246] : // blue
                         [234, 179, 8]; // yellow
        doc.setFillColor(iconColor[0], iconColor[1], iconColor[2], 0.1);
        doc.circle(margin + 4, y, 2, "F");
        
        // Status and timestamp
        doc.setFont("helvetica", "bold");
        doc.setTextColor(iconColor[0], iconColor[1], iconColor[2]);
        doc.text(item.status, margin + 10, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(new Date(item.timestamp).toLocaleString(), margin + 45, y);
        y += 5;
        
        // Note
        doc.setTextColor(59, 130, 246); // Blue
        const splitNote = doc.splitTextToSize(item.note, contentWidth - 15);
        doc.text(splitNote, margin + 10, y);
        y += splitNote.length * 4 + 3;
        
        // Assigned to if exists
        if (item.assignedTo) {
          doc.setTextColor(100, 100, 100);
          doc.text(`Assigned to: ${item.assignedTo.name}`, margin + 10, y);
          y += 4;
        }
        
        y += 5; // Space between timeline items
      });
      
      // Save the PDF
      doc.save(`complaint-${selected._id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to view your complaints.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 mt-12 sm:mt-0">
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
        <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-100 flex-shrink-0">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent truncate">
            My Complaints
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-1">Track and manage your submitted complaints</p>
        </div>
        </div>

      {error ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-center gap-3 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </motion.div>
      ) : complaints.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md p-8 text-center max-w-md mx-auto"
        >
          <div className="w-16 h-16 mx-auto mb-4 text-blue-800">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No complaints found</h3>
          <p className="text-gray-500">You haven't submitted any complaints yet.</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
        >
          {complaints.map((c, index) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="flex justify-between items-start mb-2 sm:mb-3 lg:mb-4 gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-semibold text-blue-900 text-sm sm:text-base lg:text-lg line-clamp-2 leading-tight">{c.title}</h3>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      {c.complaintNumber && (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-mono font-medium truncate max-w-full">
                          {c.complaintNumber}
                        </span>
                      )}
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium truncate max-w-full">
                        {c.category}
                      </span>
                      {c.subCategory && (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-medium truncate max-w-full">
                          {c.subCategory}
                        </span>
                      )}
                    </div>
                  </div>
                  {(() => {
                    const badge = getStatusBadgeConfig(c.currentStatus);
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 flex items-center gap-1.5 ${badge.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 lg:mb-4">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{formatComplaintDate(c.createdAt)}</span>
                </div>

                {c.assignedTo ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-gray-700 mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {c.assignedTo.name ? c.assignedTo.name.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-gray-900 truncate">{c.assignedTo.name}</span>
                          {c.assignedTo.role && (
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded uppercase">
                              {c.assignedTo.role}
                            </span>
                          )}
                        </div>
                        {c.assignedTo.category && (
                          <p className="text-[11px] text-gray-500 truncate">{c.assignedTo.category}</p>
                        )}
                      </div>
                    </div>
                    {c.assignedTo.phone && (
                      <a
                        href={`tel:${c.assignedTo.phone}`}
                        className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] shadow-sm transition-colors flex-shrink-0"
                        title="Call Assigned Member"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PhoneIcon className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                ) : !['resolved', 'completed', 'closed'].includes(c.currentStatus?.toLowerCase()) ? (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50/60 border border-amber-100 px-2.5 py-1.5 rounded-lg mb-3">
                    <ClockIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className="truncate">Awaiting technician assignment</span>
                  </div>
                ) : null}

                <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 mb-3 sm:mb-4 leading-relaxed">{c.description}</p>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {c.feedback && (
                      <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                        c.feedback.isSatisfied ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {c.feedback.isSatisfied ? 'Satisfied' : 'Not Satisfied'}
                      </span>
                    )}
                    {/* Show feedback required badge if resolved/completed and feedback is missing */}
                    {!c.feedback && (c.currentStatus === 'Resolved' || c.currentStatus === 'Completed') && (
                      <span className="text-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse break-words">
                        Feedback required
                      </span>
                    )}
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openDetails(c)}
                    className="w-full sm:w-auto text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1.5 sm:gap-1 py-1.5 sm:py-2 px-3 sm:px-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <span>View Details</span>
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 md:p-6"
            onClick={() => setSelected(null)}
            style={{
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full h-[92vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl relative flex flex-col overflow-hidden border-0 sm:border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Indicator Bar */}
              <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2.5 mb-1 flex-shrink-0" />

              {/* Sticky Header with Title, Ticket & Actions */}
              <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200/80 bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 z-10">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                    {selected.complaintNumber ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-md text-xs font-mono font-bold shadow-xs">
                        {selected.complaintNumber}
                      </span>
                    ) : null}
                    {selected.category && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium border border-blue-100">
                        {selected.category}
                      </span>
                    )}
                    {selected.subCategory && (
                      <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-md text-[11px] font-medium border border-cyan-100">
                        {selected.subCategory}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate leading-snug">
                    {selected.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {/* Download PDF Button */}
                  <button
                    className="p-2 sm:p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors flex items-center justify-center min-w-[40px] min-h-[40px] touch-manipulation"
                    onClick={handleDownload}
                    title="Download Details as PDF"
                    aria-label="Download PDF"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  {/* Close Button */}
                  <button
                    className="p-2 sm:p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors flex items-center justify-center min-w-[40px] min-h-[40px] touch-manipulation"
                    onClick={() => setSelected(null)}
                    disabled={submittingFeedback}
                    title="Close"
                    aria-label="Close modal"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Modal Content */}
              <div 
                className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {/* Summary Cards Grid: Student Details & Status Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Student Details Card */}
                  <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/80">
                    <div className="flex items-center gap-2 mb-2">
                      <UserIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm">Student Details</span>
                    </div>
                    <p className="text-gray-900 font-semibold text-sm sm:text-base truncate">{selected.student?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">Roll No: {selected.student?.rollNumber || selected.student?.roll || 'N/A'}</p>
                  </div>

                  {/* Status Information Card */}
                  {(() => {
                    const badge = getStatusBadgeConfig(selected.currentStatus);
                    return (
                      <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />
                              <span className="font-semibold text-slate-800 text-xs sm:text-sm">Status Information</span>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.classes}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                              {badge.label}
                            </span>
                          </div>
                          {badge.description && (
                            <p className="text-xs text-gray-600 leading-relaxed mt-1">{badge.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {selected.isReopened && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
                              Reopened
                            </span>
                          )}
                          {selected.createdAt && (
                            <span className="text-[11px] text-gray-400">
                              Logged on: {formatComplaintDate(selected.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Assigned Staff Section */}
                <div className="space-y-2">
                  {selected.assignments && selected.assignments.length > 0 ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                          <UserIcon className="w-4 h-4 text-blue-600" />
                          <span>Assigned Maintenance Staff ({selected.assignments.length})</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selected.assignments.map((member, mIdx) => (
                          <AssignedMemberCard key={member.id || mIdx} member={member} />
                        ))}
                      </div>
                    </div>
                  ) : selected.assignedTo ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                        <span>Assigned Technician</span>
                      </div>
                      <AssignedMemberCard member={selected.assignedTo} />
                    </div>
                  ) : !['resolved', 'completed', 'closed'].includes(selected.currentStatus?.toLowerCase()) ? (
                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 sm:p-4 text-xs text-amber-900 flex items-start gap-2.5">
                      <ClockIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-amber-950 text-xs sm:text-sm">Awaiting Technician Assignment</p>
                        <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                          Your request has been forwarded to the maintenance department. A supervisor will assign a technician shortly.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Image preview section */}
                {selected.imageUrl && (
                  <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <PhotoIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm">Complaint Image</span>
                    </div>
                    <div 
                      className="relative w-full max-h-72 sm:max-h-96 aspect-video rounded-lg overflow-hidden cursor-pointer group bg-gray-900 flex items-center justify-center border border-gray-200"
                      onClick={() => setPhotoModal({ open: true, src: selected.imageUrl, name: selected.title })}
                    >
                      <img
                        src={selected.imageUrl}
                        alt="Complaint attachment"
                        className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-lg shadow-sm">
                          Tap to view full image
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description Section */}
                <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                  <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">Description</h4>
                  <p className="text-gray-700 text-xs sm:text-sm break-words whitespace-pre-wrap leading-relaxed">
                    {selected.description}
                  </p>
                </div>

                {/* Timeline Section */}
                <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">Status Timeline</h4>
                  <div className="space-y-2">
                    {timelineLoading ? (
                      <div className="flex justify-center py-4">
                        <LoadingSpinner size="md" />
                      </div>
                    ) : timeline.length > 0 ? (
                      timeline.map((item, index) => (
                        <TimelineItem
                          key={item.timestamp || index}
                          {...item}
                          isLast={index === timeline.length - 1}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4 text-xs">No timeline updates recorded yet</p>
                    )}
                  </div>
                </div>

                {/* Feedback Section */}
                {(['resolved', 'completed', 'closed'].includes(selected.currentStatus?.toLowerCase()) || 
                  ['resolved', 'completed', 'closed'].includes(selected.maintenanceStatus?.toLowerCase()) || 
                  Boolean(selected.feedback)) && (
                  <div className="border-t border-gray-200/80 pt-4 sm:pt-6 space-y-3">
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">
                      {selected.feedback ? 'Your Submitted Feedback' : 'Provide Feedback'}
                    </div>

                    {selected.feedback ? (
                      <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            selected.feedback.isSatisfied 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                            {selected.feedback.isSatisfied ? 'Satisfied' : 'Not Satisfied'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(selected.feedback.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {selected.feedback.comment && (
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">{selected.feedback.comment}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setFeedback('satisfied')}
                            className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all touch-manipulation min-h-[44px] ${
                              feedback === 'satisfied'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-400/50 shadow-xs'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                              <span>Satisfied</span>
                            </div>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setFeedback('not-satisfied')}
                            className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all touch-manipulation min-h-[44px] ${
                              feedback === 'not-satisfied'
                                ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-400/50 shadow-xs'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                              <ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 flex-shrink-0" />
                              <span>Not Satisfied</span>
                            </div>
                          </motion.button>
                        </div>

                        {feedback && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3"
                          >
                            <textarea
                              value={feedbackComment}
                              onChange={e => setFeedbackComment(e.target.value)}
                              placeholder="Additional comments or remarks (optional)..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs sm:text-sm shadow-xs"
                              rows="3"
                            />
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              type="button"
                              onClick={handleFeedback}
                              disabled={submittingFeedback}
                              className={`w-full py-3 px-4 rounded-xl font-semibold text-white text-xs sm:text-sm transition-all shadow-md touch-manipulation min-h-[44px] flex items-center justify-center ${
                                submittingFeedback 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                              }`}
                            >
                              {submittingFeedback ? (
                                <div className="flex items-center justify-center gap-2">
                                  <LoadingSpinner size="sm" className="border-white" />
                                  <span>Submitting Feedback...</span>
                                </div>
                              ) : (
                                'Submit Feedback'
                              )}
                            </motion.button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Modal */}
      <AnimatePresence>
        {photoModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[60] p-2 sm:p-4"
            onClick={() => setPhotoModal({ open: false, src: '', name: '' })}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative max-w-[95vw] max-h-[92vh] bg-gray-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setPhotoModal({ open: false, src: '', name: '' })}
                className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black/90 active:bg-black text-white rounded-full p-2.5 transition-all shadow-md touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Close photo preview"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Image */}
              <div className="flex items-center justify-center p-2 sm:p-4 max-h-[85vh]">
                <img
                  src={photoModal.src}
                  alt={photoModal.name}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-sm"
                />
              </div>

              {/* Image Title */}
              {photoModal.name && (
                <div className="bg-black/70 text-white px-4 py-2.5 text-center">
                  <p className="text-xs sm:text-sm font-medium truncate">{photoModal.name}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
};

export default MyComplaints;