import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { motion } from 'framer-motion';
import ProgressCard from '../components/ProgressCard';
import { useSettings } from '../hooks/useSettings';
import { useTasks } from '../hooks/useTasks';

export default function Rewards() {
  const { settings } = useSettings();
  const { tasks } = useTasks();
  const [dailyHours, setDailyHours] = useState(0);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [monthlyHours, setMonthlyHours] = useState(0);

  useEffect(() => {
    // Calculate hours for today, week, and month
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailyTotal = tasks.reduce((acc, task) => {
      if (!task.completed) return acc;
      const taskDate = new Date(task.completedAt);
      if (task.completedAt && taskDate >= startOfDay) {
        return acc + (task.durationHours || 0);
      }
      return acc;
    }, 0);

    const weeklyTotal = tasks.reduce((acc, task) => {
      if (!task.completed) return acc;
      const taskDate = new Date(task.completedAt);
      if (task.completedAt && taskDate >= startOfWeek) {
        return acc + (task.durationHours || 0);
      }
      return acc;
    }, 0);

    const monthlyTotal = tasks.reduce((acc, task) => {
      if (!task.completed) return acc;
      const taskDate = new Date(task.completedAt);
      if (task.completedAt && taskDate >= startOfMonth) {
        return acc + (task.durationHours || 0);
      }
      return acc;
    }, 0);

    setDailyHours(dailyTotal);
    setWeeklyHours(weeklyTotal);
    setMonthlyHours(monthlyTotal);
  }, [tasks]);

  if (!settings?.dailyGoal || !settings?.weeklyGoal || !settings?.monthlyGoal) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Please set your daily, weekly, and monthly goals in the Settings page to track your rewards progress.
        </Alert>
      </Box>
    );
  }
  const dailyProgress = {
    title: 'Daily Progress',
    current: dailyHours,
    goal: settings.dailyGoal,
    reward: settings.dailyReward,
    isCompleted: dailyHours >= settings.dailyGoal,
    period: 'day'
  };

  const weeklyProgress = {
    title: 'Weekly Progress',
    current: weeklyHours,
    goal: settings.weeklyGoal,
    reward: settings.weeklyReward,
    isCompleted: weeklyHours >= settings.weeklyGoal,
    period: 'week'
  };

  const monthlyProgress = {
    title: 'Monthly Progress',
    current: monthlyHours,
    goal: settings.monthlyGoal,
    reward: settings.monthlyReward,
    isCompleted: monthlyHours >= settings.monthlyGoal,
    period: 'month'
  };

  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{ p: 3 }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 3,
          background: theme => 
            `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Rewards Progress
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ProgressCard {...dailyProgress} />
        </Grid>
        <Grid item xs={12} md={4}>
          <ProgressCard {...weeklyProgress} />
        </Grid>
        <Grid item xs={12} md={4}>
          <ProgressCard {...monthlyProgress} />
        </Grid>
      </Grid>
    </Box>
  );
}
