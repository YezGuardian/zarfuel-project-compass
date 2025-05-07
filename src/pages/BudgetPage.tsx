
import React, { useState } from 'react';
import { budgetData } from '@/data/mockData';
import { DragDropContext } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import BudgetHeader from '@/components/budget/BudgetHeader';
import BudgetSummary from '@/components/budget/BudgetSummary';
import BudgetCharts from '@/components/budget/BudgetCharts';
import BudgetTable from '@/components/budget/BudgetTable';
import BudgetCategoryDialog from '@/components/budget/BudgetCategoryDialog';

export interface BudgetCategory {
  name: string;
  estimated: number;
  actual: number;
  id: string; // Making id required instead of optional
}

const BudgetPage: React.FC = () => {
  const [viewType, setViewType] = useState('estimated');
  const [localBudgetData, setLocalBudgetData] = useState({
    ...budgetData,
    categories: budgetData.categories.map((cat, index) => ({
      ...cat,
      id: `category-${index}` // Ensuring each category has an id
    }))
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<BudgetCategory | null>(null);
  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState<BudgetCategory>({ 
    name: '', 
    estimated: 0, 
    actual: 0,
    id: `new-category-${Date.now()}` // Adding a default ID for new categories
  });
  
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
  
  // Prepare data for charts
  const barChartData = localBudgetData.categories.map(cat => ({
    name: cat.name,
    Estimated: cat.estimated,
    Actual: cat.actual
  }));
  
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
      cat.id === editCategory.id ? editCategory : cat
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
    
    // Ensure the new category has a unique ID
    const categoryWithId: BudgetCategory = {
      ...newCategory,
      id: `new-category-${Date.now()}`
    };
    
    const newCategories = [...localBudgetData.categories, categoryWithId];
    
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
    setNewCategory({ name: '', estimated: 0, actual: 0, id: `new-category-${Date.now()+1}` });
    toast.success(`Added new budget category: ${newCategory.name}`);
  };
  
  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination || !canEdit) return;
    
    const items = Array.from(localBudgetData.categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setLocalBudgetData({
      ...localBudgetData,
      categories: items
    });
    
    toast.success('Budget category order updated');
  };
  
  return (
    <div className="space-y-6">
      <BudgetHeader 
        canEdit={canEdit} 
        onAddCategory={() => setAddCategoryDialog(true)}
      />
      
      <BudgetSummary 
        totalBudget={localBudgetData.totalBudget}
        allocated={localBudgetData.allocated}
        spent={localBudgetData.spent}
        remainingBudget={remainingBudget}
        allocatedPercentage={allocatedPercentage}
        spentPercentage={spentPercentage}
        formatCurrency={formatCurrency}
      />
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <BudgetCharts 
          viewType={viewType} 
          setViewType={setViewType} 
          barChartData={barChartData}
          pieChartData={pieChartData}
          COLORS={COLORS}
          formatCurrency={formatCurrency}
        />
        
        <BudgetTable 
          categories={localBudgetData.categories}
          onEditCategory={handleEditCategory}
          formatCurrency={formatCurrency}
          canEdit={canEdit}
        />
      </DragDropContext>
      
      <BudgetCategoryDialog 
        isEdit={!!editCategory}
        category={editCategory}
        setCategory={setEditCategory}
        isOpen={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveCategory}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        isAddOpen={addCategoryDialog}
        onAddOpenChange={setAddCategoryDialog}
        onAdd={handleAddCategory}
      />
    </div>
  );
};

export default BudgetPage;
