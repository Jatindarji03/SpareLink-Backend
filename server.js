import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './src/db/connectDB.js';
import { app, server } from "./src/Socket/socket.js";
dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public/uploads"));


const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


const startServer = async () => {
  await connectDB(); 
  server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
};


startServer();

import roleRoutes from "./src/routes/role.routes.js";
app.use("/api/roles", roleRoutes);

import userRoutes from "./src/routes/user.routes.js";
app.use("/api/users", userRoutes);
