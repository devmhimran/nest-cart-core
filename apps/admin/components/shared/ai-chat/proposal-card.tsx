// components/chat/proposals/proposal-card.tsx
import React from 'react';
import { ProposalWrapper } from './proposal-wrapper';
import { ProductProposalCard } from './product-proposal-card';
import { PromoProposalCard } from './promo-proposal-card';
import { ColorProposalCard } from './color-proposal-card';
import { CategoryProposalCard } from './category-proposal-card';
import { SizeProposalCard } from './size-proposal-card';
import { ProposalData } from '@/types';

interface ProposalCardProps {
  proposal: ProposalData;
  onConfirm?: (proposal: ProposalData) => Promise<void>;
}

export function ProposalCard({ proposal, onConfirm }: ProposalCardProps) {
  const items = Array.isArray(proposal.data) ? proposal.data : [proposal.data];

  const renderEntityContent = () => {
    switch (proposal.entity) {
      case 'product':
        return <ProductProposalCard items={items} />;
      case 'promoCode':
        return <PromoProposalCard items={items} />;
      case 'color':
        return <ColorProposalCard items={items} />;
      case 'category':
      case 'subCategory':
        return <CategoryProposalCard items={items} />;
      case 'size':
        return <SizeProposalCard items={items} />;
      default:
        return (
          <pre className='text-[10px] font-mono bg-muted p-2 rounded max-h-32 overflow-auto'>
            {JSON.stringify(proposal.data, null, 2)}
          </pre>
        );
    }
  };

  return (
    <ProposalWrapper proposal={proposal} onConfirm={onConfirm}>
      {renderEntityContent()}
    </ProposalWrapper>
  );
}
