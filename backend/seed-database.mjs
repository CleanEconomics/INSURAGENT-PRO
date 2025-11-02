// Seed database with demo data
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedDatabase() {
  console.log('🌱 Seeding InsurAgent Pro Database...\n');

  try {
    // 1. Create demo users
    console.log('👤 Creating users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        name: 'Jane Doe',
        email: 'jane@insuragent.com',
        password_hash: passwordHash,
        role: 'Sales Manager',
        avatar_url: 'https://picsum.photos/seed/jane/40/40'
      },
      {
        name: 'John Smith',
        email: 'john@insuragent.com',
        password_hash: passwordHash,
        role: 'Agent/Producer',
        avatar_url: 'https://picsum.photos/seed/john/40/40'
      },
      {
        name: 'Maria Garcia',
        email: 'maria@insuragent.com',
        password_hash: passwordHash,
        role: 'Agent/Producer',
        avatar_url: 'https://picsum.photos/seed/maria/40/40'
      }
    ];

    for (const user of users) {
      const { error } = await supabase.from('users').insert(user);
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ❌ Error creating ${user.name}: ${error.message}`);
      } else {
        console.log(`   ✅ Created user: ${user.name}`);
      }
    }

    // Get user IDs
    const { data: usersData } = await supabase.from('users').select('*');
    const janeId = usersData?.find(u => u.email === 'jane@insuragent.com')?.id;
    const johnId = usersData?.find(u => u.email === 'john@insuragent.com')?.id;

    // 2. Create demo teams
    console.log('\n👥 Creating teams...');
    const teams = [
      {
        name: 'Sales Team Alpha',
        manager_id: janeId
      },
      {
        name: 'P&C Division',
        manager_id: johnId
      }
    ];

    for (const team of teams) {
      const { error } = await supabase.from('teams').insert(team);
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Created team: ${team.name}`);
      }
    }

    // 3. Create contacts
    console.log('\n👤 Creating contacts...');
    const contacts = [
      {
        name: 'Michael Chen',
        email: 'm.chen@example.com',
        phone: '555-0101',
        tags: ['High Value', 'Life'],
        avatar_url: 'https://picsum.photos/seed/mchen/40/40',
        created_by: janeId
      },
      {
        name: 'Sarah Johnson',
        email: 's.johnson@example.com',
        phone: '555-0102',
        tags: ['Referral'],
        avatar_url: 'https://picsum.photos/seed/sjohnson/40/40',
        created_by: janeId
      },
      {
        name: 'David Lee',
        email: 'd.lee@example.com',
        phone: '555-0103',
        tags: ['P&C', 'Auto'],
        avatar_url: 'https://picsum.photos/seed/dlee/40/40',
        created_by: johnId
      },
      {
        name: 'Emily White',
        email: 'e.white@example.com',
        phone: '555-0104',
        tags: ['New Lead'],
        avatar_url: 'https://picsum.photos/seed/ewhite/40/40',
        created_by: johnId
      }
    ];

    for (const contact of contacts) {
      const { error } = await supabase.from('contacts').insert(contact);
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Created contact: ${contact.name}`);
      }
    }

    // 4. Create client leads
    console.log('\n📋 Creating client leads...');
    const clientLeads = [
      {
        name: 'Robert Martinez',
        email: 'r.martinez@example.com',
        phone: '555-0105',
        status: 'New',
        source: 'Web Form',
        assigned_to_id: janeId,
        avatar_url: 'https://picsum.photos/seed/rmartinez/40/40',
        score: 70,
        priority: 'High'
      },
      {
        name: 'Lisa Anderson',
        email: 'l.anderson@example.com',
        phone: '555-0106',
        status: 'Contacted',
        source: 'Referral',
        assigned_to_id: janeId,
        avatar_url: 'https://picsum.photos/seed/landerson/40/40',
        score: 85,
        priority: 'High'
      },
      {
        name: 'James Wilson',
        email: 'j.wilson@example.com',
        phone: '555-0107',
        status: 'Working',
        source: 'Cold Call',
        assigned_to_id: johnId,
        avatar_url: 'https://picsum.photos/seed/jwilson/40/40',
        score: 45,
        priority: 'Medium'
      },
      {
        name: 'Jennifer Brown',
        email: 'j.brown@example.com',
        phone: '555-0108',
        status: 'New',
        source: 'Facebook Ad',
        assigned_to_id: johnId,
        avatar_url: 'https://picsum.photos/seed/jbrown/40/40',
        score: 55,
        priority: 'Medium'
      },
      {
        name: 'Thomas Davis',
        email: 't.davis@example.com',
        phone: '555-0109',
        status: 'Qualified',
        source: 'LinkedIn',
        assigned_to_id: janeId,
        avatar_url: 'https://picsum.photos/seed/tdavis/40/40',
        score: 75,
        priority: 'High'
      }
    ];

    for (const lead of clientLeads) {
      const { error } = await supabase.from('client_leads').insert(lead);
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Created client lead: ${lead.name}`);
      }
    }

    // 5. Create recruit leads
    console.log('\n🎯 Creating recruit leads...');
    const recruitLeads = [
      {
        name: 'Alex Thompson',
        email: 'a.thompson@example.com',
        phone: '555-0110',
        status: 'New',
        source: 'LinkedIn',
        role_interest: 'Life & Health Agent',
        avatar_url: 'https://picsum.photos/seed/athompson/40/40',
        score: 60,
        priority: 'Medium'
      },
      {
        name: 'Michelle Rodriguez',
        email: 'm.rodriguez@example.com',
        phone: '555-0111',
        status: 'Contacted',
        source: 'Indeed',
        role_interest: 'P&C Producer',
        avatar_url: 'https://picsum.photos/seed/mrodriguez/40/40',
        score: 70,
        priority: 'High'
      }
    ];

    for (const lead of recruitLeads) {
      const { error } = await supabase.from('recruit_leads').insert(lead);
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Created recruit lead: ${lead.name}`);
      }
    }

    // 6. Get contact IDs and create opportunities
    console.log('\n💰 Creating opportunities...');
    const { data: contactsData } = await supabase.from('contacts').select('*');
    
    if (contactsData && contactsData.length > 0) {
      const opportunities = [
        {
          contact_id: contactsData[0].id,
          stage: 'Contacted',
          value: 5000,
          product: 'Term Life Insurance',
          line_of_business: 'Life & Health',
          assigned_to_id: janeId,
          close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          contact_id: contactsData[1]?.id || contactsData[0].id,
          stage: 'New Lead',
          value: 3500,
          product: 'Auto Insurance',
          line_of_business: 'P&C',
          assigned_to_id: johnId,
          close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];

      for (const opp of opportunities) {
        const { error } = await supabase.from('opportunities').insert(opp);
        if (error && !error.message.includes('duplicate')) {
          console.log(`   ❌ Error: ${error.message}`);
        } else {
          console.log(`   ✅ Created opportunity: ${opp.product}`);
        }
      }
    }

    // 7. Create tasks
    console.log('\n✅ Creating tasks...');
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const tasks = [
      {
        title: 'Follow up with Michael Chen',
        description: 'Discuss term life insurance policy options',
        due_date: tomorrow,
        status: 'To-do',
        priority: 'High',
        assignee_id: janeId,
        contact_id: contactsData?.[0]?.id
      },
      {
        title: 'Prepare quote for Sarah Johnson',
        description: 'Auto and home bundle',
        due_date: today,
        status: 'In Progress',
        priority: 'High',
        assignee_id: janeId,
        contact_id: contactsData?.[1]?.id
      },
      {
        title: 'Review compliance training',
        description: 'Annual TCPA compliance module',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'To-do',
        priority: 'Medium',
        assignee_id: johnId
      }
    ];

    for (const task of tasks) {
      const { error } = await supabase.from('tasks').insert(task);
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Created task: ${task.title}`);
      }
    }

    // 8. Create appointments
    console.log('\n📅 Creating appointments...');
    const appointments = [
      {
        title: 'Policy Review with Michael Chen',
        contact_name: 'Michael Chen',
        start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        type: 'Meeting',
        user_id: janeId
      },
      {
        title: 'Quote Presentation - Sarah Johnson',
        contact_name: 'Sarah Johnson',
        start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        type: 'Call',
        user_id: janeId
      }
    ];

    for (const apt of appointments) {
      const { error } = await supabase.from('appointments').insert(apt);
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Created appointment: ${apt.title}`);
      }
    }

    // 9. Create AI Agents
    console.log('\n🤖 Creating AI agents...');
    const aiAgents = [
      {
        name: 'Appointment Setter Bot',
        description: 'Engages new leads via SMS to book initial consultations',
        is_active: true,
        system_prompt: 'You are an AI assistant for an insurance agency. Your goal is to proactively contact new leads, answer their initial questions, and persuade them to book an appointment. Be friendly but persistent.',
        tone: 'Friendly',
        task_thresholds: { maxFollowUps: 3 }
      },
      {
        name: 'Renewal Specialist Bot',
        description: 'Contacts clients 90 days before policy renewal',
        is_active: false,
        system_prompt: 'You are an AI assistant for an insurance agency. Your task is to contact existing clients whose policies are up for renewal. Be professional and schedule policy review meetings.',
        tone: 'Formal',
        task_thresholds: { maxFollowUps: 2 }
      }
    ];

    for (const agent of aiAgents) {
      const { error } = await supabase.from('ai_agents').insert(agent);
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Created AI agent: ${agent.name}`);
      }
    }

    // 10. Create Automations
    console.log('\n⚡ Creating automations...');
    const automations = [
      {
        name: 'New Lead Welcome Sequence',
        trigger: 'New Lead Created',
        is_active: true,
        actions: [
          { type: 'Wait', details: '5 minutes' },
          { type: 'Send SMS', details: 'Hi {{lead.name}}, thanks for your interest! When can we chat?' },
          { type: 'Add Tag', details: 'Contacted' }
        ]
      }
    ];

    for (const automation of automations) {
      const { error } = await supabase.from('automations').insert(automation);
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Created automation: ${automation.name}`);
      }
    }

    console.log('\n✅ Database seeding complete!\n');
    console.log('📊 Demo credentials:');
    console.log('   Email: jane@insuragent.com');
    console.log('   Password: password123\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedDatabase();

