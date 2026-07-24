import { ProposalData } from '@/types';
import { useState } from 'react';

interface ProposalCardProps {
  proposal: ProposalData;
  onConfirm?: (proposal: ProposalData) => Promise<void> | void;
}

export function ProposalCard({ proposal, onConfirm }: ProposalCardProps) {
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

  const getBadgeColor = () => {
    switch (proposal.action) {
      case 'create':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'update':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'delete':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className='mt-2 w-full max-w-sm rounded-lg border bg-card p-3 text-card-foreground shadow-sm'>
      <div className='flex items-center justify-between pb-2 border-b'>
        <span className='text-xs font-semibold capitalize'>
          {proposal.entity} Proposal
        </span>
        <span
          className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded border ${getBadgeColor()}`}
        >
          {proposal.action}
        </span>
      </div>

      <div className='py-2.5 text-xs space-y-1'>
        {proposal.data?.name && (
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Name:</span>
            <span className='font-medium'>{proposal.data.name}</span>
          </div>
        )}
        {proposal.data?.slug && (
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Slug:</span>
            <span className='font-mono text-[11px] text-muted-foreground'>
              {proposal.data.slug}
            </span>
          </div>
        )}
      </div>

      <div className='pt-2 border-t flex justify-end'>
        {status === 'done' ? (
          <span className='text-xs text-emerald-600 font-medium'>
            ✓ Executed
          </span>
        ) : (
          <button
            onClick={handleAction}
            disabled={status === 'loading'}
            className='px-3 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors capitalize'
          >
            {status === 'loading'
              ? 'Processing...'
              : `Confirm ${proposal.action}`}
          </button>
        )}
      </div>
    </div>
  );
}
