import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;

  switch (status.toUpperCase()) {
    case 'PUBLISHED':
    case 'ACTIVE':
    case 'APPROVED':
    case 'RESOLVED':
      return <Badge variant="success" className={className}>{status}</Badge>;
    case 'DRAFT':
    case 'PENDING':
    case 'REVIEWED':
      return <Badge variant="warning" className={className}>{status}</Badge>;
    case 'ARCHIVED':
    case 'INACTIVE':
    case 'DISMISSED':
    case 'HIDDEN':
      return <Badge variant="secondary" className={className}>{status}</Badge>;
    case 'SUSPENDED':
    case 'REJECTED':
    case 'DELETED':
      return <Badge variant="destructive" className={className}>{status}</Badge>;
    default:
      return <Badge variant="outline" className={className}>{status}</Badge>;
  }
}
