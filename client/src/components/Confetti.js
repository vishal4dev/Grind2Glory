import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

/**
 * Simple confetti animation component
 * Creates colorful falling particles for celebrations
 */
export default function Confetti({ active, duration = 3000 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Generate confetti particles
    const colors = ['#7c3aed', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      animationDuration: 2 + Math.random() * 2,
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.5
    }));

    setParticles(newParticles);

    // Clear particles after duration
    const timeout = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timeout);
  }, [active, duration]);

  if (particles.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: `${particle.left}%`,
            top: '-20px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: particle.size % 2 === 0 ? '50%' : '2px',
            animation: `fall ${particle.animationDuration}s linear forwards`,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${particle.rotation}deg)`,
            '@keyframes fall': {
              '0%': {
                transform: `translateY(0) rotate(${particle.rotation}deg)`,
                opacity: 1
              },
              '100%': {
                transform: `translateY(100vh) rotate(${particle.rotation + 360}deg)`,
                opacity: 0
              }
            }
          }}
        />
      ))}
    </Box>
  );
}
