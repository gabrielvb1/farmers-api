import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { IsNumber, IsString, Min } from 'class-validator';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @IsString()
  property_name?: string;

  @IsString()
  city?: string;

  @IsString()
  uf?: string;

  @IsNumber()
  @Min(0)
  total_area?: number;

  @IsNumber()
  @Min(0)
  agricultural_area?: number;

  @IsNumber()
  @Min(0)
  vegetation_area?: number;

  @IsNumber()
  farmer_id?: number;
}
