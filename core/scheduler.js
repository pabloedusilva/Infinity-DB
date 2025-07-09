const cron = require('node-cron');
const config = require('../config/config');
const DatabaseManager = require('./database-manager');

class BackupScheduler {
    constructor() {
        this.dbManager = new DatabaseManager(config);
        this.jobs = [];
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) {
            console.log('⚠️ Scheduler já está executando');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Iniciando Sistema de Backup Automático NaRégua');
        
        // Monitoramento a cada 6 horas
        const monitoringJob = cron.schedule('0 */6 * * *', async () => {
            await this.performMonitoring();
        }, {
            scheduled: false,
            timezone: 'America/Sao_Paulo'
        });

        // Backup preventivo diário às 3h da manhã
        const dailyBackupJob = cron.schedule('0 3 * * *', async () => {
            await this.performDailyBackup();
        }, {
            scheduled: false,
            timezone: 'America/Sao_Paulo'
        });

        // Verificação de status a cada hora
        const statusCheckJob = cron.schedule('0 * * * *', async () => {
            await this.checkSystemStatus();
        }, {
            scheduled: false,
            timezone: 'America/Sao_Paulo'
        });

        // Limpeza de logs antigos (semanal)
        const cleanupJob = cron.schedule('0 2 * * 0', async () => {
            await this.performCleanup();
        }, {
            scheduled: false,
            timezone: 'America/Sao_Paulo'
        });

        this.jobs = [monitoringJob, dailyBackupJob, statusCheckJob, cleanupJob];
        
        // Iniciar todos os jobs
        this.jobs.forEach(job => job.start());
        
        // Executar verificação inicial
        setTimeout(() => this.performMonitoring(), 5000);
        
        console.log('✅ Sistema de backup iniciado com sucesso');
        console.log('📋 Jobs agendados:');
        console.log('   - Monitoramento: A cada 6 horas');
        console.log('   - Backup diário: Todos os dias às 3h');
        console.log('   - Verificação: A cada hora');
        console.log('   - Limpeza: Domingos às 2h');
    }

    stop() {
        if (!this.isRunning) {
            console.log('⚠️ Scheduler não está executando');
            return;
        }

        this.jobs.forEach(job => job.stop());
        this.isRunning = false;
        console.log('🛑 Sistema de backup parado');
    }

    async performMonitoring() {
        try {
            await this.dbManager.log('🔍 Iniciando monitoramento automático');
            
            const status = await this.dbManager.getStatus();
            
            for (const [dbName, dbStatus] of Object.entries(status)) {
                const usage = parseFloat(dbStatus.usage);
                const threshold = config.monitoring.backupThreshold * 100;
                const switchThreshold = config.monitoring.switchThreshold * 100;
                
                if (usage >= switchThreshold) {
                    await this.dbManager.log(`🚨 CRÍTICO: ${dbName} com ${usage}% de uso - Alternando banco!`);
                    if (dbStatus.isActive) {
                        await this.dbManager.switchToBackupDatabase();
                    }
                } else if (usage >= threshold) {
                    await this.dbManager.log(`⚠️ ALERTA: ${dbName} com ${usage}% de uso - Iniciando backup`);
                    if (dbStatus.isActive) {
                        await this.dbManager.createFullBackup();
                    }
                } else {
                    await this.dbManager.log(`✅ ${dbName}: ${usage}% de uso - Normal`);
                }
            }
            
        } catch (error) {
            await this.dbManager.log('❌ Erro no monitoramento:', error.message);
        }
    }

    async performDailyBackup() {
        try {
            await this.dbManager.log('📦 Iniciando backup diário preventivo');
            
            const currentUsage = this.dbManager.getUsagePercentage(this.dbManager.currentDatabase);
            
            if (currentUsage > 50) { // Fazer backup se uso > 50%
                await this.dbManager.createFullBackup();
                await this.dbManager.log('✅ Backup diário concluído');
            } else {
                await this.dbManager.log('ℹ️ Backup diário dispensado - uso baixo');
            }
            
        } catch (error) {
            await this.dbManager.log('❌ Erro no backup diário:', error.message);
        }
    }

    async checkSystemStatus() {
        try {
            const status = await this.dbManager.getStatus();
            const currentDb = this.dbManager.currentDatabase;
            const usage = this.dbManager.getUsagePercentage(currentDb);
            
            if (usage > 95) {
                await this.dbManager.log(`🚨 USO CRÍTICO: ${currentDb} com ${usage.toFixed(2)}%`);
            } else if (usage > 80) {
                await this.dbManager.log(`⚠️ USO ALTO: ${currentDb} com ${usage.toFixed(2)}%`);
            }
            
            // Log resumido do status
            await this.dbManager.log(`📊 Status: ${currentDb.toUpperCase()} ativo (${usage.toFixed(1)}%)`);
            
        } catch (error) {
            await this.dbManager.log('❌ Erro na verificação de status:', error.message);
        }
    }

    async performCleanup() {
        try {
            await this.dbManager.log('🧹 Iniciando limpeza de arquivos antigos');
            
            const fs = require('fs').promises;
            const path = require('path');
            
            // Limpar logs antigos (manter últimos 30 dias)
            const logFile = config.monitoring.logFile;
            try {
                const stats = await fs.stat(logFile);
                const daysOld = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
                
                if (daysOld > 30) {
                    await fs.writeFile(logFile, ''); // Limpar arquivo
                    await this.dbManager.log('🗑️ Log antigo limpo');
                }
            } catch (err) {
                // Arquivo não existe ou erro ao acessar
            }
            
            // Limpar backups temporários antigos
            if (config.backup.tempDir) {
                try {
                    const tempDir = config.backup.tempDir;
                    const files = await fs.readdir(tempDir);
                    const cutoffDate = Date.now() - (config.backup.retentionDays * 24 * 60 * 60 * 1000);
                    
                    for (const file of files) {
                        const filePath = path.join(tempDir, file);
                        const stats = await fs.stat(filePath);
                        
                        if (stats.mtime.getTime() < cutoffDate) {
                            await fs.unlink(filePath);
                            await this.dbManager.log(`🗑️ Backup temporário removido: ${file}`);
                        }
                    }
                } catch (err) {
                    // Diretório não existe ou erro ao acessar
                }
            }
            
            await this.dbManager.log('✅ Limpeza concluída');
            
        } catch (error) {
            await this.dbManager.log('❌ Erro na limpeza:', error.message);
        }
    }

    async getSystemReport() {
        try {
            console.log('📊 Gerando relatório do sistema...');
            
            // Inicializar banco manager se necessário
            if (!this.dbManager.usageLoaded) {
                console.log('📂 Carregando dados de uso...');
                await this.dbManager.ensureUsageLoaded();
            }
            
            const status = await this.dbManager.getStatus();
            console.log('✅ Status dos bancos obtido');
            
            const report = {
                timestamp: new Date().toISOString(),
                currentDatabase: this.dbManager.currentDatabase,
                databases: status,
                scheduler: {
                    isRunning: this.isRunning,
                    jobsCount: this.jobs.length
                },
                config: {
                    backupThreshold: config.monitoring.backupThreshold * 100 + '%',
                    switchThreshold: config.monitoring.switchThreshold * 100 + '%',
                    checkInterval: config.monitoring.checkInterval / (60 * 60 * 1000) + 'h'
                }
            };
            
            console.log('✅ Relatório gerado com sucesso');
            return report;
        } catch (error) {
            console.error('❌ Erro ao gerar relatório:', error.message);
            await this.dbManager.log('❌ Erro ao gerar relatório:', error.message);
            return { 
                error: error.message,
                timestamp: new Date().toISOString(),
                success: false
            };
        }
    }

    // Método para forçar troca de banco (emergência)
    async forceDatabaseSwitch() {
        try {
            await this.dbManager.log('🔧 TROCA FORÇADA DE BANCO INICIADA');
            await this.dbManager.switchToBackupDatabase();
            await this.dbManager.log('✅ Troca forçada concluída');
            return true;
        } catch (error) {
            await this.dbManager.log('❌ Erro na troca forçada:', error.message);
            return false;
        }
    }

    // Método para forçar backup (emergência)
    async forceBackup() {
        try {
            await this.dbManager.log('🔧 BACKUP FORÇADO INICIADO');
            await this.dbManager.createFullBackup();
            await this.dbManager.log('✅ Backup forçado concluído');
            return true;
        } catch (error) {
            await this.dbManager.log('❌ Erro no backup forçado:', error.message);
            return false;
        }
    }
}

module.exports = BackupScheduler;
