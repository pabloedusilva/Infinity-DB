const config = require('../config/config');
const DatabaseManager = require('./database-manager');

// Instância global do gerenciador de banco
let dbManager = null;

// Inicializar o sistema de backup
function initializeBackupSystem() {
    if (!dbManager) {
        dbManager = new DatabaseManager(config);
        console.log('🔧 Sistema de backup inicializado');
    }
    return dbManager;
}

// Wrapper que substitui o neon original
function createSmartDatabase() {
    const manager = initializeBackupSystem();
    
    // Retorna uma função que funciona como o neon original
    function smartDb(strings, ...values) {
        if (typeof strings === 'string') {
            // Query simples: db('SELECT * FROM table', [params])
            const params = values.length > 0 ? values[0] : [];
            return manager.executeQuery(strings, params);
        } else if (Array.isArray(strings)) {
            // Template literals: db`SELECT * FROM table WHERE id = ${id}`
            return manager.query(strings, ...values);
        } else {
            throw new Error('Formato de query inválido');
        }
    }
    
    // Adicionar método query para compatibilidade com uso antigo
    smartDb.query = function(queryString, params = []) {
        return manager.executeQuery(queryString, params);
    };
    
    return smartDb;
}

module.exports = createSmartDatabase();
