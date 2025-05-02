
import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewSelectorProps {
  view: 'table' | 'kanban';
  setView: (view: 'table' | 'kanban') => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ view, setView }) => {
  return (
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
  );
};

export default ViewSelector;
