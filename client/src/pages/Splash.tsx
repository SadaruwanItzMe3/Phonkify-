import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Splash() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated ? '/home' : '/login', { replace: true });
    }, 1800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-void">
      <motion.div
        className="absolute h-96 w-96 rounded-full bg-neon-purple/30 blur-[100px]"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ filter: ['drop-shadow(0 0 8px #b026ff)', 'drop-shadow(0 0 28px #ff2ec4)', 'drop-shadow(0 0 8px #b026ff)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap size={56} className="text-neon-purple" />
        </motion.div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          <span className="text-neon-gradient">Phonkify</span>
        </h1>
        <p className="text-sm tracking-[0.3em] text-text-muted">DRIFT INTO THE SOUND</p>
      </motion.div>
    </div>
  );
}
