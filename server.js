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

import supplierRequestRoutes from "./src/routes/supplierRequest.routes.js";
app.use('/api/supplier-requests', supplierRequestRoutes);

import categoryRoutes from './src/routes/category.routes.js'
app.use('/api/category',categoryRoutes);

import carBrandRoutes from './src/routes/carBrand.routes.js'
app.use('/api/car-brand',carBrandRoutes);

import carModelRoutes from './src/routes/carModel.routes.js'
app.use('/api/car-model',carModelRoutes);

import sparepartRoutes from './src/routes/sparepart.routes.js';
app.use('/api/spare-part',sparepartRoutes);

import quotationRoutes from './src/routes/quotation.routes.js';
app.use('/api/quotation',quotationRoutes);
