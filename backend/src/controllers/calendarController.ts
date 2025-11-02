import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import pool from '../db/database.js';
import {
  syncCalendarEvents,
  getEventById,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  cancelCalendarEvent,
  createQuickEvent,
  findAvailableSlots,
  checkFreeBusy,
  addGoogleMeet,
} from '../services/calendarService.js';
import { createOAuth2Client, setCredentials } from '../services/googleDriveService.js';

/**
 * Get user's OAuth client
 */
async function getUserOAuthClient(userId: string) {
  const result = await pool.query(
    'SELECT access_token, refresh_token FROM google_drive_credentials WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Google account not connected');
  }

  const oauth2Client = createOAuth2Client();
  setCredentials(oauth2Client, result.rows[0].access_token, result.rows[0].refresh_token);
  return oauth2Client;
}

/**
 * Sync calendar events
 */
export const syncCalendar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { days = 30 } = req.query;

    const oauth2Client = await getUserOAuthClient(userId);

    // Start sync
    const syncStart = new Date();
    await pool.query(
      `INSERT INTO google_sync_history (user_id, sync_type, sync_direction, status, started_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'calendar', 'pull', 'in_progress', syncStart]
    );

    // Fetch events
    const timeMax = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
    const events = await syncCalendarEvents(oauth2Client, { timeMax });

    // Save to database
    let syncedCount = 0;
    let failedCount = 0;

    for (const event of events) {
      try {
        await pool.query(
          `INSERT INTO synced_calendar_events (
            user_id, google_event_id, google_calendar_id, summary, description, location,
            start_time, end_time, time_zone, all_day, attendees, organizer_email, organizer_name,
            status, event_link, meeting_link, has_conference
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (user_id, google_event_id)
          DO UPDATE SET
            summary = EXCLUDED.summary,
            description = EXCLUDED.description,
            location = EXCLUDED.location,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            attendees = EXCLUDED.attendees,
            status = EXCLUDED.status,
            meeting_link = EXCLUDED.meeting_link,
            synced_at = CURRENT_TIMESTAMP
          RETURNING id`,
          [
            userId,
            event.id,
            'primary',
            event.summary,
            event.description,
            event.location,
            new Date(event.start.dateTime),
            new Date(event.end.dateTime),
            event.start.timeZone,
            false,
            event.attendees?.map(a => a.email) || [],
            event.organizer?.email,
            event.organizer?.displayName,
            event.status,
            event.htmlLink,
            event.hangoutLink,
            !!event.conferenceData,
          ]
        );

        syncedCount++;
      } catch (error) {
        console.error('Failed to save event:', error);
        failedCount++;
      }
    }

    // Update sync history
    const syncEnd = new Date();
    await pool.query(
      `UPDATE google_sync_history
       SET status = $1, items_synced = $2, items_failed = $3, completed_at = $4,
           duration_seconds = EXTRACT(EPOCH FROM ($4 - started_at))
       WHERE user_id = $5 AND sync_type = 'calendar' AND started_at = $6`,
      ['success', syncedCount, failedCount, syncEnd, userId, syncStart]
    );

    // Update sync settings
    await pool.query(
      `INSERT INTO google_sync_settings (user_id, calendar_sync_enabled, calendar_last_sync)
       VALUES ($1, true, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET calendar_last_sync = EXCLUDED.calendar_last_sync`,
      [userId, syncEnd]
    );

    res.json({
      success: true,
      synced: syncedCount,
      failed: failedCount,
      total: events.length,
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    res.status(500).json({ error: 'Failed to sync calendar' });
  }
};

/**
 * Get calendar events
 */
export const getEvents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, status, relatedTo } = req.query;

    let query = 'SELECT * FROM synced_calendar_events WHERE user_id = $1';
    const params: any[] = [userId];

    if (startDate) {
      params.push(new Date(startDate as string));
      query += ` AND start_time >= $${params.length}`;
    }

    if (endDate) {
      params.push(new Date(endDate as string));
      query += ` AND end_time <= $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (relatedTo) {
      params.push(relatedTo);
      query += ` AND related_to_id = $${params.length}`;
    }

    query += ' ORDER BY start_time ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

/**
 * Get event by ID
 */
export const getEventDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM synced_calendar_events WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get event details error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

/**
 * Create calendar event
 */
export const createEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { summary, description, location, startTime, endTime, attendees, addMeetLink, relatedToType, relatedToId } = req.body;

    const oauth2Client = await getUserOAuthClient(userId);

    const event = await createCalendarEvent(oauth2Client, {
      summary,
      description,
      location,
      start: new Date(startTime),
      end: new Date(endTime),
      attendees: attendees?.map((email: string) => ({ email })),
      conferenceData: addMeetLink ? {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      } : undefined,
    });

    // Save to database
    const result = await pool.query(
      `INSERT INTO synced_calendar_events (
        user_id, google_event_id, google_calendar_id, summary, description, location,
        start_time, end_time, time_zone, attendees, organizer_email, status,
        event_link, meeting_link, has_conference, related_to_type, related_to_id, created_in_app
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        userId,
        event.id,
        'primary',
        event.summary,
        event.description,
        event.location,
        new Date(event.start.dateTime),
        new Date(event.end.dateTime),
        event.start.timeZone,
        event.attendees?.map(a => a.email) || [],
        event.organizer?.email,
        event.status,
        event.htmlLink,
        event.hangoutLink,
        !!event.conferenceData,
        relatedToType,
        relatedToId,
        true,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

/**
 * Update calendar event
 */
export const updateEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { summary, description, location, startTime, endTime, attendees, status } = req.body;

    // Get event
    const eventResult = await pool.query(
      'SELECT google_event_id FROM synced_calendar_events WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const oauth2Client = await getUserOAuthClient(userId);

    const updated = await updateCalendarEvent(oauth2Client, eventResult.rows[0].google_event_id, {
      summary,
      description,
      location,
      start: startTime ? new Date(startTime) : undefined,
      end: endTime ? new Date(endTime) : undefined,
      attendees: attendees?.map((email: string) => ({ email })),
      status,
    });

    // Update database
    await pool.query(
      `UPDATE synced_calendar_events
       SET summary = COALESCE($1, summary),
           description = COALESCE($2, description),
           location = COALESCE($3, location),
           start_time = COALESCE($4, start_time),
           end_time = COALESCE($5, end_time),
           attendees = COALESCE($6, attendees),
           status = COALESCE($7, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [summary, description, location, startTime ? new Date(startTime) : null, endTime ? new Date(endTime) : null, attendees, status, id]
    );

    res.json({ success: true, event: updated });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

/**
 * Delete calendar event
 */
export const deleteEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const eventResult = await pool.query(
      'SELECT google_event_id FROM synced_calendar_events WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const oauth2Client = await getUserOAuthClient(userId);
    await deleteCalendarEvent(oauth2Client, eventResult.rows[0].google_event_id);

    // Mark as cancelled in database (keep for audit)
    await pool.query(
      `UPDATE synced_calendar_events
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

/**
 * Find available time slots
 */
export const findSlots = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { attendees, durationMinutes = 60, searchDays = 7 } = req.body;

    const oauth2Client = await getUserOAuthClient(userId);

    const slots = await findAvailableSlots(
      oauth2Client,
      attendees || [],
      Number(durationMinutes),
      Number(searchDays)
    );

    res.json({ slots });
  } catch (error) {
    console.error('Find slots error:', error);
    res.status(500).json({ error: 'Failed to find available slots' });
  }
};

/**
 * Check availability
 */
export const checkAvailability = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { emails, startTime, endTime } = req.body;

    const oauth2Client = await getUserOAuthClient(userId);

    const busyTimes = await checkFreeBusy(
      oauth2Client,
      emails,
      new Date(startTime),
      new Date(endTime)
    );

    res.json({ busyTimes });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
};

/**
 * Create quick event from text
 */
export const createQuick = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { text } = req.body;

    const oauth2Client = await getUserOAuthClient(userId);
    const event = await createQuickEvent(oauth2Client, text);

    // Save to database
    const result = await pool.query(
      `INSERT INTO synced_calendar_events (
        user_id, google_event_id, google_calendar_id, summary, start_time, end_time,
        time_zone, status, event_link, created_in_app
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        userId,
        event.id,
        'primary',
        event.summary,
        new Date(event.start.dateTime),
        new Date(event.end.dateTime),
        event.start.timeZone,
        event.status,
        event.htmlLink,
        true,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create quick event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

/**
 * Add Google Meet to event
 */
export const addMeetLink = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const eventResult = await pool.query(
      'SELECT google_event_id FROM synced_calendar_events WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const oauth2Client = await getUserOAuthClient(userId);
    const updated = await addGoogleMeet(oauth2Client, eventResult.rows[0].google_event_id);

    // Update database
    await pool.query(
      `UPDATE synced_calendar_events
       SET meeting_link = $1, has_conference = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [updated.hangoutLink, id]
    );

    res.json({ success: true, meetingLink: updated.hangoutLink });
  } catch (error) {
    console.error('Add Meet link error:', error);
    res.status(500).json({ error: 'Failed to add Google Meet' });
  }
};

/**
 * Link event to CRM entity
 */
export const linkEventToEntity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { relatedToType, relatedToId } = req.body;

    const result = await pool.query(
      `UPDATE synced_calendar_events
       SET related_to_type = $1, related_to_id = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [relatedToType, relatedToId, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Link event error:', error);
    res.status(500).json({ error: 'Failed to link event' });
  }
};

/**
 * Get sync status
 */
export const getCalendarSyncStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `SELECT
        calendar_sync_enabled,
        calendar_last_sync,
        (SELECT COUNT(*) FROM synced_calendar_events WHERE user_id = $1) as events_synced,
        (SELECT COUNT(*) FROM synced_calendar_events WHERE user_id = $1 AND start_time >= NOW()) as upcoming_events
       FROM google_sync_settings
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        calendar_sync_enabled: false,
        calendar_last_sync: null,
        events_synced: 0,
        upcoming_events: 0,
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get sync status error:', error);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
};
