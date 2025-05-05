import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCropDto {
  @ApiProperty({
    description: 'Nome da cultura plantada',
    example: 'Soja',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Id da safra (ano)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  harvest_id: number;
}
