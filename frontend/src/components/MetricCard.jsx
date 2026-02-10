import React from 'react';
import { cn } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';

const MetricCard = ({ title, amount, type, className }) => {
  const isIncome = type === 'income';
  const isExpense = type === 'expense';
  
  return (
    <div className={cn("p-6 rounded-xl border border-border bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={cn(
          "p-2 rounded-full",
          isIncome && "bg-green-100 dark:bg-green-900/20 text-green-600",
          isExpense && "bg-red-100 dark:bg-red-900/20 text-red-600",
          !isIncome && !isExpense && "bg-blue-100 dark:bg-blue-900/20 text-blue-600"
        )}>
          {isIncome ? <ArrowUpRight className="w-4 h-4" /> : 
           isExpense ? <ArrowDownRight className="w-4 h-4" /> : 
           <IndianRupee className="w-4 h-4" />}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold">
          ₹{Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
