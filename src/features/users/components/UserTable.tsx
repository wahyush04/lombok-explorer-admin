import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user.api';
import { User, UserFilters, UserRole, UserStatus } from '@/types/user.types';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils/format';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Shield,
  UserCheck,
  UserX,
  Lock,
  ArrowUpDown,
  Mail,
} from 'lucide-react';

export function UserTable() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    search: '',
    role: undefined,
    status: undefined,
    sortBy: 'createdAt',
    order: 'desc',
  });

  // Status Change Dialog
  const [statusTarget, setStatusTarget] = useState<User | null>(null);
  const [nextStatus, setNextStatus] = useState<UserStatus>('SUSPENDED');
  const [suspendReason, setSuspendReason] = useState('');

  // Role Change Dialog
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [nextRole, setNextRole] = useState<UserRole>('MODERATOR');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const res = await userApi.getUsers(filters);
      return res;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: UserStatus; reason?: string }) => {
      return userApi.updateUserStatus(id, { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setStatusTarget(null);
      setSuspendReason('');
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      return userApi.updateUserRole(id, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setRoleTarget(null);
    },
  });

  const users = data?.data || [];
  const meta = data?.meta;

  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      sortBy: field,
      order: prev.sortBy === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge variant="default" className="text-[10px] bg-indigo-600">
            <ShieldCheck className="h-3 w-3 mr-1" /> ADMIN
          </Badge>
        );
      case 'MODERATOR':
        return (
          <Badge variant="secondary" className="text-[10px] bg-cyan-100 text-cyan-800">
            <Shield className="h-3 w-3 mr-1" /> MODERATOR
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] text-slate-600">
            USER
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SearchInput
          value={filters.search || ''}
          onChange={(val) => setFilters((prev) => ({ ...prev, search: val, page: 1 }))}
          placeholder="Cari nama pengguna atau email..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center space-x-2">
          <Select
            value={filters.role || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                role: (e.target.value as UserRole) || undefined,
                page: 1,
              }))
            }
            className="w-36 h-9 text-xs"
          >
            <option value="">Semua Peran</option>
            <option value="USER">User Wisatawan</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Administrator</option>
          </Select>

          <Select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: (e.target.value as UserStatus) || undefined,
                page: 1,
              }))
            }
            className="w-36 h-9 text-xs"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="DEACTIVATED">DEACTIVATED</option>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      {isError ? (
        <ErrorState message="Gagal memuat daftar pengguna." onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2 p-4 bg-white rounded-xl border border-slate-200">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="Tidak ada pengguna ditemukan"
          description="Coba gunakan kata kunci pencarian atau filter yang berbeda."
          icon={<Users className="h-7 w-7" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort('name')}
                  className="cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Pengguna</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead>Peran (Role)</TableHead>
                <TableHead>Status Akun</TableHead>
                <TableHead>Email Terverifikasi</TableHead>
                <TableHead
                  onClick={() => handleSort('createdAt')}
                  className="cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Terdaftar Pada</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Aksi Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((usr) => (
                <TableRow key={usr.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                        {usr.avatarUrl ? (
                          <img src={usr.avatarUrl} alt={usr.name} className="h-full w-full object-cover" />
                        ) : (
                          usr.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-slate-900 block">
                          {usr.name}
                        </span>
                        <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                          <Mail className="h-3 w-3" />
                          <span>{usr.email}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(usr.role)}</TableCell>
                  <TableCell>
                    <StatusBadge status={usr.status} />
                  </TableCell>
                  <TableCell>
                    {usr.isEmailVerified ? (
                      <span className="inline-flex items-center text-xs text-emerald-600 font-medium">
                        <UserCheck className="h-3.5 w-3.5 mr-1" /> Ya
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs text-slate-400">
                        <UserX className="h-3.5 w-3.5 mr-1" /> Belum
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500">{formatDate(usr.createdAt)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRoleTarget(usr);
                          setNextRole(usr.role);
                        }}
                        className="h-7 text-xs px-2"
                      >
                        <Shield className="h-3 w-3 mr-1 text-indigo-600" />
                        Peran
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStatusTarget(usr);
                          setNextStatus(usr.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
                          setSuspendReason(usr.suspendReason || '');
                        }}
                        className={`h-7 text-xs px-2 ${
                          usr.status === 'ACTIVE'
                            ? 'text-amber-700 hover:bg-amber-50'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Status
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            meta={meta}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* Role Change Dialog */}
      {roleTarget && (
        <Dialog open={Boolean(roleTarget)} onOpenChange={(open) => !open && setRoleTarget(null)} maxWidth="sm">
          <DialogHeader>
            <DialogTitle>Ubah Peran Pengguna</DialogTitle>
            <DialogDescription>
              Atur hak akses kewenangan administratif untuk <strong>{roleTarget.name}</strong> ({roleTarget.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-2">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
              Peran akun saat ini: <strong>{roleTarget.role}</strong>. Berdasarkan spesifikasi Admin API v1.0, hak akses role administrator diatur melalui konfigurasi database superadmin guna menjaga keamanan otorisasi sistem.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleTarget(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Status Change Dialog */}
      {statusTarget && (
        <Dialog open={Boolean(statusTarget)} onOpenChange={(open) => !open && setStatusTarget(null)} maxWidth="sm">
          <DialogHeader>
            <DialogTitle>Ubah Status Akun: {statusTarget.name}</DialogTitle>
            <DialogDescription>
              Ubah status akses pengguna ke dalam platform Lombok Explorer.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Baru</label>
              <Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value as UserStatus)}>
                <option value="ACTIVE">ACTIVE (Aktif Normal)</option>
                <option value="SUSPENDED">SUSPENDED (Ditangguhkan Sementara)</option>
                <option value="DEACTIVATED">DEACTIVATED (Dinonaktifkan Permanen)</option>
              </Select>
            </div>

            {nextStatus !== 'ACTIVE' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Penangguhan / Pemblokiran *
                </label>
                <Input
                  placeholder="cth: Pelanggaran ketentuan ulasan komunitas spam..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusTarget(null)} disabled={statusMutation.isPending}>
              Batal
            </Button>
            <Button
              variant={nextStatus === 'ACTIVE' ? 'default' : 'destructive'}
              onClick={() =>
                statusMutation.mutate({
                  id: statusTarget.id,
                  status: nextStatus,
                  reason: suspendReason || undefined,
                })
              }
              isLoading={statusMutation.isPending}
            >
              Terapkan Perubahan
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
