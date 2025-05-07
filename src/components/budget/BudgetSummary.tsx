
import React from 'react';
import { DollarSign } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

interface BudgetSummaryProps {
  totalBudget: number;
  allocated: number;
  spent: number;
  remainingBudget: number;
  allocatedPercentage: number;
  spentPercentage: number;
  formatCurrency: (amount: number) => string;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  totalBudget,
  allocated,
  spent,
  remainingBudget,
  allocatedPercentage,
  spentPercentage,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Total Budget" 
        value={formatCurrency(totalBudget)} 
        icon={DollarSign}
        colorClass="text-zarfuel-gold"
      />
      <StatCard 
        title="Allocated" 
        value={formatCurrency(allocated)}
        description={`${allocatedPercentage}% of total budget`}
        icon={DollarSign}
        colorClass="text-zarfuel-blue"
      />
      <StatCard 
        title="Spent" 
        value={formatCurrency(spent)}
        description={`${spentPercentage}% of total budget`}
        icon={DollarSign}
        colorClass="text-status-complete"
      />
      <StatCard 
        title="Remaining" 
        value={formatCurrency(remainingBudget)}
        description={`${100 - spentPercentage}% of total budget`}
        icon={DollarSign}
        colorClass="text-status-inprogress"
      />
    </div>
  );
};

export default BudgetSummary;
