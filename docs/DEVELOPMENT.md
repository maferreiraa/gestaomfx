# 🚀 Guia de Desenvolvimento

## Setup Inicial

### 1. Pré-requisitos

```bash
# Verificar versões
node --version  # v20+ requerido
npm --version   # v9+
docker --version
git --version
```

### 2. Clone e Configure

```bash
# Clone o repositório
git clone https://github.com/maferreiraa/gestaomfx.git
cd gestaomfx

# Inicie os containers
docker-compose up -d

# Instale dependências root
npm install
```

### 3. Setup Backend

```bash
# Acesse a pasta
cd apps/backend

# Crie arquivo .env
cp .env.example .env

# Instale dependências
npm install

# Rode migrations
npm run db:migrate

# (Opcional) Seed com dados de teste
npm run db:seed

# Inicie o backend
npm run dev
# Rodando em http://localhost:3002
```

### 4. Setup Frontend

```bash
# Em outra aba do terminal
cd apps/frontend

# Crie arquivo .env.local
cp .env.example .env.local

# Instale dependências
npm install

# Inicie o frontend
npm run dev
# Rodando em http://localhost:3000
```

## Verificando Setup

```bash
# Testar API
curl http://localhost:3002/health

# Testar banco de dados
npm run db:studio -w apps/backend
# Abre UI visual do Prisma em http://localhost:5555

# Acessar aplicação
# Dashboard: http://localhost:3001
# Portal: http://localhost:3000
```

## MVP 1: Core Funcional (Semana 1-2)

### Tarefas Backend

#### 1.1 Setup Express + Prisma

```bash
npm init -y
npm install express typescript @types/express tsx
npm install @prisma/client prisma

# Inicializar Prisma
npx prisma init

# Editar .env com PostgreSQL
DATABASE_URL="postgresql://gestaomfx:gestaomfx_dev_password_123@localhost:5432/gestaomfx"
```

**Arquivos a criar:**
- `src/main.ts` - Entry point Express
- `src/config/database.ts` - Conexão Prisma
- `tsconfig.json` - TypeScript config
- `package.json` - Scripts dev/build/test

#### 1.2 Schema Database

**Arquivo**: `prisma/schema.prisma`

Criar models:
- User (admin)
- Client
- Upload
- Photo
- GalleryLink

Estrutura no ARCHITECTURE.md

#### 1.3 Auth Module

**Pasta**: `src/modules/auth/`

Implementar:
- `auth.controller.ts` - Endpoints /login, /logout
- `auth.service.ts` - Lógica JWT, hash password
- `jwt.strategy.ts` - Validação de tokens
- `auth.middleware.ts` - Proteção de rotas

**Endpoints**:
```
POST /api/auth/login
  Body: { email, password }
  Return: { accessToken, refreshToken }

POST /api/auth/refresh
  Body: { refreshToken }
  Return: { accessToken }

POST /api/auth/logout
  Body: {}
  Return: { success: true }

GET /api/auth/me
  Header: Authorization: Bearer {token}
  Return: { id, email, name }
```

#### 1.4 Clients Module

**Pasta**: `src/modules/clients/`

Implementar:
- `clients.controller.ts` - CRUD endpoints
- `clients.service.ts` - Lógica de negócio
- `clients.repository.ts` - Acesso a dados Prisma
- `dtos/create-client.dto.ts` - Validação

**Endpoints**:
```
POST /api/admin/clients
  Auth: JWT
  Body: { name, phone, adId? }
  Return: Client

GET /api/admin/clients
  Auth: JWT
  Query: ?page=1&limit=20
  Return: { data: Client[], total, page }

GET /api/admin/clients/:id
  Auth: JWT
  Return: Client

PUT /api/admin/clients/:id
  Auth: JWT
  Body: { name?, phone?, adId? }
  Return: Client

DELETE /api/admin/clients/:id
  Auth: JWT
  Return: { success: true }
```

#### 1.5 Uploads Module (Básico)

**Pasta**: `src/modules/uploads/`

Implementar (sem processamento de imagem ainda):
- `uploads.controller.ts`
- `uploads.service.ts`
- `uploads.repository.ts`

**Endpoints**:
```
POST /api/admin/uploads
  Auth: JWT
  Body: multipart { clientId, files[], prices }
  Return: { uploadId, totalPhotos }

GET /api/admin/uploads/:uploadId
  Auth: JWT
  Return: Upload + Photos array

GET /api/admin/clients/:clientId/uploads
  Auth: JWT
  Return: Upload[]

DELETE /api/admin/uploads/:uploadId
  Auth: JWT
  Return: { success: true }
```

#### 1.6 Gallery Links Module

**Pasta**: `src/modules/gallery-links/`

Implementar:
- `gallery-links.controller.ts`
- `gallery-links.service.ts`
- `token.util.ts` - Gerar token criptográfico

**Endpoints**:
```
POST /api/admin/gallery-links
  Auth: JWT
  Body: { uploadId }
  Return: { token, expiresAt, link }

GET /api/gallery/:token
  Query: ?validate=true
  Return: { clientName, uploadId, photos[], expiresAt }

GET /api/admin/gallery-links/:uploadId
  Auth: JWT
  Return: GalleryLink
```

#### 1.7 Testes Unitários

Criar testes para:
- `tests/auth.service.spec.ts`
- `tests/clients.service.spec.ts`

### Tarefas Frontend

#### 2.1 Setup Next.js

```bash
npx create-next-app@latest apps/frontend \
  --typescript \
  --tailwind \
  --app

npm install react-query zustand axios zod
```

#### 2.2 Layout Base

**Arquivos**:
- `src/app/layout.tsx` - Root layout
- `src/components/common/Header.tsx`
- `src/components/common/Sidebar.tsx`
- `src/components/common/Footer.tsx`

#### 2.3 Auth Flow

**Arquivos**:
- `src/app/auth/login/page.tsx` - Login page
- `src/services/auth.service.ts` - API calls
- `src/hooks/useAuth.ts` - Custom hook
- `src/store/authStore.ts` - Zustand store

#### 2.4 Clients Page

**Arquivos**:
- `src/app/dashboard/clients/page.tsx` - Listagem
- `src/components/dashboard/ClientsList.tsx`
- `src/components/dashboard/ClientForm.tsx`

#### 2.5 Upload Page

**Arquivos**:
- `src/app/dashboard/uploads/page.tsx`
- `src/components/dashboard/UploadForm.tsx`

#### 2.6 Gallery Page

**Arquivos**:
- `src/app/galeria/[token]/page.tsx` - Dynamic route
- `src/components/gallery/ImageGallery.tsx`

#### 2.7 Services & Hooks

**Arquivos**:
- `src/services/api.ts` - Axios instance
- `src/services/clients.service.ts`
- `src/services/gallery.service.ts`
- `src/hooks/useQuery*.ts` - Custom hooks

## Comands Úteis

```bash
# Development
npm run dev              # Iniciar ambos backend e frontend

# Database
npm run db:migrate -w apps/backend      # Rodar migrations
npm run db:seed -w apps/backend         # Popular dados
npm run db:studio -w apps/backend       # UI Prisma

# Testing
npm run test -w apps/backend            # Testes backend
npm run test:watch -w apps/backend      # Watch mode

# Linting & Formatting
npm run lint -w apps/backend            # ESLint
npm run format -w apps/backend          # Prettier

# Build
npm run build                           # Build ambos
npm run build -w apps/backend           # Build apenas backend
npm run start -w apps/backend           # Rodar build
```

## Estrutura de Commits (MVP 1)

```
Semana 1:
├─ feat: setup initial project structure
├─ feat: configure postgresql and prisma schema
├─ feat: implement auth module with jwt
├─ feat: add clients crud endpoints
└─ feat: setup frontend next.js with basic layout

Semana 2:
├─ feat: create uploads module (basic without image processing)
├─ feat: implement gallery-links with token generation
├─ feat: add clients listing page in frontend
├─ feat: create upload form component
├─ feat: build gallery view with dynamic route
└─ test: add unit tests for core services
```

## Troubleshooting

### Erro: "connect ECONNREFUSED 127.0.0.1:5432"

```bash
# Verificar se containers estão rodando
docker ps

# Se não estão, inicie
docker-compose up -d

# Teste conexão
psql postgresql://gestaomfx:gestaomfx_dev_password_123@localhost:5432/gestaomfx
```

### Erro: "node_modules not found"

```bash
# Limpe e reinstale
rm -rf node_modules apps/*/node_modules
npm install
```

### Erro: Prisma migrations falham

```bash
# Reset banco de dados (CUIDADO: deleta tudo)
npm run db:reset -w apps/backend

# Re-criar migrations
npx prisma migrate dev --name init
```

### Frontend não conecta no backend

```bash
# Verificar .env.local
cat apps/frontend/.env.local

# Deve ter:
NEXT_PUBLIC_API_URL=http://localhost:3002/api

# Se tiver diferente, atualize
```

## Próximos Passos Após MVP 1

- [ ] Implement image watermarking (Sharp)
- [ ] Setup AWS S3 integration
- [ ] Create payment/PIX module
- [ ] Add analytics dashboard
- [ ] Integrate Claude API
- [ ] Integrate LeonaFlow API
- [ ] Setup CI/CD (GitHub Actions)
- [ ] Deploy to staging (Railway)
- [ ] Domain configuration

---

**Precisa de ajuda?** Veja [CLAUDE.md](../CLAUDE.md) para convenções e [ARCHITECTURE.md](ARCHITECTURE.md) para visão geral.
