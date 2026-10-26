import React from 'react';
import { Activity, Clock3 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import type { WorkflowRecordType } from '../../types/workflow';

interface WorkflowRecordPanelProps {
  recordId: string;
  recordType?: WorkflowRecordType;
}

export const WorkflowRecordPanel: React.FC<WorkflowRecordPanelProps> = ({ recordId, recordType }) => {
  const { t, language, dir } = useLanguage();
  const { users } = useUser();
  const { enabled, workItems } = useWorkflow();

  if (!enabled) return null;
  const items = workItems.filter(item =>
    item.recordId === recordId
      && (!recordType || item.recordType === recordType || Boolean(item.parentWorkItemId) || (recordType === 'Incident' && item.recordType === 'Investigation'))
  );
  if (!items.length) return null;

  return (
    <section dir={dir} className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
        <Activity size={16} className="text-indigo-600" />{t('workflow.title')}
      </h3>
      <div className="space-y-3">
        {items.map(item => {
          const owner = item.assignedToUser
            ? users.find(user => user.id === item.assignedToUser)?.name ?? item.assignedToUser
            : item.pool ?? item.assignedToRole;
          const history = item.history.slice().reverse();
          return (
            <article key={item.id} className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-[10px] text-slate-500">{item.recordType} · {item.status}</p>
                </div>
                <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-bold text-indigo-800">{item.status}</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-600">
                <strong>{t('workflow.currentOwner')}:</strong> {owner}
              </p>
              <p className="text-[11px] text-slate-600">
                <strong>{t('workflow.nextStep')}:</strong> {item.status === 'Done' || item.status === 'Rejected' ? t('workflow.finished') : item.approverRole && item.status === 'PendingApproval' ? item.approverRole : item.assignedToRole}
              </p>
              <div className="mt-3 border-s-2 border-indigo-200 ps-3">
                <p className="mb-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                  <Clock3 size={12} />{t('workflow.history')}
                </p>
                {history.map(entry => (
                  <p key={entry.id} className="mb-1 text-[10px] text-slate-600">
                    {entry.action} · {users.find(user => user.id === entry.actorId)?.name ?? entry.actorId} · {new Date(entry.at).toLocaleString(language === 'ar' ? 'ar-OM' : 'en-GB')}
                    {entry.reason ? ` · ${entry.reason}` : ''}
                  </p>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default WorkflowRecordPanel;
