import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import { transactionApi, categoryApi, budgetApi } from '../services/api';
import { Plus, SignOut, X } from '@phosphor-icons/react';
import { useNavigate, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { cn } from '../lib/utils';
import paymentIllustration from '../assets/payment-illustration.svg';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  useEffect(() => {
    if (!userId) return;
    transactionApi.getMonthlySummary(userId, 6).then(res => setMonthlySummary(res.data)).catch(err => console.error("Failed to fetch monthly summary", err));
  }, [userId]);

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

  const refreshMonthlySummary = () => {
    transactionApi.getMonthlySummary(userId, 6).then(res => setMonthlySummary(res.data)).catch(err => console.error("Failed to fetch monthly summary", err));
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
      refreshMonthlySummary();
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
        refreshMonthlySummary();
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

  // Spending trends (last 6 months)
  const trendsData = monthlySummary.map((m) => ({
    label: `${MONTH_SHORT[m.month - 1]} ${m.year}`,
    income: m.income,
    expense: m.expense,
  }));

  // Expense by category (current period)
  const expenseByCategory = Object.values(
    transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = { name: t.category, value: 0 };
        acc[t.category].value += t.amount;
        return acc;
      }, {})
  );
  const categoryColor = (name) => categories.find((c) => c.name === name)?.color || '#94a3b8';

  const drillDownTransactions = selectedCategory
    ? transactions.filter((t) => t.type === 'expense' && t.category === selectedCategory)
    : [];

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
            <SignOut className="w-5 h-5" weight="bold" />
            Logout
          </button>
          <button
            onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
          >
            <Plus className="w-5 h-5" weight="bold" />
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
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center text-center py-6 px-4 border border-dashed border-border rounded-2xl">
              <img src={paymentIllustration} alt="" className="w-56 max-w-full mb-4" />
              <p className="font-medium">No transactions yet</p>
              <p className="text-sm text-muted-foreground">Add your first transaction to see it here.</p>
            </div>
          ) : (
            <TransactionTable
              transactions={transactions.slice(0, 5)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              categories={categories}
            />
          )}
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 h-[400px] shadow-sm">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Spending Trends */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 h-[350px] shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Spending Trends (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense by Category */}
        <div className="bg-card border border-border rounded-2xl p-6 h-[350px] shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Expense by Category</h2>
          {expenseByCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mt-8">No expenses in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  onClick={(entry) => setSelectedCategory(entry.name)}
                  cursor="pointer"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cat-cell-${index}`} fill={categoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {budgets.length > 0 && (
        <div className="mt-8 bg-card border border-border rounded-2xl p-6 shadow-sm">
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

      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedCategory(null)}>
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-lg border border-border max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">{selectedCategory} transactions</h2>
              <button onClick={() => setSelectedCategory(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>
            <div className="p-6">
              <TransactionTable transactions={drillDownTransactions} readOnly categories={categories} />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
