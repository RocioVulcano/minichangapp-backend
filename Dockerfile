# Etapa 1: construir dependencias
FROM node:18-alpine AS build
WORKDIR /app

# Copiar package.json primero (para aprovechar cache de Docker)
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el código fuente
COPY . .

# Etapa 2: crear imagen final
FROM node:18-alpine
WORKDIR /app

# Copiar desde la etapa anterior solo lo necesario
COPY --from=build /app /app

# Puerto expuesto
EXPOSE 3000

# Variable de entorno por defecto (Render/QA/PROD van a sobreescribir esto)
ENV PORT=3000

# Comando para iniciar la app
CMD ["npm", "start"]
