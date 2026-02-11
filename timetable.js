const XLSX = require("xlsx");

function convertExcelTime(value) {
  if (typeof value === "number") {
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  return value?.toString().trim();
}

function parseTimetable(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const timetable = [];

    for (let row of data) {
      const batch = row.Batch?.toString().trim();
      const day = row.Day?.toString().trim();
      const time = convertExcelTime(row.Time);
      const subject = row.Subject?.toString().trim() || "No Subject";
      const room = row.Room?.toString().trim() || "Not Assigned";

      if (!batch || !day || !time) continue;

      timetable.push({ batch, day, time, subject, room });
    }

    console.log("Final Timetable:", timetable);
    return timetable;

  } catch (error) {
    console.error("Excel Read Error:", error);
    return [];
  }
}

module.exports = { parseTimetable };
