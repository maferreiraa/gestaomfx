# 🔍 Debug: Link da Galeria Pública

## Passo 1: Verificar se o Backend está Rodando

```bash
curl http://localhost:3002/health
```

Esperado:
```json
{"status":"ok","timestamp":"2026-09-27T..."}
```

## Passo 2: Listar Todas as Galerias Criadas

```bash
curl http://localhost:3002/debug/galleries
```

Esperado:
```json
{
  "totalGalleries": 1,
  "galleries": [
    {
      "token": "abc123...",
      "client": "Nome do Cliente",
      "photoCount": 5,
      "expiresAt": "2026-10-04T...",
      "isExpired": false
    }
  ]
}
```

Se não há galerias, precisa fazer upload de fotos primeiro!

## Passo 3: Testar a Rota da Galeria

```bash
curl http://localhost:3002/api/galleries/seu-token-aqui
```

Esperado:
```json
{
  "success": true,
  "data": {
    "clientName": "Maria Silva",
    "clientPhone": "11999999999",
    "uploadId": "cxyz...",
    "photos": [...],
    "priceConfig": {...},
    "expiresAt": "2026-10-04T..."
  }
}
```

## Passo 4: Verificar no Banco de Dados

```bash
cd apps/backend
npx prisma studio
```

Acesse `http://localhost:5555` e navegue para:
- `Gallery Links` - veja os tokens criados
- `Uploads` - veja os uploads
- `Photos` - veja as fotos

## Passo 5: Testar o Fluxo Completo

### 5.1 Criar Cliente (via API)

```bash
curl -X POST http://localhost:3002/api/admin/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "name": "Maria Silva",
    "phone": "11999999999"
  }'
```

### 5.2 Fazer Upload de Fotos

```bash
curl -X POST http://localhost:3002/api/admin/uploads \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -F "clientId=CLIENTE_ID" \
  -F "photos=@/caminho/para/foto.jpg"
```

Resposta:
```json
{
  "success": true,
  "data": {
    "uploadId": "upload123",
    "photoCount": 1,
    "galleryUrl": "http://localhost:3000/galeria/abc123..."
  }
}
```

### 5.3 Acessar a Galeria no Frontend

```
http://localhost:3000/galeria/abc123...
```

## Possíveis Problemas

### ❌ 404 na Galeria
- [ ] Verificar se o token existe: `curl http://localhost:3002/debug/galleries`
- [ ] Verificar se o upload foi criado no banco de dados
- [ ] Verificar se a galeria link foi criada (deve ser automático no upload)

### ❌ CORS Error
- [ ] Verificar `FRONTEND_URL` no `.env` do backend
- [ ] Certificar que é `http://localhost:3000` em desenvolvimento

### ❌ Token Expirado
- [ ] Galerias expiram após 7 dias
- [ ] Fazer novo upload cria novo token

### ❌ Fotos Não Carregam
- [ ] Verificar se `API_URL` está correto no backend
- [ ] Verificar se a pasta `apps/backend/uploads/` existe
- [ ] Verificar logs do backend

## Logs Úteis

### Backend
```bash
cd apps/backend
npm run dev 2>&1 | grep -E "galleries|GalleryLink|token"
```

### Frontend (Console)
Abrir DevTools (F12) → Console
- Procurar por erros de rede (`404`, `CORS`, etc)
- Verificar URLs sendo chamadas

## Remover Debug (Produção)

Depois de resolver, remover a rota `/debug/galleries` do `main.ts`:

```typescript
// Remover linhas 49-68
```

---

**Última atualização**: 2026-09-27
