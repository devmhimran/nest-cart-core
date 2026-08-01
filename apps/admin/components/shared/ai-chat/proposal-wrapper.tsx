import {
  PlusCircle,
  Pencil,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { ProposalData } from '@/types';
import React, { useState } from 'react';

interface ProposalWrapperProps {
  proposal: ProposalData;
  onConfirm?: (proposal: ProposalData) => Promise<void>;
  children: React.ReactNode;
}

export function ProposalWrapper({
  proposal,
  onConfirm,
  children,
}: ProposalWrapperProps) {
  const [status, setStatus] = useState<
    'pending' | 'loading' | 'done' | 'error'
  >('pending');

  const handleAction = async () => {
    setStatus('loading');
    try {
      if (onConfirm) {
        await onConfirm(proposal);
      }
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const getBadgeConfig = () => {
    switch (proposal.action) {
      case 'create':
        return {
          icon: PlusCircle,
          label: 'Create',
          badge:
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'update':
        return {
          icon: Pencil,
          label: 'Update',
          badge:
            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'delete':
        return {
          icon: Trash2,
          label: 'Delete',
          badge:
            'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;
  const items = Array.isArray(proposal.data) ? proposal.data : [proposal.data];

  return (
    <div className='mt-2 w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all border-border/80 hover:border-border'>
      {/* Header */}
      <div className='flex items-center justify-between border-b px-4 py-2.5 bg-muted/30'>
        <div className=''>
          <div className='text-xs font-semibold capitalize tracking-tight text-foreground/90'>
            {proposal.entity} Proposal
          </div>
          <div className='text-[11px] text-muted-foreground font-mono'>
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${config.badge}`}
        >
          <Icon className='h-3 w-3' />
          {config.label}
        </span>
      </div>

      {/* Content */}
      <div className='p-4 space-y-3'>{children}</div>

      {/* Footer / Actions */}
      <div className='flex items-center justify-between border-t px-4 py-2.5 bg-muted/10'>
        {status === 'error' && (
          <span className='inline-flex items-center gap-1 text-xs text-rose-500 font-medium'>
            <AlertCircle className='h-3.5 w-3.5' />
            Execution failed
          </span>
        )}

        {status === 'done' ? (
          <span className='inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium ml-auto'>
            <Check className='h-4 w-4' />
            Executed
          </span>
        ) : (
          <button
            onClick={handleAction}
            disabled={status === 'loading'}
            className={`ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              proposal.action === 'delete'
                ? 'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            } disabled:opacity-50`}
          >
            {status === 'loading' && (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            )}
            {status === 'loading'
              ? 'Processing...'
              : `Confirm ${proposal.action}`}
          </button>
        )}
      </div>
    </div>
  );
}
