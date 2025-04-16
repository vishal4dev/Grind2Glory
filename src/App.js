import React, { useState, useEffect } from 'react';
import './App.css';

// Import icons used in the navigation
import { 
  Home, 
  Clock, 
  Settings, 
  Calendar, 
  Award, 
  List, 
  Menu, 
  X,
  ChevronRight,
  Plus,
  Check,
  Trash2
} from 'lucide-react';

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

  // Navigation state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Display toast notification
  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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
      displayToast("Please enter a task name before starting the timer");
      return;
    }
    
    setCurrentTimer({
      ...currentTimer,
      isRunning: true,
      startTime: new Date()
    });
    
    displayToast("Timer started!");
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
    
    displayToast(`${roundedHours.toFixed(1)} hours logged for ${newEntry.taskName}`);
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
      displayToast("Please fill in all fields");
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
    
    displayToast(`${parseFloat(manualEntry.hours).toFixed(1)} hours added for ${manualEntry.taskName}`);
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
    
    displayToast(`${type.charAt(0).toUpperCase() + type.slice(1)} reward claimed!`);
  };
  
  const deleteEntry = (id) => {
    const entryToDelete = timeEntries.find(entry => entry.id === id);
    setTimeEntries(timeEntries.filter(entry => entry.id !== id));
    displayToast(`Entry deleted: ${entryToDelete.taskName}`);
  };
  
  // Helper function to calculate progress percentage
  const calculateProgress = (current, goal) => {
    return Math.min(100, (current / goal) * 100);
  };

  // Navigation menu items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'timer', label: 'Timer', icon: <Clock size={20} /> },
    { id: 'entries', label: 'Entries', icon: <List size={20} /> },
    { id: 'goals', label: 'Goals & Rewards', icon: <Award size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];
  
  return (
    <div className="app-wrapper">
      {/* Sidebar Navigation (Desktop) */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Productivity</h2>
          <button 
            className="sidebar-toggle-btn" 
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {activeTab === item.id && <ChevronRight size={16} className="nav-active-indicator" />}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Top App Bar */}
        <header className="app-bar">
          <div className="app-bar-left">
            <button 
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="app-title">Productivity Reward System</h1>
          </div>
          <div className="user-info">
            <span className="greeting">
              {new Date().getHours() < 12 ? 'Good morning' : 
               new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
            </span>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="app-content">
          {activeTab === 'dashboard' && (
            <>
              {/* Progress Overview Card */}
              <div className="card progress-overview-card">
                <h2 className="card-title">Progress Overview</h2>
                <div className="progress-overview-content">
                  <div className="progress-section">
                    <div className="progress-header">
                      <h3>Daily Progress</h3>
                      <span className="progress-percentage">
                        {Math.round(calculateProgress(stats.today, goals.daily))}%
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${calculateProgress(stats.today, goals.daily)}%` }}
                      ></div>
                    </div>
                    <div className="progress-details">
                      <span>{stats.today.toFixed(1)} / {goals.daily} hours</span>
                      {stats.today >= goals.daily && !claimedRewards.daily ? (
                        <button className="claim-button" onClick={() => claimReward('daily')}>
                          <Check size={14} /> Claim Reward
                        </button>
                      ) : claimedRewards.daily && (
                        <span className="claimed-badge">Claimed</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="progress-section">
                    <div className="progress-header">
                      <h3>Weekly Progress</h3>
                      <span className="progress-percentage">
                        {Math.round(calculateProgress(stats.thisWeek, goals.weekly))}%
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${calculateProgress(stats.thisWeek, goals.weekly)}%` }}
                      ></div>
                    </div>
                    <div className="progress-details">
                      <span>{stats.thisWeek.toFixed(1)} / {goals.weekly} hours</span>
                      {stats.thisWeek >= goals.weekly && !claimedRewards.weekly ? (
                        <button className="claim-button" onClick={() => claimReward('weekly')}>
                          <Check size={14} /> Claim Reward
                        </button>
                      ) : claimedRewards.weekly && (
                        <span className="claimed-badge">Claimed</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="progress-section">
                    <div className="progress-header">
                      <h3>Monthly Progress</h3>
                      <span className="progress-percentage">
                        {Math.round(calculateProgress(stats.thisMonth, goals.monthly))}%
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${calculateProgress(stats.thisMonth, goals.monthly)}%` }}
                      ></div>
                    </div>
                    <div className="progress-details">
                      <span>{stats.thisMonth.toFixed(1)} / {goals.monthly} hours</span>
                      {stats.thisMonth >= goals.monthly && !claimedRewards.monthly ? (
                        <button className="claim-button" onClick={() => claimReward('monthly')}>
                          <Check size={14} /> Claim Reward
                        </button>
                      ) : claimedRewards.monthly && (
                        <span className="claimed-badge">Claimed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Timer Card */}
              <div className="card quick-timer-card">
                <h2 className="card-title">Quick Timer</h2>
                <div className="quick-timer-content">
                  <div className="timer-controls">
                    <input 
                      type="text" 
                      placeholder="What are you working on?" 
                      value={currentTimer.taskName} 
                      onChange={(e) => setCurrentTimer({...currentTimer, taskName: e.target.value})}
                      disabled={currentTimer.isRunning}
                      className="task-input"
                    />
                    
                    {!currentTimer.isRunning ? (
                      <button onClick={startTimer} className="start-button">
                        <Clock size={16} /> Start
                      </button>
                    ) : (
                      <button onClick={stopTimer} className="stop-button">
                        <X size={16} /> Stop
                      </button>
                    )}
                  </div>
                  
                  {currentTimer.isRunning && (
                    <div className="timer-status">
                      <div className="timer-pulse"></div>
                      <div className="timer-info">
                        <p>Currently tracking: <strong>{currentTimer.taskName}</strong></p>
                        <p>Started at: {new Date(currentTimer.startTime).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Activity Card */}
              <div className="card recent-activity-card">
                <h2 className="card-title">Recent Activity</h2>
                <div className="recent-activity-content">
                  <div className="activity-feed">
                    {timeEntries
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 5)
                      .map(entry => (
                        <div key={entry.id} className="activity-item">
                          <div className="activity-item-left">
                            <div className="activity-icon">
                              <Calendar size={16} />
                            </div>
                            <div className="activity-details">
                              <p className="activity-task">{entry.taskName}</p>
                              <p className="activity-date">{entry.date}</p>
                            </div>
                          </div>
                          <div className="activity-item-right">
                            <span className="activity-hours">{entry.hours.toFixed(1)}h</span>
                            <button 
                              className="delete-activity-button"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                    ))}
                    
                    {timeEntries.length === 0 && (
                      <div className="empty-activity">
                        <p>No time entries recorded yet.</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="view-all-button"
                    onClick={() => setActiveTab('entries')}
                  >
                    View All Entries
                  </button>
                </div>
              </div>
              
              {/* Rewards Overview Card */}
              <div className="card rewards-card">
                <h2 className="card-title">Rewards Overview</h2>
                <div className="rewards-content">
                  <div className="reward-item">
                    <div className="reward-header">
                      <h3>Daily Reward</h3>
                      {claimedRewards.daily && (
                        <span className="claimed-badge">Claimed</span>
                      )}
                    </div>
                    <p className="reward-description">{rewards.daily}</p>
                  </div>
                  
                  <div className="reward-item">
                    <div className="reward-header">
                      <h3>Weekly Reward</h3>
                      {claimedRewards.weekly && (
                        <span className="claimed-badge">Claimed</span>
                      )}
                    </div>
                    <p className="reward-description">{rewards.weekly}</p>
                  </div>
                  
                  <div className="reward-item">
                    <div className="reward-header">
                      <h3>Monthly Reward</h3>
                      {claimedRewards.monthly && (
                        <span className="claimed-badge">Claimed</span>
                      )}
                    </div>
                    <p className="reward-description">{rewards.monthly}</p>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Timer Page */}
          {activeTab === 'timer' && (
            <div className="card timer-card full-width">
              <h2 className="card-title">Time Tracker</h2>
              <div className="timer-card-content">
                <div className="timer-section">
                  <h3>Active Timer</h3>
                  <div className="timer-controls">
                    <input 
                      type="text" 
                      placeholder="What are you working on?" 
                      value={currentTimer.taskName} 
                      onChange={(e) => setCurrentTimer({...currentTimer, taskName: e.target.value})}
                      disabled={currentTimer.isRunning}
                      className="task-input"
                    />
                    
                    {!currentTimer.isRunning ? (
                      <button onClick={startTimer} className="start-button">
                        <Clock size={16} /> Start Timer
                      </button>
                    ) : (
                      <button onClick={stopTimer} className="stop-button">
                        <X size={16} /> Stop Timer
                      </button>
                    )}
                  </div>
                  
                  {currentTimer.isRunning && (
                    <div className="timer-status">
                      <div className="timer-pulse"></div>
                      <div className="timer-info">
                        <p>Currently tracking: <strong>{currentTimer.taskName}</strong></p>
                        <p>Started at: {new Date(currentTimer.startTime).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="manual-entry-section">
                  <h3>Manual Time Entry</h3>
                  <form onSubmit={handleManualSubmit} className="manual-entry-form">
                    <div className="form-group">
                      <label htmlFor="taskName">Task Name</label>
                      <input 
                        id="taskName"
                        type="text" 
                        placeholder="Task Name" 
                        value={manualEntry.taskName} 
                        onChange={(e) => setManualEntry({...manualEntry, taskName: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="hours">Hours</label>
                        <input 
                          id="hours"
                          type="number" 
                          step="0.1" 
                          min="0" 
                          placeholder="Hours" 
                          value={manualEntry.hours} 
                          onChange={(e) => setManualEntry({...manualEntry, hours: e.target.value})}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input 
                          id="date"
                          type="date" 
                          value={manualEntry.date} 
                          onChange={(e) => setManualEntry({...manualEntry, date: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <button type="submit" className="add-entry-button">
                      <Plus size={16} /> Add Entry
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
          
          {/* Entries Page */}
          {activeTab === 'entries' && (
            <div className="card entries-card full-width">
              <h2 className="card-title">Time Entries</h2>
              <div className="entries-content">
                <div className="entries-header">
                  <h3>All Time Entries</h3>
                  <div className="entries-filters">
                    {/* Filter options could be added here in future */}
                  </div>
                </div>
                
                <div className="entries-table-container">
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
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                      ))}
                      
                      {timeEntries.length === 0 && (
                        <tr>
                          <td colSpan="4" className="empty-table-message">
                            No time entries recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Goals & Rewards Page */}
          {activeTab === 'goals' && (
            <div className="card goals-card full-width">
              <h2 className="card-title">Goals & Rewards</h2>
              <div className="goals-content">
                <div className="goals-section">
                  <h3>Current Progress</h3>
                  
                  <div className="progress-overview">
                    <div className="progress-section">
                      <div className="progress-header">
                        <h4>Daily Progress</h4>
                        <span className="progress-percentage">
                          {Math.round(calculateProgress(stats.today, goals.daily))}%
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${calculateProgress(stats.today, goals.daily)}%` }}
                        ></div>
                      </div>
                      <div className="progress-details">
                        <span>{stats.today.toFixed(1)} / {goals.daily} hours</span>
                      </div>
                    </div>
                    
                    <div className="progress-section">
                      <div className="progress-header">
                        <h4>Weekly Progress</h4>
                        <span className="progress-percentage">
                          {Math.round(calculateProgress(stats.thisWeek, goals.weekly))}%
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${calculateProgress(stats.thisWeek, goals.weekly)}%` }}
                        ></div>
                      </div>
                      <div className="progress-details">
                        <span>{stats.thisWeek.toFixed(1)} / {goals.weekly} hours</span>
                      </div>
                    </div>
                    
                    <div className="progress-section">
                      <div className="progress-header">
                        <h4>Monthly Progress</h4>
                        <span className="progress-percentage">
                          {Math.round(calculateProgress(stats.thisMonth, goals.monthly))}%
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${calculateProgress(stats.thisMonth, goals.monthly)}%` }}
                        ></div>
                      </div>
                      <div className="progress-details">
                        <span>{stats.thisMonth.toFixed(1)} / {goals.monthly} hours</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rewards-section">
                  <h3>Rewards</h3>
                  
                  <div className="reward-list">
                    <div className="reward-item">
                      <div className="reward-header">
                        <h4>Daily Reward</h4>
                        {stats.today >= goals.daily && !claimedRewards.daily ? (
                          <button className="claim-button" onClick={() => claimReward('daily')}>
                            <Check size={14} /> Claim
                          </button>
                        ) : claimedRewards.daily && (
                          <span className="claimed-badge">Claimed</span>
                        )}
                      </div>
                      <div className="reward-edit">
                        <input 
                          type="text" 
                          value={rewards.daily} 
                          onChange={(e) => handleRewardChange('daily', e.target.value)}
                          className="reward-input"
                        />
                      </div>
                    </div>
                    
                    <div className="reward-item">
                      <div className="reward-header">
                        <h4>Weekly Reward</h4>
                        {stats.thisWeek >= goals.weekly && !claimedRewards.weekly ? (
                          <button className="claim-button" onClick={() => claimReward('weekly')}>
                            <Check size={14} /> Claim
                          </button>
                        ) : claimedRewards.weekly && (
                          <span className="claimed-badge">Claimed</span>
                        )}
                      </div>
                      <div className="reward-edit">
                        <input 
                          type="text" 
                          value={rewards.weekly} 
                          onChange={(e) => handleRewardChange('weekly', e.target.value)}
                          className="reward-input"
                        />
                      </div>
                    </div>
                    
                    <div className="reward-item">
                      <div className="reward-header">
                        <h4>Monthly Reward</h4>
                        {stats.thisMonth >= goals.monthly && !claimedRewards.monthly ? (
                          <button className="claim-button" onClick={() => claimReward('monthly')}>
                            <Check size={14} /> Claim
                          </button>
                        ) : claimedRewards.monthly && (
                          <span className="claimed-badge">Claimed</span>
                        )}
                      </div>
                      <div className="reward-edit">
                        <input 
                          type="text" 
                          value={rewards.monthly} 
                          onChange={(e) => handleRewardChange('monthly', e.target.value)}
                          className="reward-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Settings Page */}
          {activeTab === 'settings' && (
            <div className="card settings-card full-width">
              <h2 className="card-title">Settings</h2>
              <div className="settings-content">
                <div className="settings-section">
                <h3>Goals Configuration</h3>
                  <form className="settings-form">
                    <div className="form-group">
                      <label htmlFor="dailyGoal">Daily Goal (hours)</label>
                      <input
                        id="dailyGoal"
                        type="number"
                        step="0.1"
                        min="0"
                        value={goals.daily}
                        onChange={(e) => handleGoalChange('daily', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="weeklyGoal">Weekly Goal (hours)</label>
                      <input
                        id="weeklyGoal"
                        type="number"
                        step="0.1"
                        min="0"
                        value={goals.weekly}
                        onChange={(e) => handleGoalChange('weekly', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="monthlyGoal">Monthly Goal (hours)</label>
                      <input
                        id="monthlyGoal"
                        type="number"
                        step="0.1"
                        min="0"
                        value={goals.monthly}
                        onChange={(e) => handleGoalChange('monthly', e.target.value)}
                      />
                    </div>
                  </form>
                </div>
                
                <div className="settings-section">
                  <h3>Data Management</h3>
                  <div className="data-actions">
                    <button 
                      className="export-button"
                      onClick={() => {
                        const data = {
                          timeEntries,
                          goals,
                          rewards,
                          claimedRewards
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `productivity-data-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        displayToast("Data exported successfully");
                      }}
                    >
                      Export Data
                    </button>
                    
                    <button 
                      className="import-button"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.json';
                        input.onchange = (e) => {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const data = JSON.parse(event.target.result);
                              if (data.timeEntries) setTimeEntries(data.timeEntries);
                              if (data.goals) setGoals(data.goals);
                              if (data.rewards) setRewards(data.rewards);
                              if (data.claimedRewards) setClaimedRewards(data.claimedRewards);
                              displayToast("Data imported successfully");
                            } catch (err) {
                              displayToast("Error importing data");
                            }
                          };
                          reader.readAsText(file);
                        };
                        input.click();
                      }}
                    >
                      Import Data
                    </button>
                    
                    <button 
                      className="reset-button"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to reset all data? This cannot be undone.")) {
                          setTimeEntries([]);
                          setGoals({
                            daily: 6,
                            weekly: 30,
                            monthly: 120
                          });
                          setRewards({
                            daily: 'Watch one episode of a show',
                            weekly: 'Order my favorite takeout',
                            monthly: 'Buy a new book/game'
                          });
                          setClaimedRewards({
                            daily: false,
                            weekly: false,
                            monthly: false
                          });
                          displayToast("All data has been reset");
                        }
                      }}
                    >
                      Reset All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;