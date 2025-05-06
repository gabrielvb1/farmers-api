# Farmers API

A Farmers API é uma aplicação backend desenvolvida com [NestJS], [Prisma] e [TypeScript] para gerenciar informações de fazendeiros. A API permite criar, consultar e gerenciar registros de fazendeiros, incluindo dados como nome e CPF/CNPJ. Foi escrita seguindo padrões SOLID e de Clean Code, visando ser escalável, com suporte a banco de dados PostgreSQL (via Prisma), filas SQS da AWS e documentação Swagger.

Ela está disponível no endereço: [https://farmers-api-1omo.onrender.com/api](https://farmers-api-1omo.onrender.com/api)

## Funcionalidades Principais

- **Cadastro de Fazendeiros**: Criação de registros com nome e CPF/CNPJ.
- **Consulta de Fazendeiros**: Recuperação de dados de fazendeiros.
- **Filas SQS**: Integração com AWS SQS para processamento assíncrono de fazendeiros, propriedades, colheitas e culturas.
- **Documentação Swagger**: Interface interativa para explorar os endpoints.
- **Testes Unitários**: Cobertura de testes com Jest para garantir a qualidade do código.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior) e [npm](https://www.npmjs.com/) (para rodar localmente sem Docker).
- [Docker](https://www.docker.com/get-started) e [Docker Compose](https://docs.docker.com/compose/install/) (para rodar com Docker).
- Conta AWS com acesso a SQS e credenciais configuradas (para usar filas SQS).
- Banco de dados PostgreSQL (se não usar Docker).

## Como Rodar a API Localmente

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/seu-usuario/farmers-api.git
   cd farmers-api
   ```

2. **Instalar Dependências**:
   ```bash
   npm install
   ```

3. **Configurar o Arquivo `.env`**:
   - Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:
     ```env
     DATABASE_URL="postgresql://user:password@localhost:5432/farmers_db?schema=public"
     PORT=3000
     AWS_ACCESS_KEY_ID="sua-chave"
     AWS_SECRET_ACCESS_KEY="sua-chave-secreta"
     AWS_REGION="us-east-1"
     SQS_FARMERS_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/<seu-account-id>/farmers-queue"
     SQS_PROPERTIES_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/<seu-account-id>/properties-queue"
     SQS_HARVESTS_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/<seu-account-id>/harvests-queue"
     SQS_CROPS_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/<seu-account-id>/crops-queue"
     ```
   - **Banco de Dados**: Configure o `DATABASE_URL` com as credenciais do seu PostgreSQL local.
   - **AWS e SQS**: Configure as credenciais AWS e as URLs das filas SQS. Crie as filas na sua conta AWS e substitua `<seu-account-id>` pelo ID da sua conta.
   - **Nota**: Nunca commit o arquivo `.env` no GitHub. Mantenha-o no `.gitignore`.

4. **Iniciar a API**:
   ```bash
   npm run start:dev
   ```
   - A API estará disponível em `http://localhost:3000`.

## Rodando a API com Docker

Você pode executar a Farmers API usando Docker, sem precisar instalar Node.js ou PostgreSQL localmente. Um `Dockerfile` e um `docker-compose.yml` estão incluídos no repositório.

### Pré-requisitos para Docker
- [Docker](https://www.docker.com/get-started) instalado.
- [Docker Compose](https://docs.docker.com/compose/install/) instalado (geralmente incluído com o Docker Desktop).

### Passos para Rodar com Docker

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/seu-usuario/farmers-api.git
   cd farmers-api
   ```

2. **Configurar o Arquivo `.env`**:
   - Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:
     ```env
     DATABASE_URL="postgresql://postgres:postgres@postgres:5432/farmers_db?schema=public"
     PORT=3000
     AWS_ACCESS_KEY_ID="sua-chave"
     AWS_SECRET_ACCESS_KEY="sua-chave-secreta"
     AWS_REGION="us-east-1"
     SQS_FARMERS_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/<seu-account-id>/farmers-queue"
     SQS_PROPERTIES_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/<seu-account-id>/properties-queue"
     SQS_HARVESTS_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/<seu-account-id>/harvests-queue"
     SQS_CROPS_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/<seu-account-id>/crops-queue"
     ```
   - **Banco de Dados**: Use o `DATABASE_URL` fornecido para o PostgreSQL gerenciado pelo Docker Compose.
   - **AWS e SQS**: Configure as credenciais AWS e as URLs das filas SQS. Crie as filas na sua conta AWS e substitua `<seu-account-id>` pelo ID da sua conta.
   - **Nota**: Nunca commit o arquivo `.env` no GitHub. Mantenha-o no `.gitignore`.

3. **Construir e Iniciar os Contêineres**:
   ```bash
   docker-compose up --build
   ```
   - Isso constrói a imagem da API, inicia o contêiner da aplicação e configura um contêiner PostgreSQL.
   - A API estará disponível em `http://localhost:3000`.

4. **Acessar a Documentação Swagger**:
   - Com a API rodando, abra o navegador e vá para:
     ```
     http://localhost:3000/api
     ```
   - Use a interface Swagger para explorar e testar os endpoints.

5. **Parar os Contêineres**:
   - Para parar a execução, pressione `Ctrl+C` ou execute:
     ```bash
     docker-compose down
     ```
   - Para remover os volumes (incluindo o banco de dados), use:
     ```bash
     docker-compose down -v
     ```

### Observações
- O `docker-compose.yml` configura automaticamente um banco de dados PostgreSQL. Você não precisa instalá-lo localmente.
- As variáveis de ambiente no `.env` são carregadas pelo Docker Compose. Mantenha o `.env` fora do controle de versão.
- Se precisar ajustar portas ou configurações, edite o `docker-compose.yml`.

## Acessando a Documentação Swagger

A API inclui uma interface Swagger para documentação interativa dos endpoints.

1. **Inicie a API** (se ainda não estiver rodando):
   ```bash
   npm run start:dev
   ```
   Ou, com Docker:
   ```bash
   docker-compose up --build
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

A API usa Jest para testes unitários, com suporte a relatórios de cobertura de código.

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
     - O relatório mostra a porcentagem de cobertura para statements, branches, functions e lines.
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

