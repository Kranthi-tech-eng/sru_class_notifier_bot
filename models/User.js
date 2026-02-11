const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  chatId: { type: Number, unique: true },
  timetable: { type: Array }
});

module.exports = mongoose.model('User', userSchema);
