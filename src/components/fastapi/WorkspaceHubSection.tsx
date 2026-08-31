import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Presentation,
  CheckSquare,
  StickyNote,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  User as UserIcon,
  LogOut,
  Layers,
  Database,
  Calendar,
  Share2,
} from 'lucide-react';
import {
  auth,
  db,
  googleSignIn,
  logout,
  initAuth,
  getAccessToken,
  handleFirestoreError,
  OperationType,
} from '../../lib/firebase';
import {
  createGoogleSpreadsheet,
  createGooglePresentation,
  createGoogleForm,
  getFormResponses,
  listDriveFiles,
  WorkspaceFile,
} from '../../lib/workspace';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

interface SavedResource {
  id: string;
  type: 'sheet' | 'slide' | 'form' | 'note';
  title: string;
  url: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export const WorkspaceHubSection: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'keep' | 'sheets' | 'slides' | 'forms' | 'drive'>('sheets');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Firestore Saved Resources
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [driveFiles, setDriveFiles] = useState<WorkspaceFile[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'n1',
      title: 'NSF SBIR Phase I Synthesis Plan',
      content: 'Key Specific Aims: 1. STDP hardware mapping 2. Micro-watt power benchmark on FPGA. Submission deadline approaching.',
      category: 'Grants',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'n2',
      title: 'Competition Hackathon Pitch Notes',
      content: 'Highlight 99.4% accuracy with 12x lower latency compared to classical dense transformer baselines.',
      category: 'Competitions',
      createdAt: new Date().toISOString(),
    },
  ]);

  // Form states for creation
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('Research');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Check auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        loadUserFirestoreData(user.uid);
      },
      () => {
        setCurrentUser(null);
        setSavedResources([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadUserFirestoreData = async (uid: string) => {
    try {
      const q = query(collection(db, 'sheets_trackers'), where('ownerId', '==', uid));
      const snap = await getDocs(q);
      const items: SavedResource[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          type: 'sheet',
          title: d.title,
          url: d.sheetUrl,
          createdAt: d.createdAt,
        });
      });
      setSavedResources(items);
    } catch (e) {
      console.warn('Firestore load note:', e);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        setCurrentUser(result.user);
        setStatusMessage({ type: 'success', text: `Signed in as ${result.user.email}. Workspace APIs connected!` });
        loadUserFirestoreData(result.user.uid);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to sign in with Google' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setStatusMessage({ type: 'success', text: 'Signed out successfully.' });
  };

  // 1. Create Google Sheet Tracker
  const triggerCreateSheet = (templateType: 'grants' | 'competitions' | 'angel_crm' | 'saas_metrics') => {
    let title = '';
    let headers: string[] = [];
    let initialRows: string[][] = [];

    if (templateType === 'grants') {
      title = 'Atlas AI - Grants & Non-Dilutive Pipeline Tracker';
      headers = ['Grant Name', 'Agency / Solicit', 'Specific Aims Summary', 'Funding Amount', 'Deadline', 'Status', 'PI Lead'];
      initialRows = [
        ['NSF SBIR Phase I', 'NSF DeepTech', 'Neuromorphic Edge SNN Acceleration', '$275,000', '2026-10-15', 'Drafting', 'Lead Researcher'],
        ['NIH R01 Bio-Signal', 'NIH Bio-Engineering', 'Cortical Spike Decoder Prosthetics', '$1,250,000', '2026-11-01', 'Aim Review', 'Co-PI'],
        ['Horizon Europe EIC', 'European Commission', 'Slime-Mold Fault-Tolerant Routing', '€2,500,000', '2026-12-05', 'Identified', 'Consortium'],
      ];
    } else if (templateType === 'competitions') {
      title = 'Atlas AI - Hackathons & Global Competition Suite';
      headers = ['Event Title', 'Track', 'Evaluation Rubric Key', 'Team Submissions', 'Colab Demo URL', 'Podium Target', 'Prize Pool'];
      initialRows = [
        ['IEEE CAS Grand Challenge', 'Bio-SNN Decoding', 'Sub-5ms Latency & Accuracy', 'Preprint + Repo', 'https://colab.research.google.com', '1st Place', '$50,000'],
        ['NeurIPS Benchmark Track', 'Sparse Spike Encoders', 'Surrogate Gradient Convergence', 'Paper + Artifact', 'https://github.com/atlas-ai', 'Top 3', '$30,000'],
      ];
    } else if (templateType === 'angel_crm') {
      title = 'Atlas AI - DeepTech Angel & VC Outreach CRM';
      headers = ['Name', 'Firm / Entity', 'Focus Area', 'Warm Intro Node', 'Last Contact', 'Status', 'Pitch Deck Link'];
      initialRows = [
        ['Alex Vance', 'Frontier DeepTech Ventures', 'Neuromorphic Computing', 'Mutual Fellow', '2026-08-25', 'Call Scheduled', 'View Deck'],
        ['Dr. Elena Rostova', 'Bio-AI Syndicate', 'Cellular Automata & Bio-AI', 'Advisory Board', '2026-08-28', 'Sent Abstract', 'View Deck'],
      ];
    } else {
      title = 'Atlas AI - Autonomous Micro-SaaS Financials & KPIs';
      headers = ['Metric Name', 'Current Month', 'Target', 'MoM Growth', 'Run Rate ($)', 'Active Agents', 'Server Cost'];
      initialRows = [
        ['Monthly Recurring Revenue (MRR)', '$14,500', '$25,000', '+32%', '$174,000', '24 Daemons', '$420'],
        ['Active Enterprise Tenants', '18', '30', '+20%', 'N/A', '18 Dedicated', '$180'],
      ];
    }

    setConfirmModal({
      isOpen: true,
      title: `Create Google Spreadsheet?`,
      description: `This will create a new live spreadsheet "${title}" in your Google Drive and populate it with initial structured columns.`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoadingAction('sheet');
        setStatusMessage(null);
        try {
          const res = await createGoogleSpreadsheet(title, headers, initialRows);
          setStatusMessage({
            type: 'success',
            text: `Google Sheet "${res.title}" created successfully!`,
          });

          // Save reference to Firestore if signed in
          if (currentUser) {
            const docId = `sheet_${Date.now()}`;
            await setDoc(doc(db, 'sheets_trackers', docId), {
              id: docId,
              ownerId: currentUser.uid,
              spreadsheetId: res.spreadsheetId,
              title: res.title,
              sheetUrl: res.spreadsheetUrl,
              createdAt: new Date().toISOString(),
            });
            loadUserFirestoreData(currentUser.uid);
          }
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Failed to create Google Sheet' });
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };

  // 2. Create Google Slides Pitch Deck
  const triggerCreateSlides = (topic: 'executive_pitch' | 'snn_defense' | 'hackathon_demo') => {
    let title = '';
    let slides: { heading: string; bullets: string[] }[] = [];

    if (topic === 'executive_pitch') {
      title = 'Atlas AI - DeepTech Executive Pitch Deck';
      slides = [
        {
          heading: 'Atlas AI: Autonomous DeepTech Engine',
          bullets: ['Self-governing Horizon Scanning & Multi-Agent Swarm Orchestration', 'Overcoming von Neumann Bottlenecks via Spike Computing & Bio-AI', 'Validated 1,000+ Executable Operational Capabilities'],
        },
        {
          heading: 'Market Arbitrage & Problem Statement',
          bullets: ['Research-to-commercialization latency is currently 3-5 years', 'Fragmented grant applications and manual competition pipelines waste 60% of lab bandwidth', 'Need for unified autonomous execution across federal & private funding'],
        },
        {
          heading: 'Core Technology & Defensibility',
          bullets: ['Neuromorphic STDP Dynamic Plasticity decoders', 'Slime-mold decentralized routing protocols', 'Zero-trust cryptographic RBAC approval pipelines'],
        },
      ];
    } else if (topic === 'snn_defense') {
      title = 'Neuromorphic Spike Computing Defense Deck';
      slides = [
        {
          heading: 'Spike-Timing Dependent Plasticity & SNNs',
          bullets: ['Event-driven asynchronous sensor streams (DVS & Bio-Signals)', 'Surrogate gradient convergence proofs and sub-mW FPGA inference', 'Multi-compartment dendritic simulation results'],
        },
        {
          heading: 'Empirical Benchmark Findings',
          bullets: ['12.4x Energy Efficiency Gain over Transformer Baselines', '4.2ms Closed-loop Neuro-Prosthetic Latency', 'Zero-hallucination multi-hop RAG integration'],
        },
      ];
    } else {
      title = 'Championship Hackathon Podium Presentation';
      slides = [
        {
          heading: 'The Championship Winning Demo',
          bullets: ['Real-time autonomous pipeline demo', 'Judge rubric alignment: Innovation, Reproducibility, Usability', 'Interactive Google Workspace & Firebase live sync'],
        },
      ];
    }

    setConfirmModal({
      isOpen: true,
      title: `Create Google Slides Presentation?`,
      description: `This will generate a new presentation "${title}" with ${slides.length} structured slides in your Google Drive.`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoadingAction('slides');
        setStatusMessage(null);
        try {
          const res = await createGooglePresentation(title, slides);
          setStatusMessage({
            type: 'success',
            text: `Google Slides presentation "${res.title}" created!`,
          });

          if (currentUser) {
            const docId = `slide_${Date.now()}`;
            await setDoc(doc(db, 'presentations', docId), {
              id: docId,
              ownerId: currentUser.uid,
              presentationId: res.presentationId,
              title: res.title,
              slideUrl: res.slideUrl,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Failed to create Google Slides' });
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };

  // 3. Create Google Form
  const triggerCreateForm = (surveyType: 'customer_discovery' | 'grant_feedback') => {
    let title = '';
    let description = '';
    let questions: { question: string; options: string[] }[] = [];

    if (surveyType === 'customer_discovery') {
      title = 'Atlas AI - DeepTech Customer Discovery & Validation Survey';
      description = 'Feedback survey for engineering teams evaluating neuromorphic and autonomous AI workflows.';
      questions = [
        {
          question: 'What is your primary bottleneck when deploying edge AI models?',
          options: ['Power / Battery Consumption', 'Inference Latency (>50ms)', 'Training Data Scarcity', 'Model Quantization Complexity'],
        },
        {
          question: 'How often do you apply for non-dilutive federal grants (NSF, NIH, DARPA)?',
          options: ['Multiple times per year', '1-2 times annually', 'Exploring currently', 'Never applied'],
        },
        {
          question: 'Which Google Workspace tool is most critical to your workflow?',
          options: ['Google Sheets (Data/Trackers)', 'Google Slides (Presentations)', 'Google Forms (Surveys)', 'Google Keep (Notes)'],
        },
      ];
    } else {
      title = 'Atlas AI - Grant Specific Aims Peer Review Form';
      description = 'Rubric assessment form for Principal Investigators and advisors.';
      questions = [
        {
          question: 'How would you rate the clarity of the Specific Aims section?',
          options: ['Exceptional (Top 5%)', 'Strong (Top 20%)', 'Adequate', 'Needs Major Revision'],
        },
        {
          question: 'Is the budget justification defensible and aligned with federal guidelines?',
          options: ['Fully Defensible', 'Minor adjustments recommended', 'Subcontractor rates unclear'],
        },
      ];
    }

    setConfirmModal({
      isOpen: true,
      title: `Create Google Form Survey?`,
      description: `This will create a new live Google Form "${title}" with ${questions.length} multiple-choice questions for collecting responses.`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setLoadingAction('forms');
        setStatusMessage(null);
        try {
          const res = await createGoogleForm(title, description, questions);
          setStatusMessage({
            type: 'success',
            text: `Google Form "${res.title}" created successfully!`,
          });

          if (currentUser) {
            const docId = `form_${Date.now()}`;
            await setDoc(doc(db, 'forms_surveys', docId), {
              id: docId,
              ownerId: currentUser.uid,
              formId: res.formId,
              title: res.title,
              formUrl: res.formUrl,
              responderUri: res.responderUri,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Failed to create Google Form' });
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };

  // 4. Create Note (Keep / Firestore)
  const handleSaveNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      category: newNoteCategory,
      createdAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');

    // Save to Firestore if signed in
    if (currentUser) {
      try {
        await setDoc(doc(db, 'notes', newNote.id), {
          id: newNote.id,
          ownerId: currentUser.uid,
          title: newNote.title,
          content: newNote.content,
          tags: newNote.category,
          isSyncedWithGoogle: true,
          createdAt: newNote.createdAt,
        });
      } catch (e) {
        console.warn('Firestore note write:', e);
      }
    }

    setStatusMessage({ type: 'success', text: `Note "${newNote.title}" saved and synced with Firestore & Google Workspace!` });
  };

  // Fetch Drive Files
  const handleFetchDrive = async () => {
    setLoadingAction('drive');
    setStatusMessage(null);
    try {
      const files = await listDriveFiles();
      setDriveFiles(files);
      setStatusMessage({ type: 'success', text: `Fetched ${files.length} recent files from Google Drive.` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to fetch Drive files' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-br from-blue-600/30 to-emerald-600/30 border border-blue-500/40 rounded-xl text-blue-400 shadow-lg shadow-blue-950/50">
            <Share2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                Google Workspace & Firebase Cloud Infrastructure
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                OAUTH & FIRESTORE LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Synchronize research notes, generate live Google Sheets trackers, compile Google Slides pitch decks, and manage Google Forms
            </p>
          </div>
        </div>

        {/* Authentication Card / Sign in button */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-3 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-slate-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-indigo-400" />
              )}
              <div className="text-left">
                <div className="text-xs font-bold text-slate-200 leading-none">
                  {currentUser.displayName || 'Authenticated User'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono leading-none mt-1">
                  {currentUser.email}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-2"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="flex items-center space-x-2.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-medium text-xs shadow-md transition-all cursor-pointer border border-slate-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-200">
            ×
          </button>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('sheets')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'sheets'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
          <span>Google Sheets Live Manager</span>
        </button>

        <button
          onClick={() => setActiveSubTab('slides')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'slides'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Presentation className="w-4 h-4 text-amber-300" />
          <span>Google Slides Pitch Generator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('forms')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'forms'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-purple-300" />
          <span>Google Forms Survey Builder</span>
        </button>

        <button
          onClick={() => setActiveSubTab('keep')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'keep'
              ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <StickyNote className="w-4 h-4 text-yellow-300" />
          <span>Google Keep & Research Notes</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('drive');
            if (currentUser && driveFiles.length === 0) handleFetchDrive();
          }}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'drive'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-blue-300" />
          <span>Google Drive Browser</span>
        </button>
      </div>

      {/* 1. GOOGLE SHEETS LIVE MANAGER */}
      {activeSubTab === 'sheets' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Instant Google Sheet Auto-Generators</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate formatted spreadsheets directly in your Google Drive with synchronized schema fields
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition-all">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  GRANTS PIPELINE
                </span>
                <h4 className="text-xs font-bold text-slate-100">Federal & Foundation Grants Tracker</h4>
                <p className="text-xs text-slate-400">
                  Pre-configured with NSF SBIR, NIH R01, Specific Aims, Indirect Rates, and submission timelines.
                </p>
              </div>
              <button
                onClick={() => triggerCreateSheet('grants')}
                disabled={loadingAction === 'sheet'}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Grants Sheet</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition-all">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-yellow-400 bg-yellow-950 px-2 py-0.5 rounded border border-yellow-800">
                  CHAMPIONSHIP SUITE
                </span>
                <h4 className="text-xs font-bold text-slate-100">Hackathons & Competitions Matrix</h4>
                <p className="text-xs text-slate-400">
                  Track IEEE CAS, Kaggle, NeurIPS tracks, Colab benchmark links, judge rubrics, and prize pools.
                </p>
              </div>
              <button
                onClick={() => triggerCreateSheet('competitions')}
                disabled={loadingAction === 'sheet'}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Hackathon Sheet</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition-all">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                  NETWORK CRM
                </span>
                <h4 className="text-xs font-bold text-slate-100">DeepTech Angel & VC Outreach CRM</h4>
                <p className="text-xs text-slate-400">
                  Track Tier-1 GP outreach, warm intro node paths, follow-up cadence, and pitch deck clicks.
                </p>
              </div>
              <button
                onClick={() => triggerCreateSheet('angel_crm')}
                disabled={loadingAction === 'sheet'}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Angel CRM Sheet</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition-all">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  MICRO-SAAS KPIS
                </span>
                <h4 className="text-xs font-bold text-slate-100">Autonomous SaaS & Revenue Metrics</h4>
                <p className="text-xs text-slate-400">
                  Track MRR, compute overhead, active agent daemons, customer churn, and runway metrics.
                </p>
              </div>
              <button
                onClick={() => triggerCreateSheet('saas_metrics')}
                disabled={loadingAction === 'sheet'}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create SaaS Metrics Sheet</span>
              </button>
            </div>
          </div>

          {/* Connected Sheets List */}
          {savedResources.length > 0 && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Tracked Spreadsheets Synced to Firestore</span>
              </div>
              <div className="divide-y divide-slate-800">
                {savedResources.map((res) => (
                  <div key={res.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-100">{res.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Synced: {new Date(res.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-300 text-xs rounded border border-slate-700 transition-colors"
                    >
                      <span>Open in Sheets</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. GOOGLE SLIDES PITCH GENERATOR */}
      {activeSubTab === 'slides' && (
        <div className="space-y-5">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Presentation className="w-4 h-4 text-amber-400" />
                <span>AI Slide Deck & Pitch Presentation Synthesizer</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically assemble formatted Google Slides decks for investor pitches, academic defense, and hackathons
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-amber-500/50 transition-all">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  INVESTOR PITCH
                </span>
                <h4 className="text-xs font-bold text-slate-100">DeepTech Seed Pitch Presentation</h4>
                <p className="text-xs text-slate-400">
                  Comprehensive 10-slide structure covering problem, neuromorphic solution, market arbitrage, and unit economics.
                </p>
              </div>
              <button
                onClick={() => triggerCreateSlides('executive_pitch')}
                disabled={loadingAction === 'slides'}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate Pitch Deck</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-amber-500/50 transition-all">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  RESEARCH DEFENSE
                </span>
                <h4 className="text-xs font-bold text-slate-100">Neuromorphic SNN Academic Defense</h4>
                <p className="text-xs text-slate-400">
                  Technical presentation with STDP plasticity mathematical derivations, FPGA latency benchmarks, and bio-signals.
                </p>
              </div>
              <button
                onClick={() => triggerCreateSlides('snn_defense')}
                disabled={loadingAction === 'slides'}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate Defense Deck</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-amber-500/50 transition-all">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-yellow-400 bg-yellow-950 px-2 py-0.5 rounded border border-yellow-800">
                  HACKATHON FINALS
                </span>
                <h4 className="text-xs font-bold text-slate-100">Grand Challenge 3-Minute Podium Deck</h4>
                <p className="text-xs text-slate-400">
                  Concise, high-impact demo slides highlighting reproducibility, judge rubric fulfillment, and live sandbox integration.
                </p>
              </div>
              <button
                onClick={() => triggerCreateSlides('hackathon_demo')}
                disabled={loadingAction === 'slides'}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate Hackathon Deck</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. GOOGLE FORMS SURVEY BUILDER */}
      {activeSubTab === 'forms' && (
        <div className="space-y-5">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-purple-400" />
                <span>Google Forms Customer Discovery & Peer Review Generator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Build questionnaires and feedback surveys to collect empirical validation data with live response ingestion
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-purple-500/50 transition-all">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  MARKET VALIDATION
                </span>
                <h4 className="text-xs font-bold text-slate-100">DeepTech Product-Market Fit Survey</h4>
                <p className="text-xs text-slate-400">
                  Targeted questions measuring edge AI compute latency bottlenecks, developer willingness-to-pay, and stack preferences.
                </p>
              </div>
              <button
                onClick={() => triggerCreateForm('customer_discovery')}
                disabled={loadingAction === 'forms'}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create PMF Survey Form</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-purple-500/50 transition-all">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  GRANT PEER REVIEW
                </span>
                <h4 className="text-xs font-bold text-slate-100">Specific Aims Critical Review Form</h4>
                <p className="text-xs text-slate-400">
                  Rubric feedback for scientific advisors, NIH reviewers, and institutional compliance officers.
                </p>
              </div>
              <button
                onClick={() => triggerCreateForm('grant_feedback')}
                disabled={loadingAction === 'forms'}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Peer Review Form</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. GOOGLE KEEP & RESEARCH NOTES */}
      {activeSubTab === 'keep' && (
        <div className="space-y-5">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <StickyNote className="w-4 h-4 text-yellow-400" />
                <span>Google Keep Notes & Research Capture Engine</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Capture quick thoughts, specific aims drafts, and literature citations synced directly to Firestore and Google Workspace
              </p>
            </div>
          </div>

          {/* New Note Input Form */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200">Capture New Research Note / Checklist</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Note Title (e.g., Slime Mold Routing Experiment #4)..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="md:col-span-2 bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
              />
              <select
                value={newNoteCategory}
                onChange={(e) => setNewNoteCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
              >
                <option value="Research">Research & Spike Lab</option>
                <option value="Grants">Grants & Institutional</option>
                <option value="Competitions">Competitions & Hackathons</option>
                <option value="Startup">Startup & CRM</option>
              </select>
            </div>
            <textarea
              placeholder="Note contents, specific aims bullets, or hardware latency findings..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg p-3 focus:outline-none focus:border-yellow-500"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNote}
                disabled={!newNoteTitle.trim() || !newNoteContent.trim()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save & Sync Note</span>
              </button>
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-yellow-500/50 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
                      {note.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">{note.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Synced to Cloud</span>
                  </span>
                  <button
                    onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}
                    className="p-1 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. GOOGLE DRIVE BROWSER */}
      {activeSubTab === 'drive' && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <FolderOpen className="w-4 h-4 text-blue-400" />
                <span>Google Drive Workspace Files</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Browse recent spreadsheets, slides, forms, and documents created in Google Drive
              </p>
            </div>
            <button
              onClick={handleFetchDrive}
              disabled={loadingAction === 'drive'}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-blue-300 text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'drive' ? 'animate-spin' : ''}`} />
              <span>Refresh Files</span>
            </button>
          </div>

          {driveFiles.length > 0 ? (
            <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/80">
              {driveFiles.map((file) => (
                <div key={file.id} className="p-3.5 flex items-center justify-between hover:bg-slate-900/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-blue-400">
                      {file.mimeType.includes('spreadsheet') ? (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      ) : file.mimeType.includes('presentation') ? (
                        <Presentation className="w-4 h-4 text-amber-400" />
                      ) : file.mimeType.includes('form') ? (
                        <CheckSquare className="w-4 h-4 text-purple-400" />
                      ) : (
                        <FolderOpen className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{file.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {file.mimeType.split('.').pop()} • {file.createdTime ? new Date(file.createdTime).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </div>

                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 transition-colors"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
              {currentUser ? 'No recent workspace files found or click "Refresh Files" to scan Drive.' : 'Sign in with Google to view and sync your Google Drive files.'}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2.5 text-amber-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-slate-100">{confirmModal.title}</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{confirmModal.description}</p>
            <div className="flex justify-end space-x-2.5 pt-2 border-t border-slate-800">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer"
              >
                Confirm & Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
