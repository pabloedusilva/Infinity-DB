#!/usr/bin/env node

/**
 * 🧪 TESTE RÁPIDO DO SISTEMA DE BACKUP
 * Verifica se tudo está funcionando corretamente
 */

const BackupScheduler = require('./core/scheduler');
const config = require('./config/config');

async function testSystem() {
    console.log('🧪 INICIANDO TESTE DO SISTEMA DE BACKUP');
    console.log('=======================================\n');
    
    try {
        console.log('1️⃣ Verificando configurações...');
        console.log(`   • URL Primária: ${config.databases.primary.url ? '✅ Configurada' : '❌ Não configurada'}`);
        console.log(`   • URL Secundária: ${config.databases.secondary.url ? '✅ Configurada' : '❌ Não configurada'}`);
        console.log('');
        
        console.log('2️⃣ Inicializando Scheduler...');
        const scheduler = new BackupScheduler();
        console.log('✅ Scheduler inicializado\n');
        
        console.log('3️⃣ Testando getSystemReport...');
        const report = await scheduler.getSystemReport();
        
        if (report.error) {
            console.error('❌ Erro no relatório:', report.error);
            return;
        }
        
        console.log('✅ Relatório gerado com sucesso');
        console.log('📊 Dados do relatório:');
        console.log(`   • Banco atual: ${report.currentDatabase}`);
        console.log(`   • Scheduler rodando: ${report.scheduler.isRunning}`);
        console.log(`   • Threshold backup: ${report.config.backupThreshold}`);
        console.log(`   • Threshold switch: ${report.config.switchThreshold}`);
        console.log('');
        
        console.log('4️⃣ Status dos bancos:');
        Object.entries(report.databases).forEach(([name, info]) => {
            console.log(`   • ${name.toUpperCase()}: ${info.usage} de uso (${info.queries} queries)`);
            console.log(`     ${info.isActive ? '🟢 ATIVO' : '⚪ INATIVO'}`);
        });
        console.log('');
        
        console.log('✅ SISTEMA FUNCIONANDO CORRETAMENTE!');
        console.log('🌐 Acesse o dashboard em: http://localhost:3001/dashboard');
        
    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar teste
testSystem().then(() => {
    console.log('\n👋 Teste finalizado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});
