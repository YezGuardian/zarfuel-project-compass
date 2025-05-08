
export interface BudgetCategory {
  id: string; // Making id required
  name: string;
  estimated: number;
  actual: number;
}

export interface BudgetData {
  totalBudget: number;
  allocated: number;
  spent: number;
  categories: BudgetCategory[];
}
