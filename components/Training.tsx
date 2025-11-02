import React, { useState } from 'react';
import { TrainingModule, TrainingCategory } from '../types';
import { CloseIcon, PlusIcon, UploadIcon } from './icons';

const PlayIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

/**
 * Extracts a YouTube video ID from various URL formats and returns a standardized embed URL.
 * @param url The YouTube URL.
 * @returns The embed URL or null if the URL is invalid.
 */
const getYouTubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null; // Invalid URL
};


interface TrainingProps {
    trainingModules: TrainingModule[];
    setTrainingModules: React.Dispatch<React.SetStateAction<TrainingModule[]>>;
}


const Training: React.FC<TrainingProps> = ({ trainingModules, setTrainingModules }) => {
    const [selectedVideo, setSelectedVideo] = useState<TrainingModule | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [completedModules, setCompletedModules] = useState<Set<string>>(new Set(['t1', 't2']));

    // This would come from user authentication in a real app
    const userRole = 'Admin';

    const handleCardClick = (module: TrainingModule) => {
        if (module.type === 'Video') {
            setSelectedVideo(module);
        } else {
            // In a real app, you would open the document link
            alert(`Opening document: ${module.title}`);
        }
    };

     const handleMarkComplete = (e: React.MouseEvent, moduleId: string) => {
      e.stopPropagation(); // Prevent the video modal from opening
      setCompletedModules(prev => {
        const newSet = new Set(prev);
        newSet.add(moduleId);
        return newSet;
      });
    };

    const VideoPlayerModal: React.FC = () => {
        if (!selectedVideo) return null;

        const embedUrl = selectedVideo.videoUrl ? getYouTubeEmbedUrl(selectedVideo.videoUrl) : null;

        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedVideo(null)}>
                <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden" onClick={e => e.stopPropagation()}>
                    <header className="p-4 bg-gray-800 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
                            <p className="text-sm text-gray-400">{selectedVideo.category}</p>
                        </div>
                        <button onClick={() => setSelectedVideo(null)} className="p-2 rounded-full hover:bg-white/20">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </header>
                    <div className="aspect-video bg-black">
                        {embedUrl ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={embedUrl}
                                title={selectedVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                             <video controls autoPlay className="w-full h-full">
                                <source src={selectedVideo.videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>
                    <div className="p-6">
                        <p>{selectedVideo.description || 'No description available.'}</p>
                    </div>
                </div>
            </div>
        )
    };
    
    const AddModuleModal: React.FC = () => {
        const [title, setTitle] = useState('');
        const [category, setCategory] = useState<TrainingCategory>(TrainingCategory.Sales);
        const [videoType, setVideoType] = useState<'youtube' | 'upload'>('youtube');
        const [youtubeUrl, setYoutubeUrl] = useState('');
        const [fileName, setFileName] = useState('');
        
        const handleSubmit = () => {
            if (!title) {
                alert('Please enter a title.');
                return;
            }

            let finalVideoUrl = '';
            if (videoType === 'youtube') {
                const embedUrl = getYouTubeEmbedUrl(youtubeUrl);
                if (!embedUrl) {
                    alert('Please enter a valid YouTube URL.');
                    return;
                }
                finalVideoUrl = embedUrl;
            } else {
                if (!fileName) {
                    alert('Please select a video file to upload.');
                    return;
                }
                // In a real app, you'd upload the file and get a URL.
                // For this demo, we'll just use a placeholder.
                finalVideoUrl = '/placeholder-video.mp4';
            }
            
            const newModule: TrainingModule = {
                id: `t${trainingModules.length + 1}`,
                title,
                category,
                duration: 'TBD',
                thumbnailUrl: `https://picsum.photos/seed/${title}/400/225`,
                type: 'Video',
                videoUrl: finalVideoUrl,
                description: 'Newly added training module.'
            };

            setTrainingModules(prev => [newModule, ...prev]);
            setIsAddModalOpen(false);
        };


        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setIsAddModalOpen(false)}>
                <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                    <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-textPrimary">Add New Training Module</h2>
                        <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full hover:bg-gray-200/50">
                            <CloseIcon className="w-6 h-6 text-textSecondary" />
                        </button>
                    </header>
                    <div className="p-6 space-y-6">
                         <div>
                            <label htmlFor="title" className="block text-sm font-medium text-textPrimary">Module Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-textPrimary">Category</label>
                            <select id="category" value={category} onChange={e => setCategory(e.target.value as TrainingCategory)} className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light">
                                {Object.values(TrainingCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textPrimary mb-2">Video Source</label>
                             <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input type="radio" name="videoType" value="youtube" checked={videoType === 'youtube'} onChange={() => setVideoType('youtube')} className="h-4 w-4 text-primary focus:ring-primary-light" />
                                    <span className="ml-2">Embed YouTube Video</span>
                                </label>
                                 <label className="flex items-center">
                                    <input type="radio" name="videoType" value="upload" checked={videoType === 'upload'} onChange={() => setVideoType('upload')} className="h-4 w-4 text-primary focus:ring-primary-light" />
                                    <span className="ml-2">Upload Video</span>
                                </label>
                            </div>
                        </div>

                        {videoType === 'youtube' ? (
                            <div>
                                <label htmlFor="youtubeUrl" className="block text-sm font-medium text-textPrimary">YouTube URL</label>
                                <input type="text" id="youtubeUrl" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="mt-1 block w-full px-3 py-2 bg-background border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light" />
                            </div>
                        ) : (
                             <div>
                                <label className="block text-sm font-medium text-textPrimary">Upload File</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400"/>
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-dark hover:text-primary-light focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-light">
                                                <span>{fileName ? 'Change file' : 'Upload a file'}</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="video/*" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">{fileName || 'MP4, MOV up to 500MB'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <footer className="p-4 bg-gray-50/50 border-t border-gray-200 flex justify-end">
                        <button onClick={handleSubmit} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors">Add Module</button>
                    </footer>
                </div>
            </div>
        );
    };

    const TrainingModuleCard: React.FC<{ module: TrainingModule }> = ({ module }) => (
        <div onClick={() => handleCardClick(module)} className="bg-surface rounded-lg shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className="relative">
                <img src={module.thumbnailUrl} alt={module.title} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayIcon className="w-12 h-12 text-white/80" />
                </div>
            </div>
            <div className="p-4">
                <p className={`text-xs font-semibold ${
                    module.category === TrainingCategory.Sales ? 'text-blue-500' :
                    module.category === TrainingCategory.Product ? 'text-purple-500' : 'text-red-500'
                }`}>{module.category}</p>
                <h3 className="font-semibold text-textPrimary mt-1 h-12">{module.title}</h3>
                <div className="flex justify-between items-center mt-3 text-xs text-textSecondary">
                    <span>{module.duration}</span>
                    <span className="font-medium bg-gray-200/60 px-2 py-1 rounded">{module.type}</span>
                </div>
            </div>
        </div>
    );

    const RequiredCourseCard: React.FC<{ module: TrainingModule, completed: boolean, onMarkComplete: (e: React.MouseEvent, moduleId: string) => void }> = ({ module, completed, onMarkComplete }) => (
        <div onClick={() => handleCardClick(module)} className={`flex items-center space-x-4 p-4 rounded-lg transition-all cursor-pointer ${completed ? 'bg-green-50' : 'bg-surface hover:bg-gray-100/50'}`}>
            <div className="relative flex-shrink-0">
                <img src={module.thumbnailUrl} alt={module.title} className="w-24 h-16 object-cover rounded-md" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                     <PlayIcon className="w-6 h-6 text-white/80" />
                </div>
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-textPrimary">{module.title}</p>
                <div className="flex items-center space-x-2 text-xs text-textSecondary mt-1">
                    <span>{module.duration}</span>
                    <span>&middot;</span>
                    <span>{module.category}</span>
                </div>
            </div>
            <div className="flex-shrink-0">
                {completed ? (
                    <div className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-full" title="Completed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                ) : (
                    <button 
                        onClick={(e) => onMarkComplete(e, module.id)}
                        className="text-xs font-semibold text-primary-dark bg-primary-light/20 hover:bg-primary-light/40 px-3 py-2 rounded-md transition-colors"
                    >
                        Mark as Complete
                    </button>
                )}
            </div>
        </div>
    );

    const categories = Object.values(TrainingCategory);
    const requiredModules = trainingModules.filter(m => m.required);

  return (
    <div className="p-8 space-y-10">
        <div className="relative bg-primary-dark rounded-xl shadow-2xl text-white p-10 flex items-center overflow-hidden">
            <div className="relative z-10 w-1/2">
                <h1 className="text-3xl font-bold">Welcome to the Training Hub</h1>
                <p className="mt-2 text-primary-light/70">This month's featured training focuses on advanced closing techniques to help you exceed your sales goals.</p>
                <button onClick={() => handleCardClick(trainingModules[0])} className="mt-6 bg-secondary text-primary-dark font-bold py-2 px-5 rounded-lg hover:bg-yellow-400 transition-colors flex items-center space-x-2">
                    <PlayIcon className="w-5 h-5" />
                    <span>Watch Now</span>
                </button>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/2">
                <img src="https://picsum.photos/seed/featured/800/400" className="object-cover h-full w-full opacity-30" alt="Featured Training"/>
            </div>
        </div>
        
        <div>
            <h2 className="text-xl font-bold text-textPrimary mb-4">Required Onboarding</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {requiredModules.map(module => (
                    <RequiredCourseCard 
                        key={module.id} 
                        module={module} 
                        completed={completedModules.has(module.id)} 
                        onMarkComplete={handleMarkComplete}
                    />
                ))}
            </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-textPrimary">Training Library</h2>
                 {userRole === 'Admin' && (
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm">
                        <PlusIcon className="w-4 h-4"/>
                        <span>Add New Module</span>
                    </button>
                )}
            </div>
            {categories.map(category => (
                <div key={category} className="mb-8">
                    <h3 className="text-lg font-semibold text-textPrimary mb-4 pb-2 border-b-2 border-primary-light/20">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {trainingModules
                            .filter(m => m.category === category && !m.required)
                            .map(module => (
                                <TrainingModuleCard key={module.id} module={module} />
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <VideoPlayerModal />
        {isAddModalOpen && <AddModuleModal />}
    </div>
  );
};

export default Training;
