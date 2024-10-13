import { OV_Res } from './OV.dto';
import { Value_Res } from './value.dto';

export class Create_OVs_Res {
  optionId: number;
  optionName: string;
  values: Value_Res[];
}
