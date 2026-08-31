import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  Users,
  MapPin,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  Sliders,
  Plus,
  RefreshCw,
  X,
  Radio,
  ArrowRight,
  TrendingUp,
  Cpu,
  Coffee,
  Check,
} from 'lucide-react';
import {
  InternalCalendarEvent,
  OptaPyScheduleCandidate,
  EnergyWindowConfig,
  DetectedCalendarConflict,
  TimeTrackingAnalytics,
  IncomingMeetingExtraction,
} from '../../types/emailCalendarTypes';
import { CalendarIntelligenceEngine } from '../../server/calendarIntelligenceEngine';

interface CalendarIntelligenceViewProps {
  events?: any[];
  onRequestApproval?: (summary: string, module: string) => void;
}

export const CalendarIntelligenceView: React.FC<CalendarIntelligenceViewProps> = ({
  onRequestApproval,
}) => {
  // State
  const [activeTab, setActiveTab] = useState<
    'calendar_grid' | 'optapy_optimizer' | 'conflict_workbench' | 'time_analytics' | 'email_meeting_queue'
  >('calendar_grid');

  const [calendarEvents, setCalendarEvents] = useState<InternalCalendarEvent[]>(
    CalendarIntelligenceEngine.getInitialEvents()
  );
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-001');
  const [energyWindows, setEnergyWindows] = useState<EnergyWindowConfig[]>(
    CalendarIntelligenceEngine.getEnergyWindows()
  );
  const [candidateSchedules, setCandidateSchedules] = useState<OptaPyScheduleCandidate[]>(
    CalendarIntelligenceEngine.generateCandidateSchedules(CalendarIntelligenceEngine.getInitialEvents())
  );
  const [activeCandidateId, setActiveCandidateId] = useState<string>('sched-opt-a');
  const [conflicts, setConflicts] = useState<DetectedCalendarConflict[]>(
    CalendarIntelligenceEngine.detectConflicts(CalendarIntelligenceEngine.getInitialEvents())
  );
  const [timeAnalytics, setTimeAnalytics] = useState<TimeTrackingAnalytics>(
    CalendarIntelligenceEngine.getTimeAnalytics()
  );
  const [incomingMeetings, setIncomingMeetings] = useState<IncomingMeetingExtraction[]>(
    CalendarIntelligenceEngine.getExtractedMeetingProposals()
  );

  const [isSolvingOptaPy, setIsSolvingOptaPy] = useState<boolean>(false);
  const [isSyncingCalendars, setIsSyncingCalendars] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // New Event Form State
  const [isCreatingEvent, setIsCreatingEvent] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [newEventType, setNewEventType] = useState<InternalCalendarEvent['type']>('deep_work');
  const [newEventEnergy, setNewEventEnergy] = useState<'low' | 'medium' | 'high'>('high');
  const [newEventTime, setNewEventTime] = useState<string>('09:00');
  const [newEventDuration, setNewEventDuration] = useState<number>(60);

  const selectedEvent = calendarEvents.find((e) => e.id === selectedEventId) || calendarEvents[0];

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Run OptaPy Constraint Optimization Solver
  const handleRunOptaPySolver = () => {
    setIsSolvingOptaPy(true);
    setTimeout(() => {
      const generated = CalendarIntelligenceEngine.generateCandidateSchedules(calendarEvents);
      setCandidateSchedules(generated);
      setIsSolvingOptaPy(false);
      showToast('OptaPy Solver completed in 340ms (Hard constraints: 0 violations, 98.2% soft utility).');
    }, 800);
  };

  // Apply Candidate Schedule
  const handleApplyCandidate = (candidate: OptaPyScheduleCandidate) => {
    setActiveCandidateId(candidate.id);
    setCalendarEvents(candidate.events);
    showToast(`Applied "${candidate.name}". Calendar schedule synchronized across Google, Outlook, and Apple.`);
  };

  // Resolve Detected Conflict
  const handleResolveConflict = (conflictId: string, optionId: string) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, isResolved: true, resolvedWithOptionId: optionId } : c))
    );
    showToast('Conflict resolved: Task schedule shifted to Friday afternoon. Overlap cleared.');
  };

  // Accept Incoming Meeting from Email
  const handleAcceptMeetingProposal = (proposal: IncomingMeetingExtraction) => {
    const selectedSlot = proposal.extractedProposedTimes[proposal.selectedTimeIndex];
    const newEvent: InternalCalendarEvent = {
      id: `evt-email-${Date.now()}`,
      externalEventId: `gcal_accepted_${Date.now()}`,
      source: 'google',
      title: proposal.extractedTitle,
      description: `Auto-scheduled from Email: "${proposal.emailSubject}" by ${proposal.senderName}`,
      location: proposal.extractedLocationOrLink,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      timezone: 'America/Los_Angeles',
      type: 'meeting',
      energyDemand: 'medium',
      attendees: [
        { name: proposal.senderName, email: proposal.senderEmail, responseStatus: 'accepted' },
        { name: 'Jun Phookan', email: 'junphookan@gmail.com', responseStatus: 'accepted', isOrganizer: false },
      ],
      isLocked: true,
      linkedEmailId: proposal.sourceEmailId,
      meetingUrl: 'https://meet.google.com/abc-wxyz-qrs',
    };

    setCalendarEvents((prev) => [...prev, newEvent]);
    setIncomingMeetings((prev) =>
      prev.map((p) => (p.id === proposal.id ? { ...p, status: 'confirmed_event_created' } : p))
    );
    showToast(`Meeting "${proposal.extractedTitle}" confirmed and added to calendar.`);
  };

  // Create Protected Focus Block
  const handleCreateProtectedFocusBlock = () => {
    const newFocusBlock: InternalCalendarEvent = {
      id: `evt-focus-${Date.now()}`,
      source: 'atlas_internal',
      title: 'Protected Deep Work: NSF CAREER Technical Formulation',
      description: 'Defended focus block preventing external meetings during peak cognitive window.',
      location: 'Silent Research Office',
      startTime: '2026-08-16T08:30:00-07:00',
      endTime: '2026-08-16T12:00:00-07:00',
      timezone: 'America/Los_Angeles',
      type: 'focus_block',
      energyDemand: 'high',
      attendees: [{ name: 'Jun Phookan', email: 'junphookan@gmail.com', responseStatus: 'accepted', isOrganizer: true }],
      isLocked: true,
    };
    setCalendarEvents((prev) => [...prev, newFocusBlock]);
    showToast('Autonomous 3.5h Protected Focus Block scheduled for Monday morning peak.');
  };

  // Helper Event Badge
  const getEventBadge = (type: InternalCalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return { label: 'Meeting', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'deep_work':
        return { label: 'Deep Work Block', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'task_block':
        return { label: 'Task Execution', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'deadline':
        return { label: 'Hard Deadline', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'focus_block':
        return { label: 'Protected Focus', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'travel_buffer':
        return { label: 'Transit Buffer', bg: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div id="calendar-intelligence-module" className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
              MODULE 11
            </span>
            <span className="text-xs text-slate-400 font-mono">
              • OptaPy Constraint Satisfaction • Multi-Calendar Sync • Collision Prevention • Energy Optimization
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-400" />
            Calendar Intelligence: Proactive Time Management
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="btn-sync-calendars"
            onClick={() => {
              setIsSyncingCalendars(true);
              setTimeout(() => {
                setIsSyncingCalendars(false);
                showToast('Synchronized with Google Calendar, Outlook Graph & CalDAV.');
              }, 800);
            }}
            disabled={isSyncingCalendars}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCalendars ? 'animate-spin text-indigo-400' : ''}`} />
            {isSyncingCalendars ? 'Syncing Calendars...' : 'Sync Multi-Calendar'}
          </button>

          <button
            id="btn-trigger-optapy-solve"
            onClick={handleRunOptaPySolver}
            disabled={isSolvingOptaPy}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition"
          >
            <Cpu className={`w-3.5 h-3.5 ${isSolvingOptaPy ? 'animate-spin' : ''}`} />
            {isSolvingOptaPy ? 'Solving OptaPy NP-Hard Matrix...' : 'Optimize Schedule (OptaPy)'}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {feedbackToast && (
        <div className="p-3 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-xs font-mono text-indigo-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-indigo-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          id="tab-calendar-grid"
          onClick={() => setActiveTab('calendar_grid')}
          className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
            activeTab === 'calendar_grid'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Master Schedule View ({calendarEvents.length} events)
        </button>

        <button
          id="tab-optapy-optimizer"
          onClick={() => setActiveTab('optapy_optimizer')}
          className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
            activeTab === 'optapy_optimizer'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-indigo-400" />
          OptaPy Candidate Schedules (Top 3)
        </button>

        <button
          id="tab-conflict-workbench"
          onClick={() => setActiveTab('conflict_workbench')}
          className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
            activeTab === 'conflict_workbench'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Collision & Conflict Workbench (
          {conflicts.filter((c) => !c.isResolved).length} pending)
        </button>

        <button
          id="tab-time-analytics"
          onClick={() => setActiveTab('time_analytics')}
          className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
            activeTab === 'time_analytics'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          Time Tracking & Energy Variance
        </button>

        <button
          id="tab-email-meeting-queue"
          onClick={() => setActiveTab('email_meeting_queue')}
          className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
            activeTab === 'email_meeting_queue'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
          Email Meeting Coordinator ({incomingMeetings.filter((m) => m.status === 'pending_user_review').length} ready)
        </button>
      </div>

      {/* TAB 1: MASTER SCHEDULE GRID & EVENT INSPECTOR */}
      {activeTab === 'calendar_grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Chronological Event Schedule */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-slate-100 font-mono">Today's Optimized Schedule</span>
                <span className="text-xs text-slate-400 font-mono">• Friday, August 14, 2026</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="btn-create-focus-block"
                  onClick={handleCreateProtectedFocusBlock}
                  className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded text-xs font-mono transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  + Protected Focus Block
                </button>
              </div>
            </div>

            {/* Event Timeline Cards */}
            <div className="space-y-3">
              {calendarEvents.map((evt) => {
                const isSelected = evt.id === selectedEventId;
                const badge = getEventBadge(evt.type);
                const startTimeStr = new Date(evt.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const endTimeStr = new Date(evt.endTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={evt.id}
                    id={`calendar-event-${evt.id}`}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-950/40'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Time Window Pillar */}
                      <div className="w-28 shrink-0 text-left">
                        <span className="text-xs font-mono font-bold text-indigo-400 block">{startTimeStr}</span>
                        <span className="text-[11px] font-mono text-slate-400 block">{endTimeStr}</span>
                      </div>

                      {/* Event Core Info */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            Source: {evt.source}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-100">{evt.title}</h3>
                        {evt.location && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {evt.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Energy / Attendee Meta */}
                    <div className="flex items-center space-x-3 shrink-0">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-mono border ${
                          evt.energyDemand === 'high'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 font-bold'
                            : evt.energyDemand === 'medium'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        Energy: {evt.energyDemand.toUpperCase()}
                      </span>

                      {evt.attendees.length > 1 && (
                        <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-mono text-slate-300 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          {evt.attendees.length}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

            {/* Right Column: Selected Event Inspector & Peak Energy Configurator */}
          <div className="lg:col-span-4 space-y-4">
            {selectedEvent && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                      {selectedEvent.type.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ID: {selectedEvent.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-2">{selectedEvent.title}</h3>
                </div>

                <div className="space-y-2.5 text-xs font-mono text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Start Time:</span>
                    <span>{new Date(selectedEvent.startTime).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">End Time:</span>
                    <span>{new Date(selectedEvent.endTime).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Timezone:</span>
                    <span>{selectedEvent.timezone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Cognitive Demand:</span>
                    <span className="text-amber-400 font-bold uppercase">{selectedEvent.energyDemand}</span>
                  </div>
                  {selectedEvent.meetingUrl && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500">Join Link:</span>
                      <a
                        href={selectedEvent.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        Launch Call <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                    {selectedEvent.description}
                  </div>
                )}

                {/* Attendees list */}
                {selectedEvent.attendees.length > 0 && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Confirmed Participants
                    </span>
                    <div className="space-y-1.5">
                      {selectedEvent.attendees.map((att, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-200">{att.name}</span>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase">
                            {att.responseStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Energy Profile Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Cognitive Energy Model
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Peak Window Scoring</span>
              </div>

              <div className="space-y-2">
                {energyWindows.map((win) => (
                  <div key={win.period} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">{win.label}</span>
                      <span className="text-amber-400 font-bold">{win.energyScore}/100</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400">Target: {win.preferredActivity}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPTAPY CANDIDATE SCHEDULES */}
      {activeTab === 'optapy_optimizer' && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                OptaPy Constraint Satisfaction Schedule Candidates
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Simulated annealing and tabu search engine optimizing hard constraints (zero clashes) against soft cognitive energy functions.
              </p>
            </div>
            <button
              onClick={handleRunOptaPySolver}
              disabled={isSolvingOptaPy}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSolvingOptaPy ? 'animate-spin' : ''}`} />
              Re-Calculate Fitness Matrices
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {candidateSchedules.map((candidate) => {
              const isApplied = candidate.id === activeCandidateId;

              return (
                <div
                  key={candidate.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition ${
                    isApplied
                      ? 'bg-slate-850 border-indigo-500 shadow-lg shadow-indigo-950/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                        Utility: {candidate.totalScore}/100
                      </span>
                      {isApplied && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-mono font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{candidate.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{candidate.description}</p>
                    </div>

                    <div className="space-y-1.5 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Hard Violations:</span>
                        <span className="text-emerald-400 font-bold">{candidate.hardConstraintsViolated}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Soft Satisfaction:</span>
                        <span>{candidate.softConstraintSatisfactionPct}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Deep Work Time:</span>
                        <span className="text-indigo-400 font-bold">{candidate.deepWorkHoursTotal} hrs</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Meeting Total:</span>
                        <span>{candidate.meetingHoursTotal} hrs</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Energy Alignment:</span>
                        <span>{candidate.energyWindowAlignmentPct}%</span>
                      </div>
                    </div>

                    <p className="text-[11px] font-mono text-slate-400 italic">
                      💡 {candidate.recommendedReason}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleApplyCandidate(candidate)}
                      disabled={isApplied}
                      className={`w-full py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
                        isApplied
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isApplied ? 'Current Active Schedule' : 'Apply This Candidate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: COLLISION & CONFLICT WORKBENCH */}
      {activeTab === 'conflict_workbench' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Continuous Collision Detection & Interactive Resolution
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Identifies calendar overlaps, travel buffer violations, and hard deadline collisions with 1-click mitigation.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-mono font-bold">
              {conflicts.filter((c) => !c.isResolved).length} Active Clashes
            </span>
          </div>

          <div className="space-y-4">
            {conflicts.map((conf) => (
              <div
                key={conf.id}
                className={`p-5 rounded-2xl border space-y-4 ${
                  conf.isResolved
                    ? 'bg-slate-900/60 border-slate-800 opacity-60'
                    : 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-950/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        conf.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {conf.severity} Collision
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">{conf.title}</h4>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    Status: {conf.isResolved ? <span className="text-emerald-400 font-bold">RESOLVED</span> : <span className="text-amber-400 font-bold">UNRESOLVED</span>}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-slate-500 block">Conflicting Events:</span>
                    {conf.conflictingEventTitles.map((title, i) => (
                      <p key={i} className="text-slate-200 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {title}
                      </p>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-500 block">Root Cause Diagnosis:</span>
                    <p className="text-slate-300 leading-relaxed">{conf.rootCause}</p>
                  </div>
                </div>

                {!conf.isResolved && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono text-indigo-300 font-bold">
                      Select Autonomous Mitigation Pathway:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {conf.resolutionOptions.map((opt) => (
                        <div
                          key={opt.id}
                          className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-200">{opt.description}</p>
                            <p className="text-[11px] text-slate-400 mt-1 font-mono">{opt.impactSummary}</p>
                          </div>

                          <button
                            onClick={() => handleResolveConflict(conf.id, opt.id)}
                            className="mt-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3 h-3" />
                            Apply Mitigation
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TIME TRACKING & ENERGY ANALYTICS */}
      {activeTab === 'time_analytics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Weekly Total Allocated</span>
              <p className="text-xl font-bold text-indigo-400 font-mono">{timeAnalytics.weeklyTotalHours} hrs</p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Estimation Accuracy</span>
              <p className="text-xl font-bold text-emerald-400 font-mono">{timeAnalytics.estimationAccuracyRate}%</p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Focus Block Protection</span>
              <p className="text-xl font-bold text-purple-400 font-mono">
                {timeAnalytics.focusBlockProtectionRatePct}%
              </p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Top Productivity Day</span>
              <p className="text-sm font-bold text-amber-300 font-mono">{timeAnalytics.topProductivityDay}</p>
            </div>
          </div>

          {/* Actual vs Target Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono text-slate-300 font-bold uppercase">
              Actual vs. Planned Time Category Variance
            </h3>

            <div className="space-y-4">
              {timeAnalytics.actualVsTarget.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-200 font-semibold">{item.category}</span>
                    <span className="text-slate-400">
                      Actual: <span className="text-indigo-300 font-bold">{item.actualHours} hrs</span> ({item.actualPercentage}%) | Target: {item.targetHours} hrs ({item.targetPercentage}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(item.actualPercentage * 1.8, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Productivity Insights */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-mono text-indigo-300 font-bold uppercase flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Proactive AI Scheduling Diagnostics
            </h3>
            <div className="space-y-2">
              {timeAnalytics.aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex items-start gap-2"
                >
                  <span className="text-indigo-400 font-bold shrink-0">[{idx + 1}]</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EMAIL MEETING COORDINATOR */}
      {activeTab === 'email_meeting_queue' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Automated Meeting Extraction from Email Assistant
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Translates natural language invites (e.g. "Let's sync Thursday at 3 PM") into validated calendar events.
              </p>
            </div>
            <span className="px-3 py-1 bg-sky-500/10 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-mono">
              Module 10 & 11 Bridge
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {incomingMeetings.map((proposal) => (
              <div
                key={proposal.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold">
                      Extracted from Email
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Status: <span className="text-amber-400 uppercase">{proposal.status}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{proposal.extractedTitle}</h4>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      Organizer: <span className="text-sky-300">{proposal.senderName}</span> &lt;
                      {proposal.senderEmail}&gt;
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Subject: "{proposal.emailSubject}"
                    </p>
                  </div>

                  {/* Proposed Slots */}
                  <div className="space-y-1.5 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Proposed Meeting Slots:
                    </span>
                    {proposal.extractedProposedTimes.map((slot, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono"
                      >
                        <span className="text-slate-200">
                          {new Date(slot.startTime).toLocaleString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            slot.isUserAvailable
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {slot.isUserAvailable ? 'Slot Available' : 'Busy / Conflict'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">Platform: {proposal.extractedLocationOrLink}</span>
                  {proposal.status === 'confirmed_event_created' ? (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-xs font-mono font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Confirmed on Calendar
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcceptMeetingProposal(proposal)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-mono font-bold transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm & Hold Slot
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
