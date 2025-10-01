# 📚 Índice de Documentación - ICOsystem

## 📖 Documentación Principal

### Inicio Rápido
- **[README.md](README.md)** - Documentación principal del proyecto
  - Características principales
  - Arquitectura del sistema
  - Roles de usuario
  - Guía de instalación rápida
  - Scripts disponibles
  - Contribución

### Seguridad
- **[SECURITY.md](SECURITY.md)** - Documentación completa de seguridad
  - Auditoría OWASP
  - Vulnerabilidades corregidas
  - Configuración de seguridad
  - Reportar vulnerabilidades

### Cambios
- **[CHANGELOG.md](CHANGELOG.md)** - Historial de cambios del proyecto

---

## 📘 Guías de Usuario

### Instalación y Configuración
- **[docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md)**
  - Prerrequisitos
  - Instalación paso a paso
  - Configuración de servicios (PostgreSQL, Redis, Firebase)
  - Variables de entorno
  - Solución de problemas

### Manual de Usuario
- **[docs/guides/USER_MANUAL.md](docs/guides/USER_MANUAL.md)** *(próximamente)*
  - Guía para emprendedores
  - Guía para aliados
  - Guía para clientes
  - Guía para super usuarios

### Despliegue
- **[docs/guides/DEPLOYMENT.md](docs/guides/DEPLOYMENT.md)** *(próximamente)*
  - Despliegue con Docker
  - Despliegue en cloud (AWS, GCP, Azure)
  - Configuración de producción
  - Monitoreo y logs

---

## 👨‍💻 Guías de Desarrollo

### Desarrollo
- **[docs/guides/DEVELOPMENT.md](docs/guides/DEVELOPMENT.md)** *(próximamente)*
  - Configuración del entorno de desarrollo
  - Estructura del proyecto
  - Convenciones de código
  - Tests
  - Debugging

### Contribución
- **[CONTRIBUTING.md](CONTRIBUTING.md)** *(próximamente)*
  - Cómo contribuir
  - Proceso de Pull Request
  - Estándares de código
  - Reportar bugs

---

## 🔌 Documentación de API

### Referencia de API
- **[docs/api/API_REFERENCE.md](docs/api/API_REFERENCE.md)**
  - Endpoints completos
  - Autenticación
  - Ejemplos de uso
  - Códigos de respuesta
  - Rate limiting

### Autenticación
- **[docs/api/AUTHENTICATION.md](docs/api/AUTHENTICATION.md)** *(próximamente)*
  - Flujo de autenticación
  - Tokens Firebase
  - Gestión de sesiones
  - Roles y permisos

---

## 🏗️ Arquitectura

### Visión General
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** *(próximamente)*
  - Diagrama de arquitectura
  - Stack tecnológico
  - Patrones de diseño
  - Decisiones técnicas

### Base de Datos
- **[docs/DATABASE.md](docs/DATABASE.md)** *(próximamente)*
  - Esquema de base de datos
  - Modelos y relaciones
  - Migraciones
  - Índices y optimización

---

## 🛠️ Archivos de Configuración

### Variables de Entorno
- **[backend/.env.example](backend/.env.example)** - Template de variables backend
- **[frontend/.env.example](frontend/.env.example)** - Template de variables frontend

### Configuración del Proyecto
- **[.gitignore](.gitignore)** - Archivos ignorados por Git
- **[backend/package.json](backend/package.json)** - Dependencias backend
- **[frontend/package.json](frontend/package.json)** - Dependencias frontend

---

## 📦 Recursos Adicionales

### Scripts de Automatización
- `backend/scripts/setup.js` - Setup inicial del proyecto
- `backend/scripts/migrate.js` - Ejecutar migraciones
- `backend/scripts/seed.js` - Poblar datos de prueba

### Docker
- `docker-compose.yml` - Configuración Docker para desarrollo
- `Dockerfile.backend` - Imagen Docker del backend
- `Dockerfile.frontend` - Imagen Docker del frontend

---

## 🔗 Enlaces Útiles

### Documentación Externa
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Cloud APIs](https://cloud.google.com/apis/docs/overview)
- [Material-UI](https://mui.com/material-ui/getting-started/)
- [Sequelize ORM](https://sequelize.org/docs/v6/)
- [Express.js](https://expressjs.com/)
- [React Router](https://reactrouter.com/)

### Seguridad
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js](https://helmetjs.github.io/)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## 📋 Checklist de Documentación

### Para Desarrolladores
- ✅ README principal
- ✅ Guía de instalación
- ✅ Referencia de API
- ✅ Documentación de seguridad
- ⏳ Guía de desarrollo (en progreso)
- ⏳ Arquitectura del sistema (en progreso)

### Para Usuarios
- ⏳ Manual de usuario (planificado)
- ⏳ FAQs (planificado)
- ⏳ Tutoriales en video (planificado)

### Para Operaciones
- ⏳ Guía de despliegue (planificado)
- ⏳ Guía de monitoreo (planificado)
- ⏳ Runbook de incidentes (planificado)

---

## 🤝 Contribuir a la Documentación

Si encuentras errores o quieres mejorar la documentación:

1. Fork el repositorio
2. Crea una rama (`git checkout -b docs/mejora-documentacion`)
3. Realiza tus cambios
4. Commit (`git commit -m 'docs: mejorar sección X'`)
5. Push (`git push origin docs/mejora-documentacion`)
6. Abre un Pull Request

---

**Última actualización:** Octubre 2025
**Versión:** 2.1.0
