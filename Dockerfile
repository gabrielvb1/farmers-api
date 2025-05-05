# Etapa de build
FROM node:22-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para build e Prisma)
RUN npm ci

# Copiar o schema.prisma e outros arquivos
COPY prisma ./prisma
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Etapa de produção
FROM node:22-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar artefatos compilados da etapa de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expor porta 3000
EXPOSE 3000


# Comando para iniciar a API
CMD ["node", "dist/main.js"]