/**
 * Agency Tier Badge - Matches Brand Design System
 * Shows partnership level with proper styling
 */

type TierType = 'standard' | 'partner' | 'preferred';

interface TierBadgeProps {
  tier: TierType;
  className?: string;
}

const tierConfig: Record<TierType, { label: string; className: string; icon: string }> = {
  standard: {
    label: 'Standard Listing',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: '📋',
  },
  partner: {
    label: 'Verified Partner',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: '✓',
  },
  preferred: {
    label: 'Preferred Partner',
    className: 'bg-gradient-to-r from-primary-50 to-primary-100 text-coral-600 border-primary-200',
    icon: '⭐',
  },
};

export default function AgencyTierBadge({ tier, className = '' }: TierBadgeProps) {
  const config = tierConfig[tier];

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${config.className} ${className}`}
    >
      <span className="text-lg">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

