#!/usr/bin/env node

/**
 * 🔄 Mais Horas - Aplicação de Gerenciamento de Banco de Dados
 * 
 * Servidor independente para monitoramento e backup automático
 * de bancos de dados Neon com alternância inteligente.
 * 
 * @author Pablo Eduardo Silva
 * @version 1.0.0
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config/config');
const BackupScheduler = require('./core/scheduler');

// Inicializar aplicação
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança e performance
app.use(helmet({
    contentSecurityPolicy: false // Permitir inline scripts para dashboard
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/static', express.static(path.join(__dirname, 'ui')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Middleware de autenticação simples
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = process.env.API_TOKEN || 'backup-admin-2025';
    
    // Permitir acesso direto para dashboard e suas APIs
    if (req.path === '/' || 
        req.path === '/dashboard' || 
        req.path.startsWith('/static') ||
        req.path.startsWith('/api/backup') ||
        req.path.startsWith('/api/info') ||
        req.path.startsWith('/api/health')) {
        return next();
    }
    
    // Para outras APIs, verificar token
    if (req.path.startsWith('/api/')) {
        if (!authHeader || authHeader !== `Bearer ${token}`) {
            return res.status(401).json({
                success: false,
                error: 'Token de autorização inválido',
                hint: 'Use: Authorization: Bearer ' + token
            });
        }
    }
    
    next();
};

app.use(authMiddleware);

// Instância global do scheduler
let scheduler = null;

// Inicializar sistema de backup
function initializeBackupSystem() {
    try {
        if (!scheduler) {
            scheduler = new BackupScheduler();
            console.log('🚀 Sistema de backup inicializado');
        }
        return scheduler;
    } catch (error) {
        console.error('❌ Erro ao inicializar sistema de backup:', error.message);
        return null;
    }
}

// Rotas principais
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'dashboard.html'));
});

// API Routes
const apiRoutes = require('./api/api-routes');
app.use('/api/backup', apiRoutes);

// API de informações do sistema
app.get('/api/info', (req, res) => {
    const packageInfo = require('./package.json');
    res.json({
        success: true,
        application: {
            name: packageInfo.name,
            version: packageInfo.version,
            description: packageInfo.description,
            author: packageInfo.author
        },
        server: {
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            memory: process.memoryUsage()
        },
        databases: {
            primary: {
                name: config.databases.primary.name,
                configured: !!config.databases.primary.url
            },
            secondary: {
                name: config.databases.secondary.name,
                configured: !!config.databases.secondary.url
            }
        }
    });
});

// API de health check
app.get('/api/health', async (req, res) => {
    try {
        const sched = initializeBackupSystem();
        if (!sched) {
            throw new Error('Sistema de backup não inicializado');
        }
        
        const status = await sched.getSystemReport();
        
        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            system: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('❌ Erro na aplicação:', err);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
    });
});

// Rota 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada',
        availableRoutes: [
            'GET /',
            'GET /dashboard',
            'GET /api/info',
            'GET /api/health',
            'GET /api/backup/status',
            'POST /api/backup/force-backup',
            'POST /api/backup/force-switch'
        ]
    });
});

// Inicializar servidor
async function startServer() {
    try {
        // Verificar configurações obrigatórias
        if (!config.databases.primary.url) {
            throw new Error('DATABASE_URL não configurado no .env');
        }
        
        if (!config.databases.secondary.url) {
            console.warn('⚠️ DATABASE_URL_BACKUP não configurado - funcionalidades limitadas');
        }
        
        // Inicializar sistema de backup
        const sched = initializeBackupSystem();
        if (sched && config.databases.secondary.url) {
            sched.start();
            console.log('✅ Sistema de backup iniciado automaticamente');
        }
        
        // Iniciar servidor HTTP
        const server = app.listen(PORT, () => {
            console.log('\n🎉 ========================================');
            console.log('🔄 MAIS HORAS - DATABASE MANAGER');
            console.log('========================================');
            console.log(`🌐 Servidor rodando em: http://localhost:${PORT}`);
            console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
            console.log(`🔗 API: http://localhost:${PORT}/api/info`);
            console.log(`💚 Health: http://localhost:${PORT}/api/health`);
            console.log('========================================\n');
            
            if (process.env.NODE_ENV !== 'production') {
                console.log('💡 Dicas:');
                console.log('   - Para produção: NODE_ENV=production');
                console.log('   - Token API: API_TOKEN no .env');
                console.log('   - Logs: data/backup-system.log\n');
            }
        });
        
        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('🛑 Parando servidor...');
            if (scheduler) {
                scheduler.stop();
            }
            server.close(() => {
                console.log('✅ Servidor parado com sucesso');
                process.exit(0);
            });
        });
        
        process.on('SIGINT', () => {
            console.log('\n🛑 Parando servidor...');
            if (scheduler) {
                scheduler.stop();
            }
            server.close(() => {
                console.log('✅ Servidor parado com sucesso');
                process.exit(0);
            });
        });
        
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error.message);
        console.log('\n🔧 Verifique:');
        console.log('1. Se o arquivo .env existe e está configurado');
        console.log('2. Se as URLs dos bancos estão corretas');
        console.log('3. Se as dependências estão instaladas (npm install)');
        process.exit(1);
    }
}

// Iniciar aplicação se executado diretamente
if (require.main === module) {
    startServer();
}

module.exports = app;
