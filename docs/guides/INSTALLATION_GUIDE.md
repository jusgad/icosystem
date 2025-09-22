# 🚀 Guía de Instalación Completa - ICOsystem

Esta guía te llevará paso a paso por la instalación completa de ICOsystem en diferentes entornos.

## 📋 Índice

1. [Instalación Rápida (5 minutos)](#-instalación-rápida-5-minutos)
2. [Instalación Detallada](#-instalación-detallada)
3. [Configuración de Servicios Externos](#-configuración-de-servicios-externos)
4. [Verificación de la Instalación](#-verificación-de-la-instalación)
5. [Solución de Problemas](#-solución-de-problemas)
6. [Instalación con Docker](#-instalación-con-docker)

## ⚡ Instalación Rápida (5 minutos)

### Prerrequisitos Mínimos
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Git

### Pasos Rápidos

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/icosystem.git
cd icosystem

# 2. Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# 3. Configurar bases de datos
createdb icosystem
redis-server &

# 4. Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Editar archivos .env con tus configuraciones

# 5. Iniciar servicios
cd backend && npm run dev &
cd frontend && npm start
```

¡Listo! La aplicación estará en `http://localhost:3001`

## 🔧 Instalación Detallada

### Paso 1: Prerrequisitos del Sistema

#### En Ubuntu/Debian

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Instalar Redis
sudo apt install redis-server -y
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Instalar Git
sudo apt install git -y
```

#### En macOS

```bash
# Instalar Homebrew (si no está instalado)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependencias
brew install node@18 postgresql redis git

# Iniciar servicios
brew services start postgresql
brew services start redis
```

#### En Windows

1. **Node.js**: Descargar desde [nodejs.org](https://nodejs.org/)
2. **PostgreSQL**: Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)
3. **Redis**: Usar [Redis for Windows](https://github.com/microsoftarchive/redis/releases) o WSL
4. **Git**: Descargar desde [git-scm.com](https://git-scm.com/download/win)

### Paso 2: Verificar Instalaciones

```bash
# Verificar Node.js
node --version  # debe ser >= 18.0.0
npm --version

# Verificar PostgreSQL
psql --version

# Verificar Redis
redis-cli ping  # debe responder PONG

# Verificar Git
git --version
```

### Paso 3: Configuración de PostgreSQL

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Dentro de psql:
CREATE DATABASE icosystem;
CREATE USER icosystem_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE icosystem TO icosystem_user;
ALTER USER icosystem_user CREATEDB;
\q
```

#### Configurar Autenticación (si es necesario)
```bash
# Editar archivo de configuración
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Cambiar método de autenticación de 'peer' a 'md5' para conexiones locales
# local   all             all                                     md5
# host    all             all             127.0.0.1/32            md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### Paso 4: Configuración de Redis

```bash
# Verificar configuración actual
redis-cli config get "*"

# Configurar Redis para persistencia (opcional)
sudo nano /etc/redis/redis.conf

# Descomentar o añadir:
# save 900 1
# save 300 10
# save 60 10000

# Reiniciar Redis
sudo systemctl restart redis-server
```

### Paso 5: Clonar el Proyecto

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/icosystem.git
cd icosystem

# Verificar estructura
ls -la
# Debe mostrar: backend/, frontend/, docs/, README.md, etc.
```

### Paso 6: Configuración del Backend

```bash
cd backend

# Instalar dependencias
npm install

# Verificar instalación
npm list --depth=0

# Copiar configuración
cp .env.example .env

# Editar variables de entorno
nano .env
```

#### Configuración Mínima para Desarrollo (.env)

```env
# ===== SERVIDOR =====
PORT=3000
NODE_ENV=development

# ===== BASE DE DATOS =====
DB_HOST=localhost
DB_PORT=5432
DB_NAME=icosystem
DB_USER=icosystem_user
DB_PASSWORD=tu_password_seguro

# ===== REDIS =====
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ===== JWT =====
JWT_SECRET=mi-clave-super-secreta-para-desarrollo-12345
JWT_EXPIRES_IN=7d

# ===== COSTOS =====
BASE_TRAINING_COST=60000

# ===== ARCHIVOS =====
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

#### Crear Directorio de Uploads

```bash
mkdir -p uploads
chmod 755 uploads
```

### Paso 7: Configuración del Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Verificar instalación
npm list --depth=0

# Copiar configuración
cp .env.example .env

# Editar variables de entorno
nano .env
```

#### Configuración Mínima para Desarrollo (.env)

```env
# ===== API =====
REACT_APP_API_URL=http://localhost:3000/api

# ===== FIREBASE (configurar después) =====
REACT_APP_FIREBASE_API_KEY=configurar-despues
REACT_APP_FIREBASE_AUTH_DOMAIN=configurar-despues
REACT_APP_FIREBASE_PROJECT_ID=configurar-despues
REACT_APP_FIREBASE_STORAGE_BUCKET=configurar-despues
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=configurar-despues
REACT_APP_FIREBASE_APP_ID=configurar-despues
```

### Paso 8: Primera Ejecución

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend (en otra terminal)
cd frontend
npm start
```

#### Verificar que todo funciona:

1. **Backend**: `http://localhost:3000/api/health` debe responder con JSON
2. **Frontend**: `http://localhost:3001` debe mostrar la página de login
3. **Base de datos**: Las tablas se crean automáticamente

## 🌐 Configuración de Servicios Externos

### Firebase Configuration

#### 1. Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Agregar proyecto"
3. Nombre: `icosystem-dev` (o tu preferencia)
4. Deshabilitar Google Analytics (opcional para desarrollo)
5. Crear proyecto

#### 2. Configurar Authentication

1. En el panel izquierdo: **Authentication**
2. Clic en "Comenzar"
3. Tab "Sign-in method"
4. Habilitar **Google**
5. Configurar email de soporte del proyecto
6. Guardar

#### 3. Obtener Configuración Web

1. En Configuración del proyecto (⚙️)
2. Tab "General"
3. En "Tus apps" clic en "</>" (Web)
4. Nombre de la app: `icosystem-frontend`
5. **No** marcar Firebase Hosting
6. Copiar objeto de configuración

#### 4. Configurar Service Account

1. En Configuración del proyecto (⚙️)
2. Tab "Cuentas de servicio"
3. Clic en "Generar nueva clave privada"
4. Descargar archivo JSON
5. Extraer valores para variables de entorno

#### 5. Actualizar Variables de Entorno

**Frontend (.env):**
```env
REACT_APP_FIREBASE_API_KEY=AIzaSyC...
REACT_APP_FIREBASE_AUTH_DOMAIN=icosystem-dev.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=icosystem-dev
REACT_APP_FIREBASE_STORAGE_BUCKET=icosystem-dev.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Backend (.env):**
```env
FIREBASE_PROJECT_ID=icosystem-dev
FIREBASE_PRIVATE_KEY_ID=key-id-from-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...tu-clave...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@icosystem-dev.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxx%40icosystem-dev.iam.gserviceaccount.com
```

### Google Cloud Configuration (Opcional)

#### 1. Crear Proyecto Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto (puede ser el mismo nombre que Firebase)
3. Habilitar APIs necesarias:
   - Google Calendar API
   - Google Meet API (si está disponible)

#### 2. Crear Credenciales OAuth

1. APIs y servicios > Credenciales
2. Crear credenciales > ID de cliente OAuth 2.0
3. Tipo: Aplicación web
4. URIs de redireccionamiento autorizados:
   - `http://localhost:3001`
   - `https://tu-dominio.com` (para producción)

#### 3. Configurar Variables

```env
# Backend
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
GOOGLE_MEET_API_KEY=tu-api-key
```

### Exchange Rate API

1. Regístrate en [ExchangeRate-API](https://exchangerate-api.com/)
2. Plan gratuito: 1,500 requests/mes
3. Obtén tu API key
4. Configurar en backend:

```env
EXCHANGE_RATE_API_KEY=tu-api-key
EXCHANGE_RATE_BASE_URL=https://api.exchangerate-api.com/v4/latest
```

## ✅ Verificación de la Instalación

### Script de Verificación

Crea un archivo `verify-installation.js` en la raíz del proyecto:

```javascript
const { exec } = require('child_process');
const axios = require('axios');

async function verifyInstallation() {
  console.log('🔍 Verificando instalación de ICOsystem...\n');

  // Verificar Node.js
  exec('node --version', (error, stdout) => {
    if (error) {
      console.log('❌ Node.js no está instalado');
    } else {
      console.log(`✅ Node.js: ${stdout.trim()}`);
    }
  });

  // Verificar PostgreSQL
  exec('psql --version', (error, stdout) => {
    if (error) {
      console.log('❌ PostgreSQL no está instalado');
    } else {
      console.log(`✅ PostgreSQL: ${stdout.trim()}`);
    }
  });

  // Verificar Redis
  exec('redis-cli ping', (error, stdout) => {
    if (error) {
      console.log('❌ Redis no está ejecutándose');
    } else {
      console.log(`✅ Redis: ${stdout.trim()}`);
    }
  });

  // Verificar Backend API
  try {
    const response = await axios.get('http://localhost:3000/api/health');
    console.log('✅ Backend API funcionando');
    console.log(`   Status: ${response.data.status}`);
  } catch (error) {
    console.log('❌ Backend API no responde');
    console.log('   Asegúrate de que el backend esté ejecutándose');
  }

  // Verificar Frontend
  try {
    const response = await axios.get('http://localhost:3001');
    console.log('✅ Frontend funcionando');
  } catch (error) {
    console.log('❌ Frontend no responde');
    console.log('   Asegúrate de que el frontend esté ejecutándose');
  }

  console.log('\n🎉 Verificación completada!');
}

verifyInstallation();
```

Ejecutar verificación:
```bash
node verify-installation.js
```

### Checklist Manual

- [ ] ✅ Node.js 18+ instalado
- [ ] ✅ PostgreSQL funcionando
- [ ] ✅ Redis funcionando
- [ ] ✅ Base de datos `icosystem` creada
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Backend ejecutándose en puerto 3000
- [ ] ✅ Frontend ejecutándose en puerto 3001
- [ ] ✅ Firebase configurado (para login)
- [ ] ✅ Login con Google funcionando
- [ ] ✅ Dashboard carga correctamente

## 🛠 Solución de Problemas

### Problemas Comunes

#### 1. Error de Conexión a PostgreSQL

```bash
# Error: FATAL: password authentication failed
# Solución:
sudo -u postgres psql
ALTER USER icosystem_user PASSWORD 'nueva_password';
\q

# Actualizar .env con la nueva password
```

#### 2. Redis no se conecta

```bash
# Verificar si Redis está ejecutándose
sudo systemctl status redis-server

# Si no está activo:
sudo systemctl start redis-server

# Verificar puerto
redis-cli -p 6379 ping
```

#### 3. Error de Permisos en Uploads

```bash
# En el directorio backend:
mkdir -p uploads
chmod 755 uploads
chown $USER:$USER uploads
```

#### 4. Puertos Ocupados

```bash
# Verificar qué proceso usa el puerto 3000
sudo netstat -tulpn | grep :3000

# Matar proceso si es necesario
sudo kill -9 PID

# O cambiar puerto en .env:
PORT=3001
```

#### 5. Dependencias de Node.js Conflictivas

```bash
# Limpiar cache npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### 6. Error de Firebase

```bash
# Verificar que las variables de entorno estén correctas
echo $REACT_APP_FIREBASE_API_KEY

# Verificar que Firebase esté configurado en la consola
# Asegurarse de que el dominio esté autorizado
```

### Logs de Debugging

#### Backend Logs
```bash
# En desarrollo con más detalle
DEBUG=* npm run dev

# Solo logs de la aplicación
DEBUG=app:* npm run dev
```

#### Frontend Logs
```bash
# Ejecutar con logs detallados
REACT_APP_DEBUG=true npm start

# Ver logs en el navegador (F12 > Console)
```

### Herramientas de Diagnóstico

#### 1. Health Check Script

```bash
# Crear script de diagnóstico
cat > health-check.sh << 'EOF'
#!/bin/bash
echo "🔍 ICOsystem Health Check"
echo "========================="

echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "PostgreSQL: $(psql --version | head -1)"
echo "Redis: $(redis-cli --version)"

echo -n "Database Connection: "
if PGPASSWORD=tu_password psql -h localhost -U icosystem_user -d icosystem -c '\l' > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo -n "Redis Connection: "
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo -n "Backend API: "
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo -n "Frontend: "
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi
EOF

chmod +x health-check.sh
./health-check.sh
```

## 🐳 Instalación con Docker

### Docker Compose para Desarrollo

Crea `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: icosystem_postgres
    environment:
      POSTGRES_DB: icosystem
      POSTGRES_USER: icosystem_user
      POSTGRES_PASSWORD: password123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U icosystem_user -d icosystem"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: icosystem_redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: icosystem_backend
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - DB_USER=icosystem_user
      - DB_PASSWORD=password123
      - DB_NAME=icosystem
      - REDIS_HOST=redis
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: icosystem_frontend
    environment:
      - REACT_APP_API_URL=http://localhost:3000/api
    ports:
      - "3001:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    command: npm start

volumes:
  postgres_data:
```

### Dockerfiles de Desarrollo

**backend/Dockerfile.dev:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Crear directorio de uploads
RUN mkdir -p uploads && chmod 755 uploads

EXPOSE 3000

# Comando por defecto (se sobrescribe en docker-compose)
CMD ["npm", "run", "dev"]
```

**frontend/Dockerfile.dev:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

EXPOSE 3000

# Comando por defecto
CMD ["npm", "start"]
```

### Usar Docker para Desarrollo

```bash
# Iniciar todos los servicios
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar servicios
docker-compose -f docker-compose.dev.yml down

# Reconstruir imágenes
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Ventajas de Docker

- ✅ Entorno consistente
- ✅ Fácil compartir entre desarrolladores
- ✅ Aislamiento de dependencias
- ✅ Setup automático de bases de datos
- ✅ Fácil reset del entorno

---

## 🎯 Próximos Pasos

Una vez completada la instalación:

1. **Configurar Firebase** para autenticación
2. **Configurar Google Cloud** para Meet API
3. **Probar todas las funcionalidades**
4. **Configurar entorno de producción**
5. **Setup CI/CD pipeline**

---

**¿Problemas durante la instalación?** 
Crea un issue en GitHub con:
- Sistema operativo
- Versiones de software
- Comando que falló
- Logs de error completos