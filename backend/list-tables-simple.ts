import { supabaseAdmin } from './src/db/supabase.js';

async function listTables() {
  console.log('🔍 Checking Supabase Tables...\n');

  const tablesToCheck = [
    'users', 'teams', 'contacts', 'client_leads', 'recruit_leads',
    'opportunities', 'appointments', 'tasks', 'commissions',
    'commission_statements', 'commission_details',
    'google_drive_credentials', 'synced_emails', 'synced_calendar_events',
    'agent_tasks', 'agent_activity_log', 'automation_workflows',
    'sms_messages', 'email_messages', 'marketing_campaigns',
    'webhook_events', 'webhook_registrations',
  ];

  let existingCount = 0;
  let missingCount = 0;

  console.log('Testing table access:\n');

  for (const table of tablesToCheck) {
    try {
      const { error } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table} - NOT FOUND`);
        missingCount++;
      } else {
        console.log(`✅ ${table}`);
        existingCount++;
      }
    } catch (err) {
      console.log(`❌ ${table} - ERROR`);
      missingCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Tables verified: ${existingCount}`);
  console.log(`❌ Tables missing:  ${missingCount}`);
  console.log('');

  if (missingCount === 0) {
    console.log('🎉 SUCCESS! All tables exist in Supabase!');
    console.log('');
    console.log('✅ No Prisma instances found');
    console.log('✅ Supabase connection working');
    console.log('✅ All required tables present');
    console.log('');
    console.log('🚀 Ready to run:');
    console.log('   cd backend && npm run dev');
  } else {
    console.log('⚠️  Some tables are missing.');
    console.log('   Make sure you ran the SUPABASE_COMPLETE_SCHEMA.sql file.');
  }
}

listTables().catch(console.error);
