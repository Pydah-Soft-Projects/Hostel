import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import {
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const getDefaultAcademicYear = () => {
  const y = new Date().getFullYear();
  const m = new Date().getMonth() + 1;
  const start = m >= 6 ? y : y - 1;
  return `${start}-${start + 1}`;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const statusClass = (status) => {
  if (status === 'Approved') return 'bg-green-100 text-green-800';
  if (status === 'Rejected') return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
};

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN');
  } catch {
    return '—';
  }
};

const actorLabel = (name, role, adminObj) => {
  const displayName = name || adminObj?.name || adminObj?.username;
  if (!displayName) return role || '—';
  return role ? `${displayName} (${role})` : displayName;
};

/**
 * Shared Room Changes panel for Admin Students tab + Warden page.
 * @param {'admin'|'warden'} mode
 */
const RoomChangesPanel = ({ mode = 'admin' }) => {
  const base = mode === 'warden' ? '/api/room-changes/warden' : '/api/room-changes';
  const studentsUrl = `${base}/students`;
  const listUrl = base;

  const [viewYear, setViewYear] = useState(getDefaultAcademicYear());
  const [statusFilter, setStatusFilter] = useState('All');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');

  const [showRaise, setShowRaise] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalYear, setModalYear] = useState(getDefaultAcademicYear());
  const [studentQuery, setStudentQuery] = useState('');
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [form, setForm] = useState({
    toRoomId: '',
    toBedNumber: '',
    toLockerNumber: '',
    effectiveDate: todayStr(),
    reason: ''
  });

  const ayOptions = useMemo(() => {
    const current = getDefaultAcademicYear();
    const start = Number(current.slice(0, 4));
    return [0, 1, 2].map((i) => {
      const s = start - i;
      return `${s}-${s + 1}`;
    });
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = { academicYear: viewYear, limit: 200 };
      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter;
      }
      const res = await api.get(listUrl, { params });
      if (res.data.success) {
        setRequests(res.data.data?.items || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load room change requests');
    } finally {
      setLoading(false);
    }
  }, [listUrl, viewYear, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => fetchRequests(), 200);
    return () => clearTimeout(t);
  }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(
      (r) =>
        (r.studentName || '').toLowerCase().includes(q) ||
        (r.admissionNumber || '').toLowerCase().includes(q) ||
        (r.rollNumber || '').toLowerCase().includes(q) ||
        (r.fromRoomNumber || '').toLowerCase().includes(q) ||
        (r.toRoomNumber || '').toLowerCase().includes(q)
    );
  }, [requests, searchQ]);

  const searchStudents = async (q) => {
    if (!modalYear) return;
    try {
      const res = await api.get(studentsUrl, {
        params: { academicYear: modalYear, q: q || undefined }
      });
      if (res.data.success) setStudentOptions(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!showRaise) return;
    const t = setTimeout(() => searchStudents(studentQuery), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentQuery, showRaise, modalYear]);

  const loadRoomsWithVacancy = async (hostelId) => {
    setLoadingRooms(true);
    try {
      const params = {};
      if (hostelId) params.hostel = hostelId;
      const vacancyUrl =
        mode === 'warden'
          ? '/api/rooms/warden/bed-availability'
          : '/api/admin/rooms/bed-availability';
      const res = await api.get(vacancyUrl, { params });
      if (res.data.success) {
        setRooms(res.data.data?.rooms || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load room vacancy');
    } finally {
      setLoadingRooms(false);
    }
  };

  const openRaise = () => {
    setShowRaise(true);
    setModalYear(viewYear);
    setSelectedStudent(null);
    setStudentQuery('');
    setStudentOptions([]);
    setForm({
      toRoomId: '',
      toBedNumber: '',
      toLockerNumber: '',
      effectiveDate: todayStr(),
      reason: ''
    });
    searchStudents('');
    loadRoomsWithVacancy();
  };

  const pickStudent = (s) => {
    setSelectedStudent(s);
    setStudentQuery(`${s.name || ''} (${s.admissionNumber})`);
    setStudentOptions([]);
    const hostelId = s.hostel?._id || s.hostel;
    loadRoomsWithVacancy(hostelId);
    setForm((f) => ({ ...f, toRoomId: '' }));
  };

  const selectedDestRoom = rooms.find((r) => String(r._id) === String(form.toRoomId));

  const submitRaise = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Select an active student');
      return;
    }
    if (!form.toRoomId) {
      toast.error('Select destination room');
      return;
    }
    if (!form.effectiveDate) {
      toast.error('Select effective date');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(base, {
        admissionNumber: selectedStudent.admissionNumber,
        academicYear: modalYear,
        toRoomId: form.toRoomId,
        toBedNumber: form.toBedNumber || undefined,
        toLockerNumber: form.toLockerNumber || undefined,
        effectiveDate: form.effectiveDate,
        reason: form.reason
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Request submitted');
        setShowRaise(false);
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const approve = async (id) => {
    try {
      const res = await api.post(`${base}/${id}/approve`, {});
      if (res.data.success) {
        toast.success(res.data.message || 'Approved');
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approve failed');
    }
  };

  const reject = async (id) => {
    const reason = window.prompt('Rejection reason (optional):') || '';
    try {
      const res = await api.post(`${base}/${id}/reject`, { rejectionReason: reason });
      if (res.data.success) {
        toast.success(res.data.message || 'Rejected');
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reject failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ArrowsRightLeftIcon className="w-5 h-5 text-blue-600" />
              Room Change Requests
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Raise, approve, and track room transfers for the selected academic year.
            </p>
          </div>
          <button
            type="button"
            onClick={openRaise}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
            Raise Room Change
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Academic Year</label>
            <select
              value={viewYear}
              onChange={(e) => setViewYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {ayOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-gray-500 mb-1">Search</label>
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Name / admission / roll / room"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
        ) : filteredRequests.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            No room change requests found for {viewYear}.
          </p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2 whitespace-nowrap">Student</th>
                  <th className="px-3 py-2 whitespace-nowrap">Admission</th>
                  <th className="px-3 py-2 whitespace-nowrap">From → To</th>
                  <th className="px-3 py-2 whitespace-nowrap">Effective</th>
                  <th className="px-3 py-2 whitespace-nowrap">Status</th>
                  <th className="px-3 py-2 whitespace-nowrap">Raised by</th>
                  <th className="px-3 py-2 whitespace-nowrap">Approved by</th>
                  <th className="px-3 py-2 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <p className="font-medium text-gray-900">{r.studentName || '—'}</p>
                      {r.rollNumber ? (
                        <p className="text-xs text-gray-500">{r.rollNumber}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {r.admissionNumber || '—'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {r.fromRoomNumber || '—'} → {r.toRoomNumber || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                      {fmtDate(r.effectiveDate)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(r.status)}`}
                      >
                        {r.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                      <div>{actorLabel(r.raisedByName, r.raisedBy, r.raisedByAdmin)}</div>
                      {r.requestedAt ? (
                        <div className="text-gray-400">{fmtDate(r.requestedAt)}</div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                      {r.status === 'Approved' ? (
                        <>
                          <div>
                            {actorLabel(r.approvedByName, null, r.approvedBy)}
                          </div>
                          {r.approvedAt ? (
                            <div className="text-gray-400">{fmtDate(r.approvedAt)}</div>
                          ) : null}
                        </>
                      ) : r.status === 'Rejected' ? (
                        actorLabel(r.rejectedByName, null, r.rejectedBy)
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {r.status === 'Pending' ? (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => approve(r._id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
                          >
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => reject(r._id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                          >
                            <XCircleIcon className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showRaise && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowRaise(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Raise Room Change</h3>
              <button type="button" onClick={() => setShowRaise(false)} className="text-gray-500 text-sm">
                Close
              </button>
            </div>
            <form onSubmit={submitRaise} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
                <select
                  value={modalYear}
                  onChange={(e) => {
                    setModalYear(e.target.value);
                    setSelectedStudent(null);
                    setStudentQuery('');
                    setStudentOptions([]);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {ayOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Active student</label>
                <input
                  type="text"
                  value={studentQuery}
                  onChange={(e) => {
                    setStudentQuery(e.target.value);
                    setSelectedStudent(null);
                  }}
                  placeholder="Search name / admission / roll"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                {studentOptions.length > 0 && !selectedStudent && (
                  <ul className="mt-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                    {studentOptions.map((s) => (
                      <li key={s.hostelRequestId || s.admissionNumber}>
                        <button
                          type="button"
                          onClick={() => pickStudent(s)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                        >
                          <span className="font-medium">{s.name || '—'}</span>
                          <span className="text-gray-500 text-xs ml-2">
                            {s.admissionNumber} · Room {s.currentRoomNumber || '—'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selectedStudent && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm">
                  <p className="font-medium text-gray-900">{selectedStudent.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Current room: <strong>{selectedStudent.currentRoomNumber || '—'}</strong>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Destination room (live vacancy)
                </label>
                {loadingRooms ? (
                  <p className="text-xs text-gray-500">Loading rooms…</p>
                ) : (
                  <select
                    value={form.toRoomId}
                    onChange={(e) => setForm((f) => ({ ...f, toRoomId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select room</option>
                    {rooms
                      .filter(
                        (r) =>
                          !selectedStudent?.currentRoomId ||
                          String(r._id) !== String(selectedStudent.currentRoomId)
                      )
                      .map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.roomNumber} — {r.availableBeds ?? 0} beds free / {r.bedCount ?? '?'} (
                          {r.hostel?.code || r.hostel?.name || 'Hostel'})
                        </option>
                      ))}
                  </select>
                )}
                {selectedDestRoom && (
                  <p className="text-xs text-green-700 mt-1">
                    Live vacancy: {selectedDestRoom.availableBeds} available of{' '}
                    {selectedDestRoom.bedCount} beds
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bed (optional)</label>
                <input
                  type="text"
                  value={form.toBedNumber}
                  onChange={(e) => setForm((f) => ({ ...f, toBedNumber: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Optional — not validated"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Effective date (past allowed)
                </label>
                <input
                  type="date"
                  value={form.effectiveDate}
                  onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Optional"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRaise(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit for approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomChangesPanel;
