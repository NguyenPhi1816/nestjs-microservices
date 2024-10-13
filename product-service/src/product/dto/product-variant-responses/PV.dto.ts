import { OV_Res } from '../option-value-responses/OV.dto';

export class PV_Res {
  id: number;
  image: string;
  quantity: number;
  optionValue: OV_Res[];
  price: number;
}
