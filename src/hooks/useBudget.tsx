
import { useState } from 'react';
import { budgetData } from '@/data/mockData';
import { toast } from 'sonner';
import { BudgetCategory, BudgetData } from '@/types/budget';

export const useBudget = () => {
  // Initialize budget data with proper IDs
  const initialBudgetData = {
    ...budgetData,
    categories: budgetData.categories.map((cat, index) => ({
      ...cat,
      id: `category-${index}` // Ensuring each category has an id
    }))
  };

  const [localBudgetData, setLocalBudgetData] = useState<BudgetData>(initialBudgetData);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<BudgetCategory | null>(null);
  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState<BudgetCategory>({ 
    name: '', 
    estimated: 0, 
    actual: 0,
    id: `new-category-${Date.now()}` // Adding a default ID for new categories
  });
  
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
  
  // Handle editing a category
  const handleEditCategory = (category: BudgetCategory) => {
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
    if (!newCategory.name.trim()) return;
    
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
    if (!result.destination) return;
    
    const items = Array.from(localBudgetData.categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setLocalBudgetData({
      ...localBudgetData,
      categories: items
    });
    
    toast.success('Budget category order updated');
  };

  // Prepare data for charts
  const getBarChartData = () => {
    return localBudgetData.categories.map(cat => ({
      name: cat.name,
      Estimated: cat.estimated,
      Actual: cat.actual
    }));
  };
  
  const getPieChartData = (viewType: string) => {
    return viewType === 'estimated' 
      ? localBudgetData.categories.map(cat => ({
          name: cat.name,
          value: cat.estimated,
        }))
      : localBudgetData.categories.map(cat => ({
          name: cat.name,
          value: cat.actual,
        }));
  };

  return {
    localBudgetData,
    editDialogOpen,
    setEditDialogOpen,
    editCategory,
    setEditCategory,
    addCategoryDialog, 
    setAddCategoryDialog,
    newCategory,
    setNewCategory,
    remainingBudget,
    allocatedPercentage,
    spentPercentage,
    formatCurrency,
    handleEditCategory,
    handleSaveCategory,
    handleAddCategory,
    handleDragEnd,
    getBarChartData,
    getPieChartData
  };
};
