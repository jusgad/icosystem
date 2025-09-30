# 📡 ICOsystem API Documentation

**Versión**: v2.1.0  
**Base URL**: `http://localhost:3000/api` (desarrollo) | `https://api.icosystem.com/api` (producción)  
**Autenticación**: Firebase ID Token (Bearer)

---

## 🔐 Autenticación

Todas las rutas requieren autenticación excepto las rutas públicas. Incluye el token Firebase en el header:

```http
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

### Obtener Token (Frontend)
```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
if (user) {
  const token = await user.getIdToken();
  // Usar token en requests
}
```

---

## 👥 Autenticación y Usuarios (`/api/auth`)

### POST `/register`
Registrar nuevo usuario en el sistema.

**Body:**
```json
{
  "token": "firebase-id-token",
  "role": "entrepreneur|ally|client",
  "additionalData": {
    "personalInfo": {},
    "isVulnerablePopulation": false,
    "specialization": "string",
    "organization": "string"
  }
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Usuario",
    "role": "entrepreneur",
    "isActive": true,
    "entrepreneur": {...}
  }
}
```

### POST `/login`
Iniciar sesión con token Firebase.

**Body:**
```json
{
  "token": "firebase-id-token"
}
```

### GET `/profile`
🔒 **Requiere autenticación**  
Obtener perfil del usuario actual.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Usuario",
    "role": "entrepreneur",
    "entrepreneur": {
      "currentStage": "ideacion",
      "progressPercentage": 45,
      "trainingHours": 12.5
    }
  }
}
```

### PUT `/profile`
🔒 **Requiere autenticación**  
Actualizar perfil del usuario.

**Body:**
```json
{
  "name": "Nuevo Nombre",
  "profilePicture": "url",
  "additionalData": {
    "personalInfo": {"phone": "+57123456789"}
  }
}
```

---

## 🚀 Emprendedores (`/api/entrepreneur`)

### GET `/dashboard`
🔒 **Requiere rol**: `entrepreneur`  
Dashboard personalizado del emprendedor.

**Response:**
```json
{
  "entrepreneur": {
    "id": "uuid",
    "currentStage": "ideacion",
    "progressPercentage": 45,
    "trainingHours": 12.5
  },
  "progress": {
    "percentage": 45,
    "currentStage": "ideacion",
    "trainingHours": 12.5
  },
  "investment": {
    "totalHours": 12.5,
    "costPerHour": 6000,
    "totalInvestment": 75000
  },
  "upcomingMeetings": [...]
}
```

### PUT `/lifecycle`
🔒 **Requiere rol**: `entrepreneur`  
Actualizar formulario de ciclo de vida.

**Body:**
```json
{
  "stage": "ideacion|preincubacion|incubacion|aceleracion|consolidacion",
  "responses": {
    "problem": "Descripción del problema",
    "validation": true,
    "prototype": false
  }
}
```

**Response:**
```json
{
  "message": "Lifecycle form updated successfully",
  "entrepreneur": {...},
  "progress": 60
}
```

### GET `/lifecycle/questions`
🔒 **Requiere rol**: `entrepreneur`  
Obtener preguntas por etapa del ciclo de vida.

**Response:**
```json
{
  "questions": {
    "ideacion": [
      {
        "id": "problem",
        "question": "¿Cuál es el problema principal que resuelve?",
        "type": "text"
      }
    ],
    "preincubacion": [...],
    "incubacion": [...],
    "aceleracion": [...],
    "consolidacion": [...]
  }
}
```

---

## 📅 Reuniones (`/api/meetings`)

### POST `/`
🔒 **Requiere autenticación**  
Crear nueva reunión.

**Body:**
```json
{
  "title": "Sesión de Mentoría",
  "description": "Revisión de plan de negocio",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "entrepreneurId": "uuid-emprendedor",
  "createGoogleMeet": true,
  "accessToken": "google-access-token",
  "attendees": ["email1@example.com"]
}
```

**Response:**
```json
{
  "message": "Meeting created successfully",
  "meeting": {
    "id": "uuid",
    "title": "Sesión de Mentoría",
    "googleMeetLink": "https://meet.google.com/abc-def-ghi",
    "startTime": "2024-01-15T10:00:00Z",
    "organizer": {...},
    "entrepreneur": {...}
  }
}
```

### GET `/`
🔒 **Requiere autenticación**  
Listar reuniones filtradas por rol.

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 20)
- `status` (string): Estado de la reunión
- `startDate` (string): Fecha inicio filtro
- `endDate` (string): Fecha fin filtro

**Response:**
```json
{
  "meetings": [
    {
      "id": "uuid",
      "title": "Reunión",
      "startTime": "2024-01-15T10:00:00Z",
      "status": "scheduled",
      "organizer": {...},
      "entrepreneur": {...}
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### PUT `/:id`
🔒 **Requiere autenticación + permisos**  
Actualizar reunión existente.

**Permisos**: 
- Super usuario: todas las reuniones
- Organizador: sus reuniones
- Aliado: reuniones de emprendedores asignados

**Body:**
```json
{
  "title": "Nuevo título",
  "status": "completed",
  "notes": "Notas de la reunión",
  "trainingHours": 2.5
}
```

### DELETE `/:id`
🔒 **Requiere permisos**: `super_user` o organizador  
Eliminar reunión.

### GET `/upcoming`
🔒 **Requiere autenticación**  
Próximas reuniones del usuario.

**Query Parameters:**
- `limit` (number): Número de reuniones (default: 5)

### GET `/entrepreneurs`
🔒 **Requiere autenticación**  
Emprendedores disponibles para reuniones.

**Permisos**:
- `ally`: Solo emprendedores asignados
- `super_user`: Todos los emprendedores
- Otros roles: Array vacío

---

## 💬 Mensajería (`/api/messages`)

### GET `/conversations`
🔒 **Requiere autenticación**  
Listar conversaciones del usuario.

**Response:**
```json
{
  "conversations": [
    {
      "userId": "uuid",
      "userName": "Contacto",
      "lastMessage": "Último mensaje",
      "lastMessageTime": "2024-01-15T10:00:00Z",
      "unreadCount": 3
    }
  ]
}
```

### GET `/:userId`
🔒 **Requiere autenticación**  
Mensajes con usuario específico.

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "content": "Contenido del mensaje",
      "senderId": "uuid",
      "receiverId": "uuid",
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST `/`
🔒 **Requiere autenticación**  
Enviar nuevo mensaje.

**Body:**
```json
{
  "receiverId": "uuid-destinatario",
  "content": "Contenido del mensaje"
}
```

### PUT `/:id/read`
🔒 **Requiere autenticación**  
Marcar mensaje como leído.

### GET `/search-users`
🔒 **Requiere autenticación**  
Buscar usuarios para mensajería.

**Query Parameters:**
- `query` (string): Término de búsqueda

---

## 📁 Documentos (`/api/documents`)

### POST `/upload`
🔒 **Requiere autenticación**  
Subir nuevo documento.

**Content-Type**: `multipart/form-data`

**Body:**
```javascript
const formData = new FormData();
formData.append('document', file);
formData.append('title', 'Título del documento');
formData.append('documentType', 'business_plan');
formData.append('isPublic', 'false');
formData.append('tags', 'plan,negocio,estrategia');
```

**Tipos de archivo permitidos:**
- PDF: `application/pdf`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- PowerPoint: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- Imágenes: `image/jpeg`, `image/png`, `image/gif`
- Texto: `text/plain`

**Límite de tamaño**: 10MB

### GET `/`
🔒 **Requiere autenticación**  
Listar documentos filtrados por rol.

**Query Parameters:**
- `page`, `limit`: Paginación
- `type`: Tipo de documento
- `tags`: Tags separados por comas
- `search`: Búsqueda en título/nombre

**Permisos por rol:**
- `entrepreneur`: Sus documentos
- `ally`: Documentos de emprendedores asignados
- `client`: Solo documentos públicos
- `super_user`: Todos los documentos

### GET `/:id/download`
🔒 **Requiere autenticación + permisos**  
Descargar documento.

### PUT `/:id`
🔒 **Requiere permisos**: `super_user` o propietario  
Actualizar metadatos del documento.

### DELETE `/:id`
🔒 **Requiere permisos**: `super_user` o propietario  
Eliminar documento.

### GET `/types`
🔒 **Requiere autenticación**  
Tipos de documento disponibles.

**Response:**
```json
{
  "types": [
    {"value": "business_plan", "label": "Plan de Negocio"},
    {"value": "financial_report", "label": "Reporte Financiero"},
    {"value": "presentation", "label": "Presentación"},
    {"value": "legal_document", "label": "Documento Legal"},
    {"value": "other", "label": "Otro"}
  ]
}
```

---

## 📊 Reportes (`/api/reports`)

### GET `/impact-metrics`
🔒 **Requiere autenticación**  
Métricas de impacto del sistema.

**Response:**
```json
{
  "totalEntrepreneurs": 150,
  "vulnerablePopulationPercentage": 35,
  "totalTrainingHours": 2500,
  "totalInvestment": {
    "COP": 15000000,
    "USD": 3750,
    "EUR": 3500
  },
  "stageDistribution": {
    "ideacion": 45,
    "preincubacion": 35,
    "incubacion": 25,
    "aceleracion": 15,
    "consolidacion": 8
  }
}
```

### GET `/entrepreneur-directory`
🔒 **Requiere autenticación**  
Directorio de emprendedores.

**Query Parameters:**
- `stage`: Filtrar por etapa
- `vulnerable`: Filtrar población vulnerable
- `search`: Búsqueda por nombre

### GET `/progress-report`
🔒 **Requiere autenticación**  
Reporte de progreso en formato CSV.

**Response**: Archivo CSV descargable

### GET `/activity-metrics`
🔒 **Requiere autenticación**  
Métricas de actividad del sistema.

---

## 🏥 Salud del Sistema

### GET `/health`
**Público** - Verificar estado del sistema.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:00:00Z",
  "environment": "production"
}
```

---

## 🚫 Códigos de Error

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 400 | Bad Request | Datos inválidos en la petición |
| 401 | Unauthorized | Token de autenticación requerido |
| 403 | Forbidden | Permisos insuficientes |
| 404 | Not Found | Recurso no encontrado |
| 413 | Payload Too Large | Archivo muy grande |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error interno del servidor |

### Estructura de Error
```json
{
  "error": "Descripción del error",
  "message": "Detalles adicionales (solo en desarrollo)"
}
```

---

## 🔄 Rate Limiting

**Límite Global**: 100 requests por IP cada 15 minutos

**Headers de respuesta:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640181600
```

---

## 📝 Ejemplos de Uso

### Autenticación Completa
```javascript
// 1. Obtener token de Firebase
const auth = getAuth();
const user = await signInWithPopup(auth, googleProvider);
const token = await user.getIdToken();

// 2. Registrar/Login en ICOsystem
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ token })
});

// 3. Usar token en requests posteriores
const profileResponse = await fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Subir Documento
```javascript
const formData = new FormData();
formData.append('document', file);
formData.append('title', 'Mi Plan de Negocio');
formData.append('documentType', 'business_plan');

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Crear Reunión con Google Meet
```javascript
const meetingData = {
  title: 'Sesión de Mentoría',
  description: 'Revisión mensual de progreso',
  startTime: '2024-01-15T10:00:00Z',
  endTime: '2024-01-15T11:00:00Z',
  entrepreneurId: 'entrepreneur-uuid',
  createGoogleMeet: true,
  accessToken: googleAccessToken
};

const response = await fetch('/api/meetings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(meetingData)
});
```

---

## 🔧 Configuración del Cliente

### Headers Recomendados
```javascript
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'X-Requested-With': 'XMLHttpRequest'
};
```

### Manejo de Errores
```javascript
const handleApiError = (response) => {
  if (response.status === 401) {
    // Redirigir a login
    window.location.href = '/login';
  } else if (response.status === 429) {
    // Mostrar mensaje de rate limit
    alert('Demasiadas peticiones, intenta más tarde');
  }
  // Manejar otros errores...
};
```

---

## 📋 Changelog API

### v2.1.0 (Septiembre 2025)
- ✅ **Seguridad**: Rate limiting implementado
- ✅ **Seguridad**: Validación robusta de archivos
- ✅ **Seguridad**: Headers de seguridad mejorados
- ✅ **Mejora**: Logging estructurado
- ✅ **Mejora**: Manejo de errores optimizado

### v2.0.0 (Septiembre 2025)
- ✅ **Inicial**: API completa implementada
- ✅ **Autenticación**: Firebase + roles
- ✅ **Módulos**: Auth, Entrepreneur, Meetings, Messages, Documents, Reports
- ✅ **Integraciones**: Google Meet, Exchange Rate API

---

*Para más información, consultar el [README principal](../README.md) o el [reporte de seguridad](SECURITY_AUDIT.md).*