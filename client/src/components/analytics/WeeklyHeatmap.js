import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { format } from 'date-fns';
import { fetchHeatmapData } from '../../services/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeeklyHeatmap({ dateRange }) {
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);
  const [stats, setStats] = useState({ maxHours: 0, mostProductiveDay: { day: 'N/A', hours: 0 } });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { data } = await fetchHeatmapData(dateRange);
        
        // Add day names and display dates
        const enrichedData = data.heatmapData.map(item => ({
          ...item,
          dayName: DAYS[item.day],
          displayDate: format(new Date(item.date), 'MMM dd')
        }));
        
        setHeatmapData(enrichedData);
        setStats(data.stats);
      } catch (error) {
        console.error('Error loading heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dateRange]);

  const getColor = (hours) => {
    if (hours === 0) return '#f3f4f6';
    if (stats.maxHours === 0) return '#f3f4f6';
    
    const intensity = hours / stats.maxHours;
    if (intensity < 0.25) return '#ddd6fe';
    if (intensity < 0.5) return '#c4b5fd';
    if (intensity < 0.75) return '#a78bfa';
    return '#7c3aed';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (heatmapData.length === 0) {
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

  // Organize data by day of week for proper calendar grid
const weeks = [];
let currentWeek = Array(7).fill(null);

// Get the day of week for the first date (0 = Sunday, 6 = Saturday)
const firstDayOfWeek = heatmapData[0]?.day || 0;

// Fill first week starting from the correct day
let weekIndex = firstDayOfWeek;
heatmapData.forEach((dayData) => {
  currentWeek[weekIndex] = dayData;
  weekIndex++;
  
  // Start new week when we reach 7 days
  if (weekIndex === 7) {
    weeks.push([...currentWeek]);
    currentWeek = Array(7).fill(null);
    weekIndex = 0;
  }
});

// Add the last incomplete week if it has any data
if (weekIndex > 0) {
  weeks.push(currentWeek);
}

  return (
    <Box>
      {/* Chart Title and Key Metrics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Activity Heatmap
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Most Productive Day
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight={600}>
              {stats.mostProductiveDay.day} ({stats.mostProductiveDay.hours.toFixed(1)}h)
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Days Tracked
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {heatmapData.length} days
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Heatmap Grid - GitHub-style */}
      <Box sx={{ overflowX: 'auto', pb: 2 }}>
        <Box sx={{ minWidth: 700 }}>
          {/* Month labels - simplified */}
          <Box sx={{ display: 'flex', mb: 2, ml: 10 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {heatmapData.length > 0 ? format(new Date(heatmapData[0].date), 'MMM yyyy') : 'Calendar'}
            </Typography>
          </Box>

          {/* Grid: Days of week (vertical) x Weeks (horizontal) */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* Day labels column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 0 }}>
              {DAYS.map((dayName) => (
                <Box
                  key={dayName}
                  sx={{
                    height: 30,
                    width: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    pr: 2
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                    {dayName}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Weeks grid */}
            <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
              {weeks.map((week, weekIdx) => (
                <Box key={weekIdx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
                  {week.map((dayData, dayIdx) => {
                    if (!dayData) {
                      return (
                        <Box
                          key={dayIdx}
                          sx={{
                            height: 30,
                            bgcolor: 'transparent',
                            borderRadius: 0.5
                          }}
                        />
                      );
                    }

                    return (
                      <Tooltip
                        key={dayIdx}
                        title={
                          <Box sx={{ textAlign: 'center', py: 0.5 }}>
                            <Typography variant="caption" display="block">
                              {dayData.displayDate}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {dayData.hours.toFixed(1)} hours
                            </Typography>
                          </Box>
                        }
                        arrow
                        placement="top"
                      >
                        <Box
                          sx={{
                            height: 30,
                            bgcolor: getColor(dayData.hours),
                            borderRadius: 0.5,
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: dayData.hours > 0 ? 'transparent' : '#e5e7eb',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'scale(1.15)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              zIndex: 10
                            }
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4, justifyContent: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Less
            </Typography>
            {[0, 0.25, 0.5, 0.75, 1].map((intensity, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 18,
                  height: 18,
                  bgcolor: intensity === 0 ? '#f3f4f6' : 
                           intensity === 0.25 ? '#ddd6fe' :
                           intensity === 0.5 ? '#c4b5fd' :
                           intensity === 0.75 ? '#a78bfa' : '#7c3aed',
                  borderRadius: 0.5,
                  border: '1px solid',
                  borderColor: intensity === 0 ? '#e5e7eb' : 'transparent'
                }}
              />
            ))}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              More
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
