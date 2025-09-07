// const express = require("express")
// using module with module in case importing local files you must add the extension in the end like : server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoute from "./Routes/auth.route.js";
import productRoutes from "./Routes/product.route.js";
import cartRoutes from "./Routes/cart.route.js";
import couponRoutes from "./Routes/coupon.route.js";
import paymentRoutes from "./Routes/payment.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // allows you to parse the body of the request
app.use(cookieParser()); // allows you to parse the cookies

app.use("/api/auth", authRoute);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(PORT, () => {
  console.log("server is running on http://localhost:" + PORT);
  connectDB();
});
