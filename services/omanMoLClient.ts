export async function getOmanRegulatoryRiskData(riskId: string) {
  try {
    const response = await fetch(`/api/regulatory/risk/${riskId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Oman regulatory risk data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getOmanRegulatoryRiskData:', error);
    throw error;
  }
}

// Backward-compatible alias
export const getomanMoLRiskData = getOmanRegulatoryRiskData;

