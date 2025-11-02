
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell } from 'recharts';
import { Task, Page, AgentWithStats } from '../types';
import { ContactsIcon, PipelineIcon, CalendarIcon } from './icons';
import { LeaderboardWidget } from './Leaderboard';

const kpiData = [
  { title: "New Leads", value: "42", change: "+12.5%", positive: true, period: "this week" },
  { title: "Pipeline Value", value: "$286K", change: "+15.3%", positive: true, period: "active deals" },
  { title: "Conversion Rate", value: "24.8%", change: "+3.2%", positive: true, period: "this month" },
  { title: "Written Premium", value: "$32,850", change: "+8.2%", positive: true, period: "this month" },
];

const conversionFunnelData = [
  { name: 'Leads', value: 450, fill: '#3b82f6' },
  { name: 'Contacted', value: 320, fill: '#6366f1' },
  { name: 'Qualified', value: 185, fill: '#8b5cf6' },
  { name: 'Quoted', value: 98, fill: '#a855f7' },
  { name: 'Closed', value: 45, fill: '#10b981' },
];

const salesData = [
  { name: 'Jan', Sales: 4000 },
  { name: 'Feb', Sales: 3000 },
  { name: 'Mar', Sales: 5000 },
  { name: 'Apr', Sales: 4500 },
  { name: 'May', Sales: 6000 },
  { name: 'Jun', Sales: 5500 },
];

const activityFeed = [
    { id: 1, type: 'lead', icon: <ContactsIcon className="w-4 h-4 text-blue-500" />, text: "New lead assigned:", subject: "Emily White", time: "2m ago" },
    { id: 2, type: 'deal', icon: <PipelineIcon className="w-4 h-4 text-purple-500" />, text: "Deal moved to Quoted:", subject: "David Lee - Auto Insurance", time: "1h ago" },
    { id: 3, type: 'meeting', icon: <CalendarIcon className="w-4 h-4 text-green-500" />, text: "Meeting confirmed with", subject: "Samantha Blue", time: "3h ago" },
    { id: 4, type: 'deal', icon: <PipelineIcon className="w-4 h-4 text-green-500" />, text: "Deal Won!", subject: "Michael Chen - Term Life", time: "yesterday" },
];

const KpiCard: React.FC<{ title: string; value: string; change: string; positive: boolean; period: string }> = ({ title, value, change, positive, period }) => (
  <div className="bg-surface p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
    <p className="text-sm text-textSecondary font-medium">{title}</p>
    <div className="flex items-baseline space-x-2 mt-2">
        <p className="text-3xl font-bold text-textPrimary">{value}</p>
        <div className={`flex items-center text-sm font-semibold ${positive ? 'text-green-500' : 'text-red-500'}`}>
            {positive ? '▲' : '▼'}
            <span>{change}</span>
        </div>
    </div>
    <p className="text-xs text-gray-400 mt-1">{period}</p>
  </div>
);

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-100/50 rounded-lg">
            <div className="flex items-center space-x-3 flex-grow">
                <input type="checkbox" checked={task.status === 'Completed'} readOnly className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <div>
                    <p className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through text-textSecondary' : 'text-textPrimary'}`}>{task.title}</p>
                    <p className={`text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

interface DashboardProps {
  agentsWithStats: AgentWithStats[];
  setSelectedAgent: (agent: AgentWithStats | null) => void;
  tasks: Task[];
  setActivePage: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ agentsWithStats, setSelectedAgent, tasks, setActivePage }) => {

  const currentUserId = agentsWithStats.find(a => a.name === 'Jane Doe')?.id;
  
  const todaysTasks = tasks.filter(task => {
    if (task.assigneeId !== currentUserId || task.status === 'Completed') {
      return false;
    }
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(23, 59, 59, 999); // Compare against end of day for due date
    return dueDate <= today;
  }).slice(0, 4);

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Sales Performance</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#757575', fontSize: 12 }} />
                <YAxis tick={{ fill: '#757575', fontSize: 12 }} />
                <Tooltip cursor={{fill: 'rgba(13, 71, 161, 0.1)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}/>
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="Sales" fill="#1E88E5" barSize={30} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-textPrimary mb-4">Today's Tasks</h2>
            <div className="space-y-2">
                {todaysTasks.length > 0 ? (
                    todaysTasks.map(task => <TaskItem key={task.id} task={task} />)
                ) : (
                    <p className="text-sm text-textSecondary text-center py-4">No pressing tasks for today!</p>
                )}
            </div>
             <button onClick={() => setActivePage(Page.Tasks)} className="w-full mt-4 text-sm font-semibold text-primary-700 hover:text-primary-500 transition-colors">
                View All Tasks
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Conversion Funnel</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <FunnelChart>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => {
                    const total = conversionFunnelData[0].value;
                    const percentage = ((value / total) * 100).toFixed(1);
                    return [`${value} (${percentage}%)`, name];
                  }}
                />
                <Funnel dataKey="value" data={conversionFunnelData}>
                  <LabelList position="center" fill="#fff" stroke="none" dataKey="name" style={{ fontSize: '14px', fontWeight: 'bold' }} />
                  {conversionFunnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-textSecondary">Lead → Close Rate</p>
              <p className="text-2xl font-bold text-green-600">10%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-textSecondary">Avg. Time to Close</p>
              <p className="text-2xl font-bold text-blue-600">18d</p>
            </div>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm">
           <h2 className="text-lg font-semibold text-textPrimary mb-4">Pipeline by Stage</h2>
           <div className="space-y-4">
             <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-textSecondary">New ($72K)</span>
                 <span className="font-semibold text-textPrimary">25%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                 <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
               </div>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-textSecondary">Contacted ($89K)</span>
                 <span className="font-semibold text-textPrimary">31%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                 <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '31%' }}></div>
               </div>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-textSecondary">Qualified ($65K)</span>
                 <span className="font-semibold text-textPrimary">23%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                 <div className="bg-purple-500 h-2 rounded-full" style={{ width: '23%' }}></div>
               </div>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-textSecondary">Quoted ($42K)</span>
                 <span className="font-semibold text-textPrimary">15%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                 <div className="bg-pink-500 h-2 rounded-full" style={{ width: '15%' }}></div>
               </div>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-textSecondary">Verbal ($18K)</span>
                 <span className="font-semibold text-textPrimary">6%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                 <div className="bg-green-500 h-2 rounded-full" style={{ width: '6%' }}></div>
               </div>
             </div>
             <div className="mt-4 pt-4 border-t border-gray-200">
               <div className="flex justify-between">
                 <span className="font-semibold text-textPrimary">Total Pipeline Value</span>
                 <span className="text-2xl font-bold text-primary">$286K</span>
               </div>
             </div>
           </div>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl shadow-sm">
           <h2 className="text-lg font-semibold text-textPrimary mb-4">Recent Activity</h2>
           <div className="space-y-4">
               {activityFeed.map(item => (
                   <div key={item.id} className="flex items-center space-x-3 text-sm">
                       <div className="flex-shrink-0 bg-gray-100 rounded-full p-1.5">{item.icon}</div>
                       <div className="flex-grow">
                           <span className="text-textSecondary">{item.text}</span>
                           <span className="font-semibold text-textPrimary ml-1">{item.subject}</span>
                       </div>
                       <div className="flex-shrink-0 text-xs text-gray-400">{item.time}</div>
                   </div>
               ))}
           </div>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm">
            <LeaderboardWidget agentsWithStats={agentsWithStats} setSelectedAgent={setSelectedAgent} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
