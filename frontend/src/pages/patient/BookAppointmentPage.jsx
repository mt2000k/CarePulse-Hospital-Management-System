import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { Calendar, Clock, Stethoscope, Building2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const BookAppointmentPage = () => {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const preselectedDoctorId = searchParams.get('doctorId') || '';

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctorId);
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [appointmentType, setAppointmentType] = useState('Consultation');

  // Confirmation Modal
  const [confirmationData, setConfirmationData] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchDoctors(selectedDepartment);
    } else {
      fetchDoctors();
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      fetchAvailableSlots(selectedDoctor, appointmentDate);
    }
  }, [selectedDoctor, appointmentDate]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments?status=active');
      if (res.data.success) setDepartments(res.data.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchDoctors = async (deptId = '') => {
    try {
      let url = '/doctors?status=active';
      if (deptId) url += `&departmentId=${deptId}`;
      const res = await api.get(url);
      if (res.data.success) {
        setDoctors(res.data.data);
        // If preselected doctor exists, set department
        if (preselectedDoctorId && !selectedDepartment) {
          const doc = res.data.data.find(d => d._id === preselectedDoctorId);
          if (doc && doc.departmentId) {
            setSelectedDepartment(doc.departmentId._id || doc.departmentId);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    setLoadingSlots(true);
    setSelectedSlot('');
    try {
      const res = await api.get(`/schedules/available-slots?doctorId=${doctorId}&date=${date}`);
      if (res.data.success) {
        setAvailableSlots(res.data.availableSlots || []);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
      addToast('Could not load time slots for this date', 'error');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctor || !selectedDepartment || !appointmentDate || !selectedSlot || !reason) {
      addToast('Please complete all required fields including selecting a time slot', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        doctorId: selectedDoctor,
        departmentId: selectedDepartment,
        appointmentDate,
        appointmentTime: selectedSlot,
        reason,
        appointmentType
      };

      const res = await api.post('/appointments', payload);
      if (res.data.success) {
        setConfirmationData(res.data.data);
        addToast('Appointment booked successfully!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed. Slot may already be reserved.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const targetDoctorObj = doctors.find(d => d._id === selectedDoctor);

  return (
    <DashboardLayout title="Book Medical Appointment">
      <div className="max-w-3xl mx-auto">
        
        <form onSubmit={handleBookingSubmit} className="space-y-6">
          
          {/* Step 1: Select Department */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-600" />
              1. Select Clinical Department *
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedDoctor('');
              }}
              required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Choose Department --</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Doctor */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary-600" />
              2. Select Doctor / Specialist *
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
              disabled={!selectedDepartment && doctors.length === 0}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.userId?.name} ({doc.specialization} - ${doc.consultationFee})
                </option>
              ))}
            </select>

            {targetDoctorObj && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                <img
                  src={targetDoctorObj.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'}
                  alt={targetDoctorObj.userId?.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{targetDoctorObj.userId?.name}</h4>
                  <p className="text-xs text-slate-500">{targetDoctorObj.qualification} • Fee: ${targetDoctorObj.consultationFee}</p>
                </div>
              </div>
            )}
          </div>

          {/* Step 3 & 4: Date & Available Slots */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  3. Select Preferred Date *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-primary-600" />
                  Consultation Type
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Consultation">Regular Consultation</option>
                  <option value="General Checkup">General Checkup</option>
                  <option value="Follow-up">Follow-up Visit</option>
                  <option value="Emergency">Urgent Care</option>
                </select>
              </div>
            </div>

            {/* Time Slot Picker Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary-600" />
                4. Select Available Time Slot *
              </label>

              {!selectedDoctor ? (
                <p className="text-xs text-slate-400 italic">Please select a doctor to view available time slots.</p>
              ) : loadingSlots ? (
                <div className="py-4 text-center">
                  <span className="text-xs text-primary-600 font-semibold animate-pulse">
                    Checking doctor schedule & existing bookings...
                  </span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>No available time slots for this date. The doctor may be off-duty or fully booked.</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                        selectedSlot === slot
                          ? 'bg-primary-600 text-white border-primary-600 shadow-md scale-105'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-primary-400 hover:bg-primary-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Step 5: Reason for Visit */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              5. Reason for Appointment / Primary Symptoms *
            </label>
            <textarea
              rows="3"
              required
              placeholder="Describe your health issue or reason for consultation (e.g. persistent headaches, routine annual checkup)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>

          <Button
            type="submit"
            loading={submitting}
            disabled={!selectedSlot}
            className="w-full py-3 text-base shadow-lg"
          >
            Confirm & Book Appointment
          </Button>

        </form>

        {/* Confirmation Modal */}
        {confirmationData && (
          <Modal
            isOpen={!!confirmationData}
            onClose={() => {
              setConfirmationData(null);
              navigate('/patient/appointments');
            }}
            title="Appointment Confirmed!"
          >
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Booking Reference</h3>
              <p className="text-xs text-slate-500">Your appointment has been registered in the hospital database.</p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Appointment ID:</span>
                  <span className="font-bold text-slate-900 font-mono">{confirmationData.appointmentNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-bold text-slate-900">{confirmationData.doctorId?.userId?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-900">{confirmationData.departmentId?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-bold text-primary-700">{confirmationData.appointmentDate} at {confirmationData.appointmentTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{confirmationData.status}</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setConfirmationData(null);
                  navigate('/patient/appointments');
                }}
                className="w-full mt-4"
              >
                Go to My Appointments
              </Button>
            </div>
          </Modal>
        )}

      </div>
    </DashboardLayout>
  );
};

export default BookAppointmentPage;
