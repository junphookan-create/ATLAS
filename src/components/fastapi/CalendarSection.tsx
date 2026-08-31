import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { FastApiCalendarEvent, FastApiCalendarSchedule } from '../../types/apiTypes';

interface CalendarSectionProps {
  events: FastApiCalendarEvent[];
  schedule: FastApiCalendarSchedule | null;
  isLoading: boolean;
  onOptimize: () => Promise<void>;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  events,
  schedule,
  isLoading,
  onOptimize,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      await onOptimize();
    } finally {
      setIsOptimizing(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'deep_work':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'deadline':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'meeting':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-950/80 border border-indigo-800/50 rounded-lg text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">Calendar Intelligence & Deep Work Schedule</h2>
            <p className="text-xs text-slate-400">
              AI cognitive load balancing, deep work block defense & deadline sync (GET /calendar/events, /schedule)
            </p>
          </div>
        </div>

        <button
          onClick={handleOptimize}
          disabled={isOptimizing || isLoading}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Optimizing...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>Optimize schedule</span>
            </>
          )}
        </button>
      </div>

      {/* Schedule Metrics Bar */}
      {schedule && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">Deep Work Time</div>
            <div className="text-base font-mono font-bold text-indigo-400 mt-0.5">
              {schedule.total_deep_work_hours} hrs
            </div>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">Meetings & Calls</div>
            <div className="text-base font-mono font-bold text-blue-400 mt-0.5">
              {schedule.total_meetings_hours} hrs
            </div>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">Efficiency Score</div>
            <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
              {schedule.optimization_score}%
            </div>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">Week Starting</div>
            <div className="text-xs font-mono font-bold text-slate-300 mt-1">
              {schedule.week_start}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Recommendations */}
      {schedule?.recommendations && schedule.recommendations.length > 0 && (
        <div className="p-3.5 bg-indigo-950/30 border border-indigo-800/50 rounded-lg text-xs space-y-1.5">
          <div className="flex items-center space-x-1.5 font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Schedule Optimizations Applied:</span>
          </div>
          <ul className="space-y-1 text-slate-300 pl-4 list-disc">
            {schedule.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Scheduled Events List */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-200">Scheduled Milestones & Tasks ({events.length})</div>

        {isLoading && events.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
            No data yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-100">{ev.title}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(ev.start_time).toLocaleString()}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${getEventTypeColor(
                    ev.type
                  )}`}
                >
                  {ev.type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
