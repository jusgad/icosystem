#!/bin/bash

echo "🚀 ICOsystem - Configuración de Desarrollo"
echo "=========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar Node.js
echo -e "${BLUE}🔍 Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "📥 Instala Node.js desde: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js detectado: $NODE_VERSION${NC}"

# Verificar PostgreSQL
echo -e "${BLUE}🔍 Verificando PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL no detectado${NC}"
    echo "📥 Instala PostgreSQL desde: https://www.postgresql.org/download/"
    echo "🔧 O usa Docker: docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres"
else
    echo -e "${GREEN}✅ PostgreSQL detectado${NC}"
fi

# Verificar Redis
echo -e "${BLUE}🔍 Verificando Redis...${NC}"
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis no detectado${NC}"
    echo "📥 Instala Redis desde: https://redis.io/download/"
    echo "🔧 O usa Docker: docker run --name redis -p 6379:6379 -d redis"
else
    echo -e "${GREEN}✅ Redis detectado${NC}"
fi

# Instalar dependencias del backend
echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencias del backend instaladas${NC}"
else
    echo -e "${RED}❌ Error instalando dependencias del backend${NC}"
    exit 1
fi

# Instalar dependencias del frontend
echo -e "${BLUE}📦 Instalando dependencias del frontend...${NC}"
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencias del frontend instaladas${NC}"
else
    echo -e "${RED}❌ Error instalando dependencias del frontend${NC}"
    exit 1
fi

cd ..

# Configurar base de datos
echo -e "${BLUE}🗄️  Configurando base de datos...${NC}"
cd backend
npm run db:setup 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos configurada${NC}"
else
    echo -e "${YELLOW}⚠️  Configuración de base de datos falló. Configúrala manualmente.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
echo ""
echo "🚀 Para iniciar el proyecto:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm start"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:3000"
echo "   API:      http://localhost:3000/api"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Configura Firebase en los archivos .env"
echo "   2. Configura Google APIs para Meet/Calendar"
echo "   3. Obtén una API key para conversión de monedas"
echo ""