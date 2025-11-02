import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  Clock,
  MapPin,
  Users,
  Video,
  Link as LinkIcon,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  google_event_id: string;
  calendar_id: string;
  summary: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  timezone: string;
  is_all_day: boolean;
  meeting_link?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  related_to_type?: string;
  related_to_id?: string;
  attendees?: Array<{
    email: string;
    display_name?: string;
    response_status: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
}

interface AvailableSlot {
  start: string;
  end: string;
}

type ViewMode = 'month' | 'week' | 'day';

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAvailabilityFinder, setShowAvailabilityFinder] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  // Create event form
  const [newEvent, setNewEvent] = useState({
    summary: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    attendees: '',
    addMeetLink: false,
  });

  // Availability finder form
  const [availabilitySearch, setAvailabilitySearch] = useState({
    attendees: '',
    durationMinutes: 60,
    searchDays: 7,
  });

  const [syncStatus, setSyncStatus] = useState<any>(null);

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Calculate time range based on view mode
      let timeMin: Date;
      let timeMax: Date;

      if (viewMode === 'month') {
        timeMin = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        timeMax = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      } else if (viewMode === 'week') {
        const day = currentDate.getDay();
        timeMin = new Date(currentDate);
        timeMin.setDate(currentDate.getDate() - day);
        timeMax = new Date(timeMin);
        timeMax.setDate(timeMin.getDate() + 7);
      } else {
        timeMin = new Date(currentDate);
        timeMin.setHours(0, 0, 0, 0);
        timeMax = new Date(currentDate);
        timeMax.setHours(23, 59, 59, 999);
      }

      const params = new URLSearchParams({
        upcoming: 'true',
        limit: '100',
      });

      const response = await fetch(`/api/calendar/events?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/calendar/status', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  // Sync calendar
  const syncCalendar = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Synced ${data.synced} events`);
        fetchEvents();
        fetchSyncStatus();
      }
    } catch (error) {
      console.error('Failed to sync calendar:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Create event
  const createEvent = async () => {
    try {
      const token = localStorage.getItem('token');

      const startDateTime = new Date(`${newEvent.startDate}T${newEvent.startTime}`);
      const endDateTime = new Date(`${newEvent.endDate}T${newEvent.endTime}`);

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: newEvent.summary,
          description: newEvent.description,
          location: newEvent.location,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          attendees: newEvent.attendees
            .split(',')
            .map((email) => email.trim())
            .filter(Boolean),
          addMeetLink: newEvent.addMeetLink,
        }),
      });

      if (response.ok) {
        alert('Event created successfully!');
        setShowCreateModal(false);
        setNewEvent({
          summary: '',
          description: '',
          location: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          attendees: '',
          addMeetLink: false,
        });
        fetchEvents();
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  // Delete event
  const deleteEvent = async (eventId: string) => {
    if (!confirm('Delete this event?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchEvents();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  // Find available slots
  const findAvailableSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/calendar/find-slots', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendees: availabilitySearch.attendees
            .split(',')
            .map((email) => email.trim())
            .filter(Boolean),
          durationMinutes: availabilitySearch.durationMinutes,
          searchDays: availabilitySearch.searchDays,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Failed to find available slots:', error);
    }
  };

  // Quick create event
  const quickCreateEvent = async (text: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/calendar/quick', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Failed to quick create event:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchSyncStatus();
  }, [currentDate, viewMode]);

  // Navigation
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar rendering helpers
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter((event) => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateHeader = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={syncCalendar}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync'}
            </button>
            <button
              onClick={() => setShowAvailabilityFinder(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Search className="w-4 h-4" />
              Find Time
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>

        {/* Sync Status */}
        {syncStatus && (
          <div className="text-sm text-gray-600 mb-4">
            <div className="flex gap-4">
              <span>Total Events: {syncStatus.events_synced || 0}</span>
              <span>Upcoming: {syncStatus.upcoming_events || 0}</span>
            </div>
            {syncStatus.calendar_last_sync && (
              <div className="text-xs text-gray-500 mt-1">
                Last sync: {new Date(syncStatus.calendar_last_sync).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={navigateToday}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Today
            </button>
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 ml-4">
              {formatDateHeader()}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-semibold text-gray-700 bg-gray-50"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {getMonthDays().map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isToday =
                date &&
                date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                    !date ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {date && (
                    <>
                      <div
                        className={`text-sm font-medium mb-2 ${
                          isToday
                            ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                            : 'text-gray-700'
                        }`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="text-xs p-1.5 bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200 truncate"
                          >
                            {formatTime(event.start_time)} {event.summary}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 pl-1.5">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.summary}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Time */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-gray-900">
                    {new Date(selectedEvent.start_time).toLocaleString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-gray-600">
                    {formatTime(selectedEvent.start_time)} -{' '}
                    {formatTime(selectedEvent.end_time)}
                  </div>
                </div>
              </div>

              {/* Location */}
              {selectedEvent.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="text-gray-900">{selectedEvent.location}</div>
                </div>
              )}

              {/* Meeting Link */}
              {selectedEvent.meeting_link && (
                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-gray-400 mt-0.5" />
                  <a
                    href={selectedEvent.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Join Google Meet
                  </a>
                </div>
              )}

              {/* Attendees */}
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium mb-2">Attendees</div>
                    <div className="space-y-1">
                      {selectedEvent.attendees.map((attendee, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <span>{attendee.display_name || attendee.email}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              attendee.response_status === 'accepted'
                                ? 'bg-green-100 text-green-700'
                                : attendee.response_status === 'declined'
                                ? 'bg-red-100 text-red-700'
                                : attendee.response_status === 'tentative'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {attendee.response_status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedEvent.description && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-gray-900 font-medium mb-2">Description</div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {selectedEvent.description}
                  </div>
                </div>
              )}

              {/* CRM Link */}
              {selectedEvent.related_to_type && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                  <LinkIcon className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-700 font-medium">
                    Linked to {selectedEvent.related_to_type.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => deleteEvent(selectedEvent.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create Event</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEvent.summary}
                  onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Meeting with client"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Office, Zoom, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendees (comma-separated emails)
                </label>
                <input
                  type="text"
                  value={newEvent.attendees}
                  onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="client@example.com, colleague@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Meeting agenda and notes..."
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newEvent.addMeetLink}
                  onChange={(e) => setNewEvent({ ...newEvent, addMeetLink: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="text-sm text-gray-700">
                  Add Google Meet video conferencing
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={createEvent}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Availability Finder Modal */}
      {showAvailabilityFinder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Find Available Time</h2>
              <button
                onClick={() => setShowAvailabilityFinder(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendees (comma-separated emails)
                </label>
                <input
                  type="text"
                  value={availabilitySearch.attendees}
                  onChange={(e) =>
                    setAvailabilitySearch({ ...availabilitySearch, attendees: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="attendee1@example.com, attendee2@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={availabilitySearch.durationMinutes}
                    onChange={(e) =>
                      setAvailabilitySearch({
                        ...availabilitySearch,
                        durationMinutes: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Period (days)
                  </label>
                  <input
                    type="number"
                    value={availabilitySearch.searchDays}
                    onChange={(e) =>
                      setAvailabilitySearch({
                        ...availabilitySearch,
                        searchDays: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={findAvailableSlots}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Search className="w-4 h-4" />
                Find Available Slots
              </button>

              {/* Available Slots */}
              {availableSlots.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Available Time Slots
                  </h3>
                  <div className="space-y-2">
                    {availableSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(slot.start).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(slot.start).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(slot.end).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setNewEvent({
                              ...newEvent,
                              startDate: new Date(slot.start).toISOString().split('T')[0],
                              startTime: new Date(slot.start).toTimeString().slice(0, 5),
                              endDate: new Date(slot.end).toISOString().split('T')[0],
                              endTime: new Date(slot.end).toTimeString().slice(0, 5),
                              attendees: availabilitySearch.attendees,
                            });
                            setShowAvailabilityFinder(false);
                            setShowCreateModal(true);
                          }}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          Book This Time
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
