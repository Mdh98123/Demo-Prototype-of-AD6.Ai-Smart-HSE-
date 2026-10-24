const fs = require('fs');

function updateDependencies(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Update saveTasks to calculate 'Blocked' state for all tasks dynamically
    // Actually, rather than dynamically setting status to Blocked in saveTasks, we can just ensure that `updateTaskStatus` handles it, or `useEffect` updates it.
    // Let's modify `saveTasks` to ensure status consistency
    const runStateConsistency = `
    const checkAndUpdateDependencies = (tasksList: Task[]) => {
        let changed = false;
        let newTasks = [...tasksList];
        
        const isTaskBlockedDynamic = (task: Task, currentTasks: Task[]) => {
            if (!task.dependencies || task.dependencies.length === 0) return false;
            return currentTasks.filter(t => task.dependencies?.includes(t.id) && t.status !== 'Done').length > 0;
        };

        newTasks = newTasks.map(t => {
            const blocked = isTaskBlockedDynamic(t, newTasks);
            if (blocked && t.status !== 'Blocked') { changed = true; return { ...t, status: 'Blocked' as Task['status'] }; }
            if (!blocked && t.status === 'Blocked') { changed = true; return { ...t, status: 'ToDo' as Task['status'] }; }
            return t;
        });

        // Resolve cascading unblocks
        while(changed) {
            changed = false;
            newTasks = newTasks.map(t => {
                const blocked = isTaskBlockedDynamic(t, newTasks);
                if (blocked && t.status !== 'Blocked') { changed = true; return { ...t, status: 'Blocked' as Task['status'] }; }
                if (!blocked && t.status === 'Blocked') { changed = true; return { ...t, status: 'ToDo' as Task['status'] }; }
                return t;
            });
        }
        return newTasks;
    };
    
    // Replace saveTasks
    `
    // Instead of complex logic, I'll just change the string array in `TaskModule.tsx`
    content = content.replace(/\['ToDo', 'InProgress', 'Done'\]/g, "['ToDo', 'InProgress', 'Blocked', 'Done']");

    // Add styling for Blocked column and badges
    content = content.replace(/(case 'InProgress': return 'bg-brand-[^;]+;)/, "$1\n          case 'Blocked': return 'bg-red-50/50 border-red-200';");
    content = content.replace(/(case 'InProgress': return 'text-brand-[^;]+;)/, "$1\n          case 'Blocked': return 'text-red-700 border-b-red-200 bg-red-100/40';");
    content = content.replace(/(case 'InProgress': return 'border-l-4 border-l-brand-[^;]+;)/, "$1\n          case 'Blocked': return 'border-l-4 border-l-red-500';");
    content = content.replace(/case 'InProgress': return 'bg-brand-50 text-brand-700 border-brand-200';/, "case 'InProgress': return 'bg-brand-50 text-brand-700 border-brand-200';\n          case 'Blocked': return 'bg-red-50 text-red-700 border-red-200';");
    
    // Status badges logic in `getStatusBadge`
    content = content.replace(/(case 'InProgress': return 'bg-blue-[^;]+;)/, "$1\n          case 'Blocked': return 'bg-red-50 text-red-600 border-red-200';");
    
    // Fix grid layout for 4 columns
    content = content.replace(/lg:grid-cols-3/g, "lg:grid-cols-4");

    // Fix the header styling `bg-slate-400` logic:
    content = content.replace(/status === 'ToDo' \? 'bg-slate-400' : status === 'InProgress' \? 'bg-brand-500' : 'bg-emerald-500'/, "status === 'ToDo' ? 'bg-slate-400' : status === 'InProgress' ? 'bg-brand-500' : status === 'Blocked' ? 'bg-red-500' : 'bg-emerald-500'");
    
    // Add logic to saveTasks
    const saveTasksOriginal = `const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('hse_tasks', JSON.stringify(updatedTasks));
  };`;
  
    const saveTasksNew = `const saveTasks = (updatedTasks: Task[]) => {
    let tasksList = [...updatedTasks];
    
    const checkBlockers = (list: Task[]) => {
        let changed = false;
        const out = list.map(t => {
            if (!t.dependencies || t.dependencies.length === 0) {
               if(t.status === 'Blocked') { changed = true; return {...t, status: 'ToDo'}; }
               return t;
            }
            const hasBlockers = list.some(blocker => t.dependencies!.includes(blocker.id) && blocker.status !== 'Done');
            if (hasBlockers && t.status !== 'Blocked') {
                changed = true; return {...t, status: 'Blocked'};
            } else if (!hasBlockers && t.status === 'Blocked') {
                changed = true; return {...t, status: 'ToDo'};
            }
            return t;
        });
        return { out, changed };
    };

    let result = checkBlockers(tasksList);
    while (result.changed) {
        result = checkBlockers(result.out);
    }
    
    setTasks(result.out);
    localStorage.setItem('hse_tasks', JSON.stringify(result.out));
  };`;

    content = content.replace(saveTasksOriginal, saveTasksNew);

    // Also update `status === 'Done'` etc button logic to respect 'Blocked'
    // Like handle edit click status button rendering
    const buttonRenderOriginal = `{status === 'ToDo' && !isBlocked && (
                                                        <button onClick={() => updateTaskStatus(task.id, 'InProgress')}`;
                                                        
    // I don't need to change it much, just wait as 'isBlocked' is now the column status.
    // If status is 'Blocked', we shouldn't show any start button.
    content = content.replace(/\{status === 'ToDo' && !isBlocked &&/g, "{status === 'ToDo' && task.status !== 'Blocked' && !isBlocked &&");

    fs.writeFileSync(filePath, content);
}

updateDependencies('components/TaskModule.tsx');
console.log("Updated TaskModule code!");
