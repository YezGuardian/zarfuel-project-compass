
import React from 'react';
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

interface StatusSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <FormItem>
      <FormLabel>Status*</FormLabel>
      <Select
        onValueChange={onChange}
        defaultValue={value}
        disabled={disabled}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select task status" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="notstarted">Not Started</SelectItem>
          <SelectItem value="inprogress">In Progress</SelectItem>
          <SelectItem value="ongoing">Ongoing</SelectItem>
          <SelectItem value="complete">Complete</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};

export default StatusSelector;
