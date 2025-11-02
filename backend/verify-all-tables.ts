import { supabaseAdmin } from './src/db/supabase.js';

/**
 * Verify All Tables Exist in Supabase
 */

const EXPECTED_TABLES = [
  // Core CRM
  'users', 'teams', 'contacts', 'policies',
  'client_leads', 'recruit_leads', 'agent_candidates',
  'opportunities', 'appointments', 'tasks', 'activities',
  'service_tickets', 'ticket_messages',
  'knowledge_resources', 'training_modules',
  'commissions', 'commission_statements', 'commission_details',
  'email_campaigns', 'messages', 'notifications',
  'dnc_entries', 'rescinded_responses', 'automations',

  // Messaging
  'user_phone_numbers', 'sms_messages', 'email_messages',
  'message_templates', 'message_threads', 'message_queue',
  'messaging_analytics', 'messaging_quotas',
  'marketing_campaigns', 'do_not_contact',

  // Google Integration
  'google_drive_credentials', 'drive_file_references',
  'training_data_references', 'drive_file_content_cache',
  'copilot_knowledge_base', 'drive_folders', 'drive_file_access_log',
  'google_sync_settings', 'synced_emails', 'email_attachments',
  'email_threads', 'synced_calendar_events', 'google_sync_history',

  // Templates
  'calendar_availability', 'email_templates_v2', 'calendar_event_templates',

  // AI & Automation
  'agent_tasks', 'agent_activity_log', 'ai_agents',
  'automation_workflows', 'automation_executions',

  // Webhooks
  'webhook_registrations', 'webhook_events',
  'email_linking_rules', 'email_auto_link_log',
];

async function verifyTables() {
  console.log('🔍 Verifying Supabase Tables...\n');
  console.log(`Expected tables: ${EXPECTED_TABLES.length}\n`);

  try {
    // Get all tables from database
    const { data: tables, error } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
      .order('table_name');

    if (error) {
      console.error('❌ Error fetching tables:', error.message);
      return;
    }

    const tableNames = tables.map((t: any) => t.table_name);
    console.log(`✅ Found ${tableNames.length} tables in Supabase\n`);

    // Check which expected tables exist
    const missing: string[] = [];
    const found: string[] = [];

    for (const expectedTable of EXPECTED_TABLES) {
      if (tableNames.includes(expectedTable)) {
        found.push(expectedTable);
      } else {
        missing.push(expectedTable);
      }
    }

    // Report results
    console.log('✅ Tables Present:', found.length);
    console.log('❌ Tables Missing:', missing.length);
    console.log('');

    if (missing.length > 0) {
      console.log('❌ MISSING TABLES:');
      missing.forEach(table => console.log(`   - ${table}`));
      console.log('');
    }

    if (found.length > 0) {
      console.log('✅ VERIFIED TABLES:');
      found.forEach(table => console.log(`   ✓ ${table}`));
      console.log('');
    }

    // Extra tables (not in expected list)
    const extra = tableNames.filter((t: string) => !EXPECTED_TABLES.includes(t));
    if (extra.length > 0) {
      console.log('ℹ️  ADDITIONAL TABLES (not in expected list):');
      extra.forEach((table: string) => console.log(`   + ${table}`));
      console.log('');
    }

    // Summary
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total tables in database: ${tableNames.length}`);
    console.log(`Expected tables found:    ${found.length}/${EXPECTED_TABLES.length}`);
    console.log(`Missing tables:           ${missing.length}`);
    console.log(`Additional tables:        ${extra.length}`);
    console.log('');

    if (missing.length === 0) {
      console.log('✅ SUCCESS! All required tables exist in Supabase!');
      console.log('');
      console.log('🚀 Your app is ready to run:');
      console.log('   1. Backend: npm run dev');
      console.log('   2. Frontend: npm run dev (in root directory)');
    } else {
      console.log('⚠️  Some tables are missing. You may need to run the schema again.');
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

verifyTables().catch(console.error);
