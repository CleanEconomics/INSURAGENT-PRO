import React, { useState, useEffect } from 'react';
import {
  Mail,
  MailOpen,
  Reply,
  Forward,
  Archive,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Send,
  X,
  Link as LinkIcon,
  User,
  Clock,
} from 'lucide-react';

interface Email {
  id: string;
  gmail_message_id: string;
  gmail_thread_id: string;
  subject: string;
  from_email: string;
  from_name?: string;
  to_emails: string[];
  cc_emails?: string[];
  message_date: string;
  snippet: string;
  body_text?: string;
  body_html?: string;
  label_ids: string[];
  has_attachments: boolean;
  attachment_count: number;
  is_read: boolean;
  related_to_type?: string;
  related_to_id?: string;
  synced_at: string;
}

interface EmailThread {
  id: string;
  emails: Email[];
}

interface ComposeData {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
}

const EmailInbox: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState<Email | null>(null);
  const [composeData, setComposeData] = useState<ComposeData>({
    to: [],
    cc: [],
    bcc: [],
    subject: '',
    body: '',
  });
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [linkingEntity, setLinkingEntity] = useState<{ type: string; id: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const emailsPerPage = 50;

  // Fetch emails
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        limit: emailsPerPage.toString(),
        offset: ((currentPage - 1) * emailsPerPage).toString(),
        ...(filterUnread && { unreadOnly: 'true' }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/gmail/emails?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEmails(data);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gmail/status', {
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

  // Sync emails from Gmail
  const syncEmails = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gmail/sync?maxResults=50', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Synced ${data.synced} emails`);
        fetchEmails();
        fetchSyncStatus();
      }
    } catch (error) {
      console.error('Failed to sync emails:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Fetch email thread
  const fetchThread = async (threadId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/gmail/threads/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedThread({ id: threadId, emails: data });
      }
    } catch (error) {
      console.error('Failed to fetch thread:', error);
    }
  };

  // Mark as read/unread
  const toggleReadStatus = async (email: Email) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/gmail/emails/${email.id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: !email.is_read }),
      });

      fetchEmails();
    } catch (error) {
      console.error('Failed to toggle read status:', error);
    }
  };

  // Archive email
  const archiveEmail = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/gmail/emails/${emailId}/archive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchEmails();
      setSelectedEmail(null);
    } catch (error) {
      console.error('Failed to archive email:', error);
    }
  };

  // Delete email
  const deleteEmail = async (emailId: string) => {
    if (!confirm('Move this email to trash?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/gmail/emails/${emailId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchEmails();
      setSelectedEmail(null);
    } catch (error) {
      console.error('Failed to delete email:', error);
    }
  };

  // Send email
  const sendEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(composeData),
      });

      if (response.ok) {
        alert('Email sent successfully!');
        setShowCompose(false);
        setComposeData({ to: [], cc: [], bcc: [], subject: '', body: '' });
        fetchEmails();
      }
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  // Reply to email
  const replyToEmail = async (originalEmail: Email, replyBody: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/gmail/emails/${originalEmail.id}/reply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: replyBody }),
      });

      if (response.ok) {
        alert('Reply sent!');
        setReplyTo(null);
        fetchEmails();
        if (selectedThread) {
          fetchThread(originalEmail.gmail_thread_id);
        }
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  // Link email to CRM entity
  const linkEmailToEntity = async (emailId: string, entityType: string, entityId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/gmail/emails/${emailId}/link`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relatedToType: entityType,
          relatedToId: entityId,
        }),
      });

      fetchEmails();
      setLinkingEntity(null);
    } catch (error) {
      console.error('Failed to link email:', error);
    }
  };

  useEffect(() => {
    fetchEmails();
    fetchSyncStatus();
  }, [currentPage, filterUnread, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Email List Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={syncEmails}
                disabled={syncing}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync'}
              </button>
              <button
                onClick={() => {
                  setShowCompose(true);
                  setReplyTo(null);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
                Compose
              </button>
            </div>
          </div>

          {/* Sync Status */}
          {syncStatus && (
            <div className="text-sm text-gray-600 mb-3">
              <div className="flex justify-between">
                <span>Total: {syncStatus.emails_synced || 0}</span>
                <span>Unread: {syncStatus.unread_count || 0}</span>
              </div>
              {syncStatus.gmail_last_sync && (
                <div className="text-xs text-gray-500 mt-1">
                  Last sync: {new Date(syncStatus.gmail_last_sync).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setFilterUnread(!filterUnread)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                filterUnread
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              {filterUnread ? 'Unread Only' : 'All'}
            </button>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mail className="w-16 h-16 mb-4 opacity-50" />
              <p>No emails found</p>
            </div>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  fetchThread(email.gmail_thread_id);
                  if (!email.is_read) {
                    toggleReadStatus(email);
                  }
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                } ${!email.is_read ? 'bg-white' : 'bg-gray-50'}`}
              >
                <div className="flex items-start gap-3">
                  {email.is_read ? (
                    <MailOpen className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-medium truncate ${
                          !email.is_read ? 'text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {email.from_name || email.from_email.split('@')[0]}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatDate(email.message_date)}
                      </span>
                    </div>
                    <div
                      className={`text-sm truncate mb-1 ${
                        !email.is_read ? 'font-medium text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      {email.subject || '(No subject)'}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{email.snippet}</div>
                    <div className="flex items-center gap-2 mt-2">
                      {email.has_attachments && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Paperclip className="w-3 h-3" />
                          {email.attachment_count}
                        </span>
                      )}
                      {email.related_to_type && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                          <LinkIcon className="w-3 h-3" />
                          {email.related_to_type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={emails.length < emailsPerPage}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Email Detail */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedEmail && selectedThread ? (
          <>
            {/* Email Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEmail.subject || '(No subject)'}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReplyTo(selectedEmail)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>
                  <button
                    onClick={() => archiveEmail(selectedEmail.id)}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteEmail(selectedEmail.id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Thread Messages */}
              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {selectedThread.emails.map((email, index) => (
                  <div key={email.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                        {email.from_name?.charAt(0) || email.from_email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {email.from_name || email.from_email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(email.message_date).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {email.body_text || email.snippet}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Compose */}
            {replyTo && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Reply</h3>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <textarea
                  placeholder="Type your reply..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                ></textarea>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => replyToEmail(replyTo, composeData.body)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                    Send Reply
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Mail className="w-24 h-24 mb-4 opacity-50" />
            <p className="text-lg">Select an email to view</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">New Email</h2>
              <button
                onClick={() => {
                  setShowCompose(false);
                  setComposeData({ to: [], cc: [], bcc: [], subject: '', body: '' });
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="text"
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) =>
                    setComposeData({ ...composeData, to: e.target.value.split(',').map((s) => s.trim()) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Email subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  placeholder="Type your message..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCompose(false);
                  setComposeData({ to: [], cc: [], bcc: [], subject: '', body: '' });
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailInbox;
