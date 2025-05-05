import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({
    description: 'Nome da propriedade',
    example: 'Fazenda Teste',
  })
  @IsString()
  @IsNotEmpty()
  property_name: string;

  @ApiProperty({
    description: 'Nome cidade onde está a propriedade',
    example: 'São Paulo',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Nome do Estado onde está a propriedade',
    example: 'SP',
  })
  @IsString()
  @IsNotEmpty()
  uf: string;

  @ApiProperty({
    description: 'Área total da propriedade em hectares',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  total_area: number;

  @ApiProperty({
    description: 'Área agricultável da propriedade em hectares',
    example: 50,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  agricultural_area: number;

  @ApiProperty({
    description: 'Área de vegetação da propriedade em hectares',
    example: 50,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  vegetation_area: number;

  @ApiProperty({
    description: 'O Id do proprietário existente no banco',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  farmer_id: number;
}
