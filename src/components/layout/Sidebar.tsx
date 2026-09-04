import React from 'react';
import { useSidebarStore } from '@/stores/sidebar.store';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  MapPin,
  FolderTree,
  UtensilsCrossed,
  Hotel,
  Users,
  Star,
  MessageSquare,
  CalendarRange,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Compass,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/destinations', label: 'Destinasi', icon: MapPin },
  { path: '/categories', label: 'Kategori', icon: FolderTree },
  { path: '/restaurants', label: 'Kuliner & Restoran', icon: UtensilsCrossed },
  { path: '/accommodations', label: 'Akomodasi & Hotel', icon: Hotel },
  { path: '/users', label: 'Pengguna', icon: Users },
  { path: '/reviews', label: 'Moderasi Review', icon: Star },
  { path: '/feeds', label: 'Feed & Laporan', icon: MessageSquare },
  { path: '/itinerary-templates', label: 'Template Rencana', icon: CalendarRange },
  { path: '/audit-logs', label: 'Audit Log Sistem', icon: ShieldCheck },
];

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const { isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen } = useSidebarStore();

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          <div
            onClick={() => handleNav('/dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer overflow-hidden"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
                  Lombok Explorer
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
            )}
          </div>

          {/* Close for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-2 pb-2">
            {!isCollapsed ? (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Menu Utama
              </span>
            ) : (
              <div className="h-2" />
            )}
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'group flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600',
                    !isCollapsed && 'mr-3'
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Footer Collapse Toggle (Desktop only) */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-slate-100">
          {!isCollapsed && (
            <span className="text-[11px] text-slate-400 font-medium pl-1">
              v1.0.0 • Production
            </span>
          )}
          <button
            onClick={toggleCollapse}
            className={cn(
              'p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors',
              isCollapsed && 'mx-auto'
            )}
            title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
