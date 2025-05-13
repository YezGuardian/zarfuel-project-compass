import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/dashboard/StatCard';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { toast } from 'sonner';
import { H1, Paragraph } from '@/components/ui/typography';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            phases:phase_id (name)
          `);
          
        if (error) throw error;
        
        const formattedTasks = data.map(task => ({
          ...task,
          phase: task.phases?.name,
          // Calculate progress based on status
          progress: task.status === 'complete' ? 100 :
                    task.status === 'inprogress' ? 50 :
                    task.status === 'ongoing' ? 25 : 0
        })) as Task[];
        
        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
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
  
  // Get upcoming tasks (sorted by start_date)
  const upcomingTasks = [...tasks]
    .filter(task => 
      task.start_date && 
      new Date(task.start_date) >= new Date() &&
      task.status !== 'complete'
    )
    .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime())
    .slice(0, 5);
  
  // Data for the donut chart
  const chartData = [
    { name: 'Completed', value: taskStats.completed, color: '#10B981' },
    { name: 'In Progress', value: taskStats.inProgress, color: '#F59E0B' },
    { name: 'Ongoing', value: taskStats.ongoing, color: '#3B82F6' },
    { name: 'Not Started', value: taskStats.notStarted, color: '#EF4444' },
  ];
  
  return (
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
            
            {/* Upcoming Tasks */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{task.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              Starts {new Date(task.start_date!).toLocaleDateString()}
                            </p>
                            <span>•</span>
                            <p className="text-sm text-muted-foreground">{task.responsible_teams?.[0] || 'No team assigned'}</p>
                          </div>
                        </div>
                        <StatusBadge status={task.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No upcoming tasks</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      There are no tasks scheduled to start in the next 30 days
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline */}
                <div className="absolute top-0 bottom-0 left-[15px] w-0.5 bg-muted"></div>
                
                {/* Timeline Items */}
                <div className="space-y-6 relative">
                  {tasks
                    .filter(task => task.start_date)
                    .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime())
                    .map((task) => (
                    <div key={task.id} className="ml-8 relative">
                      {/* Timeline Marker */}
                      <div className="absolute -left-[30px] top-1">
                        {task.status === 'complete' && <div className="h-6 w-6 rounded-full bg-status-complete flex items-center justify-center text-white"><CheckCircle className="h-4 w-4" /></div>}
                        {task.status === 'inprogress' && <div className="h-6 w-6 rounded-full bg-status-inprogress flex items-center justify-center text-white"><Clock className="h-4 w-4" /></div>}
                        {task.status === 'notstarted' && <div className="h-6 w-6 rounded-full bg-status-notstarted flex items-center justify-center text-white"><AlertCircle className="h-4 w-4" /></div>}
                        {task.status === 'ongoing' && <div className="h-6 w-6 rounded-full bg-status-ongoing flex items-center justify-center text-white"><RefreshCw className="h-4 w-4" /></div>}
                      </div>
                      
                      {/* Timeline Content */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <StatusBadge status={task.status} showLabel={false} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {task.start_date && new Date(task.start_date).toLocaleDateString()}
                          {task.end_date && ` - ${new Date(task.end_date).toLocaleDateString()}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.phase} • {task.responsible_teams?.[0] || 'No team assigned'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
