
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BudgetCategory } from '@/pages/BudgetPage';

interface BudgetCategoryDialogProps {
  isEdit: boolean;
  category: BudgetCategory | null;
  setCategory: React.Dispatch<React.SetStateAction<BudgetCategory | null>>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  newCategory: BudgetCategory;
  setNewCategory: React.Dispatch<React.SetStateAction<BudgetCategory>>;
  isAddOpen: boolean;
  onAddOpenChange: (open: boolean) => void;
  onAdd: () => void;
}

const BudgetCategoryDialog: React.FC<BudgetCategoryDialogProps> = ({
  isEdit,
  category,
  setCategory,
  isOpen,
  onOpenChange,
  onSave,
  newCategory,
  setNewCategory,
  isAddOpen,
  onAddOpenChange,
  onAdd
}) => {
  return (
    <>
      {/* Edit Category Dialog */}
      {category && (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Budget Category</DialogTitle>
              <DialogDescription>
                Update the budget details for {category.name}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(85vh-120px)] p-1">
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input 
                    id="name" 
                    value={category.name} 
                    onChange={(e) => setCategory({ ...category, name: e.target.value })} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="estimated" className="text-right">Estimated Budget</Label>
                  <Input 
                    id="estimated" 
                    type="number" 
                    value={category.estimated} 
                    onChange={(e) => setCategory({ 
                      ...category, 
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
                    value={category.actual} 
                    onChange={(e) => setCategory({ 
                      ...category, 
                      actual: parseFloat(e.target.value) || 0 
                    })} 
                    className="col-span-3" 
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={onSave}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Add Category Dialog */}
      <Dialog open={isAddOpen} onOpenChange={onAddOpenChange}>
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
            <Button variant="outline" onClick={() => onAddOpenChange(false)}>Cancel</Button>
            <Button 
              onClick={onAdd}
              disabled={!newCategory.name.trim()}
            >
              Add Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BudgetCategoryDialog;
