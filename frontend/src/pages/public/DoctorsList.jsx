import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import api from '../../services/api';
import { Search, Filter, Stethoscope, Calendar, Award, DollarSign } from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const DoctorsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nameQuery, setNameQuery] = useState(searchParams.get('name') || '');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('departmentId') || '');
  const [specializationQuery, setSpecializationQuery] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [selectedDept]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments?status=active');
      if (res.data.success) setDepartments(res.data.data);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let url = '/doctors?status=active';
      if (selectedDept) url += `&departmentId=${selectedDept}`;
      if (nameQuery) url += `&name=${encodeURIComponent(nameQuery)}`;
      if (specializationQuery) url += `&specialization=${encodeURIComponent(specializationQuery)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load doctors', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <PublicLayout>
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Find a Medical Specialist</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Browse through our directory of board-certified physicians and schedule a consultation.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters bar */}
        <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-center">
          
          {/* Search by Name */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search doctor by name..."
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter by Department */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Specialization */}
          <div>
            <input
              type="text"
              placeholder="Specialization (e.g. Cardiology)..."
              value={specializationQuery}
              onChange={(e) => setSpecializationQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Search Action */}
          <div>
            <Button type="submit" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </form>

        {/* Doctor Grid */}
        {loading ? (
          <LoadingSpinner label="Fetching doctor availability..." />
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No Doctors Match Your Search"
            description="Try clearing your filters or selecting a different department."
            actionLabel="Reset Filters"
            onAction={() => {
              setNameQuery('');
              setSelectedDept('');
              setSpecializationQuery('');
              setSearchParams({});
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={doctor.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80'}
                      alt={doctor.userId?.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-100 flex-shrink-0 bg-slate-100"
                    />
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-primary-50 text-primary-700">
                        {doctor.departmentId?.name || 'Medical Dept'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{doctor.userId?.name}</h3>
                      <p className="text-xs text-slate-500 font-semibold">{doctor.specialization}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{doctor.qualification}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {doctor.bio || 'Experienced medical practitioner providing comprehensive clinical diagnostics.'}
                  </p>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-2 py-3 border-t border-b border-slate-100 mb-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Experience</span>
                      <span className="font-bold text-slate-800">{doctor.experience} Years</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Consultation Fee</span>
                      <span className="font-bold text-primary-600">${doctor.consultationFee}</span>
                    </div>
                  </div>

                  <Link to={`/patient/book-appointment?doctorId=${doctor._id}`}>
                    <Button className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default DoctorsList;
