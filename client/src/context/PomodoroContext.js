import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { calculatePomodoroSessions } from '../utils/pomodoroCalculator';
import { 
  requestNotificationPermission, 
  notifySessionComplete, 
  notifyBreakComplete, 
  notifyTaskComplete 
} from '../utils/notifications';

const STORAGE_KEY = 'grind2glory_pomodoro_state';

const initialState = {
  activeTask: null,
  sessions: [],
  currentSessionIndex: 0,
  isRunning: false,
  isBreakTime: false,
  secondsRemaining: 0,
  completedSessions: [],
  startedAt: null,
  pausedAt: null
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

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isRunning, state.secondsRemaining]);

  // FIXED: Handle session/break transitions when timer hits 0
  useEffect(() => {
    // Only trigger when timer hits exactly 0 and was running
    if (state.secondsRemaining === 0 && state.sessions.length > 0) {
      if (state.isBreakTime) {
        // Break ended - notify and move to next session
        notifyBreakComplete();
        
        const nextSessionIndex = state.currentSessionIndex + 1;
        const hasNextSession = nextSessionIndex < state.sessions.length;

        if (hasNextSession) {
          // Move to next session but pause (wait for user)
          const nextSession = state.sessions[nextSessionIndex];
          dispatch({ 
            type: 'MOVE_TO_NEXT_SESSION',
            payload: {
              sessionIndex: nextSessionIndex,
              workDuration: nextSession.workDuration
            }
          });
        } else {
          // All sessions complete
          dispatch({ type: 'ALL_SESSIONS_COMPLETE' });
        }
      } else {
        // Work session ended - notify
        notifySessionComplete();
        
        const currentSession = state.sessions[state.currentSessionIndex];
        const isLastSession = state.currentSessionIndex === state.sessions.length - 1;
        
        // Mark current session as completed
        const alreadyCompleted = state.completedSessions.includes(state.currentSessionIndex);
        if (!alreadyCompleted) {
          dispatch({ 
            type: 'MARK_SESSION_COMPLETE',
            payload: state.currentSessionIndex 
          });
        }
        
        if (isLastSession) {
          // All sessions complete - notify task complete
          if (state.activeTask) {
            notifyTaskComplete(state.activeTask.title);
          }
          dispatch({ type: 'ALL_SESSIONS_COMPLETE' });
        } else if (currentSession && currentSession.hasBreak) {
          // Automatically start break
          dispatch({ 
            type: 'AUTO_START_BREAK',
            payload: currentSession.breakDuration
          });
        } else {
          // No break - just pause
          dispatch({ type: 'SESSION_COMPLETE_NO_BREAK' });
        }
      }
    }
  }, [state.secondsRemaining, state.isBreakTime, state.currentSessionIndex, state.sessions, state.completedSessions, state.activeTask]);

  // Actions
  const startPomodoro = async (task) => {
    await requestNotificationPermission();
    
    const pomodoroData = calculatePomodoroSessions(task.durationHours);
    
    dispatch({
      type: 'START_POMODORO',
      payload: {
        task,
        sessions: pomodoroData.sessions
      }
    });
  };

  const play = () => dispatch({ type: 'PLAY' });
  const pause = () => dispatch({ type: 'PAUSE' });
  
  const skipBreak = () => {
    const nextSessionIndex = state.currentSessionIndex + 1;
    const hasNextSession = nextSessionIndex < state.sessions.length;

    if (hasNextSession && state.isBreakTime) {
      const nextSession = state.sessions[nextSessionIndex];
      dispatch({ 
        type: 'MOVE_TO_NEXT_SESSION',
        payload: {
          sessionIndex: nextSessionIndex,
          workDuration: nextSession.workDuration
        }
      });
    }
  };
  
  const skipSession = () => {
    if (!state.isBreakTime) {
      dispatch({ type: 'SKIP_CURRENT_SESSION' });
    }
  };
  
  const completeTask = () => dispatch({ type: 'COMPLETE_TASK' });
  const abandonTask = () => dispatch({ type: 'ABANDON_TASK' });
  const clearPomodoro = () => dispatch({ type: 'CLEAR_POMODORO' });

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

    case 'MARK_SESSION_COMPLETE': {
      return {
        ...state,
        completedSessions: [...state.completedSessions, action.payload]
      };
    }

    case 'AUTO_START_BREAK': {
      return {
        ...state,
        isBreakTime: true,
        isRunning: true,
        secondsRemaining: action.payload * 60,
        startedAt: Date.now()
      };
    }

    case 'SESSION_COMPLETE_NO_BREAK': {
      return {
        ...state,
        isRunning: false,
        pausedAt: Date.now()
      };
    }

    case 'MOVE_TO_NEXT_SESSION': {
      return {
        ...state,
        currentSessionIndex: action.payload.sessionIndex,
        isBreakTime: false,
        isRunning: false,
        secondsRemaining: action.payload.workDuration * 60,
        pausedAt: Date.now()
      };
    }

    case 'ALL_SESSIONS_COMPLETE': {
      return {
        ...state,
        isRunning: false,
        pausedAt: Date.now()
      };
    }

    case 'SKIP_CURRENT_SESSION': {
      const currentSession = state.sessions[state.currentSessionIndex];
      
      // Mark as completed
      const alreadyCompleted = state.completedSessions.includes(state.currentSessionIndex);
      const newCompletedSessions = alreadyCompleted 
        ? state.completedSessions 
        : [...state.completedSessions, state.currentSessionIndex];
      
      // Check if all sessions are now complete
      const allSessionsComplete = newCompletedSessions.length >= state.sessions.length;
      
      if (allSessionsComplete) {
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
          return {
            ...state,
            isRunning: false,
            completedSessions: newCompletedSessions,
            pausedAt: Date.now()
          };
        }
      }
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
    if (state.activeTask) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving pomodoro state:', error);
  }
}