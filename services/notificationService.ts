export interface EnterpriseNotification {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'PTW' | 'Incident' | 'CAPA' | 'Inspection' | 'Audit' | 'SWA' | 'Training' | 'System';
  targetUserId?: string; // If specific to a user
  targetRole?: string;   // If broadcast to a role
  senderName: string;
  sourceId?: string;
  actionLink?: string;
  actionView?: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = 'ad6_enterprise_notifications';

export const INITIAL_NOTIFICATIONS: EnterpriseNotification[] = [
  {
    id: 'NOTIF-2026-001',
    title: 'Stop Work Authority: Scaffolding Toe-board Missing',
    description: 'Rahul Gupta triggered SWA at Fahud-West Gas Station (Sector 4). All lifting & hot work within 30m suspended pending inspection.',
    severity: 'Critical',
    category: 'SWA',
    targetRole: 'Site_Supervisor',
    senderName: 'Rahul Gupta (Mechanical Technician)',
    sourceId: 'SWA-2026-104',
    actionView: 'WORKFORCE_SAFETY',
    timestamp: '2026-10-06T08:15:00Z',
    read: false
  },
  {
    id: 'NOTIF-2026-002',
    title: 'Permit Sign-Off Required: Hot Work PTW-2026-8812',
    description: 'Pre-ignition gas test completed (0% LEL, 0 ppm H2S). Awaiting Marcus Chen signature for flare header welding authorization.',
    severity: 'High',
    category: 'PTW',
    targetUserId: 'u7',
    targetRole: 'Site_Supervisor',
    senderName: 'Salim Al-Harthy (Senior Gas Tester)',
    sourceId: 'PTW-2026-8812',
    actionView: 'PERMIT_TO_WORK',
    timestamp: '2026-10-06T09:30:00Z',
    read: false
  },
  {
    id: 'NOTIF-2026-003',
    title: 'CAPA Action Assigned: Whip-Check Restraint Retrofit',
    description: 'Assigned by Fatima Al-Zaabi following Wellhead Choke manifold incident INC-2026-OMN-0891. Due date: 2026-10-08.',
    severity: 'High',
    category: 'CAPA',
    targetUserId: 'u6',
    senderName: 'Fatima Al-Zaabi (Site HSE Officer)',
    sourceId: 'CAPA-2026-01',
    actionView: 'CAPA',
    timestamp: '2026-10-05T14:20:00Z',
    read: false
  },
  {
    id: 'NOTIF-2026-004',
    title: 'Statutory Export Ready: Muscat Oman MoL Form MD 286',
    description: 'Incident INC-2026-OMN-0419 Form G ready for formal sign-off and upload to Al-Adaa digital portal within 24hr statutory SLA.',
    severity: 'Medium',
    category: 'Incident',
    targetUserId: 'u5',
    targetRole: 'HSE_Officer',
    senderName: 'System Engine',
    sourceId: 'INC-2026-OMN-0419',
    actionView: 'INCIDENT_MANAGEMENT',
    timestamp: '2026-10-06T11:00:00Z',
    read: false
  },
  {
    id: 'NOTIF-2026-005',
    title: 'Certification Expiry Alert: H2S Breathing Apparatus (BAES)',
    description: 'Refresher training due in 14 days for 6 mechanical contractors at Fahud-West Gas Station.',
    severity: 'Medium',
    category: 'Training',
    targetRole: 'Site_Supervisor',
    senderName: 'Competency Management Engine',
    sourceId: 'CERT-H2S-2026',
    actionView: 'TRAINING_COMPETENCY',
    timestamp: '2026-10-06T07:00:00Z',
    read: true
  },
  {
    id: 'NOTIF-2026-006',
    title: 'Audit Finding Corrective Action Verified',
    description: 'ISO 45001 Surveillance Audit finding F-101 verified closed by Lead Auditor Sarah Jenkins.',
    severity: 'Low',
    category: 'Audit',
    targetRole: 'Head_Group_HSE',
    senderName: 'Sarah Jenkins (Lead Auditor)',
    sourceId: 'AUD-2026-001',
    actionView: 'SAFETY_AUDIT',
    timestamp: '2026-10-05T16:45:00Z',
    read: true
  },
  {
    id: 'NOTIF-2026-007',
    title: 'High Heat Stress Alert: WBGT Reached 32.4°C at Mina Zayed',
    description: 'Automatic thermal threshold alert triggered. Midday work stoppage order active for all exposed outdoor scaffolding crews until 15:30.',
    severity: 'Critical',
    category: 'Inspection',
    targetRole: 'Site_HSE_Manager',
    senderName: 'Environmental Telemetry System',
    sourceId: 'WBGT-MZ-04',
    actionView: 'HEALTH_MONITORING',
    timestamp: '2026-10-06T12:05:00Z',
    read: false
  },
  {
    id: 'NOTIF-2026-008',
    title: 'Contractor Suspension Warning: Expired Third Party Insurance',
    description: 'Gulf Technical Services commercial liability policy lapsed on 2026-10-01. Gate pass issuance automatically blocked at Mina Al Fahal Gate 3.',
    severity: 'High',
    category: 'System',
    targetRole: 'Site_HSE_Manager',
    senderName: 'Contractor Safety Portal Engine',
    sourceId: 'CONT-GTS-001',
    actionView: 'CONTRACTOR_SAFETY',
    timestamp: '2026-10-06T06:30:00Z',
    read: false
  },
  {
    id: 'NOTIF-2026-009',
    title: 'Critical Lift Plan Approval Request: 48T Vessel Module',
    description: 'Tandem crane lift calculation sheet submitted by Hamad Al-Dosari for Ras Al Khair drydock module seating. Awaiting Appointed Person sign-off.',
    severity: 'High',
    category: 'PTW',
    targetRole: 'Site_Supervisor',
    senderName: 'Hamad Al-Dosari (Lifting Specialist)',
    sourceId: 'LIFT-RAK-2026-09',
    actionView: 'LIFTING_OPERATIONS',
    timestamp: '2026-10-06T10:15:00Z',
    read: false
  },
  {
    id: 'NOTIF-2026-010',
    title: 'Chemical Sump Level High Alarm: Zone B Neutralization',
    description: 'Telemetry sensor LV-302 logged caustic soda effluent at 92% capacity. Neutralization valve diversion automatically initiated.',
    severity: 'Medium',
    category: 'Inspection',
    targetRole: 'HSE_Officer',
    senderName: 'SCADA Telemetry System',
    sourceId: 'CHM-ALM-2026',
    actionView: 'HAZMAT_CHEMICALS',
    timestamp: '2026-10-06T08:50:00Z',
    read: false
  },
  {
    id: 'NOTIF-2026-011',
    title: 'MOC Engineering Change Approved: Vent Riser Height Extension',
    description: 'Management of Change MOC-2026-081 signed off by VP Engineering. Physical execution permit unlocked for next turnaround window.',
    severity: 'Low',
    category: 'System',
    targetRole: 'Head_Group_HSE',
    senderName: 'Khalfan Al-Zaabi (Process Safety Lead)',
    sourceId: 'MOC-2026-081',
    actionView: 'MANAGEMENT_OF_CHANGE',
    timestamp: '2026-10-05T18:00:00Z',
    read: true
  },
  {
    id: 'NOTIF-2026-012',
    title: 'Emergency Response Drill Scheduled: Mina Al Fahal Fire Response',
    description: 'Unannounced Tier 2 mutual aid hydrocarbon tank fire drill scheduled for tomorrow morning 09:00 with Civil Defence and Ambulance Authority (CDAA Oman).',
    severity: 'Medium',
    category: 'Training',
    targetRole: 'Site_Supervisor',
    senderName: 'Emergency Response Coordinator',
    sourceId: 'DRILL-2026-Q4',
    actionView: 'EMERGENCY_RESPONSE',
    timestamp: '2026-10-05T11:30:00Z',
    read: true
  }
];

export class NotificationService {
  public static getNotifications(userId?: string, userRole?: string): EnterpriseNotification[] {
    if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let list: EnterpriseNotification[] = saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
      if (!saved) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      }
      if (userId || userRole) {
        return list.filter(n => {
          if (!n.targetUserId && !n.targetRole) return true; // Global notification
          if (n.targetUserId && n.targetUserId === userId) return true;
          if (n.targetRole && n.targetRole === userRole) return true;
          return false;
        });
      }
      return list;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  public static addNotification(notif: Partial<EnterpriseNotification>): EnterpriseNotification {
    const newEntry: EnterpriseNotification = {
      id: notif.id || `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: notif.title || 'System Notification',
      description: notif.description || '',
      severity: notif.severity || 'Medium',
      category: notif.category || 'System',
      targetUserId: notif.targetUserId,
      targetRole: notif.targetRole,
      senderName: notif.senderName || 'HSE Operational Engine',
      sourceId: notif.sourceId,
      actionLink: notif.actionLink,
      actionView: notif.actionView,
      timestamp: notif.timestamp || new Date().toISOString(),
      read: false
    };

    if (typeof window !== 'undefined') {
      try {
        const existing = this.getNotifications();
        const updated = [newEntry, ...existing];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('ad6-notification-event', { detail: newEntry }));
      } catch (err) {
        console.warn('Failed to save notification:', err);
      }
    }

    return newEntry;
  }

  public static markAsRead(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getNotifications();
      const updated = existing.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('ad6-notification-event', { detail: { action: 'read', id } }));
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  }

  public static markAllAsRead(): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getNotifications();
      const updated = existing.map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('ad6-notification-event', { detail: { action: 'read-all' } }));
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    }
  }

  public static getUnreadCount(userId?: string, userRole?: string): number {
    const list = this.getNotifications(userId, userRole);
    return list.filter(n => !n.read).length;
  }
}
