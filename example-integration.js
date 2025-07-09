/**
 * 🔄 EXEMPLO DE INTEGRAÇÃO DO INFINITY-DB
 * 
 * Este arquivo mostra como integrar o Infinity-DB em um servidor Express existente.
 * Copie este código para o seu arquivo de servidor principal (app.js, server.js, etc.)
 */

const express = require('express');
require('dotenv').config(); // Carrega o .env da raiz do projeto

const app = express();
app.use(express.json());

// ========================================
// 🔄 INFINITY-DB - SISTEMA DE BACKUP
// ========================================

// Importar componentes do Infinity-DB
const BackupScheduler = require('./infinity-db/core/scheduler');
const db = require('./infinity-db/core/smart-db');

// Instância global do scheduler
let backupScheduler = null;

// Função para inicializar o sistema de backup
function initializeInfinityDB() {
    try {
        if (!backupScheduler) {
            backupScheduler = new BackupScheduler();
            backupScheduler.start(); // Inicia o sistema automático
            console.log('🔄 Infinity-DB: Sistema de backup iniciado');
            console.log('📊 Infinity-DB: Backup automático nos dias 24 e 25');
            console.log('⚡ Infinity-DB: Alternância automática no dia 25 às 23h');
        }
        return backupScheduler;
    } catch (error) {
        console.error('❌ Infinity-DB: Erro ao inicializar:', error.message);
        console.error('💡 Infinity-DB: Verifique se as URLs dos bancos estão configuradas no .env');
        return null;
    }
}

// Inicializar ao carregar o servidor
console.log('🚀 Inicializando Infinity-DB...');
initializeInfinityDB();

// Opcional: Adicionar rotas de controle do backup
try {
    const backupRoutes = require('./infinity-db/api/api-routes');
    app.use('/api/backup', backupRoutes);
    console.log('🌐 Infinity-DB: API de controle disponível em /api/backup/*');
} catch (error) {
    console.log('⚠️ Infinity-DB: API de controle não carregada (normal em integração)');
}

// ========================================
// 🚀 SUAS ROTAS NORMAIS (EXEMPLOS)
// ========================================

// Exemplo: Listar usuários
app.get('/api/users', async (req, res) => {
    try {
        // Usar o db normalmente - funciona exatamente como o Neon original!
        const users = await db`SELECT id, name, email, created_at FROM usuarios WHERE active = true`;
        
        res.json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Exemplo: Criar usuário
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validação básica
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Nome, email e senha são obrigatórios'
            });
        }
        
        // Inserir no banco usando Infinity-DB
        const newUser = await db`
            INSERT INTO usuarios (name, email, password, created_at, active) 
            VALUES (${name}, ${email}, ${password}, ${new Date()}, true) 
            RETURNING id, name, email, created_at
        `;
        
        res.status(201).json({
            success: true,
            data: newUser[0],
            message: 'Usuário criado com sucesso'
        });
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        
        // Tratar erro de email duplicado
        if (error.message.includes('duplicate key')) {
            return res.status(409).json({
                success: false,
                error: 'Email já está em uso'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Exemplo: Buscar usuário por ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await db`
            SELECT id, name, email, created_at 
            FROM usuarios 
            WHERE id = ${id} AND active = true
        `;
        
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }
        
        res.json({
            success: true,
            data: user[0]
        });
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Exemplo: Atualizar usuário
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        
        const updatedUser = await db`
            UPDATE usuarios 
            SET name = ${name}, email = ${email}, updated_at = ${new Date()}
            WHERE id = ${id} AND active = true
            RETURNING id, name, email, updated_at
        `;
        
        if (updatedUser.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }
        
        res.json({
            success: true,
            data: updatedUser[0],
            message: 'Usuário atualizado com sucesso'
        });
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Exemplo: Relatório com JOIN
app.get('/api/reports/user-activity', async (req, res) => {
    try {
        const report = await db`
            SELECT 
                u.id,
                u.name,
                u.email,
                COUNT(a.id) as total_appointments,
                MAX(a.created_at) as last_appointment
            FROM usuarios u
            LEFT JOIN agendamentos a ON u.id = a.user_id
            WHERE u.active = true
            GROUP BY u.id, u.name, u.email
            ORDER BY total_appointments DESC
            LIMIT 50
        `;
        
        res.json({
            success: true,
            data: report,
            message: 'Relatório de atividade dos usuários'
        });
    } catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// ========================================
// 🔧 ROTAS DE MONITORAMENTO INFINITY-DB
// ========================================

// Status do sistema de backup
app.get('/api/infinity-status', async (req, res) => {
    try {
        if (!backupScheduler) {
            return res.status(503).json({
                success: false,
                error: 'Sistema de backup não inicializado'
            });
        }
        
        const report = await backupScheduler.getSystemReport();
        
        res.json({
            success: true,
            infinity_db: {
                status: 'active',
                backup_system: 'running',
                last_check: new Date().toISOString(),
                report: report
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// 🛡️ GRACEFUL SHUTDOWN
// ========================================

// Função para parar o sistema graciosamente
function gracefulShutdown(signal) {
    console.log(`\n🛑 Recebido ${signal}, parando servidor...`);
    
    if (backupScheduler) {
        console.log('🔄 Infinity-DB: Parando sistema de backup...');
        backupScheduler.stop();
        console.log('✅ Infinity-DB: Sistema de backup parado');
    }
    
    process.exit(0);
}

// Capturar sinais de parada
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
    console.error('❌ Erro não tratado:', error);
    if (backupScheduler) {
        backupScheduler.stop();
    }
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada:', reason);
    // Não parar o processo, apenas logar
});

// ========================================
// 🚀 INICIAR SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('\n🎉 ========================================');
    console.log('🚀 SERVIDOR INICIADO COM INFINITY-DB');
    console.log('========================================');
    console.log(`🌐 Servidor rodando na porta: ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`📊 Status Infinity-DB: http://localhost:${PORT}/api/infinity-status`);
    if (backupScheduler) {
        console.log('🔄 Sistema de backup: ATIVO');
        console.log('📅 Backup automático: Dias 24 e 25');
        console.log('⚡ Alternância: Dia 25 às 23h');
    } else {
        console.log('⚠️ Sistema de backup: INATIVO');
        console.log('💡 Verifique as configurações no .env');
    }
    console.log('========================================\n');
});

/**
 * 🎯 COMO USAR ESTE EXEMPLO:
 * 
 * 1. Copie este código para o seu arquivo de servidor (app.js, server.js, etc.)
 * 2. Ajuste as rotas conforme sua necessidade
 * 3. Configure o .env na raiz do projeto com DATABASE_URL e DATABASE_URL_BACKUP
 * 4. Execute: cd infinity-db && npm install && npm run init
 * 5. Inicie seu servidor normalmente
 * 
 * 🔄 O INFINITY-DB CUIDARÁ DO RESTO AUTOMATICAMENTE!
 * 
 * - Backup automático nos dias 24 e 25
 * - Alternância automática no dia 25 às 23h
 * - Fallback se um banco falhar
 * - Logs detalhados em infinity-db/data/backup-system.log
 * 
 * ⭐ NUNCA MAIS SE PREOCUPE COM LIMITE DE HORAS DO NEON!
 */
