import "dotenv/config"; // 🔥 ENG TO‘G‘RI, ENG BARQAROR

import app from "./app.js";
import { connectDB } from "./config/db.js";
import "./bot/index.js"; // telegram shu yerda chaqiriladi

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  console.log("TELEGRAM:", process.env.TELEGRAM_BOT_TOKEN);
  console.log(`Server running on port ${PORT}`);
});
