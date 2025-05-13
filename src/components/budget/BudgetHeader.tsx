import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { H1, Paragraph } from '@/components/ui/typography';

interface BudgetHeaderProps {
  canEdit: boolean;
  onAddCategory: () => void;
}

const BudgetHeader: React.FC<BudgetHeaderProps> = ({ canEdit, onAddCategory }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <H1>Budget & Financial Plan</H1>
        <Paragraph className="text-muted-foreground">
          Track financial allocation, spending, and projections
        </Paragraph>
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
