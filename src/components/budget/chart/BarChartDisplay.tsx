
import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ChartData {
  name: string;
  Estimated: number;
  Actual: number;
}

interface BarChartDisplayProps {
  data: ChartData[];
  viewType: string;
  colors: string[];
  formatCurrency: (amount: number) => string;
}

const BarChartDisplay: React.FC<BarChartDisplayProps> = ({
  data,
  viewType,
  colors,
  formatCurrency
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
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
            {data.map((entry, index) => (
              <div key={index} className="flex items-center text-sm">
                <div 
                  className="w-4 h-4 mr-1" 
                  style={{ backgroundColor: colors[index % colors.length] }}
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
  );
};

export default BarChartDisplay;
