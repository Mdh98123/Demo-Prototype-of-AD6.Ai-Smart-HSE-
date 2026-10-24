export async function recordAuditAccess(userId: string, operation: string, payload: any) {
  try {
    await fetch('/api/audit-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, operation, payload })
    });
  } catch (error) {
    console.error('Failed to log audit access to backend:', error);
  }
}
