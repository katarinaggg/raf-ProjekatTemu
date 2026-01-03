export type BaseOrderDto = {
  value: number;
  quantity: number;
  user_id: string;
  product_id: string;
};

export type OrderDto = BaseOrderDto & {
  order_id: string;
  created_at: string;
  updated_at: string;
};

export type NewOrderReq = BaseOrderDto;

export type NewOrderRes = {
  failed: false;
  order: {
    order_id: string;
    product_title: string;
    product_value: number;
    product_quantity: number;
    created_at: string;
  };
};
