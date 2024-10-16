import { createBPImage } from './create-base-product-request.dto';

export default class Add_BP_Image_Req {
  baseProductId: number;
  images: createBPImage[];
}
