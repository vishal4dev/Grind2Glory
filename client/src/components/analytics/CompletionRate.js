import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function CompletionRate({ tasks }) {
  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        percentage: 0,
        completed: 0,
        total: 0,
        thisWeek: 0,
        lastWeek: 0,
        trend: 0,
        sparklineData: []
      };
    }

    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate weekly stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = tasks.filter(t => 
      t.completed && new Date(t.completedAt) >= oneWeekAgo
    ).length;

    const lastWeek = tasks.filter(t => 
      t.completed && 
      new Date(t.completedAt) >= twoWeeksAgo && 
      new Date(t.completedAt) < oneWeekAgo
    ).length;

    const trend = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

    // Generate sparkline data (last 7 days)
    const sparklineData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayCompleted = tasks.filter(t => 
        t.completed && 
        new Date(t.completedAt) >= dayStart && 
        new Date(t.completedAt) <= dayEnd
      ).length;

      sparklineData.push({ value: dayCompleted });
    }

    return {
      percentage,
      completed,
      total,
      thisWeek,
      lastWeek,
      trend,
      sparklineData
    };
  }, [tasks]);

  if (stats.total === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          ✅ No tasks yet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create tasks to track completion rate!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Chart Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Completion Rate
        </Typography>
      </Box>

      {/* Main Circular Progress */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Box
          sx={{
            position: 'relative',
            width: 300,
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Background Circle */}
          <svg width="300" height="300" style={{ position: 'absolute' }}>
            <circle
              cx="150"
              cy="150"
              r="130"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="20"
            />
            {/* Progress Circle */}
            <circle
              cx="150"
              cy="150"
              r="130"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="20"
              strokeDasharray={`${(stats.percentage / 100) * 817} 817`}
              strokeLinecap="round"
              transform="rotate(-90 150 150)"
              style={{ 
                transition: 'stroke-dasharray 1s ease',
                filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.4))'
              }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <Box sx={{ textAlign: 'center', zIndex: 1 }}>
            <Typography variant="h1" fontWeight={700} sx={{ fontSize: 60, lineHeight: 1 }}>
              {stats.percentage}%
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Completed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.completed} of {stats.total} tasks
            </Typography>
          </Box>
        </Box>

        {/* Sparkline */}
        {stats.sparklineData.length > 0 && (
          <Box sx={{ width: 200, height: 60, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#7c3aed" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>

      {/* Stats Grid */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3,
          mt: 4
        }}
      >
        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="h4" fontWeight={600} color="primary.main">
            {stats.thisWeek}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This Week
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="h4" fontWeight={600}>
            {stats.lastWeek}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last Week
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Typography 
              variant="h4" 
              fontWeight={600}
              color={stats.trend >= 0 ? 'success.main' : 'error.main'}
            >
              {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(0)}%
            </Typography>
            {stats.trend >= 0 ? (
              <TrendingUpIcon color="success" />
            ) : (
              <TrendingDownIcon color="error" />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Trend
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
