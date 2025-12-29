/**
 * AgencyStatusBadge Component
 * Displays agency tier with appropriate styling
 */

import type { AgencyStatus } from '../../lib/types/agencies';

interface AgencyStatusBadgeProps {
  status: AgencyStatus;
  className?: string;
}

const statusConfig: Record<AgencyStatus, { label: string; className: string }> = {
  standard: {
    label: 'Standard',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  partner: {
    label: 'Partner',
    className: 'bg-blue-50 text-blue-700 border-blue-300',
  },
  preferred: {
    label: 'Preferred',
    className: 'bg-gradient-to-r from-red-50 to-orange-50 text-[#FF6F61] border-red-300',
  },
};

export default function AgencyStatusBadge({ status, className = '' }: AgencyStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

