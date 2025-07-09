/**
 * 🔄 Mais Horas - Database Manager
 * 
 * Sistema inteligente de monitoramento e backup automático
 * de bancos de dados Neon com dashboard web e API REST.
 * 
 * @author Pablo Eduardo Silva
 * @version 1.0.0
 */

// Para usar como aplicação independente
const app = require('./app');

// Exportar componentes para uso programático
module.exports = {
    // Aplicação Express
    app: app,
    
    // Core do sistema
    SmartDatabase: require('./core/smart-db'),
    DatabaseManager: require('./core/database-manager'), 
    BackupScheduler: require('./core/scheduler'),
    
    // Configurações
    config: require('./config/config'),
    
    // API Routes
    apiRoutes: require('./api/api-routes'),
    
    // Utilitários
    utils: {
        initializeDatabase: require('./scripts/initialize'),
        initializeSimple: require('./scripts/init-simple')
    }
};

// Para uso direto como substituto do neon (compatibilidade)
module.exports.default = require('./core/smart-db');
