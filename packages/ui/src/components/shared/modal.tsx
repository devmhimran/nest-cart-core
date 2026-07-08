import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface ModalProps {
  title: string;
  isOpen: boolean;
  description?: string;
  buttonTitle?: string;
  children: React.ReactNode;
  hideClose?: boolean;
  reset?: () => void;
  onSubmit?: () => void;
  submitHandler?: () => void;
  setIsOpen: (open: boolean) => void;
  handleSubmit?: (e: React.FormEvent) => void;
}

export function Modal({
  isOpen,
  setIsOpen,
  children,
  description,
  title,
  reset,
}: ModalProps) {
  const onOpenChange = () => {
    setIsOpen(false);
    if (reset) reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className='sm:max-w-xl pt-7 px-4 z-100'
        aria-describedby={undefined}
      >
        <DialogHeader>
          {title && (
            <DialogTitle className='text-start leading-5.5'>
              {title}
            </DialogTitle>
          )}
          {description && (
            <DialogDescription className='text-wrap text-start w-full'>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className='w-full max-h-[80vh] overflow-y-auto scrollbar-thin px-1 pb-px'>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
