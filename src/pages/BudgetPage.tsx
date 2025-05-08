
import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useAuth } from '@/contexts/AuthContext';
import BudgetHeader from '@/components/budget/BudgetHeader';
import BudgetSummary from '@/components/budget/BudgetSummary';
import BudgetCharts from '@/components/budget/BudgetCharts';
import BudgetTable from '@/components/budget/BudgetTable';
import BudgetCategoryDialog from '@/components/budget/BudgetCategoryDialog';
import { useBudget } from '@/hooks/useBudget';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const BudgetPage: React.FC = () => {
  const [viewType, setViewType] = useState('estimated');
  const { isSpecial, isSuperAdmin } = useAuth();
  const canEdit = isSpecial() || isSuperAdmin();
  
  const { 
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
  } = useBudget();
  
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
          barChartData={getBarChartData()}
          pieChartData={getPieChartData(viewType)}
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
