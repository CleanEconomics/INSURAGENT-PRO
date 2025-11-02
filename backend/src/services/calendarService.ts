import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GoogleCalendarEvent, CalendarAttendee } from '../types/index.js';

/**
 * Google Calendar Service
 * Handles calendar event management and syncing
 */

const calendar = google.calendar({ version: 'v3' });

/**
 * Sync calendar events
 */
export async function syncCalendarEvents(
  oauth2Client: OAuth2Client,
  options?: {
    calendarId?: string;
    timeMin?: Date;
    timeMax?: Date;
    maxResults?: number;
    showDeleted?: boolean;
  }
): Promise<GoogleCalendarEvent[]> {
  const calendarId = options?.calendarId || 'primary';
  const timeMin = options?.timeMin || new Date();
  const maxResults = options?.maxResults || 50;

  const response = await calendar.events.list({
    auth: oauth2Client,
    calendarId: calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: options?.timeMax?.toISOString(),
    maxResults: maxResults,
    singleEvents: true,
    orderBy: 'startTime',
    showDeleted: options?.showDeleted || false,
  });

  return (response.data.items || []).map(event => formatEvent(event));
}

/**
 * Get specific event by ID
 */
export async function getEventById(
  oauth2Client: OAuth2Client,
  eventId: string,
  calendarId: string = 'primary'
): Promise<GoogleCalendarEvent> {
  const response = await calendar.events.get({
    auth: oauth2Client,
    calendarId: calendarId,
    eventId: eventId,
  });

  return formatEvent(response.data);
}

/**
 * Create calendar event
 */
export async function createCalendarEvent(
  oauth2Client: OAuth2Client,
  event: {
    summary: string;
    description?: string;
    location?: string;
    start: Date;
    end: Date;
    timeZone?: string;
    attendees?: Array<{ email: string; displayName?: string; optional?: boolean }>;
    reminders?: {
      useDefault?: boolean;
      overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>;
    };
    conferenceData?: any;
  },
  calendarId: string = 'primary'
): Promise<GoogleCalendarEvent> {
  const timeZone = event.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await calendar.events.insert({
    auth: oauth2Client,
    calendarId: calendarId,
    conferenceDataVersion: event.conferenceData ? 1 : 0,
    requestBody: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: timeZone,
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: timeZone,
      },
      attendees: event.attendees?.map(a => ({
        email: a.email,
        displayName: a.displayName,
        optional: a.optional,
      })),
      reminders: event.reminders,
      conferenceData: event.conferenceData,
    },
  });

  return formatEvent(response.data);
}

/**
 * Update calendar event
 */
export async function updateCalendarEvent(
  oauth2Client: OAuth2Client,
  eventId: string,
  updates: {
    summary?: string;
    description?: string;
    location?: string;
    start?: Date;
    end?: Date;
    timeZone?: string;
    attendees?: Array<{ email: string; displayName?: string; optional?: boolean }>;
    status?: 'confirmed' | 'tentative' | 'cancelled';
  },
  calendarId: string = 'primary'
): Promise<GoogleCalendarEvent> {
  const timeZone = updates.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const requestBody: any = {};

  if (updates.summary) requestBody.summary = updates.summary;
  if (updates.description) requestBody.description = updates.description;
  if (updates.location) requestBody.location = updates.location;
  if (updates.status) requestBody.status = updates.status;

  if (updates.start) {
    requestBody.start = {
      dateTime: updates.start.toISOString(),
      timeZone: timeZone,
    };
  }

  if (updates.end) {
    requestBody.end = {
      dateTime: updates.end.toISOString(),
      timeZone: timeZone,
    };
  }

  if (updates.attendees) {
    requestBody.attendees = updates.attendees.map(a => ({
      email: a.email,
      displayName: a.displayName,
      optional: a.optional,
    }));
  }

  const response = await calendar.events.patch({
    auth: oauth2Client,
    calendarId: calendarId,
    eventId: eventId,
    requestBody: requestBody,
  });

  return formatEvent(response.data);
}

/**
 * Delete calendar event
 */
export async function deleteCalendarEvent(
  oauth2Client: OAuth2Client,
  eventId: string,
  calendarId: string = 'primary'
): Promise<void> {
  await calendar.events.delete({
    auth: oauth2Client,
    calendarId: calendarId,
    eventId: eventId,
  });
}

/**
 * Cancel calendar event (soft delete)
 */
export async function cancelCalendarEvent(
  oauth2Client: OAuth2Client,
  eventId: string,
  calendarId: string = 'primary'
): Promise<GoogleCalendarEvent> {
  return updateCalendarEvent(oauth2Client, eventId, { status: 'cancelled' }, calendarId);
}

/**
 * Create quick event from natural language
 */
export async function createQuickEvent(
  oauth2Client: OAuth2Client,
  text: string,
  calendarId: string = 'primary'
): Promise<GoogleCalendarEvent> {
  const response = await calendar.events.quickAdd({
    auth: oauth2Client,
    calendarId: calendarId,
    text: text,
  });

  return formatEvent(response.data);
}

/**
 * Check availability (free/busy)
 */
export async function checkFreeBusy(
  oauth2Client: OAuth2Client,
  emails: string[],
  timeMin: Date,
  timeMax: Date
): Promise<Record<string, Array<{ start: string; end: string }>>> {
  const response = await calendar.freebusy.query({
    auth: oauth2Client,
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: emails.map(email => ({ id: email })),
    },
  });

  const result: Record<string, Array<{ start: string; end: string }>> = {};

  for (const [email, data] of Object.entries(response.data.calendars || {})) {
    result[email] = (data as any).busy || [];
  }

  return result;
}

/**
 * Find available time slots
 */
export async function findAvailableSlots(
  oauth2Client: OAuth2Client,
  attendees: string[],
  durationMinutes: number,
  searchPeriodDays: number = 7
): Promise<Array<{ start: Date; end: Date }>> {
  const timeMin = new Date();
  const timeMax = new Date(Date.now() + searchPeriodDays * 24 * 60 * 60 * 1000);

  const busyTimes = await checkFreeBusy(oauth2Client, attendees, timeMin, timeMax);

  // Merge all busy times
  const allBusy: Array<{ start: Date; end: Date }> = [];
  for (const times of Object.values(busyTimes)) {
    for (const period of times) {
      allBusy.push({
        start: new Date(period.start),
        end: new Date(period.end),
      });
    }
  }

  // Sort busy times
  allBusy.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Find gaps that fit the duration
  const availableSlots: Array<{ start: Date; end: Date }> = [];
  const workStart = 9; // 9 AM
  const workEnd = 17; // 5 PM

  for (let day = 0; day < searchPeriodDays; day++) {
    const date = new Date(Date.now() + day * 24 * 60 * 60 * 1000);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    let currentTime = new Date(date);
    currentTime.setHours(workStart, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(workEnd, 0, 0, 0);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);

      if (slotEnd > endOfDay) break;

      // Check if this slot overlaps with any busy time
      const isBusy = allBusy.some(busy =>
        (currentTime >= busy.start && currentTime < busy.end) ||
        (slotEnd > busy.start && slotEnd <= busy.end) ||
        (currentTime <= busy.start && slotEnd >= busy.end)
      );

      if (!isBusy) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd),
        });
      }

      // Move to next slot (30 minute intervals)
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }
  }

  return availableSlots.slice(0, 10); // Return top 10 slots
}

/**
 * Add Google Meet to event
 */
export async function addGoogleMeet(
  oauth2Client: OAuth2Client,
  eventId: string,
  calendarId: string = 'primary'
): Promise<GoogleCalendarEvent> {
  const response = await calendar.events.patch({
    auth: oauth2Client,
    calendarId: calendarId,
    eventId: eventId,
    conferenceDataVersion: 1,
    requestBody: {
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  return formatEvent(response.data);
}

/**
 * List calendars
 */
export async function listCalendars(oauth2Client: OAuth2Client) {
  const response = await calendar.calendarList.list({
    auth: oauth2Client,
  });

  return (response.data.items || []).map(cal => ({
    id: cal.id!,
    summary: cal.summary!,
    description: cal.description,
    timeZone: cal.timeZone,
    primary: cal.primary,
    accessRole: cal.accessRole,
    backgroundColor: cal.backgroundColor,
  }));
}

/**
 * Create calendar
 */
export async function createCalendar(
  oauth2Client: OAuth2Client,
  summary: string,
  description?: string,
  timeZone?: string
) {
  const response = await calendar.calendars.insert({
    auth: oauth2Client,
    requestBody: {
      summary,
      description,
      timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  return response.data;
}

/**
 * Get calendar settings
 */
export async function getCalendarSettings(oauth2Client: OAuth2Client) {
  const response = await calendar.settings.list({
    auth: oauth2Client,
  });

  return response.data.items || [];
}

/**
 * Format event to GoogleCalendarEvent type
 */
function formatEvent(event: any): GoogleCalendarEvent {
  const timeZone = event.start?.timeZone || event.end?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    id: event.id!,
    summary: event.summary || 'Untitled Event',
    description: event.description,
    location: event.location,
    start: {
      dateTime: event.start?.dateTime || event.start?.date,
      timeZone: timeZone,
    },
    end: {
      dateTime: event.end?.dateTime || event.end?.date,
      timeZone: timeZone,
    },
    attendees: event.attendees?.map((a: any) => ({
      email: a.email,
      displayName: a.displayName,
      responseStatus: a.responseStatus,
      optional: a.optional,
    })),
    organizer: event.organizer ? {
      email: event.organizer.email,
      displayName: event.organizer.displayName,
    } : undefined,
    status: event.status || 'confirmed',
    htmlLink: event.htmlLink,
    hangoutLink: event.hangoutLink,
    conferenceData: event.conferenceData,
    reminders: event.reminders,
  };
}

/**
 * Watch calendar for changes
 */
export async function watchCalendar(
  oauth2Client: OAuth2Client,
  webhookUrl: string,
  calendarId: string = 'primary'
): Promise<{ id: string; channelId: string; resourceId: string; expiration: string }> {
  const response = await calendar.events.watch({
    auth: oauth2Client,
    calendarId: calendarId,
    requestBody: {
      id: `channel-${Date.now()}`,
      type: 'web_hook',
      address: webhookUrl,
    },
  });

  return {
    id: response.data.id!,
    channelId: response.data.id!, // channelId is the same as id
    resourceId: response.data.resourceId!,
    expiration: response.data.expiration!,
  };
}

/**
 * Stop watching calendar
 */
export async function stopWatchingCalendar(
  oauth2Client: OAuth2Client,
  channelId: string,
  resourceId: string
): Promise<void> {
  await calendar.channels.stop({
    auth: oauth2Client,
    requestBody: {
      id: channelId,
      resourceId: resourceId,
    },
  });
}
