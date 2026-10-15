import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Phone, Mail, MapPin, Heart, ShieldCheck, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Care<span className="text-primary-400">Pulse</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Providing compassionate, world-class medical care with state-of-the-art diagnostic facilities and expert specialists.
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-2 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>JCI Accredited Hospital</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-primary-400 transition">Find a Doctor</Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-primary-400 transition">Clinical Departments</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-400 transition">Patient Portal Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary-400 transition">Patient Registration</Link>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Hospital Hours</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center justify-between text-slate-400">
                <span>Emergency Services:</span>
                <span className="text-emerald-400 font-semibold">24/7 Available</span>
              </li>
              <li className="flex items-center justify-between text-slate-400">
                <span>OPD Consultations:</span>
                <span className="text-slate-200">Mon - Sat: 8am - 8pm</span>
              </li>
              <li className="flex items-center justify-between text-slate-400">
                <span>Visiting Hours:</span>
                <span className="text-slate-200">4:00 PM - 7:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Emergency & Support</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">24/7 Emergency Line</p>
                  <p className="text-white font-bold text-base">+1 (800) 999-CARE</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Email Inquiries</p>
                  <p className="text-slate-200">contact@carepulse-hospital.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Main Campus</p>
                  <p className="text-slate-200">500 Medical Center Way, Healthcare City</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CarePulse Hospital System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for excellence in patient care <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
