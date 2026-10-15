import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Activity, Mail, Lock, LogIn, KeyRound } from 'lucide-react';
import Button from '../../components/common/Button';

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}!`, 'success');

      if (from) {
        navigate(from, { replace: true });
      } else {
        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'doctor') navigate('/doctor/dashboard');
        else navigate('/patient/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Demo Login Helper
  const fillDemoAccount = (role) => {
    if (role === 'admin') {
      setEmail('admin@hms.com');
      setPassword('adminpassword123');
    } else if (role === 'doctor') {
      setEmail('sarah.jenkins@hms.com');
      setPassword('doctorpassword123');
    } else if (role === 'patient') {
      setEmail('john.doe@gmail.com');
      setPassword('patientpassword123');
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl">
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white font-bold flex items-center justify-center mx-auto mb-3 shadow-md">
              <Activity className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">CarePulse Portal Login</h2>
            <p className="text-xs text-slate-500 mt-1">Access your patient dashboard, medical records & schedules</p>
          </div>

          {/* Quick Demo Credentials Helper */}
          <div className="bg-primary-50/60 p-3.5 rounded-2xl border border-primary-100/80 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-800 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              1-Click Demo Credentials:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="px-2 py-1.5 bg-white text-xs font-semibold text-slate-700 hover:text-primary-700 rounded-xl border border-slate-200 shadow-xs hover:border-primary-300 transition"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('doctor')}
                className="px-2 py-1.5 bg-white text-xs font-semibold text-slate-700 hover:text-primary-700 rounded-xl border border-slate-200 shadow-xs hover:border-primary-300 transition"
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('patient')}
                className="px-2 py-1.5 bg-white text-xs font-semibold text-slate-700 hover:text-primary-700 rounded-xl border border-slate-200 shadow-xs hover:border-primary-300 transition"
              >
                Patient
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Account
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have a patient account yet?{' '}
              <Link to="/register" className="font-bold text-primary-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
};

export default Login;
