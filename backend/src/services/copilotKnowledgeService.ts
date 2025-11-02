import pool from '../db/database.js';

/**
 * Copilot Knowledge Service
 * Integrates Google Drive training data with AI Copilot for context-aware responses
 */

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  sourceType: string;
  relevanceScore: number;
  fileName?: string;
  webViewLink?: string;
  category?: string;
  tags?: string[];
}

/**
 * Search knowledge base and training data
 */
export async function searchKnowledgeHub(
  userId: string,
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  // Search in copilot knowledge base
  const kbResults = await pool.query(
    `SELECT
      kb.id,
      kb.title,
      kb.content,
      kb.source_type as "sourceType",
      kb.source_reference as "sourceReference",
      kb.relevance_score as "relevanceScore",
      kb.keywords
    FROM copilot_knowledge_base kb
    WHERE (kb.user_id = $1 OR kb.is_public = true)
      AND (
        kb.title ILIKE $2
        OR kb.content ILIKE $2
        OR $3 = ANY(kb.keywords)
      )
    ORDER BY kb.relevance_score DESC, kb.created_at DESC
    LIMIT $4`,
    [userId, `%${query}%`, query, limit]
  );

  // Search in training data references with cached content
  const trainingResults = await pool.query(
    `SELECT
      tdr.id,
      dfr.file_name as "fileName",
      dfr.web_view_link as "webViewLink",
      tdr.category,
      tdr.tags,
      tdr.description,
      dfc.extracted_text as "extractedText"
    FROM training_data_references tdr
    JOIN drive_file_references dfr ON tdr.drive_file_ref_id = dfr.id
    LEFT JOIN drive_file_content_cache dfc ON dfr.id = dfc.drive_file_ref_id
    WHERE tdr.user_id = $1
      AND tdr.is_active = true
      AND (
        dfr.file_name ILIKE $2
        OR tdr.description ILIKE $2
        OR dfc.extracted_text ILIKE $2
        OR $3 = ANY(tdr.tags)
      )
    ORDER BY tdr.usage_count DESC, tdr.created_at DESC
    LIMIT $4`,
    [userId, `%${query}%`, query, limit]
  );

  // Combine and format results
  const results: SearchResult[] = [];

  // Add knowledge base results
  for (const row of kbResults.rows) {
    results.push({
      id: row.id,
      title: row.title,
      content: row.content.substring(0, 500), // Truncate for context
      source: row.sourceType === 'drive_file' ? 'Google Drive' : 'Knowledge Base',
      sourceType: row.sourceType,
      relevanceScore: parseFloat(row.relevanceScore),
    });
  }

  // Add training data results
  for (const row of trainingResults.rows) {
    results.push({
      id: row.id,
      title: row.fileName,
      content: row.extractedText ? row.extractedText.substring(0, 500) : (row.description || ''),
      source: 'Training Data',
      sourceType: 'drive_file',
      relevanceScore: 1.0,
      fileName: row.fileName,
      webViewLink: row.webViewLink,
      category: row.category,
      tags: row.tags,
    });
  }

  // Sort by relevance
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results.slice(0, limit);
}

/**
 * Get training content by category for context
 */
export async function getTrainingContentByCategory(
  userId: string,
  category: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const results = await pool.query(
    `SELECT
      tdr.id,
      dfr.file_name as "fileName",
      dfr.web_view_link as "webViewLink",
      tdr.category,
      tdr.tags,
      tdr.description,
      dfc.extracted_text as "extractedText",
      tdr.usage_count as "usageCount"
    FROM training_data_references tdr
    JOIN drive_file_references dfr ON tdr.drive_file_ref_id = dfr.id
    LEFT JOIN drive_file_content_cache dfc ON dfr.id = dfc.drive_file_ref_id
    WHERE tdr.user_id = $1
      AND tdr.category = $2
      AND tdr.is_active = true
    ORDER BY tdr.usage_count DESC, tdr.created_at DESC
    LIMIT $3`,
    [userId, category, limit]
  );

  return results.rows.map(row => ({
    id: row.id,
    title: row.fileName,
    content: row.extractedText || row.description || '',
    source: 'Training Data',
    sourceType: 'drive_file',
    relevanceScore: 1.0,
    fileName: row.fileName,
    webViewLink: row.webViewLink,
    category: row.category,
    tags: row.tags,
  }));
}

/**
 * Build enhanced context for AI Copilot with training data
 */
export async function buildCopilotContext(
  userId: string,
  userQuery: string,
  includeCategories?: string[]
): Promise<string> {
  const contextParts: string[] = [];

  // Search knowledge base
  const searchResults = await searchKnowledgeHub(userId, userQuery, 5);

  if (searchResults.length > 0) {
    contextParts.push('=== Relevant Knowledge Base Articles ===');
    for (const result of searchResults) {
      contextParts.push(`\n[${result.title}]`);
      contextParts.push(result.content);
      if (result.webViewLink) {
        contextParts.push(`Source: ${result.webViewLink}`);
      }
    }
  }

  // Include specific category training
  if (includeCategories && includeCategories.length > 0) {
    for (const category of includeCategories) {
      const categoryContent = await getTrainingContentByCategory(userId, category, 3);
      if (categoryContent.length > 0) {
        contextParts.push(`\n=== ${category.toUpperCase()} Training Materials ===`);
        for (const item of categoryContent) {
          contextParts.push(`\n[${item.title}]`);
          contextParts.push(item.content.substring(0, 300));
        }
      }
    }
  }

  return contextParts.join('\n');
}

/**
 * Log training data usage
 */
export async function logTrainingDataUsage(
  userId: string,
  trainingDataId: string,
  context: any
): Promise<void> {
  // Update usage count
  await pool.query(
    'UPDATE training_data_references SET usage_count = usage_count + 1, last_used_at = NOW() WHERE id = $1',
    [trainingDataId]
  );

  // Log access
  const fileRefResult = await pool.query(
    'SELECT drive_file_ref_id FROM training_data_references WHERE id = $1',
    [trainingDataId]
  );

  if (fileRefResult.rows.length > 0) {
    await pool.query(
      `INSERT INTO drive_file_access_log (user_id, drive_file_ref_id, access_type, accessed_by, context)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, fileRefResult.rows[0].drive_file_ref_id, 'ai_query', 'copilot', JSON.stringify(context)]
    );
  }
}

/**
 * Get most used training materials
 */
export async function getMostUsedTraining(
  userId: string,
  limit: number = 10
): Promise<SearchResult[]> {
  const results = await pool.query(
    `SELECT
      tdr.id,
      dfr.file_name as "fileName",
      dfr.web_view_link as "webViewLink",
      tdr.category,
      tdr.tags,
      tdr.description,
      tdr.usage_count as "usageCount",
      dfc.extracted_text as "extractedText"
    FROM training_data_references tdr
    JOIN drive_file_references dfr ON tdr.drive_file_ref_id = dfr.id
    LEFT JOIN drive_file_content_cache dfc ON dfr.id = dfc.drive_file_ref_id
    WHERE tdr.user_id = $1 AND tdr.is_active = true
    ORDER BY tdr.usage_count DESC
    LIMIT $2`,
    [userId, limit]
  );

  return results.rows.map(row => ({
    id: row.id,
    title: row.fileName,
    content: row.extractedText || row.description || '',
    source: 'Training Data',
    sourceType: 'drive_file',
    relevanceScore: row.usageCount / 100, // Normalize usage count as relevance
    fileName: row.fileName,
    webViewLink: row.webViewLink,
    category: row.category,
    tags: row.tags,
  }));
}

/**
 * Create knowledge base entry from search results
 */
export async function promoteToKnowledgeBase(
  userId: string,
  trainingDataId: string,
  title: string,
  keywords: string[]
): Promise<void> {
  // Get training data content
  const result = await pool.query(
    `SELECT
      tdr.id,
      dfr.drive_file_id as "driveFileId",
      dfc.extracted_text as "extractedText",
      tdr.description
    FROM training_data_references tdr
    JOIN drive_file_references dfr ON tdr.drive_file_ref_id = dfr.id
    LEFT JOIN drive_file_content_cache dfc ON dfr.id = dfc.drive_file_ref_id
    WHERE tdr.id = $1 AND tdr.user_id = $2`,
    [trainingDataId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Training data not found');
  }

  const data = result.rows[0];
  const content = data.extractedText || data.description || '';

  // Create knowledge base entry
  await pool.query(
    `INSERT INTO copilot_knowledge_base
     (user_id, training_data_ref_id, title, content, source_type, source_reference, keywords, relevance_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, trainingDataId, title, content, 'drive_file', data.driveFileId, keywords, 1.5]
  );
}

/**
 * Smart search with category hints
 */
export async function smartSearch(
  userId: string,
  query: string,
  options?: {
    categories?: string[];
    tags?: string[];
    minRelevance?: number;
    limit?: number;
  }
): Promise<SearchResult[]> {
  const limit = options?.limit || 10;
  const minRelevance = options?.minRelevance || 0;

  let whereConditions = ['(tdr.user_id = $1 OR kb.is_public = true)', 'tdr.is_active = true'];
  const params: any[] = [userId, `%${query}%`, query];

  if (options?.categories && options.categories.length > 0) {
    params.push(options.categories);
    whereConditions.push(`tdr.category = ANY($${params.length})`);
  }

  if (options?.tags && options.tags.length > 0) {
    params.push(options.tags);
    whereConditions.push(`tdr.tags && $${params.length}`);
  }

  const queryText = `
    SELECT DISTINCT
      tdr.id,
      dfr.file_name as "fileName",
      dfr.web_view_link as "webViewLink",
      tdr.category,
      tdr.tags,
      tdr.description,
      dfc.extracted_text as "extractedText",
      tdr.usage_count as "usageCount",
      CASE
        WHEN dfr.file_name ILIKE $2 THEN 3
        WHEN tdr.description ILIKE $2 THEN 2
        WHEN dfc.extracted_text ILIKE $2 THEN 1
        WHEN $3 = ANY(tdr.tags) THEN 2.5
        ELSE 0.5
      END as relevance
    FROM training_data_references tdr
    JOIN drive_file_references dfr ON tdr.drive_file_ref_id = dfr.id
    LEFT JOIN drive_file_content_cache dfc ON dfr.id = dfc.drive_file_ref_id
    LEFT JOIN copilot_knowledge_base kb ON tdr.id = kb.training_data_ref_id
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY relevance DESC, tdr.usage_count DESC
    LIMIT ${limit}
  `;

  const results = await pool.query(queryText, params);

  return results.rows
    .filter(row => row.relevance >= minRelevance)
    .map(row => ({
      id: row.id,
      title: row.fileName,
      content: row.extractedText || row.description || '',
      source: 'Training Data',
      sourceType: 'drive_file',
      relevanceScore: row.relevance,
      fileName: row.fileName,
      webViewLink: row.webViewLink,
      category: row.category,
      tags: row.tags,
    }));
}
