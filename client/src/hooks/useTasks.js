import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';

export function useTasks() {
  const { tasks, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.fetchTasks();
      dispatch({ type: 'SET_TASKS', payload: data });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const createTask = useCallback(async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.createTask(taskData);
      dispatch({ type: 'ADD_TASK', payload: data });
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error creating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const deleteTask = useCallback(async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      await api.deleteTask(taskId);
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    } catch (err) {
      setError(err.message);
      console.error('Error deleting task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateTask = useCallback(async (taskId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.updateTask(taskId, updates);
      dispatch({ type: 'UPDATE_TASK', payload: data });
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error updating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    deleteTask,
    updateTask
  };
}