# ---------------------------------------
# Stage 1: Build
# ---------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Copiamos solo los archivos de dependencias primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalamos todas las dependencias (incluyendo devDependencies para el build)
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos el proyecto. 
# Esto generará la carpeta dist/ con 'client/' y 'server/'
RUN npm run build

# ---------------------------------------
# Stage 2: Runtime (SSR)
# ---------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app

# Copiamos los archivos construidos desde el stage anterior
COPY --from=build /app/dist ./dist

# Necesitamos package.json para saber si hay scripts o dependencias runtime específicas
COPY --from=build /app/package.json ./package.json

# OPCIONAL PERO RECOMENDADO: 
# Si el adaptador de Node no empaqueta las dependencias (standalone),
# necesitamos instalar las dependencias de producción.
# Si usas modo 'standalone' (lo veremos en tu config), esto a veces se puede omitir,
# pero instalar las de producción es más seguro para evitar errores de "module not found".
COPY --from=build /app/node_modules ./node_modules

# Variables de entorno por defecto (se pueden sobreescribir desde docker-compose)
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# Exponemos el puerto de Astro
EXPOSE 4321

# Comando de arranque para Astro SSR con adaptador Node
# NOTA: La ruta './dist/server/entry.mjs' es la estándar en Astro 5.
# Verificaremos esto en el siguiente paso.
CMD ["node", "./dist/server/entry.mjs"]