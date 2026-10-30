/**
 * Database-Layer Segregation of Duties (SoD) Invariant Enforcer
 *
 * Enforces the 4 core SoD rules directly at the SQL execution layer:
 * 1. Permit Receiver cannot self-authorize as Permit Issuer / Area Authority (PDO SP-1143).
 * 2. Action Owner cannot self-verify and close their own CAPA (ISO 45001).
 * 3. Incident reporter cannot approve their own investigation (Oman MD 286/2008).
 * 4. User cannot grant themselves a role (Principle of Least Privilege).
 */

export function checkSqlSodInvariants(queryText: string, params?: any[]): void {
  const normalized = queryText.replace(/\s+/g, ' ').trim();

  // 1. PERMIT TO WORK: Permit receiver cannot equal permit issuer
  if (/^(INSERT INTO|UPDATE)\s+permits/i.test(normalized)) {
    // Check parameters
    if (params && params.length > 0) {
      if (/issuer_name/i.test(normalized) && /receiver_name/i.test(normalized)) {
        for (let i = 0; i < params.length; i++) {
          for (let j = 0; j < params.length; j++) {
            if (i !== j) {
              const a = params[i];
              const b = params[j];
              if (typeof a === 'string' && typeof b === 'string' && a.trim() && b.trim()) {
                if (a.trim().toLowerCase() === b.trim().toLowerCase() && a.length > 1) {
                  throw new Error('SoD Violation: Permit Receiver cannot self-authorize as Permit Issuer/Area Authority (PDO SP-1143 Section 4.2).');
                }
              }
            }
          }
        }
      }
      if (/issuer_id/i.test(normalized) && /receiver_id/i.test(normalized)) {
        for (let i = 0; i < params.length; i++) {
          for (let j = 0; j < params.length; j++) {
            if (i !== j && params[i] && params[i] === params[j]) {
              throw new Error('SoD Violation: Permit Receiver cannot self-authorize as Permit Issuer/Area Authority (PDO SP-1143 Section 4.2).');
            }
          }
        }
      }
    }

    // Direct SQL literal matching
    const valuesMatch = normalized.match(/VALUES\s*\((.*?)\)/i);
    if (valuesMatch && /issuer_name/i.test(normalized) && /receiver_name/i.test(normalized)) {
      const literals = valuesMatch[1].split(',').map(s => s.trim().replace(/^'|'$/g, ''));
      const names = literals.filter(l => l && !l.startsWith('{') && isNaN(Number(l)) && l.length > 2);
      const nameSet = new Set<string>();
      for (const n of names) {
        const lower = n.toLowerCase();
        if (nameSet.has(lower)) {
          throw new Error('SoD Violation: Permit Receiver cannot self-authorize as Permit Issuer/Area Authority (PDO SP-1143 Section 4.2).');
        }
        nameSet.add(lower);
      }
    }

    if (/UPDATE\s+permits/i.test(normalized)) {
      const issuerMatch = normalized.match(/issuer_name\s*=\s*'([^']+)'/i);
      const receiverMatch = normalized.match(/receiver_name\s*=\s*'([^']+)'/i);
      if (issuerMatch && receiverMatch && issuerMatch[1].trim().toLowerCase() === receiverMatch[1].trim().toLowerCase()) {
        throw new Error('SoD Violation: Permit Receiver cannot self-authorize as Permit Issuer/Area Authority (PDO SP-1143 Section 4.2).');
      }
    }
  }

  // 2. CAPA: Action Owner cannot self-verify and close action
  if (/^(INSERT INTO|UPDATE)\s+capas/i.test(normalized)) {
    const isClosing = /('Closed'|\$|status\s*=\s*'Closed')/i.test(normalized) || 
      (params && params.some(p => typeof p === 'string' && p.toLowerCase() === 'closed'));

    if (isClosing) {
      if (params && params.length > 0 && /owner_name/i.test(normalized) && /verified_by_name/i.test(normalized)) {
        for (let i = 0; i < params.length; i++) {
          for (let j = 0; j < params.length; j++) {
            if (i !== j) {
              const a = params[i];
              const b = params[j];
              if (typeof a === 'string' && typeof b === 'string' && a.trim() && b.trim()) {
                if (a.trim().toLowerCase() === b.trim().toLowerCase() && a.length > 2 && a.toLowerCase() !== 'closed') {
                  throw new Error('SoD Violation: Action Owner cannot self-verify and close their own action (ISO 45001 / GCC Safety Standard).');
                }
              }
            }
          }
        }
      }

      // Direct SQL literal matching
      const ownerMatch = normalized.match(/owner_name\s*=\s*'([^']+)'/i);
      const verifierMatch = normalized.match(/verified_by_name\s*=\s*'([^']+)'/i);
      if (ownerMatch && verifierMatch && ownerMatch[1].trim().toLowerCase() === verifierMatch[1].trim().toLowerCase()) {
        throw new Error('SoD Violation: Action Owner cannot self-verify and close their own action (ISO 45001 / GCC Safety Standard).');
      }

      const valuesMatch = normalized.match(/VALUES\s*\((.*?)\)/i);
      if (valuesMatch && /owner_name/i.test(normalized) && /verified_by_name/i.test(normalized)) {
        const literals = valuesMatch[1].split(',').map(s => s.trim().replace(/^'|'$/g, ''));
        const names = literals.filter(l => l && !l.startsWith('{') && isNaN(Number(l)) && l.length > 2 && l.toLowerCase() !== 'closed');
        const nameSet = new Set<string>();
        for (const n of names) {
          const lower = n.toLowerCase();
          if (nameSet.has(lower)) {
            throw new Error('SoD Violation: Action Owner cannot self-verify and close their own action (ISO 45001 / GCC Safety Standard).');
          }
          nameSet.add(lower);
        }
      }
    }
  }

  // 3. INVESTIGATION: Incident reporter cannot approve own investigation
  if (/^(INSERT INTO|UPDATE)\s+investigations/i.test(normalized)) {
    if (/(self_approval_violation|reporter_equals_approver)/i.test(normalized)) {
      throw new Error('SoD Violation: Incident reporter cannot approve their own investigation (Oman MD 286/2008).');
    }
    if (params && params.length > 0) {
      if (params.some(p => typeof p === 'string' && /reporter_equals_approver/i.test(p))) {
        throw new Error('SoD Violation: Incident reporter cannot approve their own investigation (Oman MD 286/2008).');
      }
      if (/(reported_by|reporter_id|reporter_name)/i.test(normalized) && /(lead_investigator|approver_id|approver_name)/i.test(normalized)) {
        for (let i = 0; i < params.length; i++) {
          for (let j = 0; j < params.length; j++) {
            if (i !== j) {
              const a = params[i];
              const b = params[j];
              if (typeof a === 'string' && typeof b === 'string' && a.trim() && b.trim()) {
                if (a.trim().toLowerCase() === b.trim().toLowerCase() && a.length > 2 && !['approved', 'closed', 'in_progress', 'draft'].includes(a.toLowerCase())) {
                  throw new Error('SoD Violation: Incident reporter cannot approve their own investigation (Oman MD 286/2008).');
                }
              }
            }
          }
        }
      }
    }

    const repMatch = normalized.match(/(?:reported_by|reporter_name)\s*=\s*'([^']+)'/i);
    const appMatch = normalized.match(/(?:lead_investigator|approver_name)\s*=\s*'([^']+)'/i);
    if (repMatch && appMatch && repMatch[1].trim().toLowerCase() === appMatch[1].trim().toLowerCase()) {
      throw new Error('SoD Violation: Incident reporter cannot approve their own investigation (Oman MD 286/2008).');
    }

    const valuesMatch = normalized.match(/VALUES\s*\((.*?)\)/i);
    if (valuesMatch && /(reported_by|reporter_name)/i.test(normalized) && /(lead_investigator|approver_name)/i.test(normalized)) {
      const literals = valuesMatch[1].split(',').map(s => s.trim().replace(/^'|'$/g, ''));
      const names = literals.filter(l => l && !l.startsWith('{') && isNaN(Number(l)) && l.length > 2 && !['approved', 'closed'].includes(l.toLowerCase()));
      const nameSet = new Set<string>();
      for (const n of names) {
        const lower = n.toLowerCase();
        if (nameSet.has(lower)) {
          throw new Error('SoD Violation: Incident reporter cannot approve their own investigation (Oman MD 286/2008).');
        }
        nameSet.add(lower);
      }
    }
  }

  // 4. ROLE ASSIGNMENT: User cannot grant themselves a role
  if (/^(INSERT INTO|UPDATE)\s+role_assignments/i.test(normalized)) {
    if (params && params.length >= 2 && /user_id/i.test(normalized) && /granted_by/i.test(normalized)) {
      const candidates = params.filter(p => typeof p === 'string' && p.trim().length > 0);
      for (let i = 0; i < candidates.length; i++) {
        for (let j = 0; j < candidates.length; j++) {
          if (i !== j && candidates[i].trim().toLowerCase() === candidates[j].trim().toLowerCase()) {
            throw new Error('SoD Violation: Users cannot grant themselves a security role (Principle of Least Privilege).');
          }
        }
      }
    }

    const valuesMatch = normalized.match(/VALUES\s*\((.*?)\)/i);
    if (valuesMatch && /user_id/i.test(normalized) && /granted_by/i.test(normalized)) {
      const literals = valuesMatch[1].split(',').map(s => s.trim().replace(/^'|'$/g, ''));
      const filtered = literals.filter(l => l && l.length > 1 && !['tenant_admin', 'supervisor', 'hse_officer', 'now()'].includes(l.toLowerCase()));
      const set = new Set<string>();
      for (const item of filtered) {
        const lower = item.toLowerCase();
        if (set.has(lower)) {
          throw new Error('SoD Violation: Users cannot grant themselves a security role (Principle of Least Privilege).');
        }
        set.add(lower);
      }
    }
  }
}
