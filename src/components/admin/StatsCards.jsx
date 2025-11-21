'use client';

import Link from 'next/link';
import PropTypes from 'prop-types';
import {
  CubeIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';

/**
 * StatsCards - Estilo Premium Minimalista
 * Inspirado en paneles admin de marcas como Cardón, Kevingston, Etiqueta Negra
 */
export default function StatsCards({
  productsCount,
  ordersCount,
  usersCount,
  totalSales,
  pendingOrders,
}) {
  const stats = [
    {
      label: 'Productos',
      value: productsCount,
      icon: CubeIcon,
      href: '/admin/products',
    },
    {
      label: 'Pedidos',
      value: ordersCount,
      icon: ClipboardDocumentListIcon,
      href: '/admin/orders',
    },
    {
      label: 'Usuarios',
      value: usersCount,
      icon: UsersIcon,
      href: '/admin/users',
    },
    {
      label: 'Ventas Totales',
      value: `$${totalSales.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
      })}`,
      icon: CurrencyDollarIcon,
      href: '/admin/orders',
      subtitle: pendingOrders > 0 ? `${pendingOrders} pendientes` : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

StatsCards.propTypes = {
  productsCount: PropTypes.number.isRequired,
  ordersCount: PropTypes.number.isRequired,
  usersCount: PropTypes.number.isRequired,
  totalSales: PropTypes.number.isRequired,
  pendingOrders: PropTypes.number.isRequired,
};

/**
 * StatCard - Tarjeta individual con diseño premium
 */
function StatCard({ label, value, icon: Icon, href, subtitle }) {
  return (
    <Link href={href} className="group block">
      <div className="bg-white border border-gray-200 p-6 transition-all duration-300 hover:border-gray-900 hover:shadow-sm">
        {/* Header con icono */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-gray-50 group-hover:bg-gray-900 transition-colors duration-300">
            <Icon className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors duration-300" />
          </div>
          <ArrowUpRightIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-900 transition-colors duration-300" />
        </div>

        {/* Valor principal */}
        <p className="text-3xl font-light tracking-tight text-gray-900 mb-1">
          {value}
        </p>

        {/* Label */}
        <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">
          {label}
        </p>

        {/* Subtitle opcional */}
        {subtitle && (
          <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.elementType.isRequired,
  href: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};
