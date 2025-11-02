

import React, { useState, useMemo } from 'react';
import { KnowledgeResource, KnowledgeCategory, ResourceType } from '../types';
import { CloseIcon, PlusIcon } from './icons';

interface KnowledgeHubProps {
    knowledgeResources: KnowledgeResource[];
    setKnowledgeResources: React.Dispatch<React.SetStateAction<KnowledgeResource[]>>;
}

const CategoryBadge: React.FC<{ category: KnowledgeCategory }> = ({ category }) => {
    const colors = {
        [KnowledgeCategory.Presentations]: 'bg-blue-100 text-blue-800',
        [KnowledgeCategory.Compliance]: 'bg-red-100 text-red-800',
        [KnowledgeCategory.Licensing]: 'bg-amber-100 text-amber-800',
        [KnowledgeCategory.Sales]: 'bg-green-100 text-green-800',
        [KnowledgeCategory.Product]: 'bg-purple-100 text-purple-800',
    };
    return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[category]}`}>{category}</span>;
};

const TypeBadge: React.FC<{ type: ResourceType }> = ({ type }) => {
    const colors = {
        [ResourceType.PDF]: 'bg-red-100 text-red-800',
        [ResourceType.Video]: 'bg-sky-100 text-sky-800',
        [ResourceType.Article]: 'bg-gray-200 text-gray-800',
        [ResourceType.Spreadsheet]: 'bg-green-100 text-green-800',
    };
    return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[type]}`}>{type}</span>;
}

const ResourceCard: React.FC<{ resource: KnowledgeResource, onClick: () => void }> = ({ resource, onClick }) => (
    <div onClick={onClick} className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div>
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-textPrimary text-lg mb-2">{resource.title}</h3>
                <TypeBadge type={resource.type} />
            </div>
            <p className="text-sm text-textSecondary mb-4 h-12 overflow-hidden">{resource.description}</p>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200/60">
            <CategoryBadge category={resource.category} />
             <p className="text-xs text-textSecondary">Updated: {new Date(resource.lastUpdated).toLocaleDateString()}</p>
        </div>
    </div>
);

const ResourceModal: React.FC<{ resource: KnowledgeResource, onClose: () => void }> = ({ resource, onClose }) => (
     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <TypeBadge type={resource.type} />
                    <CategoryBadge category={resource.category} />
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50">
                    <CloseIcon className="w-6 h-6 text-textSecondary" />
                </button>
            </header>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-textPrimary">{resource.title}</h2>
                <div className="text-sm text-textSecondary mt-2">
                    Authored by <span className="font-semibold">{resource.author}</span> &bull; Last updated on <span className="font-semibold">{new Date(resource.lastUpdated).toLocaleDateString()}</span>
                </div>
                <p className="mt-4 text-textPrimary">{resource.description}</p>
                 <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-6 w-full inline-block text-center bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    View Resource
                </a>
            </div>
        </div>
    </div>
);

const AddResourceModal: React.FC<{
    onClose: () => void;
    onAddResource: (resource: Omit<KnowledgeResource, 'id' | 'lastUpdated'>) => void;
}> = ({ onClose, onAddResource }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<KnowledgeCategory>(KnowledgeCategory.Sales);
    const [type, setType] = useState<ResourceType>(ResourceType.Article);
    const [url, setUrl] = useState('');
    const [author, setAuthor] = useState('');

    const handleSubmit = () => {
        if (!title || !url || !author) {
            alert('Please fill out all required fields.');
            return;
        }
        onAddResource({ title, description, category, type, url, author });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-textPrimary">Add New Resource</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50">
                        <CloseIcon className="w-6 h-6 text-textSecondary" />
                    </button>
                </header>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label htmlFor="res-title" className="block text-sm font-medium text-textPrimary">Title</label>
                        <input id="res-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                    </div>
                     <div>
                        <label htmlFor="res-desc" className="block text-sm font-medium text-textPrimary">Description</label>
                        <textarea id="res-desc" rows={3} value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="res-cat" className="block text-sm font-medium text-textPrimary">Category</label>
                            <select id="res-cat" value={category} onChange={e => setCategory(e.target.value as KnowledgeCategory)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light">
                                {Object.values(KnowledgeCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="res-type" className="block text-sm font-medium text-textPrimary">Type</label>
                            <select id="res-type" value={type} onChange={e => setType(e.target.value as ResourceType)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light">
                                {Object.values(ResourceType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="res-url" className="block text-sm font-medium text-textPrimary">URL</label>
                        <input id="res-url" type="text" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                    </div>
                     <div>
                        <label htmlFor="res-author" className="block text-sm font-medium text-textPrimary">Author</label>
                        <input id="res-author" type="text" value={author} onChange={e => setAuthor(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                    </div>
                </div>
                 <footer className="p-4 bg-gray-50/50 border-t border-gray-200 flex justify-end">
                    <button onClick={handleSubmit} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors">Add Resource</button>
                </footer>
            </div>
        </div>
    );
};

const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ knowledgeResources, setKnowledgeResources }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | 'All'>('All');
    const [selectedType, setSelectedType] = useState<ResourceType | 'All'>('All');
    const [selectedResource, setSelectedResource] = useState<KnowledgeResource | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // This would come from auth in a real app
    const isAdmin = true;

    const filteredResources = useMemo(() => {
        return knowledgeResources.filter(resource => {
            const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
            const matchesType = selectedType === 'All' || resource.type === selectedType;
            return matchesSearch && matchesCategory && matchesType;
        });
    }, [searchTerm, selectedCategory, selectedType, knowledgeResources]);

    const handleAddResource = (newResourceData: Omit<KnowledgeResource, 'id' | 'lastUpdated'>) => {
        const newResource: KnowledgeResource = {
            ...newResourceData,
            id: `res${Date.now()}`,
            lastUpdated: new Date().toISOString().split('T')[0],
        };
        setKnowledgeResources(prev => [newResource, ...prev]);
    };

    const FilterPill: React.FC<{ label: string, onClick: () => void, isActive: boolean }> = ({ label, onClick, isActive }) => (
        <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isActive ? 'bg-primary text-white' : 'bg-surface text-textPrimary hover:bg-gray-200'}`}>
            {label}
        </button>
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-textPrimary">Knowledge Hub</h1>
                    <p className="text-textSecondary mt-1">Your central library for training, compliance, and sales materials.</p>
                </div>
                {isAdmin && (
                     <button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                        <PlusIcon className="w-5 h-5"/>
                        <span>Add New Resource</span>
                    </button>
                )}
            </div>

            <div className="sticky top-0 bg-background/80 backdrop-blur-sm py-4 z-10">
                <div className="relative">
                    <input
                        type="search"
                        placeholder="Search for presentations, compliance guides, etc..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-full bg-surface border-2 border-gray-200 focus:ring-2 focus:ring-primary-light focus:outline-none transition-all text-lg"
                    />
                    <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                     <p className="text-sm font-semibold text-textSecondary mr-2">Category:</p>
                    <FilterPill label="All" onClick={() => setSelectedCategory('All')} isActive={selectedCategory === 'All'} />
                    {Object.values(KnowledgeCategory).map(cat => <FilterPill key={cat} label={cat} onClick={() => setSelectedCategory(cat)} isActive={selectedCategory === cat} />)}
                </div>
                 <div className="mt-2 flex flex-wrap gap-2 items-center">
                    <p className="text-sm font-semibold text-textSecondary mr-2">Type:</p>
                    <FilterPill label="All" onClick={() => setSelectedType('All')} isActive={selectedType === 'All'} />
                    {Object.values(ResourceType).map(type => <FilterPill key={type} label={type} onClick={() => setSelectedType(type)} isActive={selectedType === type} />)}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} onClick={() => setSelectedResource(resource)} />
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-16 bg-surface rounded-lg">
                    <h3 className="text-xl font-semibold text-textPrimary">No Resources Found</h3>
                    <p className="text-textSecondary mt-2">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
            )}
            
            {selectedResource && <ResourceModal resource={selectedResource} onClose={() => setSelectedResource(null)} />}
            {isAddModalOpen && <AddResourceModal onClose={() => setIsAddModalOpen(false)} onAddResource={handleAddResource} />}
        </div>
    );
};

export default KnowledgeHub;