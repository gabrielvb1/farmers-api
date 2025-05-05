import { PartialType } from '@nestjs/mapped-types';
import { CreateFarmerDto } from './create-farmer.dto';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateFarmerDto extends PartialType(CreateFarmerDto) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{11}$|^\d{14}$/, {
    message: 'Envie um cpf ou cnpj válidos e sem caracteres especiais',
  })
  cpf_cnpj?: string;
}
