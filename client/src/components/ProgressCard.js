import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';

export default function ProgressCard({ title, current, goal, reward, isCompleted, period }) {
  const progress = Math.min(100, (current / goal) * 100);
  const remaining = Math.max(0, goal - current);

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        height: '100%',
        background: theme => {
          const base = theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30,30,30,1) 0%, rgba(18,18,18,1) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)';
          const overlay = isCompleted
            ? 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0.06) 100%)'
            : '';
          return overlay ? `${overlay}, ${base}` : base;
        },
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {isCompleted && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'secondary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <CheckCircleIcon />
          <Typography variant="body2" fontWeight="medium">
            Goal Reached!
          </Typography>
        </Box>
      )}

      <CardContent sx={{ height: '100%', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.primary" fontWeight="medium">
              {current.toFixed(1)}h / {goal}h
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme => (theme.palette.mode === 'dark' ? 'grey.800' : 'rgba(0,0,0,0.05)'),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: theme => `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                boxShadow: theme => (theme.palette.mode === 'dark'
                  ? '0 0 8px rgba(124,58,237,0.6), 0 0 16px rgba(124,58,237,0.3)'
                  : 'none')
              }
            }}
          />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 1 }}
          >
            {remaining > 0 
              ? `${remaining.toFixed(1)}h remaining this ${period}`
              : 'Goal completed!'
            }
          </Typography>
        </Box>

        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            backgroundColor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)'),
            p: 2,
            borderRadius: 1
          }}
        >
          <EmojiEventsIcon color="action" />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Reward
            </Typography>
            <Typography>
              {reward}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}