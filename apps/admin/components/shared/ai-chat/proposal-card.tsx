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

  const items = Array.isArray(proposal.data) ? proposal.data : [];

  return (
    <div className='mt-2 w-full max-w-sm rounded-lg border bg-card p-3 text-card-foreground shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between pb-2 border-b'>
        <span className='text-xs font-semibold capitalize'>
          {proposal.entity} Proposal ({items.length}{' '}
          {items.length === 1 ? 'item' : 'items'})
        </span>
        <span
          className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded border ${getBadgeColor()}`}
        >
          {proposal.action}
        </span>
      </div>

      {/* Body: Map through array items */}
      <div className='py-2.5 text-xs space-y-2 max-h-48 overflow-y-auto divide-y divide-border/40'>
        {items.map((item, index) => {
          const primaryName =
            item.name || item.title || item.code || `Item #${index + 1}`;

          return (
            <div
              key={index}
              className={index > 0 ? 'pt-2 space-y-1' : 'space-y-1'}
            >
              <div className='flex justify-between font-medium'>
                <span className='text-foreground'>{primaryName}</span>
                {item.slug && (
                  <span className='font-mono text-[11px] text-muted-foreground'>
                    {item.slug}
                  </span>
                )}
              </div>

              <div className='space-y-0.5 text-[11px] text-muted-foreground'>
                {item.hex && (
                  <div className='flex items-center gap-1.5'>
                    <span>Hex:</span>
                    <span
                      className='inline-block h-3 w-3 rounded-full border border-border'
                      style={{ backgroundColor: item.hex }}
                    />
                    <span className='font-mono'>{item.hex}</span>
                  </div>
                )}
                {item.basePrice !== undefined && (
                  <div className='flex justify-between'>
                    <span>Price:</span>
                    <span>${item.basePrice}</span>
                  </div>
                )}
                {item.amount !== undefined && (
                  <div className='flex justify-between'>
                    <span>Amount:</span>
                    <span>{item.amount}</span>
                  </div>
                )}
                {item.categoryId !== undefined && (
                  <div className='flex justify-between'>
                    <span>Category ID:</span>
                    <span>{item.categoryId}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Actions */}
      <div className='pt-2 border-t flex items-center justify-between'>
        {status === 'error' && (
          <span className='text-[11px] text-rose-500 font-medium'>
            Execution failed
          </span>
        )}
        {status === 'done' ? (
          <span className='text-xs text-emerald-600 font-medium ml-auto'>
            ✓ Executed
          </span>
        ) : (
          <button
            onClick={handleAction}
            disabled={status === 'loading'}
            className='ml-auto px-3 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors capitalize'
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
