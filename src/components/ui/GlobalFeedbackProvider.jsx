'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function GlobalFeedbackProvider({ children }) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const nativeAlert = window.alert;
    window.alert = (value) => {
      setMessage(String(value));
      window.clearTimeout(window.__haizeAlertTimer);
      window.__haizeAlertTimer = window.setTimeout(() => setMessage(null), 4200);
    };
    return () => {
      window.alert = nativeAlert;
      window.clearTimeout(window.__haizeAlertTimer);
    };
  }, []);

  return (
    <>
      {children}
      {message && (
        <div
          role="status"
          className="fixed right-6 top-6 z-[100] flex max-w-md items-start gap-3 border border-black bg-white px-5 py-4 text-sm text-black shadow-xl"
        >
          <span className="flex-1 whitespace-pre-line">{message}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-gray-500 hover:text-black"
            aria-label="Cerrar notificación"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
