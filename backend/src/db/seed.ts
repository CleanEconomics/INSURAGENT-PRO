import pool from './database.js';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create sample users
    const passwordHash = await bcrypt.hash('password123', 10);

    const usersResult = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, avatar_url)
      VALUES
        ('John Smith', 'john@example.com', $1, 'Sales Manager', 'https://picsum.photos/seed/john/40/40'),
        ('Maria Garcia', 'maria@example.com', $1, 'Agent/Producer', 'https://picsum.photos/seed/maria/40/40'),
        ('David Lee', 'david@example.com', $1, 'Agent/Producer', 'https://picsum.photos/seed/dlee/40/40'),
        ('Jane Doe', 'jane@example.com', $1, 'Agent/Producer', 'https://picsum.photos/seed/agent/40/40'),
        ('Ben Carter', 'ben@example.com', $1, 'Agent/Producer', 'https://picsum.photos/seed/bcarter/40/40')
      RETURNING id, name, role
    `, [passwordHash]);

    console.log('✅ Created users:', usersResult.rows.length);

    const users = usersResult.rows;
    const johnId = users[0].id;
    const mariaId = users[1].id;
    const davidId = users[2].id;
    const janeId = users[3].id;

    // Create team
    const teamResult = await pool.query(`
      INSERT INTO teams (name, manager_id)
      VALUES ('P&C Powerhouse', $1)
      RETURNING id
    `, [johnId]);

    const teamId = teamResult.rows[0].id;

    // Assign users to team
    await pool.query(`
      UPDATE users SET team_id = $1
      WHERE id IN ($2, $3, $4)
    `, [teamId, mariaId, davidId, janeId]);

    console.log('✅ Created team');

    // Create contacts
    const contactsResult = await pool.query(`
      INSERT INTO contacts (name, email, phone, tags, avatar_url, created_by)
      VALUES
        ('Michael Chen', 'm.chen@example.com', '555-0101', ARRAY['High Value', 'Life'], 'https://picsum.photos/seed/mchen/40/40', $1),
        ('Samantha Blue', 's.blue@example.com', '555-0102', ARRAY['Referral'], 'https://picsum.photos/seed/sblue/40/40', $1),
        ('Emily White', 'e.white@example.com', '555-0104', ARRAY['P&C', 'Auto'], 'https://picsum.photos/seed/ewhite/40/40', $1),
        ('James Green', 'j.green@example.com', '555-0105', ARRAY['Life', 'Annuity'], 'https://picsum.photos/seed/jgreen/40/40', $1)
      RETURNING id, name
    `, [janeId]);

    console.log('✅ Created contacts:', contactsResult.rows.length);

    const contacts = contactsResult.rows;

    // Create client leads
    await pool.query(`
      INSERT INTO client_leads (name, email, phone, status, source, assigned_to_id, avatar_url, score, priority)
      VALUES
        ('Olivia Martinez', 'o.martinez@example.com', '555-0107', 'New', 'Web Form', $1, 'https://picsum.photos/seed/omartinez/40/40', 30, 'Low'),
        ('Liam Wilson', 'l.wilson@example.com', '555-0108', 'Contacted', 'Referral', $1, 'https://picsum.photos/seed/lwilson/40/40', 70, 'High'),
        ('Ava Garcia', 'a.garcia@example.com', '555-0109', 'Working', 'Facebook Ad', $2, 'https://picsum.photos/seed/agarcia/40/40', 40, 'Medium'),
        ('Noah Rodriguez', 'n.rodriguez@example.com', '555-0110', 'New', 'Web Form', $1, 'https://picsum.photos/seed/nrod/40/40', 30, 'Low'),
        ('Isabella Chen', 'i.chen@example.com', '555-0111', 'Unqualified', 'Cold Call', $2, 'https://picsum.photos/seed/ichen/40/40', 5, 'Low')
    `, [janeId, davidId]);

    console.log('✅ Created client leads');

    // Create recruit leads
    await pool.query(`
      INSERT INTO recruit_leads (name, email, phone, status, source, role_interest, avatar_url, score, priority)
      VALUES
        ('Sophia Brown', 's.brown@example.com', '555-0112', 'New', 'LinkedIn', 'P&C Producer', 'https://picsum.photos/seed/sbrown/40/40', 70, 'Medium'),
        ('Jackson Miller', 'j.miller@example.com', '555-0113', 'Contacted', 'Indeed', 'Life & Health Agent', 'https://picsum.photos/seed/jmiller/40/40', 55, 'Low'),
        ('Emma Davis', 'e.davis@example.com', '555-0114', 'Working', 'Referral', 'Account Manager', 'https://picsum.photos/seed/edavis/40/40', 100, 'High')
    `);

    console.log('✅ Created recruit leads');

    // Create opportunities
    await pool.query(`
      INSERT INTO opportunities (contact_id, stage, value, product, line_of_business, close_date, assigned_to_id)
      VALUES
        ($1, 'New Lead', 5000, 'Term Life', 'Life & Health', '2024-08-15', $5),
        ($2, 'Appointment Set', 7500, 'Whole Life', 'Life & Health', '2024-08-20', $6),
        ($3, 'Quoted', 2500, 'Auto Insurance', 'P&C', '2024-08-10', $7),
        ($4, 'Contacted', 12000, 'Annuity', 'Life & Health', '2024-08-25', $5)
    `, [contacts[0].id, contacts[1].id, contacts[2].id, contacts[3].id, janeId, mariaId, davidId]);

    console.log('✅ Created opportunities');

    // Create tasks
    await pool.query(`
      INSERT INTO tasks (title, description, due_date, status, priority, assignee_id)
      VALUES
        ('Follow up with Liam Wilson', 'Discuss auto insurance options', NOW() + INTERVAL '2 days', 'To-do', 'High', $1),
        ('Review policy with Michael Chen', 'Annual policy review', NOW() + INTERVAL '5 days', 'To-do', 'Medium', $2),
        ('Complete compliance training', 'Q3 compliance module', NOW() + INTERVAL '7 days', 'In Progress', 'Medium', $1),
        ('Team meeting prep', 'Prepare Q3 sales report', NOW() + INTERVAL '1 day', 'To-do', 'High', $3)
    `, [janeId, mariaId, johnId]);

    console.log('✅ Created tasks');

    // Create appointments
    await pool.query(`
      INSERT INTO appointments (title, contact_name, start_time, end_time, type, user_id)
      VALUES
        ('Policy Review', 'Michael Chen', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', 'Meeting', $1),
        ('Follow-up Call', 'Samantha Blue', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '30 minutes', 'Call', $2),
        ('Quote Presentation', 'Emily White', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '1 hour', 'Meeting', $3)
    `, [janeId, mariaId, davidId]);

    console.log('✅ Created appointments');

    // Create policies
    await pool.query(`
      INSERT INTO policies (contact_id, policy_number, product, line_of_business, premium, status, effective_date, expiration_date)
      VALUES
        ($1, 'POL-12345', 'Term Life', 'Life & Health', 1500.00, 'Active', '2024-01-01', '2025-01-01'),
        ($2, 'POL-12346', 'Auto Insurance', 'P&C', 1200.00, 'Active', '2024-03-01', '2025-03-01'),
        ($3, 'POL-12347', 'Homeowners', 'P&C', 1800.00, 'Active', '2024-02-01', '2025-02-01')
    `, [contacts[0].id, contacts[2].id, contacts[2].id]);

    console.log('✅ Created policies');

    // Create service tickets
    const ticketResult = await pool.query(`
      INSERT INTO service_tickets (ticket_number, contact_id, subject, category, status, priority, assigned_to_id)
      VALUES
        ('TKT-001', $1, 'Policy Change Request', 'Policy Change Request', 'Open', 'Medium', $2)
      RETURNING id
    `, [contacts[0].id, janeId]);

    const ticketId = ticketResult.rows[0].id;

    // Create ticket messages
    await pool.query(`
      INSERT INTO ticket_messages (ticket_id, sender, content)
      VALUES
        ($1, 'Client', 'I need to update my address on my life insurance policy'),
        ($1, 'Agent', 'I''ll help you with that. What''s your new address?')
    `, [ticketId]);

    console.log('✅ Created service tickets');

    // Create knowledge resources
    await pool.query(`
      INSERT INTO knowledge_resources (title, description, category, type, url, author)
      VALUES
        ('Sales Best Practices 2024', 'Updated sales strategies and techniques', 'Sales Tips & Tricks', 'PDF', 'https://example.com/sales-best-practices.pdf', 'John Smith'),
        ('Product Training: Life Insurance', 'Comprehensive guide to life insurance products', 'Product Info', 'Video', 'https://example.com/life-insurance-training', 'Training Team'),
        ('Compliance Update Q3', 'Latest compliance requirements and regulations', 'Compliance & Laws', 'PDF', 'https://example.com/compliance-q3.pdf', 'Compliance Team')
    `);

    console.log('✅ Created knowledge resources');

    // Create training modules
    await pool.query(`
      INSERT INTO training_modules (title, description, category, duration, thumbnail_url, type, required)
      VALUES
        ('Objection Handling', 'Learn to handle common client objections', 'Sales Skills', '45 min', 'https://picsum.photos/seed/training1/400/300', 'Video', true),
        ('Medicare Supplement Basics', 'Understanding Medicare Supplement products', 'Product Knowledge', '60 min', 'https://picsum.photos/seed/training2/400/300', 'Video', true),
        ('HIPAA Compliance 2024', 'Annual HIPAA compliance training', 'Compliance', '30 min', 'https://picsum.photos/seed/training3/400/300', 'Video', true)
    `);

    console.log('✅ Created training modules');

    // Create AI agents
    await pool.query(`
      INSERT INTO ai_agents (name, description, is_active, system_prompt, tone, max_follow_ups)
      VALUES
        ('Appointment Setter', 'Automatically schedules appointments with leads', true, 'You are a helpful appointment scheduling assistant', 'Friendly', 3),
        ('Renewal Reminder', 'Sends renewal reminders to clients', false, 'You remind clients about upcoming policy renewals', 'Professional', 2)
    `);

    console.log('✅ Created AI agents');

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Sample Credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
    console.log('');
    console.log('   Other users: maria@example.com, david@example.com, jane@example.com');
    console.log('   All passwords: password123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
