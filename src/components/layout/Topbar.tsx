import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Menu, LogOut, Bell } from 'lucide-react';
import { apiClient } from '@/lib/api/api-client';
import { LanguageSwitcher } from '@/components/localization/LanguageSwitcher';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface TopbarProps {
  onNavigate: (path: string) => void;
}

export function Topbar({ onNavigate }: TopbarProps) {
  const { user, clearAuth } = useAuthStore();
  const { toggleMobileOpen } = useSidebarStore();
  const { t } = useTranslation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Even if network fails, logout client-side
    } finally {
      setIsLoggingOut(false);
      clearAuth();
      onNavigate('/login');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleMobileOpen}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label={t.navigation.mainMenu}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">{t.common.administrationPanel}</span>
            <span className="text-xs text-slate-300 hidden sm:inline">/</span>
            <span className="text-xs font-semibold text-slate-800">Lombok Explorer</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Admin UI Language Switcher */}
          <LanguageSwitcher />

          {/* Notification placeholder */}
          <button
            title={`${t.common.notifications} (${t.common.comingSoon})`}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          <div className="h-4 w-[1px] bg-slate-200" />

          {/* Admin User Profile */}
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4">
                  {user?.role || 'ADMIN'}
                </Badge>
              </div>
              <span className="text-[11px] text-slate-400 leading-tight">
                {user?.email || ''}
              </span>
            </div>
          </div>

          {/* Logout button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLogoutConfirm(true)}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 h-8 px-2.5 ml-1"
            title={t.common.logout}
          >
            <LogOut className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline text-xs">{t.common.logout}</span>
          </Button>
        </div>
      </header>

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title={t.common.logout + '?'}
        description="Sesi login administrator Anda akan diakhiri. Anda harus memasukkan kredensial admin kembali untuk mengakses portal."
        confirmText={t.common.logout}
        cancelText={t.common.cancel}
        isDestructive
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
      />
    </>
  );
}
