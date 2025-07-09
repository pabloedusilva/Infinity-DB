// Configurações do sistema de backup automático baseado em data
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
    // Configurações dos bancos de dados
    databases: {
        primary: {
            name: 'PRIMARY',
            url: process.env.DATABASE_URL,
            usageFile: path.join(__dirname, '../data/usage-primary.json')
        },
        secondary: {
            name: 'SECONDARY', 
            url: process.env.DATABASE_URL_BACKUP,
            usageFile: path.join(__dirname, '../data/usage-secondary.json')
        }
    },

    // Configurações de monitoramento
    monitoring: {
        // Verificar status a cada 12 horas
        checkInterval: 12 * 60 * 60 * 1000,
        // Log de atividades
        logFile: path.join(__dirname, '../data/backup-system.log'),
        // Sistema baseado em data (não usa mais limites de uso)
        systemType: 'date-based'
    },

    // Configurações de backup baseado em data
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
        tempDir: path.join(__dirname, '../temp-backups'),
        // Manter backups por 7 dias
        retentionDays: 7,
        // Backup automático nos dias específicos
        backupDays: [24, 25],
        // Troca automática no dia 25 às 23h
        switchDay: 25,
        switchHour: 23
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
