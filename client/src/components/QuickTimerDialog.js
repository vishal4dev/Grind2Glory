import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { usePomodoro } from '../context/PomodoroContext';
import { getPomodoroPreview } from '../utils/pomodoroCalculator';

export default function QuickTimerDialog({ open, onClose }) {
  const navigate = useNavigate();
  const { startPomodoro, activeTask } = usePomodoro();
  const [duration, setDuration] = useState('1');
  const [taskName, setTaskName] = useState('');

  const handleStart = () => {
    const durationHours = parseFloat(duration);
    
    if (!durationHours || durationHours <= 0) {
      alert('Please enter a valid duration');
      return;
    }

    if (durationHours > 8) {
      alert('Duration cannot exceed 8 hours. Please break it into smaller sessions.');
      return;
    }

    // Create a temporary task object for the timer
    const quickTask = {
      _id: `quick-${Date.now()}`,
      title: taskName || 'Quick Focus Session',
      durationHours: durationHours,
      completed: false,
      isQuickTimer: true
    };

    startPomodoro(quickTask);
    onClose();
    navigate('/current-task');
  };

  const preview = duration && parseFloat(duration) > 0 
    ? getPomodoroPreview(parseFloat(duration))
    : '';

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Quick Focus Timer</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Start a Pomodoro session without creating a task
          </Typography>

          <TextField
            label="Session Name (Optional)"
            placeholder="e.g., Study, Code, Write..."
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Duration (hours)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            inputProps={{ min: 0.25, max: 8, step: 0.25 }}
            fullWidth
            helperText="Enter duration in hours (e.g., 1.5 for 1 hour 30 minutes)"
          />

          {preview && (
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'action.hover', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="body2" color="secondary" fontWeight={600}>
                {preview}
              </Typography>
            </Box>
          )}

          {activeTask && (
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'warning.light', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'warning.main'
              }}
            >
              <Typography variant="body2" color="warning.dark">
                Warning: You have an active session. Starting a new one will replace it.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleStart} 
          variant="contained" 
          color="secondary"
          disabled={!duration || parseFloat(duration) <= 0}
        >
          Start Timer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
