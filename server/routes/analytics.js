const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Helper function to get date range
function getDateRange(range) {
  const endDate = new Date();
  if (range === 0 || range === '0') {
    // All time - return null to skip date filtering
    return null;
  }
  const days = parseInt(range) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return { startDate, endDate };
}

// GET /api/analytics/productivity - Productivity trend data
router.get('/productivity', async (req, res) => {
  try {
    const { range = 30 } = req.query;
    const dateRange = getDateRange(range);
    
    const days = range === 0 || range === '0' ? 30 : parseInt(range);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of today
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1)); // Include today in the count
    startDate.setHours(0, 0, 0, 0); // Start of day

    // Aggregate tasks by completion date (use createdAt as fallback)
    const pipeline = [
      {
        $match: {
          completed: true
        }
      },
      {
        $addFields: {
          dateToUse: {
            $ifNull: ['$completedAt', '$createdAt']
          }
        }
      },
      {
        $match: {
          dateToUse: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$dateToUse' }
          },
          hours: { $sum: '$durationHours' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const results = await Task.aggregate(pipeline);
    
    // Fill in missing dates with 0 hours
    const dataMap = {};
    results.forEach(item => {
      dataMap[item._id] = item.hours;
    });

    const chartData = [];
    const startTime = startDate.getTime();
    for (let i = 0; i < days; i++) {
      const date = new Date(startTime + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      chartData.push({
        date: dateStr,
        hours: dataMap[dateStr] || 0
      });
    }

    // Calculate stats
    const totalHours = chartData.reduce((sum, day) => sum + day.hours, 0);
    const avgDaily = chartData.length > 0 ? totalHours / chartData.length : 0;
    const highestDay = chartData.reduce((max, day) => 
      day.hours > max.hours ? day : max, 
      { hours: 0, date: 'N/A' }
    );

    res.json({
      chartData,
      stats: {
        total: totalHours,
        average: avgDaily,
        highest: highestDay.hours > 0 ? `${highestDay.date}: ${highestDay.hours.toFixed(1)}h` : 'N/A'
      }
    });
  } catch (err) {
    console.error('Analytics productivity error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/category - Category breakdown
router.get('/category', async (req, res) => {
  try {
    const { range = 30 } = req.query;
    const dateRange = getDateRange(range);
    
    const matchStage = { completed: true };
    if (dateRange) {
      matchStage.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: { $ifNull: ['$category', 'General'] },
          value: { $sum: '$durationHours' }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: { $round: ['$value', 1] }
        }
      },
      { $sort: { value: -1 } }
    ];

    const results = await Task.aggregate(pipeline);
    const totalHours = results.reduce((sum, item) => sum + item.value, 0);

    res.json({
      chartData: results,
      totalHours: totalHours.toFixed(1)
    });
  } catch (err) {
    console.error('Analytics category error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/time-distribution - Time of day distribution
router.get('/time-distribution', async (req, res) => {
  try {
    const { range = 30 } = req.query;
    const dateRange = getDateRange(range);
    
    const matchStage = { completed: true };
    if (dateRange) {
      // Use $or to check both completedAt and createdAt
      matchStage.$or = [
        { completedAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } },
        { completedAt: null, createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } }
      ];
    }

    const tasks = await Task.find(matchStage).select('completedAt createdAt durationHours');
    
    const periodHours = {
      'Morning': 0,
      'Afternoon': 0,
      'Evening': 0,
      'Night': 0
    };

    tasks.forEach(task => {
      const dateToUse = task.completedAt || task.createdAt;
      const hour = new Date(dateToUse).getHours();
      const duration = task.durationHours || 0;

      if (hour >= 6 && hour < 12) {
        periodHours['Morning'] += duration;
      } else if (hour >= 12 && hour < 18) {
        periodHours['Afternoon'] += duration;
      } else if (hour >= 18 && hour < 22) {
        periodHours['Evening'] += duration;
      } else {
        periodHours['Night'] += duration;
      }
    });

    const chartData = Object.entries(periodHours).map(([name, hours]) => ({
      name,
      hours: parseFloat(hours.toFixed(1))
    }));

    const peakTime = chartData.reduce((max, period) => 
      period.hours > max.hours ? period : max,
      { name: 'N/A', hours: 0 }
    );

    res.json({ chartData, peakTime });
  } catch (err) {
    console.error('Analytics time-distribution error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/heatmap - Weekly heatmap data
router.get('/heatmap', async (req, res) => {
  try {
    const { range = 30 } = req.query;
    const days = range === 0 || range === '0' ? 30 : parseInt(range);
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $match: {
          completed: true
        }
      },
      {
        $addFields: {
          dateToUse: {
            $ifNull: ['$completedAt', '$createdAt']
          }
        }
      },
      {
        $match: {
          dateToUse: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$dateToUse' }
          },
          hours: { $sum: '$durationHours' }
        }
      }
    ];

    const results = await Task.aggregate(pipeline);
    
    // Create map of date to hours
    const tasksByDate = {};
    results.forEach(item => {
      tasksByDate[item._id] = item.hours;
    });

    // Generate all dates in range
    const heatmapData = [];
    const startTime = startDate.getTime();
    for (let i = 0; i < days; i++) {
      const date = new Date(startTime + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      heatmapData.push({
        date: dateStr,
        day: date.getDay(),
        hours: tasksByDate[dateStr] || 0
      });
    }

    // Calculate stats
    const maxHours = Math.max(...heatmapData.map(d => d.hours), 0);
    const dayHours = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    heatmapData.forEach(d => {
      const dayName = dayNames[d.day];
      if (!dayHours[dayName]) dayHours[dayName] = 0;
      dayHours[dayName] += d.hours;
    });

    const mostProductiveDay = Object.entries(dayHours)
      .reduce((max, [day, hours]) => 
        hours > max.hours ? { day, hours } : max, 
        { day: 'N/A', hours: 0 }
      );

    res.json({
      heatmapData,
      stats: { maxHours, mostProductiveDay }
    });
  } catch (err) {
    console.error('Analytics heatmap error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/completion - Completion rate stats
router.get('/completion', async (req, res) => {
  try {
    const { range = 30 } = req.query;
    const dateRange = getDateRange(range);
    
    const matchStage = {};
    if (dateRange) {
      matchStage.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }

    const totalTasks = await Task.countDocuments(matchStage);
    const completedTasks = await Task.countDocuments({ ...matchStage, completed: true });
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Weekly stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = await Task.countDocuments({
      completed: true,
      $or: [
        { completedAt: { $gte: oneWeekAgo } },
        { completedAt: null, createdAt: { $gte: oneWeekAgo } }
      ]
    });

    const lastWeek = await Task.countDocuments({
      completed: true,
      $or: [
        { completedAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } },
        { completedAt: null, createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } }
      ]
    });

    const trend = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

    // Sparkline data (last 7 days)
    const sparklineData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayCompleted = await Task.countDocuments({
        completed: true,
        $or: [
          { completedAt: { $gte: dayStart, $lte: dayEnd } },
          { completedAt: null, createdAt: { $gte: dayStart, $lte: dayEnd } }
        ]
      });

      sparklineData.push({ value: dayCompleted });
    }

    res.json({
      percentage,
      completed: completedTasks,
      total: totalTasks,
      thisWeek,
      lastWeek,
      trend,
      sparklineData
    });
  } catch (err) {
    console.error('Analytics completion error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/streak - Streak analysis
router.get('/streak', async (req, res) => {
  try {
    const tasks = await Task.find({ 
      completed: true
    })
    .sort({ completedAt: -1, createdAt: -1 })
    .select('completedAt createdAt');

    if (tasks.length === 0) {
      return res.json({
        currentStreak: 0,
        longestStreak: 0,
        totalDaysActive: 0
      });
    }

    // Get unique dates (use completedAt or fall back to createdAt)
    const uniqueDates = [...new Set(tasks.map(t => {
      const dateToUse = t.completedAt || t.createdAt;
      return new Date(dateToUse).toISOString().split('T')[0];
    }))].sort().reverse();

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
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

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = Math.floor((prevDate - currDate) / 86400000);
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Generate calendar for last 30 days
    const calendar = [];
    const uniqueDatesSet = new Set(uniqueDates);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29); // Last 30 days including today
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      
      calendar.push({
        date: dateStr,
        displayDate: date.getDate(),
        hasTask: uniqueDatesSet.has(dateStr),
        isToday: dateStr === todayStr
      });
    }

    res.json({
      currentStreak,
      longestStreak,
      totalDaysActive: uniqueDates.length,
      calendar
    });
  } catch (err) {
    console.error('Analytics streak error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
