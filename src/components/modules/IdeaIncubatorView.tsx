import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sparkles,
  Loader2,
  Code,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  TrendingUp,
  BarChart3,
  Cpu,
  RefreshCw,
  Zap,
  Mic,
  MicOff,
  DollarSign,
  Users,
  Target,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  FileText,
  Terminal,
  Activity,
  ChevronRight,
  Download,
  Plus,
  Trash2,
  Edit3,
  Monitor,
  Check,
  Flame,
  PieChart,
} from 'lucide-react';
import {
  IncubatorVenture,
  LeanCanvasModel,
  MarketLandscapeAnalysis,
  PrototypeMockupVariant,
  FullStackPrototypeCode,
  SimulatedPersonaFeedback,
  ViabilityPackage,
  VentureDomain,
} from '../../types/sideHustleIncubatorTypes';

interface IdeaIncubatorViewProps {
  initialCanvas?: any;
  onRequestApproval?: (req: { summary: string; moduleName?: string; payload?: any }) => void;
}

export const IdeaIncubatorView: React.FC<IdeaIncubatorViewProps> = ({ initialCanvas, onRequestApproval }) => {
  const [ventures, setVentures] = useState<IncubatorVenture[]>([]);
  const [selectedVentureId, setSelectedVentureId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'canvas' | 'market_research' | 'ui_prototype' | 'fullstack_code' | 'validation' | 'viability_dossier'>('canvas');
  
  // Intake state
  const [rawIdeaInput, setRawIdeaInput] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'voice_memo'>('text');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState(0);
  const [intaking, setIntaking] = useState(false);

  // Workflow states
  const [runningStreams, setRunningStreams] = useState(false);
  const [validating, setValidating] = useState(false);
  const [savingCanvas, setSavingCanvas] = useState(false);
  const [codeTab, setCodeTab] = useState<'frontend' | 'backend' | 'database' | 'spec' | 'tests'>('frontend');
  const [selectedMockupId, setSelectedMockupId] = useState<string>('');

  // Editable Lean Canvas State
  const [editableCanvas, setEditableCanvas] = useState<LeanCanvasModel>({
    problem: ['Engineering textbooks cost $250+ and sit idle after 1 semester.'],
    customerSegments: ['Undergraduate STEM students with budget constraints.'],
    uniqueValueProposition: 'Rent verified STEM textbooks from peers with instant QR locker pickup.',
    solution: ['Geo-fenced campus marketplace with smart locker hubs.'],
    channels: ['Campus ambassador network & student discord servers.'],
    revenueStreams: ['12% transaction fee on every rental.'],
    costStructure: ['Stripe payment processing & Supabase cloud hosting.'],
    keyMetrics: ['Campus listing density & rental turnaround velocity.'],
    unfairAdvantage: 'Exclusive university club partnerships & zero shipping hassle.',
  });

  useEffect(() => {
    fetchVentures();
  }, []);

  const fetchVentures = async () => {
    try {
      const res = await fetch('/api/incubator/ventures');
      const data = await res.json();
      if (data.ventures && data.ventures.length > 0) {
        setVentures(data.ventures);
        if (!selectedVentureId) {
          setSelectedVentureId(data.ventures[0].id);
          setEditableCanvas(data.ventures[0].leanCanvas);
        }
      }
    } catch (err) {
      console.error('Failed to load ventures:', err);
    }
  };

  const selectedVenture = ventures.find((v) => v.id === selectedVentureId) || ventures[0];

  useEffect(() => {
    if (selectedVenture) {
      setEditableCanvas(selectedVenture.leanCanvas);
      if (selectedVenture.uiMockups && selectedVenture.uiMockups.length > 0 && !selectedMockupId) {
        setSelectedMockupId(selectedVenture.uiMockups[0].id);
      }
    }
  }, [selectedVentureId]);

  // Voice recording simulation
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => setVoiceTimer((t) => t + 1), 1000);
    } else {
      setVoiceTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const handleToggleVoiceRecord = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setInputMode('voice_memo');
    } else {
      setIsRecordingVoice(false);
      // Simulate Whisper transcription output
      setRawIdeaInput('Autonomous AI micro-procurement auditor for manufacturing CFOs to detect duplicate supply chain invoices with zero human review.');
    }
  };

  const handleIntakeIdea = async () => {
    if (!rawIdeaInput.trim()) return;
    try {
      setIntaking(true);
      const res = await fetch('/api/incubator/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: rawIdeaInput, inputMode }),
      });
      const data = await res.json();
      if (data.venture) {
        setVentures((prev) => [data.venture, ...prev]);
        setSelectedVentureId(data.venture.id);
        setEditableCanvas(data.venture.leanCanvas);
        setRawIdeaInput('');
        setActiveTab('canvas');
      }
    } catch (err) {
      console.error('Failed to intake idea:', err);
    } finally {
      setIntaking(false);
    }
  };

  const handleSaveCanvas = async () => {
    if (!selectedVenture) return;
    try {
      setSavingCanvas(true);
      const res = await fetch('/api/incubator/canvas/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ventureId: selectedVenture.id,
          leanCanvas: editableCanvas,
        }),
      });
      const data = await res.json();
      if (data.venture) {
        setVentures((prev) => prev.map((v) => (v.id === data.venture.id ? data.venture : v)));
      }
    } catch (err) {
      console.error('Failed to save canvas:', err);
    } finally {
      setSavingCanvas(false);
    }
  };

  const handleRunConcurrentRnD = async () => {
    if (!selectedVenture) return;
    try {
      setRunningStreams(true);
      const res = await fetch('/api/incubator/streams/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventureId: selectedVenture.id }),
      });
      const data = await res.json();
      if (data.venture) {
        setVentures((prev) => prev.map((v) => (v.id === data.venture.id ? data.venture : v)));
        setActiveTab('market_research');
      }
    } catch (err) {
      console.error('Failed to run R&D streams:', err);
    } finally {
      setRunningStreams(false);
    }
  };

  const handleRunValidationAndViability = async () => {
    if (!selectedVenture) return;
    try {
      setValidating(true);
      const res = await fetch('/api/incubator/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventureId: selectedVenture.id }),
      });
      const data = await res.json();
      if (data.venture) {
        setVentures((prev) => prev.map((v) => (v.id === data.venture.id ? data.venture : v)));
        setActiveTab('viability_dossier');
      }
    } catch (err) {
      console.error('Failed to run validation & viability:', err);
    } finally {
      setValidating(false);
    }
  };

  // Helper for adding/editing items in Lean Canvas
  const updateCanvasItem = (field: keyof LeanCanvasModel, index: number, value: string) => {
    const list = [...(editableCanvas[field] as string[])];
    list[index] = value;
    setEditableCanvas({ ...editableCanvas, [field]: list });
  };

  const addCanvasItem = (field: keyof LeanCanvasModel) => {
    const list = [...(editableCanvas[field] as string[]), 'New strategic point...'];
    setEditableCanvas({ ...editableCanvas, [field]: list });
  };

  const removeCanvasItem = (field: keyof LeanCanvasModel, index: number) => {
    const list = (editableCanvas[field] as string[]).filter((_, i) => i !== index);
    setEditableCanvas({ ...editableCanvas, [field]: list });
  };

  const activeMockup =
    selectedVenture?.uiMockups?.find((m) => m.id === selectedMockupId) ||
    selectedVenture?.uiMockups?.[0];

  return (
    <div id="idea_incubator_view" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-bold tracking-wider">
              MODULE 19
            </span>
            <span className="text-xs text-slate-400 font-mono">
              • Autonomous Venture Builder & Accelerator Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1 tracking-tight">
            Autonomous Idea Incubator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Transform raw concepts and voice memos into validated ventures with Lean Canvas, market research, UI mockups, full-stack code, and viability packages.
          </p>
        </div>

        {/* Venture Selector Queue */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-mono">Active Venture:</span>
            <select
              value={selectedVentureId}
              onChange={(e) => setSelectedVentureId(e.target.value)}
              className="bg-transparent text-indigo-300 font-semibold focus:outline-none cursor-pointer"
            >
              {ventures.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-slate-200">
                  {v.domain}: {v.rawInput.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchVentures}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition"
            title="Refresh Incubator State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Idea Intake Bar (Voice Memo & Text Command) */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-indigo-400 font-bold uppercase flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Venture Intake: Natural Language or Whisper Voice Memo</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Semantic domain tagger & 1-page Lean Canvas generator
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Voice button */}
          <button
            onClick={handleToggleVoiceRecord}
            className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-semibold transition shrink-0 ${
              isRecordingVoice
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-500'
            }`}
            title="Toggle Voice Memo Recording (Whisper AI)"
          >
            {isRecordingVoice ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Recording ({voiceTimer}s)...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-indigo-400" />
                <span>Voice Memo</span>
              </>
            )}
          </button>

          {/* Text Input */}
          <div className="flex-1 w-full flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus-within:border-indigo-500">
            <input
              type="text"
              value={rawIdeaInput}
              onChange={(e) => setRawIdeaInput(e.target.value)}
              placeholder="Enter startup thesis (e.g. 'Autonomous AI micro-procurement auditor for manufacturing CFOs' or 'On-demand 3D printed orthotics')..."
              className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <button
            onClick={handleIntakeIdea}
            disabled={intaking || !rawIdeaInput.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-2 shrink-0 shadow-lg shadow-indigo-950/40"
          >
            {intaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
            <span>{intaking ? 'Synthesizing Canvas...' : 'Generate Lean Canvas'}</span>
          </button>
        </div>
      </div>

      {/* Selected Venture Stage & Execution Pipeline Status */}
      {selectedVenture && (
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-xs font-bold">
              {selectedVenture.domain}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{selectedVenture.rawInput}</h3>
              <span className="text-[10px] font-mono text-slate-500">
                Created: {new Date(selectedVenture.createdAt).toLocaleDateString()} • Stage: {selectedVenture.stage.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={handleRunConcurrentRnD}
              disabled={runningStreams}
              className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-2"
            >
              {runningStreams ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>Launch 3-Stream Concurrent R&D</span>
            </button>

            <button
              onClick={handleRunValidationAndViability}
              disabled={validating}
              className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-2"
            >
              {validating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BarChart3 className="w-3.5 h-3.5" />}
              <span>Validate & Package</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
        {[
          { id: 'canvas', label: '9-Box Lean Canvas', icon: Layers, badge: 'Editable' },
          { id: 'market_research', label: 'Stream 1: Market Landscape', icon: TrendingUp, hasData: !!selectedVenture?.marketResearch },
          { id: 'ui_prototype', label: 'Stream 2: UI/UX Wireframes', icon: Monitor, hasData: !!selectedVenture?.uiMockups?.length },
          { id: 'fullstack_code', label: 'Stream 3: Full-Stack Code & Tests', icon: Code, hasData: !!selectedVenture?.fullStackPrototype },
          { id: 'validation', label: 'Persona Feedback & Pivots', icon: Users, hasData: !!selectedVenture?.personaValidation?.length },
          { id: 'viability_dossier', label: 'Viability Package & ROI Model', icon: FileText, hasData: !!selectedVenture?.viabilityPackage },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl transition whitespace-nowrap border-b-2 font-medium ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 text-[9px] rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  {tab.badge}
                </span>
              )}
              {tab.hasData && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: 9-BOX LEAN CANVAS */}
      {/* ========================================================= */}
      {activeTab === 'canvas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Collaborative 9-Box Business Model Blueprint (Ash Maurya Framework)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveCanvas}
                disabled={savingCanvas}
                className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
              >
                {savingCanvas ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{savingCanvas ? 'Saving...' : 'Save Canvas Changes'}</span>
              </button>
            </div>
          </div>

          {/* 9-Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
            {/* Box 1: Problem */}
            <div className="md:col-span-1 p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="font-mono text-indigo-400 font-bold uppercase text-[11px]">1. Problem</span>
                  <button onClick={() => addCanvasItem('problem')} className="text-slate-400 hover:text-indigo-300">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {editableCanvas.problem.map((p, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 group">
                      <span className="text-indigo-500 font-bold">•</span>
                      <textarea
                        value={p}
                        onChange={(e) => updateCanvasItem('problem', idx, e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-lg p-1.5 text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500"
                      />
                      <button onClick={() => removeCanvasItem('problem', idx)} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Box 2: Solution & Key Metrics */}
            <div className="md:col-span-1 space-y-3.5 flex flex-col">
              {/* Solution */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 flex-1">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="font-mono text-indigo-400 font-bold uppercase text-[11px]">4. Solution</span>
                  <button onClick={() => addCanvasItem('solution')} className="text-slate-400 hover:text-indigo-300">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {editableCanvas.solution.map((s, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 group">
                      <span className="text-indigo-500 font-bold">•</span>
                      <textarea
                        value={s}
                        onChange={(e) => updateCanvasItem('solution', idx, e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-lg p-1.5 text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500"
                      />
                      <button onClick={() => removeCanvasItem('solution', idx)} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 flex-1">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="font-mono text-indigo-400 font-bold uppercase text-[11px]">8. Key Metrics</span>
                  <button onClick={() => addCanvasItem('keyMetrics')} className="text-slate-400 hover:text-indigo-300">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {editableCanvas.keyMetrics.map((k, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 group">
                      <span className="text-indigo-500 font-bold">•</span>
                      <textarea
                        value={k}
                        onChange={(e) => updateCanvasItem('keyMetrics', idx, e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-lg p-1.5 text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500"
                      />
                      <button onClick={() => removeCanvasItem('keyMetrics', idx)} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Box 3: Unique Value Proposition */}
            <div className="md:col-span-1 p-4 bg-slate-900 border border-indigo-500/30 rounded-2xl space-y-3 flex flex-col justify-between shadow-lg shadow-indigo-950/20">
              <div className="space-y-2">
                <div className="border-b border-slate-800 pb-1.5">
                  <span className="font-mono text-indigo-300 font-bold uppercase text-[11px]">
                    3. Unique Value Prop
                  </span>
                </div>
                <textarea
                  value={editableCanvas.uniqueValueProposition}
                  onChange={(e) => setEditableCanvas({ ...editableCanvas, uniqueValueProposition: e.target.value })}
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              <div className="p-2.5 bg-indigo-950/40 border border-indigo-900/40 rounded-xl text-[10px] text-indigo-300 font-mono">
                High-level concept: Single clear, compelling message stating why you are different.
              </div>
            </div>

            {/* Box 4: Unfair Advantage & Channels */}
            <div className="md:col-span-1 space-y-3.5 flex flex-col">
              {/* Unfair Advantage */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 flex-1">
                <div className="border-b border-slate-800 pb-1.5">
                  <span className="font-mono text-indigo-400 font-bold uppercase text-[11px]">
                    9. Unfair Advantage
                  </span>
                </div>
                <textarea
                  value={editableCanvas.unfairAdvantage}
                  onChange={(e) => setEditableCanvas({ ...editableCanvas, unfairAdvantage: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-lg p-2 text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Channels */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 flex-1">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="font-mono text-indigo-400 font-bold uppercase text-[11px]">5. Channels</span>
                  <button onClick={() => addCanvasItem('channels')} className="text-slate-400 hover:text-indigo-300">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {editableCanvas.channels.map((c, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 group">
                      <span className="text-indigo-500 font-bold">•</span>
                      <textarea
                        value={c}
                        onChange={(e) => updateCanvasItem('channels', idx, e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-lg p-1.5 text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500"
                      />
                      <button onClick={() => removeCanvasItem('channels', idx)} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Box 5: Customer Segments */}
            <div className="md:col-span-1 p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="font-mono text-indigo-400 font-bold uppercase text-[11px]">
                    2. Customer Segments
                  </span>
                  <button onClick={() => addCanvasItem('customerSegments')} className="text-slate-400 hover:text-indigo-300">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {editableCanvas.customerSegments.map((cs, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 group">
                      <span className="text-indigo-500 font-bold">•</span>
                      <textarea
                        value={cs}
                        onChange={(e) => updateCanvasItem('customerSegments', idx, e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-lg p-1.5 text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500"
                      />
                      <button onClick={() => removeCanvasItem('customerSegments', idx)} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Cost Structure & Revenue Streams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Cost Structure */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="font-mono text-rose-400 font-bold uppercase text-[11px]">7. Cost Structure</span>
                <button onClick={() => addCanvasItem('costStructure')} className="text-slate-400 hover:text-rose-300">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {editableCanvas.costStructure.map((c, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5 group">
                    <span className="text-rose-500 font-bold">•</span>
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => updateCanvasItem('costStructure', idx, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-lg p-1.5 text-slate-300 text-[11px] focus:outline-none focus:border-rose-500"
                    />
                    <button onClick={() => removeCanvasItem('costStructure', idx)} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Streams */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="font-mono text-emerald-400 font-bold uppercase text-[11px]">6. Revenue Streams</span>
                <button onClick={() => addCanvasItem('revenueStreams')} className="text-slate-400 hover:text-emerald-300">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {editableCanvas.revenueStreams.map((r, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5 group">
                    <span className="text-emerald-500 font-bold">•</span>
                    <input
                      type="text"
                      value={r}
                      onChange={(e) => updateCanvasItem('revenueStreams', idx, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-lg p-1.5 text-slate-300 text-[11px] focus:outline-none focus:border-emerald-500"
                    />
                    <button onClick={() => removeCanvasItem('revenueStreams', idx)} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: STREAM 1 - MARKET LANDSCAPE RESEARCH */}
      {/* ========================================================= */}
      {activeTab === 'market_research' && (
        <div className="space-y-6">
          {selectedVenture?.marketResearch ? (
            <div className="space-y-6">
              {/* Top TAM / SAM / SOM Market Sizing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Addressable Market (TAM)</span>
                  <span className="text-2xl font-bold font-mono text-indigo-400">
                    ${selectedVenture.marketResearch.marketSizeEstimates.tamUsdBillions}B
                  </span>
                  <span className="text-[10px] text-slate-400 block">Global Annual Market Size</span>
                </div>

                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Serviceable Addressable Market (SAM)</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    ${selectedVenture.marketResearch.marketSizeEstimates.samUsdMillions}M
                  </span>
                  <span className="text-[10px] text-slate-400 block">Target Segment Potential</span>
                </div>

                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Serviceable Obtainable Market (SOM)</span>
                  <span className="text-2xl font-bold font-mono text-teal-300">
                    ${selectedVenture.marketResearch.marketSizeEstimates.somUsdMillions}M
                  </span>
                  <span className="text-[10px] text-slate-400 block">Year 1-2 Realistic Capture</span>
                </div>
              </div>

              {/* Methodology banner */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 flex items-center space-x-2">
                <span className="text-indigo-400 font-bold uppercase text-[10px]">Methodology:</span>
                <span>{selectedVenture.marketResearch.marketSizeEstimates.methodology}</span>
              </div>

              {/* Competitor Matrix Table */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-indigo-400 font-bold uppercase">
                    Competitor Intelligence & Vulnerability Matrix
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    ProductHunt • Crunchbase • Google News
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                        <th className="py-2.5 px-3">Competitor</th>
                        <th className="py-2.5 px-3">Funding / Scale</th>
                        <th className="py-2.5 px-3">Key Features</th>
                        <th className="py-2.5 px-3">Core Vulnerability (Our Edge)</th>
                        <th className="py-2.5 px-3">Pricing Model</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                      {selectedVenture.marketResearch.competitorMatrix.map((comp, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/60 transition">
                          <td className="py-3 px-3 font-semibold text-slate-100">{comp.name}</td>
                          <td className="py-3 px-3 font-mono text-indigo-300">{comp.valuationOrFunding}</td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {comp.keyFeatures.map((f, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-rose-300">{comp.vulnerability}</td>
                          <td className="py-3 px-3 font-mono text-slate-400">{comp.pricingModel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Online Sentiment & Early Adopters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Sentiment */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                  <span className="font-mono text-emerald-400 font-bold uppercase text-[11px]">
                    Online Discussion Sentiment Analysis
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-emerald-400">Positive: {selectedVenture.marketResearch.onlineSentiment.positiveMentionsPct}%</span>
                        <span className="text-rose-400">Complaints: {selectedVenture.marketResearch.onlineSentiment.negativeComplaintsPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${selectedVenture.marketResearch.onlineSentiment.positiveMentionsPct}%` }}
                          className="bg-emerald-500 h-full"
                        />
                        <div
                          style={{ width: `${selectedVenture.marketResearch.onlineSentiment.negativeComplaintsPct}%` }}
                          className="bg-rose-500 h-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Top Customer Pain Points:</span>
                    <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                      {selectedVenture.marketResearch.onlineSentiment.commonCustomerPainPoints.map((pain, i) => (
                        <li key={i}>{pain}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Early Adopters */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                  <span className="font-mono text-indigo-400 font-bold uppercase text-[11px]">
                    Target Early Adopter Archetypes
                  </span>
                  <div className="space-y-2.5">
                    {selectedVenture.marketResearch.earlyAdopterPersonas.map((persona, i) => (
                      <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200">{persona.role}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[10px]">
                            Urgency: {persona.urgencyLevel}
                          </span>
                        </div>
                        <p className="text-slate-400">{persona.archetype}</p>
                        <span className="text-indigo-400 font-mono text-[10px] block">
                          Where to find: {persona.whereToFindThem}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-slate-400">
              <TrendingUp className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">Market research stream has not run yet. Click "Launch 3-Stream Concurrent R&D".</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: STREAM 2 - UI/UX WIREFRAMES & MOCKUPS */}
      {/* ========================================================= */}
      {activeTab === 'ui_prototype' && (
        <div className="space-y-6">
          {selectedVenture?.uiMockups && selectedVenture.uiMockups.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: Variant Selector */}
              <div className="lg:col-span-1 space-y-3">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold">
                  Design Variants & Personas ({selectedVenture.uiMockups.length})
                </span>

                {selectedVenture.uiMockups.map((mockup) => {
                  const isSelected = selectedMockupId === mockup.id;
                  return (
                    <div
                      key={mockup.id}
                      onClick={() => setSelectedMockupId(mockup.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer text-xs space-y-2 ${
                        isSelected
                          ? 'bg-slate-900 border-indigo-500/60 shadow-md shadow-indigo-950/20'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-100">{mockup.themeName}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                          Score: {mockup.heuristicScore}/100
                        </span>
                      </div>
                      <span className="text-indigo-400 font-mono text-[10px] block">
                        Target: {mockup.targetPersona}
                      </span>
                      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                        {mockup.layoutDescription}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Interactive UI Wireframe Preview Canvas */}
              {activeMockup && (
                <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Live High-Fidelity UI Prototype Canvas</span>
                      <h3 className="text-sm font-bold text-slate-100">{activeMockup.themeName} • {activeMockup.targetPersona}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                      Design System: Tailwind UI / Next.js
                    </span>
                  </div>

                  {/* Rendered Mockup UI Canvas Frame */}
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-6 font-sans">
                    {activeMockup.previewUiElements.map((elem, idx) => {
                      if (elem.type === 'header') {
                        return (
                          <div key={idx} className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                            <span className="font-bold text-base text-indigo-400 tracking-tight">{elem.title}</span>
                            <span className="text-xs text-slate-400">{elem.content}</span>
                          </div>
                        );
                      }

                      if (elem.type === 'hero_cta') {
                        return (
                          <div key={idx} className="p-6 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-800/40 rounded-2xl text-center space-y-3">
                            <h2 className="text-lg font-bold text-slate-100">{elem.title}</h2>
                            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">{elem.subtitle}</p>
                            <button className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-950/40">
                              {elem.content}
                            </button>
                          </div>
                        );
                      }

                      if (elem.type === 'card_list' || elem.type === 'dashboard_widget') {
                        return (
                          <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                            <span className="font-bold text-slate-200 text-xs">{elem.title}</span>
                            {elem.subtitle && <span className="text-[10px] text-slate-500 block font-mono">{elem.subtitle}</span>}
                            <p className="text-slate-300 text-xs leading-relaxed">{elem.content}</p>
                          </div>
                        );
                      }

                      if (elem.type === 'pricing_table') {
                        return (
                          <div key={idx} className="p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-emerald-400 block">{elem.title}</span>
                              <span className="text-slate-400 text-[11px]">{elem.subtitle}</span>
                            </div>
                            <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg">{elem.content}</span>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-slate-400">
              <Monitor className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">UI/UX prototyping stream has not run yet. Click "Launch 3-Stream Concurrent R&D".</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: STREAM 3 - FULL-STACK CODE & SELF-HEALING TESTS */}
      {/* ========================================================= */}
      {activeTab === 'fullstack_code' && (
        <div className="space-y-6">
          {selectedVenture?.fullStackPrototype ? (
            <div className="space-y-6">
              {/* Tech Stack Banner */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Frontend</span>
                  <span className="text-indigo-400 font-bold">{selectedVenture.fullStackPrototype.techStack.frontend}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Backend API</span>
                  <span className="text-emerald-400 font-bold">{selectedVenture.fullStackPrototype.techStack.backend}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Database</span>
                  <span className="text-teal-400 font-bold">{selectedVenture.fullStackPrototype.techStack.database}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Auth & Security</span>
                  <span className="text-amber-400 font-bold">{selectedVenture.fullStackPrototype.techStack.auth}</span>
                </div>
              </div>

              {/* Code Tabs */}
              <div className="flex border-b border-slate-800 space-x-2 text-xs font-mono">
                {[
                  { id: 'frontend', label: 'Next.js Frontend (React/TS)' },
                  { id: 'backend', label: 'FastAPI Backend (Python)' },
                  { id: 'database', label: 'Supabase PostgreSQL Schema' },
                  { id: 'spec', label: 'Technical Spec' },
                  { id: 'tests', label: `Test Suite (${selectedVenture.fullStackPrototype.testSuite.length} Passes)` },
                ].map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => setCodeTab(ct.id as any)}
                    className={`px-3 py-2 border-b-2 font-medium transition ${
                      codeTab === ct.id
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>

              {/* Code Display Area */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl font-mono text-xs space-y-3">
                {codeTab === 'frontend' && (
                  <pre className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 overflow-x-auto leading-relaxed max-h-[500px]">
                    {selectedVenture.fullStackPrototype.frontendCode}
                  </pre>
                )}

                {codeTab === 'backend' && (
                  <pre className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 overflow-x-auto leading-relaxed max-h-[500px]">
                    {selectedVenture.fullStackPrototype.backendCode}
                  </pre>
                )}

                {codeTab === 'database' && (
                  <pre className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 overflow-x-auto leading-relaxed max-h-[500px]">
                    {selectedVenture.fullStackPrototype.databaseSchemaSql}
                  </pre>
                )}

                {codeTab === 'spec' && (
                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 space-y-2 font-sans text-xs leading-relaxed">
                    <span className="font-bold text-indigo-400 block font-mono">ARCHITECTURAL SPECIFICATION:</span>
                    <p>{selectedVenture.fullStackPrototype.technicalSpecification}</p>
                  </div>
                )}

                {codeTab === 'tests' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedVenture.fullStackPrototype.testSuite.map((test, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-slate-200">{test.name}</span>
                          </div>
                          <span className="text-slate-500 font-mono text-[10px]">{test.durationMs}ms</span>
                        </div>
                      ))}
                    </div>

                    {selectedVenture.fullStackPrototype.selfHealingLogs && (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-1 text-[11px]">
                        <span className="font-bold text-emerald-400 font-mono block">Self-Healing Bug Loop:</span>
                        {selectedVenture.fullStackPrototype.selfHealingLogs.map((log, i) => (
                          <div key={i} className="text-slate-300">
                            • Attempt #{log.attempt}: Detected "{log.detectedBug}" → Auto-patched and resolved successfully.
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-slate-400">
              <Code className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">Full-stack code generation stream has not run yet. Click "Launch 3-Stream Concurrent R&D".</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: PERSONA VALIDATION & PIVOTS */}
      {/* ========================================================= */}
      {activeTab === 'validation' && (
        <div className="space-y-6">
          {selectedVenture?.personaValidation && selectedVenture.personaValidation.length > 0 ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <span className="text-xs font-mono text-slate-400">
                  Simulated Target User Interactions (VLM Usability & Value Prop Evaluation)
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Avg. WTP: ${Math.round(selectedVenture.personaValidation.reduce((a, b) => a + b.willingnessToPayUsdPerMonth, 0) / selectedVenture.personaValidation.length)}/mo
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {selectedVenture.personaValidation.map((persona) => (
                  <div
                    key={persona.personaId}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-100">{persona.personaName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{persona.role}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono font-bold text-[10px]">
                        {persona.overallImpression}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-[10px]">
                      <div>
                        <span className="text-slate-500 block">Usability</span>
                        <span className="text-emerald-400 font-bold">{persona.usabilityRating}/5.0</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Value Prop</span>
                        <span className="text-indigo-400 font-bold">{persona.valuePropClarityRating}/5.0</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">WTP</span>
                        <span className="text-teal-300 font-bold">${persona.willingnessToPayUsdPerMonth}/mo</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl italic text-slate-300 text-[11px] leading-relaxed">
                      "{persona.verbatimQuote}"
                    </div>

                    <div className="text-[10px] font-mono text-amber-300 flex items-center space-x-1.5">
                      <Flame className="w-3.5 h-3.5 shrink-0" />
                      <span>Suggested pivot/feature: {persona.suggestedFeatureOrPivot}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">Persona validation has not run yet. Click "Validate & Package".</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: VIABILITY PACKAGE & ROI MODEL */}
      {/* ========================================================= */}
      {activeTab === 'viability_dossier' && (
        <div className="space-y-6">
          {selectedVenture?.viabilityPackage ? (
            <div className="space-y-6">
              {/* Executive Decision Banner */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        selectedVenture.viabilityPackage.recommendation === 'GO'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      EXECUTIVE DECISION: {selectedVenture.viabilityPackage.recommendation}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Break-Even: {selectedVenture.viabilityPackage.breakEvenTimelineMonths} Months
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{selectedVenture.viabilityPackage.ventureName}</h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {selectedVenture.viabilityPackage.executiveSummary}
                  </p>
                </div>

                <div className="text-center p-5 bg-slate-950 border border-slate-800 rounded-2xl shrink-0 w-full md:w-48 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Viability Index</span>
                  <span className="text-4xl font-mono font-bold text-emerald-400">
                    {selectedVenture.viabilityPackage.overallViabilityScore}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    18M ROI: +{selectedVenture.viabilityPackage.projectedRoiPercentage18Months}%
                  </span>
                </div>
              </div>

              {/* 18-Month Financial Projection Model Table */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                    18-Month Financial Model & Cash Flow Trajectory
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Unit Economics Extrapolated</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                        <th className="py-2.5 px-3">Timeline</th>
                        <th className="py-2.5 px-3">Projected Users / Units</th>
                        <th className="py-2.5 px-3">Monthly Recurring Rev (MRR)</th>
                        <th className="py-2.5 px-3">OpEx Costs</th>
                        <th className="py-2.5 px-3">Net Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                      {selectedVenture.viabilityPackage.financialProjections.map((fp, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/60 transition">
                          <td className="py-3 px-3 font-bold text-indigo-300">Month {fp.month}</td>
                          <td className="py-3 px-3">{(fp.projectedUsers).toLocaleString()}</td>
                          <td className="py-3 px-3 text-emerald-400 font-bold">${(fp.mrrUsd).toLocaleString()}</td>
                          <td className="py-3 px-3 text-rose-400">${(fp.operationalCostsUsd).toLocaleString()}</td>
                          <td className={`py-3 px-3 font-bold ${fp.netProfitUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ${(fp.netProfitUsd).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Milestones & Export Action */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-indigo-400 font-bold uppercase">
                    Execution Milestones & Next Steps
                  </span>
                  <button
                    onClick={() => {
                      if (onRequestApproval) {
                        onRequestApproval({
                          summary: `Export & Publish Viability Dossier for ${selectedVenture.viabilityPackage?.ventureName}`,
                          moduleName: 'idea_incubator',
                          payload: selectedVenture.viabilityPackage,
                        });
                      }
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Viability Package PDF</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedVenture.viabilityPackage.keyMilestones.map((m, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-slate-300">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">Viability package has not been generated yet. Click "Validate & Package".</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
