import React, { useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import RefreshIcon from '@mui/icons-material/Refresh';
import { alpha, keyframes } from '@mui/material/styles';
import { usePomodoro } from '../context/PomodoroContext';
import { useTasks } from '../hooks/useTasks';
import { getRandomQuote, determineQuoteCategory } from '../data/quotes';

// Rotation animation for refresh button
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
`;

// Subtle pulse animation for border
const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(124, 58, 237, 0);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
  }
`;

export default function MotivationalQuote() {
  const { isBreakTime } = usePomodoro();
  const { tasks } = useTasks();
  
  const [currentQuote, setCurrentQuote] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('working');
  const [fadeIn, setFadeIn] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const rotationTimerRef = useRef(null);

  // Function to check if a task was recently completed (within last 5 minutes)
  const checkRecentCompletion = useCallback(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    const recentlyCompleted = tasks.some(task => {
      if (!task.completed || !task.completedAt) return false;
      const completedTime = new Date(task.completedAt).getTime();
      return completedTime >= fiveMinutesAgo;
    });
    
    return recentlyCompleted;
  }, [tasks]);

  // Function to determine context and get appropriate quote
  const getContextualQuote = useCallback(() => {
    const hourOfDay = new Date().getHours();
    
    // Check tasks completion status
    const completedTasksToday = tasks.filter(task => {
      if (!task.completed || !task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      const today = new Date();
      return (
        completedDate.getDate() === today.getDate() &&
        completedDate.getMonth() === today.getMonth() &&
        completedDate.getFullYear() === today.getFullYear()
      );
    });

    const hasCompletedTasksToday = completedTasksToday.length > 0;
    const hasNoTasks = tasks.length === 0;
    const recentlyCompletedTask = checkRecentCompletion();
    
    // Determine category based on context
    const category = determineQuoteCategory({
      hourOfDay,
      isBreakTime,
      hasCompletedTasksToday,
      hasNoTasks,
      recentlyCompletedTask
    });
    
    setCurrentCategory(category);
    return getRandomQuote(category);
  }, [tasks, isBreakTime, checkRecentCompletion]);

  // Initialize with a quote
  useEffect(() => {
    const quote = getContextualQuote();
    setCurrentQuote(quote);
  }, [getContextualQuote]);

  // Function to refresh quote with animation
  const refreshQuote = useCallback(() => {
    setIsRefreshing(true);
    setFadeIn(false);
    
    setTimeout(() => {
      const newQuote = getContextualQuote();
      setCurrentQuote(newQuote);
      setFadeIn(true);
      setTimeout(() => setIsRefreshing(false), 300);
    }, 300);
  }, [getContextualQuote]);

  // Auto-rotation every 2-3 minutes (150 seconds = 2.5 minutes)
  useEffect(() => {
    if (isPaused) return;

    rotationTimerRef.current = setInterval(() => {
      refreshQuote();
    }, 150000); // 2.5 minutes

    return () => {
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }
    };
  }, [refreshQuote, isPaused]);

  // Check for task completions periodically
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const recentlyCompleted = checkRecentCompletion();
      
      // If a task was just completed and we weren't showing accomplished quote
      if (recentlyCompleted && currentCategory !== 'accomplished') {
        refreshQuote();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [checkRecentCompletion, currentCategory, refreshQuote]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    if (isRefreshing) return;
    refreshQuote();
  };

  // Get category display info
  const getCategoryInfo = (category) => {
    const categoryMap = {
      morning: { label: 'Morning', emoji: '🌅' },
      working: { label: 'Working', emoji: '💼' },
      break: { label: 'Break', emoji: '☕' },
      struggling: { label: 'Keep Going', emoji: '💪' },
      accomplished: { label: 'Accomplished', emoji: '🎉' }
    };
    return categoryMap[category] || categoryMap.working;
  };

  const categoryInfo = getCategoryInfo(currentCategory);

  if (!currentQuote) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        mb: 3,
        p: 3,
        borderRadius: 3,
        background: theme => 
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, 
                ${alpha(theme.palette.secondary.main, 0.05)} 0%, 
                ${alpha(theme.palette.primary.main, 0.03)} 100%)`
            : `linear-gradient(135deg, 
                ${alpha(theme.palette.secondary.main, 0.03)} 0%, 
                ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
        border: theme => `2px solid ${alpha(theme.palette.secondary.main, 0.15)}`,
        boxShadow: theme => 
          theme.palette.mode === 'dark'
            ? `0 4px 20px ${alpha('#000', 0.3)}`
            : `0 2px 12px ${alpha(theme.palette.secondary.main, 0.08)}`,
        animation: `${pulse} 4s ease-in-out infinite`,
        transition: 'transform 0.2s ease',
        cursor: 'default',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme => 
            theme.palette.mode === 'dark'
              ? `0 6px 24px ${alpha('#000', 0.4)}`
              : `0 4px 16px ${alpha(theme.palette.secondary.main, 0.12)}`
        }
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative Quote Icon - Top Left */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          opacity: 0.15,
          color: 'secondary.main',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        <FormatQuoteIcon sx={{ fontSize: 80 }} />
      </Box>

      {/* Refresh Button - Top Right */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2
        }}
      >
        <IconButton
          size="small"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          sx={{
            color: 'secondary.main',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: theme => alpha(theme.palette.secondary.main, 0.1),
              transform: 'rotate(180deg)'
            },
            '&.Mui-disabled': {
              color: theme => alpha(theme.palette.secondary.main, 0.3)
            },
            ...(isRefreshing && {
              animation: `${rotate} 0.6s ease-in-out`
            })
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          minHeight: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 2, sm: 4 },
          py: 2
        }}
      >
        <Fade in={fadeIn} timeout={500}>
          <Box>
            {/* Quote Text */}
            <Typography
              variant="h6"
              sx={{
                fontStyle: 'italic',
                lineHeight: 1.7,
                mb: 2,
                color: 'text.primary',
                fontWeight: 400,
                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                textAlign: 'center'
              }}
            >
              "{currentQuote.text}"
            </Typography>

            {/* Author */}
            <Typography
              variant="body2"
              sx={{
                textAlign: 'right',
                color: 'secondary.main',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                pr: 1
              }}
            >
              — {currentQuote.author}
            </Typography>
          </Box>
        </Fade>
      </Box>

      {/* Category Indicator - Bottom */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 1,
          pt: 2,
          borderTop: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Chip
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span>{categoryInfo.emoji}</span>
              <span>{categoryInfo.label}</span>
            </Box>
          }
          size="small"
          sx={{
            bgcolor: theme => alpha(theme.palette.secondary.main, 0.1),
            color: 'secondary.main',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: 0.5,
            border: theme => `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
          }}
        />
      </Box>
    </Box>
  );
}
