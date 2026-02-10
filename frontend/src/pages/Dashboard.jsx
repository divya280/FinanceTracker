import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import { transactionApi } from '../services/api';
import { Plus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getByUser(userId);
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (data) => {
    try {
      await transactionApi.create({ ...data, userId });
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to add transaction", err);
      alert(err.response?.data?.error || "Failed to add transaction");
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
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
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
              onEdit={() => {}} // Disabled for dashboard view
              onDelete={() => {}} // Disabled for dashboard view, read-only
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

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleAddTransaction} 
      />
    </Layout>
  );
};

export default Dashboard;
