const cron = require("node-cron");
const User = require("./models/User");

// Helper to convert day number to name
function getDayName(dayNumber) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  return days[dayNumber];
}

function startScheduler(bot) {
  // Runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const currentDay = getDayName(now.getDay());
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      console.log(`⏱ Checking reminders at ${currentHour}:${currentMinute}`);

      const users = await User.find();

      for (const user of users) {
        if (!Array.isArray(user.timetable)) continue;

        for (const item of user.timetable) {
          if (!item.time || !item.day) continue;

          const [hour, minute] = item.time.split(":").map(Number);
          if (isNaN(hour) || isNaN(minute)) continue;

          // Calculate reminder time (10 mins before)
          let reminderMinute = minute - 10;
          let reminderHour = hour;

          if (reminderMinute < 0) {
            reminderMinute += 60;
            reminderHour -= 1;
          }

          if (reminderHour < 0) {
            reminderHour = 23;
          }

          // Match current time
          if (
            item.day === currentDay &&
            reminderHour === currentHour &&
            reminderMinute === currentMinute
          ) {
            console.log("🔔 Sending reminder to:", user.chatId);

            await bot.sendMessage(
              user.chatId,
              `🔔 Reminder!\n\n📚 ${item.subject}\n🏫 Room: ${item.room}\n⏰ ${item.time}`
            );
          }
        }
      }

    } catch (err) {
      console.error("Scheduler error:", err);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  console.log("✅ Global scheduler started (Render-safe)");
}

module.exports = { startScheduler };
