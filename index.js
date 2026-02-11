require("dotenv").config();
const connectDB = require("./db");
const bot = require("./bot");
const { startScheduler } = require("./scheduler");

async function startApp() {
  await connectDB();
  startScheduler(bot);
}

startApp();
