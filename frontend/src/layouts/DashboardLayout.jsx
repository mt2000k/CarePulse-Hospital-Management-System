import React from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar />
        <main className="flex-1 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm min-h-[calc(100vh-8rem)]">
          {title && (
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
