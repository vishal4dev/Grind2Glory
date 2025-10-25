import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
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
    <Box sx={{ position: 'relative', width: '100%', mb: 4, px: 2 }}>
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
      <Box sx={{ position: 'relative', height: 36, display: 'flex', alignItems: 'center' }}>
        <LinearProgress
          variant="determinate"
          value={progressPct}
          sx={{ height: 10, borderRadius: 5, flex: 1, bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': { bgcolor: 'success.main' }
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
              left: `calc(${cp.pct}% - 16px)`,
              top: -8,
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              minWidth: 32
            }}
            onMouseEnter={() => setHovered(cp.key)}
            onMouseLeave={() => setHovered(null)}
          >
            {cp.done ? (
              <CheckCircleIcon sx={{ color: 'success.main' }} fontSize="medium" />
            ) : (
              <RadioButtonUncheckedIcon sx={{ color: 'success.light' }} fontSize="medium" />
            )}
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                fontWeight: 700,
                color: cp.done ? 'success.main' : 'text.secondary',
                letterSpacing: 0.5,
                textShadow: '0 1px 4px #fff',
                bgcolor: hovered === cp.key ? 'primary.light' : 'transparent',
                borderRadius: 1,
                px: 1
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
