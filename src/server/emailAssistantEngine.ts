import {
  NormalizedEmail,
  EmailCategory,
  EmailProcessingStatus,
  ExtractedActionItem,
  ExtractedEntityNER,
  EmailDraftReply,
  EmailThread,
  PubSubWebhookLog,
} from '../types/emailCalendarTypes';

export class EmailAssistantEngine {
  // 1. Initial Mock Dataset covering all 7 fine-tuned BERT categories + real-world scenarios
  public static getInitialEmails(): NormalizedEmail[] {
    return [
      {
        id: 'email-001',
        messageId: '<nsf-career-panel-9921@nsf.gov>',
        threadId: 'th-nsf-001',
        fromAddress: 'program-director@nsf.gov',
        fromName: 'Dr. Arthur Vance (NSF Program Director)',
        toAddresses: ['junphookan@gmail.com'],
        ccAddresses: ['nsf-grants-office@nsf.gov'],
        bccAddresses: [],
        subject: 'Action Required: NSF CAREER Grant Review Panel & Proposal Feedback #2026-88',
        bodyText: `Dear Principal Investigator Jun Phookan,

We have completed the preliminary panel evaluation for your proposal "Biologically-Plausible Neuromorphic Plasticity". The panel rated your proposal in the top 5th percentile ($500,000 award allocation).

Please review the attached reviewer critiques and submit your final budgetary clarifications and data management plan update by August 22, 2026, 17:00 EST on FastLane.

Additionally, we would like to invite you to serve as a panelist for the upcoming Cyber-Physical Systems panel on September 14, 2026. Please confirm your availability by August 20.

Best regards,
Dr. Arthur Vance
National Science Foundation (NSF) Directorate for Computer and Information Science`,
        bodyHtml: `<p>Dear Principal Investigator Jun Phookan,</p><p>We have completed the preliminary panel evaluation for your proposal <strong>"Biologically-Plausible Neuromorphic Plasticity"</strong>. The panel rated your proposal in the top 5th percentile (<strong>$500,000 award allocation</strong>).</p><p>Please review the attached reviewer critiques and submit your final budgetary clarifications and data management plan update by <strong>August 22, 2026, 17:00 EST</strong> on FastLane.</p><p>Additionally, we would like to invite you to serve as a panelist for the upcoming Cyber-Physical Systems panel on <strong>September 14, 2026</strong>. Please confirm your availability by <strong>August 20</strong>.</p><p>Best regards,<br><strong>Dr. Arthur Vance</strong><br>National Science Foundation (NSF)</p>`,
        originalLanguage: 'en',
        sentDate: '2026-08-13T09:15:00Z',
        receivedDate: '2026-08-13T09:15:32Z',
        processingStatus: 'ACTIONS_PARSED',
        category: 'opportunity',
        categoryConfidence: 0.98,
        isImportant: true,
        isRead: false,
        isReplied: false,
        extractedEntities: [
          { entityText: 'NSF CAREER', entityType: 'PROJECT', startChar: 17, endChar: 27 },
          { entityText: '$500,000', entityType: 'MONEY', startChar: 204, endChar: 212 },
          { entityText: 'August 22, 2026', entityType: 'DEADLINE', startChar: 326, endChar: 341 },
          { entityText: 'Dr. Arthur Vance', entityType: 'PERSON', startChar: 512, endChar: 528 },
          { entityText: 'September 14, 2026', entityType: 'DATE', startChar: 440, endChar: 458 },
        ],
        actionItems: [
          {
            id: 'act-001',
            emailId: 'email-001',
            description: 'Submit final budgetary clarifications and Data Management Plan to NSF FastLane portal',
            deadline: '2026-08-22T21:00:00Z',
            relatedEntity: 'NSF CAREER Proposal ($500k)',
            priority: 'critical',
            confidenceScore: 0.97,
            isExportedToPlanner: true,
            exportedTaskId: 'task-wbs-nsf-01',
          },
          {
            id: 'act-002',
            emailId: 'email-001',
            description: 'Confirm attendance for NSF Cyber-Physical Systems review panel',
            deadline: '2026-08-20T23:59:59Z',
            relatedEntity: 'NSF Review Panel',
            priority: 'high',
            confidenceScore: 0.92,
            isExportedToPlanner: false,
          },
        ],
        attachments: [
          {
            id: 'att-01',
            fileName: 'NSF_Panel_Summary_Critique_2026.pdf',
            fileSizeBytes: 1428500,
            mimeType: 'application/pdf',
            gcsStorageUri: 'gs://atlas-email-attachments/2026-08/NSF_Panel_Summary.pdf',
            isScannedSafe: true,
          },
          {
            id: 'att-02',
            fileName: 'Budget_Revision_Worksheet.xlsx',
            fileSizeBytes: 420100,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            gcsStorageUri: 'gs://atlas-email-attachments/2026-08/Budget_Revision_Worksheet.xlsx',
            isScannedSafe: true,
          },
        ],
        draftReply: {
          id: 'draft-001',
          threadId: 'th-nsf-001',
          emailId: 'email-001',
          to: ['program-director@nsf.gov'],
          cc: ['nsf-grants-office@nsf.gov'],
          subject: 'Re: Action Required: NSF CAREER Grant Review Panel & Proposal Feedback #2026-88',
          bodyText: `Dear Dr. Vance,

Thank you for communicating the panel's positive review and the top 5th percentile recommendation for our CAREER proposal. 

Our team is currently finalizing the requested budgetary clarifications regarding the compute infrastructure allocations and our updated data sharing protocol. We will submit the complete package on FastLane prior to the August 22 deadline.

Furthermore, I am honored to accept the invitation to serve on the Cyber-Physical Systems panel on September 14, 2026. I have blocked the dates on my calendar and look forward to contributing.

Sincerely,
Jun Phookan
Director, Atlas AI & Neuromorphic Systems Lab`,
          bodyHtml: `<p>Dear Dr. Vance,</p><p>Thank you for communicating the panel's positive review and the top 5th percentile recommendation for our CAREER proposal.</p><p>Our team is currently finalizing the requested budgetary clarifications regarding the compute infrastructure allocations and our updated data sharing protocol. We will submit the complete package on FastLane prior to the August 22 deadline.</p><p>Furthermore, I am honored to accept the invitation to serve on the Cyber-Physical Systems panel on September 14, 2026. I have blocked the dates on my calendar and look forward to contributing.</p><p>Sincerely,<br><strong>Jun Phookan</strong><br>Director, Atlas AI & Neuromorphic Systems Lab</p>`,
          tone: 'Formal Executive',
          formalityScore: 96,
          styleMatchScore: 94,
          status: 'pending_approval',
          knowledgeGraphContextUsed: [
            'KnowledgeNode: node-doc-nsf (NSF CAREER Proposal $500k)',
            'KnowledgeNode: node-prj-atlas (Atlas AI Operating System)',
            'Planner Task: task-wbs-nsf-01',
          ],
          createdAt: '2026-08-13T10:05:00Z',
          approvalRequestId: 'req-appr-email-01',
        },
        followUpRequired: false,
        bounceStatus: 'none',
      },

      {
        id: 'email-002',
        messageId: '<chen-lab-reply-341@stanford.edu>',
        threadId: 'th-chen-002',
        fromAddress: 'k.chen@stanford.edu',
        fromName: 'Prof. Katherine Chen (Stanford University)',
        toAddresses: ['junphookan@gmail.com'],
        ccAddresses: ['neuro-lab-postdoc@stanford.edu'],
        bccAddresses: [],
        subject: 'Re: Collaboration on Neuromorphic Motor Cortex Spatial Transcriptomics',
        bodyText: `Hi Jun,

I reviewed your Sparse Plasticity paper draft and the Atlas architecture overview. The 14.8x energy efficiency metrics on the Jetson Orin micro-controller are very compelling.

We are ready to grant your lab access to the unpublished 10x Genomics spatial transcriptomics motor cortex dataset. Could you please sign the attached Data Transfer Agreement (DTA) and return it? 

Also, let's schedule a 30-minute sync this Thursday at 3:00 PM PST to align on the co-authorship plan for the upcoming Nature Neuroscience submission.

Best,
Katherine
Prof. Katherine Chen
Department of Bioengineering & Neurobiology, Stanford University`,
        bodyHtml: `<p>Hi Jun,</p><p>I reviewed your Sparse Plasticity paper draft and the Atlas architecture overview. The 14.8x energy efficiency metrics on the Jetson Orin micro-controller are very compelling.</p><p>We are ready to grant your lab access to the unpublished 10x Genomics spatial transcriptomics motor cortex dataset. Could you please sign the attached Data Transfer Agreement (DTA) and return it?</p><p>Also, let's schedule a <strong>30-minute sync this Thursday at 3:00 PM PST</strong> to align on the co-authorship plan for the upcoming Nature Neuroscience submission.</p><p>Best,<br><strong>Katherine</strong><br>Prof. Katherine Chen, Stanford University</p>`,
        originalLanguage: 'en',
        sentDate: '2026-08-12T16:42:00Z',
        receivedDate: '2026-08-12T16:42:15Z',
        processingStatus: 'DRAFT_GENERATED',
        category: 'professor_reply',
        categoryConfidence: 0.99,
        isImportant: true,
        isRead: true,
        isReplied: false,
        extractedEntities: [
          { entityText: 'Prof. Katherine Chen', entityType: 'PERSON', startChar: 0, endChar: 20 },
          { entityText: 'Stanford University', entityType: 'ORG', startChar: 40, endChar: 59 },
          { entityText: 'Thursday at 3:00 PM PST', entityType: 'DATE', startChar: 380, endChar: 404 },
          { entityText: 'Nature Neuroscience', entityType: 'PROJECT', startChar: 450, endChar: 469 },
        ],
        actionItems: [
          {
            id: 'act-003',
            emailId: 'email-002',
            description: 'Sign and return Stanford Data Transfer Agreement (DTA) for 10x Genomics dataset',
            deadline: '2026-08-18T23:59:59Z',
            relatedEntity: 'Prof. Katherine Chen',
            priority: 'high',
            confidenceScore: 0.95,
            isExportedToPlanner: true,
            exportedTaskId: 'task-wbs-dta-chen',
          },
          {
            id: 'act-004',
            emailId: 'email-002',
            description: 'Hold calendar slot: 30-minute sync with Prof. Chen (Thursday 3:00 PM PST)',
            deadline: '2026-08-14T22:00:00Z',
            relatedEntity: 'Calendar Intelligence / Stanford Lab',
            priority: 'high',
            confidenceScore: 0.98,
            isExportedToPlanner: true,
            exportedTaskId: 'cal-event-chen-sync',
          },
        ],
        attachments: [
          {
            id: 'att-03',
            fileName: 'Stanford_Data_Transfer_Agreement_AtlasLab.docx',
            fileSizeBytes: 284000,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            gcsStorageUri: 'gs://atlas-email-attachments/2026-08/Stanford_DTA.docx',
            isScannedSafe: true,
          },
        ],
        draftReply: {
          id: 'draft-002',
          threadId: 'th-chen-002',
          emailId: 'email-002',
          to: ['k.chen@stanford.edu'],
          cc: ['neuro-lab-postdoc@stanford.edu'],
          subject: 'Re: Collaboration on Neuromorphic Motor Cortex Spatial Transcriptomics',
          bodyText: `Dear Katherine,

Thank you for reviewing the manuscript draft and for sharing the exciting news regarding the spatial transcriptomics dataset. 

I have countersigned the Data Transfer Agreement and attached the signed PDF copy below. Our team is eager to run the local plasticity benchmark across your motor cortex spatial coordinates.

Thursday at 3:00 PM PST works seamlessly for my schedule. I will send a Google Meet calendar invite with our preliminary author contributions breakdown.

Looking forward to our conversation.

Warm regards,
Jun`,
          bodyHtml: `<p>Dear Katherine,</p><p>Thank you for reviewing the manuscript draft and for sharing the exciting news regarding the spatial transcriptomics dataset.</p><p>I have countersigned the Data Transfer Agreement and attached the signed PDF copy below. Our team is eager to run the local plasticity benchmark across your motor cortex spatial coordinates.</p><p><strong>Thursday at 3:00 PM PST works seamlessly for my schedule.</strong> I will send a Google Meet calendar invite with our preliminary author contributions breakdown.</p><p>Looking forward to our conversation.<br>Warm regards,<br><strong>Jun</strong></p>`,
          tone: 'Warm Academic',
          formalityScore: 88,
          styleMatchScore: 96,
          status: 'pending_approval',
          knowledgeGraphContextUsed: [
            'KnowledgeNode: node-cnt-chen (Prof. Katherine Chen)',
            'KnowledgeNode: node-res-plasticity (Sparse Plasticity Paper)',
            'CalendarIntelligence: slot Thursday 15:00 available',
          ],
          createdAt: '2026-08-12T17:10:00Z',
          approvalRequestId: 'req-appr-email-02',
        },
        followUpRequired: false,
        bounceStatus: 'none',
      },

      {
        id: 'email-003',
        messageId: '<mit-collab-proposal-091@media.mit.edu>',
        threadId: 'th-mit-003',
        fromAddress: 'm.vance@media.mit.edu',
        fromName: 'Dr. Marcus Vance (MIT Media Lab)',
        toAddresses: ['junphookan@gmail.com'],
        ccAddresses: [],
        bccAddresses: [],
        subject: 'Joint Submission Proposal: IEEE Neuromorphic Challenge 2026 ($50k Prize)',
        bodyText: `Dear Jun,

I came across your public benchmarks on low-latency spike-timing dependent plasticity. At the MIT Media Lab, our group has developed a custom ASIC optical neuromorphic coprocessor.

We believe combining your algorithmic synaptic engine with our hardware testbed would create an unbeatable submission for the IEEE Neuromorphic Challenge ($50,000 grand prize).

The application deadline is September 15, 2026. Would you be open to an exploratory call next Tuesday?

Best,
Marcus Vance, Ph.D.
Research Scientist, MIT Media Lab`,
        bodyHtml: `<p>Dear Jun,</p><p>I came across your public benchmarks on low-latency spike-timing dependent plasticity. At the MIT Media Lab, our group has developed a custom ASIC optical neuromorphic coprocessor.</p><p>We believe combining your algorithmic synaptic engine with our hardware testbed would create an unbeatable submission for the <strong>IEEE Neuromorphic Challenge ($50,000 grand prize)</strong>.</p><p>The application deadline is <strong>September 15, 2026</strong>. Would you be open to an exploratory call next Tuesday?</p><p>Best,<br><strong>Marcus Vance, Ph.D.</strong><br>Research Scientist, MIT Media Lab</p>`,
        originalLanguage: 'en',
        sentDate: '2026-08-11T14:20:00Z',
        receivedDate: '2026-08-11T14:20:44Z',
        processingStatus: 'ENTITIES_EXTRACTED',
        category: 'collaboration',
        categoryConfidence: 0.95,
        isImportant: true,
        isRead: true,
        isReplied: false,
        extractedEntities: [
          { entityText: 'MIT Media Lab', entityType: 'ORG', startChar: 95, endChar: 108 },
          { entityText: 'IEEE Neuromorphic Challenge', entityType: 'PROJECT', startChar: 240, endChar: 267 },
          { entityText: '$50,000', entityType: 'MONEY', startChar: 269, endChar: 276 },
          { entityText: 'September 15, 2026', entityType: 'DEADLINE', startChar: 318, endChar: 336 },
        ],
        actionItems: [
          {
            id: 'act-005',
            emailId: 'email-003',
            description: 'Evaluate MIT Media Lab ASIC hardware specs for IEEE Neuromorphic Challenge integration',
            deadline: '2026-08-19T23:59:59Z',
            relatedEntity: 'IEEE Neuromorphic Challenge ($50k)',
            priority: 'medium',
            confidenceScore: 0.89,
            isExportedToPlanner: false,
          },
        ],
        attachments: [],
        followUpRequired: true,
        followUpDueDate: '2026-08-16T14:20:00Z',
        bounceStatus: 'none',
      },

      {
        id: 'email-004',
        messageId: '<nature-digest-august-2026@nature.com>',
        threadId: 'th-nature-004',
        fromAddress: 'alerts@nature.com',
        fromName: 'Nature Computational Science Briefing',
        toAddresses: ['junphookan@gmail.com'],
        ccAddresses: [],
        bccAddresses: [],
        subject: 'Nature Weekly: Breakthroughs in Bio-Hybrid Computing & Neural Decoding',
        bodyText: `NATURE COMPUTATIONAL SCIENCE - WEEKLY BRIEFING

Featured Articles:
1. "Continuous Local Learning without Catastrophic Forgetting in Edge Networks" (Lead Author: T. Müller, Max Planck)
2. "Sub-milliwatt Neuromorphic Sensing for Robotic Prosthetics"
3. "Deep Mathematical Equivalence of Transformer Attention and Cortical Pyramidal Microcircuits"

Explore full text and arXiv preprints via your institutional subscriber portal.`,
        bodyHtml: `<h3>NATURE COMPUTATIONAL SCIENCE - WEEKLY BRIEFING</h3><p><strong>Featured Articles:</strong><br>1. "Continuous Local Learning without Catastrophic Forgetting in Edge Networks"<br>2. "Sub-milliwatt Neuromorphic Sensing for Robotic Prosthetics"<br>3. "Deep Mathematical Equivalence of Transformer Attention and Cortical Pyramidal Microcircuits"</p>`,
        originalLanguage: 'en',
        sentDate: '2026-08-10T06:00:00Z',
        receivedDate: '2026-08-10T06:01:10Z',
        processingStatus: 'CLASSIFIED',
        category: 'newsletter',
        categoryConfidence: 0.99,
        isImportant: false,
        isRead: true,
        isReplied: false,
        extractedEntities: [
          { entityText: 'Nature Computational Science', entityType: 'ORG', startChar: 0, endChar: 28 },
          { entityText: 'Max Planck', entityType: 'ORG', startChar: 130, endChar: 140 },
        ],
        actionItems: [],
        attachments: [],
        bounceStatus: 'none',
      },

      {
        id: 'email-005',
        messageId: '<alumni-dinner-stanford-02@alumni.stanford.edu>',
        threadId: 'th-alumni-005',
        fromAddress: 'events@alumni.stanford.edu',
        fromName: 'Stanford Alumni Association',
        toAddresses: ['junphookan@gmail.com'],
        ccAddresses: [],
        bccAddresses: [],
        subject: 'Invitation: Bay Area DeepTech Founders & Academic Leaders Dinner',
        bodyText: `Dear Jun,

You are cordially invited to the Annual Stanford DeepTech Leaders Dinner on Friday, August 28, 2026 at the Faculty Club (6:30 PM PST).

Keynote speaker: Dr. Fei-Fei Li. RSVP by August 21 to reserve your seat as capacity is strictly capped at 80 attendees.`,
        bodyHtml: `<p>Dear Jun,</p><p>You are cordially invited to the Annual Stanford DeepTech Leaders Dinner on <strong>Friday, August 28, 2026 at the Faculty Club (6:30 PM PST)</strong>.</p><p>Keynote speaker: Dr. Fei-Fei Li. RSVP by August 21 to reserve your seat.</p>`,
        originalLanguage: 'en',
        sentDate: '2026-08-09T18:30:00Z',
        receivedDate: '2026-08-09T18:30:45Z',
        processingStatus: 'ACTIONS_PARSED',
        category: 'personal',
        categoryConfidence: 0.94,
        isImportant: false,
        isRead: true,
        isReplied: false,
        extractedEntities: [
          { entityText: 'Friday, August 28, 2026', entityType: 'DATE', startChar: 80, endChar: 103 },
          { entityText: 'Dr. Fei-Fei Li', entityType: 'PERSON', startChar: 145, endChar: 159 },
          { entityText: 'August 21', entityType: 'DEADLINE', startChar: 169, endChar: 178 },
        ],
        actionItems: [
          {
            id: 'act-006',
            emailId: 'email-005',
            description: 'RSVP for Stanford DeepTech Founders Dinner (Faculty Club)',
            deadline: '2026-08-21T23:59:59Z',
            relatedEntity: 'Stanford Alumni Network',
            priority: 'low',
            confidenceScore: 0.96,
            isExportedToPlanner: false,
          },
        ],
        attachments: [],
        bounceStatus: 'none',
      },

      {
        id: 'email-006',
        messageId: '<predatory-journal-spammer-8871@fastscipublish.xyz>',
        threadId: 'th-spam-006',
        fromAddress: 'editorial-board@fastscipublish.xyz',
        fromName: 'International Journal of Universal Rapid Science',
        toAddresses: ['junphookan@gmail.com'],
        ccAddresses: [],
        bccAddresses: [],
        subject: 'URGENT: Call for Papers - Instant Publication within 48 hours ($1200 Processing Fee)',
        bodyText: `Distinguished Scholar Jun Phookan,

We noticed your esteemed article in arXiv. Submit your next manuscript for instant 48-hour peer review and indexed certificate in our open access volume. Wire $1200 USD via Western Union.`,
        bodyHtml: `<p>Distinguished Scholar Jun Phookan,</p><p>We noticed your esteemed article in arXiv. Submit your next manuscript for instant 48-hour peer review and indexed certificate in our open access volume. Wire $1200 USD via Western Union.</p>`,
        originalLanguage: 'en',
        sentDate: '2026-08-08T03:12:00Z',
        receivedDate: '2026-08-08T03:12:10Z',
        processingStatus: 'CLASSIFIED',
        category: 'spam',
        categoryConfidence: 0.99,
        isImportant: false,
        isRead: false,
        isReplied: false,
        extractedEntities: [
          { entityText: '$1200 USD', entityType: 'MONEY', startChar: 215, endChar: 224 },
        ],
        actionItems: [],
        attachments: [],
        bounceStatus: 'none',
      },

      {
        id: 'email-007',
        messageId: '<bounced-contact-notice-009@mailgun.org>',
        threadId: 'th-bounce-007',
        fromAddress: 'mailer-daemon@mailgun.org',
        fromName: 'Mail Delivery System (Mailer Daemon)',
        toAddresses: ['junphookan@gmail.com'],
        ccAddresses: [],
        bccAddresses: [],
        subject: 'Mail Delivery Failure: 550 5.1.1 User Unknown (r.santiago@mit.edu)',
        bodyText: `Your message to r.santiago@mit.edu could not be delivered. 
SMTP Response: 550 5.1.1 The email account that you tried to reach does not exist or has been deactivated.
Atlas Action Taken: Contact status for Dr. Roberto Santiago updated to "INVALID" in Outreach CRM.`,
        bodyHtml: `<p><strong>Mail Delivery Failure:</strong> Your message to <code>r.santiago@mit.edu</code> could not be delivered.</p><p>SMTP Response: 550 5.1.1 User Unknown.</p><p><span style="color: #ef4444;">Atlas Action Taken:</span> Contact status marked as INVALID.</p>`,
        originalLanguage: 'en',
        sentDate: '2026-08-07T11:05:00Z',
        receivedDate: '2026-08-07T11:05:12Z',
        processingStatus: 'ARCHIVED',
        category: 'action_required',
        categoryConfidence: 0.96,
        isImportant: false,
        isRead: true,
        isReplied: true,
        extractedEntities: [
          { entityText: 'r.santiago@mit.edu', entityType: 'PERSON', startChar: 16, endChar: 34 },
        ],
        actionItems: [],
        attachments: [],
        bounceStatus: 'hard_bounce',
      },
    ];
  }

  // 2. Real-time Pub/Sub Webhook Simulation Logs
  public static getInitialWebhookLogs(): PubSubWebhookLog[] {
    return [
      {
        id: 'ps-log-01',
        timestamp: '2026-08-13T09:15:33Z',
        provider: 'Gmail API',
        historyIdOrEvent: 'hist_9982410294_nsf',
        emailAddress: 'junphookan@gmail.com',
        status: 'INGESTED',
        latencyMs: 142,
      },
      {
        id: 'ps-log-02',
        timestamp: '2026-08-12T16:42:16Z',
        provider: 'Gmail API',
        historyIdOrEvent: 'hist_9982390112_chen',
        emailAddress: 'junphookan@gmail.com',
        status: 'INGESTED',
        latencyMs: 128,
      },
      {
        id: 'ps-log-03',
        timestamp: '2026-08-11T14:20:45Z',
        provider: 'Microsoft Graph',
        historyIdOrEvent: 'webhook_mit_vance_09',
        emailAddress: 'junphookan@gmail.com',
        status: 'INGESTED',
        latencyMs: 185,
      },
      {
        id: 'ps-log-04',
        timestamp: '2026-08-10T06:01:12Z',
        provider: 'IMAP IDLE',
        historyIdOrEvent: 'idle_event_nature_briefing',
        emailAddress: 'junphookan@gmail.com',
        status: 'INGESTED',
        latencyMs: 310,
      },
    ];
  }

  // 3. AI Drafting Engine with Style Matching and Knowledge Graph Retrieval
  public static generateContextualDraft(
    email: NormalizedEmail,
    tone: 'Warm Academic' | 'Formal Executive' | 'Collaborative Peer' | 'Concise Direct'
  ): EmailDraftReply {
    const isAcademic = email.category === 'professor_reply' || email.category === 'opportunity';
    const sender = email.fromName.split('(')[0].trim();

    let subject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;
    let body = '';
    let kgContext: string[] = [];

    if (email.category === 'opportunity') {
      body = `Dear ${sender},\n\nThank you for communicating this update regarding our proposal. We have reviewed the feedback thoroughly.\n\nOur team is finalizing the budgetary clarifications and data management plan to ensure full compliance. We will submit the finalized documentation before the stated deadline.\n\nThank you for your continued guidance and support.\n\nSincerely,\nJun Phookan\nAtlas AI Research`;
      kgContext = ['KnowledgeNode: node-doc-nsf ($500k Allocation)', 'Planner Task: WBS FastLane Submission'];
    } else if (email.category === 'professor_reply') {
      body = `Dear ${sender},\n\nThank you for your response and for reviewing our recent paper draft.\n\nI have confirmed the requested documents and aligned our team on the collaboration timeline. I look forward to our scheduled sync to discuss the upcoming publication milestones.\n\nWarm regards,\nJun`;
      kgContext = ['KnowledgeNode: node-cnt-chen (Stanford Lab)', 'KnowledgeNode: node-res-plasticity'];
    } else if (email.category === 'collaboration') {
      body = `Hi ${sender},\n\nThank you for reaching out regarding the potential joint submission. Your hardware architecture aligns directly with our low-latency algorithmic benchmark.\n\nI would be glad to arrange a 20-minute exploratory call next week to review technical specifications and author responsibilities.\n\nBest regards,\nJun Phookan`;
      kgContext = ['KnowledgeNode: node-cmp-ieee (IEEE $50k Challenge)', 'KnowledgeNode: node-prj-atlas'];
    } else {
      body = `Hello ${sender},\n\nThank you for your message. I have received the details and will follow up accordingly.\n\nBest regards,\nJun`;
      kgContext = ['KnowledgeNode: General Communication Graph'];
    }

    const formality = tone === 'Formal Executive' ? 95 : tone === 'Warm Academic' ? 88 : tone === 'Collaborative Peer' ? 76 : 82;

    return {
      id: `draft-${Date.now()}`,
      threadId: email.threadId,
      emailId: email.id,
      to: [email.fromAddress],
      cc: email.ccAddresses,
      subject,
      bodyText: body,
      bodyHtml: `<p>${body.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`,
      tone,
      formalityScore: formality,
      styleMatchScore: 92,
      status: 'pending_approval',
      knowledgeGraphContextUsed: kgContext,
      createdAt: new Date().toISOString(),
      approvalRequestId: `req-appr-${Date.now()}`,
    };
  }

  // 4. BERT Categorisation Re-Classifier simulation
  public static classifyEmailText(subject: string, bodyText: string): {
    category: EmailCategory;
    confidence: number;
    entities: ExtractedEntityNER[];
    actions: ExtractedActionItem[];
  } {
    const text = `${subject} ${bodyText}`.toLowerCase();

    let category: EmailCategory = 'action_required';
    let confidence = 0.94;

    if (text.includes('grant') || text.includes('award') || text.includes('fellowship') || text.includes('prize') || text.includes('percentile')) {
      category = 'opportunity';
      confidence = 0.98;
    } else if (text.includes('prof.') || text.includes('professor') || text.includes('lab') || text.includes('supervisor') || text.includes('phd')) {
      category = 'professor_reply';
      confidence = 0.96;
    } else if (text.includes('collab') || text.includes('joint') || text.includes('co-author') || text.includes('partnership')) {
      category = 'collaboration';
      confidence = 0.93;
    } else if (text.includes('newsletter') || text.includes('briefing') || text.includes('weekly digest') || text.includes('arxiv')) {
      category = 'newsletter';
      confidence = 0.99;
    } else if (text.includes('dinner') || text.includes('rsvp') || text.includes('alumni') || text.includes('invitation')) {
      category = 'personal';
      confidence = 0.91;
    } else if (text.includes('wire') || text.includes('western union') || text.includes('urgent call for papers') || text.includes('fee')) {
      category = 'spam';
      confidence = 0.99;
    }

    const entities: ExtractedEntityNER[] = [
      { entityText: 'Classified via BERT v4', entityType: 'PROJECT', startChar: 0, endChar: 18 },
    ];

    const actions: ExtractedActionItem[] = [];
    if (text.includes('deadline') || text.includes('submit') || text.includes('rsvp') || text.includes('confirm')) {
      actions.push({
        id: `act-${Date.now()}`,
        emailId: 'custom-classified',
        description: `Action extracted from: "${subject.slice(0, 50)}"`,
        deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
        relatedEntity: subject.slice(0, 30),
        priority: 'high',
        confidenceScore: 0.91,
        isExportedToPlanner: false,
      });
    }

    return { category, confidence, entities, actions };
  }
}
