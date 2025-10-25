import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { keyframes } from '@mui/system';

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

export default function StreakAnalysis({ tasks }) {
  const streakData = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        consistencyRate: 0,
        calendar: []
      };
    }

    // Get unique days with completed tasks
    const completedDays = new Set();
    tasks.forEach(task => {
      if (task.completed && task.completedAt) {
        const day = format(new Date(task.completedAt), 'yyyy-MM-dd');
        completedDays.add(day);
      }
    });

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (completedDays.has(dateStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else if (isSameDay(checkDate, new Date())) {
        // Today hasn't been counted yet, check yesterday
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    const sortedDays = Array.from(completedDays).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    sortedDays.forEach(dayStr => {
      const currentDate = new Date(dayStr);
      if (prevDate) {
        const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = currentDate;
    });
    longestStreak = Math.max(longestStreak, tempStreak);

    // Generate calendar for last 30 days
    const endDate = new Date();
    const startDate = subDays(endDate, 29);
    const dateArray = eachDayOfInterval({ start: startDate, end: endDate });

    const calendar = dateArray.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        date: dateStr,
        displayDate: format(date, 'd'),
        hasTask: completedDays.has(dateStr),
        isToday: isSameDay(date, new Date())
      };
    });

    // Calculate consistency rate
    const totalActiveDays = completedDays.size;
    const consistencyRate = Math.round((totalActiveDays / 30) * 100);

    return {
      currentStreak,
      longestStreak,
      totalActiveDays,
      consistencyRate,
      calendar
    };
  }, [tasks]);

  if (streakData.totalActiveDays === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          🔥 No streak yet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Start your streak by completing a task today!
        </Typography>
      </Box>
    );
  }

  // Group calendar into weeks
  const weeks = [];
  for (let i = 0; i < streakData.calendar.length; i += 7) {
    weeks.push(streakData.calendar.slice(i, i + 7));
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

      {/* Mini Calendar */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
          Last 30 Days
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {weeks.map((week, weekIdx) => (
            <Box key={weekIdx} sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
              {week.map((day, dayIdx) => (
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

      {/* Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: 2
        }}
      >
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 2, 
            bgcolor: 'background.default', 
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)'
            }
          }}
        >
          <Typography variant="h4" fontWeight={600} color="primary.main">
            {streakData.currentStreak}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Streak
          </Typography>
        </Box>

        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 2, 
            bgcolor: 'background.default', 
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)'
            }
          }}
        >
          <Typography variant="h4" fontWeight={600} color="warning.main">
            {streakData.longestStreak}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Longest Streak
          </Typography>
        </Box>

        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 2, 
            bgcolor: 'background.default', 
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Typography variant="h4" fontWeight={600}>
            {streakData.totalActiveDays}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Active Days
          </Typography>
        </Box>

        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 2, 
            bgcolor: 'background.default', 
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
            }
          }}
        >
          <Typography variant="h4" fontWeight={600} color="success.main">
            {streakData.consistencyRate}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consistency
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
