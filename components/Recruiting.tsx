

import React, { useState } from 'react';
import { AgentCandidate, RecruitingStage } from '../types';

const STAGE_COLORS: { [key in RecruitingStage]: string } = {
  [RecruitingStage.Prospecting]: 'bg-blue-500',
  [RecruitingStage.Qualifying]: 'bg-sky-500',
  [RecruitingStage.Engagement]: 'bg-indigo-500',
  [RecruitingStage.Presenting]: 'bg-purple-500',
  [RecruitingStage.Closing]: 'bg-amber-500',
  [RecruitingStage.Retention]: 'bg-green-500',
  [RecruitingStage.Declined]: 'bg-red-500',
};

const CandidateCard: React.FC<{ candidate: AgentCandidate }> = ({ candidate }) => (
  <div
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData('candidateId', candidate.id);
      e.currentTarget.classList.add('opacity-50', 'rotate-3', 'shadow-xl');
    }}
    onDragEnd={(e) => {
      e.currentTarget.classList.remove('opacity-50', 'rotate-3', 'shadow-xl');
    }}
    className="bg-surface p-4 rounded-lg shadow-sm border border-gray-200 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-1 transition-all"
  >
    <div className="flex justify-between items-start">
      <p className="font-semibold text-sm text-textPrimary">{candidate.name}</p>
      <img src={candidate.avatarUrl} alt={candidate.name} className="w-8 h-8 rounded-full" />
    </div>
    <p className="text-xs text-textSecondary mt-1">{candidate.role}</p>
    <div className="flex justify-between items-end mt-4">
        <p className="text-xs text-gray-500">Recruiter: {candidate.recruiter}</p>
        <div className="text-xs text-gray-500">
            Last Contact: {new Date(candidate.lastContactDate).toLocaleDateString()}
        </div>
    </div>
  </div>
);

const RecruitingColumn: React.FC<{ stage: RecruitingStage; candidates: AgentCandidate[]; onDrop: (stage: RecruitingStage, candidateId: string) => void; }> = ({ stage, candidates, onDrop }) => {
  const [isOver, setIsOver] = useState(false);
  const stageCandidates = candidates.filter(c => c.stage === stage);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    onDrop(stage, candidateId);
    setIsOver(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-shrink-0 w-80 bg-background rounded-xl p-3 transition-colors duration-300 ${isOver ? 'bg-primary-light/10' : ''}`}
    >
      <div className={`flex justify-between items-center p-2 mb-4 rounded-md text-white ${STAGE_COLORS[stage]}`}>
        <h3 className="font-semibold text-sm">{stage}</h3>
        <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">{stageCandidates.length}</span>
      </div>
      <div className="h-[calc(100vh-250px)] overflow-y-auto pr-1">
        {stageCandidates.map(c => <CandidateCard key={c.id} candidate={c} />)}
      </div>
    </div>
  );
};

interface RecruitingProps {
  candidates: AgentCandidate[];
  setCandidates: React.Dispatch<React.SetStateAction<AgentCandidate[]>>;
}

const Recruiting: React.FC<RecruitingProps> = ({ candidates, setCandidates }) => {
  const stages = Object.values(RecruitingStage);
  
  const handleDrop = (targetStage: RecruitingStage, candidateId: string) => {
    setCandidates(prev =>
      prev.map(c =>
        c.id === candidateId ? { ...c, stage: targetStage } : c
      )
    );
  };

  return (
    <div className="h-full flex flex-col">
       <div className="p-4 border-b border-gray-200 bg-surface">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-textPrimary">Recruiting Pipeline</h2>
                <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Add Candidate
                </button>
            </div>
        </div>
      <div className="flex-grow p-4 overflow-x-auto">
        <div className="flex space-x-4 h-full">
          {stages.map(stage => (
            <RecruitingColumn key={stage} stage={stage} candidates={candidates} onDrop={handleDrop} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recruiting;