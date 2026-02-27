import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationBar() {
  const { notifications } = useNotifications();

  if (!notifications.length) return null;

  const latest = notifications[notifications.length - 1];

  const bg =
    latest.type === 'error'
      ? 'bg-red-500 text-white'
      : latest.type === 'success'
      ? 'bg-emerald-500 text-black'
      : 'bg-blue-500 text-white';

  return (
    <div className="fixed top-16 left-0 right-0 z-[95] flex justify-center pointer-events-none">
      <AnimatePresence>
        <motion.div
          key={latest.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`pointer-events-auto px-4 py-2 rounded-full shadow-lg ${bg} text-sm font-medium`}
        >
          {latest.message}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

