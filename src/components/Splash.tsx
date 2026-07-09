/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const duration = 1800; // 1.8 seconds
    const intervalTime = duration / 100;
    
    const timer = setInterval(() => {
      setPercent(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          // Wait a tiny bit and complete
          setTimeout(() => {
            onComplete();
          }, 300);
          return 100;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeIn' }}
      className="fixed inset-0 z-[100] bg-emerald-800 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated background circles */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[500px] h-[500px] bg-emerald-400 rounded-full -top-20 -left-20"
      />
      <motion.div
        animate={{
          y: [0, -15, 0],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[300px] h-[300px] bg-purple-500 rounded-full -bottom-10 -right-10"
      />

      {/* Main branding */}
      <div className="text-center z-10 px-6">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="inline-block mb-6 text-emerald-300"
        >
          <Sparkles className="w-16 h-16 fill-current text-emerald-300" />
        </motion.div>

        <h1 className="font-extrabold tracking-tighter text-white mb-4 text-6xl md:text-7xl">
          ROUTINES
        </h1>
        <p className="text-xl text-emerald-300 max-w-xs mx-auto leading-tight font-semibold">
          Small steps. <br />
          <span className="text-white">Big impact.</span>
        </p>
      </div>

      {/* Celebration Progress Loader */}
      <div className="absolute bottom-24 w-64 px-4 z-10">
        <div className="flex justify-between items-center mb-3 text-[10px] tracking-widest font-mono uppercase">
          <span className="text-emerald-300">Powering Up</span>
          <span className="text-white font-bold">{percent}%</span>
        </div>
        <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden p-1 backdrop-blur-sm">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${percent}%` }}
            transition={{ ease: 'easeOut', duration: 0.1 }}
            className="h-full bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.6)]"
          />
        </div>
      </div>
    </motion.div>
  );
}
