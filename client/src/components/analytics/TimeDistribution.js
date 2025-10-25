import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TIME_PERIODS = [
  { name: 'Morning', icon: '☀️', start: 6, end: 12, color: '#fbbf24' },
  { name: 'Afternoon', icon: '🌤️', start: 12, end: 18, color: '#f59e0b' },
  { name: 'Evening', icon: '🌆', start: 18, end: 22, color: '#f97316' },
  { name: 'Night', icon: '🌙', start: 22, end: 6, color: '#7c3aed' }
];

export default function TimeDistribution({ tasks }) {
  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const periodHours = {
      'Morning': 0,
      'Afternoon': 0,
      'Evening': 0,
      'Night': 0
    };

    tasks.forEach(task => {
      if (task.completed && task.completedAt) {
        const hour = new Date(task.completedAt).getHours();
        const duration = task.durationHours || 0;

        if (hour >= 6 && hour < 12) {
          periodHours['Morning'] += duration;
        } else if (hour >= 12 && hour < 18) {
          periodHours['Afternoon'] += duration;
        } else if (hour >= 18 && hour < 22) {
          periodHours['Evening'] += duration;
        } else {
          periodHours['Night'] += duration;
        }
      }
    });

    return TIME_PERIODS.map(period => ({
      ...period,
      hours: parseFloat(periodHours[period.name].toFixed(1))
    }));
  }, [tasks]);

  const peakTime = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((max, period) => 
      period.hours > max.hours ? period : max, 
      chartData[0]
    );
  }, [chartData]);

  if (chartData.every(period => period.hours === 0)) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          ⏰ No time data yet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete tasks during different times to see patterns!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Chart Title and Key Metrics */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Time Distribution
        </Typography>
        {peakTime && peakTime.hours > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Peak Productivity: <strong>{peakTime.icon} {peakTime.name}</strong> ({peakTime.hours}h)
            </Typography>
          </Box>
        )}
      </Box>

      {/* Horizontal Bar Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number" 
            stroke="#6b7280"
            label={{ value: 'Hours', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#6b7280"
            tick={(props) => {
              const { x, y, payload } = props;
              const period = TIME_PERIODS.find(p => p.name === payload.value);
              return (
                <g transform={`translate(${x},${y})`}>
                  <text x={-10} y={0} textAnchor="end" fill="#374151" fontSize={14}>
                    <tspan fontSize={18}>{period?.icon}</tspan>
                    <tspan dx={8}>{payload.value}</tspan>
                  </text>
                </g>
              );
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 12
            }}
            formatter={(value) => [`${value} hours`, 'Completed']}
          />
          <Bar dataKey="hours" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
