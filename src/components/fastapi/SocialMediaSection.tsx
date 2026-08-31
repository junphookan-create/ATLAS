import React, { useState } from 'react';
import {
  Share2,
  Twitter,
  Linkedin,
  Sparkles,
  Loader2,
  Clock,
  Send,
  Calendar,
} from 'lucide-react';
import { FastApiSocialPost } from '../../types/apiTypes';

interface SocialMediaSectionProps {
  posts: FastApiSocialPost[];
  isLoading: boolean;
  onGeneratePost: (topic: string, platform: string) => Promise<void>;
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  posts,
  isLoading,
  onGeneratePost,
}) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      await onGeneratePost(topic.trim(), platform);
      setTopic('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-950/80 border border-indigo-800/50 rounded-lg text-indigo-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">Omnichannel Social Media Engine</h2>
            <p className="text-xs text-slate-400">
              Automated research dissemination & viral thread drafting (GET /social/posts, POST /social/generate)
            </p>
          </div>
        </div>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleSubmit} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Generate Platform-Optimized Post</span>
          </div>

          {/* Platform Selector */}
          <div className="flex items-center space-x-2">
            {['twitter', 'linkedin', 'threads'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`text-xs px-2.5 py-1 rounded capitalize transition-colors ${
                  platform === p
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'Event camera optical flow benchmark release on GitHub'..."
            disabled={isGenerating}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={!topic.trim() || isGenerating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-1 shrink-0"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Generate post</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Posts List */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-200">Scheduled & Drafted Posts ({posts.length})</div>

        {isLoading && posts.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
            No data yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                      {post.platform}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                        post.status === 'scheduled'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{new Date(post.scheduled_time).toLocaleString()}</span>
                  </div>
                  {post.engagement_estimate && (
                    <span className="text-emerald-400">~{post.engagement_estimate} views</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
