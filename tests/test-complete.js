#!/usr/bin/env node

/**
 * 🧪 Script de Teste Completo do Sistema de Backup
 * Testa todas as funcionalidades do sistema de backup automático
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const config = require('./config');
const DatabaseManager = require('./database-manager');
const BackupScheduler = require('./scheduler');

console.log('🚀 TESTE COMPLETO DO SISTEMA DE BACKUP NEON');
console.log('==========================================\n');

async function runCompleteTests() {
    console.log('📋 1. VERIFICAÇÃO INICIAL');
    console.log('==========================');
    
    // Verificar configurações
    console.log('🔍 Verificando configurações...');
    console.log(`• Banco Primário: ${config.databases.primary.url ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`• Banco Secundário: ${config.databases.secondary.url ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`• Limite Mensal: ${config.databases.primary.monthlyLimit / (60 * 60 * 1000)}h`);
    console.log(`• Threshold Backup: ${config.monitoring.backupThreshold * 100}%`);
    console.log(`• Threshold Switch: ${config.monitoring.switchThreshold * 100}%`);
    
    if (!config.databases.secondary.url || config.databases.secondary.url.includes('seu_usuario_2')) {
        console.log('\n❌ ERRO: DATABASE_URL_BACKUP não está configurado!');
        console.log('📋 Configure no .env com a URL do seu segundo banco Neon');
        console.log('Exemplo: DATABASE_URL_BACKUP=\'postgresql://user:pass@host/db?sslmode=require\'');
        return;
    }
    
    console.log('\n📋 2. TESTE DE CONEXÕES');
    console.log('=======================');
    
    try {
        const dbManager = new DatabaseManager(config);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar inicialização
        
        console.log('✅ DatabaseManager inicializado');
        
        // Testar conexão primária
        console.log('🔍 Testando conexão primária...');
        try {
            await dbManager.connections.primary`SELECT 1 as test`;
            console.log('✅ Conexão primária funcionando');
        } catch (error) {
            console.log('❌ Erro na conexão primária:', error.message);
        }
        
        // Testar conexão secundária
        console.log('🔍 Testando conexão secundária...');
        try {
            await dbManager.connections.secondary`SELECT 1 as test`;
            console.log('✅ Conexão secundária funcionando');
        } catch (error) {
            console.log('❌ Erro na conexão secundária:', error.message);
        }
        
        console.log('\n📋 3. TESTE DE STATUS');
        console.log('=====================');
        
        const status = await dbManager.getStatus();
        console.log('📊 Status atual:');
        console.log(JSON.stringify(status, null, 2));
        
        console.log('\n📋 4. TESTE DE THRESHOLDS');
        console.log('=========================');
        
        // Simular uso alto para backup
        console.log('🔍 Simulando 87% de uso...');
        const originalUsage = dbManager.usageTracking.primary.monthlyUsage;
        dbManager.usageTracking.primary.monthlyUsage = config.databases.primary.monthlyLimit * 0.87;
        
        const shouldBackup = await dbManager.shouldBackup();
        console.log(`• Deve fazer backup: ${shouldBackup ? '✅ SIM' : '❌ NÃO'}`);
        
        // Simular uso crítico para switch
        console.log('🔍 Simulando 95% de uso...');
        dbManager.usageTracking.primary.monthlyUsage = config.databases.primary.monthlyLimit * 0.95;
        
        const shouldSwitch = await dbManager.shouldSwitchDatabase();
        console.log(`• Deve trocar banco: ${shouldSwitch ? '✅ SIM' : '❌ NÃO'}`);
        
        // Restaurar uso original
        dbManager.usageTracking.primary.monthlyUsage = originalUsage;
        
        console.log('\n📋 5. TESTE DE QUERIES');
        console.log('======================');
        
        try {
            // Testar query template literal
            console.log('🔍 Testando query template literal...');
            const result1 = await dbManager.query`SELECT ${'Teste funcionando!'} as message`;
            console.log('✅ Query com parâmetros funcionando:', result1[0]?.message);
        } catch (error) {
            console.log('⚠️ Query com parâmetros (normal em ambiente de teste):', error.message.split('\n')[0]);
        }
        
        console.log('\n📋 6. TESTE DO SCHEDULER');
        console.log('========================');
        
        console.log('🔍 Testando scheduler...');
        const scheduler = new BackupScheduler();
        
        // Gerar relatório de sistema
        const report = await scheduler.getSystemReport();
        console.log('📊 Relatório do sistema:');
        console.log(JSON.stringify(report, null, 2));
        
        console.log('\n📋 7. ARQUIVOS DE MONITORAMENTO');
        console.log('===============================');
        
        const fs = require('fs');
        
        // Verificar arquivos de uso
        const files = [
            'usage-primary.json',
            'usage-secondary.json',
            'backup-system.log'
        ];
        
        for (const file of files) {
            if (fs.existsSync(file)) {
                console.log(`✅ ${file} existe`);
                if (file.endsWith('.json')) {
                    try {
                        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                        console.log(`   📊 Queries: ${data.queries}, Uso: ${(data.monthlyUsage / (60 * 60 * 1000)).toFixed(2)}h`);
                    } catch (e) {
                        console.log(`   ⚠️ Erro ao ler ${file}`);
                    }
                }
            } else {
                console.log(`⚠️ ${file} não existe (será criado automaticamente)`);
            }
        }
        
        console.log('\n📋 8. COMANDOS DISPONÍVEIS');
        console.log('=========================');
        
        console.log('🎮 Para testar o sistema completo:');
        console.log('• node standalone.js         - Modo interativo');
        console.log('• npm run status            - Ver status atual');
        console.log('• npm run backup            - Forçar backup');
        console.log('• npm run switch            - Forçar troca de banco');
        console.log('• node initialize.js        - Inicializar banco secundário');
        
        console.log('\n🎉 TESTE COMPLETO FINALIZADO!');
        console.log('==============================');
        
        if (shouldBackup || shouldSwitch) {
            console.log('⚠️  Sistema pronto para operar com backup automático');
        } else {
            console.log('✅ Sistema funcionando normalmente');
        }
        
        console.log('\n💡 PRÓXIMOS PASSOS:');
        console.log('1. Se ainda não fez, execute: node initialize.js');
        console.log('2. Inicie sua aplicação normalmente');
        console.log('3. O backup funcionará automaticamente');
        console.log('4. Monitore logs em: backup-system.log');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
        console.log('\n🔧 DICAS PARA SOLUÇÃO:');
        console.log('1. Verifique as URLs dos bancos no .env');
        console.log('2. Confirme que ambos os bancos Neon estão ativos');
        console.log('3. Execute: node initialize.js');
    }
}

runCompleteTests().catch(console.error);
