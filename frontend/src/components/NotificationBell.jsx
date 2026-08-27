import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Warning, WarningCircle } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { budgetApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationBell = ({ variant = 'light' }) => {
  const [budgets, setBudgets] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;
    const fetchBudgets = () => {
      budgetApi.getByUser(userId).then(res => setBudgets(res.data)).catch(err => console.error("Failed to fetch budgets for alerts", err));
    };
    fetchBudgets();
    const interval = setInterval(fetchBudgets, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  const alerts = budgets
    .map((b) => ({ ...b, pct: b.limit > 0 ? (b.spent / b.limit) * 100 : 0 }))
    .filter((b) => b.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "relative p-2 rounded-md",
          variant === 'dark'
            ? "text-white/85 hover:text-white hover:bg-white/15"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        title="Budget alerts"
      >
        <Bell className="w-5 h-5" weight="duotone" />
        {alerts.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-border font-semibold text-sm">Budget Alerts</div>
            {alerts.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No budgets are close to their limit right now.</p>
            ) : (
              <div className="divide-y divide-border">
                {alerts.map((b) => {
                  const isOver = b.pct >= 100;
                  return (
                    <div key={b._id} className="p-3 flex items-start gap-2">
                      {isOver ? (
                        <WarningCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" weight="duotone" />
                      ) : (
                        <Warning className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" weight="duotone" />
                      )}
                      <div className="text-sm">
                        <p className={cn("font-medium", isOver ? "text-red-600" : "text-amber-600")}>
                          {b.category} {isOver ? "over budget" : "near limit"}
                        </p>
                        <p className="text-muted-foreground">
                          ₹{b.spent.toFixed(2)} of ₹{b.limit.toFixed(2)} ({Math.round(b.pct)}%)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Link
              to="/budgets"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-primary hover:underline p-3 border-t border-border"
            >
              Manage budgets
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
