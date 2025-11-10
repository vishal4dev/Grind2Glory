import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePomodoro } from '../context/PomodoroContext';
import { formatTimerDisplay } from '../utils/pomodoroCalculator';
import * as api from '../services/api';
import Confetti from '../components/Confetti';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { alpha, useTheme } from '@mui/material/styles';

// Floating ambient orbs component
function FloatingOrbs({ isBreakTime }) {
  const theme = useTheme();
  const orbColor = isBreakTime ? '#ff6347' : theme.palette.secondary.main;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(orbColor, 0.15)} 0%, transparent 70%)`,
            animation: `float${i} ${15 + i * 5}s ease-in-out infinite`,
            '@keyframes float1': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '33%': { transform: 'translate(30vw, 20vh) scale(1.1)' },
              '66%': { transform: 'translate(-20vw, 40vh) scale(0.9)' }
            },
            '@keyframes float2': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '33%': { transform: 'translate(-40vw, 30vh) scale(0.9)' },
              '66%': { transform: 'translate(20vw, -20vh) scale(1.1)' }
            },
            '@keyframes float3': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '33%': { transform: 'translate(10vw, -30vh) scale(1.05)' },
              '66%': { transform: 'translate(-30vw, 10vh) scale(0.95)' }
            },
            ...(i === 1 && {
              width: '400px',
              height: '400px',
              top: '10%',
              left: '10%'
            }),
            ...(i === 2 && {
              width: '500px',
              height: '500px',
              top: '50%',
              right: '5%'
            }),
            ...(i === 3 && {
              width: '350px',
              height: '350px',
              bottom: '10%',
              left: '40%'
            })
          }}
        />
      ))}
    </Box>
  );
}

// Circular timer component
function CircularTimer({ secondsRemaining, totalSeconds, isRunning, isBreakTime }) {
  const theme = useTheme();
  const size = 320;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? (secondsRemaining / totalSeconds) : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const timerColor = isBreakTime ? '#ff6347' : theme.palette.secondary.main;

  const [showColon, setShowColon] = useState(true);
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setShowColon(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setShowColon(true);
    }
  }, [isRunning]);

  const timeDisplay = formatTimerDisplay(secondsRemaining);
  const [minutes, seconds] = timeDisplay.split(':');

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={alpha(timerColor, 0.1)}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={timerColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s linear',
            filter: isRunning ? `drop-shadow(0 0 8px ${alpha(timerColor, 0.5)})` : 'none'
          }}
        />
      </svg>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'monospace',
          fontSize: '3.5rem',
          fontWeight: 700,
          color: timerColor,
          userSelect: 'none'
        }}
      >
        <span>{minutes}</span>
        <span style={{ opacity: showColon ? 1 : 0, transition: 'opacity 0.1s' }}>:</span>
        <span>{seconds}</span>
      </Box>
    </Box>
  );
}

// Session progress dots
function SessionProgress({ sessions, currentSessionIndex, completedSessions, isBreakTime }) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, my: 2 }}>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
        {sessions.map((session, index) => {
          const isCompleted = completedSessions.includes(index);
          const isCurrent = index === currentSessionIndex;

          return (
            <Box
              key={index}
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: isCompleted
                  ? 'success.main'
                  : isCurrent
                  ? theme.palette.secondary.main
                  : alpha(theme.palette.text.primary, 0.2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: isCurrent ? 'pulse 2s ease-in-out infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.2)', opacity: 0.8 }
                },
                transition: 'all 0.3s ease'
              }}
            >
              {isCompleted && (
                <CheckCircleIcon sx={{ fontSize: 12, color: 'white' }} />
              )}
            </Box>
          );
        })}
      </Box>

      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontWeight: 500
        }}
      >
        Session {currentSessionIndex + 1} of {sessions.length} •{' '}
        {isBreakTime ? (
          <span style={{ color: '#ff6347' }}>Break Time 🍅</span>
        ) : (
          <span style={{ color: theme.palette.secondary.main }}>Focus Time</span>
        )}
      </Typography>
    </Box>
  );
}

export default function CurrentTask() {
  const navigate = useNavigate();
  const theme = useTheme();
  const {
    activeTask,
    sessions,
    currentSessionIndex,
    isRunning,
    isBreakTime,
    secondsRemaining,
    completedSessions,
    play,
    pause,
    skipBreak,
    skipSession,
    completeTask,
    abandonTask
  } = usePomodoro();
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [flashColor, setFlashColor] = useState(null);
  const [showAutoCompleteDialog, setShowAutoCompleteDialog] = useState(false);
  const prevSecondsRef = useRef(secondsRemaining);

  // Redirect if no active task
  useEffect(() => {
    if (!activeTask) {
      navigate('/');
    }
  }, [activeTask, navigate]);
  
  // Detect session/break completion and trigger animations
  useEffect(() => {
    if (prevSecondsRef.current === 1 && secondsRemaining === 0) {
      if (isBreakTime) {
        setFlashColor('#ff6347');
      } else {
        const isLastSession = currentSessionIndex === sessions.length - 1;
        if (isLastSession) {
          setShowConfetti(true);
        } else {
          setFlashColor('#22c55e');
        }
      }
      
      setTimeout(() => setFlashColor(null), 500);
    }
    
    prevSecondsRef.current = secondsRemaining;
  }, [secondsRemaining, isBreakTime, currentSessionIndex, sessions.length]);

  // FIXED: Auto-complete when all sessions are done
  useEffect(() => {
    const allComplete = completedSessions.length >= sessions.length && sessions.length > 0;
    const timerFinished = secondsRemaining === 0 && !isRunning;
    
    if (allComplete && timerFinished && activeTask && !showAutoCompleteDialog) {
      setShowConfetti(true);
      setShowAutoCompleteDialog(true);
    }
  }, [completedSessions.length, sessions.length, secondsRemaining, isRunning, activeTask, showAutoCompleteDialog]);

  if (!activeTask) {
    return null;
  }

  const currentSession = sessions[currentSessionIndex];
  const totalSeconds = isBreakTime
    ? currentSession?.breakDuration * 60
    : currentSession?.workDuration * 60;

  const completedSessionsCount = completedSessions.length;
  const totalSessions = sessions.length;
  const overallProgress = totalSessions > 0 ? (completedSessionsCount / totalSessions) * 100 : 0;

  const handleComplete = async () => {
    try {
      setShowConfetti(true);
      
      if (!activeTask.isQuickTimer) {
        await api.updateTask(activeTask._id, {
          ...activeTask,
          completed: true,
          completedAt: new Date().toISOString()
        });
      }
      
      setTimeout(() => {
        completeTask();
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task. Please try again.');
      setShowConfetti(false);
    }
  };

  const handleAbandon = () => {
    if (window.confirm('Are you sure? Progress won\'t be saved.')) {
      abandonTask();
      navigate('/');
    }
  };

  const handleAutoCompleteConfirm = () => {
    setShowAutoCompleteDialog(false);
    handleComplete();
  };

  const handleAutoCompleteDismiss = () => {
    setShowAutoCompleteDialog(false);
    setShowConfetti(false);
  };

  const bgColor = isBreakTime
    ? alpha('#ff6347', 0.03)
    : alpha(theme.palette.secondary.main, 0.03);

  return (
    <>
      <Confetti active={showConfetti} />
      
      {flashColor && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: flashColor,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 9998,
            animation: 'flash 0.5s ease-out',
            '@keyframes flash': {
              '0%': { opacity: 0 },
              '50%': { opacity: 0.3 },
              '100%': { opacity: 0 }
            }
          }}
        />
      )}
      
      {/* Auto-complete dialog */}
      <Dialog open={showAutoCompleteDialog} onClose={handleAutoCompleteDismiss}>
        <DialogTitle>🎉 All Sessions Complete!</DialogTitle>
        <DialogContent>
          <Typography>
            You've completed all {totalSessions} Pomodoro sessions for "{activeTask.title}". 
            Would you like to mark this task as complete?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAutoCompleteDismiss}>Not Yet</Button>
          <Button onClick={handleAutoCompleteConfirm} variant="contained" color="success">
            Mark Complete
          </Button>
        </DialogActions>
      </Dialog>
      
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: bgColor,
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${bgColor} 0%, ${theme.palette.background.default} 100%)`
            : `linear-gradient(135deg, ${bgColor} 0%, ${theme.palette.background.default} 100%)`,
          transition: 'all 0.5s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          pt: 8,
          pb: 2,
          px: 2
        }}
      >
      <FloatingOrbs isBreakTime={isBreakTime} />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          maxWidth: 800,
          width: '100%',
          maxHeight: '100%',
          overflow: 'hidden'
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            mb: 0,
            color: 'text.primary'
          }}
        >
          {activeTask.title}
        </Typography>

        <CircularTimer
          secondsRemaining={secondsRemaining}
          totalSeconds={totalSeconds}
          isRunning={isRunning}
          isBreakTime={isBreakTime}
        />

        <SessionProgress
          sessions={sessions}
          currentSessionIndex={currentSessionIndex}
          completedSessions={completedSessions}
          isBreakTime={isBreakTime}
        />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', my: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <IconButton
            onClick={isRunning ? pause : play}
            sx={{
              width: 64,
              height: 64,
              bgcolor: isBreakTime ? '#ff6347' : theme.palette.secondary.main,
              color: 'white',
              '&:hover': {
                bgcolor: isBreakTime ? '#ff4500' : theme.palette.secondary.dark,
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease',
              boxShadow: `0 4px 20px ${alpha(isBreakTime ? '#ff6347' : theme.palette.secondary.main, 0.4)}`
            }}
          >
            {isRunning ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayArrowIcon sx={{ fontSize: 32 }} />}
          </IconButton>

          {isBreakTime ? (
            <Button
              variant="outlined"
              startIcon={<SkipNextIcon />}
              onClick={skipBreak}
              sx={{
                borderColor: '#ff6347',
                color: '#ff6347',
                '&:hover': {
                  borderColor: '#ff4500',
                  bgcolor: alpha('#ff6347', 0.1)
                }
              }}
            >
              Skip Break
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<SkipNextIcon />}
              onClick={skipSession}
              color="secondary"
              sx={{
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.1)
                }
              }}
            >
              Skip Session
            </Button>
          )}
        </Box>

        <Box sx={{ width: '100%', maxWidth: 500 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 1
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Overall Progress
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {completedSessionsCount} / {totalSessions} sessions
            </Typography>
          </Box>
          <Box
            sx={{
              width: '100%',
              height: 8,
              bgcolor: alpha(theme.palette.text.primary, 0.1),
              borderRadius: 4,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                width: `${overallProgress}%`,
                height: '100%',
                bgcolor: 'success.main',
                transition: 'width 0.5s ease',
                borderRadius: 4
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleComplete}
            sx={{
              px: 3,
              py: 1,
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            Complete Task
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={handleAbandon}
            sx={{
              px: 3,
              py: 1,
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            Abandon
          </Button>
        </Box>
      </Box>
    </Box>
    </>
  );
}