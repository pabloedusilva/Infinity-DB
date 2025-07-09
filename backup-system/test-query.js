// Test script to verify the query method is working properly
require('dotenv').config({ path: '../.env' });

const DatabaseManager = require('./database-manager');
const config = require('./config');

async function testQueries() {
    console.log('🧪 Testing Query Methods...\n');
    
    try {
        const manager = new DatabaseManager(config);
        
        // Wait a moment for initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('1. Testing simple query without parameters...');
        const result1 = await manager.query`SELECT 1 as test_number`;
        console.log('✅ Simple query result:', result1);
        
        console.log('\n2. Testing query with one parameter...');
        const testValue = 'hello';
        const result2 = await manager.query`SELECT ${testValue} as test_param`;
        console.log('✅ One parameter query result:', result2);
        
        console.log('\n🎉 All query tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
    
    process.exit(0);
}

testQueries();
