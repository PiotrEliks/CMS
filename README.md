# CMS
Uruchomienie lokalne:  
Backend:  
/backend -> npm run dev  

Admin-panel:  
/admin-panel -> npm run dev  

Public-site:  
/public-site -> npm run dev  

Baza danych:  
/backend -> docker-compose up -d  

Dodać .env w /backend z:  
  PORT=5000  
  NODE_ENV=development  
  DATABASE_URL=postgres://postgres:postgres@localhost:5432/CMSDatabase  
  JWT_SECRET=906cc269ca01262b643daa74af2c2e34615456f45fa1b3539fec178cd45c03f3  
  POSTGRES_USER=postgres  
  POSTGRES_PASSWORD=postgres  
  POSTGRES_DB=CMSDatabase  


Prettier format:
npx prettier --write .