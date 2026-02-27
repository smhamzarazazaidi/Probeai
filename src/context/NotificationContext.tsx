import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  notify: (message: string, type?: NotificationType) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    const notification: AppNotification = { id, message, type };
    setNotifications(prev => [...prev, notification]);

    // Best-effort: store in Supabase if a notifications table exists.
    // Errors are ignored so the UI never breaks if the table is missing.
    (async () => {
      try {
        const sessionRes = await supabase.auth.getSession();
        const token = sessionRes.data.session?.access_token;
        if (!token) return;
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message, type }),
        });
      } catch {
        // ignore
      }
    })();

    // Auto-dismiss after 4s
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <NotificationContext.Provider value={{ notifications, notify, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}

