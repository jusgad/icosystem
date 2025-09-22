# 🚀 ICOsystem - Inicio Rápido

## ⚡ Configuración Automática (Recomendado)

```bash
# Clonar el repositorio
git clone <your-repo-url>
cd icosystem

# Ejecutar configuración automática
./setup.sh
```

## 🐳 Con Docker (Más Fácil)

```bash
# Iniciar servicios de base de datos
docker-compose -f docker-compose.dev.yml up postgres redis -d

# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# Iniciar desarrollo
cd backend && npm run dev
cd ../frontend && npm start
```

## 📋 Configuración Manual

### 1. Prerrequisitos
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### 2. Instalar dependencias
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configurar base de datos
```bash
# Crear base de datos
createdb icosystem_dev

# O usar el script
cd backend && npm run setup
```

### 4. Iniciar desarrollo
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm start
```

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **API**: http://localhost:3000/api

## 🔧 Comandos Útiles

```bash
# Backend
npm run dev         # Iniciar desarrollo
npm run setup       # Configurar BD
npm run db:migrate  # Ejecutar migraciones
npm run db:seed     # Datos de prueba

# Frontend
npm start           # Iniciar desarrollo
npm run build       # Compilar producción
npm test            # Ejecutar tests
```

## ⚠️ Configuración Adicional

1. **Firebase**: Actualiza las credenciales en `.env`
2. **Google APIs**: Configura Calendar y Meet
3. **Exchange Rate API**: Obtén una API key gratuita

Ver el [README completo](README.md) para más detalles.