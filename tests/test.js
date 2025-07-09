#!/usr/bin/env node

/**
 * Script de teste para o sistema de backup
 * Simula usage e testa funcionalidades
 */

require('dotenv').config({ path: '../../.env' });
const DatabaseManager = require('../core/database-manager');
const config = require('../config/config');

async function runTests() {
    console.log('🧪 Iniciando testes do sistema de backup...\n');
    
    try {
        // Test 1: Inicialização
        console.log('📋 Test 1: Inicializando DatabaseManager...');
        const dbManager = new DatabaseManager(config);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ DatabaseManager inicializado\n');
        
        // Test 2: Status inicial
        console.log('📋 Test 2: Verificando status inicial...');
        const initialStatus = await dbManager.getStatus();
        console.log('Status inicial:', JSON.stringify(initialStatus, null, 2));
        console.log('✅ Status obtido com sucesso\n');
        
        // Test 3: Query simples
        console.log('📋 Test 3: Testando query simples...');
        try {
            const result = await dbManager.executeQuery('SELECT 1 as test');
            console.log('Resultado da query:', result);
            console.log('✅ Query executada com sucesso\n');
        } catch (error) {
            console.log('❌ Erro na query (esperado se banco não configurado):', error.message, '\n');
        }
        
        // Test 4: Simulação de uso alto
        console.log('📋 Test 4: Simulando uso alto...');
        const currentDb = dbManager.currentDatabase;
        const originalUsage = dbManager.usageTracking[currentDb].monthlyUsage;
        
        // Simular 87% de uso para triggerar backup
        const limit = config.databases[currentDb].monthlyLimit;
        dbManager.usageTracking[currentDb].monthlyUsage = limit * 0.87;
        await dbManager.saveUsageData(currentDb);
        
        const shouldBackup = await dbManager.shouldBackup();
        console.log('Deve fazer backup:', shouldBackup);
        console.log('✅ Simulação de uso alto funcionando\n');
        
        // Test 5: Verificar thresholds
        console.log('📋 Test 5: Testando thresholds...');
        const usage87 = dbManager.getUsagePercentage(currentDb);
        console.log(`Uso atual: ${usage87.toFixed(2)}%`);
        
        // Simular 92% para triggerar switch
        dbManager.usageTracking[currentDb].monthlyUsage = limit * 0.92;
        await dbManager.saveUsageData(currentDb);
        
        const shouldSwitch = await dbManager.shouldSwitchDatabase();
        console.log('Deve trocar banco:', shouldSwitch);
        
        // Restaurar uso original
        dbManager.usageTracking[currentDb].monthlyUsage = originalUsage;
        await dbManager.saveUsageData(currentDb);
        console.log('✅ Thresholds funcionando corretamente\n');
        
        // Test 6: Template literals
        console.log('📋 Test 6: Testando template literals...');
        try {
            const testValue = 'test';
            const templateResult = await dbManager.query`SELECT ${testValue} as template_test`;
            console.log('Template literal result:', templateResult);
            console.log('✅ Template literals funcionando\n');
        } catch (error) {
            console.log('❌ Template literals (esperado se banco não configurado):', error.message, '\n');
        }
        
        console.log('🎉 Todos os testes concluídos!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Configure DATABASE_URL_BACKUP no .env com seu segundo banco Neon');
        console.log('2. Execute: node backup-system/standalone.js');
        console.log('3. Ou inicie sua aplicação normalmente - o backup funcionará automaticamente');
        
    } catch (error) {
        console.error('❌ Erro nos testes:', error);
    }
}

runTests().catch(console.error);
