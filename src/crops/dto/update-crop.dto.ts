import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCropDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  harvest_id?: number;
}
