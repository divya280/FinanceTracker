import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import { transactionApi, categoryApi } from '../services/api';
import { Plus } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const userId = user?.uid;

  useEffect(() => {
    if (userId) {
      fetchTransactions();
      categoryApi.getByUser(userId).then(res => setCategories(res.data)).catch(err => console.error("Failed to fetch categories", err));
    }
  }, [userId, filters.type, filters.category, filters.startDate, filters.endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getByUser(userId, {
        type: filters.type || undefined,
        category: filters.category || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const visibleTransactions = search
    ? transactions.filter((t) => t.description?.toLowerCase().includes(search.toLowerCase()))
    : transactions;

  const handleAdd = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await transactionApi.delete(id);
        fetchTransactions();
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingTransaction) {
        await transactionApi.update(editingTransaction._id, data);
      } else {
        await transactionApi.create({ ...data, userId });
      }
      setIsFormOpen(false);
      fetchTransactions();
    } catch (err) {
      console.error("Failed to save transaction", err);
      alert(err.response?.data?.error || "Failed to save");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="p-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="p-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All Categories</option>
          {categories
            .filter((c) => !filters.type || c.type === filters.type)
            .map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="p-2 rounded-md border border-input bg-background text-sm"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="p-2 rounded-md border border-input bg-background text-sm"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search description..."
          className="p-2 rounded-md border border-input bg-background text-sm flex-1 min-w-[180px]"
        />
        {(filters.type || filters.category || filters.startDate || filters.endDate || search) && (
          <button
            onClick={() => { setFilters({ type: '', category: '', startDate: '', endDate: '' }); setSearch(''); }}
            className="text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        {loading ? (
          <div className="p-8 text-center">Loading transactions...</div>
        ) : (
          <TransactionTable
            transactions={visibleTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingTransaction}
        categories={categories}
      />
    </Layout>
  );
};

export default Transactions;
