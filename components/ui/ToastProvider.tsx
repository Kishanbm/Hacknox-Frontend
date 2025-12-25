import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastLevel = 'success' | 'error' | 'info' | 'warning';
type ToastItem = { id: string; message: string; level: ToastLevel; ttl?: number };

const ToastContext = createContext<{
  toast: (message: string, level?: ToastLevel, ttl?: number) => void;
}>({ toast: () => {} });

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, level: ToastLevel = 'info', ttl = 4500) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((t) => [...t, { id, message, level, ttl }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => {
      return setTimeout(() => {
        setToasts((cur) => cur.filter((x) => x.id !== t.id));
      }, t.ttl || 4500);
    });
    return () => timers.forEach((id) => clearTimeout(id));
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-3 items-end max-w-sm">
        {toasts.map((t) => (
          <div key={t.id} className={`w-full max-w-xs px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white flex items-center gap-3 ${
            t.level === 'success' ? 'bg-green-600' : t.level === 'error' ? 'bg-red-600' : t.level === 'warning' ? 'bg-amber-600 text-black' : 'bg-sky-600'
          }`}>
            <div className="flex-1">{t.message}</div>
            <button onClick={() => setToasts((cur) => cur.filter((x) => x.id !== t.id))} className="opacity-80 hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  return {
    toast: ctx.toast,
    success: (msg: string, ttl?: number) => ctx.toast(msg, 'success', ttl),
    error: (msg: string, ttl?: number) => ctx.toast(msg, 'error', ttl),
    info: (msg: string, ttl?: number) => ctx.toast(msg, 'info', ttl),
    warn: (msg: string, ttl?: number) => ctx.toast(msg, 'warning', ttl),
  };
};

export default ToastProvider;
