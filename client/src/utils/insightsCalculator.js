import { format, startOfDay, subDays } from 'date-fns';

/**
 * Get the most productive day of the week
 * @param {Array} tasks - Array of task objects
 * @returns {Object|null} Insight object or null
 */
export function getMostProductiveDay(tasks) {
  const completedTasks = tasks.filter(task => task.completed && task.completedAt);
  
  if (completedTasks.length < 7) return null;
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hoursByDay = Array(7).fill(0);
  const countByDay = Array(7).fill(0);
  
  completedTasks.forEach(task => {
    const dayIndex = new Date(task.completedAt).getDay();
    hoursByDay[dayIndex] += task.durationHours || 0;
    countByDay[dayIndex]++;
  });
  
  const maxHours = Math.max(...hoursByDay);
  const avgHours = hoursByDay.reduce((a, b) => a + b, 0) / 7;
  const maxDayIndex = hoursByDay.indexOf(maxHours);
  
  const percentAboveAverage = ((maxHours - avgHours) / avgHours * 100);
  
  if (percentAboveAverage < 20) return null;
  
  return {
    type: 'productive_day',
    title: `${dayNames[maxDayIndex]}s are your power days!`,
    description: `You complete an average of ${maxHours.toFixed(1)} hours on ${dayNames[maxDayIndex]}s—that's ${percentAboveAverage.toFixed(0)}% above your daily average.`,
    metric: maxHours.toFixed(1),
    icon: 'CalendarToday',
    color: '#7c3aed',
    suggestion: `Try replicating your ${dayNames[maxDayIndex]} routine on other days to boost overall productivity.`
  };
}

/**
 * Analyze which time of day is most productive
 * @param {Array} tasks - Array of task objects
 * @returns {Object|null} Insight object or null
 */
export function getProductiveTimeOfDay(tasks) {
  const completedTasks = tasks.filter(task => task.completed && task.completedAt);
  
  if (completedTasks.length < 10) return null;
  
  const timeSlots = {
    morning: { name: 'Morning', hours: 0, start: 6, end: 12, icon: 'WbSunny', emoji: '☀️' },
    afternoon: { name: 'Afternoon', hours: 0, start: 12, end: 18, icon: 'LightMode', emoji: '🌤️' },
    evening: { name: 'Evening', hours: 0, start: 18, end: 22, icon: 'NightsStay', emoji: '🌆' },
    night: { name: 'Night', hours: 0, start: 22, end: 6, icon: 'NightsStay', emoji: '🌙' }
  };
  
  completedTasks.forEach(task => {
    const hour = new Date(task.completedAt).getHours();
    const duration = task.durationHours || 0;
    
    if (hour >= 6 && hour < 12) {
      timeSlots.morning.hours += duration;
    } else if (hour >= 12 && hour < 18) {
      timeSlots.afternoon.hours += duration;
    } else if (hour >= 18 && hour < 22) {
      timeSlots.evening.hours += duration;
    } else {
      timeSlots.night.hours += duration;
    }
  });
  
  const sortedSlots = Object.entries(timeSlots).sort((a, b) => b[1].hours - a[1].hours);
  const topSlot = sortedSlots[0][1];
  const totalHours = Object.values(timeSlots).reduce((sum, slot) => sum + slot.hours, 0);
  const percentage = (topSlot.hours / totalHours * 100);
  
  if (percentage < 35) return null;
  
  const underutilized = sortedSlots.find(([key, slot]) => slot.hours < totalHours * 0.1);
  
  return {
    type: 'time_of_day',
    title: `${topSlot.name} person detected! ${topSlot.emoji}`,
    description: `You're ${percentage.toFixed(0)}% more productive during ${topSlot.name.toLowerCase()} hours (${topSlot.start}:00-${topSlot.end}:00).`,
    metric: `${percentage.toFixed(0)}%`,
    icon: topSlot.icon,
    color: '#3b82f6',
    suggestion: underutilized ? `You have potential in the ${underutilized[1].name.toLowerCase()}—try scheduling lighter tasks then.` : null
  };
}

/**
 * Compare consistency between current and previous period
 * @param {Array} tasks - Array of task objects
 * @returns {Object|null} Insight object or null
 */
export function getStreakTrend(tasks) {
  const completedTasks = tasks.filter(task => task.completed && task.completedAt);
  
  if (completedTasks.length < 20) return null;
  
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);
  
  const recentDays = new Set();
  const previousDays = new Set();
  
  completedTasks.forEach(task => {
    const taskDate = startOfDay(new Date(task.completedAt));
    const dayString = format(taskDate, 'yyyy-MM-dd');
    
    if (taskDate >= thirtyDaysAgo) {
      recentDays.add(dayString);
    } else if (taskDate >= sixtyDaysAgo) {
      previousDays.add(dayString);
    }
  });
  
  const recentCount = recentDays.size;
  const previousCount = previousDays.size;
  
  if (previousCount === 0) return null;
  
  const percentageChange = ((recentCount - previousCount) / previousCount * 100);
  
  if (percentageChange < 20) return null;
  
  return {
    type: 'consistency',
    title: `Your consistency is on fire! 🔥`,
    description: `You completed tasks on ${recentCount} days this month vs ${previousCount} days last month—a ${percentageChange.toFixed(0)}% improvement!`,
    metric: `+${percentageChange.toFixed(0)}%`,
    icon: 'LocalFireDepartment',
    color: '#f97316',
    suggestion: `You're building a solid habit. Keep this momentum going!`
  };
}

/**
 * Track if average session length is improving
 * @param {Array} tasks - Array of task objects
 * @returns {Object|null} Insight object or null
 */
export function getAverageSessionTrend(tasks) {
  const completedTasks = tasks.filter(task => task.completed && task.completedAt);
  
  if (completedTasks.length < 30) return null;
  
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);
  
  const recentTasks = completedTasks.filter(task => new Date(task.completedAt) >= thirtyDaysAgo);
  const previousTasks = completedTasks.filter(task => {
    const date = new Date(task.completedAt);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  });
  
  if (recentTasks.length < 10 || previousTasks.length < 10) return null;
  
  const recentAvg = recentTasks.reduce((sum, task) => sum + (task.durationHours || 0), 0) / recentTasks.length;
  const previousAvg = previousTasks.reduce((sum, task) => sum + (task.durationHours || 0), 0) / previousTasks.length;
  
  const percentImprovement = ((recentAvg - previousAvg) / previousAvg * 100);
  
  if (percentImprovement < 15) return null;
  
  return {
    type: 'session_length',
    title: `Your focus is getting stronger! 💪`,
    description: `Your average task duration increased from ${previousAvg.toFixed(1)} hours to ${recentAvg.toFixed(1)} hours—that's ${percentImprovement.toFixed(0)}% growth in stamina.`,
    metric: `+${percentImprovement.toFixed(0)}%`,
    icon: 'TrendingUp',
    color: '#10b981',
    suggestion: `You're building deep work capacity. Keep challenging yourself with longer focus sessions.`
  };
}

/**
 * Analyze category balance
 * @param {Array} tasks - Array of task objects
 * @returns {Object|null} Insight object or null
 */
export function getCategoryBalance(tasks) {
  const completedTasks = tasks.filter(task => task.completed && task.completedAt);
  
  if (completedTasks.length < 15) return null;
  
  const categoryHours = {};
  let totalHours = 0;
  
  completedTasks.forEach(task => {
    const category = task.category || 'General';
    const hours = task.durationHours || 0;
    categoryHours[category] = (categoryHours[category] || 0) + hours;
    totalHours += hours;
  });
  
  const categories = Object.entries(categoryHours)
    .map(([name, hours]) => ({ name, hours, percentage: (hours / totalHours * 100) }))
    .sort((a, b) => b.hours - a.hours);
  
  const topCategory = categories[0];
  
  if (topCategory.percentage > 60) {
    const otherCategories = categories.slice(1, 3).map(cat => cat.name).join(', ');
    return {
      type: 'category_balance',
      title: `Heavily focused on ${topCategory.name}`,
      description: `${topCategory.percentage.toFixed(0)}% of your time goes to ${topCategory.name}. You're a specialist!`,
      metric: `${topCategory.percentage.toFixed(0)}%`,
      icon: 'PieChart',
      color: '#f59e0b',
      suggestion: otherCategories ? `Consider diversifying into ${otherCategories} for a more balanced approach.` : null
    };
  } else if (topCategory.percentage < 30 && categories.length >= 4) {
    return {
      type: 'category_balance',
      title: `Jack of all trades! 🎯`,
      description: `You're maintaining great balance across ${categories.length} categories with no single focus dominating.`,
      metric: `${categories.length} cats`,
      icon: 'Balance',
      color: '#10b981',
      suggestion: null
    };
  }
  
  return null;
}

/**
 * Find unused potential time slots
 * @param {Array} tasks - Array of task objects
 * @returns {Object|null} Insight object or null
 */
export function getUnusedPotential(tasks) {
  const completedTasks = tasks.filter(task => task.completed && task.completedAt);
  
  if (completedTasks.length < 30) return null;
  
  const slotNames = ['Morning', 'Afternoon', 'Evening', 'Night'];
  
  // Create 7x4 grid (7 days × 4 time slots)
  const grid = Array(7).fill(null).map(() => Array(4).fill(0));
  
  completedTasks.forEach(task => {
    const date = new Date(task.completedAt);
    const dayIndex = date.getDay();
    const hour = date.getHours();
    
    let slotIndex;
    if (hour >= 6 && hour < 12) slotIndex = 0; // Morning
    else if (hour >= 12 && hour < 18) slotIndex = 1; // Afternoon
    else if (hour >= 18 && hour < 22) slotIndex = 2; // Evening
    else slotIndex = 3; // Night
    
    grid[dayIndex][slotIndex]++;
  });
  
  // Find productive patterns and unused slots
  const productiveSlots = [];
  const emptySlots = [];
  
  for (let day = 0; day < 7; day++) {
    for (let slot = 0; slot < 4; slot++) {
      if (grid[day][slot] > 3) {
        productiveSlots.push({ day, slot, count: grid[day][slot] });
      } else if (grid[day][slot] === 0) {
        emptySlots.push({ day, slot });
      }
    }
  }
  
  // Find if there's a pattern in productive slots that could apply to empty slots
  if (productiveSlots.length > 5 && emptySlots.length > 0) {
    // Check if user is productive in a specific time slot across weekdays but not weekends
    const slotCounts = Array(4).fill(0);
    productiveSlots.forEach(ps => {
      if (ps.day >= 1 && ps.day <= 5) { // Weekdays
        slotCounts[ps.slot]++;
      }
    });
    
    const bestSlotIndex = slotCounts.indexOf(Math.max(...slotCounts));
    const bestSlot = slotNames[bestSlotIndex];
    
    // Check if weekends have empty slots in that time
    const weekendEmptyInBestSlot = emptySlots.some(es => 
      (es.day === 0 || es.day === 6) && es.slot === bestSlotIndex
    );
    
    if (weekendEmptyInBestSlot && slotCounts[bestSlotIndex] >= 3) {
      return {
        type: 'unused_potential',
        title: `Untapped weekend potential! 💡`,
        description: `You're productive during ${bestSlot.toLowerCase()} on weekdays, but your weekends are wide open during that time.`,
        metric: bestSlot,
        icon: 'Lightbulb',
        color: '#8b5cf6',
        suggestion: `Try scheduling tasks on weekend ${bestSlot.toLowerCase()}s—you already know you work well during that time!`
      };
    }
  }
  
  return null;
}

/**
 * Calculate week-over-week productivity trend
 * @param {Array} tasks - Array of task objects
 * @returns {Object|null} Insight object or null
 */
export function getProductivityTrend(tasks) {
  const completedTasks = tasks.filter(task => task.completed && task.completedAt);
  
  if (completedTasks.length < 20) return null;
  
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);
  
  const thisWeek = completedTasks.filter(task => new Date(task.completedAt) >= sevenDaysAgo);
  const lastWeek = completedTasks.filter(task => {
    const date = new Date(task.completedAt);
    return date >= fourteenDaysAgo && date < sevenDaysAgo;
  });
  
  if (thisWeek.length < 3 || lastWeek.length < 3) return null;
  
  const thisWeekHours = thisWeek.reduce((sum, task) => sum + (task.durationHours || 0), 0);
  const lastWeekHours = lastWeek.reduce((sum, task) => sum + (task.durationHours || 0), 0);
  
  const percentChange = ((thisWeekHours - lastWeekHours) / lastWeekHours * 100);
  
  if (Math.abs(percentChange) < 15) return null;
  
  if (percentChange > 0) {
    return {
      type: 'productivity_trend',
      title: `You're on an upward trajectory! 📈`,
      description: `This week you completed ${thisWeekHours.toFixed(1)} hours vs ${lastWeekHours.toFixed(1)} hours last week—a ${percentChange.toFixed(0)}% increase!`,
      metric: `+${percentChange.toFixed(0)}%`,
      icon: 'TrendingUp',
      color: '#10b981',
      suggestion: `Momentum is building. Keep pushing forward!`
    };
  } else {
    return {
      type: 'productivity_trend',
      title: `Slight dip this week`,
      description: `This week: ${thisWeekHours.toFixed(1)} hours vs last week: ${lastWeekHours.toFixed(1)} hours. That's okay—consistency matters more than perfection.`,
      metric: `${percentChange.toFixed(0)}%`,
      icon: 'Timeline',
      color: '#6b7280',
      suggestion: `Every day is a fresh start. Focus on small wins to rebuild momentum.`
    };
  }
}

/**
 * Main function to generate all insights
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Array of insight objects
 */
export function generateInsights(tasks) {
  if (!tasks || tasks.length < 7) {
    return [];
  }
  
  const insights = [
    getMostProductiveDay(tasks),
    getProductiveTimeOfDay(tasks),
    getStreakTrend(tasks),
    getAverageSessionTrend(tasks),
    getCategoryBalance(tasks),
    getUnusedPotential(tasks),
    getProductivityTrend(tasks)
  ].filter(insight => insight !== null);
  
  // Sort by priority (dramatic findings first)
  insights.sort((a, b) => {
    const priorityOrder = {
      'consistency': 1,
      'productivity_trend': 2,
      'session_length': 3,
      'productive_day': 4,
      'time_of_day': 5,
      'unused_potential': 6,
      'category_balance': 7
    };
    
    return (priorityOrder[a.type] || 99) - (priorityOrder[b.type] || 99);
  });
  
  // Return maximum 6 insights
  return insights.slice(0, 6);
}

/**
 * Generate instant insight based on current moment
 * @param {Array} tasks - Array of task objects
 * @returns {Object|null} Instant insight object or null
 */
export function getInstantInsight(tasks) {
  const now = new Date();
  const currentHour = now.getHours();
  const today = format(startOfDay(now), 'yyyy-MM-dd');
  const completedTasks = tasks.filter(task => task.completed && task.completedAt);
  
  // Check if user has worked today
  const workedToday = completedTasks.some(task => {
    const taskDate = format(startOfDay(new Date(task.completedAt)), 'yyyy-MM-dd');
    return taskDate === today;
  });
  
  // Calculate current streak
  const uniqueDates = [...new Set(completedTasks.map(t => {
    return format(startOfDay(new Date(t.completedAt)), 'yyyy-MM-dd');
  }))].sort().reverse();
  
  const yesterday = format(subDays(now, 1), 'yyyy-MM-dd');
  let currentStreak = 0;
  
  if (uniqueDates.length > 0 && (uniqueDates[0] === today || uniqueDates[0] === yesterday)) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = Math.floor((prevDate - currDate) / 86400000);
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  // Determine time slot
  let timeSlot = '';
  let timeEmoji = '';
  if (currentHour >= 6 && currentHour < 12) {
    timeSlot = 'morning';
    timeEmoji = '☀️';
  } else if (currentHour >= 12 && currentHour < 18) {
    timeSlot = 'afternoon';
    timeEmoji = '🌤️';
  } else if (currentHour >= 18 && currentHour < 22) {
    timeSlot = 'evening';
    timeEmoji = '🌆';
  } else {
    timeSlot = 'night';
    timeEmoji = '🌙';
  }
  
  // Analyze user's typical productive time for this slot
  let productiveInThisSlot = false;
  if (completedTasks.length >= 10) {
    const slotTasks = completedTasks.filter(task => {
      const hour = new Date(task.completedAt).getHours();
      if (timeSlot === 'morning') return hour >= 6 && hour < 12;
      if (timeSlot === 'afternoon') return hour >= 12 && hour < 18;
      if (timeSlot === 'evening') return hour >= 18 && hour < 22;
      return hour >= 22 || hour < 6;
    });
    productiveInThisSlot = slotTasks.length > completedTasks.length * 0.2;
  }
  
  // Calculate today's hours and task count for better context
  const todayTasks = completedTasks.filter(task => 
    format(startOfDay(new Date(task.completedAt)), 'yyyy-MM-dd') === today
  );
  const todayHours = todayTasks.reduce((sum, task) => sum + (task.durationHours || 0), 0);
  const todayTaskCount = todayTasks.length;
  
  // Calculate user's average daily hours (last 30 days)
  const thirtyDaysAgo = subDays(now, 30);
  const recentTasks = completedTasks.filter(task => 
    new Date(task.completedAt) >= thirtyDaysAgo
  );
  const recentDays = [...new Set(recentTasks.map(t => 
    format(startOfDay(new Date(t.completedAt)), 'yyyy-MM-dd')
  ))].length;
  const avgDailyHours = recentDays > 0 
    ? recentTasks.reduce((sum, t) => sum + (t.durationHours || 0), 0) / recentDays 
    : 0;
  
  // Generate instant insight based on context
  
  // Priority 1: Beyond exceptional (worked 2x+ average or 6+ hours)
  if (workedToday && (todayHours >= avgDailyHours * 2 || todayHours >= 6)) {
    const exceedsBy = avgDailyHours > 0 
      ? Math.round((todayHours / avgDailyHours - 1) * 100)
      : 200;
    
    if (currentHour < 22) {
      return {
        type: 'instant_beast_mode',
        title: `Beast mode activated! 🔥💪`,
        description: `${todayHours.toFixed(1)} hours today—that's ${exceedsBy > 0 ? exceedsBy + '% above' : 'way beyond'} your average! You're absolutely crushing it.`,
        metric: `${todayHours.toFixed(1)}h`,
        icon: 'EmojiEvents',
        color: '#dc2626',
        actionable: true,
        suggestion: `You're in the zone! If you have energy, ride this wave. Otherwise, bank this win and rest—you've earned it.`
      };
    } else {
      return {
        type: 'instant_legendary',
        title: `Legendary performance today! 🏆`,
        description: `${todayHours.toFixed(1)} hours completed. You went beyond limits today. This is what greatness looks like.`,
        metric: `${todayHours.toFixed(1)}h`,
        icon: 'EmojiEvents',
        color: '#f59e0b',
        actionable: false,
        suggestion: `Rest well. You're building something special.`
      };
    }
  }
  
  // Priority 2: Exceeded goal (3-5.9 hours or above average)
  if (workedToday && todayHours >= 3 && todayHours < 6) {
    if (currentHour < 20) {
      return {
        type: 'instant_exceeding',
        title: `Crushing your goals! 🎯`,
        description: `${todayHours.toFixed(1)} hours today across ${todayTaskCount} task${todayTaskCount > 1 ? 's' : ''}. You're ahead of the game!`,
        metric: `${todayHours.toFixed(1)}h`,
        icon: 'TrendingUp',
        color: '#10b981',
        actionable: true,
        suggestion: avgDailyHours > 0 && todayHours < avgDailyHours * 1.5
          ? `You're on track to beat your average (${avgDailyHours.toFixed(1)}h). Keep pushing if you're feeling it!`
          : `You've exceeded expectations. Want to make today legendary? Go for one more task!`
      };
    } else {
      return {
        type: 'instant_strong_finish',
        title: `Strong finish today! 💯`,
        description: `${todayHours.toFixed(1)} hours completed. You showed up and delivered. That's consistency!`,
        metric: `${todayHours.toFixed(1)}h`,
        icon: 'EmojiEvents',
        color: '#10b981',
        actionable: false,
        suggestion: `Tomorrow, aim to match or beat today. You're building momentum!`
      };
    }
  }
  
  // Priority 3: Good progress (1-2.9 hours)
  if (workedToday && todayHours >= 1 && todayHours < 3) {
    if (currentHour < 20) {
      return {
        type: 'instant_momentum',
        title: `Building momentum! 🚀`,
        description: `${todayHours.toFixed(1)} hours so far today. You're on the right track!`,
        metric: `${todayHours.toFixed(1)}h`,
        icon: 'TrendingUp',
        color: '#7c3aed',
        actionable: true,
        suggestion: `Push to 3 hours today for a solid win. You're ${(3 - todayHours).toFixed(1)}h away!`
      };
    } else {
      return {
        type: 'instant_good_effort',
        title: `Good effort today! 👍`,
        description: `${todayHours.toFixed(1)} hours completed. Progress is progress!`,
        metric: `${todayHours.toFixed(1)}h`,
        icon: 'EmojiEvents',
        color: '#7c3aed',
        actionable: true,
        suggestion: `Still got energy? One more hour would make this a great day!`
      };
    }
  }
  
  // Priority 4: Just started (< 1 hour)
  if (workedToday && todayHours < 1 && currentHour < 20) {
    return {
      type: 'instant_just_started',
      title: `Great start! Keep going 🌟`,
      description: `You've started your day with ${todayTaskCount} task${todayTaskCount > 1 ? 's' : ''}. First step is always the hardest!`,
      metric: `${todayTaskCount} task${todayTaskCount > 1 ? 's' : ''}`,
      icon: 'WbSunny',
      color: '#3b82f6',
      actionable: true,
      suggestion: productiveInThisSlot 
        ? `You're in your productive ${timeSlot} slot. Perfect time to stack wins!`
        : `Build momentum now—aim for 2-3 hours today!`
    };
  }
  
  // Priority 5: Streak at risk (haven't worked today and it's late)
  if (!workedToday && currentStreak > 3 && currentHour >= 20) {
    return {
      type: 'instant_streak_risk',
      title: `⚠️ Your ${currentStreak}-day streak is at risk!`,
      description: `You haven't completed any tasks today. Just one task before midnight will keep your streak alive!`,
      metric: `${currentStreak} days`,
      icon: 'LocalFireDepartment',
      color: '#ef4444',
      actionable: true,
      suggestion: `Quick win: Complete a short task in the next hour to maintain your momentum.`
    };
  }
  
  // Priority 6: Perfect time to work (in their productive slot, haven't worked today)
  if (!workedToday && productiveInThisSlot && currentHour < 22) {
    return {
      type: 'instant_opportunity',
      title: `${timeEmoji} Perfect timing!`,
      description: `You're typically very productive during ${timeSlot} hours, and you haven't started today yet.`,
      metric: timeSlot,
      icon: 'TrendingUp',
      color: '#10b981',
      actionable: true,
      suggestion: `This is your power hour! Start with your most important task now.`
    };
  }
  
  // Priority 7: Fresh start (morning, new day)
  if (!workedToday && currentHour >= 6 && currentHour < 12) {
    return {
      type: 'instant_fresh_start',
      title: `Good ${timeSlot}! Ready to grind? ${timeEmoji}`,
      description: `It's a fresh start. Set your intention for the day and tackle your first task.`,
      metric: 'New day',
      icon: 'WbSunny',
      color: '#3b82f6',
      actionable: true,
      suggestion: currentStreak > 0 
        ? `Continue your ${currentStreak}-day streak with a quick win! Your avg is ${avgDailyHours.toFixed(1)}h—beat it today!`
        : `Start building a streak today!`
    };
  }
  
  // Priority 8: Afternoon opportunity (haven't started)
  if (!workedToday && currentHour >= 12 && currentHour < 18) {
    return {
      type: 'instant_afternoon_push',
      title: `Afternoon grind time ${timeEmoji}`,
      description: `The day isn't over yet. Even a small win now counts!`,
      metric: 'Afternoon',
      icon: 'LightMode',
      color: '#f59e0b',
      actionable: true,
      suggestion: avgDailyHours > 0
        ? `Aim for ${Math.ceil(avgDailyHours)} hours to stay on track with your average!`
        : `Start with just 1 hour—every journey begins with a single step!`
    };
  }
  
  // Priority 9: Evening wind-down (but could still work)
  if (!workedToday && currentHour >= 18 && currentHour < 22) {
    return {
      type: 'instant_evening_push',
      title: `Evening opportunity ${timeEmoji}`,
      description: `There's still time to make today count. Even 30 minutes of focused work matters.`,
      metric: 'Evening',
      icon: 'NightsStay',
      color: '#8b5cf6',
      actionable: true,
      suggestion: currentStreak > 0
        ? `Protect your ${currentStreak}-day streak before bed!`
        : `End the day with a win—you'll thank yourself tomorrow!`
    };
  }
  
  // Priority 10: Late night (already worked - encourage rest)
  if (workedToday && currentHour >= 22) {
    return {
      type: 'instant_rest',
      title: `Mission accomplished! 😴`,
      description: `${todayHours.toFixed(1)} hours today. You showed up. Now rest and recharge for tomorrow's battle.`,
      metric: `${todayHours.toFixed(1)}h`,
      icon: 'NightsStay',
      color: '#6b7280',
      actionable: false,
      suggestion: `Sleep well, warrior. Tomorrow is another chance to go even harder!`
    };
  }
  
  // Default: General encouragement
  if (completedTasks.length < 5) {
    return {
      type: 'instant_getting_started',
      title: `Let's build your momentum! 💪`,
      description: `Every journey starts with a single task. Complete your first one and watch your streak grow.`,
      metric: 'Start now',
      icon: 'Lightbulb',
      color: '#10b981',
      actionable: true,
      suggestion: `Pick an easy task to build confidence and momentum.`
    };
  }
  
  return null;
}
