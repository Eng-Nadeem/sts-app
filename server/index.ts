import express, { Application } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import meterRoutes from "./routes/meterRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import walletRoutes from "./routes/walletRoutes";
import debtRoutes from "./routes/debtRoutes";
import { errorHandler } from "./middleware/errorHandler";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/meters", meterRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/debts", debtRoutes);

app.use(errorHandler);

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
