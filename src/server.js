import dotenv from "dotenv";
dotenv.config(); // ⚠️ ENG BIRINCHI

import app from "./app.js";
import { connectDB } from "./config/db.js";
import "./bot/index.js";

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("JWT_SECRET:", process.env.JWT_SECRET); // tekshiruv
  console.log(`Server running on port ${PORT}`);
});
