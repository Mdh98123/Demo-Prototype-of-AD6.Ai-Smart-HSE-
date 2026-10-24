// services/userProfileService.ts
// Enterprise User Profiles, 10+ Interconnected Activities, Actions & Live Stats Engine

import { 
  UserProfile, 
  UserActivityRecord, 
  UserPendingActionRecord, 
  UserCompletedActionRecord, 
  UserNotificationRecord, 
  UserActivityStats 
} from '../types';
import { GULF_ENERGY_USERS } from './demoDataLoader';
import { EXTENDED_ENTERPRISE_USERS } from './userProfilesExtended';
import { SecureStorage } from './storageService';

const STORAGE_USERS_KEY = 'ad6_enterprise_user_profiles_v3';

export class UserProfileService {
  private static cachedUsers: UserProfile[] | null = null;

  // Load enriched profiles with 10+ activities, 10+ pending actions, 10+ completed actions, 10+ notifications
  public static async getAllUsers(): Promise<UserProfile[]> {
    if (this.cachedUsers && this.cachedUsers.length > 0) {
      return this.cachedUsers;
    }

    try {
      const stored = await SecureStorage.getItem<UserProfile[]>(STORAGE_USERS_KEY);
      if (stored && Array.isArray(stored) && stored.length > 0) {
        this.cachedUsers = stored;
        return stored;
      }
    } catch {
      // Fallback
    }

    const seeded = this.generateRealisticEnterpriseUsers();
    this.cachedUsers = seeded;
    await SecureStorage.setItem(STORAGE_USERS_KEY, seeded);
    return seeded;
  }

  public static async getUserById(userId: string): Promise<UserProfile | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  }

  // Calculate live statistics based on real activities and assignments
  public static calculateLiveStats(user: UserProfile): UserActivityStats {
    const activities = user.activities || [];
    const pending = user.pendingActions || [];
    const completed = user.completedActions || [];

    const incidentsReported = activities.filter(a => a.category === 'Incident').length;
    const inspectionsCompleted = activities.filter(a => a.category === 'Inspection').length;
    const actionsAssigned = pending.length;
    const actionsCompleted = completed.length;
    const actionsOverdue = pending.filter(p => p.isOverdue).length;
    const approvalsCompleted = activities.filter(a => a.actionType.includes('Approved') || a.actionType.includes('Authorized')).length;
    const auditsParticipated = activities.filter(a => a.category === 'Audit').length;
    const trainingCompleted = activities.filter(a => a.category === 'Training').length;
    const observationsSubmitted = activities.filter(a => a.category === 'Observation').length;
    const swaEventsTriggered = activities.filter(a => a.category === 'SWA').length;

    const complianceRate = Math.min(100, Math.max(88, Math.round(100 - (actionsOverdue * 3.5))));

    return {
      totalActivities: activities.length,
      incidentsReported,
      inspectionsCompleted,
      actionsAssigned,
      actionsCompleted,
      actionsOverdue,
      approvalsCompleted,
      auditsParticipated,
      trainingCompleted,
      observationsSubmitted,
      tasksCompleted: actionsCompleted,
      swaEventsTriggered,
      complianceRate
    };
  }

  // Record a live activity for a user
  public static async recordLiveActivity(userId: string, activity: Omit<UserActivityRecord, 'id' | 'timestamp' | 'timePeriod'>): Promise<void> {
    const users = await this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    const newActivity: UserActivityRecord = {
      id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      timePeriod: 'Recent',
      ...activity
    };

    const targetUser = users[userIndex];
    const existingActivities = targetUser.activities || [];
    targetUser.activities = [newActivity, ...existingActivities];
    targetUser.statistics = this.calculateLiveStats(targetUser);

    users[userIndex] = targetUser;
    this.cachedUsers = users;
    await SecureStorage.setItem(STORAGE_USERS_KEY, users);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ad6-user-activity-updated', { detail: { userId, activity: newActivity } }));
    }
  }

  // Complete a pending work queue action and transfer to completed actions + live activity
  public static async completePendingAction(userId: string, actionId: string, notes?: string): Promise<boolean> {
    const users = await this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    const user = users[userIndex];
    const pendingIndex = (user.pendingActions || []).findIndex(p => p.id === actionId);
    if (pendingIndex === -1) return false;

    const action = user.pendingActions![pendingIndex];
    user.pendingActions!.splice(pendingIndex, 1);

    const completedRecord: UserCompletedActionRecord = {
      id: `CMP-${Date.now().toString(36).toUpperCase()}`,
      title: action.title,
      sourceType: action.sourceType,
      sourceId: action.sourceId,
      completedDate: new Date().toISOString(),
      outcome: notes || `Action "${action.requiredAction}" successfully completed and verified.`,
      verifiedBy: user.name,
      evidenceNotes: 'Signed off via Enterprise User Profile Work Queue.',
      location: action.location
    };
    user.completedActions = [completedRecord, ...(user.completedActions || [])];

    const newActivity: UserActivityRecord = {
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timePeriod: 'Recent',
      category: (action.sourceType === 'Permit' ? 'Permit' : action.sourceType === 'Incident' ? 'Incident' : action.sourceType === 'Inspection' ? 'Inspection' : action.sourceType === 'Audit' ? 'Audit' : 'CAPA') as any,
      actionType: 'Completed Action',
      entityId: action.sourceId,
      entityTitle: action.title,
      details: notes || `Executed required action: ${action.requiredAction}`,
      impactResult: 'Task closed out in accordance with enterprise SLA guidelines.'
    };
    user.activities = [newActivity, ...(user.activities || [])];
    user.statistics = this.calculateLiveStats(user);

    users[userIndex] = user;
    this.cachedUsers = users;
    await SecureStorage.setItem(STORAGE_USERS_KEY, users);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ad6-user-activity-updated', { detail: { userId } }));
    }
    return true;
  }

  // Mark a user notification as read
  public static async markNotificationRead(userId: string, notificationId: string): Promise<boolean> {
    const users = await this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    const user = users[userIndex];
    const n = (user.notifications || []).find(notif => notif.id === notificationId);
    if (n) {
      n.read = true;
      users[userIndex] = user;
      this.cachedUsers = users;
      await SecureStorage.setItem(STORAGE_USERS_KEY, users);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ad6-user-activity-updated', { detail: { userId } }));
      }
      return true;
    }
    return false;
  }

  // Generator: Realistic enterprise users with 10+ entries across each category
  public static generateRealisticEnterpriseUsers(): UserProfile[] {
    return [
      // 1. Marcus Chen - Site Supervisor & Area Authority (UAE)
      {
        id: 'u7',
        name: 'Marcus Chen',
        email: 'marcus.chen@gulfenergy.ae',
        role: 'Site_Supervisor',
        department: 'Operations & Area Authority',
        businessUnit: 'Upstream Gas Processing & Power',
        organization: 'Gulf Energy Maritime & Infrastructure',
        siteLocation: 'Al-Ruwais Polyolefin Asset (UAE)',
        employeeId: 'GE-AUH-3042',
        jobTitle: 'Senior Site Operations Supervisor & Area Authority',
        managerName: 'Sarah Jones (Site HSE Manager)',
        phoneExtension: '+971 2 602 3042',
        employmentStatus: 'Active',
        joiningDate: '2021-04-12',
        safetyScore: 1480,
        recentIncidents: ['Supervised high-voltage line maintenance', 'Resolved scaffolding toe-board clash'],
        observations: [],
        responsibilities: [
          'Area Authority sign-off for Hot Work, Cold Work and Confined Space entry',
          'Coordination of live SIMOPS de-confliction across Berth 1 & Substation 3',
          'Enforcing zero energy isolation padlocks (LOTO Box #14)'
        ],
        skills: ['SIMOPS De-Confliction', 'LOTO Zero Energy Isolation', 'Gas Testing Level III', 'Incident Triage'],
        competencies: [
          { competency: 'Certified Area Authority (PTW Level 3)', level: 'Expert', verifiedDate: '2026-02-10', verifierName: 'Eng. Mansoor Al-Ketbi' },
          { competency: 'Authorized Gas Tester Level III', level: 'Expert', verifiedDate: '2026-01-15', verifierName: 'PDO AGT Board' },
          { competency: 'Advanced Incident Containment', level: 'Proficient', verifiedDate: '2025-11-20', verifierName: 'Sarah Jones' }
        ],
        trainingStatus: { totalCourses: 14, completedCourses: 14, overdueCount: 0, complianceRate: 100 },
        assignedProjects: ['Al-Ruwais Train-3 Expansion', 'Subsea Interconnector Phase II'],
        assignedSites: ['Al-Ruwais Polyolefin Asset (UAE)', 'Fahud-West Gas Station (Oman)'],
        currentWorkload: { activeTasks: 6, pendingApprovals: 4, openCapas: 2, utilizationRate: 85 },
        approvalResponsibilities: ['PTW Level 2 & 3 Approvals', 'LOTO Mechanical Spade Removal', 'Hot Work Standby Waivers'],
        certifications: [
          { name: 'Certified Area Authority (PTW Level 3)', status: 'Valid', expiryDate: '2027-11-20' },
          { name: 'NEBOSH International General Certificate', status: 'Valid', expiryDate: '2028-03-15' },
          { name: 'Advanced First Aid & CPR', status: 'Valid', expiryDate: '2027-08-30' }
        ],
        achievements: [
          { id: 'ach-mc-1', title: 'Zero Clash Champion', description: 'Validated 500+ SIMOPS permits without operational conflict', dateEarned: '2026-08-10', icon: 'CheckCircle', tier: 'Gold' },
          { id: 'ach-mc-2', title: 'Eagle Eye', description: 'Zero violations in supervised zones for 6 consecutive months', dateEarned: '2026-04-15', icon: 'Shield', tier: 'Silver' }
        ],
        // Minimum 10 Activities (Timeline: Recent to 90 Days)
        activities: [
          {
            id: 'ACT-MC-01',
            timestamp: '2026-10-07T06:50:00Z',
            timePeriod: 'Recent',
            actionType: 'Authorized Permit',
            category: 'Permit',
            entityId: 'PTW-2026-8809',
            entityTitle: 'Cold Work: Pump P-204 Impeller Replacement',
            details: 'Signed Area Authority digital verification following LOTO zero-energy verification.',
            impactResult: 'Work safely energized and cleared for mechanical overhaul.'
          },
          {
            id: 'ACT-MC-02',
            timestamp: '2026-10-06T15:20:00Z',
            timePeriod: 'Recent',
            actionType: 'Resolved SWA',
            category: 'SWA',
            entityId: 'SWA-2026-104',
            entityTitle: 'Scaffolding Toe-board Stoppage',
            details: 'Verified replacement of missing toe-boards and safe harness tag before lifting hold.',
            impactResult: 'Operations approved to resume safely.'
          },
          {
            id: 'ACT-MC-03',
            timestamp: '2026-10-05T09:30:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Completed Inspection',
            category: 'Inspection',
            entityId: 'INSP-2026-001',
            entityTitle: 'Scaffolding & Work at Height Inspection',
            details: 'Conducted bi-weekly scaffolding structural audit across Manifold 6 with score 92%.',
            impactResult: 'Two minor tag corrections resolved on site.'
          },
          {
            id: 'ACT-MC-04',
            timestamp: '2026-10-04T11:45:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Reviewed Incident',
            category: 'Incident',
            entityId: 'INC-2026-UAE-0622',
            entityTitle: 'Dropped Scaffolding Coupler Near-Miss',
            details: 'Conducted drop containment stand-down and verified tethering pouch rollout.',
            impactResult: 'Stand-down completed with 24 scaffolders.'
          },
          {
            id: 'ACT-MC-05',
            timestamp: '2026-10-02T14:10:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Assigned Action',
            category: 'CAPA',
            entityId: 'CAPA-2026-04',
            entityTitle: 'Tethered Tool Pouch Enforcement',
            details: 'Assigned mandatory tool tether protocol to Petrofac subcontractor lead.',
            impactResult: 'Assigned with 5-day closure target.'
          },
          {
            id: 'ACT-MC-06',
            timestamp: '2026-09-28T08:00:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Participated in Audit',
            category: 'Audit',
            entityId: 'AUD-2026-004',
            entityTitle: 'Abu Dhabi OSHAD-SF Mechanism 11.0 Verification',
            details: 'Demonstrated confined space gas logs and hot work permit archives to lead auditor Sarah Jenkins.',
            impactResult: 'Zero major non-conformances awarded.'
          },
          {
            id: 'ACT-MC-07',
            timestamp: '2026-09-22T10:00:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Approved Risk Assessment',
            category: 'Risk Assessment',
            entityId: 'RAMS-2026-089',
            entityTitle: 'Heavy Flare Riser Replacement Method Statement',
            details: 'Approved tandem lift crane positioning plan after verifying ground bearing pressure.',
            impactResult: 'RAMS authorized for site execution.'
          },
          {
            id: 'ACT-MC-08',
            timestamp: '2026-09-15T07:30:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Delivered Toolbox Talk',
            category: 'Meeting',
            entityId: 'TBT-2026-0915',
            entityTitle: 'Midday Heat Ban & Hydration Roster Briefing',
            details: 'Briefed 45 field technicians on UAE Ministry of Human Resources summer break rules.',
            impactResult: '100% attendance recorded.'
          },
          {
            id: 'ACT-MC-09',
            timestamp: '2026-08-30T13:45:00Z',
            timePeriod: 'Last 90 Days',
            actionType: 'Closed Corrective Action',
            category: 'CAPA',
            entityId: 'CAPA-2026-08',
            entityTitle: 'Eye Wash Station Digital Flow Sensors',
            details: 'Inspected acid skid eye wash flow telemetry and closed action with test verification.',
            impactResult: 'Action verified and closed.'
          },
          {
            id: 'ACT-MC-10',
            timestamp: '2026-08-12T09:00:00Z',
            timePeriod: 'Last 90 Days',
            actionType: 'Completed Training',
            category: 'Training',
            entityId: 'TRN-2026-088',
            entityTitle: 'Annual Sour Gas H2S Emergency Response Refresher',
            details: 'Completed SCBA drill and escape hood practical simulation with 100% score.',
            impactResult: 'Certification renewed for 12 months.'
          }
        ],
        // Minimum 10 Pending Actions
        pendingActions: [
          { id: 'PND-MC-01', title: 'Permit Sign-Off: PTW-2026-8848 Flare Knockout Drum Welding', sourceType: 'Permit', sourceId: 'PTW-2026-8848', priority: 'P1 - Critical', dueDate: '2026-10-07', daysRemaining: 0, isOverdue: false, status: 'Pending Authorization', requiredAction: 'Area Authority digital signature required', location: 'Fahud-West Gas Station · Flare Skid' },
          { id: 'PND-MC-02', title: 'Pre-Shift LOTO Audit: Box #LOTO-14 Zero Energy Check', sourceType: 'Inspection', sourceId: 'LOTO-14', priority: 'P2 - High', dueDate: '2026-10-08', daysRemaining: 1, isOverdue: false, status: 'Scheduled', requiredAction: 'Verify physical padlock tag numbers against isolation list', location: 'Water Treatment Train B' },
          { id: 'PND-MC-03', title: 'Verify CAPA Closure: Tool Tether Pouch Distribution', sourceType: 'CAPA', sourceId: 'CAPA-2026-04', priority: 'P2 - High', dueDate: '2026-10-09', daysRemaining: 2, isOverdue: false, status: 'Pending Verification', requiredAction: 'Confirm 100% receipt of tether bags by Petrofac riggers', location: 'Reactor Structure R-201' },
          { id: 'PND-MC-04', title: 'Review JSA: Underground Subsea Trench Shoring Box Placement', sourceType: 'Risk Assessment', sourceId: 'JSA-2026-112', priority: 'P2 - High', dueDate: '2026-10-08', daysRemaining: 1, isOverdue: false, status: 'In Review', requiredAction: 'Review lifting crane radius and underground cable clearances', location: 'Coastal Utility Corridor' },
          { id: 'PND-MC-05', title: 'Permit Extension Review: PTW-2026-8852 Working at Height', sourceType: 'Permit', sourceId: 'PTW-2026-8852', priority: 'P2 - High', dueDate: '2026-10-07', daysRemaining: 0, isOverdue: false, status: 'Action Required', requiredAction: 'Review wind speed telemetry before granting 4-hour night extension', location: '65m Flare Tip Platform' },
          { id: 'PND-MC-06', title: 'Attend Incident Investigation Board: INC-2026-OMN-1014', sourceType: 'Incident', sourceId: 'INC-2026-OMN-1014', priority: 'P2 - High', dueDate: '2026-10-09', daysRemaining: 2, isOverdue: false, status: 'Under Investigation', requiredAction: 'Provide supervisor testimony regarding sampling cabinet maintenance', location: 'Group Virtual Teams' },
          { id: 'PND-MC-07', title: 'Complete Quarterly SCBA Equipment Inspection', sourceType: 'Inspection', sourceId: 'INSP-SCBA-Q4', priority: 'P3 - Medium', dueDate: '2026-10-12', daysRemaining: 5, isOverdue: false, status: 'Pending', requiredAction: 'Inspect 12 positive-pressure breathing apparatus sets in Muster Bay', location: 'Substation SS-02' },
          { id: 'PND-MC-08', title: 'Review SIMOPS Matrix: Dredging vs Jetty Maintenance', sourceType: 'Permit', sourceId: 'SIMOPS-2026-09', priority: 'P2 - High', dueDate: '2026-10-10', daysRemaining: 3, isOverdue: false, status: 'Pending Approval', requiredAction: 'Verify 50m exclusion zone between suction dredger and fuel bunkering', location: 'Ras Al-Khair Berth 2' },
          { id: 'PND-MC-09', title: 'Renew AGT Recertification Booking Confirmation', sourceType: 'Training', sourceId: 'TRN-AGT-2026', priority: 'P3 - Medium', dueDate: '2026-10-15', daysRemaining: 8, isOverdue: false, status: 'Upcoming', requiredAction: 'Submit logbook of 30 sour gas tests to ADNOC academy', location: 'ADNOC HQ Portal' },
          { id: 'PND-MC-10', title: 'Overdue Contractor Insurance Vetting: Petrofac Crane Crew', sourceType: 'Inspection', sourceId: 'VET-PETROFAC-01', priority: 'P1 - Critical', dueDate: '2026-10-06', daysRemaining: -1, isOverdue: true, status: 'Overdue', requiredAction: 'Confirm third-party liability certificate renewal', location: 'Contractor Compliance Hub' }
        ],
        // Minimum 10 Completed Actions
        completedActions: [
          { id: 'CMP-MC-01', title: 'Permit PTW-2026-8809 Impeller Replacement Closed', sourceType: 'Permit', sourceId: 'PTW-2026-8809', completedDate: '2026-10-06T18:00:00Z', outcome: 'Overhaul finished; zero energy locks released.', verifiedBy: 'Sarah Jones', evidenceNotes: 'Zero leaks observed during test run.', location: 'Water Treatment Train B' },
          { id: 'CMP-MC-02', title: 'Lifting Rigging Equipment Pre-Use Inspection', sourceType: 'Inspection', sourceId: 'INSP-2026-003', completedDate: '2026-10-05T14:30:00Z', outcome: 'All 8 wire rope slings certified with valid green tags.', verifiedBy: 'Zaid Al-Otaibi', evidenceNotes: 'Digital photos attached to log.', location: 'Ras Al-Khair Dry Dock' },
          { id: 'CMP-MC-03', title: 'SWA-2026-104 Hazard Mitigation Verification', sourceType: 'SWA', sourceId: 'SWA-2026-104', completedDate: '2026-10-06T15:00:00Z', outcome: 'Toe-board fastened with steel couplers.', verifiedBy: 'Marcus Chen', evidenceNotes: 'Inspection photo confirmed toe-board integrity.', location: 'Manifold 6 Scaffolding' },
          { id: 'CMP-MC-04', title: 'Audit AUD-2026-003 Findings Closure', sourceType: 'Audit', sourceId: 'AUD-2026-003', completedDate: '2026-10-01T11:00:00Z', outcome: 'Secondary whip-checks installed on test manifolds.', verifiedBy: 'Dr. Layla Hassan', evidenceNotes: 'Closed in accordance with PDO PR-1148 standard.', location: 'Fahud-West Gas Station' },
          { id: 'CMP-MC-05', title: 'Permit PTW-2026-8833 Flare Tip Pyrometer Replacement', sourceType: 'Permit', sourceId: 'PTW-2026-8833', completedDate: '2026-09-29T17:30:00Z', outcome: 'Rope access technicians completed work safely.', verifiedBy: 'Eng. Mansoor Al-Ketbi', evidenceNotes: 'Handover certificate signed.', location: '65m Flare Tip Platform' },
          { id: 'CMP-MC-06', title: 'Hot Work Habitat Pressure Integrity Test', sourceType: 'Inspection', sourceId: 'INSP-HAB-09', completedDate: '2026-09-25T08:15:00Z', outcome: 'Positive pressure differential maintained at 50 Pa.', verifiedBy: 'Salim Al-Harthy', evidenceNotes: 'Pressure chart recorder printout logged.', location: 'Refinery Skid C-10' },
          { id: 'CMP-MC-07', title: 'Emergency Eye Wash Station Flow Rate Test', sourceType: 'Inspection', sourceId: 'INSP-2026-009', completedDate: '2026-09-20T13:00:00Z', outcome: 'Discharge flow 78 L/min compliant with ANSI Z358.1.', verifiedBy: 'Fatima Al-Kaabi', evidenceNotes: 'Water temperature calibrated at 24°C.', location: 'Chemical Storage Area' },
          { id: 'CMP-MC-08', title: 'Confined Space Column C-102 De-Isolation', sourceType: 'Permit', sourceId: 'PTW-2026-8790', completedDate: '2026-09-18T16:00:00Z', outcome: 'Internal inspection cleared; column manways bolted.', verifiedBy: 'Marcus Chen', evidenceNotes: 'Gas test confirmed 20.9% O2, 0 ppm CO.', location: 'Column C-102' },
          { id: 'CMP-MC-09', title: 'Toolbox Briefing: Lifting Over Live Hydrocarbon Piping', sourceType: 'Meeting', sourceId: 'TBT-2026-0912', completedDate: '2026-09-12T07:00:00Z', outcome: 'Briefed 18 crane crew operators on crane load limiters.', verifiedBy: 'Marcus Chen', evidenceNotes: 'Signed attendance register uploaded.', location: 'Berth 1 Yard' },
          { id: 'CMP-MC-10', title: 'Annual Fire Warden Practical Drill', sourceType: 'Training', sourceId: 'TRN-2026-FW', completedDate: '2026-08-25T11:00:00Z', outcome: 'Cleared building evacuation drill in 2 mins 45 secs.', verifiedBy: 'Civil Defence Abu Dhabi', evidenceNotes: 'Drill evaluation score 96/100.', location: 'Operations Admin Building' }
        ],
        // Minimum 10 Notifications
        notifications: [
          { id: 'NTF-MC-01', timestamp: '2026-10-07T06:45:00Z', title: 'Permit Sign-Off Required', message: 'Pre-ignition gas test completed (0% LEL, 0 ppm H2S). Awaiting signature for PTW-2026-8848.', severity: 'High', category: 'PTW', sourceId: 'PTW-2026-8848', read: false, senderName: 'Salim Al-Harthy' },
          { id: 'NTF-MC-02', timestamp: '2026-10-06T08:15:00Z', title: '🚨 Stop Work Authority Triggered', message: 'Rahul Gupta halted lifting operations at Fahud-West due to missing scaffold toe-board.', severity: 'Critical', category: 'SWA', sourceId: 'SWA-2026-104', read: true, senderName: 'Rahul Gupta' },
          { id: 'NTF-MC-03', timestamp: '2026-10-05T14:20:00Z', title: 'CAPA Action Assigned to Team', message: 'Fatima Al-Zaabi assigned whip-check retrofit action CAPA-2026-01 to your department.', severity: 'High', category: 'CAPA', sourceId: 'CAPA-2026-01', read: true, senderName: 'Fatima Al-Zaabi' },
          { id: 'NTF-MC-04', timestamp: '2026-10-04T11:30:00Z', title: 'Incident Report Notification', message: 'New dropped object near-miss logged (INC-2026-UAE-0622). Area authority review required.', severity: 'Medium', category: 'Incident', sourceId: 'INC-2026-UAE-0622', read: true, senderName: 'Tariq Al-Hashemi' },
          { id: 'NTF-MC-05', timestamp: '2026-10-03T16:00:00Z', title: 'SIMOPS Conflict Cleared', message: 'Dredging vessel departed Berth 2; hot work permit restrictions lifted on Jetty Crane.', severity: 'Low', category: 'PTW', sourceId: 'SIMOPS-2026-08', read: true, senderName: 'Eng. Mansoor Al-Ketbi' },
          { id: 'NTF-MC-06', timestamp: '2026-10-02T09:10:00Z', title: 'Audit Action Verification Needed', message: 'Action CA-301 ready for supervisor closure sign-off following ISO 45001 audit.', severity: 'Medium', category: 'Audit', sourceId: 'AUD-2026-003', read: true, senderName: 'Sarah Jenkins' },
          { id: 'NTF-MC-07', timestamp: '2026-09-30T13:40:00Z', title: 'Heat Stress Advisory Level: Amber', message: 'WBGT index reached 31.8°C at 13:00. Implement mandatory 15-min rest cycles in shaded areas.', severity: 'Medium', category: 'Health', sourceId: 'ENV-HEAT-30', read: true, senderName: 'Dr. Mariam Al-Balushi' },
          { id: 'NTF-MC-08', timestamp: '2026-09-28T17:00:00Z', title: 'Field Inspection Overdue Warning', message: 'Subsea Interconnector Cable Trench weekly shoring check is due tomorrow morning.', severity: 'Medium', category: 'Inspection', sourceId: 'INSP-2026-010', read: true, senderName: 'System Scheduler' },
          { id: 'NTF-MC-09', timestamp: '2026-09-25T10:15:00Z', title: 'Gas Detector Bump Test Notice', message: 'Multi-gas monitor serial BW-GAS-9912 calibration valid through next 14 days.', severity: 'Low', category: 'Equipment', sourceId: 'EQ-BW-9912', read: true, senderName: 'Asset Integrity Bot' },
          { id: 'NTF-MC-10', timestamp: '2026-09-20T08:00:00Z', title: 'Policy Update: OSHAD CoP 21.0 Revision', message: 'Updated Permit to Work digital signature guidelines published to document center.', severity: 'Low', category: 'Policy', sourceId: 'DMS-OSHAD-21', read: true, senderName: 'Dr. Layla Hassan' }
        ]
      },

      // 2. Fatima Al-Zaabi / Fatima Al-Kaabi - Site HSE Officer & Auditor (UAE)
      {
        id: 'u5',
        name: 'Fatima Al-Zaabi',
        email: 'fatima.zaabi@gulfenergy.ae',
        role: 'HSE_Officer',
        department: 'Site HSE Assurance & Compliance',
        businessUnit: 'Downstream Refining & Chemicals',
        organization: 'Gulf Energy Maritime & Infrastructure',
        siteLocation: 'Al-Ruwais Polyolefin Asset (UAE)',
        employeeId: 'GE-AUH-4412',
        jobTitle: 'Lead Site HSE Assurance Officer & Lead Auditor',
        managerName: 'Sarah Jones (Site HSE Manager)',
        phoneExtension: '+971 2 602 4412',
        employmentStatus: 'Active',
        joiningDate: '2022-01-15',
        safetyScore: 1620,
        recentIncidents: ['Investigated dropped object near-miss R-201', 'Audited confined space entry gas records'],
        observations: [],
        responsibilities: [
          'Conducting ISO 45001 & OSHAD-SF Mechanism 11.0 compliance audits',
          'Leading 5-Why root cause investigations for high-potential incidents',
          'Overseeing CAPA closure evidence verification and statutory reporting'
        ],
        skills: ['ISO 45001 Lead Auditor', 'Root Cause Investigation (5-Why)', 'OSHAD-SF Compliance', 'Chemical Hazard Assessment'],
        competencies: [
          { competency: 'IRCA Certified Lead Auditor ISO 45001', level: 'Expert', verifiedDate: '2026-03-01', verifierName: 'IRCA Board' },
          { competency: 'TapRooT Root Cause Team Leader', level: 'Expert', verifiedDate: '2025-10-15', verifierName: 'Dr. Vikram Malhotra' },
          { competency: 'OSHAD General Practitioner', level: 'Expert', verifiedDate: '2025-08-20', verifierName: 'Abu Dhabi OSHAD' }
        ],
        trainingStatus: { totalCourses: 16, completedCourses: 16, overdueCount: 0, complianceRate: 100 },
        assignedProjects: ['Polyolefin Plant Turnaround 2026', 'Zero SIF Safety Vanguard'],
        assignedSites: ['Al-Ruwais Polyolefin Asset (UAE)'],
        currentWorkload: { activeTasks: 5, pendingApprovals: 3, openCapas: 4, utilizationRate: 88 },
        approvalResponsibilities: ['Incident Investigation Sign-off', 'CAPA Verification & Closure', 'High-Risk JSA Endorsement'],
        certifications: [
          { name: 'ISO 45001:2018 Lead Auditor (IRCA Certified)', status: 'Valid', expiryDate: '2028-02-28' },
          { name: 'NEBOSH International Diploma in OHS', status: 'Valid', expiryDate: '2028-06-30' },
          { name: 'OSHAD Certified Practitioner Grade A', status: 'Valid', expiryDate: '2027-09-30' }
        ],
        achievements: [
          { id: 'ach-fz-1', title: 'Inspection Ace', description: 'Logged 250+ digital field observations in mobile PWA offline mode', dateEarned: '2026-07-14', icon: 'ClipboardCheck', tier: 'Gold' },
          { id: 'ach-fz-2', title: 'Zero Repeat Champion', description: 'Zero recurring non-conformances in 12 months across audited units', dateEarned: '2026-05-18', icon: 'Award', tier: 'Gold' }
        ],
        activities: [
          {
            id: 'ACT-FZ-01',
            timestamp: '2026-10-07T05:30:00Z',
            timePeriod: 'Recent',
            actionType: 'Assigned Action',
            category: 'CAPA',
            entityId: 'CAPA-2026-01',
            entityTitle: 'Whip-Check Restraint Retrofit',
            details: 'Reassigned high-pressure hose whip-check installation to subcontractor lead Suresh Pillai.',
            impactResult: '7-day statutory deadline assigned.'
          },
          {
            id: 'ACT-FZ-02',
            timestamp: '2026-10-06T14:10:00Z',
            timePeriod: 'Recent',
            actionType: 'Completed Inspection',
            category: 'Inspection',
            entityId: 'INSP-2026-002',
            entityTitle: 'Substation 3 Electrical & LOTO Isolation',
            details: 'Conducted zero energy audit on 33kV switchgear padlocks; scored 98% with zero safety gaps.',
            impactResult: 'Electrical clearance verified.'
          },
          {
            id: 'ACT-FZ-03',
            timestamp: '2026-10-05T11:00:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Investigated Incident',
            category: 'Incident',
            entityId: 'INC-2026-UAE-0622',
            entityTitle: 'Dropped Coupler at Polyethylene Tower R-201',
            details: 'Completed 5-Why root cause tree; identified missing parts pouch during manual transfer.',
            impactResult: 'RCA submitted to Group HSE.'
          },
          {
            id: 'ACT-FZ-04',
            timestamp: '2026-10-04T15:20:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Completed Inspection',
            category: 'Inspection',
            entityId: 'INSP-2026-006',
            entityTitle: 'Hazardous Chemical Storage Warehouse Bay 2',
            details: 'Audited secondary containment bunds and chemical compatibility segregation matrix.',
            impactResult: 'All SDS sheets confirmed current.'
          },
          {
            id: 'ACT-FZ-05',
            timestamp: '2026-10-02T09:45:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Created Risk Assessment',
            category: 'Risk Assessment',
            entityId: 'HAZ-2026-UAE-102',
            entityTitle: 'Confined Space Nitrogen Purging Nitrogen Line C-102',
            details: 'Calculated asphyxiation plume dispersion distance and established 10m exclusion radius.',
            impactResult: 'High-risk controls mapped in Bowtie visualizer.'
          },
          {
            id: 'ACT-FZ-06',
            timestamp: '2026-09-29T16:00:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Conducted Audit',
            category: 'Audit',
            entityId: 'AUD-2026-004',
            entityTitle: 'Abu Dhabi OSHAD-SF Mechanism 11.0 Verification Audit',
            details: 'Accompanied external auditor Sarah Jenkins across Column entry documentation; achieved 99.1%.',
            impactResult: 'Full compliance verified.'
          },
          {
            id: 'ACT-FZ-07',
            timestamp: '2026-09-24T11:30:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Verified Corrective Action',
            category: 'CAPA',
            entityId: 'CAPA-2026-03',
            entityTitle: 'Digital Gas Log Bump Test Validation',
            details: 'Verified software validation requiring bump test within 12 hours prior to permit entry.',
            impactResult: 'Closed with technical evidence.'
          },
          {
            id: 'ACT-FZ-08',
            timestamp: '2026-09-18T13:15:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Submitted Observation',
            category: 'Observation',
            entityId: 'OBS-2026-441',
            entityTitle: 'Uncertified Extension Lead in Welding Bay',
            details: 'Intervened on contractor using taped extension cable; replaced with industrial IP67 lead.',
            impactResult: 'Immediate hazard removed.'
          },
          {
            id: 'ACT-FZ-09',
            timestamp: '2026-09-10T10:00:00Z',
            timePeriod: 'Last 90 Days',
            actionType: 'Reviewed Training Record',
            category: 'Training',
            entityId: 'TRN-2026-072',
            entityTitle: 'Permit Receiver Competency Review',
            details: 'Audited 50 contractor permit receiver cards; flagged 2 expired credentials for renewal.',
            impactResult: 'Contractor portal records updated.'
          },
          {
            id: 'ACT-FZ-10',
            timestamp: '2026-08-28T08:30:00Z',
            timePeriod: 'Last 90 Days',
            actionType: 'Closed Investigation',
            category: 'Incident',
            entityId: 'INC-2026-UAE-0588',
            entityTitle: 'Nitrogen Purge Hose Minor Leak',
            details: 'Confirmed all crimped fittings replaced with Swagelok dual-ferrule connectors.',
            impactResult: 'Incident investigation signed and archived.'
          }
        ],
        pendingActions: [
          { id: 'PND-FZ-01', title: 'Verify CAPA-2026-01: Stainless Whip-Check Installation', sourceType: 'CAPA', sourceId: 'CAPA-2026-01', priority: 'P1 - Critical', dueDate: '2026-10-08', daysRemaining: 1, isOverdue: false, status: 'In-Progress', requiredAction: 'Inspect physical cable restraints on Fahud high-pressure manifold', location: 'Fahud-West Gas Station' },
          { id: 'PND-FZ-02', title: 'Finalize Incident Investigation: INC-2026-UAE-0622 Dropped Coupler', sourceType: 'Incident', sourceId: 'INC-2026-UAE-0622', priority: 'P2 - High', dueDate: '2026-10-09', daysRemaining: 2, isOverdue: false, status: 'Under Investigation', requiredAction: 'Complete Bowtie diagram and upload witness statements', location: 'Reactor Structure R-201' },
          { id: 'PND-FZ-03', title: 'Conduct Field Inspection: Hazardous Chemical Storage Bunds', sourceType: 'Inspection', sourceId: 'INSP-2026-006', priority: 'P2 - High', dueDate: '2026-10-10', daysRemaining: 3, isOverdue: false, status: 'Scheduled', requiredAction: 'Check sump pumps and level alarms in Drum Yard B', location: 'Warehouse Bay 2' },
          { id: 'PND-FZ-04', title: 'Review Risk Assessment: Tower Crane Dismantling RAMS', sourceType: 'Risk Assessment', sourceId: 'RAMS-2026-104', priority: 'P2 - High', dueDate: '2026-10-09', daysRemaining: 2, isOverdue: false, status: 'In Review', requiredAction: 'Verify outrigger loading calculations on asphalt surface', location: 'Civil Construction Zone' },
          { id: 'PND-FZ-05', title: 'Submit OSHAD Form G Statutory Incident Notification', sourceType: 'Incident', sourceId: 'INC-2026-UAE-0622', priority: 'P1 - Critical', dueDate: '2026-10-08', daysRemaining: 1, isOverdue: false, status: 'Action Required', requiredAction: 'Upload official incident report to Abu Dhabi OSHAD portal', location: 'OSHAD Portal' },
          { id: 'PND-FZ-06', title: 'Audit Closed CAPA Records for Q3 Internal Review', sourceType: 'Audit', sourceId: 'AUD-Q3-CAPA', priority: 'P3 - Medium', dueDate: '2026-10-15', daysRemaining: 8, isOverdue: false, status: 'Pending', requiredAction: 'Sample 20 closed actions for proof of photographic verification', location: 'Group HSE HQ' },
          { id: 'PND-FZ-07', title: 'Contractor Safety Prequalification: STS Oman', sourceType: 'Inspection', sourceId: 'VET-STS-02', priority: 'P2 - High', dueDate: '2026-10-11', daysRemaining: 4, isOverdue: false, status: 'In Review', requiredAction: 'Verify TRIR benchmark < 0.25 over preceding 3-year period', location: 'Contractor Portal' },
          { id: 'PND-FZ-08', title: 'Weekly Noise Survey in Polyethylene Extrusion Bay', sourceType: 'Inspection', sourceId: 'INSP-NOISE-42', priority: 'P3 - Medium', dueDate: '2026-10-12', daysRemaining: 5, isOverdue: false, status: 'Scheduled', requiredAction: 'Log 8-hour TWA decibel levels with calibrated dosimeter', location: 'Extrusion Building' },
          { id: 'PND-FZ-09', title: 'Review JSA: Nitrogen Column Blanketing & Sniff Test', sourceType: 'Risk Assessment', sourceId: 'JSA-2026-098', priority: 'P2 - High', dueDate: '2026-10-10', daysRemaining: 3, isOverdue: false, status: 'Pending Approval', requiredAction: 'Ensure mandatory continuous personal O2 monitor requirement', location: 'Column C-102' },
          { id: 'PND-FZ-10', title: 'Verify Fire Water Ring Main Pressure Log', sourceType: 'Inspection', sourceId: 'INSP-FIRE-09', priority: 'P2 - High', dueDate: '2026-10-09', daysRemaining: 2, isOverdue: false, status: 'Action Required', requiredAction: 'Confirm jockey pump maintains 11.5 bar standby pressure', location: 'Fire Pump Station' }
        ],
        completedActions: [
          { id: 'CMP-FZ-01', title: 'Audit AUD-2026-004 Closed with 99.1% Compliance', sourceType: 'Audit', sourceId: 'AUD-2026-004', completedDate: '2026-09-29T16:00:00Z', outcome: 'OSHAD Mechanism 11.0 score certified.', verifiedBy: 'Sarah Jenkins', evidenceNotes: 'External audit certificate signed.', location: 'Al-Ruwais Polyolefin Asset' },
          { id: 'CMP-FZ-02', title: 'Closed CAPA-2026-02: Scaffolding Toe-Board Standard', sourceType: 'CAPA', sourceId: 'CAPA-2026-02', completedDate: '2026-10-06T16:30:00Z', outcome: 'Toolbox briefing delivered to all scaffolding teams.', verifiedBy: 'Marcus Chen', evidenceNotes: 'Signed attendance log attached.', location: 'Manifold 6 Scaffolding' },
          { id: 'CMP-FZ-03', title: 'Verified Gas Testing Log: Column C-102 Entry', sourceType: 'Permit', sourceId: 'PTW-2026-8790', completedDate: '2026-09-28T09:00:00Z', outcome: 'Zero toxic gas detected across 3 elevations.', verifiedBy: 'Fatima Al-Zaabi', evidenceNotes: 'Logbook stamped and countersigned.', location: 'Column C-102' },
          { id: 'CMP-FZ-04', title: 'Emergency Drill Evaluation: Acid Spill Simulation', sourceType: 'Training', sourceId: 'DRL-2026-ACID', completedDate: '2026-09-22T14:00:00Z', outcome: 'Response team contained mock spill in 3 mins 10 secs.', verifiedBy: 'Dr. Mariam Al-Balushi', evidenceNotes: 'Full debriefing report archived.', location: 'Chemical Storage Area' },
          { id: 'CMP-FZ-05', title: 'Third-Party Lifting Gear Certificate Inspection', sourceType: 'Inspection', sourceId: 'INSP-2026-003', completedDate: '2026-09-18T11:00:00Z', outcome: '100% of rigging hardware verified compliant with LEEA standards.', verifiedBy: 'Zaid Al-Otaibi', evidenceNotes: 'Test certificates validated in database.', location: 'Ras Al-Khair Facility' },
          { id: 'CMP-FZ-06', title: 'Closed Investigation INC-2026-UAE-0588 Nitrogen Hose Leak', sourceType: 'Incident', sourceId: 'INC-2026-UAE-0588', completedDate: '2026-09-15T10:00:00Z', outcome: 'Replaced all flexible rubber hoses with braided stainless steel.', verifiedBy: 'Sarah Jones', evidenceNotes: 'Pressure test certified to 1.5x working pressure.', location: 'Nitrogen Skid' },
          { id: 'CMP-FZ-07', title: 'Quarterly Environmental Noise Monitoring Report', sourceType: 'Inspection', sourceId: 'ENV-NOISE-Q3', completedDate: '2026-09-10T15:00:00Z', outcome: 'All plant boundary noise levels < 65 dBA night limit.', verifiedBy: 'Khalid Al-Dhaheri', evidenceNotes: 'Submitted to Environment Agency Abu Dhabi.', location: 'Boundary Fence' },
          { id: 'CMP-FZ-08', title: 'Chemical Compatibility Storage Segregation Verification', sourceType: 'Inspection', sourceId: 'INSP-2026-006', completedDate: '2026-09-04T13:30:00Z', outcome: 'Organic peroxides separated by 10m from oxidizers.', verifiedBy: 'Fatima Al-Zaabi', evidenceNotes: 'Hazardous storage map updated.', location: 'Warehouse Bay 2' },
          { id: 'CMP-FZ-09', title: 'Respiratory Protective Equipment Fit Testing Session', sourceType: 'Training', sourceId: 'TRN-RPE-2026', completedDate: '2026-08-29T16:00:00Z', outcome: 'Qualitative Bitrex fit tests conducted for 30 technicians.', verifiedBy: 'Fatima Al-Zaabi', evidenceNotes: 'Fit test records logged to employee profiles.', location: 'HSE Training Room' },
          { id: 'CMP-FZ-10', title: 'Annual Review of Hazardous Waste Consignment Notes', sourceType: 'Inspection', sourceId: 'ENV-WASTE-2026', completedDate: '2026-08-20T12:00:00Z', outcome: 'Zero manifest discrepancies with Tadweer approved carriers.', verifiedBy: 'Khalid Al-Dhaheri', evidenceNotes: 'Tadweer manifest receipts verified.', location: 'Waste Transfer Station' }
        ],
        notifications: [
          { id: 'NTF-FZ-01', timestamp: '2026-10-07T05:00:00Z', title: 'CAPA Action Due Tomorrow', message: 'CAPA-2026-01: Stainless whip-check installation deadline expires in 24 hours.', severity: 'High', category: 'CAPA', sourceId: 'CAPA-2026-01', read: false, senderName: 'System Scheduler' },
          { id: 'NTF-FZ-02', timestamp: '2026-10-06T14:30:00Z', title: 'Inspection Score Logged: 98%', message: 'Electrical & LOTO isolation inspection completed with zero open non-conformances.', severity: 'Low', category: 'Inspection', sourceId: 'INSP-2026-002', read: true, senderName: 'PWA Mobile App' },
          { id: 'NTF-FZ-03', timestamp: '2026-10-05T10:15:00Z', title: 'Root Cause Tree Ready for Review', message: '5-Why analysis for incident INC-2026-UAE-0622 has been completed and awaits sign-off.', severity: 'Medium', category: 'Incident', sourceId: 'INC-2026-UAE-0622', read: true, senderName: 'RCA Tool' },
          { id: 'NTF-FZ-04', timestamp: '2026-10-04T12:00:00Z', title: 'Stop Work Authority Notice Broadcast', message: 'SWA triggered by Rahul Gupta on Manifold 6 scaffolding. All high-risk permits paused.', severity: 'Critical', category: 'SWA', sourceId: 'SWA-2026-104', read: true, senderName: 'Rahul Gupta' },
          { id: 'NTF-FZ-05', timestamp: '2026-10-03T16:20:00Z', title: 'Chemical Inventory Alert: Flammables', message: 'Warehouse Bay 2 solvent storage reached 85% licensed maximum threshold.', severity: 'Medium', category: 'Chemicals', sourceId: 'CHM-WH-02', read: true, senderName: 'IoT Sensor Telemetry' },
          { id: 'NTF-FZ-06', timestamp: '2026-10-01T09:00:00Z', title: 'External Audit Report Published', message: 'ISO 45001 Surveillance Audit findings published with zero Major non-conformances.', severity: 'Low', category: 'Audit', sourceId: 'AUD-2026-003', read: true, senderName: 'Dr. Layla Hassan' },
          { id: 'NTF-FZ-07', timestamp: '2026-09-28T14:00:00Z', title: 'Midday Break Heat Advisory', message: 'WBGT thermal index recorded at 32.1°C; outdoor activities suspended until 15:00.', severity: 'High', category: 'Health', sourceId: 'ENV-HEAT-28', read: true, senderName: 'Dr. Mariam Al-Balushi' },
          { id: 'NTF-FZ-08', timestamp: '2026-09-25T11:00:00Z', title: 'Contractor Training Expiring (3 Workers)', message: 'Petrofac scaffolding crew working at height certifications expire in 7 days.', severity: 'Medium', category: 'Training', sourceId: 'TRN-EXP-PETRO', read: true, senderName: 'Training Engine' },
          { id: 'NTF-FZ-09', timestamp: '2026-09-20T08:30:00Z', title: 'New Safety Observation Assigned', message: 'Uncertified electrical cord reported in Welding Bay #3. Immediate review requested.', severity: 'Low', category: 'Observation', sourceId: 'OBS-2026-441', read: true, senderName: 'Marcus Chen' },
          { id: 'NTF-FZ-10', timestamp: '2026-09-15T15:45:00Z', title: 'Statutory Report Accepted by OSHAD', message: 'Abu Dhabi OSHAD portal confirmed receipt of Q3 environmental emissions register.', severity: 'Low', category: 'Compliance', sourceId: 'REG-OSHAD-Q3', read: true, senderName: 'Abu Dhabi OSHAD' }
        ]
      },

      // 3. Rahul Gupta - Lead Mechanical Technician & Field Worker (UAE / Oman)
      {
        id: 'u6',
        name: 'Rahul Gupta',
        email: 'rahul.gupta@gulfenergy.ae',
        role: 'Worker',
        department: 'Mechanical Maintenance & Field Execution',
        businessUnit: 'Maintenance, Turnaround & Overhaul',
        organization: 'Gulf Energy Maritime & Infrastructure',
        siteLocation: 'Al-Ruwais Polyolefin Asset (UAE)',
        employeeId: 'GE-AUH-8821',
        jobTitle: 'Lead Mechanical Technician & Certified Permit Receiver',
        managerName: 'Marcus Chen (Site Supervisor)',
        phoneExtension: '+971 2 602 8821',
        employmentStatus: 'Active',
        joiningDate: '2022-08-01',
        safetyScore: 920,
        recentIncidents: ['Triggered Stop Work Authority for missing scaffolding toe-board', 'Executed pump impeller replacement'],
        observations: [],
        responsibilities: [
          'Safe field execution of rotating equipment mechanical overhaul',
          'Accepting PTW custody following pre-job safety briefing',
          'Exercising Stop Work Authority (SWA) whenever unsafe conditions arise'
        ],
        skills: ['Rotating Equipment Overhaul', 'Rigging & Slinging Level 2', 'H2S Escape Breathing', 'Stop Work Authority'],
        competencies: [
          { competency: 'Certified Permit Receiver (PTW Level 1)', level: 'Expert', verifiedDate: '2026-02-18', verifierName: 'Marcus Chen' },
          { competency: 'Mechanical Lockout / Tagout (LOTO)', level: 'Expert', verifiedDate: '2026-01-20', verifierName: 'Eng. Mansoor Al-Ketbi' },
          { competency: 'H2S Breathing Apparatus Escape', level: 'Proficient', verifiedDate: '2025-09-15', verifierName: 'Fatima Al-Zaabi' }
        ],
        trainingStatus: { totalCourses: 12, completedCourses: 12, overdueCount: 0, complianceRate: 100 },
        assignedProjects: ['Al-Ruwais Train-3 Expansion'],
        assignedSites: ['Al-Ruwais Polyolefin Asset (UAE)', 'Fahud-West Gas Station (Oman)'],
        currentWorkload: { activeTasks: 4, pendingApprovals: 1, openCapas: 1, utilizationRate: 80 },
        approvalResponsibilities: ['Pre-work JSA sign-off', 'Toolbox Talk Acknowledgement'],
        certifications: [
          { name: 'Certified Permit Receiver Level 1', status: 'Valid', expiryDate: '2027-10-15' },
          { name: 'Rigging & Slinging Qualified Rigger (LEEA)', status: 'Valid', expiryDate: '2027-04-20' },
          { name: 'H2S & Confined Space Awareness', status: 'Valid', expiryDate: '2027-08-10' }
        ],
        achievements: [
          { id: 'ach-rg-1', title: 'Stop Work Hero', description: 'Exercised Stop Work Authority preventing potential fall injury', dateEarned: '2026-10-06', icon: 'AlertOctagon', tier: 'Gold' },
          { id: 'ach-rg-2', title: 'Toolbox Leader', description: 'Participated in 200 consecutive incident-free pre-job briefings', dateEarned: '2026-06-20', icon: 'Check', tier: 'Silver' }
        ],
        activities: [
          {
            id: 'ACT-RG-01',
            timestamp: '2026-10-06T08:15:00Z',
            timePeriod: 'Recent',
            actionType: 'Triggered SWA',
            category: 'SWA',
            entityId: 'SWA-2026-104',
            entityTitle: 'Missing Scaffold Toe-board on Manifold 6',
            details: 'Halted crane lifting and work at height after noticing unbolted toe-board directly above access walkway.',
            impactResult: 'Work safely frozen; area barricaded.'
          },
          {
            id: 'ACT-RG-02',
            timestamp: '2026-10-06T07:55:00Z',
            timePeriod: 'Recent',
            actionType: 'Accepted Custody',
            category: 'Permit',
            entityId: 'PTW-2026-8809',
            entityTitle: 'Cold Work: Pump P-204 Impeller Replacement',
            details: 'Signed receiver acceptance after verifying mechanical isolation on Box #LOTO-14.',
            impactResult: 'In field custody with zero-energy locks.'
          },
          {
            id: 'ACT-RG-03',
            timestamp: '2026-10-05T07:45:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Completed Inspection',
            category: 'Inspection',
            entityId: 'INSP-2026-008',
            entityTitle: 'Logistics Yard Forklift FL-12 Pre-Use Check',
            details: 'Completed daily pre-start checklist on hydraulic hoses, horn, seatbelt and emergency beacon.',
            impactResult: 'Equipment cleared for logistics operations.'
          },
          {
            id: 'ACT-RG-04',
            timestamp: '2026-10-03T11:20:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Submitted Observation',
            category: 'Observation',
            entityId: 'OBS-2026-399',
            entityTitle: 'Minor Hydraulic Oil Seepage on Crane Outrigger Pad',
            details: 'Reported oily weeping on crane outrigger cylinder; placed drip pan immediately.',
            impactResult: 'Prevented environmental spill to soil.'
          },
          {
            id: 'ACT-RG-05',
            timestamp: '2026-10-01T07:00:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Attended Meeting',
            category: 'Meeting',
            entityId: 'TBT-2026-1001',
            entityTitle: 'Pinch Point Awareness in Pump Casing Assembly',
            details: 'Attended pre-shift briefing led by Marcus Chen on handling heavy split-casing halves.',
            impactResult: 'Signed attendance log.'
          },
          {
            id: 'ACT-RG-06',
            timestamp: '2026-09-26T14:30:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Completed Task',
            category: 'Permit',
            entityId: 'PTW-2026-8798',
            entityTitle: 'Compressor CP-55 Mechanical Coupling Check',
            details: 'Assisted in alignment check with laser alignment tool; zero vibration detected.',
            impactResult: 'Completed without incident.'
          },
          {
            id: 'ACT-RG-07',
            timestamp: '2026-09-20T09:15:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Completed Training',
            category: 'Training',
            entityId: 'TRN-2026-044',
            entityTitle: 'LEEA Rigging & Slinging Safe Sling Angles',
            details: 'Completed 8-hour practical course on calculating sling tension for asymmetrical loads.',
            impactResult: 'Score 95% on final exam.'
          },
          {
            id: 'ACT-RG-08',
            timestamp: '2026-09-14T10:00:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Participated in Inspection',
            category: 'Inspection',
            entityId: 'INSP-2026-004',
            entityTitle: 'Confined Space Life Safety Inspection C-102',
            details: 'Assisted safety officer in verifying air-mover blower ducting and rescue tripod winch.',
            impactResult: 'Equipment verified ready for entry.'
          },
          {
            id: 'ACT-RG-09',
            timestamp: '2026-09-05T13:40:00Z',
            timePeriod: 'Last 90 Days',
            actionType: 'Reported Near Miss',
            category: 'Incident',
            entityId: 'INC-2026-UAE-0512',
            entityTitle: 'Overhead Crane Pendant Button Sticking',
            details: 'Reported hoist down button sticking on shop crane; immediate lockout applied.',
            impactResult: 'Pendant switch replaced.'
          },
          {
            id: 'ACT-RG-10',
            timestamp: '2026-08-18T08:00:00Z',
            timePeriod: 'Last 90 Days',
            actionType: 'Completed Corrective Action',
            category: 'CAPA',
            entityId: 'CAPA-2026-11',
            entityTitle: 'Install Hose Whip-Checks on 150 PSI Air Manifolds',
            details: 'Installed stainless steel safety cables across all 6 quick-connect coupling hoses.',
            impactResult: 'Verified by safety officer.'
          }
        ],
        pendingActions: [
          { id: 'PND-RG-01', title: 'Active Permit Custody: PTW-2026-8809 Pump Impeller Overhaul', sourceType: 'Permit', sourceId: 'PTW-2026-8809', priority: 'P2 - High', dueDate: '2026-10-07', daysRemaining: 0, isOverdue: false, status: 'In Progress', requiredAction: 'Maintain buddy watch and gas detector active in field custody', location: 'Water Treatment Train B' },
          { id: 'PND-RG-02', title: 'Handover Permit Custody Upon Shift Completion', sourceType: 'Permit', sourceId: 'PTW-2026-8809', priority: 'P2 - High', dueDate: '2026-10-07', daysRemaining: 0, isOverdue: false, status: 'Action Required', requiredAction: 'Sign return custody section with Marcus Chen at shift end', location: 'Permit Office' },
          { id: 'PND-RG-03', title: 'Pre-Use Inspection: Mobile Crane Rigging Hardware Box #4', sourceType: 'Inspection', sourceId: 'INSP-RIG-04', priority: 'P2 - High', dueDate: '2026-10-08', daysRemaining: 1, isOverdue: false, status: 'Scheduled', requiredAction: 'Inspect web slings for frays or chemical degradation', location: 'Maintenance Workshop' },
          { id: 'PND-RG-04', title: 'Complete Safety Briefing Acknowledgment: Heavy Crane Lift', sourceType: 'Risk Assessment', sourceId: 'RAMS-2026-104', priority: 'P2 - High', dueDate: '2026-10-08', daysRemaining: 1, isOverdue: false, status: 'Pending', requiredAction: 'Review exclusion zone plan before tandem lift starts', location: 'Workshop Yard' },
          { id: 'PND-RG-05', title: 'Attend Toolbox Talk: Midday Hydration & Heat Monitoring', sourceType: 'Meeting', sourceId: 'TBT-HEAT-08', priority: 'P3 - Medium', dueDate: '2026-10-08', daysRemaining: 1, isOverdue: false, status: 'Scheduled', requiredAction: 'Report to shaded muster shelter at 07:00', location: 'Zone 3 Shelter' },
          { id: 'PND-RG-06', title: 'Submit Observation Follow-Up: Oil Drip Tray Emptying', sourceType: 'Observation', sourceId: 'OBS-2026-399', priority: 'P3 - Medium', dueDate: '2026-10-09', daysRemaining: 2, isOverdue: false, status: 'Open', requiredAction: 'Empty recovered oil into oily-water collection tank', location: 'Berth 1 Yard' },
          { id: 'PND-RG-07', title: 'Replace Worn Safety Glasses at Tool Crib', sourceType: 'Inspection', sourceId: 'PPE-GLS-01', priority: 'P4 - Routine', dueDate: '2026-10-10', daysRemaining: 3, isOverdue: false, status: 'Pending', requiredAction: 'Exchange scratched anti-fog safety spectacles for new pair', location: 'Tool Crib' },
          { id: 'PND-RG-08', title: 'Monthly Respirator Mask Inspection & Cleaning', sourceType: 'Inspection', sourceId: 'INSP-RESP-10', priority: 'P3 - Medium', dueDate: '2026-10-11', daysRemaining: 4, isOverdue: false, status: 'Pending', requiredAction: 'Sanitize half-face cartridge respirator and inspect diaphragm valve', location: 'Locker Room' },
          { id: 'PND-RG-09', title: 'Online Training Module: Lockout / Tagout Annual Refresher', sourceType: 'Training', sourceId: 'TRN-LOTO-ONLINE', priority: 'P3 - Medium', dueDate: '2026-10-14', daysRemaining: 7, isOverdue: false, status: 'Upcoming', requiredAction: 'Complete 30-minute interactive e-learning video and quiz', location: 'HSE Portal' },
          { id: 'PND-RG-10', title: 'Toolbox Briefing Sign-off: Rotating Equipment Pinch Points', sourceType: 'Meeting', sourceId: 'TBT-PINCH-01', priority: 'P4 - Routine', dueDate: '2026-10-09', daysRemaining: 2, isOverdue: false, status: 'Scheduled', requiredAction: 'Sign digital tablet attendance record', location: 'Workshop' }
        ],
        completedActions: [
          { id: 'CMP-RG-01', title: 'Exercised SWA on Defective Scaffolding', sourceType: 'SWA', sourceId: 'SWA-2026-104', completedDate: '2026-10-06T08:15:00Z', outcome: 'Imminent fall hazard prevented; supervisor rectified condition.', verifiedBy: 'Marcus Chen', evidenceNotes: 'Commended by Site HSE Manager for prompt action.', location: 'Manifold 6' },
          { id: 'CMP-RG-02', title: 'Pump Impeller Uncoupling & Extraction', sourceType: 'Permit', sourceId: 'PTW-2026-8809', completedDate: '2026-10-06T15:00:00Z', outcome: 'Impeller safely rigged out using A-frame gantry hoist.', verifiedBy: 'Marcus Chen', evidenceNotes: 'Casing bolts stored in labeled bins.', location: 'Water Treatment Area' },
          { id: 'CMP-RG-03', title: 'Forklift FL-12 Daily Pre-Use Checklist', sourceType: 'Inspection', sourceId: 'INSP-2026-008', completedDate: '2026-10-05T07:45:00Z', outcome: 'Vehicle passed all 18 safety inspection items.', verifiedBy: 'Rahul Gupta', evidenceNotes: 'Digital checklist logged in PWA app.', location: 'Logistics Yard' },
          { id: 'CMP-RG-04', title: 'Permit PTW-2026-8777 Closed and Surrendered', sourceType: 'Permit', sourceId: 'PTW-2026-8777', completedDate: '2026-10-02T17:30:00Z', outcome: 'Piping flange torqueing complete; work area tidied.', verifiedBy: 'Marcus Chen', evidenceNotes: 'Housekeeping score 10/10.', location: 'Refinery Train B' },
          { id: 'CMP-RG-05', title: 'Emergency Eyewash Station Weekly Bump Test', sourceType: 'Inspection', sourceId: 'INSP-EYE-09', completedDate: '2026-09-28T08:00:00Z', outcome: 'Flushed lines for 3 minutes; water clear.', verifiedBy: 'Rahul Gupta', evidenceNotes: 'Inspection tag signed on unit.', location: 'Workshop Bay' },
          { id: 'CMP-RG-06', title: 'CAPA-2026-11 Hose Restraint Installation', sourceType: 'CAPA', sourceId: 'CAPA-2026-11', completedDate: '2026-09-24T14:00:00Z', outcome: 'Retrofit completed across all 6 compressor airlines.', verifiedBy: 'Fatima Al-Zaabi', evidenceNotes: 'Whip-check certified rated to 300 PSI.', location: 'Maintenance Shop' },
          { id: 'CMP-RG-07', title: 'Toolbox Talk Attendance: Hand Safety & Cut-Resistant Gloves', sourceType: 'Meeting', sourceId: 'TBT-HAND-09', completedDate: '2026-09-18T07:00:00Z', outcome: 'Attended briefing on Level 5 cut-resistant glove mandate.', verifiedBy: 'Marcus Chen', evidenceNotes: 'New gloves issued from tool crib.', location: 'Workshop Yard' },
          { id: 'CMP-RG-08', title: 'Confined Space Standby Watch Duty for Column Entry', sourceType: 'Permit', sourceId: 'PTW-2026-8790', completedDate: '2026-09-12T16:00:00Z', outcome: 'Logged 4 entrants in and out with zero time overruns.', verifiedBy: 'Fatima Al-Zaabi', evidenceNotes: 'Entry log sheet filed with safety department.', location: 'Column C-102' },
          { id: 'CMP-RG-09', title: 'Scaffolding Pre-Climb Harness Check', sourceType: 'Inspection', sourceId: 'INSP-HRN-09', completedDate: '2026-09-08T08:30:00Z', outcome: 'Full body harness webbing and shock absorber inspected.', verifiedBy: 'Tariq Al-Hashemi', evidenceNotes: 'Valid green tag affixed.', location: 'Reactor Tower' },
          { id: 'CMP-RG-10', title: 'Fire Extinguisher Monthly Pin & Pressure Check', sourceType: 'Inspection', sourceId: 'INSP-EXT-08', completedDate: '2026-08-25T10:00:00Z', outcome: '15 CO2 and dry powder extinguishers in shop inspected.', verifiedBy: 'Rahul Gupta', evidenceNotes: 'All pressure gauges in green operating zone.', location: 'Mechanical Shop' }
        ],
        notifications: [
          { id: 'NTF-RG-01', timestamp: '2026-10-07T07:55:00Z', title: 'Permit Authorized: PTW-2026-8809', message: 'Marcus Chen authorized Cold Work permit. Custody transferred to you in field.', severity: 'High', category: 'PTW', sourceId: 'PTW-2026-8809', read: false, senderName: 'Marcus Chen' },
          { id: 'NTF-RG-02', timestamp: '2026-10-06T15:10:00Z', title: 'SWA Condition Lifted', message: 'Toe-board repaired on Manifold 6 scaffolding. Work authorized to resume.', severity: 'Medium', category: 'SWA', sourceId: 'SWA-2026-104', read: true, senderName: 'Marcus Chen' },
          { id: 'NTF-RG-03', timestamp: '2026-10-05T08:00:00Z', title: 'Toolbox Talk Starting in 15 Minutes', message: 'Pre-job briefing for high-pressure line inspection at Muster Point 3.', severity: 'Low', category: 'Meeting', sourceId: 'TBT-2026-1005', read: true, senderName: 'Marcus Chen' },
          { id: 'NTF-RG-04', timestamp: '2026-10-04T12:00:00Z', title: 'Observation Acknowledged', message: 'Your report regarding hydraulic weeping was logged by maintenance planner.', severity: 'Low', category: 'Observation', sourceId: 'OBS-2026-399', read: true, senderName: 'Safety Desk' },
          { id: 'NTF-RG-05', timestamp: '2026-10-02T13:00:00Z', title: 'Midday Heat Break in Effect', message: 'Mandatory rest break active until 15:00. Cease non-emergency outdoor heavy work.', severity: 'High', category: 'Health', sourceId: 'ENV-HEAT-02', read: true, senderName: 'Dr. Mariam Al-Balushi' },
          { id: 'NTF-RG-06', timestamp: '2026-09-28T09:30:00Z', title: 'Training Certificate Issued: Rigging Level 2', message: 'Your LEEA Rigging certificate has been uploaded to your employee passport.', severity: 'Low', category: 'Training', sourceId: 'TRN-2026-044', read: true, senderName: 'Training Engine' },
          { id: 'NTF-RG-07', timestamp: '2026-09-24T16:00:00Z', title: 'Corrective Action Closed by Safety Officer', message: 'Fatima Al-Zaabi verified and closed your hose restraint installation task.', severity: 'Low', category: 'CAPA', sourceId: 'CAPA-2026-11', read: true, senderName: 'Fatima Al-Zaabi' },
          { id: 'NTF-RG-08', timestamp: '2026-09-20T11:00:00Z', title: 'Safety Boots Voucher Available', message: 'Annual steel-toe electrical-hazard boots allowance credited to employee account.', severity: 'Low', category: 'PPE', sourceId: 'PPE-BOOTS-2026', read: true, senderName: 'HR Logistics' },
          { id: 'NTF-RG-09', timestamp: '2026-09-15T08:00:00Z', title: 'Reminder: Medical Audiometry Screening', message: 'Annual occupational hearing test scheduled at Ruwais Medical Centre tomorrow 10:00.', severity: 'Medium', category: 'Health', sourceId: 'MED-AUD-2026', read: true, senderName: 'Medical Centre' },
          { id: 'NTF-RG-10', timestamp: '2026-09-10T14:00:00Z', title: 'New SIMOPS Restriction Notice', message: 'Berth 1 crane lifting prohibited while fuel barge is moored at jetty.', severity: 'Medium', category: 'PTW', sourceId: 'SIMOPS-BERTH-1', read: true, senderName: 'Marine Control' }
        ]
      },

      // 4. Dr. Layla Hassan - Head of Group HSE Governance (Executive HQ)
      {
        id: 'u2',
        name: 'Dr. Layla Hassan',
        email: 'dr.layla@gulfenergy.ae',
        role: 'Head_Group_HSE',
        department: 'Group HSE & Executive Governance HQ',
        businessUnit: 'Executive Office & Enterprise Governance',
        organization: 'Gulf Energy Maritime & Infrastructure',
        siteLocation: 'Gulf Energy Headquarters (Abu Dhabi)',
        employeeId: 'GE-HQ-1002',
        jobTitle: 'Head of Group HSE, ESG & Operational Risk Governance',
        managerName: 'James Sterling (Chief Executive Officer)',
        phoneExtension: '+971 2 600 1002',
        employmentStatus: 'Active',
        joiningDate: '2019-06-01',
        safetyScore: 2450,
        recentIncidents: ['Presented Q3 TRIR & LTIFR to Board Audit Committee', 'Chaired Group SIF Review'],
        observations: [],
        responsibilities: [
          'Enterprise governance across UAE, Oman, and KSA industrial concessions',
          'Executive reporting for Board of Directors and statutory regulatory bodies',
          'Strategic AI Safety & Predictive SIF reduction platform oversight'
        ],
        skills: ['Executive Risk Governance', 'ISO 45001 / ISO 14001', 'SIF Predictive Analytics', 'ESG Board Strategy'],
        competencies: [
          { competency: 'Certified Safety Professional (CSP - BCSP USA)', level: 'Expert', verifiedDate: '2025-05-10', verifierName: 'BCSP USA' },
          { competency: 'Chartered Fellow IOSH (CFIOSH)', level: 'Expert', verifiedDate: '2025-01-12', verifierName: 'IOSH UK' },
          { competency: 'Enterprise ESG Risk Assessor', level: 'Expert', verifiedDate: '2024-11-20', verifierName: 'GRI Standards' }
        ],
        trainingStatus: { totalCourses: 20, completedCourses: 20, overdueCount: 0, complianceRate: 100 },
        assignedProjects: ['Group AI Safety Platform Transformation', 'Scope 1 & 2 Decarbonization Roadmap'],
        assignedSites: ['All Regional Concessions (UAE, Oman, KSA)'],
        currentWorkload: { activeTasks: 7, pendingApprovals: 5, openCapas: 3, utilizationRate: 92 },
        approvalResponsibilities: ['Group Safety Policies', 'Major Incident Final Sign-off', 'High-Risk Capital Expenditure'],
        certifications: [
          { name: 'Certified Safety Professional (CSP - BCSP USA)', status: 'Valid', expiryDate: '2029-05-31' },
          { name: 'Chartered Fellow IOSH (CFIOSH)', status: 'Valid', expiryDate: '2029-12-31' },
          { name: 'IRCA Lead Auditor ISO 45001 & ISO 14001', status: 'Valid', expiryDate: '2028-09-30' }
        ],
        achievements: [
          { id: 'ach-lh-1', title: 'Visionary Safety Leader', description: 'Reduced Group Serious Injury & Fatality (SIF) exposure by 42% over 24 months', dateEarned: '2026-08-30', icon: 'Trophy', tier: 'Platinum' },
          { id: 'ach-lh-2', title: 'Executive Innovator', description: 'Pioneered AI-native computer vision & predictive safety integration in GCC', dateEarned: '2026-03-15', icon: 'BrainCircuit', tier: 'Gold' }
        ],
        activities: [
          {
            id: 'ACT-LH-01',
            timestamp: '2026-10-06T16:00:00Z',
            timePeriod: 'Recent',
            actionType: 'Approved Investigation',
            category: 'Incident',
            entityId: 'INC-2026-OMN-0891',
            entityTitle: 'Wellhead Choke Manifold High-Pressure Line Failure',
            details: 'Approved Level-3 TapRooT investigation report and statutory disclosure for Oman Ministry of Labour.',
            impactResult: 'Board pack updated with root causes.'
          },
          {
            id: 'ACT-LH-02',
            timestamp: '2026-10-05T14:00:00Z',
            timePeriod: 'Recent',
            actionType: 'Chaired Meeting',
            category: 'Meeting',
            entityId: 'MTG-BOARD-Q3',
            entityTitle: 'Board of Directors Safety & Risk Committee Review',
            details: 'Presented YTD TRIR of 0.18 against 0.25 target across 14.8 million worked man-hours.',
            impactResult: 'Full executive commendation received.'
          },
          {
            id: 'ACT-LH-03',
            timestamp: '2026-10-03T11:30:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Approved Policy',
            category: 'Risk Assessment',
            entityId: 'POL-2026-SWA',
            entityTitle: 'Empowered Stop Work Authority Enterprise Charter',
            details: 'Endorsed formal zero-retaliation charter for any frontline employee triggering SWA.',
            impactResult: 'Distributed to all 4,200 staff and contractors.'
          },
          {
            id: 'ACT-LH-04',
            timestamp: '2026-10-01T09:00:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Reviewed Audit Finding',
            category: 'Audit',
            entityId: 'AUD-2026-003',
            entityTitle: 'ISO 45001 Surveillance Audit Findings (Oman)',
            details: 'Reviewed and closed finding regarding whip-check restraints on high-pressure flexible hoses.',
            impactResult: 'Closed with zero repeat risk.'
          },
          {
            id: 'ACT-LH-05',
            timestamp: '2026-09-28T15:00:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Endorsed Audit Protocol',
            category: 'Audit',
            entityId: 'AUD-2026-004',
            entityTitle: 'Abu Dhabi OSHAD-SF Mechanism 11.0 Verification',
            details: 'Signed off on internal self-audit scoring (99.1%) submitted to Abu Dhabi authorities.',
            impactResult: 'Verified compliant.'
          },
          {
            id: 'ACT-LH-06',
            timestamp: '2026-09-20T10:00:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Escalated Action',
            category: 'CAPA',
            entityId: 'CAPA-2026-01',
            entityTitle: 'High-Pressure Line Whip-Checks Group Rollout',
            details: 'Escalated procurement of certified stainless cables to EPC Consortium executive director.',
            impactResult: 'Fast-tracked air-freight delivery approved.'
          },
          {
            id: 'ACT-LH-07',
            timestamp: '2026-09-12T13:00:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Approved Risk Register',
            category: 'Risk Assessment',
            entityId: 'RSK-GRP-Q3',
            entityTitle: 'Group Enterprise Top-10 Major Accident Hazards (MAH)',
            details: 'Validated Bowtie barriers for catastrophic blowout, ammonia toxic release and offshore collision.',
            impactResult: 'Executive risk register updated.'
          },
          {
            id: 'ACT-LH-08',
            timestamp: '2026-09-02T11:00:00Z',
            timePeriod: 'Last 90 Days',
            actionType: 'Conducted Site Walkabout',
            category: 'Inspection',
            entityId: 'WALK-2026-RUW',
            entityTitle: 'Executive Leadership Safety Walkabout - Al-Ruwais',
            details: 'Engaged with 25 maintenance crew workers regarding heat stress hydration and SWA authority.',
            impactResult: 'Four employee suggestions implemented.'
          },
          {
            id: 'ACT-LH-09',
            timestamp: '2026-08-22T09:30:00Z',
            timePeriod: 'Last 90 Days',
            actionType: 'Approved Training Strategy',
            category: 'Training',
            entityId: 'TRN-STRAT-2027',
            entityTitle: 'Enterprise Human Factors & Just Culture Framework',
            details: 'Approved mandatory 4-hour Human Performance curriculum for 250 operational supervisors.',
            impactResult: 'Rollout scheduled across Q4.'
          },
          {
            id: 'ACT-LH-10',
            timestamp: '2026-08-10T14:00:00Z',
            timePeriod: 'Last 90 Days',
            actionType: 'Closed Investigation',
            category: 'Incident',
            entityId: 'INC-2026-KSA-0188',
            entityTitle: 'Ras Al-Khair Heavy Lift Rigging Tension Overload',
            details: 'Signed closure letter after verifying crane computer load moment indicator recalibration.',
            impactResult: 'Investigation archived with zero open actions.'
          }
        ],
        pendingActions: [
          { id: 'PND-LH-01', title: 'Sign Off Statutory OSHAD Form G: INC-2026-UAE-0622', sourceType: 'Incident', sourceId: 'INC-2026-UAE-0622', priority: 'P1 - Critical', dueDate: '2026-10-08', daysRemaining: 1, isOverdue: false, status: 'Pending Approval', requiredAction: 'Executive endorsement of formal government report', location: 'Group HQ' },
          { id: 'PND-LH-02', title: 'Approve Group Safety Policy Update: Autonomous Drone Auditing', sourceType: 'Risk Assessment', sourceId: 'POL-DRONE-2026', priority: 'P2 - High', dueDate: '2026-10-10', daysRemaining: 3, isOverdue: false, status: 'In Review', requiredAction: 'Review civil aviation and OSHAD compliance clauses', location: 'Executive Office' },
          { id: 'PND-LH-03', title: 'Review Board Safety Pack Q4 Preview with CEO', sourceType: 'Audit', sourceId: 'BRD-Q4-2026', priority: 'P1 - Critical', dueDate: '2026-10-09', daysRemaining: 2, isOverdue: false, status: 'Action Required', requiredAction: 'Verify leading indicators and SIF precursor reduction rate', location: 'CEO Suite' },
          { id: 'PND-LH-04', title: 'Verify Closure of High-Priority CAPA-2026-01', sourceType: 'CAPA', sourceId: 'CAPA-2026-01', priority: 'P1 - Critical', dueDate: '2026-10-08', daysRemaining: 1, isOverdue: false, status: 'In-Progress', requiredAction: 'Review engineering test certs for all high-pressure whip checks', location: 'Fahud-West' },
          { id: 'PND-LH-05', title: 'Authorize Annual Process Safety Management Tier-1 Audit', sourceType: 'Audit', sourceId: 'AUD-2026-006', priority: 'P2 - High', dueDate: '2026-10-12', daysRemaining: 5, isOverdue: false, status: 'Scheduled', requiredAction: 'Sign terms of reference and lead auditor appointment letter', location: 'Group HQ' },
          { id: 'PND-LH-06', title: 'Review EPC Contractor Safety Prequalification Appeal', sourceType: 'Inspection', sourceId: 'CON-APP-2026', priority: 'P2 - High', dueDate: '2026-10-11', daysRemaining: 4, isOverdue: false, status: 'In Review', requiredAction: 'Review appeal regarding subcontractor LTIFR remediation plan', location: 'Contractor Hub' },
          { id: 'PND-LH-07', title: 'Approve HSE Capital Expenditure: Wireless Gas Sensor Grid', sourceType: 'Risk Assessment', sourceId: 'CAPEX-GAS-2026', priority: 'P2 - High', dueDate: '2026-10-14', daysRemaining: 7, isOverdue: false, status: 'Pending Approval', requiredAction: 'Review ROI and catastrophic gas release risk reduction model', location: 'Finance Committee' },
          { id: 'PND-LH-08', title: 'Endorse UAE Ministry of Energy National Safety Week Agenda', sourceType: 'Meeting', sourceId: 'EVT-MOEI-2026', priority: 'P3 - Medium', dueDate: '2026-10-16', daysRemaining: 9, isOverdue: false, status: 'Upcoming', requiredAction: 'Approve keynote presentation on AI Predictive Safety', location: 'Abu Dhabi ADNEC' },
          { id: 'PND-LH-09', title: 'Quarterly Risk Appetite Review with Chief Risk Officer', sourceType: 'Risk Assessment', sourceId: 'RSK-CRO-Q4', priority: 'P2 - High', dueDate: '2026-10-15', daysRemaining: 8, isOverdue: false, status: 'Scheduled', requiredAction: 'Evaluate operational resilience against extreme weather events', location: 'Group HQ' },
          { id: 'PND-LH-10', title: 'Review Overdue Legal Compliance Audit Actions (Oman)', sourceType: 'CAPA', sourceId: 'CAPA-LEG-OMN', priority: 'P2 - High', dueDate: '2026-10-10', daysRemaining: 3, isOverdue: false, status: 'Action Required', requiredAction: 'Issue formal directive to Oman asset manager regarding closing date', location: 'Fahud Asset' }
        ],
        completedActions: [
          { id: 'CMP-LH-01', title: 'Signed Off Incident Investigation INC-2026-OMN-0891', sourceType: 'Incident', sourceId: 'INC-2026-OMN-0891', completedDate: '2026-10-06T16:00:00Z', outcome: 'Executive review completed; lessons learned shared across group.', verifiedBy: 'James Sterling', evidenceNotes: 'Board presentation archived.', location: 'Group HQ' },
          { id: 'CMP-LH-02', title: 'Board Safety & Risk Committee Presentation Delivered', sourceType: 'Meeting', sourceId: 'MTG-BOARD-Q3', completedDate: '2026-10-05T14:00:00Z', outcome: 'TRIR 0.18 achieved; zero fatalities milestone celebrated.', verifiedBy: 'Board Secretary', evidenceNotes: 'Minutes signed by Chairman.', location: 'Board Room' },
          { id: 'CMP-LH-03', title: 'Group-Wide SWA Zero Retaliation Policy Endorsed', sourceType: 'Risk Assessment', sourceId: 'POL-2026-SWA', completedDate: '2026-10-03T11:30:00Z', outcome: 'Signed and broadcast across all 3 country operational hubs.', verifiedBy: 'Dr. Layla Hassan', evidenceNotes: 'Policy published in Arabic and English.', location: 'All Sites' },
          { id: 'CMP-LH-04', title: 'ISO 45001 Surveillance Audit Findings Signed Off', sourceType: 'Audit', sourceId: 'AUD-2026-003', completedDate: '2026-10-01T09:00:00Z', outcome: 'Finding regarding test manifolds closed satisfactorily.', verifiedBy: 'Sarah Jenkins', evidenceNotes: 'External audit report countersigned.', location: 'Fahud-West' },
          { id: 'CMP-LH-05', title: 'OSHAD Mechanism 11.0 Submission Endorsed', sourceType: 'Audit', sourceId: 'AUD-2026-004', completedDate: '2026-09-28T15:00:00Z', outcome: 'Certified 99.1% compliance documentation.', verifiedBy: 'Abu Dhabi OSHAD', evidenceNotes: 'Government acknowledgment received.', location: 'Al-Ruwais' },
          { id: 'CMP-LH-06', title: 'Fast-Track Procurement of Stainless Whip Checks', sourceType: 'CAPA', sourceId: 'CAPA-2026-01', completedDate: '2026-09-20T10:00:00Z', outcome: 'Approved AED 85,000 emergency procurement.', verifiedBy: 'Procurement Director', evidenceNotes: 'Purchase order issued to certified supplier.', location: 'Group HQ' },
          { id: 'CMP-LH-07', title: 'Major Accident Hazard Bowtie Models Approved', sourceType: 'Risk Assessment', sourceId: 'RSK-GRP-Q3', completedDate: '2026-09-12T13:00:00Z', outcome: 'All 10 MAH scenarios reviewed with technical authorities.', verifiedBy: 'Technical Director', evidenceNotes: 'Models published in Bowtie viewer.', location: 'Refineries' },
          { id: 'CMP-LH-08', title: 'Executive Safety Walkabout - Al-Ruwais Asset', sourceType: 'Inspection', sourceId: 'WALK-2026-RUW', completedDate: '2026-09-02T11:00:00Z', outcome: 'Direct engagement with workforce regarding heat stress.', verifiedBy: 'Sarah Jones', evidenceNotes: 'Walkabout findings actioned in MyWork cockpit.', location: 'Al-Ruwais' },
          { id: 'CMP-LH-09', title: 'Enterprise Human Factors Curriculum Approved', sourceType: 'Training', sourceId: 'TRN-STRAT-2027', completedDate: '2026-08-22T09:30:00Z', outcome: 'Training contracts finalized with certified academy.', verifiedBy: 'HR Director', evidenceNotes: 'Master training calendar published.', location: 'Group HQ' },
          { id: 'CMP-LH-10', title: 'Investigation INC-2026-KSA-0188 Signed and Archived', sourceType: 'Incident', sourceId: 'INC-2026-KSA-0188', completedDate: '2026-08-10T14:00:00Z', outcome: 'Crane load limiter recalibration verified by third party.', verifiedBy: 'Abdulaziz Al-Ghamdi', evidenceNotes: 'Investigation closed.', location: 'Ras Al-Khair' }
        ],
        notifications: [
          { id: 'NTF-LH-01', timestamp: '2026-10-06T15:30:00Z', title: 'Executive Approval Needed: INC-2026-OMN-0891', message: 'TapRooT investigation report ready for your final sign-off before government filing.', severity: 'High', category: 'Incident', sourceId: 'INC-2026-OMN-0891', read: false, senderName: 'Dr. Vikram Malhotra' },
          { id: 'NTF-LH-02', timestamp: '2026-10-05T08:00:00Z', title: 'Monthly TRIR KPI Calculated: 0.18', message: 'Group Total Recordable Incident Rate reached 0.18, outperforming annual target of 0.25.', severity: 'Low', category: 'Metrics', sourceId: 'KPI-TRIR-SEP', read: true, senderName: 'BI Analytics Engine' },
          { id: 'NTF-LH-03', timestamp: '2026-10-04T09:00:00Z', title: 'SIF Precursor Prediction Alert', message: 'Predictive safety model identified 3 consecutive near-misses in crane rigging area.', severity: 'High', category: 'Predictive', sourceId: 'SIF-ALERT-04', read: true, senderName: 'AI Predictive Engine' },
          { id: 'NTF-LH-04', timestamp: '2026-10-03T10:00:00Z', title: 'Legal Register Regulatory Update', message: 'Oman Ministry of Labour issued decree regarding remote wellhead lone-worker telemetry.', severity: 'Medium', category: 'Legal', sourceId: 'LEG-OMN-2026', read: true, senderName: 'ComplyFlow Engine' },
          { id: 'NTF-LH-05', timestamp: '2026-10-01T11:00:00Z', title: 'Audit AUD-2026-003 Closed by Lead Auditor', message: 'ISO 45001 surveillance audit formal closure certificate ready for your records.', severity: 'Low', category: 'Audit', sourceId: 'AUD-2026-003', read: true, senderName: 'Sarah Jenkins' },
          { id: 'NTF-LH-06', timestamp: '2026-09-28T16:30:00Z', title: 'OSHAD External Rating Confirmed', message: 'Abu Dhabi OSHAD confirmed Grade-A compliance status for Al-Ruwais concession.', severity: 'Low', category: 'Compliance', sourceId: 'OSHAD-GRADE-A', read: true, senderName: 'Abu Dhabi OSHAD' },
          { id: 'NTF-LH-07', timestamp: '2026-09-24T12:00:00Z', title: 'Contractor Safety Incident Notification', message: 'Near miss reported on Petrofac civil conduit trench excavation in Ras Al-Khair.', severity: 'Medium', category: 'Incident', sourceId: 'INC-2026-KSA-0219', read: true, senderName: 'Abdulaziz Al-Ghamdi' },
          { id: 'NTF-LH-08', timestamp: '2026-09-20T08:15:00Z', title: 'Carbon Accounting Q3 Report Ready', message: 'Scope 1 emissions down 4.2% following flare gas recovery compressor overhaul.', severity: 'Low', category: 'ESG', sourceId: 'ESG-Q3-EMISSIONS', read: true, senderName: 'Khalid Al-Dhaheri' },
          { id: 'NTF-LH-09', timestamp: '2026-09-15T14:00:00Z', title: 'Group Crisis Management Drill Scheduled', message: 'Annual Tier-3 crisis simulation exercise scheduled for November 18.', severity: 'Medium', category: 'Emergency', sourceId: 'EMG-DRILL-T3', read: true, senderName: 'Emergency Response' },
          { id: 'NTF-LH-10', timestamp: '2026-09-10T17:00:00Z', title: 'Audit Trail Ledger Integrity Verified', message: 'All 650+ cryptographic audit hashes verified with zero tamper discrepancies.', severity: 'Low', category: 'Security', sourceId: 'SEC-AUDIT-VERIF', read: true, senderName: 'Immutable Audit Service' }
        ]
      },

      // 5. System Admin - Enterprise HSE Platform Administrator & Systems Architect
      {
        id: 'admin',
        name: 'System Admin',
        email: 'sysadmin@gulfenergy.ae',
        role: 'ADMIN',
        department: 'Digital Safety Infrastructure & Security',
        businessUnit: 'Enterprise Digital & HSE Technology Group',
        organization: 'Gulf Energy & Infrastructure Group',
        siteLocation: 'Group Digital Command Center · Abu Dhabi HQ',
        employeeId: 'GE-SYS-0010',
        jobTitle: 'Lead Enterprise HSE Platform Architect & Administrator',
        managerName: 'James Sterling (Chief Executive Officer)',
        phoneExtension: '+971 2 602 0010',
        employmentStatus: 'Active',
        joiningDate: '2020-03-01',
        safetyScore: 2500,
        recentIncidents: ['Audited zero-tamper cryptographic log ledger', 'Hardened multi-tenant concession isolation'],
        observations: [],
        responsibilities: [
          'Full-platform governance, tenant isolation, and RBAC matrix enforcement',
          'Integration and integrity assurance of the Unified Compliance Audit Trail',
          'Enterprise IoT telemetry, PWA offline caching resilience, and SLA monitoring'
        ],
        skills: ['RBAC Security Governance', 'Immutable Audit Trails', 'Multi-Site SIMOPS Architecture', 'ISO 27001 / SOC 2 Compliance'],
        competencies: [
          { competency: 'Certified Cloud Security Professional (CCSP)', level: 'Expert', verifiedDate: '2026-01-10', verifierName: 'ISC2 Global' },
          { competency: 'ISO 27001 Lead Implementer', level: 'Expert', verifiedDate: '2025-11-20', verifierName: 'BSI Middle East' },
          { competency: 'HSE Enterprise Systems Architect', level: 'Expert', verifiedDate: '2025-08-15', verifierName: 'Dr. Layla Hassan' }
        ],
        trainingStatus: { totalCourses: 20, completedCourses: 20, overdueCount: 0, complianceRate: 100 },
        assignedProjects: ['Unified Compliance Ledger v2', 'Offline PWA Field Engine Rollout', 'IoT SIMOPS Radar'],
        assignedSites: ['All Concessions (UAE, Oman, KSA)'],
        currentWorkload: { activeTasks: 5, pendingApprovals: 2, openCapas: 1, utilizationRate: 80 },
        approvalResponsibilities: ['Global User Role Provisioning', 'Statutory API Gateway Key Rotation', 'Audit Ledger Purge Rejection'],
        certifications: [
          { name: 'Certified Information Systems Security Professional (CISSP)', status: 'Valid', expiryDate: '2028-12-31' },
          { name: 'AWS & GCP Certified Solutions Architect Professional', status: 'Valid', expiryDate: '2027-10-30' },
          { name: 'ISO 27001 Lead Implementer', status: 'Valid', expiryDate: '2028-04-15' }
        ],
        achievements: [
          { id: 'ach-adm-1', title: 'Grandmaster', description: 'Complete system oversight enabled with 99.99% uptime', dateEarned: '2026-01-01', icon: 'Shield', tier: 'Gold' },
          { id: 'ach-adm-2', title: 'Zero Tamper Sentry', description: 'Verified 1,000+ cryptographic audit hashes without single collision', dateEarned: '2026-07-01', icon: 'CheckCircle', tier: 'Gold' }
        ],
        activities: [
          {
            id: 'ACT-ADM-01',
            timestamp: '2026-10-07T06:00:00Z',
            timePeriod: 'Recent',
            actionType: 'Audited Ledger',
            category: 'Audit',
            entityId: 'AUD-HASH-LEDGER',
            entityTitle: 'Cryptographic Audit Trail Integrity Verification',
            details: 'Ran SHA-256 verification suite across 650+ event hashes; zero tamper flags detected.',
            impactResult: 'Immutable ledger integrity verified.'
          },
          {
            id: 'ACT-ADM-02',
            timestamp: '2026-10-06T18:30:00Z',
            timePeriod: 'Recent',
            actionType: 'Configured Permissions',
            category: 'Risk Assessment',
            entityId: 'SEC-RBAC-04',
            entityTitle: 'Updated Area Authority Permit Sign-off Delegations',
            details: 'Updated role-based permission matrix for Marcus Chen on Train-3 turnaround.',
            impactResult: 'Digital signing authority enforced.'
          },
          {
            id: 'ACT-ADM-03',
            timestamp: '2026-10-05T16:00:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Provisioned Telemetry',
            category: 'Inspection',
            entityId: 'IOT-GRID-FAHUD',
            entityTitle: 'Fahud-West Gas Station Telemetry Grid Synchronization',
            details: 'Provisioned 24 wireless H2S telemetry nodes into spatial map with live threshold triggers.',
            impactResult: 'Live sensor alerts linked to MyWork cockpit.'
          },
          {
            id: 'ACT-ADM-04',
            timestamp: '2026-10-04T12:00:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Reviewed Incident',
            category: 'Incident',
            entityId: 'INC-2026-UAE-0622',
            entityTitle: 'Automated Regulatory Escalation Check',
            details: 'Verified statutory notification dispatch to Abu Dhabi OSHAD portal within 2-hour window.',
            impactResult: 'Legal reporting SLA verified.'
          },
          {
            id: 'ACT-ADM-05',
            timestamp: '2026-10-03T10:15:00Z',
            timePeriod: 'Last 7 Days',
            actionType: 'Updated Workflow Status',
            category: 'CAPA',
            entityId: 'SYS-CAPA-ESCALATE',
            entityTitle: 'Automated SLA Escalation Rules for High-Risk CAPAs',
            details: 'Enacted 48-hour automated email and SMS notification rule for overdue P1 actions.',
            impactResult: 'Escalation workflow activated.'
          },
          {
            id: 'ACT-ADM-06',
            timestamp: '2026-09-30T14:00:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Completed Inspection',
            category: 'Inspection',
            entityId: 'SYS-SEC-AUDIT',
            entityTitle: 'Quarterly Multi-Tenant Isolation Security Review',
            details: 'Verified database row-level security and tenant isolation between Oman, UAE, and KSA.',
            impactResult: 'Zero cross-tenant leakage observed.'
          },
          {
            id: 'ACT-ADM-07',
            timestamp: '2026-09-25T08:00:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Authorized Permit',
            category: 'Permit',
            entityId: 'PTW-SYS-MAINT',
            entityTitle: 'Production Server Patching & Firmware Upgrade',
            details: 'Issued digital change management permit for primary datacenter maintenance window.',
            impactResult: 'Zero service interruption recorded.'
          },
          {
            id: 'ACT-ADM-08',
            timestamp: '2026-09-18T11:20:00Z',
            timePeriod: 'Last 30 Days',
            actionType: 'Verified Finding',
            category: 'Audit',
            entityId: 'AUD-ISO-27001',
            entityTitle: 'ISO 27001 Information Security Surveillance Audit',
            details: 'Submitted evidence for encrypted data-at-rest and TLS 1.3 in-transit telemetry.',
            impactResult: 'Surveillance audit cleared successfully.'
          },
          {
            id: 'ACT-ADM-09',
            timestamp: '2026-09-10T09:00:00Z',
            timePeriod: 'Last 90 Days',
            actionType: 'Completed Training',
            category: 'Training',
            entityId: 'TRN-CYBER-2026',
            entityTitle: 'Critical National Infrastructure Cybersecurity Defense',
            details: 'Completed Abu Dhabi Digital Authority industrial control system security certification.',
            impactResult: 'Credential renewed.'
          },
          {
            id: 'ACT-ADM-10',
            timestamp: '2026-08-20T15:30:00Z',
            timePeriod: 'Last 90 Days',
            actionType: 'Closed Corrective Action',
            category: 'CAPA',
            entityId: 'CAPA-SYS-09',
            entityTitle: 'Automated Session Timeout on Field PWA Tablets',
            details: 'Enforced 15-minute biometric lock on all intrinsically safe Zone 1 Android tablets.',
            impactResult: 'Tablets verified compliant.'
          }
        ],
        pendingActions: [
          { id: 'PND-ADM-01', title: 'Quarterly Privileged Access Review (RBAC Matrix)', sourceType: 'Audit', sourceId: 'SEC-RBAC-Q4', priority: 'P1 - Critical', dueDate: '2026-10-09', daysRemaining: 2, isOverdue: false, status: 'In Review', requiredAction: 'Audit administrator rights and verify least-privilege compliance', location: 'Group Digital HQ' },
          { id: 'PND-ADM-02', title: 'Renew Hardware Security Module (HSM) Signing Certificate', sourceType: 'Risk Assessment', sourceId: 'SEC-HSM-2026', priority: 'P1 - Critical', dueDate: '2026-10-10', daysRemaining: 3, isOverdue: false, status: 'Action Required', requiredAction: 'Rotate private root key for cryptographic audit signature stamping', location: 'Security Vault' },
          { id: 'PND-ADM-03', title: 'Verify Abu Dhabi OSHAD API Gateway Webhook Health', sourceType: 'Inspection', sourceId: 'API-OSHAD-WH', priority: 'P2 - High', dueDate: '2026-10-11', daysRemaining: 4, isOverdue: false, status: 'Scheduled', requiredAction: 'Conduct simulated incident payload delivery test with government endpoint', location: 'Cloud Gateway' },
          { id: 'PND-ADM-04', title: 'Annual Disaster Recovery Failover Simulation', sourceType: 'Inspection', sourceId: 'DR-TEST-2026', priority: 'P2 - High', dueDate: '2026-10-12', daysRemaining: 5, isOverdue: false, status: 'Scheduled', requiredAction: 'Execute live failover from UAE North region to Oman secondary datacenter', location: 'Cloud Infrastructure' },
          { id: 'PND-ADM-05', title: 'Review Failed Authentication Telemetry Thresholds', sourceType: 'Risk Assessment', sourceId: 'SEC-AUTH-LOG', priority: 'P2 - High', dueDate: '2026-10-08', daysRemaining: 1, isOverdue: false, status: 'Pending Approval', requiredAction: 'Inspect anomalous IP blocks reported by Cloud Armor WAF', location: 'SOC Dashboard' },
          { id: 'PND-ADM-06', title: 'Audit Multi-Tenant Storage Quotas Across Concessions', sourceType: 'Inspection', sourceId: 'STOR-QUOTA-Q4', priority: 'P3 - Medium', dueDate: '2026-10-14', daysRemaining: 7, isOverdue: false, status: 'Upcoming', requiredAction: 'Ensure 5-year compliance retention capacity allocated for all documents', location: 'Storage Engine' },
          { id: 'PND-ADM-07', title: 'Validate Automated CAPA SLA Escalation Rule', sourceType: 'CAPA', sourceId: 'SLA-CAPA-TEST', priority: 'P2 - High', dueDate: '2026-10-09', daysRemaining: 2, isOverdue: false, status: 'Action Required', requiredAction: 'Trigger mock overdue P1 CAPA and verify executive SMS delivery', location: 'Notification Hub' },
          { id: 'PND-ADM-08', title: 'PWA Service Worker Cache Expiry Configuration', sourceType: 'Inspection', sourceId: 'PWA-CACHE-CFG', priority: 'P3 - Medium', dueDate: '2026-10-15', daysRemaining: 8, isOverdue: false, status: 'Pending', requiredAction: 'Verify sour gas emergency procedures remain accessible offline', location: 'PWA Engine' },
          { id: 'PND-ADM-09', title: 'Contractor Integration API Prequalification Audit', sourceType: 'Audit', sourceId: 'CON-API-VET', priority: 'P2 - High', dueDate: '2026-10-13', daysRemaining: 6, isOverdue: false, status: 'In Review', requiredAction: 'Review OAuth2 scopes requested by Petrofac engineering team', location: 'API Portal' },
          { id: 'PND-ADM-10', title: 'Overdue System Log Archive Digest Sign-off', sourceType: 'Audit', sourceId: 'LOG-ARCH-SEP', priority: 'P2 - High', dueDate: '2026-10-06', daysRemaining: -1, isOverdue: true, status: 'Overdue', requiredAction: 'Sign digital hash receipt for September 2026 immutable audit archive', location: 'Audit Vault' }
        ],
        completedActions: [
          { id: 'CMP-ADM-01', title: 'Cryptographic Audit Trail SHA-256 Ledger Verified', sourceType: 'Audit', sourceId: 'SEC-LEDGER-Q3', completedDate: '2026-10-07T06:00:00Z', outcome: 'Zero tamper anomalies across all 650+ event signatures.', verifiedBy: 'System Admin', evidenceNotes: 'Digital integrity certificate archived.', location: 'HQ Data Center' },
          { id: 'CMP-ADM-02', title: 'Rotated Production JWT & API Gateway Access Tokens', sourceType: 'Inspection', sourceId: 'SEC-ROT-09', completedDate: '2026-10-05T23:00:00Z', outcome: 'Seamless zero-downtime key rotation completed.', verifiedBy: 'Security Lead', evidenceNotes: 'All microservices updated.', location: 'Cloud Gateway' },
          { id: 'CMP-ADM-03', title: 'Provisioned Wireless Gas Sensor Radar on GIS Map', sourceType: 'Inspection', sourceId: 'IOT-GRID-01', completedDate: '2026-10-04T14:00:00Z', outcome: '24 sensor nodes live with real-time LEL & H2S telemetry.', verifiedBy: 'Marcus Chen', evidenceNotes: 'Confirmed live readings in UI.', location: 'Fahud-West' },
          { id: 'CMP-ADM-04', title: 'Enforced MFA on All Executive & Manager Roles', sourceType: 'Risk Assessment', sourceId: 'SEC-MFA-2026', completedDate: '2026-10-01T10:00:00Z', outcome: '100% of executive accounts protected with hardware MFA.', verifiedBy: 'Dr. Layla Hassan', evidenceNotes: 'Executive compliance confirmed.', location: 'All Sites' },
          { id: 'CMP-ADM-05', title: 'Closed ISO 27001 Surveillance Audit Finding #03', sourceType: 'Audit', sourceId: 'AUD-ISO-27001', completedDate: '2026-09-28T16:00:00Z', outcome: 'Automated backup encryption verification implemented.', verifiedBy: 'BSI Auditor', evidenceNotes: 'Closure letter issued.', location: 'Cloud Infrastructure' },
          { id: 'CMP-ADM-06', title: 'Hardened Content Security Policy & CORS Rules', sourceType: 'Inspection', sourceId: 'SEC-CSP-2026', completedDate: '2026-09-22T11:00:00Z', outcome: 'A+ rating achieved on external security header scan.', verifiedBy: 'Security Architect', evidenceNotes: 'Mozilla Observatory test passed.', location: 'Web Application' },
          { id: 'CMP-ADM-07', title: 'Configured Abu Dhabi Civil Defence Incident Webhook', sourceType: 'Permit', sourceId: 'ADCD-WH-01', completedDate: '2026-09-18T15:30:00Z', outcome: 'Automated emergency dispatch tested and approved.', verifiedBy: 'Civil Defence Abu Dhabi', evidenceNotes: 'Government test certificate received.', location: 'Al-Ruwais' },
          { id: 'CMP-ADM-08', title: 'Upgraded PWA IndexedDB Offline Storage Schema', sourceType: 'Inspection', sourceId: 'PWA-IDB-V2', completedDate: '2026-09-12T13:00:00Z', outcome: '500 offline inspection records synced without data conflict.', verifiedBy: 'Fatima Al-Zaabi', evidenceNotes: 'Field test passed on tablet.', location: 'Mobile PWA' },
          { id: 'CMP-ADM-09', title: 'Disaster Recovery Database Snapshot Verified', sourceType: 'Audit', sourceId: 'DR-SNAP-Q3', completedDate: '2026-09-05T08:00:00Z', outcome: 'Recovery Point Objective (RPO) verified under 60 seconds.', verifiedBy: 'Database Admin', evidenceNotes: 'Test restore completed in 4 mins.', location: 'Secondary Cloud' },
          { id: 'CMP-ADM-10', title: 'Archived Annual Compliance Logs to Cold Vault', sourceType: 'Audit', sourceId: 'ARCH-2025-HSE', completedDate: '2026-08-25T17:00:00Z', outcome: 'WORM (Write Once Read Many) compliant archive sealed.', verifiedBy: 'Legal Counsel', evidenceNotes: 'Legal seal applied.', location: 'Group Legal Vault' }
        ],
        notifications: [
          { id: 'NTF-ADM-01', timestamp: '2026-10-07T06:05:00Z', title: 'Immutable Audit Ledger Verified', message: 'All 650+ event hashes validated with zero collisions or discrepancies.', severity: 'Low', category: 'Security', sourceId: 'AUD-HASH-LEDGER', read: false, senderName: 'Audit Integrity Watcher' },
          { id: 'NTF-ADM-02', timestamp: '2026-10-06T19:00:00Z', title: 'RBAC Policy Update Broadcasted', message: 'Area Authority digital signing privileges updated and synced to all nodes.', severity: 'Low', category: 'System', sourceId: 'SEC-RBAC-04', read: true, senderName: 'Policy Engine' },
          { id: 'NTF-ADM-03', timestamp: '2026-10-05T16:30:00Z', title: 'IoT Telemetry Mesh Connected', message: '24 Fahud-West gas sensor transmitters successfully sending 10-second beacons.', severity: 'Low', category: 'IoT', sourceId: 'IOT-GRID-FAHUD', read: true, senderName: 'IoT Gateway' },
          { id: 'NTF-ADM-04', timestamp: '2026-10-04T12:05:00Z', title: 'Statutory Notification Delivered', message: 'Incident INC-2026-UAE-0622 successfully acknowledged by Abu Dhabi OSHAD portal.', severity: 'Low', category: 'Compliance', sourceId: 'INC-2026-UAE-0622', read: true, senderName: 'Government Gateway' },
          { id: 'NTF-ADM-05', timestamp: '2026-10-03T10:30:00Z', title: 'High-Risk Escalation Engine Active', message: 'CAPA escalation rules activated with automatic SMS alerts for overdue P1 items.', severity: 'Medium', category: 'Workflow', sourceId: 'SYS-CAPA-ESCALATE', read: true, senderName: 'Workflow Automation' },
          { id: 'NTF-ADM-06', timestamp: '2026-10-01T10:30:00Z', title: 'Security Advisory: MFA Enforced', message: 'Multi-factor authentication mandate now enforced for all 14 enterprise roles.', severity: 'Medium', category: 'Security', sourceId: 'SEC-MFA-2026', read: true, senderName: 'IAM Service' },
          { id: 'NTF-ADM-07', timestamp: '2026-09-28T16:15:00Z', title: 'ISO 27001 Audit Finding Closed', message: 'External surveillance finding regarding backup encryption verified closed.', severity: 'Low', category: 'Audit', sourceId: 'AUD-ISO-27001', read: true, senderName: 'BSI Middle East' },
          { id: 'NTF-ADM-08', timestamp: '2026-09-22T11:30:00Z', title: 'WAF Security Policy Hardened', message: 'Cloud Armor WAF rules updated with enhanced rate limiting on authentication routes.', severity: 'Low', category: 'Security', sourceId: 'SEC-CSP-2026', read: true, senderName: 'Cloud Security' },
          { id: 'NTF-ADM-09', timestamp: '2026-09-18T16:00:00Z', title: 'Civil Defence Webhook Test Passed', message: 'Bi-directional telemetry heartbeat confirmed with Abu Dhabi Civil Defence HQ.', severity: 'Low', category: 'Emergency', sourceId: 'ADCD-WH-01', read: true, senderName: 'Civil Defence Gateway' },
          { id: 'NTF-ADM-10', timestamp: '2026-09-12T13:30:00Z', title: 'PWA Offline Schema Synchronized', message: 'IndexedDB schema version 2 deployed with full offline sync capability for field workers.', severity: 'Low', category: 'Mobile', sourceId: 'PWA-IDB-V2', read: true, senderName: 'PWA Manager' }
        ]
      },
      ...EXTENDED_ENTERPRISE_USERS
    ];
  }
}
