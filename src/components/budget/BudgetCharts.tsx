
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis 
                    tickFormatter={(value) => `R${value/1000}k`}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar 
                    dataKey={viewType === 'estimated' ? 'Estimated' : 'Actual'} 
                    fill={viewType === 'estimated' ? '#1B3555' : '#10B981'} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Color-coded legend */}
            <div className="mt-6">
              <div className="flex flex-wrap gap-4 justify-center">
                {barChartData.map((entry, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div 
                      className="w-4 h-4 mr-1" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="mr-1">{entry.name}:</span>
                    <span className="font-medium">
                      {formatCurrency(viewType === 'estimated' ? entry.Estimated : entry.Actual)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="40%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Color-coded legend */}
            <div className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {pieChartData.map((entry, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div 
                      className="w-4 h-4 mr-1" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div className="flex flex-col">
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{entry.name}</span>
                      <span className="font-medium">{Math.round((entry.value / pieChartData.reduce((sum, e) => sum + e.value, 0)) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Tabs>
  );
};

export default BudgetCharts;
