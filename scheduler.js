const cron = require("node-cron");
const User = require("./models/User");

const jobs = {}; // Store jobs per user

function getDayNumber(day) {
  const days = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  };
  return days[day];
}

function clearUserJobs(chatId) {
  if (jobs[chatId]) {
    jobs[chatId].forEach((job) => job.stop());
    delete jobs[chatId];
  }
}

function scheduleNotifications(bot, chatId, timetable) {
  if (!Array.isArray(timetable)) return;

  // 🛑 Remove old jobs for this user before adding new ones
  clearUserJobs(chatId);

  jobs[chatId] = [];

  timetable.forEach((item) => {
    if (!item.time || !item.day) return;

    const timeParts = item.time.split(":");
    if (timeParts.length !== 2) return;

    let hour = parseInt(timeParts[0]);
    let minute = parseInt(timeParts[1]);

    if (isNaN(hour) || isNaN(minute)) return;

    let reminderMinute = minute - 10;
    let reminderHour = hour;

    if (reminderMinute < 0) {
      reminderMinute += 60;
      reminderHour -= 1;
    }

    if (reminderHour < 0) reminderHour = 23;

    const dayNumber = getDayNumber(item.day);
    if (dayNumber === undefined) return;

    const cronExpression = `${reminderMinute} ${reminderHour} * * ${dayNumber}`;

    console.log(`📅 Scheduling: ${cronExpression} for ${chatId}`);

    const job = cron.schedule(
      cronExpression,
      () => {
        console.log("🔔 Sending reminder to:", chatId);
        bot.sendMessage(
          chatId,
          `🔔 Reminder!\n\n📚 ${item.subject}\n🏫 Room: ${item.room}\n⏰ ${item.time}`
        );
      },
      {
        timezone: "Asia/Kolkata"
      }
    );

    jobs[chatId].push(job);
  });
}

async function startScheduler(bot) {
  try {
    const users = await User.find();

    users.forEach((user) => {
      scheduleNotifications(bot, user.chatId, user.timetable);
    });

    console.log("✅ Scheduler started for all users");
  } catch (err) {
    console.error("Scheduler startup error:", err);
  }
}

module.exports = { scheduleNotifications, startScheduler };
