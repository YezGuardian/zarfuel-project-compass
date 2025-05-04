
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Phase, Task } from '@/types';

interface TaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  phaseFilter: string;
  setPhaseFilter: (phase: string) => void;
  teamFilter: string;
  setTeamFilter: (team: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  phases: Phase[];
  teams: string[];
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  phaseFilter,
  setPhaseFilter,
  teamFilter,
  setTeamFilter,
  statusFilter,
  setStatusFilter,
  phases,
  teams,
}) => {
  return (
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
                <SelectItem key={phase.id} value={phase.id}>
                  PHASE {phase.position}: {phase.name}
                </SelectItem>
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
  );
};

export default TaskFilters;
