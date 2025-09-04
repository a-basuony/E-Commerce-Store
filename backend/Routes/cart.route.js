import express from "express";

import { addToCart, removeAllFromCart } from "../Controller/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, addToCart);
router.post("/", protectRoute, removeAllFromCart);

export default router;
