# 🚀 QUICK START - Infinity-DB

## ⚡ Integração em 3 Passos

### 1. Copiar e Instalar
```bash
# 1. Cole a pasta 'infinity-db' no seu projeto
# 2. Instale dependências
cd infinity-db
npm install
```

### 2. Configurar .env (na raiz do projeto)
```env
DATABASE_URL=postgresql://usuario:senha@host.neon.tech/db
DATABASE_URL_BACKUP=postgresql://usuario2:senha2@host2.neon.tech/db2
```

### 3. Usar no Código
```javascript
// ANTES
const { neon } = require('@neondatabase/serverless');
const db = neon(process.env.DATABASE_URL);

// DEPOIS  
const db = require('./infinity-db/core/smart-db');

// Usar normalmente - zero mudanças!
const users = await db`SELECT * FROM usuarios`;
```

## 🎯 Pronto!

✅ **Backup automático** nos dias 24 e 25  
✅ **Alternância inteligente** no dia 25 às 23h  
✅ **Nunca mais limite de horas** do Neon!  

## 📋 Checklist

- [ ] Pasta copiada para o projeto
- [ ] `npm install` executado
- [ ] .env configurado na raiz
- [ ] `npm run init` executado
- [ ] `npm run test-integration` passou
- [ ] Código atualizado

## 📖 Documentação Completa

👉 **[INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md)**
