import React, { useState, useEffect } from 'react';
import {
  Globe,
  Terminal,
  Play,
  Eye,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UploadCloud,
  Layers,
  ArrowRight,
  RefreshCw,
  Lock,
  Download,
  Database,
  ExternalLink,
  Cpu,
  Smartphone,
  Server,
  Code,
  Sliders,
} from 'lucide-react';
import {
  BrowserSessionInstance,
  BrowserAutonomousSession,
  BrowserNavigationStep,
  FormAutoFillMapping,
  InterceptedFormSubmission,
  WebScrapingJob,
} from '../../types';

interface BrowserAgentViewProps {
  onRequestApproval?: (summary: string, moduleName: string) => void;
}

export const BrowserAgentView: React.FC<BrowserAgentViewProps> = ({ onRequestApproval }) => {
  const [activeTab, setActiveTab] = useState<'navigation' | 'forms' | 'interceptor' | 'scraper' | 'pool'>('navigation');

  // State
  const [instances, setInstances] = useState<BrowserSessionInstance[]>([]);
  const [session, setSession] = useState<BrowserAutonomousSession | null>(null);
  const [formMapping, setFormMapping] = useState<FormAutoFillMapping | null>(null);
  const [submissions, setSubmissions] = useState<InterceptedFormSubmission[]>([]);
  const [scrapingJobs, setScrapingJobs] = useState<WebScrapingJob[]>([]);

  // Goal Launcher Form
  const [goalPrompt, setGoalPrompt] = useState<string>('Find the submission portal for the Neuromorphic AI Hackathon, accept cookie consent, fill the abstract form, and prepare submission.');
  const [targetUrl, setTargetUrl] = useState<string>('https://devpost.com/competitions/neuromorphic-2026/submit');
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(3); // 0-indexed for 4th step

  const fetchData = async () => {
    try {
      const [instRes, sessRes, mapRes, subRes, scrapRes] = await Promise.all([
        fetch('/api/browser/instances').then((r) => r.json()),
        fetch('/api/browser/session').then((r) => r.json()),
        fetch('/api/browser/form-mapping').then((r) => r.json()),
        fetch('/api/browser/submissions').then((r) => r.json()),
        fetch('/api/browser/scraping').then((r) => r.json()),
      ]);

      if (instRes.instances) setInstances(instRes.instances);
      if (sessRes.session) {
        setSession(sessRes.session);
        setSelectedStepIndex(sessRes.session.steps.length - 1);
      }
      if (mapRes.mapping) setFormMapping(mapRes.mapping);
      if (subRes.submissions) setSubmissions(subRes.submissions);
      if (scrapRes.jobs) setScrapingJobs(scrapRes.jobs);
    } catch (err) {
      console.warn('Could not load Browser Agent data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLaunchGoal = async () => {
    setIsLaunching(true);
    try {
      const res = await fetch('/api/browser/session/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalPrompt, targetUrl }),
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setSelectedStepIndex(data.session.steps.length - 1);
      }
    } catch (err) {
      console.error('Launch goal failed:', err);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const res = await fetch('/api/browser/submissions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      const data = await res.json();
      if (data.submission) {
        setSubmissions((prev) =>
          prev.map((s) => (s.submissionId === submissionId ? data.submission : s))
        );
        fetchData();
      }
    } catch (err) {
      console.error('Approve submission failed:', err);
    }
  };

  const currentStep = session?.steps[selectedStepIndex] || session?.steps[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold tracking-wide">
              MODULE 13
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Playwright Stealth Actuator & Vision-Language Model (VLM) Loop
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mt-1 tracking-tight flex items-center gap-2.5">
            Browser Agent
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-normal font-mono border border-slate-700">
              Stealth Context Engine
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Human In-the-Loop Interceptor Active
          </span>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-3">
        {[
          { id: 'navigation', label: 'Autonomous VLM Navigation Studio', icon: Globe },
          { id: 'forms', label: 'Intelligent Form Mapping & Synonyms', icon: Sliders },
          { id: 'interceptor', label: 'Human Approval Submission Interceptor', icon: ShieldCheck },
          { id: 'scraper', label: 'Structured Web Scraper & HAR Logs', icon: Database },
          { id: 'pool', label: 'Browser Instance Pool & Stealth', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-500'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: AUTONOMOUS VLM NAVIGATION STUDIO */}
      {activeTab === 'navigation' && (
        <div className="space-y-6">
          {/* Goal Launcher Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Autonomous Goal Dispatcher
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-4">
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="Target URL..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="lg:col-span-6">
                <input
                  type="text"
                  value={goalPrompt}
                  onChange={(e) => setGoalPrompt(e.target.value)}
                  placeholder="Goal (e.g. Find submit button, fill form, prepare review)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
              <div className="lg:col-span-2">
                <button
                  onClick={handleLaunchGoal}
                  disabled={isLaunching}
                  className="w-full h-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLaunching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Navigating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      Launch Goal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Dual Column: Step Execution Pipeline + Live Viewport Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Step Sequence & VLM Rationale */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  VLM Action Sequence ({session?.steps.length || 0} Steps)
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Status: {session?.status}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {session?.steps.map((step, idx) => (
                  <button
                    key={step.stepNumber}
                    onClick={() => setSelectedStepIndex(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedStepIndex === idx
                        ? 'bg-emerald-950/40 border-emerald-600/60 text-slate-100'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                        Step {step.stepNumber}: {step.actionType}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{step.latencyMs}ms</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 mt-2">{step.targetDescription}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {step.vlmRationale}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-800/60">
                      <span className="truncate max-w-[200px]">{step.targetSelector}</span>
                      <span
                        className={
                          step.executionStatus === 'success'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }
                      >
                        {step.executionStatus}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Viewport Screenshot & DOM Inspector */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    Playwright Headless Viewport Capture
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Step {currentStep?.stepNumber}: {currentStep?.targetDescription}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">1920x1080 Stealth Canvas</span>
              </div>

              {/* Viewport Frame */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
                <img
                  src={currentStep?.screenshotUrl || session?.currentScreenshotUrl}
                  alt="Browser Viewport"
                  className="w-full h-64 object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-emerald-300">
                  Target: {currentStep?.targetSelector}
                </div>
              </div>

              {/* VLM Rationale & Serialized DOM Tree */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">VLM Reasoning & Visual Grounding:</span>
                  <p className="text-slate-300 font-sans text-xs">{currentStep?.vlmRationale}</p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Serialized DOM Tree Segment:</span>
                  <pre className="text-[11px] text-indigo-300/90 whitespace-pre-wrap overflow-x-auto max-h-24">
                    {currentStep?.domTreeSummary || session?.liveDomSummary}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTELLIGENT FORM MAPPING */}
      {activeTab === 'forms' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">{formMapping?.formTitle}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{formMapping?.targetUrl}</p>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {formMapping?.totalFieldsCount} Fields Auto-Mapped (100%)
                </span>
                <span className="text-slate-400">Fuzzy Matching: Active</span>
              </div>
            </div>

            {/* Field Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                    <th className="pb-3">Form Field Label</th>
                    <th className="pb-3">Inferred Type</th>
                    <th className="pb-3">Matched Payload Key</th>
                    <th className="pb-3">Confidence</th>
                    <th className="pb-3">Proposed Value</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {formMapping?.detectedFields.map((field) => (
                    <tr key={field.fieldId} className="hover:bg-slate-950/40">
                      <td className="py-3.5 font-sans font-bold text-slate-200">{field.label}</td>
                      <td className="py-3.5 text-indigo-400">{field.inferredType}</td>
                      <td className="py-3.5 text-slate-300">{field.matchedPayloadKey}</td>
                      <td className="py-3.5 text-emerald-400 font-bold">{field.fuzzyConfidencePct}%</td>
                      <td className="py-3.5 text-slate-400 font-sans max-w-xs truncate">{field.proposedValue}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                          Filled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Event-driven DOM Mutation Handling Notice */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                Dynamic Mutation & Conditional Logic Engine
              </span>
              <p className="text-slate-400 leading-relaxed">
                When conditional selections occur (e.g. "Human Subjects Required" toggled), the agent pauses, attaches a MutationObserver to listen for new DOM elements, re-evaluates newly revealed child fields, and fuzzy-maps data payload values before submission.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HUMAN APPROVAL INTERCEPTOR */}
      {activeTab === 'interceptor' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-2xl flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-amber-200">Irreversible Action Protection</h4>
                <p className="text-amber-300/80 mt-0.5">
                  All external form submissions, competition entries, and grant uploads are strictly halted prior to clicking the submit button. Review payload and screenshot below to authorize dispatch.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-amber-900/60 text-amber-300 font-mono text-[10px] uppercase font-bold border border-amber-700">
              Zero Autonomous Submission
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {submissions.map((sub) => (
              <div
                key={sub.submissionId}
                className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs font-sans"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      INTERCEPTED SUBMISSION REQUEST
                    </span>
                    <h3 className="text-base font-bold text-slate-100">{sub.formName}</h3>
                    <p className="text-[11px] font-mono text-indigo-400 mt-0.5">{sub.targetActionUrl}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        sub.approvalStatus === 'submitted'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {sub.approvalStatus === 'submitted'
                        ? `Submitted (${sub.confirmationNumber})`
                        : 'Awaiting User Authorization'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Final Viewport Screenshot */}
                  <div className="space-y-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Pre-Submission Viewport Evidence
                    </span>
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img
                        src={sub.finalScreenshotUrl}
                        alt="Filled Form"
                        className="w-full h-52 object-cover object-top"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Filled Key-Value Payload */}
                  <div className="space-y-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Structured Field-Value Pairs
                    </span>
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs max-h-52 overflow-y-auto">
                      {Object.entries(sub.filledPayload).map(([k, v]) => (
                        <div key={k} className="border-b border-slate-800/60 pb-1.5">
                          <span className="text-indigo-400 font-bold">{k}: </span>
                          <span className="text-slate-300">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {sub.approvalStatus !== 'submitted' ? (
                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleApproveSubmission(sub.submissionId)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Approve & Click Final Submit Button
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl flex items-center justify-between text-emerald-300 font-mono text-xs">
                    <span>Confirmation Token: {sub.confirmationNumber}</span>
                    <span>Dispatched at: {new Date(sub.submittedAt || '').toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STRUCTURED SCRAPER & HAR LOGS */}
      {activeTab === 'scraper' && (
        <div className="space-y-6">
          {scrapingJobs.map((job) => (
            <div
              key={job.jobId}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs font-sans"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{job.title}</h3>
                  <p className="text-xs text-indigo-400 font-mono mt-0.5">{job.targetUrl}</p>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                    {job.totalRecordsExtracted} Records Extracted
                  </span>
                  <span className="text-slate-400 text-[11px]">HAR Logs: Stored</span>
                </div>
              </div>

              {/* Scraped Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="pb-2.5">Model / Framework</th>
                      <th className="pb-2.5">Top-1 Accuracy</th>
                      <th className="pb-2.5">Energy (pJ / Op)</th>
                      <th className="pb-2.5">Software Framework</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {job.scrapedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/40">
                        <td className="py-2.5 text-slate-200 font-bold">{item.model}</td>
                        <td className="py-2.5 text-emerald-400">{item.top1_acc}</td>
                        <td className="py-2.5 text-indigo-300 font-bold">{item.energy_pj}</td>
                        <td className="py-2.5 text-slate-400">{item.framework}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* JSON Export Preview */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Exported JSON Payload:</span>
                  <button className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Download JSON
                  </button>
                </div>
                <pre className="text-[11px] text-slate-300/80">{job.exportedJsonPreview}</pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: BROWSER INSTANCE POOL */}
      {activeTab === 'pool' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {instances.map((inst) => (
              <div
                key={inst.instanceId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs font-sans"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-100 font-mono">{inst.instanceId}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      inst.status === 'idle'
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {inst.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">CURRENT URL</span>
                    <span className="text-indigo-300 truncate block">{inst.currentUrl}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">PROXY REGION</span>
                      <span className="text-slate-300">{inst.proxyRegion}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">MEMORY / UPTIME</span>
                      <span className="text-slate-300">
                        {inst.memoryUsageMb} MB • {Math.round(inst.uptimeSeconds / 60)}m
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-500 block text-[10px]">ACTIVE COOKIES</span>
                    <span className="text-emerald-400 font-bold">{inst.activeCookiesCount} Preserved</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-[10px] text-slate-400 font-mono">
                  <span>Stealth Patches: Active</span>
                  <button className="text-rose-400 hover:text-rose-300 cursor-pointer">
                    Recycle Context
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
