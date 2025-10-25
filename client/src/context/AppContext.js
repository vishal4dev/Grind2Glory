import { createContext, useContext, useReducer, useEffect } from 'react';
import * as api from '../services/api';

const initialState = {
  tasks: [],
  settings: null,
  loading: false,
  error: null
};

const AppContext = createContext(initialState);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const settingsRes = await api.fetchSettings();
        dispatch({ type: 'SET_SETTINGS', payload: settingsRes.data });
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };
    loadInitialData();
  }, []);

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'DELETE_TASK':
      return { 
        ...state, 
        tasks: state.tasks.filter(t => t._id !== action.payload) 
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t._id === action.payload._id ? action.payload : t)
      };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}