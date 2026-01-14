import app from "./app.js";
import { connectDB } from "./config/db.js";
import "./bot/index.js";

connectDB();

const PORT = process.env.PORT || 3000;

// Health check
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// =============== AUTO PING (Node 18+) ===============
// const SELF_URL = process.env.RENDER_EXTERNAL_URL;

// if (SELF_URL) {
//   setInterval(async () => {
//     try {
//       const res = await fetch(SELF_URL);
//       console.log(`[AUTO-PING] ${res.status} - ${new Date().toISOString()}`);
//     } catch (err) {
//       console.error("[AUTO-PING ERROR]", err.message);
//     }
//   }, 10 * 60 * 1000); // 10 daqiqa
// }
