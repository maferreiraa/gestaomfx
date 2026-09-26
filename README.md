# GestãoMFX 📸

Sistema completo de gestão de fotos geradas com IA, com seleção de galeria, checkout PIX dinâmico e dashboard administrativo.

## 🎯 Visão Geral

**GestãoMFX** permite que você:
- Gere lotes de fotos com IA (30-40 fotos)
- Adicione marca d'água automaticamente aos uploads
- Crie um link único para cada cliente selecionar suas fotos favoritas
- Configure preços dinâmicos (1 foto, 3 fotos, 10 fotos, +R$3,50 por adicional)
- Receba pagamentos via PIX
- Libere apenas as fotos selecionadas (sem marca d'água) para download
- Monitore vendas e ROI com integração Claude + LeonaFlow

## 🏗️ Stack Tecnológico

- **Frontend**: Next.js 14 + React 18 + TailwindCSS
- **Backend**: Node.js 20 + Express.js + TypeScript
- **Banco**: PostgreSQL 15 + Prisma ORM
- **Storage**: AWS S3
- **Integrações**: Claude API, LeonaFlow, PIX APIs

## 🚀 Quick Start

### Pré-requisitos
- Node.js 20+
- Docker & Docker Compose
- Git

### Setup Local

```bash
# 1. Clone o repositório
git clone https://github.com/maferreiraa/gestaomfx.git
cd gestaomfx

# 2. Inicie o banco de dados
docker-compose up -d

# 3. Instale dependências
npm install

# 4. Configure variáveis de ambiente
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 5. Execute as migrations
npm run db:migrate -w apps/backend

# 6. Inicie em desenvolvimento
npm run dev
```

**Acesso:**
- 🖥️ Dashboard Admin: http://localhost:3001
- 🎨 Portal Cliente: http://localhost:3000
- 🔌 API Backend: http://localhost:3002

## 📁 Estrutura do Projeto

```
gestaomfx/
├── apps/
│   ├── backend/     # API Node.js + Express
│   └── frontend/    # Next.js (ambas plataformas)
├── docs/            # Documentação
├── docker-compose.yml
├── package.json
└── README.md
```

## 📚 Documentação

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitetura do sistema
- [API.md](docs/API.md) - Endpoints disponíveis
- [DATABASE.md](docs/DATABASE.md) - Schema do banco
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deploy em produção

## 🔐 Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/gestaomfx
REDIS_URL=redis://localhost:6379
JWT_SECRET=seu-super-secreto-aqui
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=gestao-mfx-fotos
CLAUDE_API_KEY=xxx
LEONA_API_KEY=xxx
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Roadmap (MVPs)

- [x] **MVP 1**: Setup inicial + CRUD clientes + Auth (Em andamento)
- [ ] **MVP 2**: Checkout + Pagamento PIX
- [ ] **MVP 3**: Processamento de imagens com marca d'água
- [ ] **MVP 4**: Analytics + Integrações Claude/LeonaFlow
- [ ] **MVP 5**: Deploy em produção

## 🤝 Contribuindo

Este projeto é desenvolvido com Claude Code. Leia [CLAUDE.md](CLAUDE.md) para diretrizes de desenvolvimento.

## 📝 Licença

Privado - MFX Creative

---

**Desenvolvido com ❤️ usando Claude Code**
