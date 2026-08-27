import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { budgetApi, categoryApi } from '../services/api';
import { Trash, Check, X as XIcon, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const Budgets = () => {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState('');
  const { user } = useAuth();
  const userId = user?.uid;

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, period.month, period.year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, budgetRes] = await Promise.all([
        categoryApi.getByUser(userId),
        budgetApi.getByUser(userId, period.month, period.year),
      ]);
      setCategories(catRes.data.filter((c) => c.type === 'expense'));
      setBudgets(budgetRes.data);
    } catch (err) {
      console.error("Failed to fetch budgets", err);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta) => {
    setPeriod((p) => {
      let month = p.month + delta;
      let year = p.year;
      if (month > 12) { month = 1; year += 1; }
      if (month < 1) { month = 12; year -= 1; }
      return { month, year };
    });
  };

  const startEdit = (category, currentLimit) => {
    setEditingCategory(category);
    setEditValue(currentLimit != null ? String(currentLimit) : '');
  };

  const saveEdit = async () => {
    const limit = Number(editValue);
    if (!limit || limit <= 0) return;
    const existing = budgets.find((b) => b.category === editingCategory);
    try {
      if (existing) {
        await budgetApi.update(existing._id, { limit });
      } else {
        await budgetApi.create({ userId, category: editingCategory, limit, month: period.month, year: period.year });
      }
      setEditingCategory(null);
      fetchData();
    } catch (err) {
      console.error("Failed to save budget", err);
      alert(err.response?.data?.error || "Failed to save budget");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this budget?")) {
      try {
        await budgetApi.delete(id);
        fetchData();
      } catch (err) {
        console.error("Failed to delete budget", err);
      }
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">Set monthly spending limits per category</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-2 py-1">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-muted">
            <CaretLeft className="w-4 h-4" weight="bold" />
          </button>
          <span className="font-medium min-w-[140px] text-center">
            {MONTH_NAMES[period.month - 1]} {period.year}
          </span>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-muted">
            <CaretRight className="w-4 h-4" weight="bold" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading budgets...</div>
      ) : categories.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">No expense categories yet. Add some from the Categories page first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((c) => {
            const budget = budgets.find((b) => b.category === c.name);
            const spent = budget?.spent || 0;
            const limit = budget?.limit;
            const pct = limit ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const isOver = limit != null && spent > limit;
            const isEditing = editingCategory === c.name;

            return (
              <div
                key={c._id}
                className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm border-l-4"
                style={{ borderLeftColor: c.color }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ color: c.color, backgroundColor: `${c.color}1a` }}
                  >
                    {c.name}
                  </span>
                  {budget && !isEditing && (
                    <button onClick={() => handleDelete(budget._id)} className="p-1.5 rounded-md hover:bg-red-100 text-muted-foreground hover:text-red-600" title="Remove budget">
                      <Trash className="w-4 h-4" weight="duotone" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      autoFocus
                      min="0.01"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingCategory(null); }}
                      className="flex-1 p-2 rounded-md border border-input bg-background"
                      placeholder="Monthly limit"
                    />
                    <button onClick={saveEdit} className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                      <Check className="w-4 h-4" weight="bold" />
                    </button>
                    <button onClick={() => setEditingCategory(null)} className="p-2 rounded-md border border-input hover:bg-muted">
                      <XIcon className="w-4 h-4" weight="bold" />
                    </button>
                  </div>
                ) : budget ? (
                  <>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", isOver ? "bg-red-500" : "bg-primary")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={cn(isOver ? "text-red-600 font-medium" : "text-muted-foreground")}>
                        ₹{spent.toFixed(2)} of ₹{limit.toFixed(2)}
                      </span>
                      <button onClick={() => startEdit(c.name, limit)} className="text-primary hover:underline">
                        Edit
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => startEdit(c.name, null)}
                    className="text-sm text-primary hover:underline"
                  >
                    Set budget
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default Budgets;
