# 🚀 ICOsystem - Plataforma de Gestión Integral de Emprendimientos

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red.svg)](https://redis.io/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin-orange.svg)](https://firebase.google.com/)
[![Security](https://img.shields.io/badge/Security-Audited-brightgreen.svg)](docs/SECURITY.md)
[![OWASP](https://img.shields.io/badge/OWASP-Compliant-success.svg)](https://owasp.org/)

**ICOsystem** es una aplicación web modular diseñada para la gestión integral de emprendimientos. La plataforma conecta emprendedores, aliados, clientes y super usuarios, proporcionando funcionalidades específicas para cada rol y facilitando el seguimiento del ciclo de vida completo de los emprendimientos.

![ICOsystem Dashboard](docs/images/dashboard-preview.png)

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [API Documentation](#-api-documentation)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## 🌟 Características Principales

### 🔐 **Sistema de Autenticación y Seguridad Robusto**
- Integración completa con Firebase Authentication
- Google OAuth 2.0 para inicio de sesión seguro
- Sistema de roles granular (Super Usuario, Emprendedor, Aliado, Cliente)
- Sesiones persistentes y seguras
- **NUEVO**: Auditoría de seguridad completa OWASP Top 10 2021
- **NUEVO**: Protección IDOR/BOLA implementada
- **NUEVO**: Rate limiting para prevenir ataques de fuerza bruta
- **NUEVO**: Headers de seguridad con Helmet.js

### 📊 **Gestión del Ciclo de Vida del Emprendimiento**
- **5 Etapas de Desarrollo**:
  - 🔍 **Ideación**: Validación de problema y prototipo
  - 🌱 **Pre-incubación**: Modelo de negocio y pruebas piloto
  - 🏢 **Incubación**: Plan financiero y equipo formalizado
  - 🚀 **Aceleración**: Inversión externa y crecimiento
  - 💼 **Consolidación**: Ingresos recurrentes y escalabilidad

### 💬 **Sistema de Comunicación Integrado**
- Mensajería interna en tiempo real
- Integración con Google Meet para videoconferencias
- Calendario compartido para gestión de reuniones
- Notificaciones inteligentes

### 📁 **Gestión de Documentos Avanzada**
- Subida y organización de archivos por categorías
- Control de acceso basado en roles
- Documentos públicos y privados
- Búsqueda y filtrado avanzado

### 💰 **Sistema Financiero y Métricas**
- Conversión de monedas en tiempo real (COP, USD, EUR)
- Cálculo automático de inversiones en capacitación
- Dashboard de impacto con métricas clave
- Reportes descargables en múltiples formatos

### 📈 **Analytics y Reportes**
- Dashboard personalizado por rol
- Métricas de progreso en tiempo real
- Reportes de impacto social
- Análisis de población vulnerable

## 🏗️ Arquitectura del Sistema

### **Backend (Node.js + Express)**
```
┌─────────────────────────────────────────────┐
│                 Cliente                     │
└─────────────────┬───────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────┐
│            Load Balancer                    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          API Gateway (Express)              │
│  ┌─────────────┬─────────────┬─────────────┐│
│  │Auth Service │Meet Service │Curr Service ││
│  └─────────────┴─────────────┴─────────────┘│
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│              Database Layer                 │
│  ┌─────────────┐  ┌─────────────┐          │
│  │ PostgreSQL  │  │    Redis    │          │
│  │ (Principal) │  │   (Cache)   │          │
│  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────┘
```

### **Frontend (React + TypeScript)**
```
┌─────────────────────────────────────────────┐
│              React App                      │
│  ┌─────────────────────────────────────────┐│
│  │          Context Providers              ││
│  │    Auth │ Theme │ Notification          ││
│  └─────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────┐│
│  │            Route Guards                 ││
│  │      Private │ Role-based               ││
│  └─────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────┐│
│  │           UI Components                 ││
│  │  Dashboard │ Forms │ Charts │ Tables    ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### **Tecnologías Utilizadas**

#### Backend
- **Node.js** 18+ - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos principal
- **Sequelize** - ORM para JavaScript
- **Redis** - Cache y sesiones
- **Firebase Admin** - Autenticación
- **Google APIs** - Integración Meet/Calendar
- **Multer** - Manejo de archivos
- **JWT** - Tokens de autenticación
- **Helmet.js** - Headers de seguridad
- **Express Rate Limit** - Protección contra ataques
- **Winston** - Logging estructurado

#### Frontend
- **React** 18+ - Librería de UI
- **TypeScript** - Superset tipado de JavaScript
- **Material-UI** - Componentes de interfaz
- **Chart.js** - Visualización de datos
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Firebase SDK** - Autenticación cliente

## 🚀 Instalación

### Prerrequisitos

Asegúrate de tener instalado:

- **Node.js** 18.0 o superior ([Descargar](https://nodejs.org/))
- **PostgreSQL** 15.0 o superior ([Descargar](https://www.postgresql.org/download/))
- **Redis** 7.0 o superior ([Descargar](https://redis.io/download))
- **Git** ([Descargar](https://git-scm.com/downloads))

### Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/icosystem.git
cd icosystem
```

### Instalación del Backend

```bash
cd backend
npm install
```

### Instalación del Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuración

### 1. Configuración de la Base de Datos

#### PostgreSQL
```sql
-- Crear la base de datos
CREATE DATABASE icosystem;

-- Crear usuario (opcional)
CREATE USER icosystem_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE icosystem TO icosystem_user;
```

#### Redis
```bash
# Iniciar Redis (Ubuntu/Debian)
sudo systemctl start redis-server

# Verificar que Redis esté funcionando
redis-cli ping
# Respuesta esperada: PONG
```

### 2. Configuración de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Authentication** y configura **Google Sign-In**
4. Ve a **Project Settings** > **Service Accounts**
5. Genera una nueva clave privada y descarga el archivo JSON
6. Extrae los valores necesarios para las variables de entorno

### 3. Configuración de Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Google Calendar API
   - Google Meet API (si está disponible)
4. Crea credenciales OAuth 2.0
5. Descarga el archivo de credenciales

### 4. Variables de Entorno

#### Backend (.env)
```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

```env
# ===== CONFIGURACIÓN DEL SERVIDOR =====
PORT=3000
NODE_ENV=development

# ===== BASE DE DATOS =====
DB_HOST=localhost
DB_PORT=5432
DB_NAME=icosystem
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db

# ===== REDIS =====
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ===== JWT =====
JWT_SECRET=tu-clave-super-secreta-para-jwt
JWT_EXPIRES_IN=7d

# ===== FIREBASE =====
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_PRIVATE_KEY_ID=tu-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu-Clave-Privada\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=tu-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40tu-proyecto.iam.gserviceaccount.com

# ===== GOOGLE OAUTH =====
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# ===== GOOGLE MEET API =====
GOOGLE_MEET_API_KEY=tu-google-meet-api-key

# ===== API DE CONVERSIÓN DE MONEDAS =====
EXCHANGE_RATE_API_KEY=tu-exchange-rate-api-key
EXCHANGE_RATE_BASE_URL=https://api.exchangerate-api.com/v4/latest

# ===== CONFIGURACIÓN DE NEGOCIO =====
BASE_TRAINING_COST=60000

# ===== ARCHIVOS =====
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

#### Frontend (.env)
```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Edita el archivo `.env`:

```env
# ===== API =====
REACT_APP_API_URL=http://localhost:3000/api

# ===== FIREBASE =====
REACT_APP_FIREBASE_API_KEY=tu-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto-id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
REACT_APP_FIREBASE_APP_ID=tu-app-id
```

### 5. Configuración de APIs Externas

#### Exchange Rate API
1. Regístrate en [ExchangeRate-API](https://exchangerate-api.com/)
2. Obtén tu API key gratuita
3. Agrégala a las variables de entorno

## 📱 Uso

### Iniciar los Servicios

#### 1. Iniciar Redis
```bash
# Ubuntu/Debian
sudo systemctl start redis-server

# macOS
brew services start redis

# Windows
redis-server
```

#### 2. Iniciar PostgreSQL
```bash
# Ubuntu/Debian
sudo systemctl start postgresql

# macOS
brew services start postgresql

# Windows
# Usar pgAdmin o iniciar desde servicios
```

#### 3. Iniciar el Backend
```bash
cd backend
npm run dev
```
El servidor estará disponible en `http://localhost:3000`

#### 4. Iniciar el Frontend
```bash
cd frontend
npm start
```
La aplicación estará disponible en `http://localhost:3001`

### Primer Uso

1. **Accede a la aplicación** en `http://localhost:3001`
2. **Inicia sesión** con tu cuenta de Google
3. **Se creará automáticamente** tu perfil como emprendedor
4. **Completa tu perfil** con información adicional
5. **Explora las funcionalidades** según tu rol

### Roles de Usuario

#### 🔧 Super Usuario
- **Dashboard**: Vista completa del sistema
- **Gestión de usuarios**: Crear, editar, eliminar perfiles
- **Asignación**: Vincular aliados con emprendedores
- **Configuración**: Parámetros globales del sistema

#### 🚀 Emprendedor
- **Formularios**: Completar etapas del ciclo de vida
- **Dashboard**: Progreso personal y métricas
- **Reuniones**: Calendario y videoconferencias
- **Documentos**: Gestión de archivos del emprendimiento

#### 🤝 Aliado
- **Mentorías**: Dashboard de emprendimientos asignados
- **Actividades**: Registro de horas de capacitación
- **Comunicación**: Mensajería y calendario
- **Seguimiento**: Actualización de estados

#### 📊 Cliente
- **Impacto**: Métricas y visualizaciones
- **Reportes**: Descarga de informes
- **Directorio**: Exploración de emprendimientos
- **Análisis**: Conversión de monedas

## 📚 API Documentation

### Autenticación

Todas las rutas requieren autenticación excepto las rutas públicas. Incluye el token en el header:

```
Authorization: Bearer <firebase-id-token>
```

### Endpoints Principales

#### 🔐 Auth (`/api/auth`)
```typescript
POST   /register     // Registro de usuario
POST   /login        // Inicio de sesión
GET    /profile      // Obtener perfil
PUT    /profile      // Actualizar perfil
```

#### 🚀 Entrepreneur (`/api/entrepreneur`)
```typescript
GET    /dashboard           // Dashboard del emprendedor
PUT    /lifecycle          // Actualizar formulario de ciclo de vida
GET    /lifecycle/questions // Obtener preguntas por etapa
```

#### 📅 Meetings (`/api/meetings`)
```typescript
GET    /                // Listar reuniones
POST   /                // Crear reunión
PUT    /:id             // Actualizar reunión
DELETE /:id             // Eliminar reunión
GET    /upcoming        // Próximas reuniones
GET    /entrepreneurs   // Emprendedores disponibles
```

#### 💬 Messages (`/api/messages`)
```typescript
GET    /conversations   // Listar conversaciones
GET    /:userId         // Mensajes con usuario específico
POST   /                // Enviar mensaje
PUT    /:id/read        // Marcar como leído
GET    /search-users    // Buscar usuarios
```

#### 📁 Documents (`/api/documents`)
```typescript
GET    /                     // Listar documentos
POST   /upload               // Subir documento
PUT    /:id                  // Actualizar documento
DELETE /:id                  // Eliminar documento
GET    /:id/download         // Descargar documento
GET    /types                // Tipos de documento
```

#### 📊 Reports (`/api/reports`)
```typescript
GET    /impact-metrics       // Métricas de impacto
GET    /entrepreneur-directory // Directorio de emprendedores
GET    /progress-report      // Reporte de progreso
GET    /activity-metrics     // Métricas de actividad
```

### Ejemplos de Uso

#### Crear una Reunión
```javascript
const response = await fetch('/api/meetings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Sesión de Mentoría',
    description: 'Revisión de plan de negocio',
    startTime: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T11:00:00Z',
    entrepreneurId: 'uuid-del-emprendedor',
    createGoogleMeet: true
  })
});
```

#### Actualizar Ciclo de Vida
```javascript
const response = await fetch('/api/entrepreneur/lifecycle', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    stage: 'ideacion',
    responses: {
      problem: 'Dificultad para encontrar parking en centros comerciales',
      validation: true,
      prototype: false
    }
  })
});
```

## 🔒 Seguridad

### Auditoría de Seguridad Completada

El proyecto ICOsystem ha pasado una **auditoría completa de seguridad** basada en el OWASP Top 10 2021:

#### ✅ Vulnerabilidades Mitigadas

1. **A01 - Broken Access Control**
   - ✅ Autorización granular por roles
   - ✅ Validación de propiedad de recursos (IDOR/BOLA prevention)
   - ✅ Middleware de autenticación en todas las rutas protegidas

2. **A02 - Cryptographic Failures**
   - ✅ Firebase Admin SDK para autenticación
   - ✅ Tokens JWT verificados en backend
   - ✅ HTTPS enforcement en producción

3. **A03 - Injection**
   - ✅ Sequelize ORM con consultas parametrizadas
   - ✅ Validación de tipos MIME en uploads
   - ✅ Sanitización de inputs

4. **A05 - Security Misconfiguration**
   - ✅ Helmet.js para headers de seguridad
   - ✅ CORS configurado correctamente
   - ✅ Variables de entorno para credenciales
   - ✅ Rate limiting implementado

5. **A06 - Vulnerable Components**
   - ✅ Dependencias actualizadas (0 vulnerabilidades)
   - ✅ npm audit ejecutado regularmente

#### 🛡️ Funciones de Seguridad

- **Rate Limiting**: 100 requests por IP cada 15 minutos
- **File Upload Security**: Validación de tipos MIME y tamaño
- **Authentication Flow**: Multi-capa con Firebase + Backend
- **Authorization**: Verificación granular por recurso
- **Data Validation**: Frontend y backend validation
- **Error Handling**: No exposición de información sensible

#### 📊 Resultado de Auditoría

**Estado: 🟢 SEGURO - Listo para Producción**

- ✅ 0 vulnerabilidades críticas
- ✅ 0 vulnerabilidades altas
- ✅ Cumple estándares OWASP
- ✅ Arquitectura de seguridad robusta

Ver el [Reporte Completo de Seguridad](docs/SECURITY_AUDIT.md) para más detalles.

---

## 🛠 Desarrollo

### Estructura del Proyecto

```
icosystem/
├── backend/                    # Servidor Node.js
│   ├── src/
│   │   ├── config/            # Configuraciones
│   │   │   ├── database.js    # Configuración de PostgreSQL
│   │   │   ├── redis.js       # Configuración de Redis
│   │   │   └── firebase.js    # Configuración de Firebase
│   │   ├── controllers/       # Controladores de rutas
│   │   │   ├── authController.js
│   │   │   ├── entrepreneurController.js
│   │   │   ├── meetingController.js
│   │   │   ├── messageController.js
│   │   │   ├── documentController.js
│   │   │   └── reportController.js
│   │   ├── middleware/        # Middleware personalizado
│   │   │   └── auth.js        # Autenticación y autorización
│   │   ├── models/           # Modelos de Sequelize
│   │   │   ├── User.js
│   │   │   ├── Entrepreneur.js
│   │   │   ├── Ally.js
│   │   │   ├── Client.js
│   │   │   ├── Meeting.js
│   │   │   ├── Message.js
│   │   │   ├── Document.js
│   │   │   ├── Notification.js
│   │   │   └── index.js       # Relaciones
│   │   ├── routes/           # Definición de rutas
│   │   │   ├── auth.js
│   │   │   ├── entrepreneur.js
│   │   │   ├── meetings.js
│   │   │   ├── messages.js
│   │   │   ├── documents.js
│   │   │   └── reports.js
│   │   ├── services/         # Servicios de negocio
│   │   │   ├── currencyService.js
│   │   │   └── googleMeetService.js
│   │   └── utils/            # Utilidades
│   ├── uploads/              # Archivos subidos
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/                  # Aplicación React
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── Auth/         # Autenticación
│   │   │   ├── Dashboard/    # Dashboards
│   │   │   ├── Forms/        # Formularios
│   │   │   ├── Meetings/     # Reuniones
│   │   │   ├── Messages/     # Mensajería
│   │   │   ├── Documents/    # Documentos
│   │   │   ├── Reports/      # Reportes
│   │   │   └── Layout/       # Layout y navegación
│   │   ├── contexts/         # Context API
│   │   │   └── AuthContext.tsx
│   │   ├── services/         # Servicios API
│   │   │   └── api.ts
│   │   ├── config/           # Configuraciones
│   │   │   └── firebase.ts
│   │   ├── types/            # Tipos TypeScript
│   │   ├── utils/            # Utilidades
│   │   └── App.tsx           # Componente principal
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   └── tsconfig.json
├── docs/                     # Documentación
├── README.md
└── PROYECTO_COMPLETADO.md
```

### Scripts Disponibles

#### Backend
```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo con nodemon
npm run setup      # Configurar base de datos
npm run db:migrate # Ejecutar migraciones
npm run db:seed    # Insertar datos de prueba
npm test           # Ejecutar tests
npm run lint       # Linter ESLint
npm run lint:fix   # Corregir automáticamente
```

#### Frontend
```bash
npm start          # Iniciar servidor de desarrollo
npm run build      # Construir para producción
npm test           # Ejecutar tests
npm run eject      # Exponer configuración de Webpack
```

### Convenciones de Código

#### Backend (JavaScript)
- **ESLint** con configuración estándar
- **Camel Case** para variables y funciones
- **Pascal Case** para clases y constructores
- **Comentarios JSDoc** para funciones públicas
- **Async/Await** preferido sobre Promises
- **NUEVO**: Validación de inputs en todas las rutas
- **NUEVO**: Sanitización de datos de entrada
- **NUEVO**: Manejo seguro de archivos

#### Frontend (TypeScript)
- **Interfaces** para tipado estricto
- **Functional Components** con Hooks
- **Custom Hooks** para lógica reutilizable
- **Material-UI** para componentes consistentes
- **Context API** para estado global

### Base de Datos

#### Modelos y Relaciones

```sql
-- Diagrama de Relaciones Simplificado
Users (1) ──── (1) Entrepreneurs
Users (1) ──── (1) Allies  
Users (1) ──── (1) Clients
Users (1) ──── (n) Notifications

Entrepreneurs (n) ──── (1) Allies [assignedAllyId]
Entrepreneurs (1) ──── (n) Meetings
Entrepreneurs (1) ──── (n) Documents

Users (1) ──── (n) Messages [sender]
Users (1) ──── (n) Messages [receiver]
Users (1) ──── (n) Meetings [organizer]
Users (1) ──── (n) Documents [uploadedBy]
```

#### Migraciones

```bash
# Crear nueva migración
npx sequelize-cli migration:generate --name nombre-de-la-migracion

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Revertir última migración
npx sequelize-cli db:migrate:undo
```

### Testing

#### Backend
```bash
# Instalar dependencias de testing
npm install --save-dev jest supertest

# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage
```

#### Frontend
```bash
# Tests unitarios
npm test

# Tests e2e con Cypress
npm run cypress:open
```

### Debugging

#### Backend
```bash
# Debug con Inspector de Node.js
node --inspect src/app.js

# Debug en VS Code
# Crear configuración en .vscode/launch.json
```

#### Frontend
```bash
# React Developer Tools
# Instalar extensión del navegador

# Redux DevTools (si se usa Redux)
# Configurar en el store
```

## 🚀 Despliegue

### Entornos Recomendados

#### Desarrollo
- **Local**: Node.js + PostgreSQL + Redis locales
- **Docker**: Contenedores para servicios

#### Staging
- **Heroku**: Para despliegue rápido
- **Railway**: Alternativa moderna
- **DigitalOcean App Platform**: Escalabilidad media

#### Producción
- **AWS**: ECS + RDS + ElastiCache
- **Google Cloud**: App Engine + Cloud SQL + Memorystore
- **Azure**: App Service + Azure Database + Azure Cache

### Despliegue con Docker

#### Dockerfile Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### Dockerfile Frontend
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: icosystem
      POSTGRES_USER: icosystem
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  postgres_data:
```

### Variables de Entorno en Producción

#### Backend
```env
NODE_ENV=production
PORT=3000

# Base de datos
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=icosystem_prod
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_SSL=true

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_TLS=true

# URLs
FRONTEND_URL=https://your-domain.com
API_URL=https://api.your-domain.com
```

#### Frontend
```env
REACT_APP_API_URL=https://api.your-domain.com/api
REACT_APP_FIREBASE_API_KEY=your-production-api-key
# ... resto de configuración de Firebase
```

### CI/CD con GitHub Actions

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Tu script de despliegue
          echo "Deploying to production..."
```

### Monitoreo y Logging

#### Recomendaciones
- **Winston** para logging estructurado
- **PM2** para gestión de procesos
- **New Relic** o **DataDog** para APM
- **Sentry** para tracking de errores
- **Prometheus + Grafana** para métricas

#### Configuración de PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'icosystem-api',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

## 🤝 Contribución

### Cómo Contribuir

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Realiza** tus cambios
4. **Escribe** tests para tu código
5. **Ejecuta** todos los tests (`npm test`)
6. **Commit** tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
7. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
8. **Abre** un Pull Request

### Estándares de Código

#### Commits
Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: añadir sistema de notificaciones push
fix: corregir error en cálculo de monedas
docs: actualizar README con nuevas instrucciones
style: formatear código según ESLint
refactor: optimizar consultas de base de datos
test: añadir tests para módulo de reportes
chore: actualizar dependencias
```

#### Pull Requests
- **Título descriptivo** del cambio
- **Descripción detallada** de los cambios
- **Screenshots** si hay cambios de UI
- **Tests** que cubran los nuevos cambios
- **Documentación** actualizada si es necesario

### Reportar Bugs

Utiliza el template de issues para reportar bugs:

```markdown
**Descripción del Bug**
Una descripción clara y concisa del bug.

**Pasos para Reproducir**
1. Ve a '...'
2. Haz clic en '....'
3. Desplázate hasta '....'
4. Ver el error

**Comportamiento Esperado**
Descripción clara de lo que esperabas que pasara.

**Screenshots**
Si aplica, añade screenshots para ayudar a explicar el problema.

**Información del Entorno:**
- OS: [ej. iOS]
- Navegador [ej. chrome, safari]
- Versión [ej. 22]

**Contexto Adicional**
Añade cualquier otro contexto sobre el problema aquí.
```

### Changelog Recientes

#### v2.1.0 - Actualización de Seguridad (Septiembre 2025)
- ✅ **Auditoría completa de seguridad OWASP**
- ✅ **Rate limiting implementado**
- ✅ **Validación robusta de uploads**
- ✅ **Headers de seguridad con Helmet.js**
- ✅ **Logging estructurado con Winston**
- ✅ **Protección IDOR/BOLA**
- ✅ **Configuración de producción optimizada**
- ✅ **Documentación de seguridad actualizada**

#### v2.0.0 - Release Principal (Septiembre 2025)
- ✅ **Sistema completo de gestión de emprendimientos**
- ✅ **4 roles de usuario implementados**
- ✅ **Integración Firebase + Google APIs**
- ✅ **Dashboard interactivo por rol**
- ✅ **Sistema de mensajería en tiempo real**
- ✅ **Gestión de documentos y reuniones**
- ✅ **Conversión de monedas automática**

### Roadmap

#### Q1 2026
- [ ] Tests end-to-end con Cypress
- [ ] Integración con más APIs de videoconferencia
- [ ] Dashboard avanzado de analytics
- [ ] Notificaciones push móviles

#### Q2 2026
- [ ] Aplicación móvil (React Native)
- [ ] API GraphQL
- [ ] Integración con sistemas ERP
- [ ] Módulo de pagos

#### Q3 2026
- [ ] IA para recomendaciones
- [ ] Integración con redes sociales
- [ ] Marketplace de servicios
- [ ] Certificaciones automáticas

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ve el archivo [LICENSE](LICENSE) para más detalles.

### Links Útiles
- [Documentación de Firebase](https://firebase.google.com/docs)
- [Documentación de Google APIs](https://developers.google.com/apis-explorer)
- [Material-UI Components](https://mui.com/components/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Helmet.js Security Headers](https://helmetjs.github.io/)
- [Express Rate Limiting](https://github.com/nfriedly/express-rate-limit)

---

## 📋 Archivos de Documentación

- [README.md](README.md) - Documentación principal
- [QUICK_START.md](QUICK_START.md) - Guía de inicio rápido
- [PROYECTO_COMPLETADO.md](PROYECTO_COMPLETADO.md) - Estado del proyecto
- [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md) - Reporte de auditoría
- [docs/API.md](docs/API.md) - Documentación de API
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Guía de despliegue

---

## 🚀 Estado del Proyecto

**ESTADO ACTUAL: ✅ PRODUCCIÓN READY**

- ✅ **Funcionalidades completas**: 100%
- ✅ **Seguridad auditada**: OWASP Compliant
- ✅ **Documentación**: Completa
- ✅ **Dependencias**: Actualizadas (0 vulnerabilidades)
- ✅ **Configuración**: Optimizada para producción

**ICOsystem está listo para su implementación en producción** 🎉

