
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge';
import { tasks, Task } from '@/data/mockData';
import { Search, LayoutGrid, List, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const TasksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const { isAdmin } = useAuth();
  
  // Get unique phases and teams for filters
  const phases = Array.from(new Set(tasks.map(task => task.phase)));
  const teams = Array.from(new Set(tasks.map(task => task.team)));
  
  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhase = phaseFilter === 'all' || task.phase === phaseFilter;
    const matchesTeam = teamFilter === 'all' || task.team === teamFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesPhase && matchesTeam && matchesStatus;
  });

  // Group tasks by phase for kanban view
  const tasksByPhase = phases.reduce((acc, phase) => {
    acc[phase] = filteredTasks.filter(task => task.phase === phase);
    return acc;
  }, {} as Record<string, Task[]>);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Phases & Tasks</h1>
          <p className="text-muted-foreground">
            Track and manage all project tasks across different phases
          </p>
        </div>
        
        {isAdmin() && (
          <Button className="bg-zarfuel-blue hover:bg-zarfuel-blue/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Tasks</CardTitle>
          <CardDescription>Filter the tasks by phase, team, status or search by name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                {phases.map(phase => (
                  <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="notstarted">Not Started</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* View Selector */}
      <div className="flex justify-end">
        <div className="bg-muted p-1 rounded-md inline-flex">
          <Button 
            variant={view === 'table' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('table')}
            className="flex items-center"
          >
            <List className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button 
            variant={view === 'kanban' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('kanban')}
            className="flex items-center"
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Kanban
          </Button>
        </div>
      </div>
      
      {/* Tasks Views */}
      {view === 'table' ? (
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Phase</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Task</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Team</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Timeline</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Progress</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm">{task.phase}</td>
                        <td className="px-4 py-3 text-sm font-medium">{task.name}</td>
                        <td className="px-4 py-3 text-sm">{task.team}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${task.progress}%`,
                                backgroundColor: 
                                  task.status === 'complete' ? '#10B981' :
                                  task.status === 'inprogress' ? '#F59E0B' :
                                  task.status === 'ongoing' ? '#3B82F6' : '#EF4444'
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 inline-block">
                            {task.progress}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <TaskStatusBadge status={task.status as any} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No tasks found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {phases.map(phase => (
            <Card key={phase} className="h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {phase} <span className="text-xs bg-muted rounded-full px-2 py-1 ml-2">{tasksByPhase[phase]?.length || 0}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasksByPhase[phase]?.length > 0 ? (
                  tasksByPhase[phase].map(task => (
                    <div key={task.id} className="bg-white border rounded-md p-3 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{task.name}</h3>
                        <TaskStatusBadge status={task.status as any} className="ml-2" />
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {task.team} • {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{ 
                            width: `${task.progress}%`,
                            backgroundColor: 
                              task.status === 'complete' ? '#10B981' :
                              task.status === 'inprogress' ? '#F59E0B' :
                              task.status === 'ongoing' ? '#3B82F6' : '#EF4444'
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 inline-block">
                        {task.progress}%
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-muted-foreground text-sm">
                    No tasks in this phase
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
