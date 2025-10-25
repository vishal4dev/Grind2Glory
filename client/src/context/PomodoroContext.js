import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { calculatePomodoroSessions } from '../utils/pomodoroCalculator';
import { 
  requestNotificationPermission, 
  notifySessionComplete, 
  notifyBreakComplete, 
  notifyTaskComplete 
} from '../utils/notifications';

const STORAGE_KEY = 'grind2glory_pomodoro_state';

const initialState = {
  activeTask: null, // The task object currently in focus
  sessions: [], // Array of session objects
  currentSessionIndex: 0, // Which session we're on (0-based)
  isRunning: false, // Is timer actively counting down
  isBreakTime: false, // Are we in a break period
  secondsRemaining: 0, // Current countdown value
  completedSessions: [], // Array of completed session numbers
  startedAt: null, // Timestamp when current session started
  pausedAt: null // Timestamp when paused (for calculating elapsed time)
};

const PomodoroContext = createContext(initialState);

export function PomodoroProvider({ children }) {
  const [state, dispatch] = useReducer(pomodoroReducer, initialState, loadStateFromStorage);
  const timerRef = useRef(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Countdown mechanism - runs every second when active
  useEffect(() => {
    if (state.isRunning && state.secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isRunning, state.secondsRemaining]);

  // Handle session/break transitions
  useEffect(() => {
    if (state.isRunning && state.secondsRemaining === 0) {
      handleSessionComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.secondsRemaining, state.isRunning]);

  const handleSessionComplete = useCallback(() => {
    if (state.isBreakTime) {
      // Break ended - notify and pause
      notifyBreakComplete();
      dispatch({ type: 'BREAK_COMPLETE' });
    } else {
      // Work session ended - notify
      notifySessionComplete();
      
      const currentSession = state.sessions[state.currentSessionIndex];
      const isLastSession = state.currentSessionIndex === state.sessions.length - 1;
      
      if (isLastSession) {
        // All sessions complete - notify task complete
        if (state.activeTask) {
          notifyTaskComplete(state.activeTask.title);
        }
        dispatch({ type: 'PAUSE' });
      } else if (currentSession && currentSession.hasBreak) {
        // Automatically start break
        dispatch({ type: 'START_BREAK' });
      } else {
        // No break - pause
        dispatch({ type: 'PAUSE' });
      }
    }
  }, [state.isBreakTime, state.currentSessionIndex, state.sessions, state.activeTask]);

  // Actions
  const startPomodoro = useCallback(async (task) => {
    // Request notification permission on first pomodoro start
    await requestNotificationPermission();
    
    const pomodoroData = calculatePomodoroSessions(task.durationHours);
    
    dispatch({
      type: 'START_POMODORO',
      payload: {
        task,
        sessions: pomodoroData.sessions
      }
    });
  }, []);

  const play = useCallback(() => {
    dispatch({ type: 'PLAY' });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const skipBreak = useCallback(() => {
    dispatch({ type: 'SKIP_BREAK' });
  }, []);

  const skipSession = useCallback(() => {
    dispatch({ type: 'SKIP_SESSION' });
  }, []);

  const completeTask = useCallback(() => {
    dispatch({ type: 'COMPLETE_TASK' });
  }, []);

  const abandonTask = useCallback(() => {
    dispatch({ type: 'ABANDON_TASK' });
  }, []);

  const clearPomodoro = useCallback(() => {
    dispatch({ type: 'CLEAR_POMODORO' });
  }, []);

  const value = {
    ...state,
    startPomodoro,
    play,
    pause,
    skipBreak,
    skipSession,
    completeTask,
    abandonTask,
    clearPomodoro
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within PomodoroProvider');
  }
  return context;
}

// Reducer
function pomodoroReducer(state, action) {
  switch (action.type) {
    case 'START_POMODORO': {
      const { task, sessions } = action.payload;
      const firstSession = sessions[0];
      
      return {
        ...state,
        activeTask: task,
        sessions,
        currentSessionIndex: 0,
        isRunning: true,
        isBreakTime: false,
        secondsRemaining: firstSession.workDuration * 60,
        completedSessions: [],
        startedAt: Date.now(),
        pausedAt: null
      };
    }

    case 'PLAY': {
      return {
        ...state,
        isRunning: true,
        pausedAt: null,
        startedAt: state.startedAt || Date.now()
      };
    }

    case 'PAUSE': {
      return {
        ...state,
        isRunning: false,
        pausedAt: Date.now()
      };
    }

    case 'TICK': {
      const newSeconds = Math.max(0, state.secondsRemaining - 1);
      return {
        ...state,
        secondsRemaining: newSeconds
      };
    }

    case 'START_BREAK': {
      const currentSession = state.sessions[state.currentSessionIndex];
      
      // Only add to completed if not already there
      const alreadyCompleted = state.completedSessions.includes(state.currentSessionIndex);
      const newCompletedSessions = alreadyCompleted 
        ? state.completedSessions 
        : [...state.completedSessions, state.currentSessionIndex];
      
      return {
        ...state,
        isBreakTime: true,
        isRunning: true,
        secondsRemaining: currentSession.breakDuration * 60,
        completedSessions: newCompletedSessions,
        startedAt: Date.now()
      };
    }

    case 'BREAK_COMPLETE': {
      const nextSessionIndex = state.currentSessionIndex + 1;
      const hasNextSession = nextSessionIndex < state.sessions.length;

      if (hasNextSession) {
        // Move to next session but pause (wait for user)
        const nextSession = state.sessions[nextSessionIndex];
        return {
          ...state,
          currentSessionIndex: nextSessionIndex,
          isBreakTime: false,
          isRunning: false,
          secondsRemaining: nextSession.workDuration * 60,
          pausedAt: Date.now()
        };
      } else {
        // All sessions complete
        return {
          ...state,
          isRunning: false,
          isBreakTime: false,
          pausedAt: Date.now()
        };
      }
    }

    case 'SKIP_BREAK': {
      const nextSessionIndex = state.currentSessionIndex + 1;
      const hasNextSession = nextSessionIndex < state.sessions.length;

      if (hasNextSession && state.isBreakTime) {
        const nextSession = state.sessions[nextSessionIndex];
        return {
          ...state,
          currentSessionIndex: nextSessionIndex,
          isBreakTime: false,
          isRunning: false,
          secondsRemaining: nextSession.workDuration * 60,
          pausedAt: Date.now()
        };
      }
      return state;
    }

    case 'SKIP_SESSION': {
      const currentSession = state.sessions[state.currentSessionIndex];
      
      if (!state.isBreakTime && currentSession) {
        // Only add to completed if not already there
        const alreadyCompleted = state.completedSessions.includes(state.currentSessionIndex);
        const newCompletedSessions = alreadyCompleted 
          ? state.completedSessions 
          : [...state.completedSessions, state.currentSessionIndex];
        
        // Check if all sessions are now complete
        const allSessionsComplete = newCompletedSessions.length >= state.sessions.length;
        
        if (allSessionsComplete) {
          // Task complete - notify and pause
          if (state.activeTask) {
            notifyTaskComplete(state.activeTask.title);
          }
          return {
            ...state,
            isRunning: false,
            completedSessions: newCompletedSessions,
            pausedAt: Date.now()
          };
        }
        
        // Check if there's a break after this session
        if (currentSession.hasBreak) {
          // Start the break
          return {
            ...state,
            isBreakTime: true,
            isRunning: true,
            secondsRemaining: currentSession.breakDuration * 60,
            completedSessions: newCompletedSessions,
            startedAt: Date.now()
          };
        } else {
          // No break, move to next session
          const nextSessionIndex = state.currentSessionIndex + 1;
          const hasNextSession = nextSessionIndex < state.sessions.length;
          
          if (hasNextSession) {
            const nextSession = state.sessions[nextSessionIndex];
            return {
              ...state,
              currentSessionIndex: nextSessionIndex,
              isBreakTime: false,
              isRunning: false,
              secondsRemaining: nextSession.workDuration * 60,
              completedSessions: newCompletedSessions,
              pausedAt: Date.now()
            };
          } else {
            // All sessions complete
            return {
              ...state,
              isRunning: false,
              completedSessions: newCompletedSessions,
              pausedAt: Date.now()
            };
          }
        }
      }
      return state;
    }

    case 'COMPLETE_TASK':
    case 'ABANDON_TASK':
    case 'CLEAR_POMODORO': {
      return initialState;
    }

    default:
      return state;
  }
}

// Storage helpers
function loadStateFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Auto-pause for safety on page reload
      return {
        ...parsed,
        isRunning: false,
        pausedAt: Date.now()
      };
    }
  } catch (error) {
    console.error('Error loading pomodoro state:', error);
  }
  return initialState;
}

function saveStateToStorage(state) {
  try {
    // Only save if there's an active task
    if (state.activeTask) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving pomodoro state:', error);
  }
}
