# Documentación de Seguridad - ICOsystem

## Índice
1. [Resumen de Mejoras Implementadas](#resumen-de-mejoras-implementadas)
2. [Configuración de Seguridad](#configuración-de-seguridad)
3. [Vulnerabilidades Corregidas](#vulnerabilidades-corregidas)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Lista de Verificación para Despliegue](#lista-de-verificación-para-despliegue)
6. [Reportar Vulnerabilidades](#reportar-vulnerabilidades)

---

## Resumen de Mejoras Implementadas

### ✅ Autenticación y Autorización
- **Token Storage**: Tokens almacenados en memoria en lugar de localStorage (previene XSS)
- **Auto-refresh de tokens**: Renovación automática antes de expirar
- **Retry logic**: Reintento automático con token refrescado en caso de 401
- **Validación de permisos**: Verificación estricta de ownership en recursos

### ✅ Validación de Entrada
- **express-validator**: Validación de schemas para todos los endpoints
- **Sanitización automática**: Limpieza de inputs para prevenir inyecciones
- **Detección de ataques**: Patrones sospechosos bloqueados (SQL injection, XSS, path traversal)

### ✅ Seguridad de Archivos
- **Validación de contenido**: Verificación de magic numbers (no solo MIME type)
- **Sanitización de nombres**: Nombres de archivo limpiados de caracteres peligrosos
- **Path traversal protection**: Validación estricta de rutas de archivos
- **Límites de tamaño**: 10MB máximo por archivo
- **Estructura segura**: Archivos organizados por año/mes/usuario

### ✅ Rate Limiting
- **Por usuario autenticado**: Límites individuales, no solo por IP
- **Rate limits específicos**:
  - Auth: 5 intentos / 15 min
  - General: 100 requests / 15 min
  - Upload: 20 archivos / hora
  - Messaging: 30 mensajes / minuto
  - Reports: 10 requests / minuto

### ✅ Headers de Seguridad
- **Helmet configurado**: CSP, HSTS, noSniff, etc.
- **Headers adicionales**: X-Frame-Options, Referrer-Policy, Permissions-Policy
- **CORS estricto**: Solo orígenes permitidos con validación

### ✅ Logging y Monitoreo
- **Winston logger**: Logs estructurados con niveles
- **Security events**: Auditoría de intentos de acceso no autorizado
- **Error sanitization**: No se expone información sensible en producción

---

## Configuración de Seguridad

### Variables de Entorno Requeridas

#### Backend (.env)
```bash
# Seguridad
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Archivos
UPLOAD_PATH=/var/icosystem/uploads
MAX_FILE_SIZE=10485760

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=icosystem
DB_USER=icosystem_user
DB_PASSWORD=strong_password_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_here

# API Externa
EXCHANGE_RATE_API_KEY=your_api_key
```

#### Frontend (.env)
```bash
# API
REACT_APP_API_URL=https://api.yourdomain.com/api

# Firebase
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Instalación de Dependencias de Seguridad

```bash
cd backend
npm install express-validator express-mongo-sanitize

cd ../frontend
# No se requieren dependencias adicionales
```

---

## Vulnerabilidades Corregidas

### 🔴 CRÍTICAS (7 corregidas)

1. **XSS via localStorage**
   - **Antes**: Tokens en localStorage
   - **Ahora**: Tokens en memoria con auto-refresh

2. **SQL Injection**
   - **Antes**: Queries directas sin sanitización
   - **Ahora**: express-validator + sanitización automática

3. **Path Traversal en uploads**
   - **Antes**: Nombres de archivo sin validar
   - **Ahora**: Sanitización + validación de paths

4. **File Type Spoofing**
   - **Antes**: Solo validación de MIME type
   - **Ahora**: Validación de magic numbers

5. **Missing Authorization Checks**
   - **Antes**: Algunos endpoints sin verificar ownership
   - **Ahora**: Validación estricta en todos los recursos

6. **Información sensible en logs**
   - **Antes**: Errores completos expuestos
   - **Ahora**: Sanitización de errores en producción

7. **CORS permisivo**
   - **Antes**: Orígenes múltiples sin validación
   - **Ahora**: Whitelist con callback de validación

### 🟡 MEDIAS (5 corregidas)

1. **Rate Limiting por IP solamente**
   - **Ahora**: Rate limit por usuario autenticado

2. **Sin validación de schemas**
   - **Ahora**: express-validator en todas las rutas

3. **Helmet con configuración básica**
   - **Ahora**: CSP completo + políticas adicionales

4. **Timeout defaults de axios**
   - **Ahora**: Timeouts configurados (30s general, 60s uploads)

5. **Fetch sin interceptors**
   - **Ahora**: axios con interceptors y retry logic

---

## Mejores Prácticas

### Desarrollo

1. **Nunca commitear secretos**
   ```bash
   # Agregar al .gitignore
   .env
   .env.*
   *.pem
   *.key
   service-account*.json
   ```

2. **Actualizar dependencias regularmente**
   ```bash
   npm audit
   npm audit fix
   npm outdated
   ```

3. **Ejecutar linter antes de commit**
   ```bash
   npm run lint
   npm run lint:fix
   ```

### Producción

1. **Variables de entorno**
   - Usar gestor de secretos (AWS Secrets Manager, Azure Key Vault, etc.)
   - Rotar credenciales periódicamente
   - Separar secrets por ambiente

2. **Logs**
   - Configurar rotación de logs
   - No loggear información sensible (passwords, tokens, PII)
   - Monitorear logs de seguridad

3. **Backups**
   - Backups automáticos diarios de base de datos
   - Backups encriptados de archivos subidos
   - Procedimiento de restore documentado y probado

4. **Monitoreo**
   - Alertas para rate limit excedido repetidamente
   - Monitoreo de intentos de acceso no autorizado
   - Métricas de uso y performance

### Código

1. **Validación**
   - Siempre validar inputs del usuario
   - Usar schemas de validación
   - Sanitizar antes de procesar

2. **Errores**
   - No exponer stack traces en producción
   - Loggear errores internamente
   - Mensajes genéricos al cliente

3. **Archivos**
   - Validar tipo de archivo por contenido
   - Limitar tamaño
   - Escanear con antivirus en producción
   - Almacenar fuera del directorio web

---

## Lista de Verificación para Despliegue

### Pre-Despliegue

- [ ] Todas las variables de entorno configuradas
- [ ] Secretos rotados si es necesario
- [ ] `NODE_ENV=production` configurado
- [ ] CORS configurado con dominio de producción
- [ ] Firebase configurado con dominio correcto
- [ ] Base de datos respaldada
- [ ] Certificado SSL/TLS válido
- [ ] `npm audit` sin vulnerabilidades críticas
- [ ] Pruebas de seguridad pasando

### Post-Despliegue

- [ ] Verificar headers de seguridad (securityheaders.com)
- [ ] Probar limitación de tasa (rate limiting)
- [ ] Verificar que los errores no exponen información sensible
- [ ] Validar que las cargas de archivos funcionan correctamente
- [ ] Probar autenticación y autorización
- [ ] Verificar que los logs funcionan
- [ ] Configurar monitoreo y alertas
- [ ] Documentar procedimientos de respuesta a incidentes

### Mantenimiento Continuo

- [ ] Revisar logs de seguridad semanalmente
- [ ] Actualizar dependencias mensualmente
- [ ] Rotar secretos trimestralmente
- [ ] Auditoría de seguridad anual
- [ ] Revisar permisos de usuarios regularmente
- [ ] Limpiar archivos huérfanos mensualmente

---

## Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad en ICOsystem:

1. **NO** crear un issue público
2. Enviar email a: security@icosystem.com
3. Incluir:
   - Descripción de la vulnerabilidad
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de corrección (opcional)

### Proceso de Respuesta

1. **Confirmación**: Dentro de 48 horas
2. **Evaluación**: Dentro de 7 días
3. **Corrección**: Según criticidad
   - Crítica: 24-48 horas
   - Alta: 1 semana
   - Media: 2 semanas
   - Baja: 1 mes
4. **Divulgación**: Coordinado con quien reportó

---

## Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Registro de Cambios de Seguridad

### [2025-10-01] - Actualización Mayor de Seguridad

#### Agregado
- Middleware de validación con express-validator
- Middleware de seguridad avanzado
- Almacenamiento de tokens en memoria
- Limitación de tasa por usuario
- Detección de patrones de ataque
- Sanitización automática de entradas
- Validación de archivos por números mágicos (magic numbers)
- Registros estructurados con Winston
- Headers de seguridad mejorados

#### Cambiado
- Configuración de Helmet con CSP completo
- CORS con validación de callback
- Manejo de errores sanitizado
- Estructura de carpetas de cargas
- Interceptores de axios mejorados

#### Corregido
- Recorrido de rutas (path traversal) en cargas
- Inyección SQL en búsquedas
- XSS a través de localStorage
- Falta de verificaciones de autorización
- Falsificación de tipos de archivo
- Divulgación de información en errores
- CORS permisivo

---

**Última actualización**: 2025-10-01
**Versión del documento**: 1.0
