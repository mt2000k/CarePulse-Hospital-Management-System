import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', description }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100'
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {description && (
          <p className="text-xs text-slate-500 mt-2 font-medium">{description}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorMap[color] || colorMap.blue}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatCard;
