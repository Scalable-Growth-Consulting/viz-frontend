import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { X } from 'lucide-react';

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
  /** Controls overflow behavior of DialogContent. Use 'hidden' if inner body manages its own scroll. */
  contentOverflow?: 'auto' | 'hidden';
  /** When true, expand the dialog close to full height on mobile for better usability. */
  fullScreenOnMobile?: boolean;
}

const PopupModal: React.FC<PopupModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
  showCloseButton = false,
  contentOverflow = 'auto',
  fullScreenOnMobile = false
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  const overflowClass = contentOverflow === 'hidden' ? 'overflow-hidden' : 'overflow-auto';
  // On small screens, optionally increase usable height; on larger screens cap height.
  const heightClasses = fullScreenOnMobile
    ? 'h-[92vh] sm:h-auto sm:max-h-[90vh]'
    : 'max-h-[90vh]';

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        hideClose={!showCloseButton}
        className={`${maxWidthClasses[maxWidth]} ${heightClasses} ${overflowClass}`}
      >
        <DialogHeader className="relative">
          <DialogTitle className="text-lg font-semibold pr-8">{title}</DialogTitle>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default PopupModal;
