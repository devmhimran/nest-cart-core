interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className='text-center py-12 border border-dashed rounded-xl text-muted-foreground'>
      {message || 'No items found.'}
    </div>
  );
}
