import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export default class UpdateBlogStatus {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  status: 'ACTIVE' | 'INACTIVE';
}
