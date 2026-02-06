FROM node:20-alpine

# Dodaj narzędzia potrzebne do kompilacji + zależności dla canvas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev \
    vips-tools \
    pkgconfig \
    libc6-compat \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    pixman-dev

WORKDIR /app

# Kopiuj pliki package
COPY package*.json ./

# Ustaw zmienne środowiskowe dla sharp i canvas
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1

# Instaluj zależności
RUN npm install --legacy-peer-deps

# Kopiuj resztę plików
COPY . .

# Eksponuj port
EXPOSE 5000

# Uruchom w trybie deweloperskim
CMD ["npm", "run", "dev"]