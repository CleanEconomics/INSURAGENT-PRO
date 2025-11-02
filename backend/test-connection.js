// Test all connections and features
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testConnections() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║         InsurAgent Pro - Connection Test             ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  // 1. Check environment variables
  console.log('📋 1. Checking Environment Variables...');
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
    'JWT_SECRET',
    'DATABASE_URL'
  ];

  let envOk = true;
  for (const key of required) {
    if (process.env[key]) {
      console.log(`   ✅ ${key}: SET`);
    } else {
      console.log(`   ❌ ${key}: NOT SET`);
      envOk = false;
    }
  }

  if (!envOk) {
    console.log('\n❌ Some environment variables are missing!\n');
    return;
  }

  // 2. Test Supabase connection
  console.log('\n📋 2. Testing Supabase Connection...');
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log(`   ❌ Supabase Error: ${error.message}`);
    } else {
      console.log(`   ✅ Supabase Connected Successfully`);
    }
  } catch (err) {
    console.log(`   ❌ Supabase Connection Failed: ${err.message}`);
  }

  // 3. Test PostgreSQL connection
  console.log('\n📋 3. Testing PostgreSQL Connection...');
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const result = await pool.query('SELECT NOW()');
    console.log(`   ✅ PostgreSQL Connected: ${result.rows[0].now}`);
    await pool.end();
  } catch (err) {
    console.log(`   ❌ PostgreSQL Connection Failed: ${err.message}`);
  }

  // 4. Check tables exist
  console.log('\n📋 4. Checking Database Tables...');
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const tables = [
      'users',
      'teams',
      'contacts',
      'client_leads',
      'recruit_leads',
      'opportunities',
      'tasks',
      'appointments',
      'service_tickets',
      'automations',
      'ai_agents'
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: EXISTS (${count || 0} rows)`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: NOT FOUND`);
      }
    }
  } catch (err) {
    console.log(`   ❌ Table check failed: ${err.message}`);
  }

  // 5. Test Gemini AI
  console.log('\n📋 5. Testing Google Gemini AI...');
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Say "Hello" if you can read this');
    const text = result.response.text();
    
    if (text) {
      console.log(`   ✅ Gemini AI Connected: "${text.substring(0, 50)}..."`);
    } else {
      console.log(`   ❌ Gemini AI: No response`);
    }
  } catch (err) {
    console.log(`   ❌ Gemini AI Failed: ${err.message}`);
  }

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║                   Test Complete                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
}

testConnections().catch(console.error);

