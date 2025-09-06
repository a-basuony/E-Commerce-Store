import express from "express";
import { getCoupon, validateCoupon } from "../Controller/coupon.controller.js";

const router = express.Router();

router.get("/", getCoupon);
router.post("/validate", validateCoupon);

export default router;
