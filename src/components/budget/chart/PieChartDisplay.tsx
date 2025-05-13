import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';

interface PieData {
  name: string;
  value: number;
}

interface PieChartDisplayProps {
  data: PieData[];
  colors: string[];
  formatCurrency: (amount: number) => string;
}

const PieChartDisplay: React.FC<PieChartDisplayProps> = ({
  data,
  colors,
  formatCurrency
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Enhanced colors for dark mode
  const chartColors = isDark 
    ? colors.map(color => {
        // Brighten colors for dark mode
        return color === '#0088FE' ? '#00AAFE' : 
               color === '#FFBB28' ? '#FFD028' : 
               color === '#FF8042' ? '#FFA042' : color;
      }) 
    : colors;
    
  const textColor = isDark ? '#fff' : '#000';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Allocation</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="40%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)} 
                contentStyle={{ 
                  backgroundColor: isDark ? '#333' : '#fff',
                  color: textColor,
                  border: `1px solid ${isDark ? '#555' : '#ddd'}`
                }}
                labelStyle={{ color: textColor }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Color-coded legend */}
        <div className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center text-sm text-foreground">
                <div 
                  className="w-4 h-4 mr-1" 
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                ></div>
                <div className="flex flex-col">
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{entry.name}</span>
                  <span className="font-medium">
                    {Math.round((entry.value / data.reduce((sum, e) => sum + e.value, 0)) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChartDisplay;
