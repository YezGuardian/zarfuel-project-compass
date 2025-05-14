import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/dashboard/StatCard';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, CheckCircle, Clock, AlertCircle, RefreshCw, DollarSign, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Task, Phase } from '@/types';
import { toast } from 'sonner';
import { H1, Paragraph } from '@/components/ui/typography';
import { useAuth } from '@/contexts/AuthContext';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import PhaseProgress from '@/components/tasks/PhaseProgress';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [budgetData, setBudgetData] = useState({
    totalBudget: 0,
    allocated: 0,
    spent: 0,
    remainingBudget: 0,
    allocatedPercentage: 0,
    spentPercentage: 0
  });
  const [riskData, setRiskData] = useState({
    totalRisks: 0,
    mitigatedRisks: 0,
    outstandingRisks: 0,
    mitigatedPercentage: 0
  });
  const { needsPasswordChange } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            *,
            phases:phase_id (name)
          `);
          
        if (tasksError) throw tasksError;
        
        const formattedTasks = tasksData.map(task => ({
          ...task,
          phase: task.phases?.name,
          // Calculate progress based on status
          progress: task.status === 'complete' ? 100 :
                    task.status === 'inprogress' ? 50 :
                    task.status === 'ongoing' ? 25 : 0
        })) as Task[];
        
        setTasks(formattedTasks);
        
        // Fetch phases
        const { data: phasesData, error: phasesError } = await supabase
          .from('phases')
          .select('*')
          .order('position');
          
        if (phasesError) throw phasesError;
        setPhases(phasesData as Phase[]);
        
        // Fetch budget data (mock data for now)
        const mockBudgetData = {
          totalBudget: 5000000,
          allocated: 3500000,
          spent: 2000000,
          remainingBudget: 3000000,
          allocatedPercentage: 70,
          spentPercentage: 40
        };
        setBudgetData(mockBudgetData);
        
        // Fetch risk data (mock data for now)
        const { data: risksData, error: risksError } = await supabase
          .from('risks')
          .select('*');
          
        if (risksError) {
          console.error('Error fetching risks:', risksError);
          // Use mock data if there's an error
          setRiskData({
            totalRisks: 10,
            mitigatedRisks: 4,
            outstandingRisks: 6,
            mitigatedPercentage: 40
          });
        } else {
          // Calculate risk statistics
          const mitigatedRisks = (risksData || []).filter(risk => risk.status === 'mitigated').length;
          const totalRisks = (risksData || []).length;
          const mitigatedPercentage = totalRisks > 0 ? Math.round((mitigatedRisks / totalRisks) * 100) : 0;
          
          setRiskData({
            totalRisks,
            mitigatedRisks,
            outstandingRisks: totalRisks - mitigatedRisks,
            mitigatedPercentage
          });
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'complete').length,
    inProgress: tasks.filter(task => task.status === 'inprogress').length,
    ongoing: tasks.filter(task => task.status === 'ongoing').length,
    notStarted: tasks.filter(task => task.status === 'notstarted').length,
    completedPercentage: tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'complete').length / tasks.length) * 100) : 0,
    inProgressPercentage: tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'inprogress').length / tasks.length) * 100) : 0,
    ongoingPercentage: tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'ongoing').length / tasks.length) * 100) : 0,
    notStartedPercentage: tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'notstarted').length / tasks.length) * 100) : 0,
  };
  
  // Get tasks in progress
  const tasksInProgress = [...tasks]
    .filter(task => task.status === 'inprogress' || task.status === 'ongoing')
    .sort((a, b) => {
      // Sort by status first (inprogress before ongoing)
      if (a.status === 'inprogress' && b.status !== 'inprogress') return -1;
      if (a.status !== 'inprogress' && b.status === 'inprogress') return 1;
      
      // Then sort by start date if available
      if (a.start_date && b.start_date) {
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      }
      return 0;
    });
  
  // Calculate phase progress
  const calculatePhaseProgress = (phaseId: string) => {
    const phaseTasks = tasks.filter(task => task.phase_id === phaseId);
    if (phaseTasks.length === 0) return 0;
    
    const completedTasks = phaseTasks.filter(task => task.status === 'complete').length;
    return Math.round((completedTasks / phaseTasks.length) * 100);
  };
  
  // Data for the donut chart
  const chartData = [
    { name: 'Completed', value: taskStats.completed, color: '#10B981' },
    { name: 'In Progress', value: taskStats.inProgress, color: '#F59E0B' },
    { name: 'Ongoing', value: taskStats.ongoing, color: '#3B82F6' },
    { name: 'Not Started', value: taskStats.notStarted, color: '#EF4444' },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks?taskId=${taskId}`);
  };
  
  return (
    <>
      <ChangePasswordModal open={needsPasswordChange} />
      
      <div className="space-y-6">
        <div>
          <H1>Project Overview</H1>
          <Paragraph className="text-muted-foreground">
            ZARFUEL Truck Stop project progress dashboard
          </Paragraph>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading dashboard data...</span>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Tasks" 
                value={taskStats.total} 
                icon={Calendar}
                colorClass="text-zarfuel-blue"
              />
              <StatCard 
                title="Completed" 
                value={`${taskStats.completed} (${taskStats.completedPercentage}%)`}
                icon={CheckCircle}
                colorClass="text-status-complete"
              />
              <StatCard 
                title="In Progress" 
                value={`${taskStats.inProgress} (${taskStats.inProgressPercentage}%)`}
                icon={Clock}
                colorClass="text-status-inprogress"
              />
              <StatCard 
                title="Not Started" 
                value={`${taskStats.notStarted} (${taskStats.notStartedPercentage}%)`}
                icon={AlertCircle}
                colorClass="text-status-notstarted"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Chart */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Task Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}`}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value} tasks`, 'Count']} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tasks In Progress */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Tasks In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    {tasksInProgress.length > 0 ? (
                      <div className="space-y-4">
                        {tasksInProgress.map((task) => (
                          <div 
                            key={task.id} 
                            className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0 cursor-pointer hover:bg-slate-50"
                            onClick={() => handleTaskClick(task.id)}
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">
                                Phase: {task.phase || 'Unassigned'}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">
                                  {task.responsible_teams?.[0] || 'No team assigned'}
                                </p>
                              </div>
                            </div>
                            <StatusBadge status={task.status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-lg font-medium">No tasks in progress</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          All tasks are either completed or not started yet
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Phase Progress Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Phase Progress Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-6">
                      {phases.map((phase) => (
                        <div key={phase.id} className="space-y-2">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{phase.name}</h3>
                            <span className="text-sm text-muted-foreground">
                              {calculatePhaseProgress(phase.id)}%
                            </span>
                          </div>
                          <PhaseProgress progress={calculatePhaseProgress(phase.id)} />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {/* Budget & Financial Plan Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget & Financial Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Budget:</span>
                      <span className="font-bold">{formatCurrency(budgetData.totalBudget)}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Allocated ({budgetData.allocatedPercentage}%)</span>
                        <span>{formatCurrency(budgetData.allocated)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-zarfuel-blue" 
                          style={{ width: `${budgetData.allocatedPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Spent ({budgetData.spentPercentage}%)</span>
                        <span>{formatCurrency(budgetData.spent)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-status-complete" 
                          style={{ width: `${budgetData.spentPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Remaining ({100 - budgetData.spentPercentage}%)</span>
                        <span>{formatCurrency(budgetData.remainingBudget)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-status-inprogress" 
                          style={{ width: `${100 - budgetData.spentPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Risk Mitigation Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Mitigation Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium mr-4">{riskData.mitigatedPercentage}% Mitigated</div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-green-500" 
                          style={{ width: `${riskData.mitigatedPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded-md p-3 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Total Risks</p>
                        <p className="text-2xl font-bold">{riskData.totalRisks}</p>
                      </div>
                      <div className="border rounded-md p-3 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Mitigated</p>
                        <p className="text-2xl font-bold text-green-600">{riskData.mitigatedRisks}</p>
                      </div>
                      <div className="border rounded-md p-3 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
                        <p className="text-2xl font-bold text-yellow-600">{riskData.outstandingRisks}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
