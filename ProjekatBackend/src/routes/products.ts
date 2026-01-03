import { Router } from "express";
import { createProduct } from "../controllers/productsController";
import { requireAuth } from "../middleware/requireAuth";
import { getProducts } from "../controllers/productsController";
import { getProductById } from "../controllers/productsController";
import { updateProduct } from "../controllers/productsController";
import { deleteProduct } from "../controllers/productsController";

const router = Router();

router.post("/", requireAuth, createProduct);
router.get("/", getProducts);
router.get("/:productId", getProductById);
router.patch("/:productId", requireAuth, updateProduct);
router.delete("/:productId", requireAuth, deleteProduct);

export default router;
