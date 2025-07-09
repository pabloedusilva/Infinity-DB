#!/usr/bin/env node

/**
 * 🧪 Teste da API do Sistema de Backup
 * Testa as rotas do dashboard widget
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🧪 TESTANDO API DO SISTEMA DE BACKUP');
console.log('====================================\n');

const baseURL = 'http://localhost:3000/api/backup';

// Função para fazer requisições HTTP simples
function makeRequest(url, method = 'GET') {
    return new Promise((resolve, reject) => {
        const curlCommand = method === 'GET' 
            ? `curl -s "${url}"`
            : `curl -s -X ${method} "${url}"`;
            
        exec(curlCommand, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            
            try {
                const data = JSON.parse(stdout);
                resolve(data);
            } catch (e) {
                resolve({ error: 'Resposta inválida', raw: stdout });
            }
        });
    });
}

async function testBackupAPI() {
    console.log('🔗 1. Testando conexão com servidor...');
    
    try {
        // Teste básico de conectividade
        const testResponse = await makeRequest('http://localhost:3000/servertime');
        if (testResponse.br) {
            console.log(`✅ Servidor online - Hora: ${testResponse.br}`);
        } else {
            console.log('❌ Servidor offline - execute: node server.js');
            return;
        }
    } catch (error) {
        console.log('❌ Erro de conexão - certifique-se que o servidor está rodando');
        console.log('   Execute: node server.js');
        return;
    }
    
    console.log('\n📊 2. Testando endpoint de status...');
    try {
        const status = await makeRequest(`${baseURL}/status`);
        if (status.success) {
            console.log('✅ API /status funcionando');
            console.log(`   • Banco ativo: ${status.report?.currentDatabase?.toUpperCase() || 'N/A'}`);
            if (status.report?.databases) {
                Object.entries(status.report.databases).forEach(([name, info]) => {
                    console.log(`   • ${name.toUpperCase()}: ${info.usage || '0%'} de uso`);
                });
            }
        } else {
            console.log('⚠️ API /status retornou erro:', status.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.log('❌ Erro ao testar /status - pode precisar estar logado');
    }
    
    console.log('\n📝 3. Testando endpoint de logs...');
    try {
        const logs = await makeRequest(`${baseURL}/logs`);
        if (logs.success && logs.logs) {
            console.log('✅ API /logs funcionando');
            console.log(`   • ${logs.logs.length} entradas de log`);
            if (logs.logs.length > 0) {
                console.log('   • Última entrada:', logs.logs[logs.logs.length - 1].substring(0, 100) + '...');
            }
        } else {
            console.log('⚠️ API /logs retornou erro:', logs.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.log('❌ Erro ao testar /logs');
    }
    
    console.log('\n⚙️ 4. Testando endpoint de configuração...');
    try {
        const config = await makeRequest(`${baseURL}/config`);
        if (config.success) {
            console.log('✅ API /config funcionando');
            console.log(`   • Threshold backup: ${config.config?.monitoring?.backupThreshold * 100 || 'N/A'}%`);
            console.log(`   • Threshold switch: ${config.config?.monitoring?.switchThreshold * 100 || 'N/A'}%`);
        } else {
            console.log('⚠️ API /config retornou erro:', config.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.log('❌ Erro ao testar /config');
    }
    
    console.log('\n🎮 5. COMO ACESSAR O DASHBOARD WIDGET:');
    console.log('=====================================');
    console.log('1. Acesse: http://localhost:3000/dashboard/login');
    console.log('2. Login: admin / 1234');
    console.log('3. Dashboard: http://localhost:3000/dashboard/dashboard');
    console.log('4. Role até o final da página');
    console.log('5. Seção: "Sistema de Backup Automático"');
    
    console.log('\n🌐 6. URLS DIRETAS PARA TESTE:');
    console.log('==============================');
    console.log(`• Status: ${baseURL}/status`);
    console.log(`• Logs: ${baseURL}/logs`);
    console.log(`• Config: ${baseURL}/config`);
    console.log(`• Dashboard: http://localhost:3000/dashboard/dashboard`);
    
    console.log('\n✅ TESTE DE API CONCLUÍDO!');
    console.log('===========================');
    console.log('O widget do dashboard estará disponível na página do dashboard');
    console.log('após fazer login como administrador.');
}

testBackupAPI().catch(console.error);
