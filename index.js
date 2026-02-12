require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const bot = require("./bot");
const { startScheduler } = require("./scheduler");

const app = express();

// 🔥 This route is required for UptimeRobot ping
app.get("/", (req, res) => {
  res.send("🤖 College Timetable Bot is Running!");
});

const PORT = process.env.PORT || 3000;

async function startApp() {
  try {
    await connectDB();
    console.log("✅ Database Connected");

    startScheduler(bot);
    console.log("✅ Scheduler Started");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Error starting app:", err);
  }
}

startApp();

// Graceful shutdown
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());
