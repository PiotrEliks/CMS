FROM node:20-alpine

WORKDIR /app

# Kopiuj pliki package
COPY package*.json ./

# Instaluj zależności
RUN npm install --legacy-peer-deps

# Kopiuj resztę plików
COPY . .

# Eksponuj port
EXPOSE 5173

# Uruchom Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]