# 📁 Estrutura Organizada do Sistema de Backup

## 🏗️ Estrutura de Pastas

```
backup-system/
├── 📁 api/                    # APIs e rotas REST
│   ├── api-routes.js         # Rotas principais da API
│   └── api-routes-test.js    # Rotas para testes
│
├── 📁 config/                # Configurações do sistema
│   └── config.js            # Configurações centralizadas
│
├── 📁 core/                  # Núcleo do sistema
│   ├── smart-db.js          # Wrapper inteligente do Neon
│   ├── database-manager.js   # Gerenciador de banco de dados
│   └── scheduler.js         # Agendador de tarefas
│
├── 📁 data/                  # Dados e logs do sistema
│   ├── usage-primary.json   # Dados de uso do banco primário
│   ├── usage-secondary.json # Dados de uso do banco secundário
│   └── backup-system.log    # Log de atividades
│
├── 📁 docs/                  # Documentação
│   ├── README.md            # Documentação principal
│   └── TESTE-GUIDE.md       # Guia de testes
│
├── 📁 scripts/               # Scripts utilitários
│   ├── initialize.js        # Inicializar banco secundário
│   ├── init-simple.js       # Inicialização simples
│   ├── standalone.js        # Executar sistema standalone
│   ├── demo.js              # Demonstração do sistema
│   ├── resultado-final.js   # Script de resultado final
│   ├── setup.bat            # Setup para Windows
│   └── setup.sh             # Setup para Linux/Mac
│
├── 📁 tests/                 # Testes do sistema
│   ├── test.js              # Teste principal
│   ├── test-fixed.js        # Teste corrigido
│   ├── test-pratico.js      # Teste prático
│   ├── test-api.js          # Teste da API
│   ├── test-complete.js     # Teste completo
│   ├── test-direct-api.js   # Teste direto da API
│   ├── test-direct-neon.js  # Teste direto do Neon
│   ├── test-endpoints.js    # Teste dos endpoints
│   ├── test-query.js        # Teste de queries
│   ├── test-widget.js       # Teste do widget
│   └── teste-api.js         # Teste adicional da API
│
├── 📁 ui/                    # Interface do usuário
│   └── dashboard-widget.html # Widget do dashboard
│
├── 📁 temp-backups/          # Backups temporários
│
├── 📄 index.js               # Ponto de entrada principal
└── 📄 package.json           # Configurações do npm
```

## 🚀 Como Usar

### Importação Simples
```javascript
// Usar como substituto direto do neon
const db = require('./backup-system');

// Ou especificar o componente
const { SmartDatabase } = require('./backup-system');
```

### Importação de Componentes
```javascript
const {
    DatabaseManager,
    BackupScheduler,
    config,
    apiRoutes
} = require('./backup-system');
```

## 📋 Scripts Disponíveis

```bash
# Inicializar sistema
npm run init

# Executar standalone
npm run start

# Executar testes
npm run test

# Ver status
npm run status

# Forçar backup
npm run backup

# Forçar troca de banco
npm run switch
```

## 🔧 Configuração

1. **Configurações centralizadas**: `config/config.js`
2. **Dados de monitoramento**: `data/`
3. **Logs do sistema**: `data/backup-system.log`

## ✨ Benefícios da Nova Estrutura

- ✅ **Organização clara**: Cada tipo de arquivo em sua pasta
- ✅ **Fácil manutenção**: Localização lógica dos componentes
- ✅ **Escalabilidade**: Estrutura preparada para crescer
- ✅ **Testes isolados**: Todos os testes em uma pasta
- ✅ **Configuração centralizada**: Uma fonte de verdade
- ✅ **API separada**: Endpoints organizados
- ✅ **Scripts organizados**: Utilitários em pasta específica

## 🔄 Compatibilidade

A nova estrutura mantém **100% de compatibilidade** com o código existente. O arquivo `db/neon.js` foi atualizado para apontar para o novo caminho do `smart-db.js`.

---

**📝 Nota**: Esta reorganização torna o sistema mais profissional e fácil de manter, seguindo as melhores práticas de estruturação de projetos Node.js.
