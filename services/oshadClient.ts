export async function getOshadRiskData(riskId: string) {
  try {
    const response = await fetch(`/api/oshad/risk/${riskId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OSHAD risk data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getOshadRiskData:', error);
    throw error;
  }
}
