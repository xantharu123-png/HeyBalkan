import { BadgeCheck } from 'lucide-react';

export default function VerifiedBadge({ status, size = 22, label }: { status?: string | null; size?: number; label?: string }) {
  if (status !== 'verified') return null;
  return (
    <BadgeCheck
      size={size}
      className="inline-block text-sky-400 fill-white/10 align-middle shrink-0"
      aria-label={label || 'Verified'}
      role="img"
    />
  );
}
