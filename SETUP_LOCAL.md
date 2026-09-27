# 🚀 Configuração Local - GestãoMFX

## Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente
- npm ou yarn

## 1. Clonar Repositório

```bash
git clone https://github.com/maferreiraa/gestaomfx.git
cd gestaomfx
```

## 2. Instalar Dependências

```bash
npm install
```

## 3. Configurar Backend

### 3.1 Criar arquivo `.env` no backend

```bash
cd apps/backend
cp .env.example .env
```

Editar `apps/backend/.env`:

```env
DATABASE_URL=postgresql://gestaomfx:gestaomfx_dev_password_123@localhost:5432/gestaomfx

JWT_SECRET=sua-chave-secreta-muito-longa-e-aleatoria-change-in-production-abc123xyz

PORT=3002
NODE_ENV=development
API_URL=http://localhost:3002
FRONTEND_URL=http://localhost:3000

MERCADO_PAGO_ACCESS_TOKEN=seu-token-do-mercado-pago

LOG_LEVEL=info
```

### 3.2 Rodas as Migrations

```bash
cd apps/backend
npx prisma migrate deploy
npx prisma db seed
```

Isso vai:
- Criar todas as tabelas no PostgreSQL
- Criar admin user (email: admin@gestaomfx.com, password: admin123)
- Popular configurações iniciais (watermark, preços, PIX)

### 3.3 Iniciar Backend

```bash
cd apps/backend
npm run dev
```

Backend rodando em: `http://localhost:3002`

## 4. Configurar Frontend

### 4.1 Criar arquivo `.env` no frontend

```bash
cd apps/frontend
cp .env.example .env
```

Editar `apps/frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### 4.2 Iniciar Frontend

```bash
cd apps/frontend
npm run dev
```

Frontend rodando em: `http://localhost:3000`

## 5. Testar

### Login Admin

```
URL: http://localhost:3000/auth/login
Email: admin@gestaomfx.com
Password: admin123
```

### Fluxo Completo

1. ✅ Criar cliente em `Dashboard → Clientes`
2. ✅ Upload de fotos em `Dashboard → Uploads`
3. ✅ Aplicar marca d'água
4. ✅ Acessar galeria pública (clique no link 🔗)
5. ✅ Selecionar fotos e fazer "pagamento" PIX (local - sem processar)
6. ✅ Liberar fotos

## 6. Dicas de Desenvolvimento

### Reset Database (⚠️ deleta tudo)

```bash
cd apps/backend
npx prisma migrate reset
```

### Ver dados no Prisma Studio

```bash
cd apps/backend
npx prisma studio
```

Abre UI em: `http://localhost:5555`

### Build Completo

```bash
# Backend
cd apps/backend && npm run build

# Frontend
cd apps/frontend && npm run build
```

### Testes

```bash
# Backend
cd apps/backend && npm test

# Frontend
cd apps/frontend && npm test
```

## Troubleshooting

### ❌ "Can't connect to PostgreSQL"

```bash
# Verificar se PostgreSQL está rodando
psql -U postgres

# Criar database
createdb gestaomfx

# Criar usuário
createuser -P gestaomfx
# (senha: gestaomfx_dev_password_123)
```

### ❌ "Link da galeria está quebrado"

Certifique-se que:
- [ ] `NEXT_PUBLIC_FRONTEND_URL` está definido no `.env` do frontend
- [ ] Backend está rodando em `http://localhost:3002`
- [ ] Frontend está rodando em `http://localhost:3000`
- [ ] Arquivo `.env` foi criado (não é rastreado no git)

### ❌ "Fotos não carregam"

- Verificar se a pasta `apps/backend/uploads/` existe
- Verificar logs do backend para erros
- Limpar cache do navegador (Ctrl+Shift+Delete)

---

**Última atualização**: 2026-09-27
