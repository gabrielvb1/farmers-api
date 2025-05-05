import { cpf, cnpj } from 'cpf-cnpj-validator';

export function validateCpfCnpj(data: string): boolean {
  return cpf.isValid(data) || cnpj.isValid(data);
}

export function cleanCpfCnpj(data: string): string {
  return data.replace(/\D/g, '');
}
