import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { X } from 'lucide-react';

interface AlertModalProps {
  title: string;
  isOpen: boolean;
  hideClose?: boolean;
  description?: string;
  buttonTitle?: string;
  children: React.ReactNode;
  overlayClassName?: string;
  contentClassName?: string;
  onSubmit?: () => void;
  submitHandler?: () => void;
  setIsOpen: (open: boolean) => void;
  handleSubmit?: (e: React.FormEvent) => void;
  reset?: () => void;
}

export function AlertModal({
  isOpen,
  setIsOpen,
  children,
  description = '',
  title,
  reset,
  hideClose,
  overlayClassName,
  contentClassName,
}: AlertModalProps) {
  const onOpenChange = () => {
    setIsOpen(false);
    if (reset) reset();
  };
  const handleClose = () => {
    setIsOpen(false);
    if (reset) reset();
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent
        overlayClassName={overlayClassName}
        className={contentClassName}
      >
        <AlertDialogHeader className='space-y-1'>
          <AlertDialogTitle className='w-full flex items-start justify-between gap-3 text-md'>
            <div>{title}</div>
            {hideClose || (
              <div onClick={handleClose} className='cursor-pointer p-0.5'>
                <X className='w-3.5' />
              </div>
            )}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
          <div className='w-full max-h-[80vh] overflow-y-auto scrollbar-thin px-1 pb-px'>
            {children}
          </div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
