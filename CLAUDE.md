# 🤖 Diretrizes para Claude Code

Este arquivo documenta padrões, convenções e decisões arquiteturais para desenvolvimento do GestãoMFX.

## 📋 Princípios do Projeto

1. **MVP First**: Implementar o mínimo viável antes de otimizações
2. **Type Safety**: TypeScript em 100% do código
3. **Test-Driven**: Testes para funcionalidades críticas
4. **Clean Code**: Componentes pequenos, services focados
5. **Security First**: CORS, rate limit, validação em todas as bordas

## 🏗️ Estrutura de Código

### Backend (Node.js + Express)

```
src/
├── modules/         # Funcionalidades por domínio
│   ├── auth/       # Autenticação
│   ├── clients/    # Clientes
│   ├── uploads/    # Upload de fotos
│   └── ...
├── common/         # Utilitários, guards, pipes, filters
├── database/       # Prisma schema, migrations
└── main.ts         # Entry point
```

**Padrões:**
- **Service**: Lógica de negócio
- **Controller**: Request/Response mapping
- **Repository**: Acesso a dados (Prisma)
- **DTO**: Data Transfer Objects com validação

### Frontend (Next.js)

```
src/
├── app/            # Rotas Next.js 13+ (App Router)
├── components/     # Componentes React reutilizáveis
│   ├── common/    # Header, Footer, etc
│   ├── gallery/   # Componentes da galeria
│   └── dashboard/ # Componentes do admin
├── hooks/         # Custom React hooks
├── services/      # Chamadas API, lógica de negócio
├── types/         # TypeScript types
└── store/         # Zustand stores (state management)
```

**Padrões:**
- **Componentes**: Functional, TypeScript, props com interface
- **Hooks**: Custom hooks para lógica reutilizável
- **Services**: Centralizar chamadas API (Axios)
- **Store**: Zustand para state global (auth, cart)

## 🔐 Segurança

### Checklist por Feature

Toda feature deve ter:
- [ ] Validação de input (backend)
- [ ] Autenticação (se necessário)
- [ ] Autorização (user_id match)
- [ ] Rate limiting (endpoints sensíveis)
- [ ] Logs de auditoria
- [ ] Testes de segurança

### Dados Sensíveis

- **Nunca** commitar `.env` ou secrets
- **Sempre** usar `DATABASE_URL`, `JWT_SECRET` do ambiente
- **HTTPS** obrigatório em produção
- **HttpOnly cookies** para refresh tokens

## 📝 Convenções de Código

### Nomes

```typescript
// Services (lógica)
ClientsService, WatermarkService, PaymentService

// Controllers
ClientsController, UploadsController

// DTOs (entrada)
CreateClientDto, UpdateWatermarkConfigDto

// Responses (saída)
ClientResponse, GalleryResponse

// Variáveis
const clientId = "xxx"
const userEmail = "user@example.com"
const isExpired = true
```

### Imports

```typescript
// 1. Node/Next imports
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

// 2. Third-party
import { PrismaClient } from '@prisma/client'
import axios from 'axios'

// 3. Internal
import { AuthService } from '@/services/auth'
import { ClientResponse } from '@/types/responses'
```

## 🔄 Fluxo de Desenvolvimento

### Criar uma Feature

1. **Branch**: `feature/nome-descritivo`
2. **Tarefa**: Usar TaskCreate para rastrear subtarefas
3. **TDD**: Escrever testes antes do código
4. **Code Review**: Verificar tipos e segurança
5. **Commit**: Mensagem clara e descritiva
6. **PR**: Usar template quando disponível

### Convenção de Commits

```
feat: adicionar autenticação JWT no backend

- Implementar login endpoint
- Gerar access + refresh tokens
- Adicionar JwtAuthGuard
- Testes unitários para auth.service

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_xxxxx
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `refactor`: Reorganização sem mudança de comportamento
- `test`: Adicionar/modificar testes
- `docs`: Documentação
- `chore`: Dependências, setup

## 🗄️ Banco de Dados

### Prisma Workflow

```bash
# Criar migration
npx prisma migrate dev --name add_users_table

# Reset (⚠️ deleta tudo)
npx prisma migrate reset

# Seed (popular dados iniciais)
npm run db:seed

# Studio (UI para explorar dados)
npx prisma studio
```

### Regras de Schema

1. **Sempre adicionar timestamps**: `createdAt`, `updatedAt`
2. **IDs**: String cuid() como padrão
3. **Índices**: Em campos de filtro frequente
4. **Relacionamentos**: Explicit, com onDelete
5. **Enums**: Para status, tipos finitos

## 🧪 Testes

### Backend (Jest)

```typescript
describe('ClientsService', () => {
  it('should create a new client', async () => {
    const result = await service.create(createClientDto)
    expect(result).toHaveProperty('id')
    expect(result.name).toBe(createClientDto.name)
  })
})
```

### Frontend (Vitest + React Testing Library)

```typescript
it('should display client list', () => {
  render(<ClientsList />)
  expect(screen.getByText('Maria')).toBeInTheDocument()
})
```

### Coverage Mínimo

- Services: 80%+
- Controllers: 60%+
- Componentes: 50%+

## 📦 Dependências

### Permitidas (Vetted)

**Backend:**
- express, typescript, prisma, axios
- bcryptjs, jsonwebtoken, joi
- sharp (processamento imagens)
- redis, ioredis

**Frontend:**
- next, react, tailwindcss, shadcn/ui
- react-query (data fetching)
- zustand (state)
- axios, zod (validação)

### Antes de Adicionar

1. Verificar tamanho do bundle
2. Atividade do projeto (stars, últimas atualizações)
3. Licença (MIT, Apache 2.0)
4. Alternativas mais leves?

## 🚀 Performance

### Backend

- [ ] Pagination em endpoints que retornam listas
- [ ] Cache com Redis para queries pesadas
- [ ] Index no banco para filtros comuns
- [ ] Lazy load de imagens (S3 presignedURLs)
- [ ] Compression (gzip) em responses

### Frontend

- [ ] Dynamic imports para componentes pesados
- [ ] Image optimization (next/image)
- [ ] CSS-in-JS minimizado (TailwindCSS)
- [ ] Service Worker para cache
- [ ] Core Web Vitals monitorados

## 🐛 Debug

### Backend

```bash
# Logs com prefixo de contexto
logger.info('ClientService', 'create', { clientId, timestamp })

# Inspect requests
curl -H "Authorization: Bearer $TOKEN" http://localhost:3002/api/clients
```

### Frontend

```typescript
// React DevTools
// Network tab do Chrome (ver requests)
// NextJS debugging: node --inspect-brk ./node_modules/.bin/next dev
```

## 📱 Deploy

### Staging
- Branch `develop` → Railway staging
- Validar antes de mover para prod
- Comunicar mudanças no Discord

### Production
- Branch `main` → Railway production + Vercel
- Tag release no GitHub
- Update changelog

## 🔗 Integrações Externas

### Claude API

```typescript
// usar Anthropic SDK, não chamar diretamente
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
})

const response = await client.messages.create({
  model: 'claude-opus-4-1',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'analyze this data' }],
})
```

### LeonaFlow

```typescript
// Usar API REST, autenticação via API key
const headers = {
  'Authorization': `Bearer ${process.env.LEONA_API_KEY}`,
  'Content-Type': 'application/json'
}

const data = await axios.get('https://api.leona.com/leads', { headers })
```

## 📞 Suporte

- **Dúvidas sobre arquitetura**: Abrir issue no GitHub
- **Bugs**: Criar issue com reproduction steps
- **Features**: Discutir em issue antes de implementar

---

**Última atualização**: 2026-09-26  
**Mantido por**: Claude Code
