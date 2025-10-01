# 📖 Guía de Instalación - ICOsystem

## Prerrequisitos

- **Node.js** 18.0+ ([descargar](https://nodejs.org/))
- **PostgreSQL** 15.0+ ([descargar](https://www.postgresql.org/))
- **Redis** 7.0+ ([descargar](https://redis.io/))
- **Git** ([descargar](https://git-scm.com/))
- Cuenta de **Firebase** ([crear](https://console.firebase.google.com/))
- Proyecto de **Google Cloud** ([crear](https://console.cloud.google.com/))

---

## Instalación Rápida

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/icosystem.git
cd icosystem

# 2. Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# 3. Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Configurar base de datos
createdb icosystem
cd backend && npm run setup

# 5. Iniciar servicios (2 terminales)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm start
```

---

## Configuración Detallada

### 1. Base de Datos PostgreSQL

```sql
-- Crear base de datos
CREATE DATABASE icosystem;

-- Crear usuario (opcional)
CREATE USER icosystem_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE icosystem TO icosystem_user;
```

### 2. Redis

```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server
redis-cli ping  # Debe responder: PONG

# macOS
brew install redis
brew services start redis

# Windows
# Descargar de https://redis.io/download
```

### 3. Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear proyecto o seleccionar existente
3. Habilitar **Authentication** > **Google Sign-In**
4. Ir a **Project Settings** > **Service Accounts**
5. Generar nueva clave privada (descargar JSON)
6. Extraer valores para .env

### 4. Google Cloud APIs

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar APIs:
   - Google Calendar API
   - Google Meet API (si disponible)
3. Crear credenciales OAuth 2.0
4. Descargar archivo de credenciales

### 5. Exchange Rate API

1. Registrarse en [ExchangeRate-API](https://exchangerate-api.com/)
2. Obtener API key gratuita
3. Agregar a .env

---

## Variables de Entorno

### Backend (.env)

```env
# ===== SERVIDOR =====
PORT=3000
NODE_ENV=development

# ===== SEGURIDAD =====
ALLOWED_ORIGINS=http://localhost:3001,http://127.0.0.1:3001

# ===== BASE DE DATOS =====
DB_HOST=localhost
DB_PORT=5432
DB_NAME=icosystem
DB_USER=postgres
DB_PASSWORD=tu_password

# ===== REDIS =====
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ===== FIREBASE =====
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=tu-client-id

# ===== GOOGLE OAUTH =====
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# ===== GOOGLE MEET =====
GOOGLE_MEET_API_KEY=tu-google-meet-api-key

# ===== EXCHANGE RATE =====
EXCHANGE_RATE_API_KEY=tu-exchange-rate-api-key
EXCHANGE_RATE_BASE_URL=https://api.exchangerate-api.com/v4/latest

# ===== NEGOCIO =====
BASE_TRAINING_COST=60000

# ===== ARCHIVOS =====
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Frontend (.env)

```env
# ===== API =====
REACT_APP_API_URL=http://localhost:3000/api

# ===== FIREBASE =====
REACT_APP_FIREBASE_API_KEY=tu-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto-id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Verificación de Instalación

```bash
# 1. Verificar PostgreSQL
psql -U postgres -c "SELECT version();"

# 2. Verificar Redis
redis-cli ping

# 3. Verificar Node.js
node --version  # Debe ser 18+
npm --version

# 4. Ejecutar migraciones
cd backend
npm run db:migrate

# 5. Verificar backend
curl http://localhost:3000/api/health

# 6. Acceder al frontend
# Abrir http://localhost:3001 en el navegador
```

---

## Solución de Problemas

### PostgreSQL no conecta
```bash
# Verificar que está corriendo
sudo systemctl status postgresql

# Verificar puerto
ss -tulpn | grep 5432

# Verificar permisos en pg_hba.conf
```

### Redis connection refused
```bash
# Verificar servicio
sudo systemctl status redis-server

# Verificar puerto
redis-cli -h localhost -p 6379 ping
```

### Error de autenticación Firebase
- Verificar que el JSON de Firebase es válido
- Asegurar que `FIREBASE_PRIVATE_KEY` tiene saltos de línea (`\n`)
- Verificar que Authentication está habilitado

### Error "Cannot find module"
```bash
# Borrar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Puerto en uso
```bash
# Encontrar proceso usando puerto 3000
lsof -i :3000

# Matar proceso
kill -9 <PID>
```

---

## Próximos Pasos

1. ✅ **Probar la aplicación** - Iniciar sesión con Google
2. 📚 **Leer la documentación** - Ver [docs/guides/USER_MANUAL.md](USER_MANUAL.md)
3. 👨‍💻 **Configurar desarrollo** - Ver [docs/guides/DEVELOPMENT.md](DEVELOPMENT.md)
4. 🚀 **Desplegar** - Ver [docs/guides/DEPLOYMENT.md](DEPLOYMENT.md)

---

**Última actualización:** Octubre 2025
