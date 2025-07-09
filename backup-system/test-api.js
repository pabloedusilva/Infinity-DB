require('dotenv').config({ path: '../.env' });

const express = require('express');
const config = require('./config');
const apiRoutes = require('./api-routes');

async function testAPIEndpoints() {
    console.log('🧪 Testando endpoints da API...\n');
    
    const app = express();
    app.use(express.json());
    
    // Mock middleware auth para teste
    app.use('/api/backup', (req, res, next) => {
        req.user = { id: 1, username: 'test' }; // Mock user
        next();
    }, apiRoutes);
    
    const server = app.listen(3001, () => {
        console.log('🚀 Servidor de teste iniciado na porta 3001');
    });
    
    try {
        // Aguardar um pouco para o servidor inicializar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simular chamadas da API
        const baseURL = 'http://localhost:3001/api/backup';
        
        console.log('📊 1. Testando /status...');
        try {
            const response = await fetch(`${baseURL}/status`);
            const data = await response.json();
            console.log('   Status:', data.success ? '✅' : '❌');
            console.log('   Database atual:', data.report?.currentDatabase);
            console.log('   Databases:', Object.keys(data.report?.databases || {}));
        } catch (err) {
            console.log('   ❌ Erro:', err.message);
        }
        
        console.log('\n📋 2. Testando /logs...');
        try {
            const response = await fetch(`${baseURL}/logs`);
            const data = await response.json();
            console.log('   Logs:', data.success ? '✅' : '❌');
            console.log('   Total de linhas:', data.totalLines);
            console.log('   Últimas linhas:', data.logs?.slice(-3));
        } catch (err) {
            console.log('   ❌ Erro:', err.message);
        }
        
        console.log('\n🔧 3. Testando /config...');
        try {
            const response = await fetch(`${baseURL}/config`);
            const data = await response.json();
            console.log('   Config:', data.success ? '✅' : '❌');
            console.log('   Threshold backup:', data.config?.monitoring?.backupThreshold);
            console.log('   Threshold switch:', data.config?.monitoring?.switchThreshold);
        } catch (err) {
            console.log('   ❌ Erro:', err.message);
        }
        
        console.log('\n📦 4. Testando /force-backup...');
        try {
            const response = await fetch(`${baseURL}/force-backup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            console.log('   Backup forçado:', data.success ? '✅' : '❌');
            console.log('   Mensagem:', data.message);
        } catch (err) {
            console.log('   ❌ Erro:', err.message);
        }
        
        console.log('\n🔄 5. Testando /force-switch...');
        try {
            const response = await fetch(`${baseURL}/force-switch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            console.log('   Switch forçado:', data.success ? '✅' : '❌');
            console.log('   Mensagem:', data.message);
        } catch (err) {
            console.log('   ❌ Erro:', err.message);
        }
        
        console.log('\n✅ TESTES DA API CONCLUÍDOS!');
        
    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error);
    } finally {
        server.close();
        console.log('🛑 Servidor de teste encerrado');
    }
}

if (require.main === module) {
    testAPIEndpoints();
}

module.exports = testAPIEndpoints;
