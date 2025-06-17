import express from "express";

import ServerConfig from "./config/ServerConfig.js";
import cors from "cors";
import resumeRoutes from "./routes/resume.route.js";
import connectDB from "./config/dbConfig.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://resume-radar-five.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

console.log(ServerConfig)

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/api/resumes", resumeRoutes);

app.listen(ServerConfig.PORT, async () => {
  console.log(`Server started on port ${ServerConfig.PORT}...`);
});

connectDB();
