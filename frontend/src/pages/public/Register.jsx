import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserPlus, Mail, Lock, User, Phone, Calendar, MapPin, Heart } from 'lucide-react';
import Button from '../../components/common/Button';

const Register = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    emergencyContact: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      addToast('Account created successfully! Welcome to CarePulse.', 'success');
      navigate('/patient/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white font-bold flex items-center justify-center mx-auto mb-3 shadow-md">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Registration</h2>
            <p className="text-xs text-slate-500 mt-1">Create your personal healthcare account to book appointments</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group *</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="123 Street Name, City, State"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Person & Phone</label>
              <input
                type="text"
                name="emergencyContact"
                placeholder="Name & Contact number"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3">
              <UserPlus className="w-4 h-4 mr-2" />
              Complete Registration
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-slate-100 mt-6">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-primary-600 hover:underline">
                Sign in to your account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
};

export default Register;
