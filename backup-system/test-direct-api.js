#!/usr/bin/env node

/**
 * 🧪 TESTE DIRETO DA API DE BACKUP
 * Testa as funções de backup diretamente sem passar pela autenticação
 */

require('dotenv').config({ path: '../.env' });
const BackupScheduler = require('./scheduler');

async function testDirectAPI() {
    console.log('🧪 TESTE DIRETO DA API DE BACKUP');
    console.log('================================\n');
    
    try {
        console.log('1️⃣ Inicializando BackupScheduler...');
        const scheduler = new BackupScheduler();
        console.log('✅ Scheduler inicializado\n');
        
        console.log('2️⃣ Testando getSystemReport...');
        const report = await scheduler.getSystemReport();
        console.log('📊 Relatório do sistema:');
        console.log(JSON.stringify(report, null, 2));
        console.log('✅ Relatório obtido com sucesso\n');
        
        console.log('3️⃣ Testando forceBackup...');
        const backupResult = await scheduler.forceBackup();
        console.log(`📦 Resultado do backup: ${backupResult ? '✅ Sucesso' : '❌ Falha'}\n`);
        
        console.log('4️⃣ Testando forceDatabaseSwitch...');
        const switchResult = await scheduler.forceDatabaseSwitch();
        console.log(`🔄 Resultado da troca: ${switchResult ? '✅ Sucesso' : '❌ Falha'}\n`);
        
        console.log('5️⃣ Verificando novo status após operações...');
        const finalReport = await scheduler.getSystemReport();
        console.log('📊 Relatório final:');
        console.log(JSON.stringify(finalReport, null, 2));
        
        console.log('\n✅ TESTE DIRETO CONCLUÍDO!');
        
    } catch (error) {
        console.error('❌ Erro no teste direto:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar teste
testDirectAPI().then(() => {
    console.log('\n👋 Teste finalizado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});
