import { ProductDto } from "../types/Product";
import { randomUUID } from "crypto";
import { users } from "./users";

const now = new Date().toISOString();

// unosimo rucno 4
// seed products
export const products: ProductDto[] = [
  {
    product_id: randomUUID(),
    title: "Pink Sneakers",
    description: "Comfortable pink sneakers for everyday use",
    price: 120,
    quantity: 5,
    image_url: "https://picsum.photos/id/237/400/400",
    creator: {
      user_id: users[0].id,
      username: users[0].username,
    },
    created_at: now,
    updated_at: now,
  },
  {
    product_id: randomUUID(),
    title: "Minimal Backpack",
    description: "Lightweight backpack with minimalist design",
    price: 80,
    quantity: 10,
    image_url: "https://picsum.photos/id/238/400/400",
    creator: {
      user_id: users[0].id,
      username: users[0].username,
    },
    created_at: now,
    updated_at: now,
  },
  {
    product_id: randomUUID(),
    title: "Wireless Headphones",
    description: "Noise-cancelling wireless headphones",
    price: 200,
    quantity: 3,
    image_url: "https://picsum.photos/id/239/400/400",
    creator: {
      user_id: users[0].id,
      username: users[0].username,
    },
    created_at: now,
    updated_at: now,
  },
  {
    product_id: randomUUID(),
    title: "Ceramic Coffee Mug",
    description: "Handmade ceramic mug for coffee lovers",
    price: 25,
    quantity: 15,
    image_url: "https://picsum.photos/id/240/400/400",
    creator: {
      user_id: users[0].id,
      username: users[0].username,
    },
    created_at: now,
    updated_at: now,
  },
];
