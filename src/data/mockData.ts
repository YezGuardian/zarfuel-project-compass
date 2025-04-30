
// Define types for our data
export type TaskStatus = 'complete' | 'inprogress' | 'notstarted' | 'ongoing';

export type Task = {
  id: string;
  phase: string;
  name: string;
  team: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: TaskStatus;
};

export type Risk = {
  id: string;
  type: 'financial' | 'regulatory' | 'operational' | 'environmental';
  description: string;
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
  status: 'active' | 'mitigated' | 'monitoring';
};

export type Contact = {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  organization: 'ZARSOM' | 'SAPPI';
  role: string;
  image?: string;
};

export type Document = {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  url: string;
};

// Mock tasks data
export const tasks: Task[] = [
  {
    id: '1',
    phase: 'Pre-Development',
    name: 'Feasibility Study',
    team: 'Planning Team',
    startDate: '2025-01-10',
    endDate: '2025-02-20',
    progress: 100,
    status: 'complete'
  },
  {
    id: '2',
    phase: 'Pre-Development',
    name: 'Regulatory Permits',
    team: 'Legal Team',
    startDate: '2025-02-25',
    endDate: '2025-06-15',
    progress: 0,
    status: 'notstarted'
  },
  {
    id: '3',
    phase: 'Pre-Development',
    name: 'Funding Drive',
    team: 'Finance Team',
    startDate: '2025-02-01',
    endDate: '2025-07-30',
    progress: 40,
    status: 'inprogress'
  },
  {
    id: '4',
    phase: 'Pre-Development',
    name: 'Stakeholder Engagement',
    team: 'Management Team',
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    progress: 50,
    status: 'ongoing'
  },
  {
    id: '5',
    phase: 'Launch',
    name: 'Brand Development & Online Presence',
    team: 'Marketing Team',
    startDate: '2025-03-01',
    endDate: '2025-06-15',
    progress: 65,
    status: 'inprogress'
  },
  {
    id: '6',
    phase: 'Site Prep',
    name: 'Environmental Impact Assessment',
    team: 'Environmental Team',
    startDate: '2025-04-15',
    endDate: '2025-08-30',
    progress: 20,
    status: 'inprogress'
  },
  {
    id: '7',
    phase: 'Site Prep',
    name: 'Land Clearing',
    team: 'Construction Team',
    startDate: '2025-09-01',
    endDate: '2025-10-15',
    progress: 0,
    status: 'notstarted'
  },
  {
    id: '8',
    phase: 'Construction',
    name: 'Foundation Work',
    team: 'Construction Team',
    startDate: '2025-10-20',
    endDate: '2025-12-15',
    progress: 0,
    status: 'notstarted'
  }
];

// Mock risks data
export const risks: Risk[] = [
  {
    id: '1',
    type: 'financial',
    description: 'Budget overrun due to material cost increases',
    impact: 'high',
    mitigation: 'Secure multiple suppliers and include contingency in budget',
    status: 'active'
  },
  {
    id: '2',
    type: 'regulatory',
    description: 'Delay in obtaining environmental permits',
    impact: 'high',
    mitigation: 'Early engagement with environmental authorities',
    status: 'monitoring'
  },
  {
    id: '3',
    type: 'operational',
    description: 'Local community opposition to project',
    impact: 'medium',
    mitigation: 'Community engagement program and local benefits package',
    status: 'mitigated'
  },
  {
    id: '4',
    type: 'environmental',
    description: 'Soil contamination discovery during excavation',
    impact: 'high',
    mitigation: 'Comprehensive site survey prior to construction',
    status: 'active'
  },
  {
    id: '5',
    type: 'financial',
    description: 'Exchange rate fluctuations affecting equipment costs',
    impact: 'medium',
    mitigation: 'Forward contracts for major purchases',
    status: 'monitoring'
  }
];

// Mock contacts data
export const contacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    title: 'Project Director',
    email: 'john.smith@zarsom.com',
    phone: '+27 82 123 4567',
    organization: 'ZARSOM',
    role: 'Management',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    title: 'Legal Advisor',
    email: 'sarah.johnson@zarsom.com',
    phone: '+27 83 987 6543',
    organization: 'ZARSOM',
    role: 'Legal',
  },
  {
    id: '3',
    name: 'Mark Williams',
    title: 'Environmental Officer',
    email: 'mark.williams@sappi.com',
    phone: '+27 84 234 5678',
    organization: 'SAPPI',
    role: 'Environmental',
  },
  {
    id: '4',
    name: 'Lisa Brown',
    title: 'Marketing Director',
    email: 'lisa.brown@zarsom.com',
    phone: '+27 82 345 6789',
    organization: 'ZARSOM',
    role: 'Marketing',
  },
  {
    id: '5',
    name: 'David Chen',
    title: 'Financial Controller',
    email: 'david.chen@zarsom.com',
    phone: '+27 83 456 7890',
    organization: 'ZARSOM',
    role: 'Finance',
  },
  {
    id: '6',
    name: 'James Wilson',
    title: 'Construction Manager',
    email: 'james.wilson@sappi.com',
    phone: '+27 84 567 8901',
    organization: 'SAPPI',
    role: 'Construction',
  }
];

// Mock documents data
export const documents: Document[] = [
  {
    id: '1',
    name: 'Environmental Impact Assessment',
    category: 'Environmental',
    uploadDate: '2025-03-15',
    fileSize: '4.2 MB',
    fileType: 'pdf',
    url: '#'
  },
  {
    id: '2',
    name: 'SAPPI Support Letter',
    category: 'Legal',
    uploadDate: '2025-02-20',
    fileSize: '1.5 MB',
    fileType: 'pdf',
    url: '#'
  },
  {
    id: '3',
    name: 'Site Design Plans',
    category: 'Technical',
    uploadDate: '2025-03-22',
    fileSize: '8.7 MB',
    fileType: 'pdf',
    url: '#'
  },
  {
    id: '4',
    name: 'Project Budget Forecast',
    category: 'Financial',
    uploadDate: '2025-03-01',
    fileSize: '2.3 MB',
    fileType: 'xlsx',
    url: '#'
  },
  {
    id: '5',
    name: 'Marketing Strategy',
    category: 'Marketing',
    uploadDate: '2025-03-10',
    fileSize: '3.1 MB',
    fileType: 'pptx',
    url: '#'
  }
];

// Budget data
export const budgetData = {
  totalBudget: 15000000,
  allocated: 9500000,
  spent: 3200000,
  categories: [
    { name: 'Land Acquisition', estimated: 3000000, actual: 2800000 },
    { name: 'Construction', estimated: 8000000, actual: 0 },
    { name: 'Equipment', estimated: 2500000, actual: 200000 },
    { name: 'Permits & Legal', estimated: 500000, actual: 150000 },
    { name: 'Marketing', estimated: 300000, actual: 50000 },
    { name: 'Contingency', estimated: 700000, actual: 0 }
  ]
};

// Function to calculate task statistics
export const getTaskStats = () => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'complete').length;
  const inProgress = tasks.filter(task => task.status === 'inprogress').length;
  const notStarted = tasks.filter(task => task.status === 'notstarted').length;
  const ongoing = tasks.filter(task => task.status === 'ongoing').length;
  
  return {
    total,
    completed,
    inProgress,
    notStarted,
    ongoing,
    completedPercentage: Math.round((completed / total) * 100),
    inProgressPercentage: Math.round((inProgress / total) * 100),
    notStartedPercentage: Math.round((notStarted / total) * 100),
    ongoingPercentage: Math.round((ongoing / total) * 100)
  };
};

// Function to get upcoming tasks (next 30 days)
export const getUpcomingTasks = () => {
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);
  
  return tasks.filter(task => {
    const startDate = new Date(task.startDate);
    return startDate >= today && startDate <= thirtyDaysLater;
  });
};
