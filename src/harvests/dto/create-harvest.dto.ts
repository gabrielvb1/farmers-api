import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsNotEmpty } from 'class-validator';
export class CreateHarvestDto {
  @ApiProperty({
    description: 'Ano maior que 1900 e menor/igual ao ano corrente',
    example: '2025',
  })
  @IsNumber()
  @Min(1900)
  year: number;

  @ApiProperty({
    description: 'Id da propriedade cadastrada',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  property_id: number;
}
