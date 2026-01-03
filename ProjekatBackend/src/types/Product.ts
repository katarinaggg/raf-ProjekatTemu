// BaseProductDto – ono što FRONTEND šalje
export type BaseProductDto = {
  title: string;
  description?: string;
  price: number;
  quantity: number;
  image_url: string;
};

// NewProduct request/response
export type NewProductReq = BaseProductDto;

export type NewProductRes = {
  failed: false;
  product_id: string;
};

// ProductDto – ono što SERVER čuva/generiše
export type ProductDto = BaseProductDto & {
  product_id: string;
  creator: {
    user_id: string;
    username: string;
  };
  created_at: string;
  updated_at: string;
};
