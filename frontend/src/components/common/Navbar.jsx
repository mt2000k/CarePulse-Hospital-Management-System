import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Activity, User, LogOut, Menu, X, Calendar, LayoutDashboard, ChevronDown, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md group-hover:bg-primary-700 transition">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight block leading-none">
                Care<span className="text-primary-600 dark:text-primary-400">Pulse</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Hospital System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition ${
                isActive('/') ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/doctors"
              className={`text-sm font-medium transition ${
                isActive('/doctors') ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Find Doctors
            </Link>
            <Link
              to="/departments"
              className={`text-sm font-medium transition ${
                isActive('/departments') ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Departments
            </Link>
          </nav>

          {/* Right Action Menu (Theme Toggle + User Controls) */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle Theme"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={getDashboardRoute()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      Dashboard
                    </Link>

                    {user.role === 'patient' && (
                      <Link
                        to="/patient/appointments"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        My Appointments
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition border-t border-slate-100 dark:border-slate-700 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition"
                >
                  Register Patient
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Theme Toggle & Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
          >
            Home
          </Link>
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
          >
            Find Doctors
          </Link>
          <Link
            to="/departments"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
          >
            Departments
          </Link>

          {user ? (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="px-3 py-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <Link
                to={getDashboardRoute()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-primary-600 dark:text-primary-400 font-semibold bg-primary-50 dark:bg-primary-950"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl"
              >
                Register Patient
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
