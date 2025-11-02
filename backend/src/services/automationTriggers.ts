import { supabaseAdmin } from '../db/supabase.js';
import { triggerAutomation, TriggerType, TriggerData } from './automationService.js';

/**
 * Set up automation triggers
 * These listen for database changes and trigger automations
 */

/**
 * Trigger: New Lead Created
 * Listen for new client_leads inserts
 */
export async function onNewLeadCreated(leadId: string): Promise<void> {
  console.log(`📢 Event: New Lead Created (${leadId})`);

  // Fetch lead data
  const { data: lead, error } = await supabaseAdmin
    .from('client_leads')
    .select('*, contacts(*)')
    .eq('id', leadId)
    .single();

  if (error || !lead) {
    console.error('Error fetching lead:', error);
    return;
  }

  const triggerData: TriggerData = {
    leadId: lead.id,
    lead: {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      createdAt: lead.created_at,
      contact_id: lead.contact_id,
    },
    contact: lead.contacts,
    contactId: lead.contact_id,
  };

  await triggerAutomation(TriggerType.NewLeadCreated, triggerData);
}

/**
 * Trigger: Appointment Booked
 */
export async function onAppointmentBooked(appointmentId: string): Promise<void> {
  console.log(`📢 Event: Appointment Booked (${appointmentId})`);

  const { data: appointment, error } = await supabaseAdmin
    .from('appointments')
    .select('*, contacts(*), client_leads(*)')
    .eq('id', appointmentId)
    .single();

  if (error || !appointment) {
    console.error('Error fetching appointment:', error);
    return;
  }

  const triggerData: TriggerData = {
    appointmentId: appointment.id,
    appointment: {
      id: appointment.id,
      title: appointment.title,
      date: appointment.start,
      time: new Date(appointment.start).toLocaleTimeString(),
      type: appointment.type,
    },
    contactId: appointment.contact_id,
    contact: appointment.contacts,
    leadId: appointment.lead_id,
    lead: appointment.client_leads,
  };

  await triggerAutomation(TriggerType.AppointmentBooked, triggerData);
}

/**
 * Trigger: Status Changed to "Working"
 */
export async function onLeadStatusChanged(leadId: string, newStatus: string, oldStatus: string): Promise<void> {
  if (newStatus === 'Working') {
    console.log(`📢 Event: Status Changed to Working (${leadId})`);

    const { data: lead, error } = await supabaseAdmin
      .from('client_leads')
      .select('*, contacts(*)')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      console.error('Error fetching lead:', error);
      return;
    }

    const triggerData: TriggerData = {
      leadId: lead.id,
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        status: lead.status,
        previousStatus: oldStatus,
      },
      contact: lead.contacts,
      contactId: lead.contact_id,
    };

    await triggerAutomation(TriggerType.StatusChangedToWorking, triggerData);
  }
}

/**
 * Trigger: Lead Converted
 */
export async function onLeadConverted(leadId: string): Promise<void> {
  console.log(`📢 Event: Lead Converted (${leadId})`);

  const { data: lead, error } = await supabaseAdmin
    .from('client_leads')
    .select('*, contacts(*)')
    .eq('id', leadId)
    .single();

  if (error || !lead) {
    console.error('Error fetching lead:', error);
    return;
  }

  const triggerData: TriggerData = {
    leadId: lead.id,
    lead: {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      convertedAt: new Date().toISOString(),
    },
    contact: lead.contacts,
    contactId: lead.contact_id,
  };

  await triggerAutomation(TriggerType.LeadConverted, triggerData);
}

/**
 * Trigger: Policy Renewal Due
 * Call this from a cron job that checks for policies expiring soon
 */
export async function onPolicyRenewalDue(policyId: string): Promise<void> {
  console.log(`📢 Event: Policy Renewal Due (${policyId})`);

  const { data: policy, error } = await supabaseAdmin
    .from('policies')
    .select('*, contacts(*)')
    .eq('id', policyId)
    .single();

  if (error || !policy) {
    console.error('Error fetching policy:', error);
    return;
  }

  const triggerData: TriggerData = {
    policyId: policy.id,
    policy: {
      id: policy.id,
      number: policy.policy_number,
      product: policy.product,
      renewalDate: policy.expiration_date,
      premium: policy.premium,
      lineOfBusiness: policy.line_of_business,
    },
    contactId: policy.contact_id,
    contact: {
      id: policy.contacts?.id,
      name: policy.contacts?.name,
      email: policy.contacts?.email,
      phone: policy.contacts?.phone,
    },
  };

  await triggerAutomation(TriggerType.PolicyRenewalDue, triggerData);
}

/**
 * Setup database listeners using Supabase Realtime
 * Note: For production, you may want to use database triggers/webhooks instead
 */
export function setupDatabaseListeners(): void {
  console.log('🎧 Setting up automation trigger listeners...');

  // Listen for new leads
  supabaseAdmin
    .channel('client_leads_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'client_leads',
      },
      (payload) => {
        onNewLeadCreated(payload.new.id);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'client_leads',
      },
      (payload) => {
        const oldStatus = payload.old?.status;
        const newStatus = payload.new?.status;

        if (oldStatus !== newStatus) {
          onLeadStatusChanged(payload.new.id, newStatus, oldStatus);
        }

        if (newStatus === 'Converted' && oldStatus !== 'Converted') {
          onLeadConverted(payload.new.id);
        }
      }
    )
    .subscribe();

  // Listen for new appointments
  supabaseAdmin
    .channel('appointments_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'appointments',
      },
      (payload) => {
        onAppointmentBooked(payload.new.id);
      }
    )
    .subscribe();

  console.log('✅ Automation triggers listening for database events');
}

/**
 * Check for upcoming policy renewals (run daily via cron)
 */
export async function checkPolicyRenewals(): Promise<void> {
  console.log('🔍 Checking for upcoming policy renewals...');

  // Find policies expiring in the next 90 days
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

  const { data: policies, error } = await supabaseAdmin
    .from('policies')
    .select('id, expiration_date')
    .eq('status', 'Active')
    .lte('expiration_date', ninetyDaysFromNow.toISOString().split('T')[0])
    .gte('expiration_date', new Date().toISOString().split('T')[0]);

  if (error) {
    console.error('Error fetching policies:', error);
    return;
  }

  if (!policies || policies.length === 0) {
    console.log('No policies due for renewal');
    return;
  }

  console.log(`Found ${policies.length} policies due for renewal`);

  for (const policy of policies) {
    await onPolicyRenewalDue(policy.id);
  }
}
