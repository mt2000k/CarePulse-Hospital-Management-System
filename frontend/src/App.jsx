import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Protected Route Wrapper
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import DoctorsList from './pages/public/DoctorsList';
import DepartmentsList from './pages/public/DepartmentsList';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import NotFound from './pages/public/NotFound';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorSchedulePage from './pages/doctor/DoctorSchedulePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage';
import AdminPatientsPage from './pages/admin/AdminPatientsPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage';

function App() {
  return (
    <Routes>
      {/* Public Website Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/doctors" element={<DoctorsList />} />
      <Route path="/departments" element={<DepartmentsList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Patient Portal Protected Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute roles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/book-appointment"
        element={
          <ProtectedRoute roles={['patient']}>
            <BookAppointmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute roles={['patient']}>
            <PatientAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/records"
        element={
          <ProtectedRoute roles={['patient']}>
            <PatientMedicalRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute roles={['patient']}>
            <PatientProfile />
          </ProtectedRoute>
        }
      />

      {/* Doctor Portal Protected Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute roles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute roles={['doctor']}>
            <DoctorAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/schedule"
        element={
          <ProtectedRoute roles={['doctor']}>
            <DoctorSchedulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute roles={['doctor']}>
            <PatientProfile /> {/* Reused profile editor */}
          </ProtectedRoute>
        }
      />

      {/* Admin Portal Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDoctorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/patients"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminPatientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDepartmentsPage />
          </ProtectedRoute>
        }
      />

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
