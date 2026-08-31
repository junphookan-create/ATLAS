import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  ApprovalRequest,
  ApprovalPolicy,
  Opportunity,
  Competition,
  GrantProposal,
  ResearchPaper,
  ResearchHypothesis,
  Contact,
  Campaign,
  SocialPost,
  KnowledgeNode,
  KnowledgeEdge,
  EmailMessage,
  CalendarEvent,
  WbsTask,
  SideHustleBlueprint,
  LeanCanvas,
  GCWState,
  MemoryChunk,
  User,
  UserSession,
} from '../types/index.js';

import {
  INITIAL_APPROVAL_REQUESTS,
  INITIAL_APPROVAL_POLICIES,
  INITIAL_OPPORTUNITIES,
  INITIAL_COMPETITIONS,
  INITIAL_GRANT_PROPOSALS,
  INITIAL_RESEARCH_PAPERS,
  INITIAL_HYPOTHESES,
  INITIAL_CONTACTS,
  INITIAL_CAMPAIGNS,
  INITIAL_SOCIAL_POSTS,
  INITIAL_KNOWLEDGE_NODES,
  INITIAL_KNOWLEDGE_EDGES,
  INITIAL_EMAILS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_WBS_TASKS,
  INITIAL_SIDE_HUSTLE_BLUEPRINTS,
  INITIAL_LEAN_CANVAS,
  INITIAL_GCW_STATE,
} from '../data/mockInitialData.js';

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Atlas Administrator',
    email: 'admin@atlas-ai.org',
    role: 'admin',
    tenantId: 'tenant-primary',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-approver',
    username: 'approver',
    name: 'Compliance Officer (HITL)',
    email: 'compliance@atlas-ai.org',
    role: 'approver',
    tenantId: 'tenant-primary',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-jun',
    username: 'jun',
    name: 'Dr. Jun Phookan',
    email: 'junphookan@gmail.com',
    role: 'researcher',
    tenantId: 'tenant-primary',
    createdAt: new Date().toISOString(),
  },
];

class MemoryStore {
  private dbPath: string;
  private approvals: ApprovalRequest[] = [];
  private policies: ApprovalPolicy[] = [...INITIAL_APPROVAL_POLICIES];
  private sseClients: Array<(data: any) => void> = [];
  private opportunities: Opportunity[] = [];
  private competitions: Competition[] = [];
  private grants: GrantProposal[] = [];
  private papers: ResearchPaper[] = [];
  private hypotheses: ResearchHypothesis[] = [];
  private contacts: Contact[] = [];
  private campaigns: Campaign[] = [];
  private posts: SocialPost[] = [];
  private nodes: KnowledgeNode[] = [];
  private edges: KnowledgeEdge[] = [];
  private emails: EmailMessage[] = [];
  private calendar: CalendarEvent[] = [];
  private tasks: WbsTask[] = [];
  private blueprints: SideHustleBlueprint[] = [];
  private leanCanvas: LeanCanvas = { ...INITIAL_LEAN_CANVAS };
  private gcwState: GCWState = { ...INITIAL_GCW_STATE };
  private users: User[] = [...DEFAULT_USERS];
  private sessions: Record<string, UserSession> = {};

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.warn('Could not create data directory, using in-memory store fallback:', err);
      }
    }
    this.dbPath = path.join(dataDir, 'db.json');
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const data = JSON.parse(raw);
        this.approvals = data.approvals || [...INITIAL_APPROVAL_REQUESTS];
        this.policies = data.policies || [...INITIAL_APPROVAL_POLICIES];
        this.opportunities = data.opportunities || [...INITIAL_OPPORTUNITIES];
        this.competitions = data.competitions || [...INITIAL_COMPETITIONS];
        this.grants = data.grants || [...INITIAL_GRANT_PROPOSALS];
        this.papers = data.papers || [...INITIAL_RESEARCH_PAPERS];
        this.hypotheses = data.hypotheses || [...INITIAL_HYPOTHESES];
        this.contacts = data.contacts || [...INITIAL_CONTACTS];
        this.campaigns = data.campaigns || [...INITIAL_CAMPAIGNS];
        this.posts = data.posts || [...INITIAL_SOCIAL_POSTS];
        this.nodes = data.nodes || [...INITIAL_KNOWLEDGE_NODES];
        this.edges = data.edges || [...INITIAL_KNOWLEDGE_EDGES];
        this.emails = data.emails || [...INITIAL_EMAILS];
        this.calendar = data.calendar || [...INITIAL_CALENDAR_EVENTS];
        this.tasks = data.tasks || [...INITIAL_WBS_TASKS];
        this.blueprints = data.blueprints || [...INITIAL_SIDE_HUSTLE_BLUEPRINTS];
        this.leanCanvas = data.leanCanvas || { ...INITIAL_LEAN_CANVAS };
        this.gcwState = data.gcwState || { ...INITIAL_GCW_STATE };
        this.users = data.users || [...DEFAULT_USERS];
        this.sessions = data.sessions || {};
        console.log('Successfully restored state from durable disk file:', this.dbPath);
      } else {
        this.resetDefaults();
        this.saveToDisk();
      }
    } catch (err) {
      console.error('Failed to load DB file from disk, using default seed:', err);
      this.resetDefaults();
    }
  }

  private resetDefaults(): void {
    this.approvals = [...INITIAL_APPROVAL_REQUESTS];
    this.policies = [...INITIAL_APPROVAL_POLICIES];
    this.opportunities = [...INITIAL_OPPORTUNITIES];
    this.competitions = [...INITIAL_COMPETITIONS];
    this.grants = [...INITIAL_GRANT_PROPOSALS];
    this.papers = [...INITIAL_RESEARCH_PAPERS];
    this.hypotheses = [...INITIAL_HYPOTHESES];
    this.contacts = [...INITIAL_CONTACTS];
    this.campaigns = [...INITIAL_CAMPAIGNS];
    this.posts = [...INITIAL_SOCIAL_POSTS];
    this.nodes = [...INITIAL_KNOWLEDGE_NODES];
    this.edges = [...INITIAL_KNOWLEDGE_EDGES];
    this.emails = [...INITIAL_EMAILS];
    this.calendar = [...INITIAL_CALENDAR_EVENTS];
    this.tasks = [...INITIAL_WBS_TASKS];
    this.blueprints = [...INITIAL_SIDE_HUSTLE_BLUEPRINTS];
    this.leanCanvas = { ...INITIAL_LEAN_CANVAS };
    this.gcwState = { ...INITIAL_GCW_STATE };
    this.users = [...DEFAULT_USERS];
    this.sessions = {};
  }

  public saveToDisk(): void {
    try {
      const payload = {
        approvals: this.approvals,
        policies: this.policies,
        opportunities: this.opportunities,
        competitions: this.competitions,
        grants: this.grants,
        papers: this.papers,
        hypotheses: this.hypotheses,
        contacts: this.contacts,
        campaigns: this.campaigns,
        posts: this.posts,
        nodes: this.nodes,
        edges: this.edges,
        emails: this.emails,
        calendar: this.calendar,
        tasks: this.tasks,
        blueprints: this.blueprints,
        leanCanvas: this.leanCanvas,
        gcwState: this.gcwState,
        users: this.users,
        sessions: this.sessions,
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database state to disk:', err);
    }
  }

  // Users & Sessions
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  createSession(user: User): UserSession {
    const token = `token-${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const expiresAt = new Date(Date.now() + 86400000 * 7).toISOString(); // 7 days
    const session: UserSession = { token, user, expiresAt };
    this.sessions[token] = session;
    this.saveToDisk();
    return session;
  }

  getSession(token: string): UserSession | undefined {
    const session = this.sessions[token];
    if (session && new Date(session.expiresAt) > new Date()) {
      return session;
    }
    return undefined;
  }

  // SSE Stream
  subscribeSse(callback: (data: any) => void): () => void {
    this.sseClients.push(callback);
    return () => {
      this.sseClients = this.sseClients.filter((c) => c !== callback);
    };
  }

  broadcastSse(event: string, payload: any): void {
    const data = { event, payload, timestamp: new Date().toISOString() };
    this.sseClients.forEach((client) => {
      try {
        client(data);
      } catch (err) {
        // ignore closed connections
      }
    });
  }

  // Policies
  getPolicies(): ApprovalPolicy[] {
    return this.policies;
  }

  updatePolicy(id: string, updates: Partial<ApprovalPolicy>): ApprovalPolicy | null {
    const policy = this.policies.find((p) => p.id === id);
    if (!policy) return null;
    Object.assign(policy, updates, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return policy;
  }

  // Expiration Scheduler
  checkExpiries(): ApprovalRequest[] {
    const now = new Date();
    const expiredItems: ApprovalRequest[] = [];

    this.approvals.forEach((req) => {
      if (req.status === 'pending' && new Date(req.expiresAt) < now) {
        req.status = 'expired';
        expiredItems.push(req);
        this.broadcastSse('approval_expired', {
          requestId: req.id,
          moduleName: req.moduleName,
          summary: req.summary,
        });
      }
    });

    if (expiredItems.length > 0) {
      this.saveToDisk();
    }
    return expiredItems;
  }

  // Approvals & Cryptographic Audit Chain
  getApprovals(): ApprovalRequest[] {
    this.checkExpiries();
    return this.approvals;
  }

  addApproval(request: Omit<ApprovalRequest, 'id' | 'createdAt' | 'previousHash' | 'hash' | 'expiresAt'> & { expiresAt?: string }): ApprovalRequest {
    const lastHash = this.approvals.length > 0
      ? this.approvals[0].hash // index 0 is most recent
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const createdAt = new Date().toISOString();
    const id = `appr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Calculate expiry from policies if not provided
    let expiresAt = request.expiresAt;
    if (!expiresAt) {
      const policy = this.policies.find((p) => p.actionType === request.actionType) ||
                     this.policies.find((p) => p.moduleName === request.moduleName);
      const ttl = policy ? policy.ttlSeconds : 86400; // default 24h
      expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
    }

    const dataToHash = `${lastHash}:${id}:${request.summary}:${JSON.stringify(request.payload)}:${createdAt}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    const newApproval: ApprovalRequest = {
      ...request,
      id,
      createdAt,
      expiresAt,
      previousHash: lastHash,
      hash,
      status: request.status || 'pending',
      tenantId: request.tenantId || 'tenant-primary',
      userId: request.userId || 'usr-jun',
    };

    this.approvals.unshift(newApproval);
    this.saveToDisk();

    this.broadcastSse('approval_created', newApproval);

    return newApproval;
  }

  recordDecision(
    id: string,
    decision: 'approved' | 'approved_with_modifications' | 'denied' | 'more_info_requested',
    options?: {
      justification?: string;
      modifications?: Record<string, any>;
      executedBy?: string;
    }
  ): ApprovalRequest | null {
    const item = this.approvals.find((a) => a.id === id);
    if (!item) return null;

    item.status = decision;
    if (options?.justification) item.justification = options.justification;
    if (options?.modifications) item.modifications = options.modifications;
    item.executedAt = new Date().toISOString();
    item.executedBy = options?.executedBy || 'human-compliance-officer';

    this.saveToDisk();

    this.broadcastSse('approval_updated', item);

    return item;
  }

  batchDecision(
    ids: string[],
    decision: 'approved' | 'denied',
    justification?: string
  ): ApprovalRequest[] {
    const updated: ApprovalRequest[] = [];
    ids.forEach((id) => {
      const result = this.recordDecision(id, decision, { justification });
      if (result) updated.push(result);
    });
    return updated;
  }

  updateApprovalStatus(id: string, status: 'approved' | 'denied' | 'executed'): ApprovalRequest | null {
    return this.recordDecision(id, status === 'executed' ? 'approved' : status);
  }

  verifyAuditChain(): { valid: boolean; brokenAtId?: string } {
    if (this.approvals.length <= 1) return { valid: true };

    for (let i = 0; i < this.approvals.length - 1; i++) {
      const currentNewer = this.approvals[i];
      const previousOlder = this.approvals[i + 1];

      if (currentNewer.previousHash !== previousOlder.hash) {
        return { valid: false, brokenAtId: currentNewer.id };
      }
    }
    return { valid: true };
  }

  // Opportunities
  getOpportunities(): Opportunity[] {
    return this.opportunities;
  }

  addOpportunity(opp: Opportunity): void {
    this.opportunities.unshift(opp);
    this.saveToDisk();
  }

  updateOpportunityStatus(id: string, status: 'discovered' | 'pursued' | 'archived' | 'dismissed'): void {
    const opp = this.opportunities.find((o) => o.id === id);
    if (opp) {
      opp.status = status;
      this.saveToDisk();
    }
  }

  // Competitions
  getCompetitions(): Competition[] {
    return this.competitions;
  }

  addCompetition(comp: Competition): void {
    this.competitions.unshift(comp);
    this.saveToDisk();
  }

  toggleCompetitionTask(compId: string, taskId: string): Competition | null {
    const comp = this.competitions.find((c) => c.id === compId);
    if (!comp) return null;
    const task = comp.checklist.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveToDisk();
    }
    return comp;
  }

  // Grants
  getGrants(): GrantProposal[] {
    return this.grants;
  }

  updateGrant(updated: GrantProposal): void {
    const idx = this.grants.findIndex((g) => g.id === updated.id);
    if (idx !== -1) {
      this.grants[idx] = updated;
    } else {
      this.grants.unshift(updated);
    }
    this.saveToDisk();
  }

  // Research
  getPapers(): ResearchPaper[] {
    return this.papers;
  }

  getHypotheses(): ResearchHypothesis[] {
    return this.hypotheses;
  }

  addHypothesis(hypo: ResearchHypothesis): void {
    this.hypotheses.unshift(hypo);
    this.saveToDisk();
  }

  // Contacts & Outreach
  getContacts(): Contact[] {
    return this.contacts;
  }

  addContact(contact: Contact): void {
    this.contacts.unshift(contact);
    this.saveToDisk();
  }

  getCampaigns(): Campaign[] {
    return this.campaigns;
  }

  // Social
  getSocialPosts(): SocialPost[] {
    return this.posts;
  }

  addSocialPost(post: SocialPost): void {
    this.posts.unshift(post);
    this.saveToDisk();
  }

  // Knowledge Workspace
  getKnowledgeGraph(): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
    return { nodes: this.nodes, edges: this.edges };
  }

  addKnowledgeNode(node: KnowledgeNode): void {
    this.nodes.push(node);
    this.saveToDisk();
  }

  addKnowledgeEdge(edge: KnowledgeEdge): void {
    this.edges.push(edge);
    this.saveToDisk();
  }

  // Emails
  getEmails(): EmailMessage[] {
    return this.emails;
  }

  addEmail(email: EmailMessage): void {
    this.emails.unshift(email);
    this.saveToDisk();
  }

  // Calendar
  getCalendarEvents(): CalendarEvent[] {
    return this.calendar;
  }

  addCalendarEvent(evt: CalendarEvent): void {
    this.calendar.unshift(evt);
    this.saveToDisk();
  }

  // WBS Tasks
  getWbsTasks(): WbsTask[] {
    return this.tasks;
  }

  // Blueprints
  getSideHustleBlueprints(): SideHustleBlueprint[] {
    return this.blueprints;
  }

  // Lean Canvas
  getLeanCanvas(): LeanCanvas {
    return this.leanCanvas;
  }

  updateLeanCanvas(canvas: LeanCanvas): void {
    this.leanCanvas = canvas;
    this.saveToDisk();
  }

  // General Cognitive Worker (GCW) State
  getGcwState(): GCWState {
    return this.gcwState;
  }

  updateGcwState(newState: Partial<GCWState>): GCWState {
    this.gcwState = {
      ...this.gcwState,
      ...newState,
    };
    this.saveToDisk();
    return this.gcwState;
  }

  addMemoryChunk(chunk: Omit<MemoryChunk, 'id'>): MemoryChunk {
    const id = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const fullChunk: MemoryChunk = { id, ...chunk };
    this.gcwState.workingMemory.unshift(fullChunk);
    this.saveToDisk();
    return fullChunk;
  }
}

export const memoryStore = new MemoryStore();
