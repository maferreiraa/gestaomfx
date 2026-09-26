# 🏗️ Arquitetura do Sistema GestãoMFX

## Visão Geral

O GestãoMFX é um sistema de gestão de fotos com IA, dividido em 3 camadas:

```
┌─────────────────────────────────────┐
│  Frontend (Next.js)                 │
│  ├─ Portal Cliente (Galeria)        │
│  └─ Dashboard Admin                 │
└──────────────┬──────────────────────┘
               │ REST API
               ▼
┌─────────────────────────────────────┐
│  Backend (Node.js + Express)        │
│  ├─ Authentication & Authorization  │
│  ├─ Business Logic Services         │
│  └─ External API Integration        │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Data Layer                          │
│  ├─ PostgreSQL (dados estruturados)  │
│  ├─ Redis (cache, sessions)          │
│  └─ AWS S3 (images)                  │
└──────────────────────────────────────┘
```

## Componentes Principais

### 1. Portal Cliente (www.mfxcreativee.com.br/galeria/:token)

**Responsabilidade**: Permitir que clientes visualizem, selecionem e pagarem por fotos

**Fluxo**:
1. Cliente recebe link único
2. Acessa galeria com fotos em marca d'água
3. Seleciona fotos desejadas
4. Vê preço calculado dinamicamente
5. Efetua pagamento PIX
6. Recebe link para download (24h válido)

**Tecnologias**:
- Next.js App Router para roteamento dinâmico
- React Query para sincronização de dados
- Zustand para carrinho de compras
- TailwindCSS para UI

### 2. Dashboard Admin (www.gestao.mfxcreativee.com.br)

**Responsabilidade**: Gerenciar clientes, uploads, configurações e visualizar analytics

**Seções**:
- **Clientes**: CRUD, filtros por telefone/anúncio
- **Uploads**: Enviar fotos, configurar preços, gerar links
- **Analytics**: Gráficos de conversão e ROI
- **Configurações**: Marca d'água, PIX, preços
- **Integrações**: Claude insights, LeonaFlow dados

**Tecnologias**:
- Next.js com autenticação JWT
- Charts (Recharts) para analytics
- Form Builder com Zod validation
- Modal/Dialog para confirmações

### 3. Backend API (api.mfxcreativee.com.br)

**Responsabilidade**: Processar business logic, validar dados, integrar com externos

**Módulos**:
- **auth**: Login, JWT, refresh tokens
- **clients**: CRUD, associação Meta Ads
- **uploads**: Processar imagens, adicionar watermark, salvar S3
- **gallery-links**: Gerar tokens, validar expiração
- **payments**: Calcular preço, integrar PIX, validar webhook
- **downloads**: Gerar ZIP, presigned URLs
- **analytics**: Agregar dados, Claude insights, LeonaFlow

**Tecnologias**:
- Express.js com middleware chain
- Prisma ORM para database abstraction
- Sharp para processamento de imagens
- Axios para HTTP client
- JWT para autenticação stateless

### 4. Data Layer

**PostgreSQL** (dados estruturados):
- Users (admin)
- Clients (informações do cliente)
- Uploads (metadados)
- Photos (referências S3)
- Payments (histórico transações)
- PhotoSelections (carrinho)
- GalleryLinks (tokens + expiração)
- Configurations (watermark, pix)

**Redis** (cache + sessions):
- Cache de gallery links (TTL 7d)
- Sessions de usuários logados
- Rate limiting counters
- Jobs queue (futuro)

**AWS S3** (imagens):
- `gestao-mfx-fotos/` bucket
  - `uploads/{uploadId}/with-watermark/{photoId}.jpg`
  - `uploads/{uploadId}/without-watermark/{photoId}.jpg`
- Presigned URLs com expiração
- CloudFront CDN para distribuição

## Fluxos de Dados Principais

### Fluxo 1: Upload de Fotos

```
Admin → Upload Form
  ↓
API: POST /api/uploads
  ├─ Validar cliente existe
  ├─ Receber multipart files
  ├─ Processar cada imagem:
  │  ├─ Sharp: redimensionar
  │  ├─ Sharp: adicionar watermark
  │  ├─ Upload S3 (com watermark)
  │  └─ Salvar referência no DB
  └─ Retornar: { uploadId, totalPhotos }

Admin → Link Generator
  ├─ POST /api/gallery-links
  ├─ Gerar token único (crypto)
  ├─ Salvar em DB (expires in 7 days)
  └─ Retornar: www.mfxcreativee.com.br/galeria/abc123

Admin → Envia link para cliente via WhatsApp/Email
```

### Fluxo 2: Seleção de Fotos

```
Cliente → Acessa link
  ├─ GET /api/gallery/{token}
  ├─ Validar: token existe, não expirou
  ├─ Retornar: fotos com watermark
  └─ Renderizar galeria

Cliente → Seleciona fotos
  ├─ Frontend calcula preço (Zustand)
  ├─ POST /api/selections (salva temporariamente)
  └─ Exibe "10 fotos = R$35"

Cliente → Clica "Pagar"
  └─ Redireciona para checkout
```

### Fluxo 3: Pagamento PIX

```
Cliente → Checkout
  ├─ POST /api/payments
  │  ├─ Validar: seleções existem
  │  ├─ Calcular preço final
  │  ├─ Chamar PIX API (Banco):
  │  │  └─ Retorna: QR Code + Copy-Paste
  │  ├─ Salvar Payment no DB (status: PENDING)
  │  └─ Retornar: { qrCode, copyPaste, expiresAt }
  └─ Renderizar QR Code na tela

Cliente → Escaneia ou copia chave PIX
  └─ Paga pelo app do banco

Banco → Webhook para backend
  ├─ POST /api/webhooks/pix
  ├─ Validar assinatura (HMAC)
  ├─ Atualizar Payment (status: COMPLETED)
  ├─ Gerar URLs sem watermark
  └─ Salvar no S3

Cliente → Frontend poll webhook
  ├─ GET /api/payments/{paymentId}
  ├─ Status: COMPLETED ✓
  └─ Habilitar botão DOWNLOAD
```

### Fluxo 4: Download

```
Cliente → Clica em DOWNLOAD
  ├─ POST /api/downloads/{paymentId}
  │  ├─ Validar: pagamento confirmado
  │  ├─ ZIP Generator:
  │  │  ├─ Fetch photos do S3 (sem watermark)
  │  │  ├─ Criar arquivo .zip
  │  │  └─ Upload zip no S3
  │  └─ Gerar presigned URL (15 min expiry)
  ├─ Retornar: { downloadUrl }
  └─ Frontend: redirect para S3
```

## Camadas de Segurança

### Borda (API)
- CORS: apenas domínios permitidos
- Rate limiting: 100 req/min por IP
- Input validation: Joi/Zod schemas
- HTTPS: TLS 1.2+

### Autenticação
- Admin: JWT (access + refresh)
- Cliente: Token único (sem estado)
- HttpOnly cookies para refresh

### Autorização
- Admin: Protegido por JwtAuthGuard
- Cliente: Validar token + não expirado
- S3: Presigned URLs com expiração

### Banco de Dados
- SQL Injection: Prisma (prepared statements)
- Senha: bcryptjs (rounds: 12)
- Sensível: Criptografia em repouso

### Armazenamento
- S3: Privado (sem acesso anônimo)
- URLs presignadas: Expiração curta (15 min)
- Logs: Auditoria de acesso

## Performance

### Frontend
- Next.js Image Optimization
- Lazy loading de galeria
- React Query caching
- CSS-in-JS minimizado

### Backend
- Pagination (default: 20 items)
- Redis caching para gallery-links
- DB Indexes em:
  - users.email
  - clients.userId
  - photos.uploadId
  - payments.clientId, status
  - gallery_links.token, expiresAt

### Storage
- CloudFront CDN (cache 30 dias)
- S3 compression (GZIP)
- Image optimization (Sharp)

## Escalabilidade Futura

### Horizontal
- Múltiplas instâncias Node.js (load balancer)
- PostgreSQL read replicas
- Redis cluster

### Vertical
- Queue system (Bull) para processing
- Webhooks async com retry
- Background jobs para analytics

### Funcional
- Multi-admin com permissões
- Integração com CRM externo
- White-label para resellers

---

**Veja também**:
- [API.md](API.md) - Endpoints disponíveis
- [DATABASE.md](DATABASE.md) - Schema Prisma
- [CLAUDE.md](../CLAUDE.md) - Convenções de código
