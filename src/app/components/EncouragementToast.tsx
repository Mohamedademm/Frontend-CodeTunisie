import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Flame, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EncouragementMessage {
  icon: typeof Sparkles;
  message: string;
  color: string;
}

const encouragements: EncouragementMessage[] = [
  {
    icon: Sparkles,
    message: 'Excellent travail ! Continue comme ça !',
    color: 'from-primary to-accent',
  },
  {
    icon: Trophy,
    message: 'Tu fais des progrès impressionnants !',
    color: 'from-warning to-accent',
  },
  {
    icon: Flame,
    message: 'Tu es en feu ! Continue ta série !',
    color: 'from-destructive to-warning',
  },
  {
    icon: Star,
    message: 'Bravo ! Tu es sur la bonne voie !',
    color: 'from-success to-secondary',
  },
];

export function EncouragementToast({ trigger }: { trigger?: boolean }) {
  const [show, setShow] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(encouragements[0]);

  useEffect(() => {
    if (trigger) {
      const randomMessage = encouragements[Math.floor(Math.random() * encouragements.length)];
      setCurrentMessage(randomMessage);
      setShow(true);
      
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  const Icon = currentMessage.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className={`glass-effect bg-gradient-to-r ${currentMessage.color} p-4 rounded-2xl shadow-xl border border-white/20 text-white backdrop-blur-md max-w-xs`}>
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: 2, duration: 0.5 }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>
              <p className="font-medium">{currentMessage.message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
