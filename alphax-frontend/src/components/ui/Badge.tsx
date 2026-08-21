import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'accent' | 'muted';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'muted', children, className = '' }) => {
  const variantClass = {
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    accent: 'badge-accent',
    muted: 'badge-muted',
  }[variant];

  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
};
