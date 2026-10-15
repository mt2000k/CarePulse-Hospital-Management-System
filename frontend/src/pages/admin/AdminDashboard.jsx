import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Users, Stethoscope, Building2, Calendar, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#0c8de9', '#059669', '#f59e0b', '#dc2626', '#64748b'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      const res = await api.get('/stats/admin');
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
        setRecentAppointments(res.data.recentAppointments);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Hospital Administration Command Center">
      {loading ? (
        <LoadingSpinner label="Compiling hospital analytics..." />
      ) : (
        <div className="space-y-8">
          
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Patients"
              value={stats?.totalPatients || 0}
              icon={Users}
              color="blue"
              description="Registered health seekers"
            />
            <StatCard
              title="Active Doctors"
              value={stats?.totalDoctors || 0}
              icon={Stethoscope}
              color="teal"
              description="Across all clinical departments"
            />
            <StatCard
              title="Departments"
              value={stats?.totalDepartments || 0}
              icon={Building2}
              color="purple"
              description="Operational clinical units"
            />
            <StatCard
              title="Today's Appointments"
              value={stats?.todayAppointments || 0}
              icon={Calendar}
              color="amber"
              description="Scheduled consultations"
            />
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pie Chart: Appointment Status Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                Appointments Distribution by Status
              </h3>
              
              <div className="h-64 w-full">
                {charts?.statusDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {charts.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No status data available
                  </div>
                )}
              </div>
            </div>

            {/* Bar Chart: Appointments per Department */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Appointments Volume by Department
              </h3>

              <div className="h-64 w-full">
                {charts?.departmentDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.departmentDistribution}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0c8de9" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No department workload data available
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Recent Appointments Feed */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Recent Hospital Bookings Feed
            </h3>

            {recentAppointments.length === 0 ? (
              <p className="text-xs text-slate-400">No recent activity.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Apt #</th>
                      <th className="p-3.5">Patient</th>
                      <th className="p-3.5">Doctor</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {recentAppointments.map((apt) => (
                      <tr key={apt._id} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-mono font-bold text-slate-900">{apt.appointmentNumber}</td>
                        <td className="p-3.5 font-bold text-slate-900">{apt.patientId?.userId?.name}</td>
                        <td className="p-3.5 font-bold text-slate-800">{apt.doctorId?.userId?.name}</td>
                        <td className="p-3.5 text-slate-500">{apt.departmentId?.name}</td>
                        <td className="p-3.5 text-slate-600 font-semibold">{apt.appointmentDate} at {apt.appointmentTime}</td>
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

export default AdminDashboard;
