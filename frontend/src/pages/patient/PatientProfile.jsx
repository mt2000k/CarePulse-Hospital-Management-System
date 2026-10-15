import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import { User, Mail, Phone, MapPin, Heart, Shield, Save } from 'lucide-react';

const PatientProfile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.profile?.address || '',
    emergencyContact: user?.profile?.emergencyContact || '',
    medicalHistory: user?.profile?.medicalHistory || ''
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="My Personal Health Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Readonly Summary Card */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white font-extrabold flex items-center justify-center text-2xl shadow">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
              <span className="bg-primary-100 text-primary-800 px-2.5 py-0.5 rounded-md">
                Blood Group: {user?.profile?.bloodGroup || 'N/A'}
              </span>
              <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-md">
                Gender: {user?.profile?.gender || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4">
          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Edit Contact & Health Information</h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Info</label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Known Allergies / Pre-existing Medical Conditions</label>
            <textarea
              rows="3"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>

          <Button type="submit" loading={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Profile Changes
          </Button>
        </form>

      </div>
    </DashboardLayout>
  );
};

export default PatientProfile;
