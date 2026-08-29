import "dotenv/config";

import cors from "cors";
import express from "express";

import authRoutes from "./routes/authRoutes";
import roomRoutes from "./routes/roomRoutes";
import roomMemberRoutes from "./routes/roomMemberRoutes";
import bookingRoutes from "./routes/bookingRoutes";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/rooms", roomMemberRoutes);
app.use("/api", bookingRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
