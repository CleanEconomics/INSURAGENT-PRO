import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast from '../components/Toast';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastContextType {
  showToast: (
    message: string,
    options?: {
      type?: 'success' | 'error' | 'info' | 'warning';
      action?: { label: string; onClick: () => void };
      duration?: number;
    }
  ) => void;
  showSuccess: (message: string, action?: { label: string; onClick: () => void }) => void;
  showError: (message: string, action?: { label: string; onClick: () => void }) => void;
  showInfo: (message: string, action?: { label: string; onClick: () => void }) => void;
  showWarning: (message: string, action?: { label: string; onClick: () => void }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      options?: {
        type?: 'success' | 'error' | 'info' | 'warning';
        action?: { label: string; onClick: () => void };
        duration?: number;
      }
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = {
        id,
        message,
        type: options?.type || 'success',
        action: options?.action,
        duration: options?.duration !== undefined ? options.duration : 4000,
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, action?: { label: string; onClick: () => void }) => {
      showToast(message, { type: 'success', action });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, action?: { label: string; onClick: () => void }) => {
      showToast(message, { type: 'error', action });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, action?: { label: string; onClick: () => void }) => {
      showToast(message, { type: 'info', action });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, action?: { label: string; onClick: () => void }) => {
      showToast(message, { type: 'warning', action });
    },
    [showToast]
  );

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          action={toast.action}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};
