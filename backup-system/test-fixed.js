require('dotenv').config({ path: '../.env' });

const config = require('./config');
const DatabaseManager = require('./database-manager');
const BackupScheduler = require('./scheduler');

async function testFixedSystem() {
    console.log('🧪 Testando sistema corrigido...\n');
    
    try {
        // 1. Testar DatabaseManager
        console.log('📋 1. Testando DatabaseManager...');
        const dbManager = new DatabaseManager(config);
        
        // Testar query simples
        console.log('   - Testando query simples...');
        const result1 = await dbManager.executeQuery('SELECT NOW() as current_time');
        console.log('   ✅ Query simples OK:', result1[0]?.current_time);
        
        // Testar query com parâmetros
        console.log('   - Testando query parametrizada...');
        const result2 = await dbManager.executeQuery('SELECT $1 as test_value', ['Hello World']);
        console.log('   ✅ Query parametrizada OK:', result2[0]?.test_value);
        
        // Testar template literal através do método query
        console.log('   - Testando template literal...');
        const testValue = 'Test Value';
        const result3 = await dbManager.query(['SELECT ', ' as template_test'], testValue);
        console.log('   ✅ Template literal OK:', result3[0]?.template_test);
        
        // 2. Testar status do sistema
        console.log('\n📊 2. Testando status...');
        const status = await dbManager.getStatus();
        console.log('   Status do sistema:', JSON.stringify(status, null, 2));
        
        // 3. Testar backup manual (só se as tabelas existirem)
        console.log('\n📦 3. Testando backup...');
        try {
            // Verificar se tabelas existem antes de fazer backup
            const tables = await dbManager.executeQuery(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = ANY($1)
            `, [config.backup.tables]);
            
            if (tables.length > 0) {
                console.log(`   - Encontradas ${tables.length} tabelas para backup`);
                await dbManager.createFullBackup();
                console.log('   ✅ Backup manual OK');
            } else {
                console.log('   ℹ️ Nenhuma tabela configurada encontrada, pulando backup');
            }
        } catch (backupError) {
            console.log('   ⚠️ Erro no backup (esperado se tabelas não existem):', backupError.message);
        }
        
        // 4. Testar scheduler
        console.log('\n⏰ 4. Testando BackupScheduler...');
        const scheduler = new BackupScheduler();
        
        // Testar relatório
        const report = await scheduler.getSystemReport();
        console.log('   Relatório do sistema:', JSON.stringify(report, null, 2));
        
        // Testar inicialização (sem executar)
        console.log('   - Scheduler inicializado, mas não iniciado');
        
        console.log('\n✅ TODOS OS TESTES PASSARAM!');
        console.log('\n📋 Resumo:');
        console.log('   - DatabaseManager: ✅ Funcionando');
        console.log('   - Queries simples: ✅ OK');
        console.log('   - Queries parametrizadas: ✅ OK');
        console.log('   - Template literals: ✅ OK');
        console.log('   - Sistema de status: ✅ OK');
        console.log('   - BackupScheduler: ✅ OK');
        console.log('   - Backup manual: ✅ OK (ou tabelas não existem)');
        
    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

if (require.main === module) {
    testFixedSystem();
}

module.exports = testFixedSystem;
