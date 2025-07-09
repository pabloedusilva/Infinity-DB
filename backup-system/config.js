// Configurações do sistema de backup automático
require('dotenv').config({ path: '../.env' });

const config = {
    // Configurações dos bancos de dados
    databases: {
        primary: {
            name: 'PRIMARY',
            url: process.env.DATABASE_URL,
            // Limite de horas mensais (190h para ter margem de segurança)
            monthlyLimit: 190 * 60 * 60 * 1000, // em millisegundos
            usageFile: './usage-primary.json'
        },
        secondary: {
            name: 'SECONDARY', 
            url: process.env.DATABASE_URL_BACKUP,
            monthlyLimit: 190 * 60 * 60 * 1000,
            usageFile: './usage-secondary.json'
        }
    },

    // Configurações de monitoramento
    monitoring: {
        // Verificar uso a cada 6 horas
        checkInterval: 6 * 60 * 60 * 1000,
        // Fazer backup quando usar 85% do limite
        backupThreshold: 0.85,
        // Alternar quando usar 90% do limite
        switchThreshold: 0.90,
        // Log de atividades
        logFile: './backup-system.log'
    },

    // Configurações de backup
    backup: {
        // Tabelas para fazer backup (todas as principais)
        tables: [
            'usuarios',
            'agendamentos', 
            'clientes',
            'servicos',
            'profissionais',
            'barbearia',
            'horarios_turnos',
            'notificacoes',
            'wallpapers',
            'servico_imagens',
            'alertas_promos',
            'subscriptions'
        ],
        // Diretório para arquivos temporários
        tempDir: './temp-backups',
        // Manter backups por 7 dias
        retentionDays: 7
    },

    // Notificações
    notifications: {
        // Email para alertas críticos
        alertEmail: process.env.SMTP_FROM || 'admin@naregua.com',
        // Webhook Discord/Slack (opcional)
        webhookUrl: process.env.BACKUP_WEBHOOK_URL || null
    }
};

module.exports = config;
