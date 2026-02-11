require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const bot = require("./bot");
const { startScheduler } = require("./scheduler");

const app = express();

// REQUIRED FOR RENDER
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("College Timetable Bot is Running 🚀");
});

async function startApp() {
  await connectDB();
  startScheduler(bot);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startApp();
