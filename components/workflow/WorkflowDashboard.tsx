import React, { useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock3, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { WORKFLOW_DEMO_SUPERVISION, WORKFLOW_DEMO_USERS } from '../../services/workflowDemoUsers';
import {
  canDelegateWorkflowItem,
  canReassignWorkflowItem,
  getWorkflowActionPermission,
  isOverdueStatus
} from '../../services/workflowPermissions';
import type { WorkflowAction, WorkflowActor, WorkflowEvent, WorkItem } from '../../types/workflow';

export const WorkflowDashboard: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { currentUser, isDemoMode, users, switchUser } = useUser();
  const { enabled, clientConfigured, settingEnabled, serverStatus, workItems, events, error, refresh, runSampleScenario } = useWorkflow();
  const [runningScenario, setRunningScenario] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  if (!clientConfigured) return null;
  if (!enabled) {
    if (!isDemoMode || !settingEnabled) return null;
    return (
      <div dir={dir} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-bold">{t('workflow.title')}</p>
        <p className="mt-1">{serverStatus === 'disabled' ? t('workflow.serverDisabled') : t('workflow.profileRequired')}</p>
      </div>
    );
  }

  const actor: WorkflowActor = currentUser ? {
    id: currentUser.id,
    role: currentUser.role,
    department: currentUser.department,
    siteId: 'site-sohar',
    supervisedUserIds: WORKFLOW_DEMO_SUPERVISION[currentUser.id] ?? []
  } : { id: '', role: 'Worker' };

  const myTasks = workItems.filter(item => item.assignedToUser === actor.id);
  const poolTasks = workItems.filter(item => item.pool === actor.role && !item.assignedToUser);
  const approvals = workItems.filter(item => item.status === 'PendingApproval' && item.approverRole === actor.role);
  const overdue = workItems.filter(item => isOverdueStatus(item.status, item.dueAt));
  const sections = [
    { key: 'workflow.myTasks', icon: <CheckCircle2 size={15} />, items: myTasks },
    { key: 'workflow.teamPool', icon: <Users size={15} />, items: poolTasks },
    { key: 'workflow.approvals', icon: <ShieldCheck size={15} />, items: approvals },
    { key: 'workflow.overdue', icon: <AlertTriangle size={15} />, items: overdue }
  ];

  const handleScenario = async () => {
    setRunningScenario(true);
    setScenarioError(null);
    try {
      await runSampleScenario();
    } catch (cause) {
      setScenarioError(cause instanceof Error ? cause.message : 'Workflow scenario failed.');
    } finally {
      setRunningScenario(false);
    }
  };

  return (
    <section dir={dir} className="rounded-2xl border border-indigo-100 bg-white/90 shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
            <Activity size={18} className="text-indigo-600" />
            {t('workflow.title')}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{t('workflow.demoOnly')}</p>
        </div>
        <div className="flex items-center gap-2">
          {isDemoMode && (
            <select
              aria-label={t('workflow.selectUser')}
              value={currentUser?.id ?? ''}
              onChange={event => switchUser(event.target.value)}
              className="max-w-[190px] rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700"
            >
              {users.filter(user => WORKFLOW_DEMO_USERS.some(demoUser => demoUser.id === user.id)).map(user => (
                <option key={user.id} value={user.id}>{user.name} · {user.role.replaceAll('_', ' ')}</option>
              ))}
            </select>
          )}
          <button onClick={() => void refresh()} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" title={t('workflow.refresh')}>
            <RefreshCw size={15} />
          </button>
          {isDemoMode && (
            <button
              type="button"
              onClick={() => void handleScenario()}
              disabled={runningScenario}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {runningScenario ? t('workflow.loading') : t('workflow.runScenario')}
            </button>
          )}
        </div>
      </div>

      {(error || scenarioError) && (
        <p role="alert" className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-800">{scenarioError || error}</p>
      )}

      {isDemoMode && (
        <p className="border-b border-indigo-100 bg-indigo-50/70 px-4 py-2 text-xs text-indigo-900">
          {t('workflow.scenarioHelp')}
        </p>
      )}

      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
        <div className="grid gap-3 md:grid-cols-2">
          {sections.map(section => (
            <div key={section.key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-700">
                {section.icon}{t(section.key)}<span className="ms-auto rounded-full bg-white px-2 py-0.5 text-[10px]">{section.items.length}</span>
              </h3>
              {section.items.length ? (
                <div className="space-y-2">
                  {section.items.slice(0, 5).map(item => <WorkflowTaskCard key={item.id} item={item} actor={actor} />)}
                </div>
              ) : <p className="py-2 text-xs text-slate-400">{t('workflow.noTasks')}</p>}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <h3 className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-700">
            <Clock3 size={15} />{t('workflow.activity')}
          </h3>
          <div className="space-y-2">
            {events.slice(-6).reverse().map(event => (
              <div key={event.id} className="border-s-2 border-indigo-300 ps-2">
                <p className="text-xs font-semibold text-slate-800">{activityTitle(event, language)}</p>
                <p className="text-[10px] text-slate-500">{new Date(event.createdAt).toLocaleString(language === 'ar' ? 'ar-OM' : 'en-GB')}</p>
              </div>
            ))}
            {!events.length && <p className="py-2 text-xs text-slate-400">{t('workflow.noTasks')}</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

const WorkflowTaskCard: React.FC<{ item: WorkItem; actor: WorkflowActor }> = ({ item, actor }) => {
  const { t, dir } = useLanguage();
  const { users } = useUser();
  const { act } = useWorkflow();
  const [recipientId, setRecipientId] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const terminal = item.status === 'Done' || item.status === 'Rejected';
  const overdue = isOverdueStatus(item.status, item.dueAt);
  const claimPermission = getWorkflowActionPermission(item, actor, 'claim');
  const takeoverPermission = getWorkflowActionPermission(item, actor, 'takeover');
  const completePermission = getWorkflowActionPermission(item, actor, 'complete');
  const approvePermission = getWorkflowActionPermission(item, actor, 'approve');
  const escalatePermission = getWorkflowActionPermission(item, actor, 'escalate');
  const recipients = useMemo(() => users
    .filter(user => user.id !== actor.id && WORKFLOW_DEMO_USERS.some(demoUser => demoUser.id === user.id))
    .map(user => ({
      id: user.id,
      role: user.role,
      department: user.department,
      siteId: 'site-sohar',
      supervisedUserIds: WORKFLOW_DEMO_SUPERVISION[user.id] ?? []
    }))
    .filter(target =>
      canReassignWorkflowItem(item, actor, target).allowed
      || canDelegateWorkflowItem(item, actor, target).allowed
    ), [actor, item, users]);

  const runAction = async (action: WorkflowAction) => {
    setActionError(null);
    try {
      await act(item.id, action);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Workflow action failed.');
    }
  };

  const withReason = (type: 'takeover' | 'reject' | 'return' | 'escalate') => {
    const reason = window.prompt(t('workflow.reason'));
    if (!reason || reason.trim().length < 3) return;
    if (type === 'takeover' || type === 'reject' || type === 'return' || type === 'escalate') {
      void runAction({ type, reason });
    }
  };

  const reassign = () => {
    const target = recipients.find(candidate => candidate.id === recipientId);
    if (!target) return;
    const reason = window.prompt(t('workflow.reason'));
    if (!reason || reason.trim().length < 3) return;
    void runAction({ type: 'reassign', target, reason });
  };

  const delegate = () => {
    const target = recipients.find(candidate => candidate.id === recipientId);
    if (!target) return;
    const note = window.prompt(t('workflow.delegateNote'));
    if (!note || note.trim().length < 3) return;
    void runAction({ type: 'delegate', target, note });
  };

  const selectedRecipient = recipients.find(candidate => candidate.id === recipientId);
  const reassignPermission = selectedRecipient
    ? canReassignWorkflowItem(item, actor, selectedRecipient)
    : { allowed: false, reason: recipients.length ? 'Select an eligible recipient first.' : 'No eligible recipient is available.' };
  const delegatePermission = selectedRecipient
    ? canDelegateWorkflowItem(item, actor, selectedRecipient)
    : { allowed: false, reason: recipients.length ? 'Select an eligible recipient first.' : 'No eligible recipient is available.' };

  return (
    <article dir={dir} className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-900">{item.title}</p>
          <p className="mt-1 text-[10px] text-slate-500">{item.recordType} · {item.recordId}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${overdue ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
          {item.status}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
        <span>{item.assignedToUser || item.pool || item.assignedToRole}</span>
        <span>{t('workflow.due')} {new Date(item.dueAt).toLocaleDateString()}</span>
      </div>

      {!terminal && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.pool && !item.assignedToUser && (
            <ActionButton label={t('workflow.claim')} permission={claimPermission} onClick={() => void runAction({ type: 'claim' })} />
          )}
          {item.assignedToUser && item.assignedToUser !== actor.id && (
            <ActionButton label={t('workflow.takeover')} permission={takeoverPermission} onClick={() => withReason('takeover')} />
          )}
          {item.status !== 'PendingApproval' && (
            <ActionButton label={t('workflow.complete')} permission={completePermission} onClick={() => void runAction({ type: 'complete' })} />
          )}
          {item.status === 'PendingApproval' && (
            <>
              <ActionButton label={t('workflow.approve')} permission={approvePermission} onClick={() => void runAction({ type: 'approve' })} />
              <ActionButton label={t('workflow.reject')} permission={approvePermission} onClick={() => withReason('reject')} />
              <ActionButton label={t('workflow.return')} permission={approvePermission} onClick={() => withReason('return')} />
            </>
          )}
          {!item.assignedToUser && !item.pool && (
            <ActionButton label={t('workflow.claim')} permission={claimPermission} onClick={() => void runAction({ type: 'claim' })} />
          )}
          <ActionButton label={t('workflow.escalate')} permission={escalatePermission} onClick={() => withReason('escalate')} />
          <div className="flex min-w-full flex-wrap items-center gap-1.5 pt-1">
            <select
              aria-label={t('workflow.selectUser')}
              value={recipientId}
              onChange={event => setRecipientId(event.target.value)}
              className="max-w-[180px] rounded border border-slate-200 bg-white px-2 py-1 text-[10px]"
            >
              <option value="">{t('workflow.selectUser')}</option>
              {recipients.map(recipient => {
                const user = users.find(candidate => candidate.id === recipient.id);
                return <option key={recipient.id} value={recipient.id}>{user?.name} · {recipient.role.replaceAll('_', ' ')}</option>;
              })}
            </select>
            <ActionButton
              label={t('workflow.reassign')}
              permission={reassignPermission}
              onClick={reassign}
            />
            <ActionButton
              label={t('workflow.delegate')}
              permission={delegatePermission}
              onClick={delegate}
            />
          </div>
        </div>
      )}
      {actionError && <p role="alert" className="mt-2 text-[10px] text-rose-700">{actionError}</p>}
    </article>
  );
};

const ActionButton: React.FC<{
  label: string;
  permission: { allowed: boolean; reason?: string };
  onClick: () => void;
}> = ({ label, permission, onClick }) => (
  <button
    type="button"
    disabled={!permission.allowed}
    title={permission.allowed ? undefined : permission.reason}
    aria-label={permission.allowed ? label : `${label}: ${permission.reason}`}
    onClick={onClick}
    className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-800 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
  >
    {label}
  </button>
);

function activityTitle(event: WorkflowEvent, language: string): string {
  const title = String(event.payload.title ?? event.recordRef.recordId);
  if (language === 'ar') {
    const labels: Record<WorkflowEvent['type'], string> = {
      'incident.reported': 'تم الإبلاغ عن حادث',
      'observation.reported': 'تم إرسال ملاحظة',
      'task.assigned': 'تم إسناد مهمة',
      'task.claimed': 'تم استلام المهمة',
      'task.reassigned': 'تمت إعادة إسناد المهمة',
      'task.delegated': 'تم تفويض المهمة',
      'task.completed': 'اكتملت المهمة',
      'approval.requested': 'مطلوب اعتماد',
      'approval.granted': 'تم الاعتماد',
      'approval.rejected': 'تم رفض الاعتماد',
      'task.returned': 'أعيدت المهمة',
      'task.overdue': 'تجاوزت المهمة موعدها',
      'task.escalated': 'تم تصعيد المهمة'
    };
    return `${labels[event.type]}: ${title}`;
  }
  return `${event.type.replaceAll('.', ' ')}: ${title}`;
}

export default WorkflowDashboard;
