export class OptionValueResponseDto {
  option: String;
  value: String;
}

export class OptionValuesResponseDto {
  option: String;
  values: String[];
}

export class BaseProductCategoryResponseDto {
  id: number;
  slug: string;
  name: string;
}

export class BaseProductBrandResponseDto {
  slug: string;
  name: string;
  image: string;
}

export class BaseProductImagesResponseDto {
  id: number;
  path: string;
  isDefault: boolean;
}

export class ProductVariantResponseDto {
  id: number;
  slug: string;
  name: string;
  variantId: number;
  image: string;
  price: number;
  averageRating: number;
  numberOfReviews: number;
  numberOfPurchases: number;
}

export class BaseProductVariantDto {
  id: number;
  image: string;
  quantity: number;
  optionValue: OptionValueResponseDto[];
  price: number;
}

export class BaseProductResponseDto {
  id: number;
  slug: string;
  name: string;
  description: string;
  categories: BaseProductCategoryResponseDto[];
  brand: BaseProductBrandResponseDto;
  status: String;
  averageRating: number;
  numberOfReviews: number;
  numberOfPurchases: number;
  images: BaseProductImagesResponseDto[];
  optionValues: OptionValuesResponseDto[];
  relatedProducts: ProductVariantResponseDto[];
  productVariants: BaseProductVariantDto[];
}
