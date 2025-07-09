// Direct test of Neon connection without our wrapper
require('dotenv').config({ path: '../.env' });
const { neon } = require('@neondatabase/serverless');

async function testDirectNeon() {
    console.log('🧪 Testing Direct Neon Connection...\n');
    
    try {
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
        
        const sql = neon(process.env.DATABASE_URL);
        
        console.log('1. Testing direct Neon query...');
        const result = await sql`SELECT 1 as test_number`;
        console.log('✅ Direct Neon query result:', result);
        
        console.log('\n2. Testing Neon query with parameter...');
        const testValue = 'hello';
        const result2 = await sql`SELECT ${testValue} as test_param`;
        console.log('✅ Parameterized query result:', result2);
        
        console.log('\n🎉 Direct Neon tests passed!');
        
    } catch (error) {
        console.error('❌ Direct Neon test failed:', error.message);
        console.error('Stack:', error.stack);
    }
    
    process.exit(0);
}

testDirectNeon();
