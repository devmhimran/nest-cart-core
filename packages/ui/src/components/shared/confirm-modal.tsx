import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Loader2 } from 'lucide-react';

type ConfirmModalProps = {
  title?: string;
  isOpen: boolean;
  loading?: boolean;
  reset?: () => void;
  onClick: () => void;
  setIsOpen: (isOpen: boolean) => void;
};

export function ConfirmModal({
  isOpen,
  setIsOpen,
  onClick,
  title,
  loading,
}: ConfirmModalProps) {
  const onOpenChange = () => {
    setIsOpen(false);
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          {title && <AlertDialogDescription>{title}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClick} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
