# 🔄 Mais Horas - Database Manager

Sistema inteligente de monitoramento e backup automático de bancos de dados Neon com alternância automática e dashboard web.

## 🎯 O que faz?

- **Monitora** o uso de dois bancos de dados Neon
- **Alterna automaticamente** quando um banco atinge 90% do limite mensal
- **Faz backup** automático quando atinge 85% do limite
- **Dashboard web** para monitoramento em tempo real
- **API REST** para controle programático
- **Logs detalhados** de todas as operações

## 🚀 Instalação Rápida

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar bancos de dados
Copie o arquivo `.env.example` para `.env` e configure suas URLs:

```env
DATABASE_URL='postgresql://usuario1:senha1@host1/db1'
DATABASE_URL_BACKUP='postgresql://usuario2:senha2@host2/db2'
```

### 3. Inicializar banco secundário
```bash
npm run init
```

### 4. Iniciar servidor
```bash
npm start
```

### 5. Acessar dashboard
```
http://localhost:3001/dashboard
```

## 📱 Dashboard Web

O dashboard oferece uma interface visual completa com:

- ✅ **Status em tempo real** dos dois bancos
- 📊 **Gráficos de uso** mensal de cada banco
- 📋 **Logs em tempo real** do sistema
- 🔄 **Controles manuais** para backup e troca
- ⚙️ **Configurações** do sistema

## 🎮 Comandos Disponíveis

```bash
# Iniciar servidor
npm start

# Desenvolvimento (com auto-reload)
npm run dev

# Inicializar banco secundário
npm run init

# Inicialização simples (dados essenciais)
npm run init-simple

# Ver status atual
npm run status

# Forçar backup manual
npm run backup

# Forçar troca de banco
npm run switch

# Executar testes
npm run test
```

## 🔗 API REST

O sistema oferece uma API REST completa:

### Endpoints Principais

```bash
# Status do sistema
GET /api/backup/status

# Forçar backup
POST /api/backup/force-backup

# Forçar troca de banco
POST /api/backup/force-switch

# Ver logs
GET /api/backup/logs

# Configurações
GET /api/backup/config

# Informações do sistema
GET /api/info

# Health check
GET /api/health
```

### Exemplo de uso da API

```javascript
// Status do sistema
const response = await fetch('http://localhost:3001/api/backup/status');
const data = await response.json();
console.log(data.report);

// Forçar backup
await fetch('http://localhost:3001/api/backup/force-backup', {
    method: 'POST'
});
```

## ⚙️ Configurações

### Thresholds (Limites)

- **Backup automático**: 85% do uso mensal
- **Troca automática**: 90% do uso mensal  
- **Verificação**: A cada 6 horas
- **Backup preventivo**: Diário às 3h

### Personalização

Edite `config/config.js` para personalizar:

```javascript
monitoring: {
    checkInterval: 6 * 60 * 60 * 1000,  // 6 horas
    backupThreshold: 0.85,               // 85%
    switchThreshold: 0.90                // 90%
}
```

## 📊 Monitoramento

### Arquivos de Dados

- `data/usage-primary.json` - Uso do banco primário
- `data/usage-secondary.json` - Uso do banco secundário  
- `data/backup-system.log` - Log de todas as operações

### Logs

Os logs incluem:
- ✅ Operações bem-sucedidas
- ⚠️ Alertas de uso alto
- 🚨 Trocas críticas de banco
- ❌ Erros e falhas

## 🏗️ Arquitetura

```
mais-horas-database-manager/
├── 📁 api/              # Rotas REST da API
├── 📁 config/           # Configurações do sistema
├── 📁 core/             # Núcleo (smart-db, scheduler, etc)
├── 📁 data/             # Dados de uso e logs
├── 📁 scripts/          # Scripts de inicialização
├── 📁 tests/            # Testes do sistema
├── 📁 ui/               # Dashboard web
├── 📄 app.js            # Servidor principal
└── 📄 package.json      # Dependências e scripts
```

## 🔧 Solução de Problemas

### Erro de Conexão
1. Verifique as URLs no `.env`
2. Confirme que ambos os bancos estão ativos
3. Teste: `npm run status`

### Dashboard não carrega
1. Verifique se o servidor está rodando: `npm start`
2. Acesse: `http://localhost:3001/dashboard`
3. Verifique o console para erros

### Backup não funciona
1. Execute: `npm run init` primeiro
2. Verifique se ambos os bancos têm a mesma estrutura
3. Consulte os logs: `data/backup-system.log`

## 🌟 Recursos

- ✅ **Zero downtime** - Alternância sem interrupção
- ✅ **Interface web** - Dashboard completo
- ✅ **API REST** - Controle programático  
- ✅ **Logs detalhados** - Rastreamento completo
- ✅ **Auto-recovery** - Recuperação automática
- ✅ **Configurável** - Thresholds personalizáveis

## 📈 Performance

- **Overhead mínimo**: ~1-2ms por query
- **Backup inteligente**: Apenas quando necessário
- **Monitoramento eficiente**: Verificação a cada 6h
- **Recuperação rápida**: Troca automática em segundos

## 🤝 Suporte

Para suporte ou dúvidas:

1. Consulte os logs: `data/backup-system.log`
2. Execute: `npm run status`
3. Verifique o dashboard: `/dashboard`
4. Teste a API: `/api/health`

---

**🎉 Pronto!** Seu sistema de backup inteligente está funcionando automaticamente.
