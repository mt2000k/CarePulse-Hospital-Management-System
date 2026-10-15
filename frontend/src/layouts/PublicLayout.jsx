import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
