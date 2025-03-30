import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State management for tracking time and goals
  const [currentTimer, setCurrentTimer] = useState({
    isRunning: false,
    startTime: null,
    taskName: ''
  });
  
  const [timeEntries, setTimeEntries] = useState([]);
  const [goals, setGoals] = useState({
    daily: 6, // Default 6 hours daily
    weekly: 30, // Default 30 hours weekly
    monthly: 120 // Default 120 hours monthly
  });
  
  const [rewards, setRewards] = useState({
    daily: 'Watch one episode of a show',
    weekly: 'Order my favorite takeout',
    monthly: 'Buy a new book/game'
  });
  
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  
  const [claimedRewards, setClaimedRewards] = useState({
    daily: false,
    weekly: false,
    monthly: false
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('timeEntries');
    const savedGoals = localStorage.getItem('goals');
    const savedRewards = localStorage.getItem('rewards');
    const savedClaims = localStorage.getItem('claimedRewards');
    
    if (savedEntries) setTimeEntries(JSON.parse(savedEntries));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedRewards) setRewards(JSON.parse(savedRewards));
    if (savedClaims) setClaimedRewards(JSON.parse(savedClaims));
    
    calculateStats();
    
    // Reset claimed rewards at appropriate intervals
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const storedDate = localStorage.getItem('lastResetDate');
    
    if (storedDate !== todayStr) {
      setClaimedRewards(prev => ({ ...prev, daily: false }));
      localStorage.setItem('lastResetDate', todayStr);
      
      // Check for week and month resets
      const dayOfWeek = now.getDay();
      const dayOfMonth = now.getDate();
      
      if (dayOfWeek === 1) { // Monday
        setClaimedRewards(prev => ({ ...prev, weekly: false }));
      }
      
      if (dayOfMonth === 1) { // First day of month
        setClaimedRewards(prev => ({ ...prev, monthly: false }));
      }
    }
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
    calculateStats();
  }, [timeEntries]);
  
  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);
  
  useEffect(() => {
    localStorage.setItem('rewards', JSON.stringify(rewards));
  }, [rewards]);
  
  useEffect(() => {
    localStorage.setItem('claimedRewards', JSON.stringify(claimedRewards));
  }, [claimedRewards]);
  
  // Calculate current stats based on time entries
  const calculateStats = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Get the start of current week (Monday)
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay() || 7; // Convert Sunday from 0 to 7
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get the start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Filter and sum hours for each time period
    const dailyHours = timeEntries
      .filter(entry => entry.date.startsWith(today))
      .reduce((sum, entry) => sum + entry.hours, 0);
      
    const weeklyHours = timeEntries
      .filter(entry => new Date(entry.date) >= startOfWeek)
      .reduce((sum, entry) => sum + entry.hours, 0);
      
    const monthlyHours = timeEntries
      .filter(entry => new Date(entry.date) >= startOfMonth)
      .reduce((sum, entry) => sum + entry.hours, 0);
    
    setStats({
      today: dailyHours,
      thisWeek: weeklyHours,
      thisMonth: monthlyHours
    });
  };
  
  // Timer controls
  const startTimer = () => {
    if (!currentTimer.taskName.trim()) {
      alert("Please enter a task name before starting the timer");
      return;
    }
    
    setCurrentTimer({
      ...currentTimer,
      isRunning: true,
      startTime: new Date()
    });
  };
  
  const stopTimer = () => {
    if (!currentTimer.isRunning) return;
    
    const endTime = new Date();
    const duration = (endTime - currentTimer.startTime) / (1000 * 60 * 60); // Hours
    const roundedHours = Math.round(duration * 100) / 100; // Round to 2 decimal places
    
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      taskName: currentTimer.taskName,
      hours: roundedHours,
      startTime: currentTimer.startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    
    setTimeEntries([...timeEntries, newEntry]);
    setCurrentTimer({
      isRunning: false,
      startTime: null,
      taskName: ''
    });
  };
  
  // Manual time entry
  const [manualEntry, setManualEntry] = useState({
    taskName: '',
    hours: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const handleManualSubmit = (e) => {
    e.preventDefault();
    
    if (!manualEntry.taskName || !manualEntry.hours) {
      alert("Please fill in all fields");
      return;
    }
    
    const newEntry = {
      id: Date.now(),
      date: manualEntry.date,
      taskName: manualEntry.taskName,
      hours: parseFloat(manualEntry.hours),
      manual: true
    };
    
    setTimeEntries([...timeEntries, newEntry]);
    setManualEntry({
      taskName: '',
      hours: '',
      date: new Date().toISOString().split('T')[0]
    });
  };
  
  // Goal and reward management
  const handleGoalChange = (type, value) => {
    setGoals(prev => ({
      ...prev,
      [type]: parseFloat(value)
    }));
  };
  
  const handleRewardChange = (type, value) => {
    setRewards(prev => ({
      ...prev,
      [type]: value
    }));
  };
  
  const claimReward = (type) => {
    setClaimedRewards(prev => ({
      ...prev,
      [type]: true
    }));
  };
  
  const deleteEntry = (id) => {
    setTimeEntries(timeEntries.filter(entry => entry.id !== id));
  };
  
  // Helper function to calculate progress percentage
  const calculateProgress = (current, goal) => {
    return Math.min(100, (current / goal) * 100);
  };
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Productivity Reward System</h1>
      </header>
      
      <div className="app-content">
        <div className="stats-container">
          <h2>Your Progress</h2>
          
          <div className="progress-section">
            <h3>Daily Progress</h3>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${calculateProgress(stats.today, goals.daily)}%` }}
              ></div>
            </div>
            <p>{stats.today.toFixed(1)} / {goals.daily} hours</p>
            
            {stats.today >= goals.daily && !claimedRewards.daily && (
              <div className="reward-claim">
                <p>Daily goal reached! 🎉</p>
                <p>Reward: {rewards.daily}</p>
                <button onClick={() => claimReward('daily')}>Claim Reward</button>
              </div>
            )}
            
            {claimedRewards.daily && (
              <p className="claimed-message">Daily reward claimed! 🏆</p>
            )}
          </div>
          
          <div className="progress-section">
            <h3>Weekly Progress</h3>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${calculateProgress(stats.thisWeek, goals.weekly)}%` }}
              ></div>
            </div>
            <p>{stats.thisWeek.toFixed(1)} / {goals.weekly} hours</p>
            
            {stats.thisWeek >= goals.weekly && !claimedRewards.weekly && (
              <div className="reward-claim">
                <p>Weekly goal reached! 🎉</p>
                <p>Reward: {rewards.weekly}</p>
                <button onClick={() => claimReward('weekly')}>Claim Reward</button>
              </div>
            )}
            
            {claimedRewards.weekly && (
              <p className="claimed-message">Weekly reward claimed! 🏆</p>
            )}
          </div>
          
          <div className="progress-section">
            <h3>Monthly Progress</h3>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${calculateProgress(stats.thisMonth, goals.monthly)}%` }}
              ></div>
            </div>
            <p>{stats.thisMonth.toFixed(1)} / {goals.monthly} hours</p>
            
            {stats.thisMonth >= goals.monthly && !claimedRewards.monthly && (
              <div className="reward-claim">
                <p>Monthly goal reached! 🎉</p>
                <p>Reward: {rewards.monthly}</p>
                <button onClick={() => claimReward('monthly')}>Claim Reward</button>
              </div>
            )}
            
            {claimedRewards.monthly && (
              <p className="claimed-message">Monthly reward claimed! 🏆</p>
            )}
          </div>
        </div>
        
        <div className="time-tracking-container">
          <div className="timer-section">
            <h2>Time Tracker</h2>
            
            <div className="timer-controls">
              <input 
                type="text" 
                placeholder="What are you working on?" 
                value={currentTimer.taskName} 
                onChange={(e) => setCurrentTimer({...currentTimer, taskName: e.target.value})}
                disabled={currentTimer.isRunning}
              />
              
              {!currentTimer.isRunning ? (
                <button onClick={startTimer}>Start Timer</button>
              ) : (
                <button onClick={stopTimer} className="stop-button">Stop Timer</button>
              )}
              
              {currentTimer.isRunning && (
                <div className="timer-running">
                  <p>Timer running for: {currentTimer.taskName}</p>
                  <p>Started at: {new Date(currentTimer.startTime).toLocaleTimeString()}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="manual-entry-section">
            <h3>Manual Time Entry</h3>
            <form onSubmit={handleManualSubmit}>
              <input 
                type="text" 
                placeholder="Task Name" 
                value={manualEntry.taskName} 
                onChange={(e) => setManualEntry({...manualEntry, taskName: e.target.value})}
              />
              <input 
                type="number" 
                step="0.1" 
                min="0" 
                placeholder="Hours" 
                value={manualEntry.hours} 
                onChange={(e) => setManualEntry({...manualEntry, hours: e.target.value})}
              />
              <input 
                type="date" 
                value={manualEntry.date} 
                onChange={(e) => setManualEntry({...manualEntry, date: e.target.value})}
              />
              <button type="submit">Add Entry</button>
            </form>
          </div>
          
          <div className="settings-section">
            <h2>Settings</h2>
            
            <div className="goals-settings">
              <h3>Your Goals</h3>
              <div className="settings-group">
                <label>Daily Goal (hours):</label>
                <input 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  value={goals.daily} 
                  onChange={(e) => handleGoalChange('daily', e.target.value)}
                />
              </div>
              
              <div className="settings-group">
                <label>Weekly Goal (hours):</label>
                <input 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  value={goals.weekly} 
                  onChange={(e) => handleGoalChange('weekly', e.target.value)}
                />
              </div>
              
              <div className="settings-group">
                <label>Monthly Goal (hours):</label>
                <input 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  value={goals.monthly} 
                  onChange={(e) => handleGoalChange('monthly', e.target.value)}
                />
              </div>
            </div>
            
            <div className="rewards-settings">
              <h3>Your Rewards</h3>
              <div className="settings-group">
                <label>Daily Reward:</label>
                <input 
                  type="text" 
                  value={rewards.daily} 
                  onChange={(e) => handleRewardChange('daily', e.target.value)}
                />
              </div>
              
              <div className="settings-group">
                <label>Weekly Reward:</label>
                <input 
                  type="text" 
                  value={rewards.weekly} 
                  onChange={(e) => handleRewardChange('weekly', e.target.value)}
                />
              </div>
              
              <div className="settings-group">
                <label>Monthly Reward:</label>
                <input 
                  type="text" 
                  value={rewards.monthly} 
                  onChange={(e) => handleRewardChange('monthly', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="entries-container">
          <h2>Recent Time Entries</h2>
          <table className="entries-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Task</th>
                <th>Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10)
                .map(entry => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>
                    <td>{entry.taskName}</td>
                    <td>{entry.hours.toFixed(1)}</td>
                    <td>
                      <button 
                        className="delete-button" 
                        onClick={() => deleteEntry(entry.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;