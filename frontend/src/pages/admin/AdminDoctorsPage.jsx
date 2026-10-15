import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { Stethoscope, Search, Plus, Power, Edit3 } from 'lucide-react';

const AdminDoctorsPage = () => {
  const { addToast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchName, setSearchName] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Add Doctor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    departmentId: '',
    qualification: '',
    specialization: '',
    experience: 5,
    consultationFee: 100,
    bio: '',
    profileImage: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, [selectedDept]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments?status=active');
      if (res.data.success) setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let url = '/doctors?';
      if (selectedDept) url += `departmentId=${selectedDept}&`;
      if (searchName) url += `name=${encodeURIComponent(searchName)}&`;
      const res = await api.get(url);
      if (res.data.success) setDoctors(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (doctor) => {
    try {
      const res = await api.patch(`/doctors/${doctor._id}/status`);
      if (res.data.success) {
        addToast(`Doctor status toggled to ${res.data.data.status}`, 'success');
        fetchDoctors();
      }
    } catch (err) {
      addToast('Failed to change doctor status', 'error');
    }
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.departmentId) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/doctors', formData);
      if (res.data.success) {
        addToast('Doctor account created successfully!', 'success');
        setIsModalOpen(false);
        resetForm();
        fetchDoctors();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create doctor account';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      departmentId: '',
      qualification: '',
      specialization: '',
      experience: 5,
      consultationFee: 100,
      bio: '',
      profileImage: ''
    });
  };

  return (
    <DashboardLayout title="Doctor Account Management">
      <div className="space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by doctor name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDoctors()}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add New Doctor
          </Button>
        </div>

        {/* Doctors Table */}
        {loading ? (
          <LoadingSpinner label="Loading doctor roster..." />
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No Doctors Found"
            description="No doctor profiles found matching your search parameters."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Doctor Info</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Qualification & Exp</th>
                  <th className="p-3.5">Fee</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/80">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.profileImage || doc.userId?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'}
                          alt={doc.userId?.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900">{doc.userId?.name}</h4>
                          <p className="text-slate-400 text-[11px]">{doc.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                        {doc.departmentId?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800">{doc.specialization}</p>
                      <p className="text-slate-400 text-[11px]">{doc.experience} Years Experience</p>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">${doc.consultationFee}</td>
                    <td className="p-3.5">
                      <Badge status={doc.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleStatus(doc)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ml-auto ${
                          doc.status === 'active'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {doc.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Doctor Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Register New Doctor Profile"
            maxWidth="max-w-2xl"
          >
            <form onSubmit={handleAddDoctorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@hms.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardiology"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MD, FACC"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Years Experience *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Profile Photo URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.profileImage}
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Biography</label>
                <textarea
                  rows="2"
                  placeholder="Short background summary..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  Create Doctor Account
                </Button>
              </div>
            </form>
          </Modal>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminDoctorsPage;
