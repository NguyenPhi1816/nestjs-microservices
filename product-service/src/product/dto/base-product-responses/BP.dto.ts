import OVs_Res from '../option-value-responses/OVs.dto';
import { PV_Res } from '../product-variant-responses/PV.dto';

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
  optionValues: OVs_Res[];
  relatedProducts: ProductVariantResponseDto[];
  productVariants: PV_Res[];
}
