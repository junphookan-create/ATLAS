import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Compass,
  Trophy,
  FileText,
  Microscope,
  Users,
  Share2,
  Briefcase,
  Rocket,
  Network,
  Mail,
  Calendar,
  Cpu,
  Globe,
  GitBranch,
  FileCheck,
  PenTool,
  TrendingUp,
  Lightbulb,
  Brain,
  ChevronRight,
} from 'lucide-react';
import { ModuleId } from '../types';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  pendingApprovalsCount: number;
}

interface NavGroup {
  category: string;
  items: {
    id: ModuleId;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  pendingApprovalsCount,
}) => {
  const groups: NavGroup[] = [
    {
      category: 'Command & Governance',
      items: [
        { id: 'executive_dashboard', label: 'Executive Command Center', icon: LayoutDashboard },
        { id: 'celery_worker_dashboard', label: 'Celery & Redis Streams', icon: Cpu, badge: 'ASYNC', badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
        { id: 'general_cognitive_worker', label: 'General Cognitive Worker', icon: Brain, badge: 'GCW', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
        { id: 'approval_center', label: 'Human Approval Center', icon: ShieldCheck, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined, badgeColor: 'bg-amber-950 text-amber-300 border-amber-800' },
      ],
    },
    {
      category: 'Discovery & Opportunities',
      items: [
        { id: 'opportunity_discovery', label: 'Opportunity Discovery', icon: Compass },
        { id: 'competition_manager', label: 'Competition Manager', icon: Trophy },
        { id: 'side_hustle_scraper', label: 'Side Hustle Blueprint Scraper', icon: TrendingUp },
      ],
    },
    {
      category: 'Research & Proposals',
      items: [
        { id: 'grant_writer', label: 'Grant & Fellowship Writer', icon: FileText },
        { id: 'research_scientist', label: 'Research Scientist', icon: Microscope },
        { id: 'document_generator', label: 'Document Generator Studio', icon: FileCheck },
      ],
    },
    {
      category: 'Relationships & Growth',
      items: [
        { id: 'outreach_manager', label: 'Outreach & Relationship CRM', icon: Users },
        { id: 'social_media_manager', label: 'Omnichannel Social Media', icon: Share2 },
        { id: 'brand_collaboration', label: 'Brand Collab & Deal Flow', icon: Briefcase },
        { id: 'startup_growth', label: 'Startup Growth & Pitch Decks', icon: Rocket },
        { id: 'idea_incubator', label: 'Autonomous Idea Incubator', icon: Lightbulb, badge: 'MVP', badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
      ],
    },
    {
      category: 'Cognitive Operations',
      items: [
        { id: 'knowledge_workspace', label: 'Knowledge Graph Workspace', icon: Network },
        { id: 'email_assistant', label: 'Smart Email Assistant', icon: Mail },
        { id: 'calendar_intelligence', label: 'Calendar Intelligence', icon: Calendar },
        { id: 'project_builder', label: 'Project Builder & WBS', icon: GitBranch },
        { id: 'browser_agent', label: 'Browser Actuator Agent', icon: Globe },
        { id: 'ai_research_lab', label: 'AI Model Router & DAG Lab', icon: Cpu },
        { id: 'essay_architect', label: 'Essay & Narrative Architect', icon: PenTool },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar select-none text-slate-300">
      <div className="p-3 space-y-6">
        {groups.map((group) => (
          <div key={group.category} className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {group.category}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`ml-1 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded border ${
                          item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isActive && item.badge === undefined && (
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-500 flex items-center justify-between font-mono">
        <div>
          <p className="text-slate-400 font-medium">Atlas AI System</p>
          <p className="text-[10px]">20 Active Sub-Modules</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </aside>
  );
};
