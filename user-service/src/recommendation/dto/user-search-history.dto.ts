import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export default class UserSearchHistoryDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  searchQuery: string;
}
