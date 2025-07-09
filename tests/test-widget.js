/**
 * TESTE ESPECÍFICO DO WIDGET DE BACKUP
 * =====================================
 * Este script testa as funcionalidades do widget de backup integrado ao dashboard
 */

require('dotenv').config({ path: '../.env' });
const http = require('http');
const path = require('path');

// Configurações
const BASE_URL = 'http://localhost:3000';
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

/**
 * Função para fazer requisições HTTP
 */
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, data: jsonData, headers: res.headers });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

/**
 * Função para fazer login e obter cookies de sessão
 */
async function login() {
    console.log('🔐 FAZENDO LOGIN...');
    
    const loginData = JSON.stringify(ADMIN_CREDENTIALS);
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/dashboard/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };

    try {
        const response = await makeRequest(options, loginData);
        console.log(`✅ Login Status: ${response.statusCode}`);
        
        // Extrair cookies de sessão
        const setCookieHeaders = response.headers['set-cookie'];
        const sessionCookie = setCookieHeaders ? setCookieHeaders.find(cookie => cookie.startsWith('connect.sid=')) : null;
        
        if (sessionCookie) {
            console.log('✅ Cookie de sessão obtido');
            return sessionCookie.split(';')[0]; // Retorna apenas o cookie sem os atributos
        } else {
            console.log('⚠️ Cookie de sessão não encontrado');
            return null;
        }
    } catch (error) {
        console.error('❌ Erro no login:', error.message);
        return null;
    }
}

/**
 * Função para testar a API de status do backup
 */
async function testBackupStatus(sessionCookie) {
    console.log('\n📊 TESTANDO API DE STATUS...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/backup/status',
        method: 'GET',
        headers: {}
    };

    if (sessionCookie) {
        options.headers['Cookie'] = sessionCookie;
    }

    try {
        const response = await makeRequest(options);
        console.log(`Status Code: ${response.statusCode}`);
        
        if (response.statusCode === 200 && response.data) {
            console.log('✅ API de Status funcionando');
            console.log('📋 Dados recebidos:');
            console.log(JSON.stringify(response.data, null, 2));
            return response.data;
        } else {
            console.log('⚠️ API de Status retornou:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro ao testar status:', error.message);
        return null;
    }
}

/**
 * Função para testar a API de logs do backup
 */
async function testBackupLogs(sessionCookie) {
    console.log('\n📝 TESTANDO API DE LOGS...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/backup/logs',
        method: 'GET',
        headers: {}
    };

    if (sessionCookie) {
        options.headers['Cookie'] = sessionCookie;
    }

    try {
        const response = await makeRequest(options);
        console.log(`Status Code: ${response.statusCode}`);
        
        if (response.statusCode === 200 && response.data) {
            console.log('✅ API de Logs funcionando');
            console.log(`📋 Número de logs: ${response.data.logs ? response.data.logs.length : 0}`);
            
            if (response.data.logs && response.data.logs.length > 0) {
                console.log('📋 Últimos 3 logs:');
                response.data.logs.slice(-3).forEach((log, index) => {
                    console.log(`  ${index + 1}. ${log}`);
                });
            }
            return response.data;
        } else {
            console.log('⚠️ API de Logs retornou:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro ao testar logs:', error.message);
        return null;
    }
}

/**
 * Função para testar forçar backup
 */
async function testForceBackup(sessionCookie) {
    console.log('\n💾 TESTANDO FORÇAR BACKUP...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/backup/force-backup',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (sessionCookie) {
        options.headers['Cookie'] = sessionCookie;
    }

    try {
        const response = await makeRequest(options);
        console.log(`Status Code: ${response.statusCode}`);
        
        if (response.statusCode === 200 && response.data) {
            console.log('✅ API de Forçar Backup funcionando');
            console.log('📋 Resposta:', response.data);
            return response.data;
        } else {
            console.log('⚠️ API de Forçar Backup retornou:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro ao testar forçar backup:', error.message);
        return null;
    }
}

/**
 * Função para verificar se o widget está acessível
 */
async function testWidgetAccess(sessionCookie) {
    console.log('\n🎛️ TESTANDO ACESSO AO WIDGET...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/dashboard/dashboard',
        method: 'GET',
        headers: {}
    };

    if (sessionCookie) {
        options.headers['Cookie'] = sessionCookie;
    }

    try {
        const response = await makeRequest(options);
        console.log(`Status Code: ${response.statusCode}`);
        
        if (response.statusCode === 200) {
            const htmlContent = response.data;
            
            // Verificar se o widget está presente no HTML
            const hasBackupWidget = htmlContent.includes('Sistema de Backup Automático');
            const hasBackupControls = htmlContent.includes('refreshBackupStatus');
            const hasBackupCards = htmlContent.includes('backup-card');
            
            console.log(`✅ Dashboard carregado (${htmlContent.length} caracteres)`);
            console.log(`📊 Widget de Backup presente: ${hasBackupWidget ? '✅ SIM' : '❌ NÃO'}`);
            console.log(`🎛️ Controles de Backup presentes: ${hasBackupControls ? '✅ SIM' : '❌ NÃO'}`);
            console.log(`💳 Cards de Status presentes: ${hasBackupCards ? '✅ SIM' : '❌ NÃO'}`);
            
            return {
                accessible: true,
                hasWidget: hasBackupWidget,
                hasControls: hasBackupControls,
                hasCards: hasBackupCards
            };
        } else {
            console.log('⚠️ Dashboard não acessível:', response.statusCode);
            return { accessible: false };
        }
    } catch (error) {
        console.error('❌ Erro ao testar widget:', error.message);
        return { accessible: false, error: error.message };
    }
}

/**
 * Função principal de teste
 */
async function runWidgetTests() {
    console.log('🚀 TESTE DO WIDGET DE BACKUP AUTOMÁTICO');
    console.log('=========================================');
    
    try {
        // 1. Fazer login para obter sessão
        const sessionCookie = await login();
        
        if (!sessionCookie) {
            console.log('❌ Não foi possível fazer login. Testando sem autenticação...');
        }
        
        // 2. Testar acesso ao widget
        const widgetResult = await testWidgetAccess(sessionCookie);
        
        // 3. Testar APIs do backup
        const statusResult = await testBackupStatus(sessionCookie);
        const logsResult = await testBackupLogs(sessionCookie);
        
        // 4. Testar forçar backup (opcional)
        // const backupResult = await testForceBackup(sessionCookie);
        
        // 5. Resumo dos resultados
        console.log('\n📋 RESUMO DOS TESTES');
        console.log('====================');
        console.log(`🔐 Login: ${sessionCookie ? '✅ OK' : '❌ FALHOU'}`);
        console.log(`🎛️ Widget Acessível: ${widgetResult.accessible ? '✅ OK' : '❌ FALHOU'}`);
        
        if (widgetResult.accessible) {
            console.log(`   📊 Widget de Backup: ${widgetResult.hasWidget ? '✅ OK' : '❌ FALHOU'}`);
            console.log(`   🎛️ Controles: ${widgetResult.hasControls ? '✅ OK' : '❌ FALHOU'}`);
            console.log(`   💳 Cards de Status: ${widgetResult.hasCards ? '✅ OK' : '❌ FALHOU'}`);
        }
        
        console.log(`📊 API Status: ${statusResult ? '✅ OK' : '❌ FALHOU'}`);
        console.log(`📝 API Logs: ${logsResult ? '✅ OK' : '❌ FALHOU'}`);
        
        // Instruções finais
        console.log('\n💡 COMO ACESSAR O WIDGET:');
        console.log('=========================');
        console.log('1. Abra o navegador em: http://localhost:3000/dashboard/dashboard');
        console.log('2. Faça login com: admin / admin123');
        console.log('3. Role até o final da página para ver o "Sistema de Backup Automático"');
        console.log('4. O widget atualiza automaticamente a cada 30 segundos');
        console.log('5. Use os botões "Atualizar", "Backup" e "Alternar" para controlar o sistema');
        
        if (statusResult && statusResult.success) {
            console.log('\n📊 STATUS ATUAL DOS BANCOS:');
            console.log('===========================');
            if (statusResult.report && statusResult.report.databases) {
                Object.entries(statusResult.report.databases).forEach(([dbName, dbData]) => {
                    console.log(`${dbName}: ${dbData.usage} - ${dbData.isActive ? 'ATIVO' : 'STANDBY'}`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Erro geral nos testes:', error.message);
    }
}

// Executar os testes
if (require.main === module) {
    runWidgetTests().catch(console.error);
}

module.exports = {
    runWidgetTests,
    testBackupStatus,
    testBackupLogs,
    testForceBackup,
    testWidgetAccess
};
