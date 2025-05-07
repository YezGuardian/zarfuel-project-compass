
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BudgetHeaderProps {
  canEdit: boolean;
  onAddCategory: () => void;
}

const BudgetHeader: React.FC<BudgetHeaderProps> = ({ canEdit, onAddCategory }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Budget & Financial Plan</h1>
        <p className="text-muted-foreground">
          Track financial allocation, spending, and projections
        </p>
      </div>
      
      {canEdit && (
        <Button 
          onClick={onAddCategory}
          className="bg-zarfuel-blue hover:bg-zarfuel-blue/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget Category
        </Button>
      )}
    </div>
  );
};

export default BudgetHeader;
