import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { orders } from "../data/orders";
import { products } from "../data/products";
import { ErrorCode } from "../types/ErrorCode";
import { io } from "../server";

// POST /orders/
export function createOrder(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  if (!userId) {
    throw { code: "NOT_AUTHENTICATED" as ErrorCode };
  }

  const { product_id, quantity } = req.body;

  // validacija quantity
  if (typeof quantity !== "number" || quantity <= 0) {
    throw { code: "INVALID_DATA" as ErrorCode };
  }

  // nađi proizvod
  const product = products.find((p) => p.product_id === product_id);
  if (!product) {
    throw { code: "NO_SUCH_ENTITY" as ErrorCode };
  }

  // zabranjena kupovina sopstvenog proizvoda
  if (product.creator.user_id === userId) {
    throw { code: "INVALID_DATA" as ErrorCode };
  }

  // stock
  if (quantity > product.quantity) {
    throw { code: "OUT_OF_STOCK" as ErrorCode };
  }

  // izračunavanje cene
  const value = product.price * quantity;
  if (value <= 0) {
    throw { code: "INVALID_DATA" as ErrorCode };
  }

  // smanjujemo stock
  product.quantity -= quantity;
  product.updated_at = new Date().toISOString();

  const now = new Date().toISOString();
  const orderId = randomUUID();

  const order = {
    order_id: orderId,
    product_id,
    user_id: userId,
    quantity,
    value,
    created_at: now,
    updated_at: now,
  };

  orders.push(order);

  io.emit("product:update", {
    productId: product.product_id,
    quantity: product.quantity,
  });

  res.json({
    failed: false,
    order: {
      order_id: orderId,
      product_title: product.title,
      product_value: product.price,
      product_quantity: quantity,
      created_at: now,
    },
  });
}

// GET /orders/:userId
export function getOrdersByUser(req: Request, res: Response) {
  const authUserId = (req as any).userId as string;
  if (!authUserId) {
    throw { code: "NOT_AUTHENTICATED" as ErrorCode };
  }

  const { userId } = req.params;

  if (userId !== authUserId) {
    throw { code: "NOT_YOURS" as ErrorCode };
  }

  const limitRaw = req.query.limit as string | undefined;
  const pageRaw = req.query.page as string | undefined;

  let limit = Number(limitRaw);
  if (!Number.isInteger(limit) || limit < 1) limit = 10;
  if (limit > 25) limit = 25;

  let page = Number(pageRaw);
  if (!Number.isInteger(page) || page < 1) page = 1;

  const userOrders = orders.filter((o) => o.user_id === userId);

  const total = userOrders.length;
  const start = (page - 1) * limit;
  const end = start + limit;

  res.json({
    orders: userOrders.slice(start, end),
    total,
  });
}
