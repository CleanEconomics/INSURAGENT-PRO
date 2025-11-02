

import React, { useState } from 'react';
import { Opportunity, PipelineStage, Contact, LineOfBusiness } from '../types';

const STAGE_COLORS: { [key in PipelineStage]: string } = {
  [PipelineStage.NewLead]: 'bg-blue-500',
  [PipelineStage.Contacted]: 'bg-sky-500',
  [PipelineStage.AppointmentSet]: 'bg-indigo-500',
  [PipelineStage.Quoted]: 'bg-purple-500',
  [PipelineStage.Issued]: 'bg-amber-500',
  [PipelineStage.Won]: 'bg-green-500',
  [PipelineStage.Lost]: 'bg-red-500',
};

const OpportunityCard: React.FC<{ opportunity: Opportunity }> = ({ opportunity }) => (
  <div
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData('opportunityId', opportunity.id);
      e.currentTarget.classList.add('opacity-50', 'rotate-3', 'shadow-xl');
    }}
    onDragEnd={(e) => {
      e.currentTarget.classList.remove('opacity-50', 'rotate-3', 'shadow-xl');
    }}
    className="bg-surface p-4 rounded-lg shadow-sm border border-gray-200 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-1 transition-all duration-300"
  >
    <div className="flex justify-between items-start">
      <p className="font-semibold text-sm text-textPrimary">{opportunity.contact.name}</p>
      <img src={opportunity.contact.avatarUrl} alt={opportunity.contact.name} className="w-8 h-8 rounded-full" />
    </div>
    <div className="flex justify-between items-center mt-2">
        <p className="font-semibold text-sm text-textPrimary">{opportunity.product}</p>
        <p className="text-lg font-bold text-primary-dark">${opportunity.value.toLocaleString()}</p>
    </div>
    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200/50">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${opportunity.lineOfBusiness === LineOfBusiness.PC ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            {opportunity.lineOfBusiness}
        </span>
        <div className="text-xs text-gray-500">
            Close Date: {new Date(opportunity.closeDate).toLocaleDateString()}
        </div>
    </div>
  </div>
);

const PipelineColumn: React.FC<{ stage: PipelineStage; opportunities: Opportunity[]; onDrop: (stage: PipelineStage, opportunityId: string) => void }> = ({ stage, opportunities, onDrop }) => {
  const [isOver, setIsOver] = useState(false);
  const stageOpportunities = opportunities.filter(op => op.stage === stage);
  const totalValue = stageOpportunities.reduce((sum, op) => sum + op.value, 0);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const opportunityId = e.dataTransfer.getData('opportunityId');
    onDrop(stage, opportunityId);
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
        <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">{stageOpportunities.length}</span>
      </div>
      <p className="text-xs text-textSecondary font-medium px-2 mb-3">
        DEAL VALUE: ${totalValue.toLocaleString()}
      </p>
      <div className="h-[calc(100vh-250px)] overflow-y-auto pr-1">
        {stageOpportunities.map(op => <OpportunityCard key={op.id} opportunity={op} />)}
      </div>
    </div>
  );
};

interface PipelineProps {
  opportunities: Opportunity[];
  setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>;
}

const Pipeline: React.FC<PipelineProps> = ({ opportunities, setOpportunities }) => {
  const stages = Object.values(PipelineStage);
  const [activeFilter, setActiveFilter] = useState<'All' | LineOfBusiness>('All');

  const handleDrop = (targetStage: PipelineStage, opportunityId: string) => {
    setOpportunities(prev =>
      prev.map(op =>
        op.id === opportunityId ? { ...op, stage: targetStage } : op
      )
    );
  };

  const filteredOpportunities = opportunities.filter(op => {
      if (activeFilter === 'All') return true;
      return op.lineOfBusiness === activeFilter;
  });

  const FilterButton: React.FC<{label: 'All' | LineOfBusiness}> = ({ label }) => (
      <button 
        onClick={() => setActiveFilter(label)}
        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeFilter === label ? 'bg-primary text-white' : 'bg-surface text-textSecondary hover:bg-gray-200'}`}
      >
          {label}
      </button>
  );

  return (
    <div className="h-full flex flex-col">
       <div className="p-4 border-b border-gray-200 bg-surface">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-textPrimary">Sales Pipeline</h2>
                <div className="flex items-center space-x-2">
                    <FilterButton label="All" />
                    <FilterButton label={LineOfBusiness.LifeAndHealth} />
                    <FilterButton label={LineOfBusiness.PC} />
                </div>
            </div>
        </div>
      <div className="flex-grow p-4 overflow-x-auto">
        <div className="flex space-x-4 h-full">
          {stages.map(stage => (
            <PipelineColumn key={stage} stage={stage} opportunities={filteredOpportunities} onDrop={handleDrop} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pipeline;