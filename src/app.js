import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import transactionDashboardRoutes from "./routes/transaction.dashboard.routes.js";
import filialRoutes from "./routes/filial.routes.js";
import productRoutes from "./routes/product.routes.js"
import marketingMessage from "./routes/marketing.routes.js"

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/filials", filialRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", transactionDashboardRoutes);
app.use("/api/marketing", marketingMessage);

export default app;
