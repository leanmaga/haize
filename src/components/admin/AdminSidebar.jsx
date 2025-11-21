'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  CubeIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  PlusCircleIcon,
  ListBulletIcon,
  CogIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

/**
 * AdminSidebar - Estilo Premium Minimalista
 * Diseño inspirado en marcas de ropa de alta gama
 */
const AdminSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: HomeIcon,
      href: '/admin',
    },
    {
      title: 'Productos',
      icon: CubeIcon,
      href: '/admin/products',
      submenu: [
        {
          title: 'Agregar',
          icon: PlusCircleIcon,
          href: '/admin/products/add',
        },
        {
          title: 'Catálogo',
          icon: ListBulletIcon,
          href: '/admin/products',
        },
      ],
    },
    {
      title: 'Pedidos',
      icon: ShoppingCartIcon,
      href: '/admin/orders',
    },
    {
      title: 'Usuarios',
      icon: UserGroupIcon,
      href: '/admin/users',
    },
    {
      title: 'Configuración',
      icon: CogIcon,
      href: '/admin/settings',
    },
  ];

  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const isExactActive = (href) => pathname === href;

  return (
    <aside className="w-full md:w-64 bg-gray-950 md:min-h-screen md:sticky md:top-0">
      {/* Logo/Brand */}
      <div className="px-6 py-8 border-b border-gray-800">
        <Link href="/admin" className="block">
          <h1 className="text-white text-xl font-light tracking-[0.2em] uppercase">
            HAIZE
          </h1>
          <span className="text-gray-500 text-xs tracking-widest uppercase mt-1 block">
            Administración
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasSubmenu = item.submenu && item.submenu.length > 0;

            return (
              <li key={item.href}>
                {/* Main Menu Item */}
                <Link
                  href={hasSubmenu ? item.submenu[1].href : item.href}
                  className={`
                    flex items-center justify-between px-4 py-3 text-sm transition-all duration-200
                    ${
                      active && !hasSubmenu
                        ? 'bg-white text-gray-900'
                        : 'text-gray-400 hover:text-white hover:bg-gray-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium tracking-wide">
                      {item.title}
                    </span>
                  </div>
                  {hasSubmenu && (
                    <ChevronRightIcon
                      className={`h-4 w-4 transition-transform ${
                        active ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </Link>

                {/* Submenu */}
                {hasSubmenu && active && (
                  <ul className="mt-1 ml-4 border-l border-gray-800 pl-4 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const subActive = isExactActive(subItem.href);

                      return (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className={`
                              flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200
                              ${
                                subActive
                                  ? 'text-white bg-gray-800'
                                  : 'text-gray-500 hover:text-white'
                              }
                            `}
                          >
                            <SubIcon className="h-4 w-4" />
                            <span>{subItem.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-800">
        <p className="text-gray-600 text-xs tracking-wider">© 2025 HAIZE</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
