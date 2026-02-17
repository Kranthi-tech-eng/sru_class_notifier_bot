const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

const User = require("./models/User");
const { parseTimetable } = require("./timetable");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

console.log("🤖 Telegram Bot polling started...");

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

    const uploadDir = path.join(__dirname, "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const tempPath = await bot.downloadFile(msg.document.file_id, uploadDir);
    const finalPath = path.join(uploadDir, `${chatId}.xlsx`);

    fs.renameSync(tempPath, finalPath);

    const timetable = parseTimetable(finalPath);

    if (!timetable || timetable.length === 0) {
      return bot.sendMessage(chatId, "❌ Could not read timetable format.");
    }

    await User.findOneAndUpdate(
      { chatId },
      { chatId, timetable },
      { upsert: true }
    );

    bot.sendMessage(
      chatId,
      "✅ Timetable saved!\n⏰ You will receive reminders before each class."
    );

  } catch (err) {
    console.error("FULL ERROR:", err);
    bot.sendMessage(chatId, "❌ Error processing timetable.");
  }
});

module.exports = bot;
