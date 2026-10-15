import React from 'react';

const Badge = ({ status }) => {
  const getBadgeStyle = (st) => {
    switch (st) {
      case 'Confirmed':
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled':
      case 'Rejected':
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'No-show':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getBadgeStyle(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {status}
    </span>
  );
};

export default Badge;
