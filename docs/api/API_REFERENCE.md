# 🔌 Referencia de API - ICOsystem

## URL Base

```
Desarrollo: http://localhost:3000/api
Producción: https://api.tudominio.com/api
```

## Autenticación

Todas las rutas excepto `/health` requieren autenticación mediante Token ID de Firebase:

```http
Authorization: Bearer <firebase-id-token>
```

---

## Endpoints

### 🔐 Autenticación (`/auth`)

#### POST /auth/register
Registrar nuevo usuario

**Cuerpo:**
```json
{
  "token": "firebase-id-token",
  "role": "entrepreneur|ally|client|super_user",
  "additionalData": {}
}
```

**Respuesta:** `200 OK`
```json
{
  "user": {...},
  "message": "Usuario registrado exitosamente"
}
```

#### POST /auth/login
Iniciar sesión

**Cuerpo:**
```json
{
  "token": "firebase-id-token"
}
```

**Respuesta:** `200 OK`
```json
{
  "user": {...},
  "message": "Inicio de sesión exitoso"
}
```

#### GET /auth/profile
Obtener perfil del usuario autenticado

**Respuesta:** `200 OK`
```json
{
  "id": "uuid",
  "email": "usuario@ejemplo.com",
  "name": "Usuario",
  "role": "entrepreneur",
  "entrepreneur": {...}
}
```

#### PUT /auth/profile
Actualizar perfil

**Cuerpo:**
```json
{
  "name": "Nuevo Nombre",
  "profilePicture": "url"
}
```

---

### 🚀 Emprendedor (`/entrepreneur`)

#### GET /entrepreneur/dashboard
Panel de control del emprendedor

**Respuesta:** `200 OK`
```json
{
  "entrepreneur": {...},
  "progress": 45,
  "currentStage": "ideacion",
  "trainingHours": 10,
  "upcomingMeetings": [...],
  "unreadMessages": 3
}
```

#### PUT /entrepreneur/lifecycle
Actualizar formulario de ciclo de vida

**Cuerpo:**
```json
{
  "stage": "ideacion",
  "responses": {
    "problem": "Descripción del problema",
    "validation": true,
    "prototype": false
  }
}
```

#### GET /entrepreneur/lifecycle/questions
Obtener preguntas por etapa

**Consulta:** `?stage=ideacion`

**Respuesta:** `200 OK`
```json
{
  "stage": "ideacion",
  "questions": [...]
}
```

---

### 📅 Reuniones (`/meetings`)

#### GET /meetings
Listar reuniones

**Consulta:**
- `page`: número de página (predeterminado: 1)
- `limit`: resultados por página (predeterminado: 10)
- `status`: scheduled|completed|cancelled

**Respuesta:** `200 OK`
```json
{
  "meetings": [...],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3
  }
}
```

#### POST /meetings
Crear reunión

**Body:**
```json
{
  "title": "Sesión de Mentoría",
  "description": "Revisión de plan de negocio",
  "startTime": "2025-01-15T10:00:00Z",
  "endTime": "2025-01-15T11:00:00Z",
  "entrepreneurId": "uuid",
  "createGoogleMeet": true
}
```

**Response:** `201 Created`
```json
{
  "meeting": {
    "id": "uuid",
    "googleMeetLink": "https://meet.google.com/...",
    ...
  }
}
```

#### PUT /meetings/:id
Actualizar reunión

**Body:**
```json
{
  "title": "Nuevo título",
  "status": "completed",
  "trainingHours": 2
}
```

#### DELETE /meetings/:id
Eliminar reunión

**Response:** `200 OK`

---

### 💬 Messages (`/messages`)

#### GET /messages/conversations
Listar conversaciones

**Response:** `200 OK`
```json
{
  "conversations": [
    {
      "user": {...},
      "lastMessage": {...},
      "unreadCount": 2
    }
  ]
}
```

#### GET /messages/:userId
Obtener mensajes con usuario

**Query:** `?limit=50&offset=0`

**Response:** `200 OK`
```json
{
  "messages": [...],
  "pagination": {...}
}
```

#### POST /messages
Enviar mensaje

**Body:**
```json
{
  "receiverId": "uuid",
  "content": "Hola, ¿cómo estás?",
  "messageType": "text"
}
```

#### PUT /messages/:id/read
Marcar mensaje como leído

---

### 📁 Documents (`/documents`)

#### GET /documents
Listar documentos

**Query:**
- `page`, `limit`: paginación
- `search`: búsqueda por texto
- `type`: filtrar por tipo
- `tags`: filtrar por etiquetas

**Response:** `200 OK`
```json
{
  "documents": [...],
  "pagination": {...}
}
```

#### POST /documents/upload
Subir documento

**Body:** `multipart/form-data`
- `document`: archivo (max 10MB)
- `title`: título
- `documentType`: tipo
- `isPublic`: boolean
- `tags`: string (separados por comas)

**Response:** `201 Created`

#### PUT /documents/:id
Actualizar metadatos

#### GET /documents/:id/download
Descargar documento

**Response:** `200 OK` (binary)

#### DELETE /documents/:id
Eliminar documento

---

### 📊 Reports (`/reports`)

#### GET /reports/impact-metrics
Métricas de impacto

**Query:** `?currency=COP|USD|EUR`

**Response:** `200 OK`
```json
{
  "metrics": {
    "totalEntrepreneurs": 100,
    "vulnerablePopulationPercentage": 45,
    "totalTrainingHours": 500,
    "totalInvestment": 30000000,
    "currency": "COP"
  },
  "stageDistribution": {...}
}
```

#### GET /reports/entrepreneur-directory
Directorio de emprendedores

**Response:** `200 OK`
```json
{
  "directory": [
    {
      "id": "uuid",
      "name": "Emprendedor",
      "currentStage": "ideacion",
      "progressPercentage": 30,
      ...
    }
  ]
}
```

#### GET /reports/progress-report
Generar reporte de progreso

**Query:** `?format=csv|json`

**Response:** `200 OK` (CSV o JSON)

---

## Códigos de Estado

- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado
- `400 Bad Request` - Datos inválidos
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - Sin permisos
- `404 Not Found` - Recurso no existe
- `429 Too Many Requests` - Rate limit excedido
- `500 Internal Server Error` - Error del servidor

## Rate Limiting

- **Auth:** 5 requests / 15 min
- **General:** 100 requests / 15 min
- **Upload:** 20 requests / hora
- **Messaging:** 30 requests / min
- **Reports:** 10 requests / min

## Ejemplos con cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"token": "firebase-token"}'

# Obtener dashboard
curl http://localhost:3000/api/entrepreneur/dashboard \
  -H "Authorization: Bearer firebase-token"

# Crear reunión
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer firebase-token" \
  -d '{
    "title": "Mentoría",
    "startTime": "2025-01-15T10:00:00Z",
    "endTime": "2025-01-15T11:00:00Z",
    "entrepreneurId": "uuid"
  }'
```

---

**Última actualización:** Octubre 2025
