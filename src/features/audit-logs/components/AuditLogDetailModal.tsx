import React from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils/format';
import { AuditLog } from '@/types/audit.types';
import { ShieldCheck, User, Globe, Clock, FileText } from 'lucide-react';

interface AuditLogDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLog | null;
}

export function AuditLogDetailModal({ open, onOpenChange, log }: AuditLogDetailModalProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <DialogHeader>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="font-mono text-xs">
            {log.action}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {log.entityType}
          </Badge>
        </div>
        <DialogTitle className="text-base font-bold text-slate-900 mt-2">
          Detail Aktivitas Audit #{log.id}
        </DialogTitle>
        <DialogDescription>
          Pencatatan rekam jejak operasional administrator sistem secara otomatis.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-3 max-h-[60vh] overflow-y-auto px-1 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-1">Pelaksana (Actor):</span>
            <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>{log.actorName}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{log.actorEmail}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-1">Waktu & IP Address:</span>
            <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>{formatDateTime(log.createdAt)}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">IP: {log.ipAddress || '127.0.0.1'}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-slate-400 block mb-1">Entitas Target:</span>
          <p className="font-semibold text-slate-800">
            {log.entityName || '-'} <span className="font-mono text-slate-400">({log.entityId || 'N/A'})</span>
          </p>
        </div>

        {log.details && (
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
              Payload Rincian (JSON)
            </span>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>Tutup</Button>
      </DialogFooter>
    </Dialog>
  );
}
