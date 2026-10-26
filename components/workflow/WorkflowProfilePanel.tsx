import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import type { WorkItem } from '../../types/workflow';

interface WorkflowProfilePanelProps {
  userId: string;
}

export const WorkflowProfilePanel: React.FC<WorkflowProfilePanelProps> = ({ userId }) => {
  const { t } = useLanguage();
  const { workItems } = useWorkflow();
  const sections: Array<{ label: string; items: WorkItem[] }> = [
    {
      label: t('workflow.myTasks'),
      items: workItems.filter(item => item.assignedToUser === userId && item.status !== 'Done' && item.status !== 'Rejected')
    },
    {
      label: t('workflow.completedItems'),
      items: workItems.filter(item => item.performedByUser === userId && item.status === 'Done')
    },
    {
      label: t('workflow.delegations'),
      items: workItems.filter(item => item.delegatedToUser === userId)
    }
  ];

  return (
    <div className="space-y-6">
      {sections.map(section => (
        <section key={section.label} className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-black text-slate-800">
            {section.label} <span className="text-slate-400">({section.items.length})</span>
          </h3>
          {section.items.length ? (
            <div className="space-y-2">
              {section.items.map(item => (
                <article key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-[10px] text-slate-500">{item.recordType} · {item.recordId} · {item.status}</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {t('workflow.currentOwner')}: {item.assignedToUser ?? item.pool ?? item.assignedToRole}
                  </p>
                </article>
              ))}
            </div>
          ) : <p className="text-xs text-slate-400">{t('workflow.noTasks')}</p>}
        </section>
      ))}
    </div>
  );
};

export default WorkflowProfilePanel;
