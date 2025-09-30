# 📦 Dependencias y Configuraciones - ICOsystem

**Versión**: v2.1.0  
**Última actualización**: Septiembre 2025  
**Estado de seguridad**: ✅ 0 vulnerabilidades

---

## 📋 Resumen de Dependencias

ICOsystem utiliza tecnologías modernas y seguras para garantizar un rendimiento óptimo y máxima seguridad. Todas las dependencias han pasado auditorías de seguridad.

### 🔒 Estado de Seguridad
```bash
npm audit summary:
✅ 0 vulnerabilities found
✅ All packages up to date
✅ No known security issues
```

---

## 🗄️ Backend - Node.js Dependencies

### 📊 Análisis de Dependencias de Producción

| Paquete | Versión | Propósito | Criticidad | Estado |
|---------|---------|-----------|------------|--------|
| **express** | ^5.1.0 | Framework web principal | 🔴 Alta | ✅ Seguro |
| **sequelize** | ^6.37.7 | ORM para PostgreSQL | 🔴 Alta | ✅ Seguro |
| **firebase-admin** | ^13.5.0 | Autenticación Backend | 🔴 Alta | ✅ Seguro |
| **helmet** | ^8.1.0 | **NUEVO** - Headers de seguridad | 🔴 Alta | ✅ Seguro |
| **express-rate-limit** | ^8.1.0 | **NUEVO** - Rate limiting | 🟡 Media | ✅ Seguro |
| **winston** | ^3.11.0 | **NUEVO** - Logging estructurado | 🟡 Media | ✅ Seguro |
| **pg** | ^8.16.3 | Driver PostgreSQL | 🔴 Alta | ✅ Seguro |
| **ioredis** | ^5.7.0 | Cliente Redis mejorado | 🟡 Media | ✅ Seguro |

### 🔧 Dependencias Core

#### **Framework y Servidor**
```json
{
  "express": "^5.1.0",
  "compression": "^1.8.1",
  "cors": "^2.8.5",
  "morgan": "^1.10.1"
}
```

**Configuraciones aplicadas:**
- **Express 5.x**: Última versión con mejoras de rendimiento
- **Compression**: Gzip automático para respuestas
- **CORS**: Configurado para orígenes específicos en producción
- **Morgan**: Logging de requests HTTP

#### **Seguridad (NUEVAS en v2.1.0)**
```json
{
  "helmet": "^8.1.0",
  "express-rate-limit": "^8.1.0",
  "bcryptjs": "^3.0.2"
}
```

**Configuraciones aplicadas:**
- **Helmet**: 11 headers de seguridad automáticos
- **Rate Limiting**: 100 requests/IP/15min
- **bcryptjs**: Hash seguro para contraseñas (futuro uso)

#### **Base de Datos**
```json
{
  "sequelize": "^6.37.7",
  "pg": "^8.16.3",
  "redis": "^5.8.2",
  "ioredis": "^5.7.0"
}
```

**Configuraciones aplicadas:**
- **Sequelize**: ORM con consultas parametrizadas
- **PostgreSQL**: Driver nativo optimizado
- **Redis**: Cache para conversión de monedas
- **ioRedis**: Cliente Redis con clustering support

#### **Autenticación**
```json
{
  "firebase-admin": "^13.5.0",
  "jsonwebtoken": "^9.0.2",
  "googleapis": "^160.0.0"
}
```

**Configuraciones aplicadas:**
- **Firebase Admin**: SDK oficial para verificación de tokens
- **JWT**: Tokens secundarios para sesiones internas
- **Google APIs**: Integración Calendar y Meet

#### **Utilidades**
```json
{
  "axios": "^1.12.2",
  "multer": "^2.0.2",
  "node-cron": "^4.2.1",
  "dotenv": "^17.2.2",
  "winston": "^3.11.0"
}
```

**Configuraciones aplicadas:**
- **Axios**: Cliente HTTP para APIs externas
- **Multer**: Upload seguro de archivos
- **Node-cron**: Tareas programadas (actualización de monedas)
- **Winston**: Logging estructurado y rotativo

### 🧪 Dependencias de Desarrollo

```json
{
  "nodemon": "^3.1.10",
  "eslint": "^8.57.0",
  "jest": "^29.7.0",
  "supertest": "^6.3.4"
}
```

**Propósito:**
- **Nodemon**: Hot-reload en desarrollo
- **ESLint**: Linting y estándares de código
- **Jest**: Framework de testing
- **Supertest**: Testing de APIs

---

## 🎨 Frontend - React Dependencies

### 📊 Análisis de Dependencias de Producción

| Paquete | Versión | Propósito | Criticidad | Estado |
|---------|---------|-----------|------------|--------|
| **react** | ^18.2.0 | Librería principal UI | 🔴 Alta | ✅ Seguro |
| **@mui/material** | ^6.1.9 | Componentes Material-UI | 🟡 Media | ✅ Seguro |
| **firebase** | ^12.3.0 | Auth cliente | 🔴 Alta | ✅ Seguro |
| **axios** | ^1.12.2 | Cliente HTTP | 🟡 Media | ✅ Seguro |
| **chart.js** | ^4.5.0 | Visualizaciones | 🟢 Baja | ✅ Seguro |

### 🔧 Dependencias Core

#### **Framework React**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^7.9.1",
  "typescript": "^4.9.5"
}
```

**Configuraciones aplicadas:**
- **React 18**: Concurrent features y Suspense
- **React Router 7**: Routing con loaders y actions
- **TypeScript**: Tipado estático para mejor DX

#### **UI Framework**
```json
{
  "@mui/material": "^6.1.9",
  "@mui/icons-material": "^6.1.9",
  "@mui/lab": "^6.0.0-beta.12",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1"
}
```

**Configuraciones aplicadas:**
- **Material-UI v6**: Última versión estable
- **Emotion**: CSS-in-JS optimizado
- **Icons**: Biblioteca completa de iconos
- **Lab**: Componentes experimentales

#### **Visualización de Datos**
```json
{
  "chart.js": "^4.5.0",
  "react-chartjs-2": "^5.3.0",
  "@mui/x-date-pickers": "^7.22.2",
  "date-fns": "^4.1.0"
}
```

**Configuraciones aplicadas:**
- **Chart.js**: Gráficos interactivos y responsive
- **Date Pickers**: Componentes de fecha avanzados
- **date-fns**: Manipulación de fechas liviana

#### **Firebase y Autenticación**
```json
{
  "firebase": "^12.3.0"
}
```

**Configuraciones aplicadas:**
- **Firebase SDK v12**: Auth, Analytics, Performance
- **Google OAuth**: Configurado con dominio específico
- **Persistence**: Configurado para mantener sesión

### 🧪 Dependencias de Testing

```json
{
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.8.0",
  "@testing-library/user-event": "^13.5.0",
  "@testing-library/dom": "^10.4.1"
}
```

**Configuraciones aplicadas:**
- **Testing Library**: Mejores prácticas para testing
- **User Events**: Simulación de interacciones reales
- **DOM Testing**: Utilities para DOM testing

---

## 🔧 Configuraciones Específicas

### 🗄️ Base de Datos - PostgreSQL

```sql
-- Configuraciones optimizadas de producción
-- postgresql.conf

# Conexiones
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB

# WAL y Checkpoint
wal_buffers = 16MB
checkpoint_completion_target = 0.9
checkpoint_timeout = 15min

# Logging
log_statement = 'mod'
log_min_duration_statement = 1000
log_line_prefix = '%m [%p] %q%u@%d '

# Seguridad
ssl = on
password_encryption = scram-sha-256
```

### 🔴 Redis - Cache

```redis
# redis.conf optimizado

# Red
bind 127.0.0.1 ::1
port 6379
timeout 300

# Memoria
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistencia
save 900 1
save 300 10
save 60 10000

# Seguridad
requirepass ${REDIS_PASSWORD}
rename-command FLUSHDB ""
rename-command FLUSHALL ""
```

### 🚀 Node.js - Runtime

```javascript
// backend/src/config/runtime.js
module.exports = {
  // V8 Optimizations
  node: {
    '--max-old-space-size': '2048',
    '--optimize-for-size': true,
    '--max-semi-space-size': '128'
  },
  
  // PM2 Configuration
  pm2: {
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=2048'
  }
};
```

---

## 🔒 Configuraciones de Seguridad

### 🛡️ Helmet.js - Headers de Seguridad

```javascript
// backend/src/app.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "*.googleapis.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "*.firebase.com", "*.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false // Para Google OAuth
}));
```

### 🚦 Rate Limiting

```javascript
// backend/src/middleware/rateLimiting.js
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Límites específicos
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutos
  5, // 5 intentos
  'Too many authentication attempts'
);

const uploadLimiter = createRateLimiter(
  60 * 1000, // 1 minuto
  10, // 10 uploads
  'Too many file uploads'
);
```

### 🔐 CORS - Configuración

```javascript
// backend/src/config/cors.js
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [
          'https://icosystem.com',
          'https://www.icosystem.com',
          'https://app.icosystem.com'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3001'
        ];
    
    // Permitir requests sin origen (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-CSRF-Token'
  ],
  maxAge: 86400 // 24 horas
};
```

---

## 📊 Monitoring y Logging

### 📝 Winston - Configuración de Logs

```javascript
// backend/src/utils/logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'icosystem-backend',
    version: process.env.npm_package_version
  },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined logs
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
    
    // Console en desarrollo
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});
```

### 🔍 Health Checks

```javascript
// backend/src/middleware/healthCheck.js
const healthCheck = async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    service: 'icosystem-backend',
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'unknown',
    redis: 'unknown'
  };

  try {
    // Check database
    await sequelize.authenticate();
    checks.database = 'connected';
  } catch (error) {
    checks.database = 'disconnected';
    checks.databaseError = error.message;
  }

  try {
    // Check Redis
    await redis.ping();
    checks.redis = 'connected';
  } catch (error) {
    checks.redis = 'disconnected';
    checks.redisError = error.message;
  }

  const isHealthy = checks.database === 'connected' && 
                   checks.redis === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'SERVICE_UNAVAILABLE',
    checks
  });
};
```

---

## 🔄 Scripts de Mantenimiento

### 📦 Actualización de Dependencias

```bash
#!/bin/bash
# scripts/update-dependencies.sh

echo "🔄 Actualizando dependencias de ICOsystem..."

# Backend
echo "📦 Actualizando backend..."
cd backend
npm update
npm audit fix
npm audit --audit-level=high

# Frontend
echo "🎨 Actualizando frontend..."
cd ../frontend
npm update
npm audit fix
npm audit --audit-level=high

# Verificar tests
echo "🧪 Ejecutando tests..."
cd ../backend && npm test
cd ../frontend && npm test

echo "✅ Dependencias actualizadas exitosamente!"
```

### 🔒 Auditoría de Seguridad

```bash
#!/bin/bash
# scripts/security-audit.sh

echo "🔒 Ejecutando auditoría de seguridad..."

# npm audit
echo "📦 Auditando dependencias..."
cd backend && npm audit --audit-level=moderate
cd ../frontend && npm audit --audit-level=moderate

# Verificar configuraciones
echo "⚙️ Verificando configuraciones..."
node scripts/verify-config.js

# Comprobar permisos de archivos
echo "📁 Verificando permisos de archivos..."
find . -name "*.env*" -exec ls -la {} \;
find . -name "*.key" -exec ls -la {} \;

echo "✅ Auditoría completada!"
```

---

## 📋 Checklist de Dependencias

### ✅ Verificaciones Regulares

#### Mensual
- [ ] `npm audit` en backend y frontend
- [ ] Actualizar dependencias patch/minor
- [ ] Verificar CVE en dependencias core
- [ ] Revisar logs de deprecación

#### Trimestral
- [ ] Actualizar dependencias major (con testing)
- [ ] Revisar nuevas dependencias disponibles
- [ ] Optimizar bundle size
- [ ] Actualizar herramientas de desarrollo

#### Anual
- [ ] Audit completo de dependencias
- [ ] Migración de dependencias deprecadas
- [ ] Evaluación de alternativas
- [ ] Actualización de runtime (Node.js)

### 🚨 Alertas Automáticas

```json
// .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
    assignees:
      - "security-team"
    reviewers:
      - "backend-team"
    
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    assignees:
      - "security-team"
    reviewers:
      - "frontend-team"
```

---

## 🔗 Enlaces de Referencia

### 📚 Documentación Oficial
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

### 🔒 Recursos de Seguridad
- [npm Security Advisories](https://www.npmjs.com/advisories)
- [Snyk Vulnerability Database](https://snyk.io/vuln/)
- [OWASP Node.js Security](https://owasp.org/www-project-nodejs-goat/)
- [Node Security Platform](https://nodesecurity.io/)

---

*Esta documentación se actualiza automáticamente con cada cambio de dependencias. Última verificación: 30 de septiembre, 2025*