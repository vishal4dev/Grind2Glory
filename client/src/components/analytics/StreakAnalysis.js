import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { keyframes } from '@mui/system';
import { fetchStreakData } from '../../services/api';

// Animations
const flicker = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  25% { opacity: 0.9; transform: scale(1.05) rotate(-2deg); }
  50% { opacity: 1; transform: scale(1.1) rotate(2deg); }
  75% { opacity: 0.95; transform: scale(1.05) rotate(-1deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
`;

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 10px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3); }
  50% { text-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3); }
`;

const isMilestone = (streak) => {
  const milestones = [7, 14, 30, 50, 100, 365];
  return milestones.includes(streak);
};

export default function StreakAnalysis() {
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalDaysActive: 0,
    calendar: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { data } = await fetchStreakData();
        setStreakData(data);
      } catch (error) {
        console.error('Error loading streak data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (streakData.currentStreak === 0 && streakData.longestStreak === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          🔥 No streak yet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete tasks daily to build your streak!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Chart Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Streak Analysis
        </Typography>
      </Box>

      {/* Main Streak Display */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            animation: isMilestone(streakData.currentStreak) ? `${pulse} 2s infinite` : 'none'
          }}
        >
          <LocalFireDepartmentIcon
            sx={{
              fontSize: 80,
              color: streakData.currentStreak > 0 ? '#f97316' : '#9ca3af',
              animation: streakData.currentStreak > 0 ? `${flicker} 2s infinite` : 'none',
              filter: streakData.currentStreak > 0 ? 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.6))' : 'none',
              transition: 'all 0.3s'
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'inline-block',
            position: 'relative',
            animation: isMilestone(streakData.currentStreak) ? `${glow} 2s infinite` : 'none'
          }}
        >
          <Typography 
            variant="h1" 
            fontWeight={700} 
            sx={{ 
              fontSize: 72, 
              lineHeight: 1,
              background: streakData.currentStreak > 0 
                ? 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)'
                : 'inherit',
              WebkitBackgroundClip: streakData.currentStreak > 0 ? 'text' : 'inherit',
              WebkitTextFillColor: streakData.currentStreak > 0 ? 'transparent' : 'inherit',
              position: 'relative',
              transition: 'all 0.3s'
            }}
          >
            {streakData.currentStreak}
          </Typography>
          {isMilestone(streakData.currentStreak) && (
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                bgcolor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                animation: `${pulse} 1.5s infinite`,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
              }}
            >
              🎉
            </Box>
          )}
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
          Day Streak
        </Typography>
        {isMilestone(streakData.currentStreak) && (
          <Typography 
            variant="body1" 
            sx={{ 
              mt: 1, 
              color: '#ef4444',
              fontWeight: 600,
              animation: `${glow} 2s infinite`
            }}
          >
            🎯 Milestone Achieved!
          </Typography>
        )}
        {streakData.longestStreak > streakData.currentStreak && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Best: {streakData.longestStreak} days
          </Typography>
        )}
      </Box>

      {/* 30-Day Calendar */}
      {streakData.calendar && streakData.calendar.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            Last 30 Days Activity
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {Array.from({ length: Math.ceil(streakData.calendar.length / 7) }, (_, weekIdx) => (
              <Box key={weekIdx} sx={{ display: 'flex', gap: 0.75, justifyContent: 'center' }}>
                {streakData.calendar.slice(weekIdx * 7, (weekIdx + 1) * 7).map((day, dayIdx) => (
                  <Box
                    key={dayIdx}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: day.hasTask ? 'success.main' : '#e5e7eb',
                      color: day.hasTask ? 'white' : 'text.secondary',
                      fontWeight: day.isToday ? 700 : 400,
                      border: day.isToday ? '3px solid' : 'none',
                      borderColor: day.isToday ? 'primary.main' : 'transparent',
                      position: 'relative',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      boxShadow: day.hasTask ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: day.hasTask ? '0 4px 12px rgba(16, 185, 129, 0.5)' : 2
                      }
                    }}
                  >
                    <Typography variant="caption" fontWeight="inherit">
                      {day.displayDate}
                    </Typography>
                    {day.hasTask && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: '#10b981'
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: '#e5e7eb' }} />
              <Typography variant="caption" color="text.secondary">
                Missed
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3
        }}
      >
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 3, 
            bgcolor: 'background.default', 
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)'
            }
          }}
        >
          <Typography variant="h3" fontWeight={600} color="primary.main">
            {streakData.currentStreak}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Current Streak
          </Typography>
        </Box>

        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 3, 
            bgcolor: 'background.default', 
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)'
            }
          }}
        >
          <Typography variant="h3" fontWeight={600} color="warning.main">
            {streakData.longestStreak}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Longest Streak
          </Typography>
        </Box>

        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 3, 
            bgcolor: 'background.default', 
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Typography variant="h3" fontWeight={600}>
            {streakData.totalDaysActive}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Active Days
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
