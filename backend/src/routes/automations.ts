import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { validateTemplate, TriggerType, ActionType } from '../services/automationService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/automations
 * Get all automations
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('automation_workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching automations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/automations/:id
 * Get a single automation
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('automation_workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching automation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/automations
 * Create a new automation
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, trigger, actions, is_active = true } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!trigger || !Object.values(TriggerType).includes(trigger)) {
      return res.status(400).json({ error: 'Invalid trigger type' });
    }

    if (!actions || !Array.isArray(actions)) {
      return res.status(400).json({ error: 'Actions must be an array' });
    }

    // Validate actions
    const validationErrors: string[] = [];
    const availableVars = getAvailableVariables(trigger);

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];

      if (!action.type || !Object.values(ActionType).includes(action.type)) {
        validationErrors.push(`Action ${i + 1}: Invalid action type`);
        continue;
      }

      if (!action.id) {
        validationErrors.push(`Action ${i + 1}: Missing action ID`);
      }

      // Validate template variables
      if (action.details) {
        const validation = validateTemplate(action.details, availableVars);
        if (!validation.valid) {
          validationErrors.push(`Action ${i + 1}: ${validation.errors.join(', ')}`);
        }
      }

      // Validate conditions
      if (action.conditions && Array.isArray(action.conditions)) {
        for (const condition of action.conditions) {
          if (!condition.field || !condition.operator || condition.value === undefined) {
            validationErrors.push(`Action ${i + 1}: Invalid condition format`);
          }
        }
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    // Create automation
    const { data, error } = await supabaseAdmin
      .from('automation_workflows')
      .insert({
        name: name.trim(),
        trigger,
        actions,
        is_active,
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Created automation: ${data.name}`);
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating automation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/automations/:id
 * Update an automation
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, trigger, actions, is_active } = req.body;

    // Check if automation exists
    const { data: existing } = await supabaseAdmin
      .from('automation_workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    // Build update object
    const updates: any = { updated_at: new Date().toISOString() };

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: 'Name cannot be empty' });
      }
      updates.name = name.trim();
    }

    if (trigger !== undefined) {
      if (!Object.values(TriggerType).includes(trigger)) {
        return res.status(400).json({ error: 'Invalid trigger type' });
      }
      updates.trigger = trigger;
    }

    if (actions !== undefined) {
      if (!Array.isArray(actions)) {
        return res.status(400).json({ error: 'Actions must be an array' });
      }

      // Validate actions
      const validationErrors: string[] = [];
      const availableVars = getAvailableVariables(trigger || existing.trigger);

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];

        if (!action.type || !Object.values(ActionType).includes(action.type)) {
          validationErrors.push(`Action ${i + 1}: Invalid action type`);
          continue;
        }

        if (action.details) {
          const validation = validateTemplate(action.details, availableVars);
          if (!validation.valid) {
            validationErrors.push(`Action ${i + 1}: ${validation.errors.join(', ')}`);
          }
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: validationErrors });
      }

      updates.actions = actions;
    }

    if (is_active !== undefined) {
      updates.is_active = Boolean(is_active);
    }

    // Update automation
    const { data, error } = await supabaseAdmin
      .from('automation_workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Updated automation: ${data.name}`);
    res.json(data);
  } catch (error: any) {
    console.error('Error updating automation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/automations/:id/toggle
 * Toggle automation active status
 */
router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get current status
    const { data: existing } = await supabaseAdmin
      .from('automation_workflows')
      .select('is_active, name')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    // Toggle status
    const { data, error } = await supabaseAdmin
      .from('automation_workflows')
      .update({
        is_active: !existing.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log(`🔄 Toggled automation "${data.name}" to ${data.is_active ? 'ON' : 'OFF'}`);
    res.json(data);
  } catch (error: any) {
    console.error('Error toggling automation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/automations/:id
 * Delete an automation
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get automation name before deleting
    const { data: existing } = await supabaseAdmin
      .from('automation_workflows')
      .select('name')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    // Delete automation
    const { error } = await supabaseAdmin
      .from('automation_workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log(`🗑️  Deleted automation: ${existing.name}`);
    res.json({ message: 'Automation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting automation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/automations/:id/executions
 * Get execution history for an automation
 */
router.get('/:id/executions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const { data, error } = await supabaseAdmin
      .from('automation_executions')
      .select('*')
      .eq('workflow_id', id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching executions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/automations/validate-template
 * Validate template variables
 */
router.post('/validate-template', async (req: Request, res: Response) => {
  try {
    const { template, trigger } = req.body;

    if (!template) {
      return res.status(400).json({ error: 'Template is required' });
    }

    const availableVars = getAvailableVariables(trigger);
    const validation = validateTemplate(template, availableVars);

    res.json({
      valid: validation.valid,
      errors: validation.errors,
      availableVariables: availableVars,
    });
  } catch (error: any) {
    console.error('Error validating template:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper function to get available variables for a trigger
 */
function getAvailableVariables(trigger: TriggerType): string[] {
  const baseVars = ['lead.name', 'lead.email', 'lead.phone', 'lead.source', 'lead.status'];

  switch (trigger) {
    case TriggerType.NewLeadCreated:
      return [...baseVars, 'lead.createdAt'];

    case TriggerType.AppointmentBooked:
      return [
        ...baseVars,
        'appointment.date',
        'appointment.time',
        'appointment.title',
        'appointment.type',
      ];

    case TriggerType.StatusChangedToWorking:
      return [...baseVars, 'lead.previousStatus'];

    case TriggerType.LeadConverted:
      return [...baseVars, 'lead.convertedAt', 'policy.number'];

    case TriggerType.PolicyRenewalDue:
      return [
        'contact.name',
        'contact.email',
        'contact.phone',
        'policy.number',
        'policy.product',
        'policy.renewalDate',
        'policy.premium',
      ];

    default:
      return baseVars;
  }
}

export default router;
