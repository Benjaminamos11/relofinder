/**
 * Tier Badge Component
 * Visual indicator for agency partnership level
 */

type TierType = 'standard' | 'partner' | 'preferred';

interface TierBadgeProps {
  tier: TierType;
  className?: string;
}

const tierConfig = {
  standard: {
    label: 'Standard Listing',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: '📋',
  },
  partner: {
    label: 'Verified Partner',
    className: 'bg-blue-50 text-blue-700 border-blue-300',
    icon: '✓',
  },
  preferred: {
    label: 'Preferred Partner',
    className: 'bg-gradient-to-r from-red-50 to-orange-50 text-[#FF6F61] border-red-300',
    icon: '⭐',
  },
};

export default function TierBadge({ tier, className = '' }: TierBadgeProps) {
  const config = tierConfig[tier];

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${config.className} ${className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

