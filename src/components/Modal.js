import React, { useEffect } from 'react';

export default function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 px-4 modal-backdrop"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`animate-fade-in bg-slate-800 rounded-xl shadow-2xl border border-slate-600 flex flex-col ${wide ? 'w-full max-w-5xl' : 'w-full max-w-2xl'}`}
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-600">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
