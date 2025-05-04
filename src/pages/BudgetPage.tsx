
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
import { DollarSign, Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/dashboard/StatCard';

interface BudgetCategory {
  name: string;
  estimated: number;
  actual: number;
}

const BudgetPage: React.FC = () => {
  const [viewType, setViewType] = useState('estimated');
  const [localBudgetData, setLocalBudgetData] = useState(budgetData);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<BudgetCategory | null>(null);
  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState<BudgetCategory>({ name: '', estimated: 0, actual: 0 });
  
  const { isSpecial, isSuperAdmin } = useAuth();
  const canEdit = isSpecial() || isSuperAdmin();
  
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
  const allocatedPercentage = Math.round((localBudgetData.allocated / localBudgetData.totalBudget) * 100);
  const spentPercentage = Math.round((localBudgetData.spent / localBudgetData.totalBudget) * 100);
  const remainingBudget = localBudgetData.totalBudget - localBudgetData.spent;
  
  // Prepare data for bar chart
  const barChartData = localBudgetData.categories.map(cat => ({
    name: cat.name,
    Estimated: cat.estimated,
    Actual: cat.actual
  }));
  
  // Prepare data for pie chart
  const pieChartData = viewType === 'estimated' 
    ? localBudgetData.categories.map(cat => ({
        name: cat.name,
        value: cat.estimated,
      }))
    : localBudgetData.categories.map(cat => ({
        name: cat.name,
        value: cat.actual,
      }));
  
  // Define colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Handle editing a category
  const handleEditCategory = (category: BudgetCategory) => {
    if (!canEdit) return;
    
    setEditCategory(category);
    setEditDialogOpen(true);
  };
  
  // Handle saving edited category
  const handleSaveCategory = () => {
    if (!editCategory) return;
    
    const newCategories = localBudgetData.categories.map(cat => 
      cat.name === editCategory.name ? editCategory : cat
    );
    
    // Recalculate totals
    const allocated = newCategories.reduce((sum, cat) => sum + cat.estimated, 0);
    const spent = newCategories.reduce((sum, cat) => sum + cat.actual, 0);
    
    setLocalBudgetData({
      ...localBudgetData,
      categories: newCategories,
      allocated,
      spent
    });
    
    setEditDialogOpen(false);
    toast.success(`Updated ${editCategory.name} budget`);
  };
  
  // Handle adding new category
  const handleAddCategory = () => {
    if (!canEdit || !newCategory.name.trim()) return;
    
    const newCategories = [...localBudgetData.categories, newCategory];
    
    // Recalculate totals
    const allocated = newCategories.reduce((sum, cat) => sum + cat.estimated, 0);
    const spent = newCategories.reduce((sum, cat) => sum + cat.actual, 0);
    
    setLocalBudgetData({
      ...localBudgetData,
      categories: newCategories,
      allocated,
      spent
    });
    
    setAddCategoryDialog(false);
    setNewCategory({ name: '', estimated: 0, actual: 0 });
    toast.success(`Added new budget category: ${newCategory.name}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget & Financial Plan</h1>
          <p className="text-muted-foreground">
            Track financial allocation, spending, and projections
          </p>
        </div>
        
        {canEdit && (
          <Button 
            onClick={() => setAddCategoryDialog(true)}
            className="bg-zarfuel-blue hover:bg-zarfuel-blue/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget Category
          </Button>
        )}
      </div>
      
      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Budget" 
          value={formatCurrency(localBudgetData.totalBudget)} 
          icon={DollarSign}
          colorClass="text-zarfuel-gold"
        />
        <StatCard 
          title="Allocated" 
          value={formatCurrency(localBudgetData.allocated)}
          description={`${allocatedPercentage}% of total budget`}
          icon={DollarSign}
          colorClass="text-zarfuel-blue"
        />
        <StatCard 
          title="Spent" 
          value={formatCurrency(localBudgetData.spent)}
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
                    {canEdit && (
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {localBudgetData.categories.map((category, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium">{category.name}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(category.estimated)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(category.actual)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(category.estimated - category.actual)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {category.estimated > 0 ? Math.round((category.actual / category.estimated) * 100) : 0}%
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3 text-sm text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditCategory(category)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                  <tr className="font-medium bg-slate-50">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(localBudgetData.categories.reduce((sum, cat) => sum + cat.estimated, 0))}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(localBudgetData.categories.reduce((sum, cat) => sum + cat.actual, 0))}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(
                      localBudgetData.categories.reduce((sum, cat) => sum + cat.estimated - cat.actual, 0)
                    )}</td>
                    <td className="px-4 py-3 text-right">
                      {localBudgetData.allocated > 0 ? Math.round((localBudgetData.spent / localBudgetData.allocated) * 100) : 0}%
                    </td>
                    {canEdit && <td className="px-4 py-3"></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Tabs>
      
      {/* Edit Category Dialog */}
      {editCategory && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Budget Category</DialogTitle>
              <DialogDescription>
                Update the budget details for {editCategory.name}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(85vh-120px)] p-1">
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input 
                    id="name" 
                    value={editCategory.name} 
                    onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="estimated" className="text-right">Estimated Budget</Label>
                  <Input 
                    id="estimated" 
                    type="number" 
                    value={editCategory.estimated} 
                    onChange={(e) => setEditCategory({ 
                      ...editCategory, 
                      estimated: parseFloat(e.target.value) || 0 
                    })} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="actual" className="text-right">Actual Spent</Label>
                  <Input 
                    id="actual" 
                    type="number" 
                    value={editCategory.actual} 
                    onChange={(e) => setEditCategory({ 
                      ...editCategory, 
                      actual: parseFloat(e.target.value) || 0 
                    })} 
                    className="col-span-3" 
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveCategory}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialog} onOpenChange={setAddCategoryDialog}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add New Budget Category</DialogTitle>
            <DialogDescription>
              Create a new budget category to track expenses
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(85vh-120px)] p-1">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-name" className="text-right">Name</Label>
                <Input 
                  id="new-name" 
                  value={newCategory.name} 
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-estimated" className="text-right">Estimated Budget</Label>
                <Input 
                  id="new-estimated" 
                  type="number" 
                  value={newCategory.estimated} 
                  onChange={(e) => setNewCategory({ 
                    ...newCategory, 
                    estimated: parseFloat(e.target.value) || 0 
                  })} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-actual" className="text-right">Actual Spent</Label>
                <Input 
                  id="new-actual" 
                  type="number" 
                  value={newCategory.actual} 
                  onChange={(e) => setNewCategory({ 
                    ...newCategory, 
                    actual: parseFloat(e.target.value) || 0 
                  })} 
                  className="col-span-3" 
                />
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setAddCategoryDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddCategory}
              disabled={!newCategory.name.trim()}
            >
              Add Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetPage;
