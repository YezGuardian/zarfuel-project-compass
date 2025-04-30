
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { budgetData } from '@/data/mockData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DollarSign } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

const BudgetPage: React.FC = () => {
  const [viewType, setViewType] = useState('estimated');
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate percentages
  const allocatedPercentage = Math.round((budgetData.allocated / budgetData.totalBudget) * 100);
  const spentPercentage = Math.round((budgetData.spent / budgetData.totalBudget) * 100);
  const remainingBudget = budgetData.totalBudget - budgetData.spent;
  
  // Prepare data for bar chart
  const barChartData = budgetData.categories.map(cat => ({
    name: cat.name,
    Estimated: cat.estimated,
    Actual: cat.actual
  }));
  
  // Prepare data for pie chart
  const pieChartData = viewType === 'estimated' 
    ? budgetData.categories.map(cat => ({
        name: cat.name,
        value: cat.estimated,
      }))
    : budgetData.categories.map(cat => ({
        name: cat.name,
        value: cat.actual,
      }));
  
  // Define colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Budget & Financial Plan</h1>
        <p className="text-muted-foreground">
          Track financial allocation, spending, and projections
        </p>
      </div>
      
      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Budget" 
          value={formatCurrency(budgetData.totalBudget)} 
          icon={DollarSign}
          colorClass="text-zarfuel-gold"
        />
        <StatCard 
          title="Allocated" 
          value={formatCurrency(budgetData.allocated)}
          description={`${allocatedPercentage}% of total budget`}
          icon={DollarSign}
          colorClass="text-zarfuel-blue"
        />
        <StatCard 
          title="Spent" 
          value={formatCurrency(budgetData.spent)}
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
      
      {/* Budget Details */}
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
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `R${value/1000}k`}
                    />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar 
                      dataKey={viewType === 'estimated' ? 'Estimated' : 'Actual'} 
                      fill={viewType === 'estimated' ? '#1B3555' : '#10B981'} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            </CardContent>
          </Card>
        </div>
        
        {/* Budget Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detailed Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Estimated</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actual</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Remaining</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">% Used</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData.categories.map((category, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium">{category.name}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(category.estimated)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(category.actual)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(category.estimated - category.actual)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {category.estimated > 0 ? Math.round((category.actual / category.estimated) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                  <tr className="font-medium bg-slate-50">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(budgetData.categories.reduce((sum, cat) => sum + cat.estimated, 0))}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(budgetData.categories.reduce((sum, cat) => sum + cat.actual, 0))}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(
                      budgetData.categories.reduce((sum, cat) => sum + cat.estimated - cat.actual, 0)
                    )}</td>
                    <td className="px-4 py-3 text-right">
                      {Math.round((budgetData.spent / budgetData.allocated) * 100)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default BudgetPage;
