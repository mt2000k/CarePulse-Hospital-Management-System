import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { Clock, Calendar, Plus, Trash2, Edit3, ShieldAlert } from 'lucide-react';

const DoctorSchedulePage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    slotDuration: 30,
    maxAppointments: 20
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.profile?._id) {
      fetchSchedules(user.profile._id);
    }
  }, [user]);

  const fetchSchedules = async (doctorId) => {
    setLoading(true);
    try {
      const res = await api.get(`/schedules/doctor/${doctorId}`);
      if (res.data.success) {
        setSchedules(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSchedule(null);
    setFormData({
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      breakStart: '13:00',
      breakEnd: '14:00',
      slotDuration: 30,
      maxAppointments: 20
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sch) => {
    setEditingSchedule(sch);
    setFormData({
      dayOfWeek: sch.dayOfWeek,
      startTime: sch.startTime,
      endTime: sch.endTime,
      breakStart: sch.breakStart || '',
      breakEnd: sch.breakEnd || '',
      slotDuration: sch.slotDuration || 30,
      maxAppointments: sch.maxAppointments || 20
    });
    setIsModalOpen(true);
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this working day schedule?')) return;
    try {
      const res = await api.delete(`/schedules/${id}`);
      if (res.data.success) {
        addToast('Schedule deleted successfully', 'success');
        fetchSchedules(user.profile._id);
      }
    } catch (err) {
      addToast('Failed to delete schedule', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        doctorId: user.profile._id
      };

      if (editingSchedule) {
        const res = await api.put(`/schedules/${editingSchedule._id}`, payload);
        if (res.data.success) {
          addToast('Schedule updated successfully', 'success');
        }
      } else {
        const res = await api.post('/schedules', payload);
        if (res.data.success) {
          addToast('Schedule added successfully', 'success');
        }
      }

      setIsModalOpen(false);
      fetchSchedules(user.profile._id);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save schedule';
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <DashboardLayout title="Doctor Working Hours & Schedule Management">
      <div className="space-y-6">
        
        {/* Header Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Weekly Availability Rules</h3>
            <p className="text-xs text-slate-500">Configure working hours and break times for patient slot generation.</p>
          </div>
          <Button onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Day Schedule
          </Button>
        </div>

        {/* Schedule Cards Grid */}
        {loading ? (
          <LoadingSpinner label="Fetching doctor schedule settings..." />
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-6">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No Availability Schedule Configured</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Patients will not be able to book appointments until working hours are set up.
            </p>
            <Button onClick={handleOpenAddModal}>
              Configure Schedule Now
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {daysOfWeek.map((day) => {
              const sch = schedules.find((s) => s.dayOfWeek === day);

              return (
                <div
                  key={day}
                  className={`rounded-3xl p-6 border transition flex flex-col justify-between ${
                    sch
                      ? 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
                      : 'bg-slate-50 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold text-slate-900">{day}</h4>
                      {sch ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Schedule
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                          Day Off
                        </span>
                      )}
                    </div>

                    {sch ? (
                      <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                        <div className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400">Working Hours:</span>
                          <span className="font-bold text-slate-900">{sch.startTime} - {sch.endTime}</span>
                        </div>

                        {sch.breakStart && sch.breakEnd && (
                          <div className="flex justify-between bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 text-amber-900">
                            <span className="text-amber-700">Lunch Break:</span>
                            <span className="font-bold">{sch.breakStart} - {sch.breakEnd}</span>
                          </div>
                        )}

                        <div className="flex justify-between px-1">
                          <span className="text-slate-400">Slot Duration:</span>
                          <span className="font-semibold text-slate-800">{sch.slotDuration} Mins</span>
                        </div>

                        <div className="flex justify-between px-1">
                          <span className="text-slate-400">Max Patients/Day:</span>
                          <span className="font-semibold text-slate-800">{sch.maxAppointments}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-4">No appointments accepted on {day}s.</p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                    {sch ? (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(sch)}
                          className="p-2 rounded-xl text-primary-600 hover:bg-primary-50 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(sch._id)}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setFormData({ ...formData, dayOfWeek: day });
                          setEditingSchedule(null);
                          setIsModalOpen(true);
                        }}
                        className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Enable {day}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Schedule Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingSchedule ? `Edit Schedule - ${formData.dayOfWeek}` : 'Add Day Availability'}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week *</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  disabled={!!editingSchedule}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
                >
                  {daysOfWeek.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Break Start Time</label>
                  <input
                    type="time"
                    value={formData.breakStart}
                    onChange={(e) => setFormData({ ...formData, breakStart: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Break End Time</label>
                  <input
                    type="time"
                    value={formData.breakEnd}
                    onChange={(e) => setFormData({ ...formData, breakEnd: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Slot Duration (Mins)</label>
                  <select
                    value={formData.slotDuration}
                    onChange={(e) => setFormData({ ...formData, slotDuration: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={20}>20 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Appointments</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxAppointments}
                    onChange={(e) => setFormData({ ...formData, maxAppointments: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  Save Schedule
                </Button>
              </div>
            </form>
          </Modal>
        )}

      </div>
    </DashboardLayout>
  );
};

export default DoctorSchedulePage;
