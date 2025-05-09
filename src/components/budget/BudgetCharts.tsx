
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BarChartDisplay from './chart/BarChartDisplay';
import PieChartDisplay from './chart/PieChartDisplay';

interface ChartData {
  name: string;
  Estimated: number;
  Actual: number;
}

interface PieData {
  name: string;
  value: number;
}

interface BudgetChartsProps {
  viewType: string;
  setViewType: (value: string) => void;
  barChartData: ChartData[];
  pieChartData: PieData[];
  COLORS: string[];
  formatCurrency: (amount: number) => string;
}

const BudgetCharts: React.FC<BudgetChartsProps> = ({
  viewType,
  setViewType,
  barChartData,
  pieChartData,
  COLORS,
  formatCurrency
}) => {
  return (
    <Tabs defaultValue="estimated" onValueChange={(value) => setViewType(value)}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="estimated">Estimated</TabsTrigger>
        <TabsTrigger value="actual">Actual</TabsTrigger>
      </TabsList>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <BarChartDisplay 
          data={barChartData}
          viewType={viewType}
          colors={COLORS}
          formatCurrency={formatCurrency}
        />
        
        <PieChartDisplay 
          data={pieChartData}
          colors={COLORS}
          formatCurrency={formatCurrency}
        />
      </div>
    </Tabs>
  );
};

export default BudgetCharts;
