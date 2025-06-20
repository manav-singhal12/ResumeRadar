import dotenv from "dotenv";
dotenv.config();

export default {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  Frontend_URL: process.env.Frontend_URL || 'https://resume-radar-five.vercel.app/',
};
