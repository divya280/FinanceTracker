import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import { transactionApi, categoryApi, budgetApi } from '../services/api';
import { Plus, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [period, setPeriod] = useState('thisMonth');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userId = user?.uid;

  const getDateRange = () => {
    const now = new Date();
    if (period === 'thisMonth') {
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      };
    }
    if (period === 'lastMonth') {
      return {
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
        endDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      };
    }
    if (period === 'custom') {
      return {
        startDate: customRange.start || undefined,
        endDate: customRange.end || undefined,
      };
    }
    return {};
  };

  useEffect(() => {
    if (!userId) return;
    fetchData();
    categoryApi.getByUser(userId).then(res => setCategories(res.data)).catch(err => console.error("Failed to fetch categories", err));
    budgetApi.getByUser(userId).then(res => setBudgets(res.data)).catch(err => console.error("Failed to fetch budgets", err));
  }, [userId, period, customRange.start, customRange.end]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getByUser(userId, getDateRange());
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshBudgets = () => {
    budgetApi.getByUser(userId).then(res => setBudgets(res.data)).catch(err => console.error("Failed to fetch budgets", err));
  };

  const handleAddTransaction = async (data) => {
    try {
      if (editingTransaction) {
        await transactionApi.update(editingTransaction._id, data);
      } else {
        await transactionApi.create({ ...data, userId });
      }
      setIsFormOpen(false);
      setEditingTransaction(null);
      fetchData();
      refreshBudgets();
    } catch (err) {
      console.error("Failed to save transaction", err);
      alert(err.response?.data?.error || "Failed to save transaction");
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await transactionApi.delete(id);
        fetchData();
        refreshBudgets();
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Failed to logout", err);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  // Pie chart data
  const data = [
    { name: 'Income', value: totalIncome },
    { name: 'Expense', value: totalExpense },
  ];
  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.displayName || 'User'}!</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
          <button
            onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="p-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="allTime">All Time</option>
          <option value="custom">Custom Range</option>
        </select>
        {period === 'custom' && (
          <>
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
              className="p-2 rounded-md border border-input bg-background text-sm"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
              className="p-2 rounded-md border border-input bg-background text-sm"
            />
          </>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Total Income" amount={totalIncome} type="income" />
        <MetricCard title="Total Expense" amount={totalExpense} type="expense" />
        <MetricCard title="Current Balance" amount={balance} type="balance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          {loading ? (
             <div className="text-center p-4">Loading...</div>
          ) : (
            <TransactionTable
              transactions={transactions.slice(0, 5)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded-xl p-6 h-[400px]">
          <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
           <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Expense</span>
              </div>
            </div>
        </div>
      </div>

      {budgets.length > 0 && (
        <div className="mt-8 bg-card border border-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Budget Overview</h2>
            <Link to="/budgets" className="text-sm text-primary hover:underline">Manage budgets</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
              const isOver = b.spent > b.limit;
              return (
                <div key={b._id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{b.category}</span>
                    <span className={cn(isOver ? "text-red-600 font-medium" : "text-muted-foreground")}>
                      ₹{b.spent.toFixed(2)} / ₹{b.limit.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", isOver ? "bg-red-500" : "bg-primary")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
        onSubmit={handleAddTransaction}
        initialData={editingTransaction}
        categories={categories}
      />
    </Layout>
  );
};

export default Dashboard;
