import pool from '../db/database.js';

/**
 * Email Auto-Linking Service
 * Automatically links incoming emails to CRM entities (leads, contacts, opportunities)
 * using domain matching, keyword detection, and pattern learning
 */

interface LinkingResult {
  entityType: 'client_lead' | 'recruit_lead' | 'contact' | 'opportunity' | null;
  entityId: string | null;
  confidence: number; // 0-1
  reason: string;
}

/**
 * Auto-link email to CRM entity
 */
export async function autoLinkEmail(
  userId: string,
  emailId: string,
  fromEmail: string,
  subject: string,
  bodyText: string,
  toEmails: string[]
): Promise<LinkingResult> {
  // Try multiple linking strategies in order of confidence

  // 1. Email address exact match (highest confidence)
  const emailMatch = await linkByEmailAddress(userId, fromEmail, toEmails);
  if (emailMatch.entityId) {
    return emailMatch;
  }

  // 2. Domain matching (medium confidence)
  const domainMatch = await linkByDomain(userId, fromEmail);
  if (domainMatch.entityId) {
    return domainMatch;
  }

  // 3. Keyword and subject analysis (lower confidence)
  const keywordMatch = await linkByKeywords(userId, subject, bodyText);
  if (keywordMatch.entityId) {
    return keywordMatch;
  }

  // 4. Historical pattern learning (medium-low confidence)
  const patternMatch = await linkByHistoricalPattern(userId, fromEmail, subject);
  if (patternMatch.entityId) {
    return patternMatch;
  }

  return {
    entityType: null,
    entityId: null,
    confidence: 0,
    reason: 'No matching entity found',
  };
}

/**
 * Link by exact email address match
 */
async function linkByEmailAddress(
  userId: string,
  fromEmail: string,
  toEmails: string[]
): Promise<LinkingResult> {
  const allEmails = [fromEmail, ...toEmails].map(e =>
    e.match(/<(.+)>/)?.[1] || e
  );

  // Check contacts
  const contactResult = await pool.query(
    `SELECT id, 'contact' as type FROM contacts
     WHERE user_id = $1 AND email = ANY($2)
     LIMIT 1`,
    [userId, allEmails]
  );

  if (contactResult.rows.length > 0) {
    return {
      entityType: 'contact',
      entityId: contactResult.rows[0].id,
      confidence: 0.95,
      reason: 'Exact email match in contacts',
    };
  }

  // Check client leads
  const clientLeadResult = await pool.query(
    `SELECT id FROM client_leads
     WHERE user_id = $1 AND email = ANY($2)
     LIMIT 1`,
    [userId, allEmails]
  );

  if (clientLeadResult.rows.length > 0) {
    return {
      entityType: 'client_lead',
      entityId: clientLeadResult.rows[0].id,
      confidence: 0.9,
      reason: 'Exact email match in client leads',
    };
  }

  // Check recruit leads
  const recruitLeadResult = await pool.query(
    `SELECT id FROM recruit_leads
     WHERE user_id = $1 AND email = ANY($2)
     LIMIT 1`,
    [userId, allEmails]
  );

  if (recruitLeadResult.rows.length > 0) {
    return {
      entityType: 'recruit_lead',
      entityId: recruitLeadResult.rows[0].id,
      confidence: 0.9,
      reason: 'Exact email match in recruit leads',
    };
  }

  return { entityType: null, entityId: null, confidence: 0, reason: 'No email match' };
}

/**
 * Link by domain matching (company domain)
 */
async function linkByDomain(userId: string, fromEmail: string): Promise<LinkingResult> {
  const email = fromEmail.match(/<(.+)>/)?.[1] || fromEmail;
  const domain = email.split('@')[1];

  if (!domain) {
    return { entityType: null, entityId: null, confidence: 0, reason: 'No domain' };
  }

  // Check client leads by company domain
  const leadResult = await pool.query(
    `SELECT cl.id FROM client_leads cl
     WHERE cl.user_id = $1 AND cl.email ILIKE $2
     ORDER BY cl.created_at DESC
     LIMIT 1`,
    [userId, `%@${domain}`]
  );

  if (leadResult.rows.length > 0) {
    return {
      entityType: 'client_lead',
      entityId: leadResult.rows[0].id,
      confidence: 0.7,
      reason: `Domain match: ${domain}`,
    };
  }

  return { entityType: null, entityId: null, confidence: 0, reason: 'No domain match' };
}

/**
 * Link by keywords in subject and body
 */
async function linkByKeywords(
  userId: string,
  subject: string,
  bodyText: string
): Promise<LinkingResult> {
  const combinedText = `${subject} ${bodyText}`.toLowerCase();

  // Opportunity keywords (proposal, quote, policy, premium)
  const opportunityKeywords = ['proposal', 'quote', 'policy number', 'premium', 'coverage'];
  const hasOpportunityKeyword = opportunityKeywords.some(kw => combinedText.includes(kw));

  if (hasOpportunityKeyword) {
    // Try to find relevant opportunity
    const oppResult = await pool.query(
      `SELECT id FROM opportunities
       WHERE user_id = $1 AND status IN ('in_progress', 'proposal_sent', 'negotiation')
       ORDER BY updated_at DESC
       LIMIT 1`,
      [userId]
    );

    if (oppResult.rows.length > 0) {
      return {
        entityType: 'opportunity',
        entityId: oppResult.rows[0].id,
        confidence: 0.6,
        reason: 'Opportunity keywords detected',
      };
    }
  }

  // Recruit keywords
  const recruitKeywords = ['interview', 'recruiting', 'agent opportunity', 'join our team', 'career'];
  const hasRecruitKeyword = recruitKeywords.some(kw => combinedText.includes(kw));

  if (hasRecruitKeyword) {
    const recruitResult = await pool.query(
      `SELECT id FROM recruit_leads
       WHERE user_id = $1 AND status IN ('new', 'contacted', 'interested')
       ORDER BY updated_at DESC
       LIMIT 1`,
      [userId]
    );

    if (recruitResult.rows.length > 0) {
      return {
        entityType: 'recruit_lead',
        entityId: recruitResult.rows[0].id,
        confidence: 0.5,
        reason: 'Recruiting keywords detected',
      };
    }
  }

  return { entityType: null, entityId: null, confidence: 0, reason: 'No keyword match' };
}

/**
 * Link by historical patterns (learn from manual links)
 */
async function linkByHistoricalPattern(
  userId: string,
  fromEmail: string,
  subject: string
): Promise<LinkingResult> {
  const email = fromEmail.match(/<(.+)>/)?.[1] || fromEmail;

  // Find previously linked emails from same sender
  const historyResult = await pool.query(
    `SELECT related_to_type, related_to_id, COUNT(*) as link_count
     FROM synced_emails
     WHERE user_id = $1
       AND from_email = $2
       AND related_to_type IS NOT NULL
       AND related_to_id IS NOT NULL
     GROUP BY related_to_type, related_to_id
     ORDER BY link_count DESC
     LIMIT 1`,
    [userId, email]
  );

  if (historyResult.rows.length > 0) {
    const { related_to_type, related_to_id, link_count } = historyResult.rows[0];

    return {
      entityType: related_to_type as any,
      entityId: related_to_id,
      confidence: Math.min(0.8, 0.4 + (link_count * 0.1)), // Higher confidence with more history
      reason: `Historical pattern: ${link_count} previous emails linked to this entity`,
    };
  }

  return { entityType: null, entityId: null, confidence: 0, reason: 'No historical pattern' };
}

/**
 * Bulk auto-link emails
 */
export async function bulkAutoLinkEmails(userId: string, emailIds: string[]): Promise<{
  linked: number;
  failed: number;
  results: Array<{ emailId: string; result: LinkingResult }>;
}> {
  const results: Array<{ emailId: string; result: LinkingResult }> = [];
  let linked = 0;
  let failed = 0;

  for (const emailId of emailIds) {
    try {
      // Get email details
      const emailResult = await pool.query(
        `SELECT id, from_email, subject, body_text, to_emails
         FROM synced_emails
         WHERE id = $1 AND user_id = $2`,
        [emailId, userId]
      );

      if (emailResult.rows.length === 0) {
        failed++;
        continue;
      }

      const email = emailResult.rows[0];
      const linkResult = await autoLinkEmail(
        userId,
        email.id,
        email.from_email,
        email.subject,
        email.body_text || '',
        email.to_emails || []
      );

      results.push({ emailId, result: linkResult });

      // Apply link if confidence is high enough (>= 0.6)
      if (linkResult.entityId && linkResult.confidence >= 0.6) {
        await pool.query(
          `UPDATE synced_emails
           SET related_to_type = $1, related_to_id = $2, updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [linkResult.entityType, linkResult.entityId, emailId]
        );
        linked++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to auto-link email ${emailId}:`, error);
      failed++;
    }
  }

  return { linked, failed, results };
}

/**
 * Get linking suggestions for email (for manual review)
 */
export async function getLinkingSuggestions(
  userId: string,
  emailId: string
): Promise<LinkingResult[]> {
  const emailResult = await pool.query(
    `SELECT from_email, subject, body_text, to_emails
     FROM synced_emails
     WHERE id = $1 AND user_id = $2`,
    [emailId, userId]
  );

  if (emailResult.rows.length === 0) {
    return [];
  }

  const email = emailResult.rows[0];
  const suggestions: LinkingResult[] = [];

  // Get all possible links
  const emailMatch = await linkByEmailAddress(userId, email.from_email, email.to_emails || []);
  if (emailMatch.entityId) suggestions.push(emailMatch);

  const domainMatch = await linkByDomain(userId, email.from_email);
  if (domainMatch.entityId) suggestions.push(domainMatch);

  const keywordMatch = await linkByKeywords(userId, email.subject, email.body_text || '');
  if (keywordMatch.entityId) suggestions.push(keywordMatch);

  const patternMatch = await linkByHistoricalPattern(userId, email.from_email, email.subject);
  if (patternMatch.entityId) suggestions.push(patternMatch);

  // Sort by confidence descending
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Create custom linking rule
 */
export async function createLinkingRule(
  userId: string,
  params: {
    ruleType: 'email_domain' | 'email_address' | 'subject_keyword' | 'sender_name';
    matchPattern: string;
    targetEntityType: 'client_lead' | 'recruit_lead' | 'contact' | 'opportunity';
    targetEntityId?: string;
    priority: number;
    isActive: boolean;
  }
) {
  const result = await pool.query(
    `INSERT INTO email_linking_rules (
      user_id, rule_type, match_pattern, target_entity_type, target_entity_id,
      priority, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      userId,
      params.ruleType,
      params.matchPattern,
      params.targetEntityType,
      params.targetEntityId,
      params.priority,
      params.isActive,
    ]
  );

  return result.rows[0];
}

/**
 * Apply custom linking rules
 */
export async function applyCustomRules(
  userId: string,
  fromEmail: string,
  subject: string
): Promise<LinkingResult | null> {
  const email = fromEmail.match(/<(.+)>/)?.[1] || fromEmail;
  const domain = email.split('@')[1];

  // Get active rules sorted by priority
  const rulesResult = await pool.query(
    `SELECT * FROM email_linking_rules
     WHERE user_id = $1 AND is_active = true
     ORDER BY priority DESC`,
    [userId]
  );

  for (const rule of rulesResult.rows) {
    let isMatch = false;

    switch (rule.rule_type) {
      case 'email_domain':
        isMatch = domain === rule.match_pattern;
        break;
      case 'email_address':
        isMatch = email.toLowerCase() === rule.match_pattern.toLowerCase();
        break;
      case 'subject_keyword':
        isMatch = subject.toLowerCase().includes(rule.match_pattern.toLowerCase());
        break;
      case 'sender_name':
        isMatch = fromEmail.toLowerCase().includes(rule.match_pattern.toLowerCase());
        break;
    }

    if (isMatch) {
      return {
        entityType: rule.target_entity_type,
        entityId: rule.target_entity_id,
        confidence: 0.9, // Custom rules have high confidence
        reason: `Custom rule: ${rule.rule_type} matches "${rule.match_pattern}"`,
      };
    }
  }

  return null;
}
