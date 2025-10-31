import { AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ConfirmPopoverProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  targetElement: HTMLElement;
}

export default function ConfirmPopover({
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  targetElement
}: ConfirmPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (popoverRef.current && targetElement) {
        const targetRect = targetElement.getBoundingClientRect();
        const popover = popoverRef.current;

        // Vị trí mặc định: hiển thị bên trái nút
        let left = targetRect.left - popover.offsetWidth - 8;
        let top = targetRect.top + (targetRect.height / 2) - (popover.offsetHeight / 2);

        // Nếu không đủ chỗ bên trái, hiển thị bên phải
        if (left < 8) {
          left = targetRect.right + 8;
        }

        // Đảm bảo không vượt quá viewport
        if (left + popover.offsetWidth > window.innerWidth - 8) {
          left = window.innerWidth - popover.offsetWidth - 8;
        }

        if (top < 8) {
          top = 8;
        }

        if (top + popover.offsetHeight > window.innerHeight - 8) {
          top = window.innerHeight - popover.offsetHeight - 8;
        }

        popover.style.left = `${left}px`;
        popover.style.top = `${top}px`;
      }
    };

    updatePosition();

    // Cập nhật vị trí khi scroll
    const handleScroll = () => {
      updatePosition();
    };

    // Click outside to close
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [targetElement, onCancel]);

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onCancel}
      />
      
      {/* Popover */}
      <div
        ref={popoverRef}
        className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-3 animate-scaleIn"
        style={{ minWidth: '280px', maxWidth: '320px' }}
      >
        <div className="flex items-start gap-2 mb-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          </div>
          <p className="text-sm text-gray-700 flex-1">{message}</p>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
}

