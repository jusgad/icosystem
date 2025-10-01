# 🚀 ICOsystem - Plataforma de Gestión Integral de Emprendimientos

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://www.postgresql.org/)
[![Security](https://img.shields.io/badge/Security-Audited-brightgreen.svg)](SECURITY.md)
[![OWASP](https://img.shields.io/badge/OWASP-Compliant-success.svg)](https://owasp.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**ICOsystem** es una plataforma web diseñada para la gestión integral del ciclo de vida de emprendimientos, conectando emprendedores, aliados, clientes y administradores en un ecosistema colaborativo.

##  Inicio Rápido

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/icosystem.git
cd icosystem

# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Editar archivos .env con tus credenciales

# Iniciar servicios
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start
```

**URLs de desarrollo:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api

📚 **Ver documentación completa:** [docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md)

---

## 🌟 Características Principales

### 🔐 Autenticación y Seguridad
- **Firebase Authentication** con Google OAuth 2.0
- **Sistema de roles** granular (Super Usuario, Emprendedor, Aliado, Cliente)
- **Token storage seguro** en memoria (previene XSS)
- **Rate limiting** por usuario
- **Validación robusta** de inputs con express-validator
- **Headers de seguridad** con Helmet.js configurado
- **Auditoría OWASP** Top 10 completa ✅

### 📊 Gestión del Ciclo de Vida
**5 Etapas de desarrollo** con formularios dinámicos:
1. **Ideación** - Validación de problema y prototipo
2. **Pre-incubación** - Modelo de negocio y pruebas piloto
3. **Incubación** - Plan financiero y equipo formalizado
4. **Aceleración** - Inversión externa y crecimiento
5. **Consolidación** - Ingresos recurrentes y escalabilidad

### 💬 Comunicación Integrada
- **Mensajería interna** en tiempo real
- **Integración Google Meet** para videoconferencias
- **Calendario compartido** con notificaciones
- **Búsqueda de usuarios** y conversaciones

### 📁 Gestión de Documentos
- **Upload seguro** con validación de contenido
- **Control de acceso** basado en roles
- **Organización automática** por fecha y usuario
- **Documentos públicos/privados**
- **Path traversal protection**

### 💰 Sistema Financiero
- **Conversión de monedas** en tiempo real (COP, USD, EUR)
- **Cálculo automático** de inversiones en capacitación
- **Dashboard de impacto** con métricas clave
- **Reportes descargables** (CSV)

---

## 🏗️ Arquitectura

### Stack Tecnológico

**Backend**
- Node.js 18+ & Express.js
- PostgreSQL 15+ (Sequelize ORM)
- Redis (cache)
- Firebase Admin SDK
- Google APIs (Meet, Calendar)

**Frontend**
- React 18+ & TypeScript
- Material-UI v6
- Chart.js
- React Router
- Axios con interceptors

**Seguridad**
- express-validator
- express-mongo-sanitize
- Helmet.js
- express-rate-limit
- Winston (logging)

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────┐
│              Cliente Web                     │
│         (React + TypeScript)                 │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────┐
│           API Gateway (Express)              │
│  ┌────────┬────────┬────────┬────────┐     │
│  │ Auth   │ Meet   │Currency│ Upload │     │
│  │Service │Service │Service │Service │     │
│  └────────┴────────┴────────┴────────┘     │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐  ┌─────▼─────┐  ┌────▼────┐
│PostreSQL│  │   Redis   │  │ Firebase│
│  (Main) │  │  (Cache)  │  │  (Auth) │
└─────────┘  └───────────┘  └─────────┘
```

📚 **Ver arquitectura detallada:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 👥 Roles de Usuario

### 🔧 Super Usuario
- Gestión completa de usuarios
- Asignación de aliados a emprendedores
- Configuración global del sistema
- Acceso a todas las métricas

### 🚀 Emprendedor
- Completar formularios de ciclo de vida
- Dashboard personalizado con progreso
- Gestión de reuniones y documentos
- Mensajería con aliados

### 🤝 Aliado
- Dashboard de emprendimientos asignados
- Registro de horas de capacitación
- Calendario y videoconferencias
- Seguimiento de progreso

### 📊 Cliente
- Dashboard de impacto y métricas
- Conversión de monedas
- Reportes descargables
- Directorio de emprendimientos

---

## 📚 Documentación

### Guías
- 📖 [Instalación y Configuración](docs/guides/INSTALLATION.md)
- 👨‍💻 [Guía de Desarrollo](docs/guides/DEVELOPMENT.md)
- 📱 [Manual de Usuario](docs/guides/USER_MANUAL.md)

### API
- 🔌 [Referencia de API](docs/api/API_REFERENCE.md)
- 🔐 [Autenticación](docs/api/AUTHENTICATION.md)

### Operaciones
- 🚀 [Despliegue](docs/guides/DEPLOYMENT.md)
- 🔒 [Seguridad](SECURITY.md)
- 📝 [Changelog](CHANGELOG.md)

---

## 🔒 Seguridad

ICOsystem ha pasado una **auditoría completa de seguridad** basada en OWASP Top 10:

### ✅ Vulnerabilidades Mitigadas
- **A01 - Broken Access Control**: Authorization granular + ownership validation
- **A02 - Cryptographic Failures**: Firebase + HTTPS + tokens en memoria
- **A03 - Injection**: Sequelize ORM + input validation + sanitization
- **A05 - Security Misconfiguration**: Helmet.js + CORS + rate limiting
- **A06 - Vulnerable Components**: 0 vulnerabilidades (npm audit)

### 🛡️ Funciones de Seguridad
- Rate limiting por usuario (no solo IP)
- Validación de archivos por contenido (magic numbers)
- Path traversal protection
- Detección de patrones de ataque
- Logging de eventos de seguridad
- Error sanitization en producción

**Estado:** 🟢 **SEGURO - Listo para Producción**

Ver el [reporte completo de seguridad](SECURITY.md) para más detalles.

---

## 🛠️ Desarrollo

### Estructura del Proyecto

```
icosystem/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuraciones (DB, Redis, Firebase)
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── middleware/       # Auth, validation, security
│   │   ├── models/           # Modelos Sequelize
│   │   ├── routes/           # Definición de rutas
│   │   ├── services/         # Servicios externos
│   │   └── utils/            # Utilidades y helpers
│   ├── uploads/              # Archivos subidos (gitignored)
│   ├── logs/                 # Logs de aplicación
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── contexts/         # Context API (Auth, etc)
│   │   ├── services/         # API clients
│   │   ├── config/           # Configuración Firebase
│   │   └── utils/            # Utilidades y helpers
│   └── package.json
├── docs/                     # Documentación
│   ├── api/                  # Docs de API
│   └── guides/               # Guías y manuales
├── SECURITY.md               # Documentación de seguridad
├── CHANGELOG.md              # Historial de cambios
└── README.md                 # Este archivo
```

### Scripts Disponibles

**Backend:**
```bash
npm run dev         # Desarrollo con nodemon
npm start           # Producción
npm run setup       # Setup inicial de BD
npm run db:migrate  # Ejecutar migraciones
npm test            # Tests
npm run lint        # Linter
```

**Frontend:**
```bash
npm start           # Servidor de desarrollo
npm run build       # Build de producción
npm test            # Tests
```

### Convenciones de Código

- **ESLint** para JavaScript/TypeScript
- **Camel case** para variables y funciones
- **Pascal case** para componentes y clases
- **Async/await** preferido sobre Promises
- **JSDoc** para documentación de funciones
- **Validación** de inputs en todas las rutas
- **Manejo de errores** consistente

---

## 🚀 Despliegue

### Prerrequisitos de Producción

- Node.js 18+ en servidor
- PostgreSQL 15+ (managed service recomendado)
- Redis 7+ (managed service recomendado)
- Dominio con SSL/TLS
- Firebase proyecto configurado
- Google Cloud proyecto con APIs habilitadas

### Opción 1: Docker

```bash
# Build y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Opción 2: Manual

```bash
# Backend
cd backend
npm ci --only=production
NODE_ENV=production npm start

# Frontend (nginx)
cd frontend
npm ci
npm run build
# Servir carpeta build/ con nginx
```

### Variables de Entorno de Producción

Ver [docs/guides/DEPLOYMENT.md](docs/guides/DEPLOYMENT.md) para configuración completa.

**Checklist de seguridad:**
- ✅ `NODE_ENV=production`
- ✅ Secrets en gestor de secretos (no .env)
- ✅ HTTPS configurado
- ✅ Firewall y security groups
- ✅ Backups automáticos
- ✅ Monitoreo y alertas
- ✅ Rate limiting activado
- ✅ Logs rotación configurada

---

## 🤝 Contribución

### Cómo Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios con tests
4. Commit (`git commit -m 'feat: añadir nueva funcionalidad'`)
5. Push (`git push origin feature/nueva-funcionalidad`)
6. Abre un Pull Request

### Estándares

Usamos [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo de código
refactor: refactorización
test: añadir tests
chore: tareas de mantenimiento
```

### Reportar Issues

- Usa el template de issues
- Incluye pasos para reproducir
- Agrega screenshots si aplica
- Especifica entorno (OS, versión, etc)

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 📞 Soporte

- 📧 Email: support@icosystem.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/icosystem/issues)
- 📖 Docs: [Documentation](docs/)
- 🔒 Security: [Security Policy](SECURITY.md)

---

## ⭐ Agradecimientos

- [Firebase](https://firebase.google.com/) por autenticación
- [Material-UI](https://mui.com/) por componentes
- [Chart.js](https://www.chartjs.org/) por visualizaciones
- [OWASP](https://owasp.org/) por guías de seguridad

---

**Última actualización:** Octubre 2025
**Versión:** 2.1.0
**Estado:** ✅ Producción Ready
