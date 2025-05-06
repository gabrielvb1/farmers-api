# Documentação da Farmers API

## Visão Geral

A **Farmers API** é uma aplicação backend desenvolvida com [NestJS], [Prisma] e [TypeScript] para gerenciar informações de fazendeiros. A API permite criar, consultar e gerenciar registros de fazendeiros, incluindo dados como nome e CPF/CNPJ. Foi escrita seguindo padrões SOLID e de Clean Code visando ser escalável, com suporte a banco de dados PostgreSQL (via Prisma) e documentação Swagger.

Ela está disponível no endereço https://farmers-api-1omo.onrender.com/api

### Funcionalidades Principais
- **Cadastro de Fazendeiros**: Criação de registros com nome e CPF/CNPJ.
- **Consulta de Fazendeiros**: Recuperação de dados de fazendeiros.
- **Documentação Swagger**: Interface interativa para explorar os endpoints.
- **Testes Unitários**: Cobertura de testes com Jest para garantir a qualidade do código.

## Pré-requisitos


## Como Rodar a API Localmente

1. **Clonar o Repositório**:
   ```bash
   cd farmers-api
   ```

2. **Instalar Dependências**:
   ```bash
   npm install
   ```

3. **Iniciar a API**:
   ```bash
   npm run start:dev
   ```
   - A API estará disponível em `http://localhost:3000`.

## Acessando a Documentação Swagger

A API inclui uma interface Swagger para documentação interativa dos endpoints.

1. **Inicie a API** (se ainda não estiver rodando):
   ```bash
   npm run start:dev
   ```

2. **Acesse o Swagger**:
   - Abra um navegador e vá para:
     ```
     http://localhost:3000/api
     ```
   - Você verá a interface do Swagger com todos os endpoints disponíveis, incluindo:
     - `POST /farmers`: Cria um novo fazendeiro (exemplo de body: `{"name": "Roberto Silva", "cpf_cnpj": "95076617003"}`).
     - Outros endpoints conforme implementados.

3. **Explorar Endpoints**:
   - Use o Swagger para testar os endpoints diretamente, visualizando schemas, exemplos de requisições e respostas.

## Rodando Testes Unitários com Cobertura

A API usa **Jest** para testes unitários, com suporte a relatórios de cobertura de código.

1. **Executar Testes Unitários**:
   ```bash
   npm run test
   ```
   - Isso executa todos os testes unitários (arquivos com extensão `.spec.ts`).

2. **Executar Testes com Cobertura**:
   ```bash
   npm run test:cov
   ```
   - **O que acontece**:
     - O Jest executa os testes e gera um relatório de cobertura.
     - O relatório mostra a porcentagem de cobertura para **statements**, **branches**, **functions** e **lines**.
   - **Saída**:
     - Um resumo no terminal, como:
       ```
       -----------------------|---------|----------|---------|---------|-------------------
       File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
       -----------------------|---------|----------|---------|---------|-------------------
       All files              |   85.71 |    75.00 |   88.89 |   85.71 |                   
        farmers.controller.ts |   90.00 |    80.00 |  100.00 |   90.00 | 15                
        farmers.service.ts    |   80.00 |    70.00 |   75.00 |   80.00 | 22, 25            
       -----------------------|---------|----------|---------|---------|-------------------
       ```
