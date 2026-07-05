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
  description: string;
  buttonTitle?: string;
  children: React.ReactNode;
  reset?: () => void;
  onSubmit?: () => void;
  submitHandler?: () => void;
  setIsOpen: (open: boolean) => void;
  handleSubmit?: (e: React.FormEvent) => void;
}

export default function Modal({
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
          {title && <DialogTitle className='text-start'>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className='p-2'>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
