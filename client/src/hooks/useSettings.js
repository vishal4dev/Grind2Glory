import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';

export function useSettings() {
  const { settings, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.fetchSettings();
      dispatch({ type: 'SET_SETTINGS', payload: data });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateSettings = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.updateSettings(updates);
      dispatch({ type: 'SET_SETTINGS', payload: data });
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error updating settings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings
  };
}