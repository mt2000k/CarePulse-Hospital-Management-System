import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { Calendar, Clock, Stethoscope, AlertTriangle, XCircle } from 'lucide-react';

const PatientAppointments = () => {
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Cancel Modal state
  const [cancelModalAppointment, setCancelModalAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let url = '/appointments';
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalAppointment) return;

    setCancelling(true);
    try {
      const res = await api.patch(`/appointments/${cancelModalAppointment._id}/status`, {
        status: 'Cancelled',
        cancellationReason: cancelReason
      });

      if (res.data.success) {
        addToast('Appointment cancelled successfully', 'success');
        setCancelModalAppointment(null);
        setCancelReason('');
        fetchAppointments();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel appointment';
      addToast(msg, 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <DashboardLayout title="My Appointments">
      <div className="space-y-6">
        
        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Filter Status:</span>
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
                {st === '' ? 'All Appointments' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        {loading ? (
          <LoadingSpinner label="Fetching your appointments..." />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Appointments Found"
            description="You don't have any appointments matching the selected filter."
          />
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => {
              const isEligibleForCancel = ['Pending', 'Confirmed'].includes(apt.status);

              return (
                <div
                  key={apt._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={apt.doctorId?.userId?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'}
                      alt={apt.doctorId?.userId?.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-100 flex-shrink-0 bg-slate-50"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-400">#{apt.appointmentNumber}</span>
                        <Badge status={apt.status} />
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {apt.appointmentType}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {apt.doctorId?.userId?.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold">
                        {apt.doctorId?.specialization} • {apt.departmentId?.name}
                      </p>

                      <div className="mt-2 text-xs text-slate-600 flex items-center gap-4">
                        <span className="flex items-center gap-1 font-bold text-slate-900">
                          <Calendar className="w-3.5 h-3.5 text-primary-600" />
                          {apt.appointmentDate}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-900">
                          <Clock className="w-3.5 h-3.5 text-primary-600" />
                          {apt.appointmentTime}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-lg">
                        <span className="font-semibold text-slate-700">Reason:</span> {apt.reason}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0">
                    {isEligibleForCancel && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setCancelModalAppointment(apt)}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Cancel Appointment
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {cancelModalAppointment && (
          <Modal
            isOpen={!!cancelModalAppointment}
            onClose={() => setCancelModalAppointment(null)}
            title="Confirm Cancellation"
          >
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-800 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Are you sure you want to cancel this appointment?</p>
                  <p className="mt-0.5">Doctor: {cancelModalAppointment.doctorId?.userId?.name} on {cancelModalAppointment.appointmentDate} at {cancelModalAppointment.appointmentTime}.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for cancellation (optional)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Schedule conflict, feeling better..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setCancelModalAppointment(null)}>
                  Keep Appointment
                </Button>
                <Button type="submit" variant="danger" loading={cancelling}>
                  Yes, Cancel Appointment
                </Button>
              </div>
            </form>
          </Modal>
        )}

      </div>
    </DashboardLayout>
  );
};

export default PatientAppointments;
