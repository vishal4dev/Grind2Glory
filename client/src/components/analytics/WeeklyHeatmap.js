import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { format, eachDayOfInterval, subDays, getDay } from 'date-fns';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeeklyHeatmap({ tasks, dateRange }) {
  const heatmapData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const days = dateRange === 0 ? 30 : dateRange;
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    const dateArray = eachDayOfInterval({ start: startDate, end: endDate });

    // Group tasks by date
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

    // Create heatmap data
    return dateArray.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        date: dateStr,
        day: getDay(date),
        dayName: DAYS[getDay(date)],
        displayDate: format(date, 'MMM dd'),
        hours: tasksByDate[dateStr] || 0
      };
    });
  }, [tasks, dateRange]);

  const stats = useMemo(() => {
    if (heatmapData.length === 0) return { maxHours: 0, mostProductiveDay: null };

    const maxHours = Math.max(...heatmapData.map(d => d.hours));
    const dayHours = {};
    
    heatmapData.forEach(d => {
      if (!dayHours[d.dayName]) dayHours[d.dayName] = 0;
      dayHours[d.dayName] += d.hours;
    });

    const mostProductiveDay = Object.entries(dayHours)
      .reduce((max, [day, hours]) => hours > max.hours ? { day, hours } : max, { day: 'N/A', hours: 0 });

    return { maxHours, mostProductiveDay };
  }, [heatmapData]);

  const getColor = (hours) => {
    if (hours === 0) return '#f3f4f6';
    if (stats.maxHours === 0) return '#f3f4f6';
    
    const intensity = hours / stats.maxHours;
    if (intensity < 0.25) return '#ddd6fe';
    if (intensity < 0.5) return '#c4b5fd';
    if (intensity < 0.75) return '#a78bfa';
    return '#7c3aed';
  };

  if (heatmapData.length === 0 || stats.maxHours === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          🔥 No heatmap data yet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Work on different days to see your heatmap!
        </Typography>
      </Box>
    );
  }

  // Group by weeks
  const weeks = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  return (
    <Box>
      {/* Chart Title and Key Metrics */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Weekly Heatmap
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Most Productive Day: <strong>{stats.mostProductiveDay.day}</strong> ({stats.mostProductiveDay.hours.toFixed(1)}h total)
          </Typography>
        </Box>
      </Box>

      {/* Heatmap Grid */}
      <Box sx={{ overflowX: 'auto', pb: 2 }}>
        <Box sx={{ minWidth: 600 }}>
          {/* Day labels */}
          <Box sx={{ display: 'flex', mb: 1, ml: 8 }}>
            {weeks.map((week, weekIdx) => (
              <Box key={weekIdx} sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Week {weekIdx + 1}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Heatmap rows */}
          {DAYS.map((dayName, dayIdx) => (
            <Box key={dayName} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography 
                variant="body2" 
                sx={{ width: 60, textAlign: 'right', pr: 2, color: 'text.secondary' }}
              >
                {dayName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
                {weeks.map((week, weekIdx) => {
                  const dayData = week.find(d => d.day === dayIdx);
                  if (!dayData) return <Box key={weekIdx} sx={{ flex: 1, height: 40 }} />;
                  
                  return (
                    <Tooltip 
                      key={weekIdx}
                      title={`${dayData.displayDate}: ${dayData.hours.toFixed(1)}h`}
                      arrow
                    >
                      <Box
                        sx={{
                          flex: 1,
                          height: 40,
                          bgcolor: getColor(dayData.hours),
                          borderRadius: 1,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: 2
                          }
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          ))}

          {/* Legend */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3, ml: 8 }}>
            <Typography variant="caption" color="text.secondary">
              Less
            </Typography>
            {[0, 0.25, 0.5, 0.75, 1].map((intensity, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: intensity === 0 ? '#f3f4f6' : 
                           intensity === 0.25 ? '#ddd6fe' :
                           intensity === 0.5 ? '#c4b5fd' :
                           intensity === 0.75 ? '#a78bfa' : '#7c3aed',
                  borderRadius: 0.5
                }}
              />
            ))}
            <Typography variant="caption" color="text.secondary">
              More
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
