import React, { useState, useMemo } from 'react';
import { Contact } from '../types';
import { SearchIcon, FilterIcon, PlusIcon, PhoneIcon, EmailIcon, TagIcon, CloseIcon, UserIcon, BuildingIcon, NoteIcon, TrashIcon, EditIcon } from './icons';

interface ContactsProps {
    contacts: Contact[];
    onAddContact: (contact: Omit<Contact, 'id'>) => Promise<void>;
    onUpdateContact: (contact: Contact) => Promise<void>;
    onDeleteContact: (contactId: string) => Promise<void>;
    onBulkDelete: (contactIds: string[]) => Promise<void>;
}

interface ContactDetailModalProps {
    contact: Contact;
    onClose: () => void;
    onUpdate: (contact: Contact) => void;
    onDelete: (contactId: string) => void;
}

interface AddContactModalProps {
    onClose: () => void;
    onAdd: (contact: Omit<Contact, 'id'>) => void;
}

const Tag: React.FC<{ label: string; onRemove?: () => void }> = ({ label, onRemove }) => (
    <span className="inline-flex items-center text-xs font-medium bg-primary-light/10 text-primary-dark px-2 py-1 rounded-full">
        {label}
        {onRemove && (
            <button onClick={onRemove} className="ml-1 hover:text-primary">
                <CloseIcon className="w-3 h-3" />
            </button>
        )}
    </span>
);

// Contact Detail Modal
const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ contact, onClose, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContact, setEditedContact] = useState<Contact>(contact);
    const [newTag, setNewTag] = useState('');
    const [newNote, setNewNote] = useState('');
    const [notes, setNotes] = useState<Array<{ id: string; text: string; date: string }>>([
        { id: '1', text: 'Initial consultation completed. Interested in term life.', date: '2024-07-20' },
        { id: '2', text: 'Sent quote for $500k term life policy.', date: '2024-07-22' },
    ]);

    const handleSave = () => {
        onUpdate(editedContact);
        setIsEditing(false);
    };

    const addTag = () => {
        if (newTag.trim() && !editedContact.tags.includes(newTag.trim())) {
            setEditedContact({
                ...editedContact,
                tags: [...editedContact.tags, newTag.trim()],
            });
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setEditedContact({
            ...editedContact,
            tags: editedContact.tags.filter(tag => tag !== tagToRemove),
        });
    };

    const addNote = () => {
        if (newNote.trim()) {
            setNotes([
                { id: Date.now().toString(), text: newNote, date: new Date().toISOString().split('T')[0] },
                ...notes,
            ]);
            setNewNote('');
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
            onDelete(contact.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <img src={contact.avatarUrl} alt={contact.name} className="w-16 h-16 rounded-full" />
                        <div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedContact.name}
                                    onChange={(e) => setEditedContact({ ...editedContact, name: e.target.value })}
                                    className="text-2xl font-bold border-b-2 border-primary focus:outline-none"
                                />
                            ) : (
                                <h2 className="text-2xl font-bold text-textPrimary">{contact.name}</h2>
                            )}
                            <div className="flex gap-2 mt-1">
                                {editedContact.tags.map(tag => (
                                    <Tag
                                        key={tag}
                                        label={tag}
                                        onRemove={isEditing ? () => removeTag(tag) : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                >
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <EditIcon className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-textPrimary mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <EmailIcon className="w-5 h-5 text-primary" />
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={editedContact.email}
                                        onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })}
                                        className="flex-1 bg-transparent focus:outline-none"
                                    />
                                ) : (
                                    <div>
                                        <div className="text-xs text-gray-500">Email</div>
                                        <div className="text-sm font-medium">{contact.email}</div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <PhoneIcon className="w-5 h-5 text-primary" />
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editedContact.phone}
                                        onChange={(e) => setEditedContact({ ...editedContact, phone: e.target.value })}
                                        className="flex-1 bg-transparent focus:outline-none"
                                    />
                                ) : (
                                    <div>
                                        <div className="text-xs text-gray-500">Phone</div>
                                        <div className="text-sm font-medium">{contact.phone}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add Tag */}
                        {isEditing && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Add Tag</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                        placeholder="Enter tag name"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                    <button
                                        onClick={addTag}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-lg font-semibold text-textPrimary mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                                <EmailIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">Send Email</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                                <PhoneIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">Send SMS</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium">Schedule</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-medium">Create Task</span>
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <h3 className="text-lg font-semibold text-textPrimary mb-4">Notes & Activity</h3>

                        {/* Add Note */}
                        <div className="mb-4">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a note..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                            />
                            <button
                                onClick={addNote}
                                className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                            >
                                Add Note
                            </button>
                        </div>

                        {/* Notes List */}
                        <div className="space-y-3">
                            {notes.map(note => (
                                <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs text-gray-500">{note.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{note.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-gray-200">
                        <button
                            onClick={handleDelete}
                            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            <span className="font-medium">Delete Contact</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add Contact Modal
const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        tags: [] as string[],
    });
    const [newTag, setNewTag] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...formData,
            avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(formData.name)}/40/40`,
        });
        onClose();
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-textPrimary">Add New Contact</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="John Smith"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone *
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="555-0123"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                        </label>
                        <div className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="Add tag"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                                <Tag key={tag} label={tag} onRemove={() => removeTag(tag)} />
                            ))}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                            Add Contact
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Contacts Component
const Contacts: React.FC<ContactsProps> = ({ contacts, onAddContact, onUpdateContact, onDeleteContact, onBulkDelete }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string>('All');
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Get all unique tags
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        contacts.forEach(contact => {
            contact.tags.forEach(tag => tagSet.add(tag));
        });
        return ['All', ...Array.from(tagSet).sort()];
    }, [contacts]);

    // Filter contacts
    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                contact.phone.includes(searchQuery);
            const matchesTag = selectedTag === 'All' || contact.tags.includes(selectedTag);
            return matchesSearch && matchesTag;
        });
    }, [contacts, searchQuery, selectedTag]);

    const handleSelectAll = () => {
        if (selectedContacts.size === filteredContacts.length) {
            setSelectedContacts(new Set());
        } else {
            setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
        }
    };

    const handleSelectContact = (contactId: string) => {
        const newSelected = new Set(selectedContacts);
        if (newSelected.has(contactId)) {
            newSelected.delete(contactId);
        } else {
            newSelected.add(contactId);
        }
        setSelectedContacts(newSelected);
    };

    const handleAddContactLocal = async (newContact: Omit<Contact, 'id'>) => {
        await onAddContact(newContact);
        setShowAddModal(false);
    };

    const handleUpdateContactLocal = async (updatedContact: Contact) => {
        await onUpdateContact(updatedContact);
        setSelectedContact(null);
    };

    const handleDeleteContactLocal = async (contactId: string) => {
        await onDeleteContact(contactId);
        setSelectedContacts(new Set([...selectedContacts].filter(id => id !== contactId)));
        setSelectedContact(null);
    };

    const handleBulkDeleteLocal = async () => {
        if (window.confirm(`Delete ${selectedContacts.size} contacts?`)) {
            await onBulkDelete(Array.from(selectedContacts));
            setSelectedContacts(new Set());
        }
    };

    const handleBulkTag = async (tag: string) => {
        // Update each contact with the new tag
        const contactsToUpdate = contacts.filter(c => selectedContacts.has(c.id) && !c.tags.includes(tag));
        for (const contact of contactsToUpdate) {
            await onUpdateContact({ ...contact, tags: [...contact.tags, tag] });
        }
        setSelectedContacts(new Set());
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-textPrimary mb-2">Contacts</h1>
                <p className="text-textSecondary">Manage your contact database</p>
            </div>

            <div className="bg-surface rounded-xl shadow-sm">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                            {selectedContacts.size > 0 && (
                                <>
                                    <button
                                        onClick={handleBulkDeleteLocal}
                                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-1"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        <span>Delete ({selectedContacts.size})</span>
                                    </button>
                                    <select
                                        onChange={(e) => e.target.value && handleBulkTag(e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Add Tag...</option>
                                        <option value="VIP">VIP</option>
                                        <option value="High Value">High Value</option>
                                        <option value="Follow-up">Follow-up</option>
                                    </select>
                                </>
                            )}
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center space-x-2"
                            >
                                <PlusIcon className="w-4 h-4" />
                                <span>Add Contact</span>
                            </button>
                        </div>
                    </div>

                    {/* Tag Filters */}
                    <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-2">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
                                    selectedTag === tag
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {tag}
                                {tag !== 'All' && ` (${contacts.filter(c => c.tags.includes(tag)).length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-200 bg-gray-50">
                    <div>
                        <div className="text-xs text-gray-500 uppercase">Total Contacts</div>
                        <div className="text-2xl font-bold text-textPrimary">{contacts.length}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase">Filtered</div>
                        <div className="text-2xl font-bold text-textPrimary">{filteredContacts.length}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase">Selected</div>
                        <div className="text-2xl font-bold text-textPrimary">{selectedContacts.size}</div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-textSecondary uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-primary bg-gray-100 rounded border-gray-300 focus:ring-primary"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Phone</th>
                                <th scope="col" className="px-6 py-3">Tags</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <UserIcon className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-gray-500">No contacts found</p>
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="mt-2 text-primary hover:underline"
                                                >
                                                    Clear search
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map(contact => (
                                    <tr key={contact.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedContacts.has(contact.id)}
                                                onChange={() => handleSelectContact(contact.id)}
                                                className="w-4 h-4 text-primary bg-gray-100 rounded border-gray-300 focus:ring-primary"
                                            />
                                        </td>
                                        <th
                                            scope="row"
                                            className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap cursor-pointer hover:text-primary"
                                            onClick={() => setSelectedContact(contact)}
                                        >
                                            <img className="w-10 h-10 rounded-full" src={contact.avatarUrl} alt={contact.name} />
                                            <div className="pl-3">
                                                <div className="text-base font-semibold">{contact.name}</div>
                                                <div className="font-normal text-gray-500">{contact.email}</div>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4">{contact.phone}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center flex-wrap gap-2">
                                                {contact.tags.slice(0, 2).map(tag => (
                                                    <Tag key={tag} label={tag} />
                                                ))}
                                                {contact.tags.length > 2 && (
                                                    <span className="text-xs text-gray-500">+{contact.tags.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedContact(contact)}
                                                className="font-medium text-primary-dark hover:underline"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddContactModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddContactLocal}
                />
            )}

            {selectedContact && (
                <ContactDetailModal
                    contact={selectedContact}
                    onClose={() => setSelectedContact(null)}
                    onUpdate={handleUpdateContactLocal}
                    onDelete={handleDeleteContactLocal}
                />
            )}
        </div>
    );
};

export default Contacts;
