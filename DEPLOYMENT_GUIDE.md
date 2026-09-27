# 🚀 GestãoMFX - Guia de Deploy

## Status do Projeto

✅ **Código**: Completo e compilando com sucesso  
✅ **Frontend Build**: Verificado (Next.js 14 com 16 rotas)  
✅ **Backend Build**: Verificado (Express.js com Prisma)  
✅ **Configuração**: Railway + Vercel prontos  

## Arquitetura de Deploy

```
GestãoMFX
├── Backend (Express.js)
│   └── Railway.app → https://api.gestaomfx.com
├── Frontend (Next.js 14)
│   └── Vercel → https://gestaomfx.com
└── Database (PostgreSQL)
    └── Railway → postgresql://...
```

## Passo 1: Preparar Railway (Backend + Database)

### 1.1 Criar Projeto no Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login no Railway
railway login

# Criar novo projeto
railway init
# Selecionar: "Create a new project"
# Nome: GestãoMFX Production
```

### 1.2 Adicionar PostgreSQL Database

```bash
# Dentro do diretório do projeto
railway add

# Selecionar: PostgreSQL
# Isso cria automaticamente a variável DATABASE_URL
```

### 1.3 Configurar Variáveis de Ambiente (Backend)

Railway Dashboard → Variables → Adicionar:

```env
# JWT & Auth
JWT_SECRET=sua-chave-secreta-muito-longa-e-aleatoria
JWT_REFRESH_SECRET=outro-chave-secreta-muito-longa-e-aleatoria

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=YOUR_MERCADO_PAGO_TOKEN

# URLs
API_URL=https://api.gestaomfx.com
FRONTEND_URL=https://gestaomfx.com

# Database URL (auto-criada pelo Railway)
DATABASE_URL=postgresql://...
```

> **Importante**: Gerar secrets seguros:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 1.4 Deploy do Backend

```bash
# No diretório raiz do projeto
railway link  # Conectar ao projeto Railway criado
railway up    # Deploy automático
```

Railway automaticamente:
- Detecta o `Dockerfile`
- Executa `npm install` e build
- Roda `prisma migrate deploy`
- Inicia o serviço na porta 3002

**URL do Backend**: https://[project-id].railway.app

## Passo 2: Configurar Frontend no Vercel

### 2.1 Criar Conta no Vercel

- Ir para [vercel.com](https://vercel.com)
- Fazer login com GitHub
- Autorizar acesso ao repositório

### 2.2 Importar Projeto

```bash
vercel link
# Ou via dashboard: Add New → Project → GitHub repository
```

### 2.3 Configurar Variáveis de Ambiente (Frontend)

Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://api.gestaomfx.com
NEXT_PUBLIC_FRONTEND_URL=https://gestaomfx.com
```

### 2.4 Deploy

```bash
vercel deploy --prod
```

Ou via Git: push para `main` → Vercel deploya automaticamente

**URL do Frontend**: https://gestaomfx.vercel.app (ou domínio customizado)

## Passo 3: Rodas as Migrations no Banco

Após o primeiro deploy do backend:

```bash
# Conectar ao Railway
railway shell

# Ou use psql diretamente:
DATABASE_URL=postgresql://... npx prisma migrate deploy

# Seed inicial (criar dados de configuração)
DATABASE_URL=postgresql://... npx prisma db seed
```

Isso vai popular:
- Admin user
- Watermark configuration
- PIX payment config
- Price tiers

## Passo 4: Testar a Integração

### 4.1 Login Admin

```bash
# Credenciais padrão (após seed)
Email: admin@gestaomfx.com
Password: senha_segura_123
```

### 4.2 Fluxo Completo

1. ✅ Login em `https://gestaomfx.com/auth/login`
2. ✅ Criar cliente em `Dashboard → Clientes`
3. ✅ Upload de fotos em `Dashboard → Uploads`
4. ✅ Aplicar marca d'água
5. ✅ Acessar galeria pública (token)
6. ✅ Selecionar fotos e fazer pagamento PIX
7. ✅ Liberar fotos (admin)

### 4.3 Verificar Logs

**Backend (Railway)**:
```bash
railway logs --service backend
```

**Frontend (Vercel)**:
Dashboard → Deployments → Logs

## Passo 5: Configurar Domínio Customizado (Opcional)

### Backend
Railway Dashboard → Domain → Add Custom Domain:
- `api.gestaomfx.com` → aponta para Railway

### Frontend
Vercel Dashboard → Settings → Domains:
- `gestaomfx.com` → aponta para Vercel

## Troubleshooting

### ❌ "Can't reach database"
```bash
# Verificar se PostgreSQL está running no Railway
railway status

# Verificar DATABASE_URL está correto
railway variables
```

### ❌ "Prisma migration fails"
```bash
# Reset database (⚠️ deleta tudo)
npx prisma migrate reset

# Ou manualmente:
railway shell
DROP DATABASE gestaomfx;
```

### ❌ "API calls fail (CORS)"
Backend `main.ts` tem CORS configurado para:
- `https://gestaomfx.com`
- `https://gestaomfx.vercel.app`

Se usar domínio customizado, atualizar CORS:

```typescript
// apps/backend/src/main.ts
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
})
```

### ❌ "Images not loading"
- Verificar se pasta `uploads/` é acessível via `/uploads/filename.jpg`
- Backend serve static files em `public/uploads`

## Checklist Pre-Deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] JWT_SECRET gerado e seguro
- [ ] Mercado Pago token válido
- [ ] Database migrations rodadas
- [ ] Seed data populado (admin user)
- [ ] CORS configurado para domínios corretos
- [ ] Frontend apontando para API correta
- [ ] Testes locais passando
- [ ] Logs verificados (sem errors)
- [ ] SSL/HTTPS habilitado em ambos

## Monitoramento Pós-Deploy

### Railway Alerts
Dashboard → Alerts:
- Notificar se deploy falhar
- Notificar se serviço ficar down
- Notificar se database ficar cheio

### Vercel Analytics
Dashboard → Analytics:
- Core Web Vitals
- API response time
- Deployment history

### Logs
```bash
# Backend
railway logs -f

# Frontend
vercel logs
```

## Rollback (Se Necessário)

### Backend
```bash
railway rollback [deployment-id]
```

### Frontend
```bash
vercel rollback
```

---

**Última atualização**: 2026-09-27  
**Status**: Ready for production deployment
