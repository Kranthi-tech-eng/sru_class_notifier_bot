require("dotenv").config();
const connectDB = require("./db");
const bot = require("./bot");
const { startScheduler } = require("./scheduler");

async function startApp() {
  try {
    await connectDB();
    console.log("✅ Database Connected");

    startScheduler(bot);
    console.log("✅ Scheduler Started");

    console.log("🚀 Bot is running as Background Worker...");
  } catch (err) {
    console.error("❌ Error starting app:", err);
  }
}

startApp();

// Graceful stop (important for Render)
process.on("SIGINT", () => {
  console.log("Bot stopped (SIGINT)");
  process.exit();
});

process.on("SIGTERM", () => {
  console.log("Bot stopped (SIGTERM)");
  process.exit();
});
