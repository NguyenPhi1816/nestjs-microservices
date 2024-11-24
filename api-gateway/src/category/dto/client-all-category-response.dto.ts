export class ClientCategoryChildrenResponse {
  id: number;
  slug: string;
  name: string;
  image: string;
}

export class ClientCategoryProductResponse {
  id: number;
  slug: string;
  name: string;
  variantId: number;
  productVariantIds: number[];
  image: string;
  price: number;
  numberOfPurchases: number;
  numberOfReviews: number;
  averageRating: number;
  discount: any;
}

export class ClientAllCategoryResponse {
  id: number;
  slug: string;
  name: string;
  image: string;
  children: ClientCategoryChildrenResponse[];
  products: ClientCategoryProductResponse[];
}
