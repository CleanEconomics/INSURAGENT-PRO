import { supabaseAdmin } from '../db/supabase.js';
import twilio from 'twilio';
import cron from 'node-cron';
import { createOAuth2Client, setCredentials } from './googleDriveService.js';
import { sendEmail as sendGmailEmail } from './gmailService.js';
import pool from '../db/database.js';

// Initialize services
const twilioClient = process.env.TWILIO_ACCOUNT_SID &&
                     process.env.TWILIO_AUTH_TOKEN &&
                     process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export enum TriggerType {
  NewLeadCreated = 'New Lead Created',
  AppointmentBooked = 'Appointment Booked',
  StatusChangedToWorking = 'Status Changed to "Working"',
  LeadConverted = 'Lead Converted',
  PolicyRenewalDue = 'Policy Renewal Due',
}

export enum ActionType {
  Wait = 'Wait',
  SendSMS = 'Send SMS',
  SendEmail = 'Send Email',
  AddTag = 'Add Tag',
  AssignToAgent = 'Assign to Agent',
  UpdateLeadStatus = 'Update Lead Status',
  CreateTask = 'Create Task',
  SendWebhook = 'Send Webhook',
}

export interface AutomationAction {
  id: string;
  type: ActionType;
  details: string;
  conditions?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string;
  }[];
}

export interface Automation {
  id: string;
  name: string;
  trigger: TriggerType;
  actions: AutomationAction[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TriggerData {
  leadId?: string;
  contactId?: string;
  appointmentId?: string;
  userId?: string;
  lead?: any;
  contact?: any;
  appointment?: any;
  user?: any;
  [key: string]: any;
}

/**
 * Template variable processor
 * Replaces {{variable.path}} with actual values from trigger data
 */
function processTemplate(template: string, data: TriggerData): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split('.');
    let value: any = data;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return match; // Keep original if not found
      }
    }

    return value !== undefined && value !== null ? String(value) : match;
  });
}

/**
 * Validate template variables
 */
export function validateTemplate(template: string, availableVars: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let match;

  while ((match = regex.exec(template)) !== null) {
    const variable = match[1].trim();
    if (!availableVars.some(v => variable.startsWith(v))) {
      errors.push(`Unknown variable: {{${variable}}}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check if conditions are met
 */
function checkConditions(conditions: AutomationAction['conditions'], data: TriggerData): boolean {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every(condition => {
    const keys = condition.field.split('.');
    let value: any = data;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return false;
      }
    }

    const actualValue = String(value);
    const expectedValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return actualValue === expectedValue;
      case 'not_equals':
        return actualValue !== expectedValue;
      case 'contains':
        return actualValue.toLowerCase().includes(expectedValue.toLowerCase());
      case 'greater_than':
        return parseFloat(actualValue) > parseFloat(expectedValue);
      case 'less_than':
        return parseFloat(actualValue) < parseFloat(expectedValue);
      default:
        return false;
    }
  });
}

/**
 * Parse wait duration to milliseconds
 */
function parseWaitDuration(duration: string): number {
  const match = duration.match(/(\d+)\s*(minute|minutes|min|hour|hours|hr|day|days|week|weeks)s?/i);
  if (!match) return 0;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith('min')) return value * 60 * 1000;
  if (unit.startsWith('hour') || unit.startsWith('hr')) return value * 60 * 60 * 1000;
  if (unit.startsWith('day')) return value * 24 * 60 * 60 * 1000;
  if (unit.startsWith('week')) return value * 7 * 24 * 60 * 60 * 1000;

  return 0;
}

/**
 * Get OAuth2Client for user (to send emails via Gmail)
 */
async function getUserGmailClient(userId?: string): Promise<any | null> {
  if (!userId) {
    // Try to get the first admin/user with Gmail connected
    const result = await pool.query(
      `SELECT user_id, access_token, refresh_token
       FROM google_drive_credentials
       WHERE access_token IS NOT NULL
       ORDER BY updated_at DESC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return null;
    }

    const creds = result.rows[0];
    const oauth2Client = createOAuth2Client();
    setCredentials(oauth2Client, creds.access_token, creds.refresh_token);
    return oauth2Client;
  }

  // Get specific user's credentials
  const result = await pool.query(
    `SELECT access_token, refresh_token
     FROM google_drive_credentials
     WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const creds = result.rows[0];
  const oauth2Client = createOAuth2Client();
  setCredentials(oauth2Client, creds.access_token, creds.refresh_token);
  return oauth2Client;
}

/**
 * Execute a single action
 */
async function executeAction(action: AutomationAction, triggerData: TriggerData): Promise<{ success: boolean; error?: string }> {
  try {
    // Check conditions
    if (!checkConditions(action.conditions, triggerData)) {
      console.log(`Action ${action.id} skipped due to unmet conditions`);
      return { success: true }; // Skip action, but don't fail
    }

    const processedDetails = processTemplate(action.details, triggerData);

    switch (action.type) {
      case ActionType.SendSMS:
        if (!twilioClient) {
          throw new Error('Twilio not configured');
        }

        const phone = triggerData.lead?.phone || triggerData.contact?.phone;
        if (!phone) {
          throw new Error('No phone number available');
        }

        await twilioClient.messages.create({
          body: processedDetails,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
        console.log(`SMS sent to ${phone}`);
        break;

      case ActionType.SendEmail:
        const emailAddress = triggerData.lead?.email || triggerData.contact?.email;
        if (!emailAddress) {
          throw new Error('No email address available');
        }

        // Get Gmail OAuth client
        const gmailClient = await getUserGmailClient(triggerData.userId);
        if (!gmailClient) {
          throw new Error('Gmail not configured. Please connect your Google account in Settings.');
        }

        // Parse subject and body
        const emailLines = processedDetails.split('\n');
        const subjectLine = emailLines.find(l => l.toLowerCase().startsWith('subject:'));
        const emailSubject = subjectLine ? subjectLine.substring(8).trim() : 'Message from InsurAgent Pro';
        const emailBody = emailLines.filter(l => !l.toLowerCase().startsWith('subject:')).join('\n').trim();

        // Send via Gmail API
        await sendGmailEmail(gmailClient, {
          to: [emailAddress],
          subject: emailSubject,
          body: emailBody,
        });
        console.log(`Email sent to ${emailAddress} via Gmail`);
        break;

      case ActionType.AddTag:
        const contactId = triggerData.contactId || triggerData.lead?.contact_id;
        if (!contactId) {
          throw new Error('No contact ID available');
        }

        const tag = processedDetails.trim();

        // Get current tags
        const { data: contact } = await supabaseAdmin
          .from('contacts')
          .select('tags')
          .eq('id', contactId)
          .single();

        const currentTags = contact?.tags || [];
        if (!currentTags.includes(tag)) {
          await supabaseAdmin
            .from('contacts')
            .update({ tags: [...currentTags, tag] })
            .eq('id', contactId);
          console.log(`Tag "${tag}" added to contact ${contactId}`);
        }
        break;

      case ActionType.AssignToAgent:
        const leadId = triggerData.leadId;
        if (!leadId) {
          throw new Error('No lead ID available');
        }

        const agentName = processedDetails.trim();

        // Find agent by name
        const { data: agent } = await supabaseAdmin
          .from('users')
          .select('id, name')
          .ilike('name', agentName)
          .single();

        if (!agent) {
          throw new Error(`Agent "${agentName}" not found`);
        }

        await supabaseAdmin
          .from('client_leads')
          .update({ assigned_to: agent.name })
          .eq('id', leadId);
        console.log(`Lead ${leadId} assigned to ${agentName}`);
        break;

      case ActionType.UpdateLeadStatus:
        const updateLeadId = triggerData.leadId;
        if (!updateLeadId) {
          throw new Error('No lead ID available');
        }

        const status = processedDetails.trim();
        await supabaseAdmin
          .from('client_leads')
          .update({ status })
          .eq('id', updateLeadId);
        console.log(`Lead ${updateLeadId} status updated to ${status}`);
        break;

      case ActionType.CreateTask:
        const taskLeadId = triggerData.leadId;
        const taskContactId = triggerData.contactId;

        // Parse task details (title on first line, description on rest)
        const taskLines = processedDetails.split('\n');
        const title = taskLines[0] || 'Follow-up task';
        const description = taskLines.slice(1).join('\n') || '';

        await supabaseAdmin
          .from('tasks')
          .insert({
            title,
            description,
            contact_id: taskContactId,
            lead_id: taskLeadId,
            status: 'To-do',
            priority: 'Medium',
            due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          });
        console.log(`Task created: ${title}`);
        break;

      case ActionType.SendWebhook:
        // Parse webhook URL and data
        const webhookLines = processedDetails.split('\n');
        const urlLine = webhookLines.find(l => l.toLowerCase().startsWith('url:'));
        const webhookUrl = urlLine ? urlLine.substring(4).trim() : '';

        if (!webhookUrl) {
          throw new Error('No webhook URL specified');
        }

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(triggerData),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.statusText}`);
        }
        console.log(`Webhook sent to ${webhookUrl}`);
        break;

      default:
        console.log(`Unknown action type: ${action.type}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error(`Action execution failed:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger an automation workflow
 */
export async function triggerAutomation(trigger: TriggerType, triggerData: TriggerData): Promise<void> {
  console.log(`\n🤖 Automation triggered: ${trigger}`);

  // Find active automations for this trigger
  const { data: automations, error } = await supabaseAdmin
    .from('automation_workflows')
    .select('*')
    .eq('trigger', trigger)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching automations:', error);
    return;
  }

  if (!automations || automations.length === 0) {
    console.log('No active automations found for this trigger');
    return;
  }

  console.log(`Found ${automations.length} active automation(s)`);

  // Execute each automation
  for (const automation of automations) {
    console.log(`\n▶️  Executing automation: ${automation.name}`);

    // Create execution record
    const { data: execution, error: execError } = await supabaseAdmin
      .from('automation_executions')
      .insert({
        workflow_id: automation.id,
        trigger_data: triggerData,
        status: 'running',
      })
      .select()
      .single();

    if (execError || !execution) {
      console.error('Error creating execution:', execError);
      continue;
    }

    // Execute actions
    await executeAutomationActions(execution.id, automation, triggerData);
  }
}

/**
 * Execute automation actions sequentially
 */
async function executeAutomationActions(executionId: string, automation: any, triggerData: TriggerData): Promise<void> {
  const actions: AutomationAction[] = automation.actions;

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];

    // Update current action index
    await supabaseAdmin
      .from('automation_executions')
      .update({ current_action_index: i })
      .eq('id', executionId);

    console.log(`  ⚡ Action ${i + 1}/${actions.length}: ${action.type}`);

    // Handle Wait action specially
    if (action.type === ActionType.Wait) {
      const duration = parseWaitDuration(action.details);
      console.log(`  ⏱️  Waiting ${action.details} (${duration}ms)`);

      if (duration > 0) {
        // Schedule remaining actions as a job
        const scheduledFor = new Date(Date.now() + duration);

        await supabaseAdmin
          .from('automation_jobs')
          .insert({
            execution_id: executionId,
            workflow_id: automation.id,
            action_index: i + 1, // Next action
            action_data: actions.slice(i + 1), // Remaining actions
            trigger_data: triggerData,
            scheduled_for: scheduledFor.toISOString(),
          });

        console.log(`  📅 Remaining actions scheduled for ${scheduledFor.toLocaleString()}`);

        // Stop executing now (will resume later)
        return;
      }
    } else {
      // Execute action immediately
      const result = await executeAction(action, triggerData);

      if (!result.success) {
        console.error(`  ❌ Action failed: ${result.error}`);

        // Mark execution as failed
        await supabaseAdmin
          .from('automation_executions')
          .update({
            status: 'failed',
            result: { error: result.error, failedAtAction: i },
            completed_at: new Date().toISOString(),
          })
          .eq('id', executionId);

        return;
      }

      console.log(`  ✅ Action completed successfully`);
    }
  }

  // All actions completed
  await supabaseAdmin
    .from('automation_executions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', executionId);

  console.log(`✅ Automation execution completed: ${automation.name}\n`);
}

/**
 * Process scheduled jobs (run by cron)
 */
export async function processScheduledJobs(): Promise<void> {
  console.log('🔄 Processing scheduled automation jobs...');

  // Find jobs ready to execute
  const { data: jobs, error } = await supabaseAdmin
    .from('automation_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString());

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  if (!jobs || jobs.length === 0) {
    console.log('No jobs to process');
    return;
  }

  // Filter jobs that haven't exceeded max attempts
  const eligibleJobs = jobs.filter(job => job.attempts < job.max_attempts);

  if (eligibleJobs.length === 0) {
    console.log('No eligible jobs to process');
    return;
  }

  console.log(`Found ${eligibleJobs.length} job(s) to process`);

  for (const job of eligibleJobs) {
    // Mark as processing
    await supabaseAdmin
      .from('automation_jobs')
      .update({
        status: 'processing',
        attempts: job.attempts + 1,
      })
      .eq('id', job.id);

    try {
      // Execute remaining actions
      const actions: AutomationAction[] = job.action_data;

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        const actualIndex = job.action_index + i;

        console.log(`  ⚡ Action ${actualIndex + 1}: ${action.type}`);

        // Update execution
        await supabaseAdmin
          .from('automation_executions')
          .update({ current_action_index: actualIndex })
          .eq('id', job.execution_id);

        if (action.type === ActionType.Wait) {
          // Another wait - reschedule
          const duration = parseWaitDuration(action.details);
          const scheduledFor = new Date(Date.now() + duration);

          await supabaseAdmin
            .from('automation_jobs')
            .update({
              action_index: actualIndex + 1,
              action_data: actions.slice(i + 1),
              scheduled_for: scheduledFor.toISOString(),
              status: 'pending',
            })
            .eq('id', job.id);

          console.log(`  📅 Re-scheduled for ${scheduledFor.toLocaleString()}`);
          return; // Stop processing this job
        } else {
          const result = await executeAction(action, job.trigger_data);

          if (!result.success) {
            throw new Error(result.error);
          }

          console.log(`  ✅ Action completed`);
        }
      }

      // All actions completed
      await supabaseAdmin
        .from('automation_jobs')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      await supabaseAdmin
        .from('automation_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.execution_id);

      console.log(`✅ Job ${job.id} completed`);
    } catch (error: any) {
      console.error(`❌ Job ${job.id} failed:`, error);

      // Mark as failed
      await supabaseAdmin
        .from('automation_jobs')
        .update({
          status: job.attempts + 1 >= job.max_attempts ? 'failed' : 'pending',
          error: error.message,
        })
        .eq('id', job.id);

      if (job.attempts + 1 >= job.max_attempts) {
        await supabaseAdmin
          .from('automation_executions')
          .update({
            status: 'failed',
            result: { error: error.message },
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.execution_id);
      }
    }
  }
}

/**
 * Start the job processor (cron job every minute)
 */
export function startJobProcessor(): void {
  console.log('🚀 Starting automation job processor (runs every minute)');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    await processScheduledJobs();
  });
}
