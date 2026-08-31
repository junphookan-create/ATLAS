import React, { useState } from 'react';
import {
  Users,
  Mail,
  UserPlus,
  Send,
  Sparkles,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { FastApiContact, FastApiCampaign } from '../../types/apiTypes';

interface OutreachSectionProps {
  contacts: FastApiContact[];
  campaigns: FastApiCampaign[];
  isLoading: boolean;
  onCreateCampaign: (name: string, targetAudience?: string) => Promise<void>;
  onFindContacts: (query: string) => Promise<void>;
}

export const OutreachSection: React.FC<OutreachSectionProps> = ({
  contacts,
  campaigns,
  isLoading,
  onCreateCampaign,
  onFindContacts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [isFinding, setIsFinding] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  const handleFind = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isFinding) return;
    setIsFinding(true);
    try {
      await onFindContacts(searchQuery.trim());
      setSearchQuery('');
    } finally {
      setIsFinding(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim() || isCreatingCampaign) return;
    setIsCreatingCampaign(true);
    try {
      await onCreateCampaign(campaignName.trim(), 'AI & Robotics Faculty');
      setCampaignName('');
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-950/80 border border-blue-800/50 rounded-lg text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">Outreach & Relationship CRM</h2>
            <p className="text-xs text-slate-400">
              Targeted academic & VC relationship management (GET /outreach/contacts, /campaigns)
            </p>
          </div>
        </div>
      </div>

      {/* 2 Action bars: Find Contacts & Create Campaign */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Find Contacts Form */}
        <form onSubmit={handleFind} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
            <UserPlus className="w-4 h-4 text-blue-400" />
            <span>Discover & Enrich Key Contacts</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. 'Neuromorphic Bioengineering Stanford'..."
              disabled={isFinding}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />
            <button
              type="submit"
              disabled={!searchQuery.trim() || isFinding}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-1 shrink-0"
            >
              {isFinding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Find contacts</span>}
            </button>
          </div>
        </form>

        {/* Create Campaign Form */}
        <form onSubmit={handleCreateCampaign} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>Launch Email Outreach Campaign</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. 'NSF Advisory Board Outreach Q3'..."
              disabled={isCreatingCampaign}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />
            <button
              type="submit"
              disabled={!campaignName.trim() || isCreatingCampaign}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-1 shrink-0"
            >
              {isCreatingCampaign ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Create campaign</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Grid: Contacts & Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enriched Contacts */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Enriched Network Contacts ({contacts.length})</span>
          </div>

          {isLoading && contacts.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
              No data yet
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-100">{c.name}</h4>
                      <p className="text-slate-400">{c.title} • <strong className="text-slate-300">{c.affiliation}</strong></p>
                      <p className="text-indigo-400 font-mono text-[11px] mt-0.5">{c.email}</p>
                    </div>
                    {c.enriched_data?.h_index && (
                      <span className="font-mono text-[10px] text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                        h-index: {c.enriched_data.h_index}
                      </span>
                    )}
                  </div>

                  {c.enriched_data?.research_topics && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.enriched_data.research_topics.map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outreach Campaigns */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>Active Campaigns & Threads ({campaigns.length})</span>
          </div>

          {isLoading && campaigns.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
              No data yet
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-100">{camp.name}</h4>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {camp.status}
                    </span>
                  </div>

                  {camp.email_threads && camp.email_threads.length > 0 ? (
                    <div className="space-y-2 border-t border-slate-900 pt-2">
                      <div className="text-[11px] font-semibold text-slate-400">Email Threads:</div>
                      {camp.email_threads.map((th) => (
                        <div
                          key={th.id}
                          className="p-2 bg-slate-900/60 rounded border border-slate-800/80 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-medium text-slate-200">{th.recipient_name}</span>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{th.subject}</p>
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              th.status === 'replied'
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {th.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px]">No active threads yet.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
