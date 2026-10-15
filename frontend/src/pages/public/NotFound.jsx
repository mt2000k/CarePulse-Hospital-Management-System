import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import Button from '../../components/common/Button';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h1>
        <p className="text-sm text-slate-500 max-w-sm mt-2 mb-6">
          The requested medical system resource or page could not be located.
        </p>
        <Link to="/">
          <Button>
            <Home className="w-4 h-4 mr-2" /> Return to Home
          </Button>
        </Link>
      </div>
    </PublicLayout>
  );
};

export default NotFound;
