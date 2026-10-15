import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Building2, Stethoscope, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';

const DepartmentsList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments?status=active');
        if (res.data.success) {
          setDepartments(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load departments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  return (
    <PublicLayout>
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Clinical Departments & Centers of Excellence</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Explore our specialized medical faculties offering world-class care and diagnostics.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <LoadingSpinner label="Loading hospital departments..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept) => (
              <div
                key={dept._id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <img
                    src={dept.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80'}
                    alt={dept.name}
                    className="w-full h-48 object-cover bg-slate-100"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{dept.name}</h3>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg">
                        {dept.doctorCount || 0} Doctors
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {dept.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link to={`/doctors?departmentId=${dept._id}`}>
                    <Button variant="outline" className="w-full">
                      View Department Doctors <ArrowRight className="w-4 h-4 ml-2" />
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

export default DepartmentsList;
