import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { FileText, Stethoscope, Pill, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';

const PatientMedicalRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.profile?._id) {
      fetchRecords(user.profile._id);
    }
  }, [user]);

  const fetchRecords = async (patientId) => {
    setLoading(true);
    try {
      const res = await api.get(`/medical-records/patient/${patientId}`);
      if (res.data.success) {
        setRecords(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load medical records:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="My Medical Records & Digital Prescriptions">
      <div className="space-y-6">
        
        {loading ? (
          <LoadingSpinner label="Retrieving released medical records..." />
        ) : records.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Medical Records Found"
            description="Your consultation notes and prescriptions will appear here after a completed doctor visit."
          />
        ) : (
          <div className="space-y-6">
            {records.map((rec) => (
              <div
                key={rec._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {rec.doctorId?.userId?.name || 'Attending Specialist'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {rec.doctorId?.departmentId?.name} • Date: {new Date(rec.consultationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-lg w-fit">
                    Apt Ref: #{rec.appointmentId?.appointmentNumber || 'N/A'}
                  </span>
                </div>

                {/* Symptoms & Diagnosis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Observed Symptoms
                    </h4>
                    <p className="text-sm font-medium text-slate-800">{rec.symptoms}</p>
                  </div>

                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                      Clinical Diagnosis
                    </h4>
                    <p className="text-sm font-bold text-emerald-900">{rec.diagnosis}</p>
                  </div>
                </div>

                {/* Consultation Notes & Follow Up */}
                {rec.consultationNotes && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Doctor Consultation Notes
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      {rec.consultationNotes}
                    </p>
                  </div>
                )}

                {rec.followUpInstructions && (
                  <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-0.5">
                      Follow-up Advice
                    </h4>
                    <p className="text-xs text-blue-900 font-medium">{rec.followUpInstructions}</p>
                  </div>
                )}

                {/* Digital Prescription Table */}
                {rec.prescription && rec.prescription.length > 0 && (
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-primary-600" />
                      Prescribed Medications
                    </h4>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                          <tr>
                            <th className="p-3">Medicine Name</th>
                            <th className="p-3">Dosage</th>
                            <th className="p-3">Frequency</th>
                            <th className="p-3">Duration</th>
                            <th className="p-3">Instructions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          {rec.prescription.map((med, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80">
                              <td className="p-3 font-bold text-slate-900">{med.name}</td>
                              <td className="p-3 text-primary-700 font-semibold">{med.dosage}</td>
                              <td className="p-3">{med.frequency}</td>
                              <td className="p-3">{med.duration}</td>
                              <td className="p-3 text-slate-500">{med.instructions || 'Take as directed'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default PatientMedicalRecords;
