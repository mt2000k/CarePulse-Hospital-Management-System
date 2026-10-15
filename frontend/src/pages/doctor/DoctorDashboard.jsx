import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Calendar, Clock, CheckCircle2, Users, AlertCircle, Plus } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorStatsAndAppointments();
  }, []);

  const fetchDoctorStatsAndAppointments = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [statsRes, aptsRes] = await Promise.all([
        api.get('/stats/doctor'),
        api.get(`/appointments?date=${todayStr}`)
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (aptsRes.data.success) setTodayAppointments(aptsRes.data.data);
    } catch (err) {
      console.error('Failed to load doctor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Doctor Command Center">
      {loading ? (
        <LoadingSpinner label="Loading clinical schedule & stats..." />
      ) : (
        <div className="space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white rounded-3xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white/90">
                Doctor Portal
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-2">
                Good day, {user?.name}!
              </h2>
              <p className="text-xs md:text-sm text-white/80 mt-1 max-w-xl">
                Specialization: <span className="font-bold text-white">{user?.profile?.specialization || 'Attending Physician'}</span> • {user?.profile?.departmentId?.name}
              </p>
            </div>
            <Link to="/doctor/schedule">
              <Button variant="secondary" className="bg-white text-teal-800 hover:bg-slate-100 font-bold">
                <Clock className="w-4 h-4 mr-2" />
                Manage Working Hours
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Appointments"
              value={stats?.todayAppointments || 0}
              icon={Calendar}
              color="teal"
            />
            <StatCard
              title="Pending Review"
              value={stats?.pendingAppointments || 0}
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Completed Consultations"
              value={stats?.completedAppointments || 0}
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              title="Patients Treated"
              value={stats?.totalPatientsTreated || 0}
              icon={Users}
              color="purple"
            />
          </div>

          {/* Today's Schedule Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Today's Patient Schedule ({new Date().toLocaleDateString()})
              </h3>
              <Link to="/doctor/appointments">
                <Button variant="outline" size="sm">
                  View All Appointments
                </Button>
              </Link>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                No appointments booked for today.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Time</th>
                      <th className="p-3.5">Patient Name</th>
                      <th className="p-3.5">Gender / Age</th>
                      <th className="p-3.5">Reason for Visit</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {todayAppointments.map((apt) => (
                      <tr key={apt._id} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-bold text-slate-900">{apt.appointmentTime}</td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {apt.patientId?.userId?.name || 'Patient'}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {apt.patientId?.gender || 'N/A'}
                        </td>
                        <td className="p-3.5 max-w-xs truncate">{apt.reason}</td>
                        <td className="p-3.5 text-slate-600 font-semibold">{apt.appointmentType}</td>
                        <td className="p-3.5">
                          <Badge status={apt.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorDashboard;
