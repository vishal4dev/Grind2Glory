import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useSettings } from '../hooks/useSettings';
import { useTasks } from '../hooks/useTasks';

export default function TaskProgress() {
  const { settings } = useSettings();
  const { tasks } = useTasks();
  const [todayHours, setTodayHours] = React.useState(0);

  React.useEffect(() => {
    // Calculate hours for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyTotal = tasks.reduce((acc, task) => {
      if (!task.completed) return acc;
      const taskDate = new Date(task.completedAt);
      if (task.completedAt && taskDate >= today) {
        return acc + (task.durationHours || 0);
      }
      return acc;
    }, 0);

    setTodayHours(dailyTotal);
  }, [tasks]);

  const dailyGoal = settings?.dailyGoal || 8;
  const progress = Math.min(100, (todayHours / dailyGoal) * 100);
  const remaining = Math.max(0, dailyGoal - todayHours);

  return (
    <Card 
      sx={{ 
        mb: 3,
        background: theme => 
          'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%)'
      }}
    >
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Today's Progress
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {todayHours.toFixed(1)} hours completed out of {dailyGoal} hours goal
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.05)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: theme => 
                  `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`
              }
            }}
          />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {remaining > 0 
              ? `${remaining.toFixed(1)} hours remaining today`
              : 'Daily goal completed! 🎉'
            }
          </Typography>
        </Box>

        {settings?.dailyReward && progress >= 100 && (
          <Box 
            sx={{ 
              mt: 2,
              p: 2,
              borderRadius: 1,
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              color: 'secondary.main'
            }}
          >
            <Typography variant="subtitle2">
              🎉 You've earned your daily reward: {settings.dailyReward}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}