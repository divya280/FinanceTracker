import React from 'react';
import { cn } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, CurrencyInr } from '@phosphor-icons/react';

const GRADIENTS = {
  income: 'gradient-income',
  expense: 'gradient-expense',
  balance: 'gradient-balance',
};

const MetricCard = ({ title, amount, type, className }) => {
  const isIncome = type === 'income';
  const isExpense = type === 'expense';

  return (
    <div className={cn(
      "p-6 rounded-2xl shadow-lg text-white overflow-hidden relative",
      GRADIENTS[type] || 'gradient-balance',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/80">{title}</h3>
        <div className="p-2 rounded-full bg-white/20">
          {isIncome ? <ArrowUpRight className="w-4 h-4" weight="bold" /> :
           isExpense ? <ArrowDownRight className="w-4 h-4" weight="bold" /> :
           <CurrencyInr className="w-4 h-4" weight="bold" />}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold tracking-tight">
          ₹{Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
