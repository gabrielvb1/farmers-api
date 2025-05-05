import { PartialType } from '@nestjs/mapped-types';
import { CreateHarvestDto } from './create-harvest.dto';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateHarvestDto extends PartialType(CreateHarvestDto) {
  @IsNumber()
  @Min(1900)
  year?: number;

  @IsNumber()
  @IsNotEmpty()
  property_id?: number;
}
