import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { Calendar, Clock, CheckCircle2, XCircle, FilePlus, Pill, Plus, Trash2 } from 'lucide-react';

const DoctorAppointmentsPage = () => {
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Record Creation Modal State
  const [recordModalApt, setRecordModalApt] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [savingRecord, setSavingRecord] = useState(false);

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
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (aptId, newStatus) => {
    try {
      const res = await api.patch(`/appointments/${aptId}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(`Appointment status updated to ${newStatus}`, 'success');
        fetchAppointments();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status';
      addToast(msg, 'error');
    }
  };

  // Medicine list management
  const handleMedicineChange = (index, field, value) => {
    const list = [...medicines];
    list[index][field] = value;
    setMedicines(list);
  };

  const addMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSaveMedicalRecord = async (e) => {
    e.preventDefault();
    if (!symptoms || !diagnosis) {
      addToast('Please provide both symptoms and diagnosis', 'error');
      return;
    }

    setSavingRecord(true);
    try {
      // Filter out empty medicines
      const validMedicines = medicines.filter(m => m.name.trim() !== '');

      const payload = {
        appointmentId: recordModalApt._id,
        symptoms,
        diagnosis,
        consultationNotes,
        followUpInstructions,
        medicines: validMedicines
      };

      const res = await api.post('/medical-records', payload);
      if (res.data.success) {
        addToast('Medical record & prescription saved! Appointment marked completed.', 'success');
        setRecordModalApt(null);
        resetRecordForm();
        fetchAppointments();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save medical record';
      addToast(msg, 'error');
    } finally {
      setSavingRecord(false);
    }
  };

  const resetRecordForm = () => {
    setSymptoms('');
    setDiagnosis('');
    setConsultationNotes('');
    setFollowUpInstructions('');
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  return (
    <DashboardLayout title="Doctor Appointments & Consultations">
      <div className="space-y-6">
        
        {/* Status Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Filter Status:</span>
          <div className="flex flex-wrap gap-2">
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

        {/* Appointments List */}
        {loading ? (
          <LoadingSpinner label="Fetching assigned appointments..." />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Appointments Found"
            description="There are no patient appointments matching your query."
          />
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-400">#{apt.appointmentNumber}</span>
                    <Badge status={apt.status} />
                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded">
                      {apt.appointmentType}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Patient: {apt.patientId?.userId?.name || 'Anonymous Patient'}
                  </h3>

                  <div className="text-xs text-slate-500 font-medium flex items-center gap-4 flex-wrap">
                    <span>Phone: {apt.patientId?.userId?.phone || 'N/A'}</span>
                    <span>Gender: {apt.patientId?.gender || 'N/A'}</span>
                    <span>Blood: <strong className="text-red-600">{apt.patientId?.bloodGroup || 'N/A'}</strong></span>
                  </div>

                  <div className="text-xs text-slate-700 font-semibold flex items-center gap-4 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary-600" />
                      {apt.appointmentDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary-600" />
                      {apt.appointmentTime}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 max-w-2xl">
                    <span className="font-bold text-slate-800">Reason:</span> {apt.reason}
                  </p>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
                  {apt.status === 'Pending' && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStatusUpdate(apt._id, 'Confirmed')}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Accept / Confirm
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusUpdate(apt._id, 'Rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}

                  {apt.status === 'Confirmed' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setRecordModalApt(apt);
                        resetRecordForm();
                      }}
                    >
                      <FilePlus className="w-4 h-4 mr-1.5" />
                      Add Prescription & Complete
                    </Button>
                  )}

                  {apt.status === 'Completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRecordModalApt(apt);
                      }}
                    >
                      <FilePlus className="w-4 h-4 mr-1.5" />
                      View / Edit Medical Record
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Medical Record & Prescription Modal */}
        {recordModalApt && (
          <Modal
            isOpen={!!recordModalApt}
            onClose={() => setRecordModalApt(null)}
            title={`Consultation Record - ${recordModalApt.patientId?.userId?.name}`}
            maxWidth="max-w-3xl"
          >
            <form onSubmit={handleSaveMedicalRecord} className="space-y-5">
              
              {/* Symptoms */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Observed Symptoms *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Patient complaint & symptoms observed..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Medical Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="Primary clinical diagnosis (e.g. Acute Bronchitis)..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Consultation Notes */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Consultation & Examination Notes</label>
                <textarea
                  rows="2"
                  placeholder="Detailed notes, lab test instructions, vitals..."
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>

              {/* Follow Up */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Follow-up Advice</label>
                <input
                  type="text"
                  placeholder="e.g. Return in 14 days or if symptoms persist..."
                  value={followUpInstructions}
                  onChange={(e) => setFollowUpInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Medicines Builder */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-primary-600" />
                    Prescription Medications
                  </h4>
                  <button
                    type="button"
                    onClick={addMedicineRow}
                    className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Medicine
                  </button>
                </div>

                {medicines.map((med, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Medicine Name (e.g. Amoxicillin)"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 500mg)"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g. Twice daily)"
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Duration (e.g. 7 days)"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicineRow(idx)}
                            className="p-1.5 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Special instructions (e.g. Take after breakfast with water)..."
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setRecordModalApt(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={savingRecord}>
                  Save & Release Medical Record
                </Button>
              </div>
            </form>
          </Modal>
        )}

      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;
