import React from 'react';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="toast-notification" role="status" aria-live="polite">
      <div className="toast-icon">
        <CheckCircle2 size={20} color="#15803d" />
      </div>
      <div className="toast-body">
        <strong className="toast-title">{toast.title}</strong>
        <p className="toast-message">{toast.message}</p>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
}
