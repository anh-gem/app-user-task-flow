import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();
connectDb();
const app = express();

//Middlewares
app.use(express.json());

//Cors
app.use(
  cors({
    origin: "http://localhost:4200",
    // origin: "https://user-task-flow-app.netlify.app",
    credentials: true,
  }),
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

export { app };
