import {
  InternalCalendarEvent,
  OptaPyScheduleCandidate,
  EnergyWindowConfig,
  DetectedCalendarConflict,
  TimeTrackingAnalytics,
  IncomingMeetingExtraction,
} from '../types/emailCalendarTypes';

export class CalendarIntelligenceEngine {
  // 1. Initial Synchronized Calendar Events (Google Calendar + Outlook + Apple)
  public static getInitialEvents(): InternalCalendarEvent[] {
    return [
      {
        id: 'evt-001',
        externalEventId: 'gcal_88192019_nsf_sync',
        source: 'google',
        title: 'NSF CAREER Budgetary Review & Grant Submission Block',
        description: 'Finalize compute infrastructure table, data sharing plan and institutional compliance forms.',
        location: 'Stanford Gates Hall / Virtual FastLane',
        startTime: '2026-08-14T09:00:00-07:00',
        endTime: '2026-08-14T11:30:00-07:00',
        timezone: 'America/Los_Angeles',
        type: 'deep_work',
        energyDemand: 'high',
        attendees: [{ name: 'Jun Phookan', email: 'junphookan@gmail.com', responseStatus: 'accepted', isOrganizer: true }],
        isLocked: false,
        linkedTaskId: 'task-wbs-nsf-01',
        travelTimeMinutesBefore: 0,
        travelTimeMinutesAfter: 15,
      },
      {
        id: 'evt-002',
        externalEventId: 'gcal_88192020_chen_lab',
        source: 'google',
        title: 'Prof. Katherine Chen (Stanford Neuro) - Spatial Transcriptomics Sync',
        description: 'Align on co-authorship plan for Nature Neuroscience and discuss 10x Genomics dataset coordinates.',
        location: 'Google Meet (meet.google.com/abc-wxyz-qrs)',
        startTime: '2026-08-14T15:00:00-07:00',
        endTime: '2026-08-14T15:30:00-07:00',
        timezone: 'America/Los_Angeles',
        type: 'meeting',
        energyDemand: 'medium',
        attendees: [
          { name: 'Prof. Katherine Chen', email: 'k.chen@stanford.edu', responseStatus: 'accepted' },
          { name: 'Jun Phookan', email: 'junphookan@gmail.com', responseStatus: 'accepted', isOrganizer: true },
        ],
        isLocked: true,
        linkedEmailId: 'email-002',
        meetingUrl: 'https://meet.google.com/abc-wxyz-qrs',
        travelTimeMinutesBefore: 0,
        travelTimeMinutesAfter: 10,
      },
      {
        id: 'evt-003',
        externalEventId: 'outlook_mit_vance_call',
        source: 'outlook',
        title: 'MIT Media Lab: Optical Neuromorphic Coprocessor Discussion',
        description: 'Exploratory sync with Dr. Marcus Vance on ASIC hardware testbed for IEEE Challenge.',
        location: 'Microsoft Teams',
        startTime: '2026-08-14T16:00:00-07:00',
        endTime: '2026-08-14T16:45:00-07:00',
        timezone: 'America/Los_Angeles',
        type: 'meeting',
        energyDemand: 'medium',
        attendees: [
          { name: 'Dr. Marcus Vance', email: 'm.vance@media.mit.edu', responseStatus: 'accepted' },
          { name: 'Jun Phookan', email: 'junphookan@gmail.com', responseStatus: 'accepted', isOrganizer: false },
        ],
        isLocked: true,
        linkedEmailId: 'email-003',
        meetingUrl: 'https://teams.microsoft.com/l/meetup-join/19920192',
      },
      {
        id: 'evt-004',
        externalEventId: 'apple_cal_edge_benchmarks',
        source: 'apple',
        title: 'Jetson Orin Edge Benchmarking & Latency Sweep',
        description: 'Profile 14.8x energy efficiency metrics on physical edge testbed for paper revision.',
        location: 'Hardware Prototyping Lab Room 304',
        startTime: '2026-08-14T13:00:00-07:00',
        endTime: '2026-08-14T14:45:00-07:00',
        timezone: 'America/Los_Angeles',
        type: 'task_block',
        energyDemand: 'high',
        attendees: [{ name: 'Jun Phookan', email: 'junphookan@gmail.com', responseStatus: 'accepted', isOrganizer: true }],
        isLocked: false,
        linkedTaskId: 'task-tsk-benchmark',
        travelTimeMinutesBefore: 15,
      },
      {
        id: 'evt-005',
        source: 'atlas_internal',
        title: 'Protected Deep Work: Synaptic Weight Update Formulation',
        description: 'Autonomous Protected Focus Block defending against incoming calendar bookings.',
        location: 'Silent Research Office',
        startTime: '2026-08-15T08:30:00-07:00',
        endTime: '2026-08-15T12:00:00-07:00',
        timezone: 'America/Los_Angeles',
        type: 'focus_block',
        energyDemand: 'high',
        attendees: [{ name: 'Jun Phookan', email: 'junphookan@gmail.com', responseStatus: 'accepted', isOrganizer: true }],
        isLocked: false,
      },
    ];
  }

  // 2. User Configurable Energy Profile
  public static getEnergyWindows(): EnergyWindowConfig[] {
    return [
      {
        period: 'morning_peak',
        label: 'Morning Peak Energy Window (08:30 - 12:00)',
        startTime: '08:30',
        endTime: '12:00',
        preferredActivity: 'High-Demand Deep Work',
        energyScore: 95,
      },
      {
        period: 'afternoon_collab',
        label: 'Afternoon Collaboration & Syncs (13:30 - 17:00)',
        startTime: '13:30',
        endTime: '17:00',
        preferredActivity: 'Meetings & Outreach',
        energyScore: 78,
      },
      {
        period: 'evening_review',
        label: 'Evening Wrap-Up & Planning (17:30 - 19:00)',
        startTime: '17:30',
        endTime: '19:00',
        preferredActivity: 'Review & Admin',
        energyScore: 60,
      },
    ];
  }

  // 3. OptaPy Constraint-Satisfaction Multi-Objective Schedule Generator
  public static generateCandidateSchedules(baseEvents: InternalCalendarEvent[]): OptaPyScheduleCandidate[] {
    return [
      {
        id: 'sched-opt-a',
        name: 'Schedule A: Balanced Energy & Cognitive Flow (Recommended)',
        description: 'Allocates high-demand writing to 95-score morning windows with 15-minute restorative buffers.',
        totalScore: 96.4,
        hardConstraintsViolated: 0,
        softConstraintSatisfactionPct: 98.2,
        deepWorkHoursTotal: 6.0,
        meetingHoursTotal: 1.25,
        energyWindowAlignmentPct: 96.5,
        events: baseEvents,
        recommendedReason: 'Zero hard constraint violations, 100% adherence to morning deep-work policy, optimal transit buffers.',
      },
      {
        id: 'sched-opt-b',
        name: 'Schedule B: Front-Loaded Deep Work & Research',
        description: 'Clusters all analytical tasks into consecutive 3.5h uninterrupted blocks, moving all syncs past 16:00.',
        totalScore: 91.8,
        hardConstraintsViolated: 0,
        softConstraintSatisfactionPct: 92.4,
        deepWorkHoursTotal: 7.5,
        meetingHoursTotal: 1.25,
        energyWindowAlignmentPct: 91.0,
        events: baseEvents,
        recommendedReason: 'Maximizes contiguous deep work time for heavy manuscript derivations, but compresses late afternoon meetings.',
      },
      {
        id: 'sched-opt-c',
        name: 'Schedule C: Compact Afternoon Meeting Cluster',
        description: 'Batches all academic calls into a single 2-hour back-to-back block to eliminate mid-day fragmentation.',
        totalScore: 88.2,
        hardConstraintsViolated: 0,
        softConstraintSatisfactionPct: 86.7,
        deepWorkHoursTotal: 5.5,
        meetingHoursTotal: 2.0,
        energyWindowAlignmentPct: 88.5,
        events: baseEvents,
        recommendedReason: 'Reduces context switches, though consecutive calls may cause mild vocal and cognitive fatigue.',
      },
    ];
  }

  // 4. Collision & Conflict Detection Engine
  public static detectConflicts(events: InternalCalendarEvent[]): DetectedCalendarConflict[] {
    return [
      {
        id: 'conf-001',
        severity: 'critical',
        title: 'Hardware Benchmarking overlaps with NSF Budget Review Deadline',
        conflictingEventIds: ['evt-001', 'evt-004'],
        conflictingEventTitles: [
          'NSF CAREER Budgetary Review & Grant Submission Block',
          'Jetson Orin Edge Benchmarking & Latency Sweep',
        ],
        conflictWindow: {
          start: '2026-08-14T11:00:00-07:00',
          end: '2026-08-14T11:30:00-07:00',
        },
        rootCause: 'Hardware Lab session prep buffer exceeds allocated window before external NSF portal lock.',
        isResolved: false,
        resolutionOptions: [
          {
            id: 'res-opt-1',
            description: 'Shift Hardware Benchmarking to Friday afternoon (14:00 - 15:45 PST)',
            actionType: 'shift_task_deadline',
            impactSummary: 'Resolves overlap completely, preserving morning peak focus for $500k NSF grant.',
            requiresExternalApproval: false,
          },
          {
            id: 'res-opt-2',
            description: 'Split Edge Benchmarking into two 50-minute micro-sessions',
            actionType: 'split_task',
            impactSummary: 'Allows initial data capture today with analysis tomorrow.',
            requiresExternalApproval: false,
          },
        ],
      },
    ];
  }

  // 5. Time Tracking & Actual vs. Planned Analytics
  public static getTimeAnalytics(): TimeTrackingAnalytics {
    return {
      weeklyTotalHours: 42.5,
      actualVsTarget: [
        {
          category: 'Deep Work & Research' as const,
          actualHours: 22.5,
          targetHours: 20.0,
          actualPercentage: 53,
          targetPercentage: 47,
          status: 'on_track' as const,
        },
        {
          category: 'Meetings' as const,
          actualHours: 9.5,
          targetHours: 8.0,
          actualPercentage: 22,
          targetPercentage: 19,
          status: 'on_track' as const,
        },
        {
          category: 'Proposal Writing' as const,
          actualHours: 7.0,
          targetHours: 10.0,
          actualPercentage: 16,
          targetPercentage: 24,
          status: 'under_allocated' as const,
        },
        {
          category: 'Admin & Email' as const,
          actualHours: 3.5,
          targetHours: 4.5,
          actualPercentage: 9,
          targetPercentage: 10,
          status: 'on_track' as const,
        },
      ],
      estimationAccuracyRate: 88,
      aiInsights: [
        'Morning Deep Work focus blocks protected 92% of scheduled time from meeting incursions.',
        'Proposal Writing is under-allocated by 3.0 hours relative to upcoming NSF August 22 deadline.',
        'Recommendation: Auto-provision a 3-hour Protected Focus Block on Monday 09:00 for NSF FastLane upload.',
      ],
      topProductivityDay: 'Tuesday (9.2 hrs Deep Focus)',
      focusBlockProtectionRatePct: 92,
    };
  }

  // 6. Incoming Meeting Extractor from Email Assistant
  public static getExtractedMeetingProposals(): IncomingMeetingExtraction[] {
    return [
      {
        id: 'ext-meet-01',
        sourceEmailId: 'email-002',
        senderName: 'Prof. Katherine Chen',
        senderEmail: 'k.chen@stanford.edu',
        emailSubject: 'Re: Collaboration on Neuromorphic Motor Cortex Spatial Transcriptomics',
        extractedTitle: 'Spatial Transcriptomics & Co-Authorship Sync with Prof. Chen',
        extractedProposedTimes: [
          {
            startTime: '2026-08-14T15:00:00-07:00',
            endTime: '2026-08-14T15:30:00-07:00',
            isUserAvailable: true,
          },
          {
            startTime: '2026-08-14T16:30:00-07:00',
            endTime: '2026-08-14T17:00:00-07:00',
            isUserAvailable: false, // clashes with MIT Vance sync
          },
        ],
        selectedTimeIndex: 0,
        extractedLocationOrLink: 'Google Meet',
        status: 'pending_user_review',
      },
      {
        id: 'ext-meet-02',
        sourceEmailId: 'email-003',
        senderName: 'Dr. Marcus Vance',
        senderEmail: 'm.vance@media.mit.edu',
        emailSubject: 'Joint Submission Proposal: IEEE Neuromorphic Challenge 2026',
        extractedTitle: 'MIT Media Lab Optical Neuromorphic Architecture Exploratory Call',
        extractedProposedTimes: [
          {
            startTime: '2026-08-18T11:00:00-07:00',
            endTime: '2026-08-18T11:30:00-07:00',
            isUserAvailable: true,
          },
        ],
        selectedTimeIndex: 0,
        extractedLocationOrLink: 'Microsoft Teams',
        status: 'pending_user_review',
      },
    ];
  }
}
