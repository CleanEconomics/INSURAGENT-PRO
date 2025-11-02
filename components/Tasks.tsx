
import React, { useState, useMemo } from 'react';
import { Task, Agent, Contact } from '../types';
import { PlusIcon, CloseIcon, ArrowUpIcon, ArrowDownIcon, EqualsIcon, TasksIcon } from './icons';

interface TasksProps {
    tasks: Task[];
    agents: Agent[];
    contacts: Contact[];
    onUpdateTask: (task: Task) => void;
    onCreateTask: (task: Omit<Task, 'id'>) => void;
    setToast: (toast: { message: string } | null) => void;
}

const statusOptions: Task['status'][] = ['To-do', 'In Progress', 'Completed'];
const priorityOptions: Task['priority'][] = ['Low', 'Medium', 'High'];

const PriorityBadge: React.FC<{ priority: Task['priority'] }> = ({ priority }) => {
    const colors = {
        Low: 'bg-gray-100 text-gray-800',
        Medium: 'bg-amber-100 text-amber-800',
        High: 'bg-red-100 text-red-800',
    };
    const icons = {
        Low: <EqualsIcon className="w-3 h-3" />,
        Medium: <ArrowUpIcon className="w-3 h-3" />,
        High: <ArrowUpIcon className="w-3 h-3 font-bold" />,
    }
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${colors[priority]}`}>
            {icons[priority]}
            {priority}
        </span>
    );
};

const TaskModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Task | Omit<Task, 'id'>) => void;
    taskToEdit: Task | null;
    agents: Agent[];
    contacts: Contact[];
}> = ({ isOpen, onClose, onSave, taskToEdit, agents, contacts }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<Task['status']>('To-do');
    const [priority, setPriority] = useState<Task['priority']>('Medium');
    const [dueDate, setDueDate] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [contactId, setContactId] = useState('');

    React.useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setStatus(taskToEdit.status);
            setPriority(taskToEdit.priority);
            setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().substring(0, 10) : '');
            setAssigneeId(taskToEdit.assigneeId || '');
            setContactId(taskToEdit.contactId || '');
        } else {
            // Reset for new task
            setTitle('');
            setDescription('');
            setStatus('To-do');
            setPriority('Medium');
            setDueDate(new Date().toISOString().substring(0, 10));
            setAssigneeId('');
            setContactId('');
        }
    }, [taskToEdit, isOpen]);

    const handleSave = () => {
        if (!title) {
            alert('Title is required.');
            return;
        }
        const taskData = {
            title,
            description,
            status,
            priority,
            dueDate,
            assigneeId: assigneeId || undefined,
            contactId: contactId || undefined,
        };
        onSave(taskToEdit ? { ...taskData, id: taskToEdit.id } : taskData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-textPrimary">{taskToEdit ? 'Edit Task' : 'New Task'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><CloseIcon /></button>
                </header>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-textPrimary">Title</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-textPrimary">Description (optional)</label>
                        <textarea id="description" rows={3} value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-textPrimary">Status</label>
                            <select id="status" value={status} onChange={e => setStatus(e.target.value as Task['status'])} className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md">
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-textPrimary">Priority</label>
                            <select id="priority" value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md">
                                {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-textPrimary">Due Date</label>
                            <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="assigneeId" className="block text-sm font-medium text-textPrimary">Assignee</label>
                            <select id="assigneeId" value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md">
                                <option value="">Unassigned</option>
                                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="contactId" className="block text-sm font-medium text-textPrimary">Related Contact (optional)</label>
                        <select id="contactId" value={contactId} onChange={e => setContactId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-slate-300 rounded-md">
                            <option value="">None</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                <footer className="p-4 bg-slate-50/50 border-t border-slate-200 flex justify-end">
                    <button onClick={handleSave} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg">Save Task</button>
                </footer>
            </div>
        </div>
    );
};


const Tasks: React.FC<TasksProps> = ({ tasks, agents, contacts, onUpdateTask, onCreateTask, setToast }) => {
    const [view, setView] = useState<'my' | 'all'>('my');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');
    const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
    const [sort, setSort] = useState<'dueDate' | 'priority'>('dueDate');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // This would be the logged-in user in a real app
    const currentUserId = agents.find(a => a.name === 'Jane Doe')?.id;

    const filteredAndSortedTasks = useMemo(() => {
        let filtered = tasks;

        if (view === 'my') {
            filtered = filtered.filter(t => t.assigneeId === currentUserId);
        } else if (assigneeFilter !== 'all') {
            filtered = filtered.filter(t => t.assigneeId === assigneeFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(t => t.status === statusFilter);
        }
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(t => t.priority === priorityFilter);
        }

        return filtered.sort((a, b) => {
            if (sort === 'dueDate') {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            } else {
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
        });
    }, [tasks, view, assigneeFilter, sort, currentUserId, searchQuery, statusFilter, priorityFilter]);

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleNewTask = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleSaveTask = (taskData: Task | Omit<Task, 'id'>) => {
        if ('id' in taskData) {
            onUpdateTask(taskData as Task);
        } else {
            onCreateTask(taskData as Omit<Task, 'id'>);
        }
    };

    const handleToggleStatusCheckbox = (task: Task) => {
        const newStatus = task.status === 'Completed' ? 'To-do' : 'Completed';
        onUpdateTask({ ...task, status: newStatus });
    };

    const getDueDateClasses = (dueDate: string, status: Task['status']): string => {
        if (status === 'Completed') return 'text-textSecondary';
        const today = new Date();
        const due = new Date(dueDate);
        today.setHours(0, 0, 0, 0);
        due.setHours(23, 59, 59, 999);
        if (due < today) return 'text-red-600 font-semibold';
        if (due.toDateString() === today.toDateString()) return 'text-amber-600 font-semibold';
        return 'text-textSecondary';
    };


    const agentMap = useMemo(() => new Map(agents.map(a => [a.id, a])), [agents]);
    const contactMap = useMemo(() => new Map(contacts.map(c => [c.id, c])), [contacts]);
    
    const EmptyState = () => (
        <div className="text-center py-16 bg-slate-50 rounded-lg">
            <TasksIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-xl font-semibold text-textPrimary">No Tasks Found</h3>
            <p className="mt-1 text-sm text-textSecondary">There are no tasks matching your current filters.</p>
            <button onClick={handleNewTask} className="mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">
                Create New Task
            </button>
        </div>
    );

    return (
        <div className="p-4 lg:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-textPrimary">Tasks</h1>
                    <p className="text-textSecondary mt-1">Manage your to-do list and track team progress.</p>
                </div>
                <button onClick={handleNewTask} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 self-start md:self-center">
                    <PlusIcon className="w-5 h-5" />
                    <span>New Task</span>
                </button>
            </div>

            <div className="bg-surface p-4 lg:p-6 rounded-xl shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="lg:col-span-1">
                        <input type="search" placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full text-sm px-3 py-2 bg-background border border-gray-300 rounded-md" />
                    </div>
                    <div className="md:col-span-1 lg:col-span-2 flex flex-col sm:flex-row gap-4">
                         {view === 'all' && (
                            <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="w-full text-sm px-3 py-2 bg-background border border-gray-300 rounded-md">
                                <option value="all">All Assignees</option>
                                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        )}
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full text-sm px-3 py-2 bg-background border border-gray-300 rounded-md">
                            <option value="all">All Statuses</option>
                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as any)} className="w-full text-sm px-3 py-2 bg-background border border-gray-300 rounded-md">
                            <option value="all">All Priorities</option>
                            {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                         <select value={sort} onChange={e => setSort(e.target.value as any)} className="w-full text-sm px-3 py-2 bg-background border border-gray-300 rounded-md">
                            <option value="dueDate">Sort by Due Date</option>
                            <option value="priority">Sort by Priority</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg self-start mb-4">
                    <button onClick={() => { setView('my'); setAssigneeFilter('all'); }} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${view === 'my' ? 'bg-white shadow' : ''}`}>My Tasks</button>
                    <button onClick={() => setView('all')} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${view === 'all' ? 'bg-white shadow' : ''}`}>All Tasks</button>
                </div>


                {filteredAndSortedTasks.length > 0 ? (
                    <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-textSecondary uppercase bg-slate-50">
                                <tr>
                                    <th className="p-4 w-4"></th>
                                    <th className="px-4 py-3">Task</th>
                                    <th className="px-4 py-3">Assignee</th>
                                    <th className="px-4 py-3">Related To</th>
                                    <th className="px-4 py-3">Due Date</th>
                                    <th className="px-4 py-3">Priority</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedTasks.map(task => {
                                    const assignee = task.assigneeId ? agentMap.get(task.assigneeId) : null;
                                    const contact = task.contactId ? contactMap.get(task.contactId) : null;
                                    return (
                                    <tr key={task.id} onDoubleClick={() => handleEditTask(task)} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                                        <td className="p-4">
                                            <input type="checkbox" checked={task.status === 'Completed'} onChange={() => handleToggleStatusCheckbox(task)} onClick={e => e.stopPropagation()} className="w-4 h-4 text-primary-600 rounded border-gray-300" />
                                        </td>
                                        <td className="px-4 py-3 font-medium text-textPrimary cursor-pointer" onClick={() => handleEditTask(task)}>{task.title}</td>
                                        <td className="px-4 py-3">
                                            {assignee && (
                                                <div className="flex items-center gap-2">
                                                    <img src={assignee.avatarUrl} alt={assignee.name} className="w-6 h-6 rounded-full" />
                                                    <span>{assignee.name}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {contact && (
                                                <div className="flex items-center gap-2">
                                                    <img src={contact.avatarUrl} alt={contact.name} className="w-6 h-6 rounded-full" />
                                                    <span>{contact.name}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className={`px-4 py-3 ${getDueDateClasses(task.dueDate, task.status)}`}>{new Date(task.dueDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                                        <td className="px-4 py-3">
                                            <select 
                                                value={task.status} 
                                                onChange={e => onUpdateTask({ ...task, status: e.target.value as Task['status'] })}
                                                onClick={e => e.stopPropagation()}
                                                className="text-sm p-1 border-gray-300 rounded-md bg-white hover:bg-gray-100"
                                            >
                                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="block lg:hidden space-y-3">
                        {filteredAndSortedTasks.map(task => {
                            const assignee = task.assigneeId ? agentMap.get(task.assigneeId) : null;
                            const contact = task.contactId ? contactMap.get(task.contactId) : null;
                            return (
                            <div key={task.id} onClick={() => handleEditTask(task)} className="p-4 bg-white rounded-lg border border-slate-200">
                            <div className="flex items-start gap-3">
                                    <input type="checkbox" checked={task.status === 'Completed'} onChange={() => handleToggleStatusCheckbox(task)} onClick={e => e.stopPropagation()} className="mt-1 w-4 h-4 text-primary-600 rounded border-gray-300" />
                                    <div className="flex-1">
                                        <p className="font-medium text-textPrimary">{task.title}</p>
                                        <p className={`text-xs mt-1 ${getDueDateClasses(task.dueDate, task.status)}`}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <PriorityBadge priority={task.priority} />
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                                {assignee && (
                                    <div className="flex items-center gap-2">
                                        <img src={assignee.avatarUrl} alt={assignee.name} className="w-6 h-6 rounded-full" />
                                        <span className="text-xs font-medium text-textSecondary">{assignee.name}</span>
                                    </div>
                                )}
                                {contact && (
                                    <div className="flex items-center gap-2">
                                        <img src={contact.avatarUrl} alt={contact.name} className="w-6 h-6 rounded-full" />
                                        <span className="text-xs font-medium text-textSecondary">{contact.name}</span>
                                    </div>
                                )}
                            </div>
                            </div>
                        )})}
                    </div>
                    </>
                ) : <EmptyState />}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                taskToEdit={editingTask}
                agents={agents}
                contacts={contacts}
            />
        </div>
    );
};

export default Tasks;
