const express = require('express');
const router = express.Router();
const BackupScheduler = require('./scheduler');
const config = require('./config');
const { requireLogin } = require('../middleware/auth');

// Instância do scheduler
let scheduler = null;

// Inicializar scheduler se não existir
function getScheduler() {
    if (!scheduler) {
        scheduler = new BackupScheduler();
        scheduler.start();
    }
    return scheduler;
}

// Status do sistema de backup
router.get('/status', requireLogin, async (req, res) => {
    try {
        const sched = getScheduler();
        const report = await sched.getSystemReport();
        
        res.json({
            success: true,
            report: report,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Forçar backup manual
router.post('/force-backup', requireLogin, async (req, res) => {
    try {
        const sched = getScheduler();
        const success = await sched.forceBackup();
        
        res.json({
            success: success,
            message: success ? 'Backup forçado iniciado' : 'Erro ao iniciar backup',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Forçar troca de banco
router.post('/force-switch', requireLogin, async (req, res) => {
    try {
        const sched = getScheduler();
        const success = await sched.forceDatabaseSwitch();
        
        res.json({
            success: success,
            message: success ? 'Troca de banco forçada' : 'Erro ao trocar banco',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Parar sistema de backup
router.post('/stop', requireLogin, async (req, res) => {
    try {
        if (scheduler) {
            scheduler.stop();
            res.json({
                success: true,
                message: 'Sistema de backup parado',
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                success: false,
                message: 'Sistema não estava executando'
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Reiniciar sistema de backup
router.post('/restart', requireLogin, async (req, res) => {
    try {
        if (scheduler) {
            scheduler.stop();
        }
        
        scheduler = new BackupScheduler();
        scheduler.start();
        
        res.json({
            success: true,
            message: 'Sistema de backup reiniciado',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Logs do sistema
router.get('/logs', requireLogin, async (req, res) => {
    try {
        const fs = require('fs').promises;
        const path = require('path');
        
        const logFile = path.join(__dirname, config.monitoring.logFile);
        
        try {
            const logs = await fs.readFile(logFile, 'utf8');
            const lines = logs.split('\n').filter(line => line.trim());
            
            // Retornar últimas 100 linhas
            const recentLogs = lines.slice(-100);
            
            res.json({
                success: true,
                logs: recentLogs,
                totalLines: lines.length
            });
            
        } catch (err) {
            res.json({
                success: true,
                logs: ['Nenhum log encontrado'],
                totalLines: 0
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Configurações do sistema
router.get('/config', requireLogin, (req, res) => {
    try {
        // Remover URLs sensíveis da configuração
        const safeConfig = {
            monitoring: config.monitoring,
            backup: {
                tables: config.backup.tables,
                retentionDays: config.backup.retentionDays
            },
            databases: {
                primary: {
                    name: config.databases.primary.name,
                    monthlyLimit: config.databases.primary.monthlyLimit
                },
                secondary: {
                    name: config.databases.secondary.name,
                    monthlyLimit: config.databases.secondary.monthlyLimit
                }
            }
        };
        
        res.json({
            success: true,
            config: safeConfig
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
