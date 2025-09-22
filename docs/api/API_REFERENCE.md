# 📚 ICOsystem API Reference

## 🔗 Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.icosystem.com/api`

## 🔐 Authentication

Todas las rutas requieren autenticación vía Firebase Token excepto las rutas públicas.

### Headers Requeridos
```http
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

### Obtener Token
```javascript
// Frontend - Obtener token de Firebase
import { auth } from './config/firebase';

const user = auth.currentUser;
if (user) {
  const token = await user.getIdToken();
  // Usar token en requests
}
```

## 📋 Endpoints por Módulo

### 🔐 Authentication (`/api/auth`)

#### `POST /auth/register`
Registra un nuevo usuario en el sistema.

**Request Body:**
```json
{
  "token": "firebase-id-token",
  "role": "entrepreneur|ally|client",
  "additionalData": {
    "personalInfo": {},
    "isVulnerablePopulation": false,
    "specialization": "string",
    "experience": "string",
    "expertise": ["string"],
    "organization": "string",
    "sector": "string",
    "interests": ["string"]
  }
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "firebaseUid": "string",
    "email": "string",
    "name": "string",
    "role": "entrepreneur",
    "profilePicture": "string",
    "isActive": true,
    "entrepreneur": {
      "id": "uuid",
      "personalInfo": {},
      "isVulnerablePopulation": false,
      "currentStage": "ideacion",
      "progressPercentage": 0,
      "trainingHours": 0
    }
  }
}
```

#### `POST /auth/login`
Inicia sesión con token de Firebase.

**Request Body:**
```json
{
  "token": "firebase-id-token"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "firebaseUid": "string",
    "email": "string",
    "name": "string",
    "role": "entrepreneur",
    "profilePicture": "string",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

#### `GET /auth/profile`
Obtiene el perfil del usuario autenticado.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "entrepreneur",
    "entrepreneur": {
      "id": "uuid",
      "currentStage": "ideacion",
      "progressPercentage": 25,
      "trainingHours": 10.5
    }
  }
}
```

#### `PUT /auth/profile`
Actualiza el perfil del usuario.

**Request Body:**
```json
{
  "name": "string",
  "profilePicture": "string",
  "additionalData": {
    "personalInfo": {},
    "specialization": "string"
  }
}
```

### 🚀 Entrepreneur (`/api/entrepreneur`)

#### `GET /entrepreneur/dashboard`
Obtiene datos del dashboard del emprendedor.

**Response:**
```json
{
  "entrepreneur": {
    "id": "uuid",
    "currentStage": "ideacion",
    "progressPercentage": 40,
    "trainingHours": 15.5,
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "assignedAlly": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  },
  "progress": {
    "percentage": 40,
    "currentStage": "ideacion",
    "trainingHours": 15.5
  },
  "investment": {
    "totalHours": 15.5,
    "costPerHour": 6000,
    "totalInvestment": 93000
  },
  "upcomingMeetings": [
    {
      "id": "uuid",
      "title": "Sesión de Mentoría",
      "startTime": "2024-01-20T14:00:00Z",
      "status": "scheduled"
    }
  ]
}
```

#### `PUT /entrepreneur/lifecycle`
Actualiza el formulario de ciclo de vida.

**Request Body:**
```json
{
  "stage": "ideacion",
  "responses": {
    "problem": "Dificultad para encontrar parking",
    "validation": true,
    "prototype": false
  }
}
```

**Response:**
```json
{
  "message": "Lifecycle form updated successfully",
  "entrepreneur": {
    "id": "uuid",
    "currentStage": "ideacion",
    "progressPercentage": 60,
    "lifecycleResponses": {
      "ideacion": {
        "problem": "Dificultad para encontrar parking",
        "validation": true,
        "prototype": false
      }
    }
  },
  "progress": 60
}
```

#### `GET /entrepreneur/lifecycle/questions`
Obtiene las preguntas del formulario de ciclo de vida.

**Response:**
```json
{
  "questions": {
    "ideacion": [
      {
        "id": "problem",
        "question": "¿Cuál es el problema principal que resuelve?",
        "type": "text"
      },
      {
        "id": "validation",
        "question": "¿Ha validado la necesidad?",
        "type": "boolean"
      }
    ],
    "preincubacion": [...]
  }
}
```

### 📅 Meetings (`/api/meetings`)

#### `GET /meetings`
Lista reuniones del usuario.

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Elementos por página (default: 20)
- `status` (string): Filtrar por estado
- `startDate` (string): Fecha de inicio (ISO 8601)
- `endDate` (string): Fecha de fin (ISO 8601)

**Response:**
```json
{
  "meetings": [
    {
      "id": "uuid",
      "title": "Sesión de Mentoría",
      "description": "Revisión de plan de negocio",
      "startTime": "2024-01-15T14:00:00Z",
      "endTime": "2024-01-15T15:00:00Z",
      "googleMeetLink": "https://meet.google.com/abc-defg-hij",
      "status": "scheduled",
      "organizer": {
        "id": "uuid",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "entrepreneur": {
        "id": "uuid",
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
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

#### `POST /meetings`
Crea una nueva reunión.

**Request Body:**
```json
{
  "title": "Sesión de Mentoría",
  "description": "Revisión de plan de negocio",
  "startTime": "2024-01-20T14:00:00Z",
  "endTime": "2024-01-20T15:00:00Z",
  "entrepreneurId": "uuid",
  "attendees": ["email1@example.com", "email2@example.com"],
  "createGoogleMeet": true,
  "accessToken": "google-oauth-token"
}
```

**Response:**
```json
{
  "message": "Meeting created successfully",
  "meeting": {
    "id": "uuid",
    "title": "Sesión de Mentoría",
    "googleMeetLink": "https://meet.google.com/abc-defg-hij",
    "organizer": {
      "name": "Jane Smith"
    }
  }
}
```

#### `PUT /meetings/:id`
Actualiza una reunión existente.

**Request Body:**
```json
{
  "title": "Sesión de Mentoría Actualizada",
  "status": "completed",
  "notes": "Se revisó el plan de negocio completamente",
  "trainingHours": 1.5
}
```

#### `DELETE /meetings/:id`
Elimina una reunión.

**Response:**
```json
{
  "message": "Meeting deleted successfully"
}
```

#### `GET /meetings/upcoming`
Obtiene próximas reuniones del usuario.

**Query Parameters:**
- `limit` (number): Número máximo de reuniones (default: 5)

#### `GET /meetings/entrepreneurs`
Obtiene emprendedores disponibles para asignar reuniones (solo Aliados y Super Usuarios).

### 💬 Messages (`/api/messages`)

#### `GET /messages/conversations`
Lista conversaciones del usuario.

**Response:**
```json
{
  "conversations": [
    {
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "profilePicture": "string",
        "role": "entrepreneur"
      },
      "lastMessage": {
        "id": "uuid",
        "content": "Hola, ¿cómo estás?",
        "createdAt": "2024-01-15T10:30:00Z",
        "sender": {
          "name": "John Doe"
        }
      },
      "unreadCount": 2
    }
  ]
}
```

#### `GET /messages/:userId`
Obtiene mensajes con un usuario específico.

**Query Parameters:**
- `page` (number): Página (default: 1)
- `limit` (number): Mensajes por página (default: 50)

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "content": "Hola, ¿cómo va el proyecto?",
      "createdAt": "2024-01-15T10:30:00Z",
      "isRead": true,
      "messageType": "text",
      "sender": {
        "id": "uuid",
        "name": "Jane Smith",
        "profilePicture": "string"
      },
      "receiver": {
        "id": "uuid",
        "name": "John Doe"
      },
      "attachments": []
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

#### `POST /messages`
Envía un nuevo mensaje.

**Request Body:**
```json
{
  "receiverId": "uuid",
  "content": "¡Hola! ¿Cómo va todo?",
  "messageType": "text",
  "attachments": ["file1.pdf", "file2.jpg"]
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "data": {
    "id": "uuid",
    "content": "¡Hola! ¿Cómo va todo?",
    "createdAt": "2024-01-15T10:30:00Z",
    "sender": {
      "name": "Jane Smith"
    }
  }
}
```

#### `PUT /messages/:messageId/read`
Marca un mensaje como leído.

#### `GET /messages/search-users`
Busca usuarios para iniciar conversaciones.

**Query Parameters:**
- `query` (string): Término de búsqueda

### 📁 Documents (`/api/documents`)

#### `GET /documents`
Lista documentos del usuario.

**Query Parameters:**
- `page` (number): Página
- `limit` (number): Documentos por página
- `type` (string): Tipo de documento
- `tags` (string): Tags separados por comas
- `search` (string): Búsqueda en título/nombre

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "title": "Plan de Negocio",
      "filename": "plan-negocio.pdf",
      "fileSize": 1048576,
      "fileType": "application/pdf",
      "documentType": "business_plan",
      "isPublic": false,
      "tags": ["plan", "negocio", "2024"],
      "createdAt": "2024-01-15T10:30:00Z",
      "uploadedBy": {
        "id": "uuid",
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

#### `POST /documents/upload`
Sube un nuevo documento.

**Request (Multipart/Form-Data):**
```
document: <file>
title: "Plan de Negocio 2024"
documentType: "business_plan"
isPublic: "false"
tags: "plan,negocio,2024"
```

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": "uuid",
    "title": "Plan de Negocio 2024",
    "filename": "plan-negocio.pdf",
    "filePath": "/uploads/user-id/document-uuid.pdf",
    "documentType": "business_plan"
  }
}
```

#### `PUT /documents/:id`
Actualiza metadatos del documento.

**Request Body:**
```json
{
  "title": "Plan de Negocio Actualizado",
  "documentType": "business_plan",
  "isPublic": true,
  "tags": ["plan", "negocio", "actualizado"]
}
```

#### `GET /documents/:id/download`
Descarga un documento.

**Response:** Archivo binario con headers apropiados.

#### `DELETE /documents/:id`
Elimina un documento.

#### `GET /documents/types`
Obtiene tipos de documento disponibles.

**Response:**
```json
{
  "types": [
    {
      "value": "business_plan",
      "label": "Plan de Negocio"
    },
    {
      "value": "financial_report",
      "label": "Reporte Financiero"
    }
  ]
}
```

### 📊 Reports (`/api/reports`)

#### `GET /reports/impact-metrics`
Obtiene métricas de impacto del sistema.

**Query Parameters:**
- `currency` (string): Moneda para conversión (COP, USD, EUR)
- `startDate` (string): Fecha de inicio
- `endDate` (string): Fecha de fin

**Response:**
```json
{
  "metrics": {
    "totalEntrepreneurs": 150,
    "vulnerablePopulationCount": 75,
    "vulnerablePopulationPercentage": 50,
    "totalTrainingHours": 2250,
    "totalInvestment": 13500000,
    "totalMeetings": 300,
    "completedMeetings": 250,
    "completionRate": 83,
    "totalDocuments": 450,
    "publicDocuments": 150,
    "baseCostPerSession": 60000,
    "currency": "COP"
  },
  "stageDistribution": {
    "ideacion": 30,
    "preincubacion": 40,
    "incubacion": 35,
    "aceleracion": 25,
    "consolidacion": 20
  },
  "generatedAt": "2024-01-15T10:30:00Z"
}
```

#### `GET /reports/entrepreneur-directory`
Obtiene directorio de emprendedores.

**Query Parameters:**
- `search` (string): Búsqueda por nombre
- `stage` (string): Filtrar por etapa
- `isVulnerable` (boolean): Filtrar población vulnerable
- `page`, `limit`: Paginación

**Response:**
```json
{
  "directory": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "currentStage": "ideacion",
      "progressPercentage": 40,
      "trainingHours": 15.5,
      "isVulnerablePopulation": true,
      "assignedAlly": {
        "name": "Jane Smith"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

#### `GET /reports/progress-report`
Genera reporte de progreso.

**Query Parameters:**
- `startDate` (string): Fecha de inicio
- `endDate` (string): Fecha de fin
- `format` (string): Formato de salida (json, csv)

**Response (JSON):**
```json
{
  "report": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "currentStage": "ideacion",
      "progressPercentage": 40,
      "trainingHours": 15.5,
      "totalMeetings": 8,
      "completedMeetings": 6,
      "completionRate": 75,
      "lastUpdate": "2024-01-15T10:30:00Z"
    }
  ],
  "summary": {
    "totalEntrepreneurs": 150,
    "averageProgress": 45,
    "totalTrainingHours": 2250,
    "vulnerablePopulation": 75
  },
  "generatedAt": "2024-01-15T10:30:00Z"
}
```

**Response (CSV):** Archivo CSV con los datos del reporte.

#### `GET /reports/activity-metrics`
Obtiene métricas de actividad del sistema.

**Query Parameters:**
- `period` (number): Días de actividad (default: 30)

## 🚨 Códigos de Error

### Error Response Format
```json
{
  "error": "Descripción del error",
  "code": "ERROR_CODE",
  "details": {
    "field": "valor específico del error"
  }
}
```

### Códigos de Estado HTTP

- **200**: OK - Solicitud exitosa
- **201**: Created - Recurso creado exitosamente
- **400**: Bad Request - Datos inválidos en la solicitud
- **401**: Unauthorized - Token de autenticación requerido
- **403**: Forbidden - Permisos insuficientes
- **404**: Not Found - Recurso no encontrado
- **409**: Conflict - Conflicto con el estado actual
- **429**: Too Many Requests - Límite de rate limiting excedido
- **500**: Internal Server Error - Error interno del servidor

### Errores Comunes

#### Authentication Errors
```json
{
  "error": "Access token required",
  "code": "AUTH_TOKEN_REQUIRED"
}
```

```json
{
  "error": "Invalid or expired token",
  "code": "AUTH_TOKEN_INVALID"
}
```

```json
{
  "error": "Insufficient permissions",
  "code": "AUTH_INSUFFICIENT_PERMISSIONS"
}
```

#### Validation Errors
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Email format is invalid",
    "name": "Name is required"
  }
}
```

#### Business Logic Errors
```json
{
  "error": "Entrepreneur profile not found",
  "code": "ENTREPRENEUR_NOT_FOUND"
}
```

```json
{
  "error": "Meeting cannot be scheduled in the past",
  "code": "INVALID_MEETING_TIME"
}
```

## 📝 Rate Limiting

### Límites por Endpoint

- **General**: 100 requests por 15 minutos por IP
- **Upload**: 10 uploads por 60 minutos por usuario
- **Messages**: 50 mensajes por 60 minutos por usuario
- **Reports**: 20 requests por 60 minutos por usuario

### Headers de Rate Limit
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642261800
```

## 🔧 Utilidades para Desarrollo

### Postman Collection
Importa la colección de Postman para probar todos los endpoints:
[Download Collection](../examples/ICOsystem.postman_collection.json)

### Curl Examples

#### Autenticación
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "firebase-id-token"
  }'
```

#### Crear Reunión
```bash
curl -X POST "http://localhost:3000/api/meetings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer firebase-id-token" \
  -d '{
    "title": "Sesión de Mentoría",
    "startTime": "2024-01-20T14:00:00Z",
    "endTime": "2024-01-20T15:00:00Z",
    "entrepreneurId": "uuid-del-emprendedor"
  }'
```

#### Subir Documento
```bash
curl -X POST "http://localhost:3000/api/documents/upload" \
  -H "Authorization: Bearer firebase-id-token" \
  -F "document=@plan-negocio.pdf" \
  -F "title=Plan de Negocio" \
  -F "documentType=business_plan" \
  -F "tags=plan,negocio,2024"
```

### JavaScript SDK Examples

#### Configuración del Cliente
```javascript
// services/api.js
import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para autenticación
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### Ejemplos de Uso
```javascript
// Obtener dashboard del emprendedor
const getDashboard = async () => {
  try {
    const response = await api.get('/entrepreneur/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
    throw error;
  }
};

// Actualizar ciclo de vida
const updateLifecycle = async (stage, responses) => {
  try {
    const response = await api.put('/entrepreneur/lifecycle', {
      stage,
      responses
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
    throw error;
  }
};

// Enviar mensaje
const sendMessage = async (receiverId, content) => {
  try {
    const response = await api.post('/messages', {
      receiverId,
      content,
      messageType: 'text'
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
    throw error;
  }
};
```

## 🧪 Testing

### Test de Endpoints con Jest
```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints', () => {
  test('POST /auth/login - should login successfully', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        token: 'valid-firebase-token'
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.user).toHaveProperty('id');
  });

  test('POST /auth/login - should fail with invalid token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        token: 'invalid-token'
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid token');
  });
});
```

---

**📚 Esta documentación se actualiza constantemente. Para la versión más reciente, consulta el repositorio oficial.**