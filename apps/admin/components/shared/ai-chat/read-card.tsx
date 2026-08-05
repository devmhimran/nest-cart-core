import React from 'react';
import { Database, Check, Copy } from 'lucide-react';

import { ReadData } from '@/types';
import { ReadColorsGrid } from './read-colors-grid';
import { ReadSizesChips } from './read-sizes-chips';
import { ReadProductsGrid } from './read-product-grid';
import { ReadCategoriesList } from './read-categories-list';
import { ReadPromoCodesList } from './read-promo-codes-list';
import { Badge, Button, Card, CardContent, CardHeader } from '@repo/ui';

export function ReadCard({ read }: { read: ReadData }) {
  const [copied, setCopied] = React.useState(false);
  const items = Array.isArray(read.data) ? read.data : [read.data];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(items, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderEntityView = () => {
    switch (read.entity) {
      case 'product':
        return <ReadProductsGrid items={items} />;
      case 'promoCode':
        return <ReadPromoCodesList items={items} />;
      case 'color':
        return <ReadColorsGrid items={items} />;
      case 'size':
        return <ReadSizesChips items={items} />;
      case 'category':
      case 'subCategory':
        return <ReadCategoriesList items={items} />;
      default:
        return (
          <pre className='text-[10px] font-mono bg-muted p-2 rounded max-h-40 overflow-auto'>
            {JSON.stringify(items, null, 2)}
          </pre>
        );
    }
  };

  return (
    <Card className='w-full min-w-0 bg-card rounded-xl overflow-hidden p-0 gap-0'>
      <CardHeader className='flex flex-row items-center justify-between p-3 bg-muted/20 border-b border-border/40 m-0 space-y-0'>
        <Badge
          variant='secondary'
          className='inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-md shrink-0'
        >
          <Database className='w-3.5 h-3.5 shrink-0' />
          <span className='truncate max-w-30'>{read.entity}</span>
          <span className='opacity-60 font-mono text-[11px]'>
            ({items.length})
          </span>
        </Badge>

        <Button
          variant='ghost'
          size='icon'
          onClick={handleCopyJson}
          className='h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground rounded-md transition-colors'
          title='Copy raw JSON'
        >
          {copied ? (
            <Check className='w-4 h-4 text-emerald-500' />
          ) : (
            <Copy className='w-4 h-4' />
          )}
        </Button>
      </CardHeader>

      <CardContent className='p-3 space-y-2.5 min-w-0'>
        {renderEntityView()}
      </CardContent>
    </Card>
  );
}
