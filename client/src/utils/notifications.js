/**
 * Browser Notification Utility
 * Handles requesting permission and showing notifications
 */

let permissionGranted = false;

/**
 * Request notification permission from the user
 * @returns {Promise<boolean>} True if permission granted
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    permissionGranted = true;
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    permissionGranted = permission === 'granted';
    return permissionGranted;
  }

  return false;
}

/**
 * Show a browser notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
export function showNotification(title, options = {}) {
  if (!permissionGranted || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    icon: '/logo192.png', // You can customize this
    badge: '/logo192.png',
    ...options
  });

  // Auto-close after 5 seconds
  setTimeout(() => notification.close(), 5000);

  return notification;
}

/**
 * Show session complete notification
 */
export function notifySessionComplete() {
  showNotification('Session Complete! 🎉', {
    body: 'Great work! Take a well-deserved break.',
    tag: 'pomodoro-session'
  });
}

/**
 * Show break complete notification
 */
export function notifyBreakComplete() {
  showNotification('Break Over! 💪', {
    body: 'Ready to get back to work? Let\'s crush the next session!',
    tag: 'pomodoro-break'
  });
}

/**
 * Show task complete notification
 */
export function notifyTaskComplete(taskTitle) {
  showNotification('Task Complete! 🌟', {
    body: `You crushed "${taskTitle}"! Amazing work!`,
    tag: 'pomodoro-task'
  });
}

/**
 * Check if notifications are supported and enabled
 */
export function areNotificationsEnabled() {
  return permissionGranted && Notification.permission === 'granted';
}
