const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  dailyGoal: { type: Number, default: 2 },
  weeklyGoal: { type: Number, default: 10 },
  monthlyGoal: { type: Number, default: 40 },
  dailyReward: { type: String, default: 'Small Treat' },
  weeklyReward: { type: String, default: 'Movie Night' },
  monthlyReward: { type: String, default: 'Weekend Trip' }
});

module.exports = mongoose.model('Setting', SettingSchema);
