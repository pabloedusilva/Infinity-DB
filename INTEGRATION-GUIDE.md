# 🔄 Infinity-DB - Guia de Integração

## 📋 Sobre
O **Infinity-DB** é um sistema inteligente de manipulação e backup automático de bancos de dados Neon que pode ser facilmente integrado em qualquer aplicativo Node.js. Ele funciona como um "drop-in replacement" para o `@neondatabase/serverless`, gerenciando automaticamente backups e alternância entre bancos quando necessário.

## 🚀 Como Integrar no Seu Projeto

### 1. Colocar a Pasta no Seu Projeto
```bash
# Copie a pasta 'infinity-db' para dentro do seu projeto
# Exemplo: se seu projeto está em 'meu-app/', cole em 'meu-app/infinity-db/'
```

### 2. Configurar Variáveis de Ambiente
Adicione as seguintes variáveis no arquivo `.env` da **raiz do seu projeto** (fora da pasta infinity-db):

```env
# URLs dos bancos de dados Neon
DATABASE_URL=sua_url_do_banco_primario
DATABASE_URL_BACKUP=sua_url_do_banco_secundario

# Opcional: Token para API de controle
API_TOKEN=seu_token_personalizado
```

### 3. Instalar Dependências
No diretório da pasta `infinity-db`, execute:
```bash
cd infinity-db
npm install
```

### 4. Integrar no Seu Servidor

#### Método 1: Substituir Importação do Neon (Recomendado)
Se você já usa o Neon em seu projeto, simplesmente substitua a importação:

**ANTES:**
```javascript
const { neon } = require('@neondatabase/serverless');
const db = neon(process.env.DATABASE_URL);
```

**DEPOIS:**
```javascript
// Usar o Infinity-DB como substituto inteligente
const db = require('./infinity-db/core/smart-db');
```

#### Método 2: Integração Completa no Servidor
Adicione as seguintes linhas no seu arquivo de servidor principal (app.js, server.js, index.js, etc.):

```javascript
// ========================================
// 🔄 INFINITY-DB - SISTEMA DE BACKUP
// ========================================
const path = require('path');
require('dotenv').config(); // Certifique-se que o .env está carregado

// Importar componentes do Infinity-DB
const BackupScheduler = require('./infinity-db/core/scheduler');
const smartDb = require('./infinity-db/core/smart-db');

// Instância global do scheduler
let backupScheduler = null;

// Inicializar sistema de backup
function initializeInfinityDB() {
    try {
        if (!backupScheduler) {
            backupScheduler = new BackupScheduler();
            backupScheduler.start(); // Inicia o sistema automático
            console.log('🔄 Infinity-DB: Sistema de backup iniciado');
        }
        return backupScheduler;
    } catch (error) {
        console.error('❌ Infinity-DB: Erro ao inicializar:', error.message);
        return null;
    }
}

// Inicializar ao carregar o servidor
initializeInfinityDB();

// Substituir sua conexão de banco atual por:
const db = smartDb; // Use esta variável para todas as queries

// Opcional: Adicionar rotas de controle do backup
const backupRoutes = require('./infinity-db/api/api-routes');
app.use('/api/backup', backupRoutes);

// Graceful shutdown (adicione no final do arquivo)
process.on('SIGTERM', () => {
    console.log('🛑 Parando Infinity-DB...');
    if (backupScheduler) {
        backupScheduler.stop();
    }
});

process.on('SIGINT', () => {
    console.log('🛑 Parando Infinity-DB...');
    if (backupScheduler) {
        backupScheduler.stop();
    }
});
// ========================================
```

### 5. Usar nas Suas Queries
Agora você pode usar o `db` normalmente como antes:

```javascript
// Exemplos de uso (funciona exatamente como o Neon original)

// Template literals
const users = await db`SELECT * FROM usuarios WHERE active = true`;

// Queries com parâmetros
const user = await db`SELECT * FROM usuarios WHERE id = ${userId}`;

// Inserções
const newUser = await db`
    INSERT INTO usuarios (name, email) 
    VALUES (${name}, ${email}) 
    RETURNING *
`;

// Atualizações
await db`UPDATE usuarios SET last_login = ${new Date()} WHERE id = ${userId}`;

// Queries complexas
const report = await db`
    SELECT u.name, COUNT(a.id) as appointments
    FROM usuarios u
    LEFT JOIN agendamentos a ON u.id = a.user_id
    WHERE u.created_at >= ${startDate}
    GROUP BY u.id, u.name
`;
```

## 🎯 Funcionalidades Automáticas

### ✅ O que o sistema faz automaticamente:
- **Monitoramento contínuo** do uso dos bancos
- **Backup automático** nos dias 24 e 25 de cada mês
- **Alternância automática** no dia 25 às 23h (ou quando necessário)
- **Fallback inteligente** se um banco falhar
- **Log de todas as operações** em `infinity-db/data/backup-system.log`
- **Tracking de uso** em arquivos JSON

### 📊 Monitoramento
Monitore o sistema através dos arquivos:
- `infinity-db/data/backup-system.log` - Log completo
- `infinity-db/data/usage-primary.json` - Uso do banco principal
- `infinity-db/data/usage-secondary.json` - Uso do banco secundário

## 🔧 Comandos Úteis

Execute a partir da pasta `infinity-db`:

```bash
# Ver status atual dos bancos
npm run status

# Forçar backup manual
npm run backup

# Forçar troca de banco
npm run switch

# Inicializar banco secundário (primeira vez)
npm run init

# Modo interativo
node scripts/standalone.js

# Teste completo do sistema
node tests/test-complete.js
```

## 🌐 API de Controle (Opcional)

Se você adicionou as rotas de backup, terá acesso a:

```bash
# Status do sistema
GET /api/backup/status

# Forçar backup
POST /api/backup/force-backup

# Forçar troca
POST /api/backup/force-switch

# Ver logs
GET /api/backup/logs

# Configurações
GET /api/backup/config
```

## 🔄 Inicialização do Banco Secundário

**IMPORTANTE:** Na primeira vez, você precisa inicializar o banco secundário:

```bash
cd infinity-db
npm run init
```

Isso irá:
- Copiar a estrutura das tabelas
- Sincronizar dados essenciais
- Preparar o sistema para uso

## ⚡ Exemplo Completo de Integração

```javascript
// server.js ou app.js
const express = require('express');
require('dotenv').config();

const app = express();

// ========================================
// 🔄 INFINITY-DB INTEGRATION
// ========================================
const BackupScheduler = require('./infinity-db/core/scheduler');
const db = require('./infinity-db/core/smart-db');

let backupScheduler = null;

function initializeInfinityDB() {
    try {
        if (!backupScheduler) {
            backupScheduler = new BackupScheduler();
            backupScheduler.start();
            console.log('🔄 Infinity-DB: Sistema ativo');
        }
    } catch (error) {
        console.error('❌ Infinity-DB:', error.message);
    }
}

initializeInfinityDB();

// Opcional: Rotas de controle
app.use('/api/backup', require('./infinity-db/api/api-routes'));
// ========================================

// Suas rotas normais
app.get('/users', async (req, res) => {
    try {
        const users = await db`SELECT * FROM usuarios`;
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        const newUser = await db`
            INSERT INTO usuarios (name, email) 
            VALUES (${name}, ${email}) 
            RETURNING *
        `;
        res.json(newUser[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    if (backupScheduler) backupScheduler.stop();
    process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log('🔄 Infinity-DB: Backup automático ativo');
});
```

## 💡 Vantagens

### ✅ **Zero Configuração Extra**
- Funciona como substituto direto do Neon
- Mesmo código, mesmas queries, zero alterações

### ✅ **Backup Automático Inteligente**
- Nunca mais se preocupe com limites de horas
- Sistema alternará automaticamente quando necessário

### ✅ **Fallback Transparente**
- Se um banco falhar, usa o outro automaticamente
- Sua aplicação nunca para de funcionar

### ✅ **Monitoramento Completo**
- Logs detalhados de todas as operações
- API para monitoramento em tempo real

## 🚨 Checklist de Integração

- [ ] Pasta `infinity-db` copiada para o projeto
- [ ] Variáveis `DATABASE_URL` e `DATABASE_URL_BACKUP` configuradas no `.env`
- [ ] Dependências instaladas (`cd infinity-db && npm install`)
- [ ] Código de integração adicionado ao servidor
- [ ] Banco secundário inicializado (`npm run init`)
- [ ] Teste realizado (`npm run status`)
- [ ] Aplicação funcionando normalmente

## 🎉 Pronto!

Agora sua aplicação está protegida com backup automático inteligente! O sistema funcionará completamente em background, alternando entre bancos quando necessário e garantindo que sua aplicação nunca pare por limitações de horas do Neon.

**Nunca mais se preocupe com limites de banco de dados!** 🚀
