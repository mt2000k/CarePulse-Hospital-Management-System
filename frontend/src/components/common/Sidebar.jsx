import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Building2,
  Clock,
  FileText,
  User,
  LogOut,
  Activity,
  PlusCircle
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
    { name: 'Patients', path: '/admin/patients', icon: Users },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Departments', path: '/admin/departments', icon: Building2 },
  ];

  const doctorLinks = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'My Schedule', path: '/doctor/schedule', icon: Clock },
    { name: 'My Profile', path: '/doctor/profile', icon: User },
  ];

  const patientLinks = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Book Appointment', path: '/patient/book-appointment', icon: PlusCircle },
    { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'Medical Records', path: '/patient/records', icon: FileText },
    { name: 'My Profile', path: '/patient/profile', icon: User },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shadow-sm">
      <div className="space-y-6">
        
        {/* User Card */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-bold flex items-center justify-center text-sm shadow">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-slate-800 truncate">{user?.name}</h4>
            <span className="inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-700">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
