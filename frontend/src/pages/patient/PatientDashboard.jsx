import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  Calendar,
  Clock,
  PlusCircle,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Stethoscope
} from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientStats();
  }, []);

  const fetchPatientStats = async () => {
    try {
      const res = await api.get('/stats/patient');
      if (res.data.success) {
        setStats(res.data.stats);
        setNextAppointment(res.data.nextAppointment);
      }
    } catch (err) {
      console.error('Failed to load patient stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Patient Dashboard">
      {loading ? (
        <LoadingSpinner label="Loading your personal health portal..." />
      ) : (
        <div className="space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-3xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white/90">
                Patient Portal
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-2">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-xs md:text-sm text-white/80 mt-1 max-w-xl">
                Manage your appointments, access digital prescriptions, and connect with your care team.
              </p>
            </div>
            <Link to="/patient/book-appointment">
              <Button variant="secondary" size="lg" className="bg-white text-primary-700 hover:bg-slate-100 font-bold shadow-md">
                <PlusCircle className="w-5 h-5 mr-2" />
                Book New Appointment
              </Button>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Upcoming Appointments"
              value={stats?.upcomingAppointments || 0}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Completed Visits"
              value={stats?.completedAppointments || 0}
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              title="Cancelled Appointments"
              value={stats?.cancelledAppointments || 0}
              icon={XCircle}
              color="rose"
            />
            <StatCard
              title="Medical Records"
              value={stats?.medicalRecordsCount || 0}
              icon={FileText}
              color="purple"
            />
          </div>

          {/* Next Appointment Feature Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Next Scheduled Appointment
            </h3>

            {nextAppointment ? (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={nextAppointment.doctorId?.userId?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'}
                    alt={nextAppointment.doctorId?.userId?.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-white"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">
                        {nextAppointment.doctorId?.userId?.name}
                      </h4>
                      <Badge status={nextAppointment.status} />
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">
                      {nextAppointment.doctorId?.specialization} • {nextAppointment.departmentId?.name}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      📅 Date: <span className="font-bold text-slate-900">{nextAppointment.appointmentDate}</span> at <span className="font-bold text-slate-900">{nextAppointment.appointmentTime}</span>
                    </p>
                  </div>
                </div>

                <Link to="/patient/appointments">
                  <Button variant="outline" size="sm">
                    View Appointment Details
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">No upcoming appointments scheduled.</p>
                <Link to="/patient/book-appointment" className="mt-3 inline-block">
                  <Button size="sm">Book Your Appointment Now</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/patient/appointments"
              className="p-5 bg-slate-50 hover:bg-primary-50/50 rounded-2xl border border-slate-200/80 transition group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">My Appointments</h4>
                <p className="text-xs text-slate-500">View upcoming & history</p>
              </div>
            </Link>

            <Link
              to="/patient/records"
              className="p-5 bg-slate-50 hover:bg-primary-50/50 rounded-2xl border border-slate-200/80 transition group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Medical Records</h4>
                <p className="text-xs text-slate-500">Consultation notes & Rx</p>
              </div>
            </Link>

            <Link
              to="/patient/profile"
              className="p-5 bg-slate-50 hover:bg-primary-50/50 rounded-2xl border border-slate-200/80 transition group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">My Profile</h4>
                <p className="text-xs text-slate-500">Personal & emergency info</p>
              </div>
            </Link>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientDashboard;
