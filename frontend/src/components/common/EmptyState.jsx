import React from 'react';
import { FolderOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no items to display at this moment.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-sm my-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
