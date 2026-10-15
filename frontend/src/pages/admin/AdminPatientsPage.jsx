import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { Users, Search, Eye, Calendar, Phone, Mail, MapPin } from 'lucide-react';

const AdminPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      let url = '/patients?';
      if (search) url += `search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Registered Patient Directory">
      <div className="space-y-6">
        
        {/* Search Toolbar */}
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by patient name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPatients()}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner label="Fetching registered patient records..." />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Patients Found"
            description="No patient records found matching your search term."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Patient Name</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Gender / DOB</th>
                  <th className="p-3.5">Blood Group</th>
                  <th className="p-3.5">Registration Date</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {patients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-slate-900">
                      {pat.userId?.name || 'Anonymous'}
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-800">{pat.userId?.email}</p>
                      <p className="text-slate-400 text-[11px]">{pat.userId?.phone || 'N/A'}</p>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {pat.gender} • {pat.dateOfBirth ? new Date(pat.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {pat.bloodGroup}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(pat.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedPatient(pat)}
                        className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View Patient Detail Modal */}
        {selectedPatient && (
          <Modal
            isOpen={!!selectedPatient}
            onClose={() => setSelectedPatient(null)}
            title="Patient Profile & Medical Details"
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="text-base font-bold text-slate-900">{selectedPatient.userId?.name}</h4>
                <p className="text-slate-500">{selectedPatient.userId?.email} • {selectedPatient.userId?.phone}</p>
                <div className="flex gap-2 pt-1 font-bold">
                  <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded">Blood Group: {selectedPatient.bloodGroup}</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Gender: {selectedPatient.gender}</span>
                </div>
              </div>

              <div className="space-y-2 text-slate-700">
                <p><strong className="text-slate-900">Address:</strong> {selectedPatient.address}</p>
                <p><strong className="text-slate-900">Emergency Contact:</strong> {selectedPatient.emergencyContact || 'Not specified'}</p>
                <p><strong className="text-slate-900">Pre-existing Medical History:</strong> {selectedPatient.medicalHistory || 'None recorded'}</p>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminPatientsPage;
