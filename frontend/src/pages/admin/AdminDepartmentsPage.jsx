import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { Building2, Plus, Edit3, Trash2 } from 'lucide-react';

const AdminDepartmentsPage = () => {
  const { addToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'active'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '', image: '', status: 'active' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description,
      image: dept.image || '',
      status: dept.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate or delete department?')) return;
    try {
      const res = await api.delete(`/departments/${id}`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchDepartments();
      }
    } catch (err) {
      addToast('Failed to delete department', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      addToast('Name and description are required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingDept) {
        const res = await api.put(`/departments/${editingDept._id}`, formData);
        if (res.data.success) addToast('Department updated successfully', 'success');
      } else {
        const res = await api.post('/departments', formData);
        if (res.data.success) addToast('Department created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Department Management">
      <div className="space-y-6">
        
        {/* Header Toolbar */}
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Hospital Departments</h3>
            <p className="text-xs text-slate-500">Manage clinical specialty units & doctor assignments.</p>
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Department
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <LoadingSpinner label="Loading departments..." />
        ) : departments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No Departments Configured"
            description="Create your first hospital clinical department to get started."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept._id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <img
                    src={dept.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80'}
                    alt={dept.name}
                    className="w-full h-40 object-cover bg-slate-100"
                  />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-slate-900">{dept.name}</h4>
                      <Badge status={dept.status} />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {dept.description}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-primary-700">
                      {dept.doctorCount || 0} Active Doctors
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-end gap-2 mt-2">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-2 rounded-xl text-primary-600 hover:bg-primary-50 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id)}
                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingDept ? 'Edit Department' : 'Create New Department'}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Overview of medical services offered by this department..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Header Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  Save Department
                </Button>
              </div>
            </form>
          </Modal>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminDepartmentsPage;
