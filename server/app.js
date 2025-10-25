const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const tasksRouter = require('./routes/tasks');
const settingsRouter = require('./routes/settings');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URL = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grind2glory';
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB connection error', err));

app.use('/api/tasks', tasksRouter);
app.use('/api/settings', settingsRouter);

app.get('/', (req, res) => res.json({ ok: true, msg: 'Grind2Glory API' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
