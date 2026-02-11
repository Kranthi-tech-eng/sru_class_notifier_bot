const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

const User = require("./models/User");
const { parseTimetable } = require("./timetable");
const { scheduleNotifications } = require("./scheduler");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `👋 Welcome!\n\n📄 Upload your timetable (.xlsx)\n⏰ You will receive reminders 10 minutes before class.`
  );
});

bot.on("document", async (msg) => {
  const chatId = msg.chat.id;

  try {
    if (!msg.document.file_name.endsWith(".xlsx")) {
      return bot.sendMessage(chatId, "❌ Please upload an XLSX file only.");
    }

    if (!fs.existsSync("./uploads")) {
      fs.mkdirSync("./uploads");
    }

    const tempPath = await bot.downloadFile(msg.document.file_id, "./uploads");
    const finalPath = path.join(__dirname, "uploads", `${chatId}.xlsx`);
    fs.renameSync(tempPath, finalPath);

    const timetable = parseTimetable(finalPath);

    if (timetable.length === 0) {
      return bot.sendMessage(chatId, "❌ Could not read timetable format.");
    }

    await User.findOneAndUpdate(
      { chatId },
      { chatId, timetable },
      { upsert: true }
    );

    scheduleNotifications(bot, chatId, timetable);

    bot.sendMessage(
      chatId,
      "✅ Timetable saved!\n⏰ You will receive reminders before each class."
    );

  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "❌ Error processing timetable.");
  }
});

module.exports = bot;
