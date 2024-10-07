import { IsInt } from 'class-validator';

export class BaseProductImagesResponseDto {
  id: number;
  path: string;
  isDefault: boolean;
}
