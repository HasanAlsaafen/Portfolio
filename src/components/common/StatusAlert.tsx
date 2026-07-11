import React, { useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faInfoCircle, faXmark } from "@fortawesome/free-solid-svg-icons";

interface StatusAlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
}

export default function StatusAlert({ 
  type, 
  message, 
  onClose, 
  autoClose = true 
}: StatusAlertProps) {
  
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const config = {
    success: {
      icon: faCheckCircle,
      accent: 'border-success',
      iconColor: 'text-success',
      label: 'Success'
    },
    error: {
      icon: faTimesCircle,
      accent: 'border-error',
      iconColor: 'text-error',
      label: 'Error'
    },
    info: {
      icon: faInfoCircle,
      accent: 'border-primary',
      iconColor: 'text-primary',
      label: 'Info'
    }
  };

  const { icon, accent, iconColor, label } = config[type];

  return (
    <div className={`fixed bottom-8 right-8 z-[110] flex items-center gap-4 px-6 py-4 bg-card text-text border border-border border-l-4 ${accent} animate-in slide-in-from-right-10 duration-300`}>
      <div className={`flex items-center justify-center w-8 h-8 ${iconColor}`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-bold leading-none">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 opacity-70 hover:opacity-100 transition-opacity p-1"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </div>
  );
}
