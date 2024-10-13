import OVs_Res from '../option-value-responses/OVs.dto';
import { PV_Res } from '../product-variant-responses/PV.dto';
import { BP_Images_Res } from './BP-images.dto';

export class Detail_BP_Admin_Res {
  id: number;
  slug: string;
  name: string;
  description: string;
  categoryIds: number[];
  brandId: number;
  status: string;
  images: BP_Images_Res[];
  optionValues: OVs_Res[];
  productVariants: PV_Res[];
}
