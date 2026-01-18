import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShoppingBasket, AlertTriangle, Star, X } from 'lucide-react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'season',
      title: 'Peak Harvest Alert!',
      msg: 'Green Valley Heirloom Tomatoes are at their peak sweetness this week.',
      icon: <Star className="text-amber-500" />,
      color: 'bg-amber-50'
    },
    {
      id: 2,
      type: 'recall',
      title: 'Batch Update',
      msg: 'Batch #8821 verified: Transport temperature maintained at 4°C.',
      icon: <CheckCircle2 className="text-emerald-500" />,
      color: 'bg-emerald-50'
    }
  ]);

  const removeNote = (id) => setNotifications(n => n.filter(item => item.id !== id));

  return (
    <div className="fixed top-6 right-6 z-[60] w-full max-w-sm space-y-4">
      <AnimatePresence>
        {notifications.map((note) => (
          <motion.div
            key={note.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className={`${note.color} p-4 rounded-2xl shadow-lg border border-white flex gap-4 relative overflow-hidden`}
          >
            <div className="flex-shrink-0 mt-1">{note.icon}</div>
            <div className="flex-1">
              <h5 className="font-bold text-slate-900 text-sm">{note.title}</h5>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{note.msg}</p>
            </div>
            <button 
              onClick={() => removeNote(note.id)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
            {/* Animated Progress Bar (Timer to auto-dismiss) */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: 0 }}
              transition={{ duration: 6, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-black/5"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};