import React from 'react';
import { motion } from 'framer-motion';

const FloatingElements: React.FC = () => {
  const elements = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 8,
    delay: Math.random() * 5,
    color: [
      'bg-blue-500/30',
      'bg-purple-500/40',
      'bg-cyan-500/20',
      'bg-pink-500/30',
      'bg-indigo-500/25'
    ][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute rounded-full ${element.color} blur-sm`}
          style={{
            width: element.size,
            height: element.size,
            left: `${element.x}%`,
            top: `${element.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, -15, 0],
            scale: [1, 1.2, 0.8, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;