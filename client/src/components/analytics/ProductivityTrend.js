import React, { useMemo, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

// Count-up animation hook
function useCountUp(end, duration = 1000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(progress * end);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
}

export default function ProductivityTrend({ tasks, dateRange }) {
  const [smoothLine, setSmoothLine] = useState(true);
  const [showGoalLine, setShowGoalLine] = useState(false);
  const [goalHours, setGoalHours] = useState(6);
  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const days = dateRange === 0 ? 30 : dateRange;
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);

    // Create array of all dates in range
    const dateArray = eachDayOfInterval({ start: startDate, end: endDate });

    // Group completed tasks by date
    const tasksByDate = {};
    tasks.forEach(task => {
      if (task.completed && task.completedAt) {
        const date = format(new Date(task.completedAt), 'yyyy-MM-dd');
        if (!tasksByDate[date]) {
          tasksByDate[date] = 0;
        }
        tasksByDate[date] += task.durationHours || 0;
      }
    });

    // Map to chart data
    return dateArray.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        date: format(date, 'MMM dd'),
        fullDate: dateStr,
        hours: tasksByDate[dateStr] || 0
      };
    });
  }, [tasks, dateRange]);

  const stats = useMemo(() => {
    const totalHours = chartData.reduce((sum, day) => sum + day.hours, 0);
    const avgDaily = chartData.length > 0 ? (totalHours / chartData.length) : 0;
    const highestDay = chartData.reduce((max, day) => day.hours > max.hours ? day : max, { hours: 0, date: 'N/A' });

    return {
      total: totalHours,
      average: avgDaily,
      highest: highestDay.hours > 0 ? `${highestDay.date}: ${highestDay.hours.toFixed(1)}h` : 'N/A'
    };
  }, [chartData]);
  
  // Animated counts
  const animatedTotal = useCountUp(stats.total);
  const animatedAverage = useCountUp(stats.average);

  if (chartData.length === 0 || stats.total === '0.0') {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          📈 No data yet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete some tasks to see your productivity trend!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Chart Title and Controls */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            Productivity Trend
          </Typography>
          
          {/* Chart-Specific Controls */}
          <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={smoothLine} 
                  onChange={(e) => setSmoothLine(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="caption">Smooth Line</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={showGoalLine} 
                  onChange={(e) => setShowGoalLine(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="caption">Show Goal ({goalHours}h)</Typography>}
            />
          </Paper>
        </Box>
        
        {/* Key Metrics with Count-up Animation */}
        <Box sx={{ display: 'flex', gap: 4, mt: 2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'scale(1.02)',
                '& .MuiTypography-h3': {
                  textShadow: '0 0 20px rgba(124, 58, 237, 0.5)'
                }
              }
            }}
          >
            <Typography variant="h3" color="primary.main" fontWeight={700}>
              {animatedTotal.toFixed(1)}h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Hours
            </Typography>
          </Box>
          <Box
            sx={{
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          >
            <Typography variant="h4" color="text.primary" fontWeight={600}>
              {animatedAverage.toFixed(1)}h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Daily
            </Typography>
          </Box>
          <Box
            sx={{
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          >
            <Typography variant="body1" color="text.primary" fontWeight={600}>
              {stats.highest}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Highest Day
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Area Chart with Animation */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.15s'
            }}
            formatter={(value) => [`${value.toFixed(1)} hours`, 'Completed']}
            animationDuration={150}
          />
          {showGoalLine && (
            <ReferenceLine 
              y={goalHours} 
              stroke="#10b981" 
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: `Goal: ${goalHours}h`, position: 'right', fill: '#10b981', fontSize: 12 }}
            />
          )}
          <Area 
            type={smoothLine ? 'monotone' : 'linear'}
            dataKey="hours" 
            stroke="#7c3aed" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorHours)"
            animationDuration={1000}
            animationBegin={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
