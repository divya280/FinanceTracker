import React from 'react';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

const TransactionTable = ({ transactions, onEdit, onDelete, readOnly = false, categories = [] }) => {
  const categoryColor = (t) => categories.find((c) => c.name === t.category)?.color || (t.type === 'income' ? '#22c55e' : '#ef4444');
  if (!transactions.length) {
    return (
      <div className="text-center p-8 border border-dashed border-border rounded-2xl">
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
            {!readOnly && <th className="px-6 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t._id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4 font-medium">
                {new Date(t.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    color: categoryColor(t),
                    backgroundColor: `${categoryColor(t)}1a`,
                    borderColor: `${categoryColor(t)}40`,
                  }}
                >
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
              {!readOnly && (
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(t)}
                      className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Edit"
                    >
                      <PencilSimple className="w-4 h-4" weight="duotone" />
                    </button>
                    <button
                      onClick={() => onDelete(t._id)}
                      className="p-2 rounded-md hover:bg-red-100 text-muted-foreground hover:text-red-600"
                      title="Delete"
                    >
                      <Trash className="w-4 h-4" weight="duotone" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
