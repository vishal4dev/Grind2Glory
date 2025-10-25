import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';
// import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useSettings } from '../hooks/useSettings';
import { useTasks } from '../hooks/useTasks';

function formatTime(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h > 0 ? `${h}h` : ''}${m > 0 ? ` ${m}m` : ''}`.trim();
}

export default function CompletionProgress() {
  const { settings } = useSettings();
  const { tasks } = useTasks();
  const [hovered, setHovered] = useState(null);

  // Calculate completed hours
  const completedHours = useMemo(() =>
    tasks.filter(t => t.completed).reduce((acc, t) => acc + (t.durationHours || 0), 0),
    [tasks]
  );

  const dailyGoal = settings?.dailyGoal || 0;
  const weeklyGoal = settings?.weeklyGoal || 0;
  const monthlyGoal = settings?.monthlyGoal || 0;

  // Checkpoint positions (as % of monthly goal)
  const dailyPct = monthlyGoal ? (dailyGoal / monthlyGoal) * 100 : 0;
  const weeklyPct = monthlyGoal ? (weeklyGoal / monthlyGoal) * 100 : 0;
  const monthlyPct = 100;
  const progressPct = monthlyGoal ? Math.min(100, (completedHours / monthlyGoal) * 100) : 0;

  // Checkpoint completion
  const dailyDone = completedHours >= dailyGoal;
  const weeklyDone = completedHours >= weeklyGoal;
  const monthlyDone = completedHours >= monthlyGoal;

  // Tooltip/label logic
  let label = '';
  let highlight = '';
  if (hovered === 'daily') {
    const left = Math.max(0, dailyGoal - completedHours);
    label = `To daily goal: `;
    highlight = formatTime(left);
  } else if (hovered === 'weekly') {
    const left = Math.max(0, weeklyGoal - completedHours);
    label = `To weekly goal: `;
    highlight = formatTime(left);
  } else if (hovered === 'monthly') {
    const left = Math.max(0, monthlyGoal - completedHours);
    label = `To monthly goal: `;
    highlight = formatTime(left);
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Completion Progress
        </Typography>
        {hovered && (
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {label}
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '1.1em', display: 'inline-block', px: 1, borderRadius: 1, bgcolor: 'primary.light', ml: 0.5 }}>
                {highlight}
              </Box>
              left
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ position: 'relative', height: 70, display: 'flex', alignItems: 'flex-start', pt: 1, overflow: 'visible' }}>
        <LinearProgress
          variant="determinate"
          value={progressPct}
          sx={{
            height: 14,
            borderRadius: 999,
            flex: 1,
            bgcolor: theme => 
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.secondary.main, 0.12)
                : alpha(theme.palette.secondary.main, 0.08),
            border: theme => `1.5px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            boxShadow: theme =>
              theme.palette.mode === 'dark'
                ? `inset 0 2px 4px ${alpha('#000', 0.4)}`
                : `inset 0 1px 3px ${alpha('#000', 0.08)}`,
            '& .MuiLinearProgress-bar': {
              borderRadius: 999,
              background: theme => `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
              backgroundSize: '200% 100%',
              animation: `${keyframes`
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              `} 3s ease infinite`,
              boxShadow: theme =>
                theme.palette.mode === 'dark'
                  ? `0 0 12px ${alpha(theme.palette.secondary.main, 0.8)}, 0 0 24px ${alpha(theme.palette.secondary.main, 0.4)}, inset 0 1px 0 ${alpha('#fff', 0.2)}`
                  : `0 2px 8px ${alpha(theme.palette.secondary.main, 0.3)}, inset 0 1px 0 ${alpha('#fff', 0.6)}`,
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}
        />
        {/* Checkpoints */}
        {[{ pct: dailyPct, label: 'Daily', done: dailyDone, key: 'daily' },
          { pct: weeklyPct, label: 'Weekly', done: weeklyDone, key: 'weekly' },
          { pct: monthlyPct, label: 'Monthly', done: monthlyDone, key: 'monthly' }].map(cp => (
          <Box
            key={cp.key}
            sx={{
              position: 'absolute',
              left: `calc(${cp.pct}% - 20px)`,
              top: 24,
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              minWidth: 40,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)'
              }
            }}
            onMouseEnter={() => setHovered(cp.key)}
            onMouseLeave={() => setHovered(null)}
          >
            {cp.done ? (
              <CheckCircleIcon 
                sx={{ 
                  color: 'success.main',
                  filter: theme => theme.palette.mode === 'dark' ? 'drop-shadow(0 0 4px rgba(76,175,80,0.6))' : 'none',
                  transition: 'all 0.3s ease'
                }} 
                fontSize="medium" 
              />
            ) : (
              <RadioButtonUncheckedIcon 
                sx={{ 
                  color: theme => alpha(theme.palette.success.main, 0.5),
                  transition: 'all 0.3s ease'
                }} 
                fontSize="medium" 
              />
            )}
            <Typography
              variant="caption"
              sx={{
                mt: 0.75,
                fontWeight: 700,
                fontSize: '0.7rem',
                color: cp.done ? 'success.main' : 'text.secondary',
                letterSpacing: 0.5,
                bgcolor: theme => hovered === cp.key 
                  ? alpha(theme.palette.secondary.main, 0.15)
                  : 'transparent',
                border: theme => hovered === cp.key
                  ? `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`
                  : 'none',
                borderRadius: 999,
                px: 1,
                py: 0.25,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {cp.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 1, textAlign: 'right' }}>
        <Typography variant="body2" color="text.secondary">
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {formatTime(completedHours)}
          </Box>
          {' '}of {formatTime(monthlyGoal)} hours completed this month
        </Typography>
      </Box>
    </Box>
  );
}
