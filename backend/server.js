// const express = require("express")
// using module with module in case importing local files you must add the extension in the end like : server.js
import express from "express";
import dotenv from "dotenv";
import authRoute from "./Routes/auth.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoute);

app.listen(PORT, () => {
  console.log("server is running on http://localhost:" + PORT);
  connectDB();
});
