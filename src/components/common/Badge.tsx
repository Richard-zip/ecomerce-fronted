import React from 'react';
import { ProductCondition, OrderStatus, Role } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  const variantClasses = {
    primary: 'bg-[#F0F4F8] text-[#102A43] border border-[#D9E2EC]',
    success: 'bg-[#EAF5EE] text-[#2F855A] border border-[#B4E0C4]',
    warning: 'bg-[#FBF5EA] text-[#8C6517] border border-[#D6A84F]',
    danger: 'bg-[#FDE8E8] text-[#C53030] border border-[#F8B4B4]',
    neutral: 'bg-[#F5F7FA] text-[#627D98] border border-[#D9E2EC]',
    gold: 'bg-[#FBF5EA] text-[#8C6517] border border-[#D6A84F]',
  }[variant];

  return (
    <span className={`inline-flex items-center rounded-[8px] ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};

export const ConditionBadge: React.FC<{ condition: ProductCondition }> = ({ condition }) => {
  const mapping: Record<ProductCondition, { label: string; variant: BadgeProps['variant'] }> = {
    NUEVO: { label: 'Nuevo', variant: 'success' },
    COMO_NUEVO: { label: 'Como nuevo', variant: 'primary' },
    USADO_BUENO: { label: 'Buen estado', variant: 'warning' },
    USADO_REGULAR: { label: 'Uso regular', variant: 'neutral' },
  };

  const current = mapping[condition] || { label: condition, variant: 'neutral' };

  return <Badge variant={current.variant}>{current.label}</Badge>;
};

export const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  if (role === 'VENDEDOR') {
    return <Badge variant="warning">🎓 Vendedor</Badge>;
  }
  return <Badge variant="primary">🎒 Estudiante</Badge>;
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const mapping: Record<OrderStatus, { label: string; variant: BadgeProps['variant']; icon: string }> = {
    PENDING: { label: 'Pendiente', variant: 'warning', icon: '⏳' },
    CONFIRMED: { label: 'Confirmado', variant: 'primary', icon: '🤝' },
    DELIVERED: { label: 'Entregado', variant: 'success', icon: '✅' },
    CANCELLED: { label: 'Cancelado', variant: 'danger', icon: '❌' },
  };

  const item = mapping[status] || { label: status, variant: 'neutral', icon: '•' };

  return (
    <Badge variant={item.variant} className="gap-1.5 font-semibold">
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </Badge>
  );
};
