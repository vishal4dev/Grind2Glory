/**
 * Pomodoro Calculator Utility
 * Converts task duration into structured pomodoro sessions
 */

// Pomodoro configuration constants
const POMODORO_DURATION = 25; // minutes
const SHORT_BREAK = 5; // minutes
const LONG_BREAK = 15; // minutes
const SESSIONS_BEFORE_LONG_BREAK = 4;
const MAX_RECOMMENDED_HOURS = 4; // Warn if task exceeds this

/**
 * Calculate pomodoro sessions for a given task duration
 * @param {number} durationHours - Task duration in hours (e.g., 2.5)
 * @returns {Object} Structured session data
 */
export function calculatePomodoroSessions(durationHours) {
  // Validate input
  if (!durationHours || durationHours <= 0) {
    return {
      sessions: [],
      totalWorkMinutes: 0,
      totalBreakMinutes: 0,
      estimatedCompletionMinutes: 0,
      warning: null
    };
  }

  const totalMinutes = durationHours * 60;
  
  // Calculate number of pomodoro sessions needed
  const numberOfSessions = Math.ceil(totalMinutes / POMODORO_DURATION);
  
  // Warn if task is too long
  const warning = durationHours > MAX_RECOMMENDED_HOURS
    ? `This task is ${durationHours}h long. Consider splitting it into smaller tasks for better focus.`
    : null;

  const sessions = [];
  let totalWorkMinutes = 0;
  let totalBreakMinutes = 0;

  for (let i = 0; i < numberOfSessions; i++) {
    const sessionNumber = i + 1;
    const isLastSession = sessionNumber === numberOfSessions;
    
    // Calculate work duration for this session
    // Last session might be shorter if task doesn't divide evenly
    const remainingMinutes = totalMinutes - (i * POMODORO_DURATION);
    const workDuration = Math.min(POMODORO_DURATION, remainingMinutes);
    
    // Determine break type and duration
    let breakDuration = 0;
    let breakType = null;
    
    if (!isLastSession) {
      // Every 4th session gets a long break, others get short break
      if (sessionNumber % SESSIONS_BEFORE_LONG_BREAK === 0) {
        breakDuration = LONG_BREAK;
        breakType = 'long';
      } else {
        breakDuration = SHORT_BREAK;
        breakType = 'short';
      }
    }

    sessions.push({
      sessionNumber,
      workDuration, // in minutes
      breakDuration, // in minutes
      breakType, // 'short', 'long', or null
      hasBreak: !isLastSession,
      isCompleted: false
    });

    totalWorkMinutes += workDuration;
    totalBreakMinutes += breakDuration;
  }

  const estimatedCompletionMinutes = totalWorkMinutes + totalBreakMinutes;

  return {
    sessions,
    totalWorkMinutes,
    totalBreakMinutes,
    estimatedCompletionMinutes,
    numberOfSessions,
    warning
  };
}

/**
 * Format minutes into human-readable time string
 * @param {number} minutes 
 * @returns {string} Formatted time (e.g., "1h 30m" or "45m")
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

/**
 * Format seconds into MM:SS display format
 * @param {number} seconds 
 * @returns {string} Formatted time (e.g., "25:00")
 */
export function formatTimerDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Get preview text for pomodoro sessions
 * @param {number} durationHours 
 * @returns {string} Preview text (e.g., "2h task = 4 × 25min sessions with breaks")
 */
export function getPomodoroPreview(durationHours) {
  const { numberOfSessions, estimatedCompletionMinutes } = calculatePomodoroSessions(durationHours);
  
  if (numberOfSessions === 0) {
    return '';
  }
  
  if (numberOfSessions === 1) {
    return `${durationHours}h task = 1 session (${formatDuration(estimatedCompletionMinutes)})`;
  }
  
  return `${durationHours}h task = ${numberOfSessions} × 25min sessions (${formatDuration(estimatedCompletionMinutes)} total)`;
}
