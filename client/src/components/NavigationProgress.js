import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Box from '@mui/material/Box';

export function NavigationProgress() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Box
      component={motion.div}
      initial={{ scaleX: 0 }}
      animate={{ 
        scaleX: 1,
        transition: { duration: shouldReduceMotion ? 0.6 : 1.2 }
      }}
      style={{
        height: 2,
        transformOrigin: 'left',
        backgroundColor: 'var(--mui-palette-secondary-main)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1101
      }}
    />
  );
}