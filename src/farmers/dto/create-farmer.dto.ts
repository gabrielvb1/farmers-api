import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFarmerDto {
  @ApiProperty({
    description: 'Nome do proprietário',
    example: 'Roberto Silva',
  })
  @IsString({
    message: 'Envie um nome válido',
  })
  @IsNotEmpty({
    message: 'Envie um nome válido',
  })
  @Matches(/^\S.*\S$|^\S$/, {
    message: 'Envie um nome válido',
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s-]+$/, {
    message: 'Envie um nome válido',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  name: string;

  @ApiProperty({
    description:
      'CPF (11 digitos) or CNPJ (14 digitos) do proprietario, sem caracteres especiais',
    example: '95076617003',
  })
  @IsString({
    message: 'Cpf e cnpj precisam estar no formato texto',
  })
  @IsNotEmpty({
    message: 'Envie um cpf ou cnpj',
  })
  @Matches(/^\d{11}$|^\d{14}$/, {
    message: 'Envie um cpf ou cnpj válido e sem caracteres especiais',
  })
  cpf_cnpj: string;
}
