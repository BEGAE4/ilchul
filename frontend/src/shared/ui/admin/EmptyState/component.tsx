import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 px-4 border border-dashed border-gray-200 bg-white rounded">
      <div className="text-gray-400">{icon ?? <Inbox size={32} />}</div>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {description && <p className="text-xs text-gray-600">{description}</p>}
    </div>
  );
};

export default EmptyState;
