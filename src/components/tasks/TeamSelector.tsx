
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';

interface TeamSelectorProps {
  teams: string[];
  selectedTeams: string[];
  onToggleTeam: (team: string) => void;
  disabled?: boolean;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ 
  teams, 
  selectedTeams, 
  onToggleTeam,
  disabled = false
}) => {
  return (
    <FormItem>
      <FormLabel>Responsible Teams</FormLabel>
      <div className="flex flex-wrap gap-2 mt-2">
        {teams.map(team => (
          <Button
            key={team}
            type="button"
            variant={selectedTeams.includes(team) ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleTeam(team)}
            disabled={disabled}
          >
            {team}
          </Button>
        ))}
      </div>
      <FormDescription>
        Select the teams responsible for this task
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
};

export default TeamSelector;
