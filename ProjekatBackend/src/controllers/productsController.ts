import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { products } from "../data/products";
import { users } from "../data/users";
import { ErrorCode } from "../types/ErrorCode";
import { NewProductReq, NewProductRes } from "../types/Product";

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// POST /products
export function createProduct(
  req: Request<{}, NewProductRes, NewProductReq>,
  res: Response<NewProductRes>
) {
  // id dobijamo iz requireAuth
  const userId = (req as any).userId as string;
  if (!userId) {
    throw { code: "NOT_AUTHENTICATED" as ErrorCode };
  }

  const { title, description, price, quantity, image_url } = req.body;

  // validacije
  if (typeof title !== "string" || title.length < 1 || title.length > 40) {
    throw { code: "INVALID_DATA" as ErrorCode };
  }

  if (
    description !== undefined &&
    (typeof description !== "string" || description.length > 200)
  ) {
    throw { code: "INVALID_DATA" as ErrorCode };
  }

  if (typeof price !== "number" || price <= 0) {
    throw { code: "INVALID_DATA" as ErrorCode };
  }

  if (typeof quantity !== "number" || quantity <= 0) {
    throw { code: "INVALID_DATA" as ErrorCode };
  }

  if (typeof image_url !== "string" || !isValidUrl(image_url)) {
    throw { code: "BAD_IMAGE_DATA" as ErrorCode };
  }

  // izvlacimo creatora iz baze
  const user = users.find((u) => u.id === userId);
  if (!user) {
    // ako token nosi nepostojeći user_id
    throw { code: "NOT_AUTHENTICATED" as ErrorCode };
  }

  const now = new Date().toISOString();
  const productId = randomUUID();

  products.push({
    product_id: productId,
    title,
    description,
    price,
    quantity,
    image_url,
    creator: {
      user_id: user.id,
      username: user.username,
    },
    created_at: now,
    updated_at: now,
  });

  console.log(products);

  res.json({
    failed: false,
    product_id: productId,
  });
}

// GET /products
export function getProducts(req: Request, res: Response) {
  // query parametri (sve stiže kao string)
  const limitRaw = req.query.limit as string | undefined;
  const pageRaw = req.query.page as string | undefined;
  const creator = req.query.creator as string | undefined;
  const olderFirstRaw = req.query.older_first as string | undefined;

  // normalizacija
  let limit = Number(limitRaw);
  if (!Number.isInteger(limit) || limit < 1) limit = 10;
  if (limit > 25) limit = 25;

  let page = Number(pageRaw);
  if (!Number.isInteger(page) || page < 1) page = 1;

  const olderFirst = olderFirstRaw === "true";

  // filtriranje
  let filteredProducts = products;

  if (creator) {
    filteredProducts = filteredProducts.filter(
      (p) => p.creator.user_id === creator
    );
  }

  // sortiranje
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (olderFirst) {
      return a.created_at.localeCompare(b.created_at);
    } else {
      return b.created_at.localeCompare(a.created_at);
    }
  });

  // paginacija
  const total = filteredProducts.length;

  const start = (page - 1) * limit;
  const end = start + limit;

  const pageProducts = filteredProducts.slice(start, end);

  // odgovor
  res.json({
    failed: false,
    products: pageProducts,
    total,
  });
}

// GET /products/:productId
export function getProductById(req: Request, res: Response) {
  const { productId } = req.params;

  // tražimo proizvod u bazi
  const product = products.find((p) => p.product_id === productId);

  if (!product) {
    throw { code: "NO_SUCH_ENTITY" as ErrorCode };
  }

  res.json({
    failed: false,
    product,
  });
}

// PATCH /products/:productId
export function updateProduct(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  if (!userId) {
    throw { code: "NOT_AUTHENTICATED" as ErrorCode };
  }

  const { productId } = req.params;

  // pronađi proizvod
  const product = products.find((p) => p.product_id === productId);

  if (!product) {
    throw { code: "NO_SUCH_ENTITY" as ErrorCode };
  }

  // ownership
  if (product.creator.user_id !== userId) {
    throw { code: "NOT_YOURS" as ErrorCode };
  }

  const { title, description, price, quantity, image_url } = req.body;

  // validacije (samo ako polje postoji)
  if (title !== undefined) {
    if (typeof title !== "string" || title.length < 1 || title.length > 40) {
      throw { code: "INVALID_DATA" as ErrorCode };
    }
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.length > 200) {
      throw { code: "INVALID_DATA" as ErrorCode };
    }
  }

  if (price !== undefined) {
    if (typeof price !== "number" || price <= 0) {
      throw { code: "INVALID_DATA" as ErrorCode };
    }
  }

  if (quantity !== undefined) {
    if (typeof quantity !== "number" || quantity <= 0) {
      throw { code: "INVALID_DATA" as ErrorCode };
    }
  }

  if (image_url !== undefined) {
    if (typeof image_url !== "string" || !isValidUrl(image_url)) {
      throw { code: "BAD_IMAGE_DATA" as ErrorCode };
    }
  }

  //  update polja
  if (title !== undefined) product.title = title;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (quantity !== undefined) product.quantity = quantity;
  if (image_url !== undefined) product.image_url = image_url;

  product.updated_at = new Date().toISOString();

  res.json({
    failed: false,
  });
}

// DELETE /products/:productId
export function deleteProduct(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  if (!userId) {
    throw { code: "NOT_AUTHENTICATED" as ErrorCode };
  }

  const { productId } = req.params;

  const index = products.findIndex((p) => p.product_id === productId);

  if (index === -1) {
    throw { code: "NO_SUCH_ENTITY" as ErrorCode };
  }

  const product = products[index];

  if (product.creator.user_id !== userId) {
    throw { code: "NOT_YOURS" as ErrorCode };
  }

  // brisanje iz in-memory baze
  products.splice(index, 1);

  res.json({
    failed: false,
  });
}
