# 🚀 Guía de Despliegue - ICOsystem

**Versión**: v2.1.0  
**Última actualización**: Septiembre 2025  
**Estado de seguridad**: ✅ Auditado y aprobado

---

## 📋 Resumen de Despliegue

ICOsystem está diseñado para despliegue en múltiples entornos con configuraciones específicas de seguridad. Esta guía cubre desde desarrollo local hasta producción enterprise.

### 🎯 Entornos Soportados

| Entorno | Propósito | Configuración | Seguridad |
|---------|-----------|---------------|-----------|
| **Development** | Desarrollo local | Docker Compose | Básica |
| **Staging** | Pruebas pre-producción | Cloud básico | Media |
| **Production** | Producción enterprise | Multi-cloud | Alta |

---

## 🏠 Desarrollo Local

### Opción 1: Docker Compose (Recomendado)

```bash
# Clonar repositorio
git clone <repository-url>
cd icosystem

# Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Iniciar servicios
docker-compose -f docker-compose.dev.yml up -d

# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# Iniciar en modo desarrollo
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start
```

### Opción 2: Instalación Nativa

#### Prerrequisitos
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 15+
sudo apt-get install postgresql postgresql-contrib

# Redis 7+
sudo apt-get install redis-server
```

#### Configuración
```bash
# Crear base de datos
sudo -u postgres createdb icosystem_dev

# Configurar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Instalar dependencias del proyecto
cd backend && npm install
cd ../frontend && npm install

# Configurar base de datos
cd backend && npm run setup
```

---

## ☁️ Despliegue en la Nube

### 🔧 Configuración de Variables de Entorno

#### Producción - Backend (.env)
```bash
# === CONFIGURACIÓN DEL SERVIDOR ===
NODE_ENV=production
PORT=3000

# === BASE DE DATOS ===
DB_HOST=prod-postgres.rds.amazonaws.com
DB_PORT=5432
DB_NAME=icosystem_prod
DB_USER=icosystem_prod_user
DB_PASSWORD=${POSTGRES_PASSWORD}  # Desde AWS Secrets Manager
DB_SSL=true
DB_POOL_MAX=20
DB_POOL_MIN=5

# === REDIS ===
REDIS_HOST=prod-redis.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}  # Desde AWS Secrets Manager
REDIS_TLS=true

# === JWT ===
JWT_SECRET=${JWT_SECRET}  # Desde AWS Secrets Manager
JWT_EXPIRES_IN=7d

# === FIREBASE ===
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
FIREBASE_PRIVATE_KEY_ID=${FIREBASE_PRIVATE_KEY_ID}
FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}  # Escapado
FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
FIREBASE_CLIENT_ID=${FIREBASE_CLIENT_ID}
FIREBASE_CLIENT_X509_CERT_URL=${FIREBASE_CLIENT_X509_CERT_URL}

# === GOOGLE OAUTH ===
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# === APIS EXTERNAS ===
GOOGLE_MEET_API_KEY=${GOOGLE_MEET_API_KEY}
EXCHANGE_RATE_API_KEY=${EXCHANGE_RATE_API_KEY}
EXCHANGE_RATE_BASE_URL=https://api.exchangerate-api.com/v4/latest

# === CONFIGURACIÓN DE NEGOCIO ===
BASE_TRAINING_COST=60000

# === ARCHIVOS ===
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=/app/uploads

# === URLS ===
FRONTEND_URL=https://icosystem.com
API_URL=https://api.icosystem.com

# === SEGURIDAD ===
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX=100
```

#### Producción - Frontend (.env)
```bash
REACT_APP_API_URL=https://api.icosystem.com/api
REACT_APP_FIREBASE_API_KEY=${FIREBASE_API_KEY}
REACT_APP_FIREBASE_AUTH_DOMAIN=${FIREBASE_PROJECT_ID}.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
REACT_APP_FIREBASE_STORAGE_BUCKET=${FIREBASE_PROJECT_ID}.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
REACT_APP_FIREBASE_APP_ID=${FIREBASE_APP_ID}
```

---

## 🐳 Despliegue con Docker

### Dockerfile - Backend
```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS runner

# Seguridad: usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copiar dependencias
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

# Crear directorio de uploads
RUN mkdir -p uploads && chown nextjs:nodejs uploads

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]
```

### Dockerfile - Frontend
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS runner

# Configuración de seguridad para Nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/build /usr/share/nginx/html

# Headers de seguridad
RUN echo 'add_header X-Frame-Options "SAMEORIGIN" always;' > /etc/nginx/conf.d/security.conf
RUN echo 'add_header X-Content-Type-Options "nosniff" always;' >> /etc/nginx/conf.d/security.conf
RUN echo 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;' >> /etc/nginx/conf.d/security.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose - Producción
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - backend-network
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - backend-network
    restart: unless-stopped

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    volumes:
      - uploads_data:/app/uploads
    networks:
      - backend-network
      - frontend-network
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    depends_on:
      - backend
    networks:
      - frontend-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - frontend-network
    restart: unless-stopped

networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true

volumes:
  postgres_data:
  redis_data:
  uploads_data:
```

---

## ☁️ AWS Deployment

### 🏗️ Arquitectura AWS Recomendada

```mermaid
graph TB
    Internet([Internet]) --> CloudFront[CloudFront CDN]
    CloudFront --> ALB[Application Load Balancer]
    ALB --> ECS[ECS Fargate Cluster]
    ECS --> Backend1[Backend Container 1]
    ECS --> Backend2[Backend Container 2]
    Backend1 --> RDS[(RDS PostgreSQL)]
    Backend2 --> RDS
    Backend1 --> ElastiCache[(ElastiCache Redis)]
    Backend2 --> ElastiCache
    Backend1 --> S3[S3 Uploads Bucket]
    Backend2 --> S3
    
    CloudFront --> S3Frontend[S3 Frontend Bucket]
    
    SecretsManager[AWS Secrets Manager] --> Backend1
    SecretsManager --> Backend2
```

### 📋 Servicios AWS Requeridos

1. **Compute & Networking**
   - ECS Fargate (contenedores)
   - Application Load Balancer
   - VPC con subnets públicas/privadas
   - Security Groups

2. **Storage & Database**
   - RDS PostgreSQL (Multi-AZ)
   - ElastiCache Redis
   - S3 (frontend + uploads)
   - CloudFront CDN

3. **Security & Monitoring**
   - AWS Secrets Manager
   - CloudWatch Logs
   - AWS WAF
   - Certificate Manager

### 🚀 Terraform Configuration

```hcl
# terraform/main.tf
provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "icosystem" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "icosystem-vpc"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "icosystem-postgres"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"  # Ajustar según necesidades
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "icosystem"
  username = "icosystem"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Sun:04:00-Sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "icosystem-final-snapshot"
  
  tags = {
    Name = "icosystem-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "redis" {
  name       = "icosystem-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "icosystem-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]
  
  tags = {
    Name = "icosystem-redis"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "icosystem" {
  name = "icosystem-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# S3 para uploads
resource "aws_s3_bucket" "uploads" {
  bucket = "icosystem-uploads-${random_string.bucket_suffix.result}"
  
  tags = {
    Name = "icosystem-uploads"
  }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

### 📜 Scripts de Despliegue

```bash
#!/bin/bash
# scripts/deploy-aws.sh

set -e

echo "🚀 Iniciando despliegue de ICOsystem en AWS..."

# Verificar herramientas
command -v aws >/dev/null 2>&1 || { echo "AWS CLI requerido" >&2; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo "Terraform requerido" >&2; exit 1; }

# Variables
ENVIRONMENT=${1:-production}
AWS_REGION=${2:-us-east-1}

echo "📋 Entorno: $ENVIRONMENT"
echo "🌍 Región: $AWS_REGION"

# Desplegar infraestructura
echo "🏗️ Desplegando infraestructura..."
cd terraform
terraform init
terraform plan -var="environment=$ENVIRONMENT"
terraform apply -auto-approve

# Obtener outputs
DB_ENDPOINT=$(terraform output -raw db_endpoint)
REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)

# Construir y subir imágenes Docker
echo "🐳 Construyendo imágenes Docker..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Login a ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Backend
docker build -t icosystem-backend ./backend
docker tag icosystem-backend:latest $ECR_REGISTRY/icosystem-backend:latest
docker push $ECR_REGISTRY/icosystem-backend:latest

# Desplegar servicios ECS
echo "🚀 Desplegando servicios..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service icosystem-backend \
  --force-new-deployment

# Construir y subir frontend a S3
echo "🌐 Desplegando frontend..."
cd ../frontend
npm run build
aws s3 sync build/ s3://$(terraform output -raw frontend_bucket)/ --delete

# Invalidar CloudFront
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "✅ Despliegue completado exitosamente!"
echo "🌐 URL Frontend: $(terraform output -raw frontend_url)"
echo "🔗 URL API: $(terraform output -raw api_url)"
```

---

## 🔒 Configuración de Seguridad en Producción

### 1. AWS Secrets Manager

```bash
# Crear secretos
aws secretsmanager create-secret \
  --name "icosystem/prod/database" \
  --secret-string '{"password":"SECURE_DB_PASSWORD"}'

aws secretsmanager create-secret \
  --name "icosystem/prod/firebase" \
  --secret-string '{"private_key":"-----BEGIN PRIVATE KEY-----..."}'

aws secretsmanager create-secret \
  --name "icosystem/prod/jwt" \
  --secret-string '{"secret":"SECURE_JWT_SECRET"}'
```

### 2. Security Groups

```hcl
# Security Group para Backend
resource "aws_security_group" "backend" {
  name_prefix = "icosystem-backend-"
  vpc_id      = aws_vpc.icosystem.id

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.icosystem.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group para RDS
resource "aws_security_group" "rds" {
  name_prefix = "icosystem-rds-"
  vpc_id      = aws_vpc.icosystem.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }
}
```

### 3. WAF Protection

```hcl
resource "aws_wafv2_web_acl" "icosystem" {
  name  = "icosystem-waf"
  scope = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "RateLimitRule"
    priority = 1

    override_action {
      none {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
      sampled_requests_enabled   = true
    }
  }
}
```

---

## 📊 Monitoreo y Logging

### CloudWatch Alarms

```hcl
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "icosystem-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ecs cpu utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.icosystem.name
    ServiceName = "icosystem-backend"
  }
}

resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "icosystem-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ecs memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

### Log Groups

```hcl
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/icosystem-backend"
  retention_in_days = 30

  tags = {
    Name = "icosystem-backend-logs"
  }
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy ICOsystem

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: icosystem

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: '**/package-lock.json'

      - name: Install backend dependencies
        run: cd backend && npm ci

      - name: Install frontend dependencies
        run: cd frontend && npm ci

      - name: Run security audit
        run: |
          cd backend && npm audit --audit-level=high
          cd ../frontend && npm audit --audit-level=high

      - name: Run backend tests
        run: cd backend && npm test

      - name: Run frontend tests
        run: cd frontend && npm test -- --coverage --watchAll=false

      - name: Run linting
        run: |
          cd backend && npm run lint
          cd ../frontend && npm run lint

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  deploy:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY-backend:$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY-backend:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster icosystem-cluster \
            --service icosystem-backend \
            --force-new-deployment

      - name: Build and deploy frontend
        run: |
          cd frontend
          npm run build
          aws s3 sync build/ s3://icosystem-frontend-bucket/ --delete
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

---

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error de conexión a base de datos
```bash
# Verificar conectividad
aws rds describe-db-instances --db-instance-identifier icosystem-postgres

# Comprobar security groups
aws ec2 describe-security-groups --group-names icosystem-rds-sg
```

#### 2. Error de autenticación Firebase
```bash
# Verificar secretos
aws secretsmanager get-secret-value --secret-id icosystem/prod/firebase

# Probar conexión
node -e "
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
console.log('Firebase conectado exitosamente');
"
```

#### 3. Error de CORS
```javascript
// Verificar configuración en backend/src/app.js
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://icosystem.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

### Logs y Debugging

```bash
# Ver logs de ECS
aws logs tail /ecs/icosystem-backend --follow

# Ver métricas de CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ClusterName,Value=icosystem-cluster \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Average

# Verificar estado de servicios
aws ecs describe-services \
  --cluster icosystem-cluster \
  --services icosystem-backend
```

---

## 📋 Checklist de Despliegue

### Pre-Despliegue
- [ ] Variables de entorno configuradas
- [ ] Secretos creados en AWS Secrets Manager
- [ ] Base de datos migrada
- [ ] SSL/TLS certificados instalados
- [ ] DNS configurado
- [ ] Monitoreo configurado

### Post-Despliegue
- [ ] Health checks pasando
- [ ] Logs funcionando correctamente
- [ ] Métricas reportando
- [ ] Backups configurados
- [ ] Alertas configuradas
- [ ] Documentación actualizada

### Seguridad
- [ ] Firewall configurado
- [ ] Rate limiting activo
- [ ] HTTPS enforced
- [ ] Headers de seguridad activos
- [ ] Auditoría de accesos configurada
- [ ] Rotación de secretos programada

---

## 📞 Soporte

Para problemas de despliegue:

1. **Verificar logs**: CloudWatch, ECS, aplicación
2. **Revisar configuración**: Variables de entorno, secretos
3. **Comprobar conectividad**: Red, base de datos, APIs externas
4. **Consultar métricas**: CloudWatch dashboards

**Contacto del equipo de DevOps**: devops@icosystem.com

---

*Esta documentación se actualiza con cada release. Versión actual: v2.1.0*