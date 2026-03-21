'use client';

import React from 'react';
import { motion } from 'motion/react';

interface OrganicBlobProps {
  state: 'idle' | 'generating' | 'fixed';
  className?: string;
}

const OrganicBlob: React.FC<OrganicBlobProps> = ({
  state,
  className = '',
}) => {
  const blobVariants = {
    idle: {
      scale: [1, 1.1, 0.9, 1.05, 1],
      rotate: [0, 45, -10, 20, 0],
      borderRadius: [
        '60% 40% 30% 70% / 60% 30% 70% 40%',
        '30% 60% 70% 40% / 50% 60% 30% 60%',
        '60% 40% 30% 70% / 60% 30% 70% 40%',
      ],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    generating: {
      scale: [1, 1.2, 0.8, 1.3, 1],
      rotate: [0, 90, 180, 270, 360],
      borderRadius: [
        '60% 40% 30% 70% / 60% 30% 70% 40%',
        '40% 60% 60% 40% / 40% 60% 60% 40%',
        '70% 30% 30% 70% / 30% 70% 70% 30%',
        '60% 40% 30% 70% / 60% 30% 70% 40%',
      ],
      backgroundColor: ['#bae6fd', '#7dd3fc', '#38bdf8', '#bae6fd'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    fixed: {
      scale: 1,
      rotate: 0,
      borderRadius: '50%',
      backgroundColor: '#38bdf8',
      transition: {
        duration: 0.8,
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        className="w-48 h-48 bg-sky-200 opacity-80 blur-xl absolute"
        animate={state}
        variants={blobVariants}
      />
      <motion.div
        className="w-40 h-40 bg-gradient-to-br from-sky-300 to-blue-400 shadow-lg"
        animate={state}
        variants={blobVariants}
      />
    </div>
  );
};

export default OrganicBlob;
