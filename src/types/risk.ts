
export interface Risk {
  id: string;
  name: string;
  category: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  status: 'identified' | 'mitigated' | 'ongoing';
  description: string;
  mitigation_strategy: string;
  responsible_person: string;
}

// Function to map from the mockData Risk type to our application Risk type
export const mapMockRiskToAppRisk = (mockRisk: {
  id: string;
  type: 'financial' | 'regulatory' | 'operational' | 'environmental';
  description: string;
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
  status: 'active' | 'mitigated' | 'monitoring';
}): Risk => {
  // Map statuses
  let mappedStatus: 'identified' | 'mitigated' | 'ongoing';
  switch (mockRisk.status) {
    case 'active':
      mappedStatus = 'identified';
      break;
    case 'mitigated':
      mappedStatus = 'mitigated';
      break;
    case 'monitoring':
      mappedStatus = 'ongoing';
      break;
    default:
      mappedStatus = 'identified';
  }

  // Map impact
  let mappedImpact: 'low' | 'medium' | 'high' | 'critical';
  switch (mockRisk.impact) {
    case 'high':
      mappedImpact = 'high';
      break;
    case 'medium':
      mappedImpact = 'medium';
      break;
    case 'low':
      mappedImpact = 'low';
      break;
    default:
      mappedImpact = 'medium';
  }

  return {
    id: mockRisk.id,
    name: `Risk: ${mockRisk.type} issue`,
    category: mockRisk.type,
    impact: mappedImpact,
    likelihood: 'medium', // Default since the mock data doesn't have likelihood
    status: mappedStatus,
    description: mockRisk.description,
    mitigation_strategy: mockRisk.mitigation,
    responsible_person: 'Unassigned' // Default since the mock data doesn't have responsible person
  };
};
