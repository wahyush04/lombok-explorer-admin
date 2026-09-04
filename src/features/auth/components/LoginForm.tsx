import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schemas/auth.schema';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Compass, Lock, Mail, AlertCircle } from 'lucide-react';
import { ApiError } from '@/lib/api/api-error';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const response = await authApi.login(data);
      const authData = response.data;

      if (!authData || !authData.user) {
        throw new Error('Respons autentikasi tidak valid.');
      }

      // Security check: Must be ADMIN
      if (authData.user.role !== 'ADMIN') {
        setServerError('Akses Ditolak: Hanya akun dengan role ADMINISTRATOR yang berwenang mengakses portal ini.');
        return;
      }

      setAuth(authData.user, authData.accessToken, authData.refreshToken);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.errorCode === 'ADMIN_AUTH_RATE_LIMIT_EXCEEDED' || err.statusCode === 429) {
          setServerError('Batas Keamanan: Terlalu banyak percobaan login dari IP ini. Sistem membatasi sementara selama 15 menit demi perlindungan akun administrator.');
        } else {
          setServerError(err.message || 'Email atau password salah.');
        }
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Terjadi kesalahan saat masuk ke sistem.');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 mb-3">
          <Compass className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Masuk Administrator</h2>
        <p className="text-xs text-slate-500 mt-1">
          Lombok Explorer Tourism Admin & Management Console
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-700 text-xs leading-relaxed">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email Administrator
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="email"
              placeholder="admin@example.com"
              className="pl-9"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kata Sandi
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="password"
              placeholder="••••••••"
              className="pl-9"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Masuk ke Portal Admin
        </Button>
      </form>
    </div>
  );
}
