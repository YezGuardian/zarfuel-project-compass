
import React from 'react';
import { Phase } from '@/types';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PhaseSelectorProps {
  phases: Phase[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const PhaseSelector: React.FC<PhaseSelectorProps> = ({
  phases,
  value,
  onChange,
  disabled = false
}) => {
  return (
    <FormItem>
      <FormLabel>Phase*</FormLabel>
      <Select
        onValueChange={onChange}
        defaultValue={value}
        disabled={disabled}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a phase" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {phases.map(phase => (
            <SelectItem key={phase.id} value={phase.id}>
              {phase.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};

export default PhaseSelector;
