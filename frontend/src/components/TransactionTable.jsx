import React from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../lib/utils';

const TransactionTable = ({ transactions, onEdit, onDelete }) => {
  if (!transactions.length) {
    return (
      <div className="text-center p-8 border border-dashed border-border rounded-lg">
        <p className="text-muted-foreground">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground uppercase text-xs">
          <tr>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3 text-right">Amount</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t._id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4 font-medium">
                {new Date(t.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <span className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    t.type === 'income' ? "bg-green-500" : "bg-red-500"
                  )} />
                  {t.category}
                </span>
              </td>
              <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                {t.description || '-'}
              </td>
              <td className={cn(
                "px-6 py-4 text-right font-bold",
                t.type === 'income' ? "text-green-600" : "text-red-600"
              )}>
                {t.type === 'income' ? '+' : '-'}₹{Math.abs(t.amount).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(t)}
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(t._id)}
                    className="p-2 rounded-md hover:bg-red-100 text-muted-foreground hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
