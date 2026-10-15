import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { Calendar, Search, Filter } from 'lucide-react';

const AdminAppointmentsPage = () => {
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let url = '/appointments?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (aptId, newStatus) => {
    try {
      const res = await api.patch(`/appointments/${aptId}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(`Appointment #${res.data.data.appointmentNumber} status updated to ${newStatus}`, 'success');
        fetchAppointments();
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <DashboardLayout title="Master Appointments Registry">
      <div className="space-y-6">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Apt #, patient, doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAppointments()}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {['', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  statusFilter === st
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st === '' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner label="Loading hospital appointments..." />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Appointments Found"
            description="No appointment records match the current filter criteria."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Apt #</th>
                  <th className="p-3.5">Patient</th>
                  <th className="p-3.5">Doctor</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{apt.appointmentNumber}</td>
                    <td className="p-3.5 font-bold text-slate-900">{apt.patientId?.userId?.name || 'Patient'}</td>
                    <td className="p-3.5 font-bold text-slate-800">{apt.doctorId?.userId?.name || 'Doctor'}</td>
                    <td className="p-3.5 text-slate-500">{apt.departmentId?.name}</td>
                    <td className="p-3.5 text-slate-600 font-semibold">{apt.appointmentDate} at {apt.appointmentTime}</td>
                    <td className="p-3.5">
                      <Badge status={apt.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt._id, e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Rejected">Rejected</option>
                        <option value="No-show">No-show</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminAppointmentsPage;
