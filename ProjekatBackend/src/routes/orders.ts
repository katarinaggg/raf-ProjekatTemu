import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { createOrder, getOrdersByUser } from "../controllers/ordersController";

const router = Router();

router.post("/", requireAuth, createOrder);
router.get("/:userId", requireAuth, getOrdersByUser);

export default router;
