import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { BaseProductStatus } from 'src/constants/base-product-status.enum';

export class Update_BP_Status_Req {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsEnum(BaseProductStatus)
  status: BaseProductStatus;
}
