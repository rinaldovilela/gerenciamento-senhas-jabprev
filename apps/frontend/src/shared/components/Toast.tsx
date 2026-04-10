import React, { useEffect } from 'react';

export interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  durationMs?: number;
  onClose: () => void;
}

const toneByType: Record<NonNullable<ToastProps['type']>, string> = {
  success: 'bg-jaboatao-green-prev',
  error: 'bg-red-600',
  info: 'bg-jaboatao-blue',
};

const Toast: React.FC<ToastProps> = ({
  show,
  message,
  type = 'info',
  durationMs = 3000,
  onClose,
}) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [show, durationMs, onClose]);

  if (!show || !message) return null;

  return (
    <div className={`fixed bottom-5 right-5 z-50 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-xl ${toneByType[type]}`}>
      {message}
    </div>
  );
};

export default Toast;
