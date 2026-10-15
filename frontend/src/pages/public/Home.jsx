import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import api from '../../services/api';
import {
  Calendar,
  Search,
  Award,
  Users,
  ShieldCheck,
  Clock,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Activity,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import Button from '../../components/common/Button';

const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, deptRes] = await Promise.all([
          api.get('/doctors?limit=4&status=active'),
          api.get('/departments?limit=6&status=active')
        ]);
        if (docRes.data.success) setFeaturedDoctors(docRes.data.data);
        if (deptRes.data.success) setDepartments(deptRes.data.data);
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50/80 via-white to-slate-50 py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold border border-primary-200">
                <ShieldCheck className="w-4 h-4 text-primary-600" />
                <span>Premier Healthcare & Academic Medical Center</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Advanced Care, <br />
                <span className="text-primary-600">Compassionate</span> Healing.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect with world-class medical specialists, manage appointments effortlessly, and access your digital medical records in one secure portal.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/patient/book-appointment">
                  <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary-500/25">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
                <Link to="/doctors">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Search className="w-5 h-5 mr-2" />
                    Find a Doctor
                  </Button>
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-bold text-slate-900">50+</p>
                  <p className="text-xs text-slate-500 font-medium">Expert Specialists</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">15,000+</p>
                  <p className="text-xs text-slate-500 font-medium">Patients Served</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">99.4%</p>
                  <p className="text-xs text-slate-500 font-medium">Satisfaction Rate</p>
                </div>
              </div>
            </div>

            {/* Hero Banner Graphic */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern Hospital Facilities"
                  className="w-full h-[440px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">24/7 Emergency & ICU Response</h4>
                    <p className="text-xs text-slate-500">Dedicated critical care team on immediate standby.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Hospital Departments */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              Clinical Excellence
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Specialized Medical Departments
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Our multidisciplinary clinical units combine cutting-edge medicine with patient-centered treatment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept) => (
              <div
                key={dept._id}
                className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-5 border border-slate-100">
                    <Stethoscope className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{dept.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {dept.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary-700">
                    {dept.doctorCount || 0} Specialists
                  </span>
                  <Link
                    to={`/doctors?departmentId=${dept._id}`}
                    className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1"
                  >
                    View Doctors <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                Medical Staff
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
                Featured Medical Specialists
              </h2>
            </div>
            <Link to="/doctors" className="mt-4 md:mt-0">
              <Button variant="outline">
                View All Doctors <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doc) => (
              <div key={doc._id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition">
                <img
                  src={doc.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'}
                  alt={doc.userId?.name}
                  className="w-full h-48 object-cover rounded-2xl mb-4 bg-slate-100"
                />
                <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md">
                  {doc.departmentId?.name || 'Specialist'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{doc.userId?.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{doc.specialization}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{doc.experience} Yrs Exp.</span>
                  <span className="font-bold text-slate-900">${doc.consultationFee}</span>
                </div>
                <Link to={`/patient/book-appointment?doctorId=${doc._id}`} className="mt-4 block">
                  <Button className="w-full" size="sm">
                    Book Consultation
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                Why CarePulse
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Setting New Standards in Patient Care & Medical Precision
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We combine experienced physician leadership, integrated digital health records, and rigorous patient safety protocols to deliver standard-setting medical outcomes.
              </p>

              <div className="space-y-3">
                {[
                  'Board-certified medical specialists across 25+ disciplines',
                  'Zero wait-time digital appointment scheduling',
                  'Instant digital release of consultation notes & prescriptions',
                  'Fully equipped ICU & emergency response infrastructure'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                <Award className="w-8 h-8 text-primary-600" />
                <h4 className="font-bold text-slate-900 text-base">JCI Accredited</h4>
                <p className="text-xs text-slate-500">Highest global benchmark for clinical quality and safety.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                <Clock className="w-8 h-8 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-base">24/7 Availability</h4>
                <p className="text-xs text-slate-500">Continuous emergency services and trauma support.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                <Users className="w-8 h-8 text-purple-600" />
                <h4 className="font-bold text-slate-900 text-base">Patient-Centric</h4>
                <p className="text-xs text-slate-500">Individualized treatment plans tailored to patient needs.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                <Activity className="w-8 h-8 text-rose-600" />
                <h4 className="font-bold text-slate-900 text-base">Advanced Diagnostics</h4>
                <p className="text-xs text-slate-500">High-resolution MRI, CT, and robotic surgical suites.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
