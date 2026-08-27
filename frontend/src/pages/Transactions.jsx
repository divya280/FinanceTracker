import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import { transactionApi, categoryApi } from '../services/api';
import { Plus, CaretLeft, CaretRight, Download } from '@phosphor-icons/react';

import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 10;

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [exporting, setExporting] = useState(false);
  const { user } = useAuth();
  const userId = user?.uid;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const updateFilters = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  useEffect(() => {
    if (userId) {
      fetchTransactions();
      categoryApi.getByUser(userId).then(res => setCategories(res.data)).catch(err => console.error("Failed to fetch categories", err));
    }
  }, [userId, filters.type, filters.category, filters.startDate, filters.endDate, debouncedSearch, page]);

  const buildFilterParams = (withPagination = true) => ({
    type: filters.type || undefined,
    category: filters.category || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    search: debouncedSearch || undefined,
    ...(withPagination ? { page, limit: PAGE_SIZE } : {}),
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getByUser(userId, buildFilterParams());
      setTransactions(res.data.data);
      setPagination({ total: res.data.total, totalPages: res.data.totalPages });
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await transactionApi.getByUser(userId, buildFilterParams(false));
      const rows = res.data;
      const header = ['Date', 'Type', 'Category', 'Description', 'Amount'];
      const csvLines = [header.join(',')];
      for (const t of rows) {
        const line = [
          new Date(t.date).toLocaleDateString(),
          t.type,
          t.category,
          `"${(t.description || '').replace(/"/g, '""')}"`,
          t.amount,
        ];
        csvLines.push(line.join(','));
      }
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export", err);
      alert("Failed to export transactions");
    } finally {
      setExporting(false);
    }
  };

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
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" weight="duotone" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" weight="bold" />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={filters.type}
          onChange={(e) => updateFilters({ type: e.target.value })}
          className="p-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => updateFilters({ category: e.target.value })}
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
          onChange={(e) => updateFilters({ startDate: e.target.value })}
          className="p-2 rounded-md border border-input bg-background text-sm"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => updateFilters({ endDate: e.target.value })}
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
            onClick={() => { setFilters({ type: '', category: '', startDate: '', endDate: '' }); setSearch(''); setDebouncedSearch(''); setPage(1); }}
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
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            categories={categories}
          />
        )}
      </div>

      {!loading && pagination.total > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-md border border-input hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CaretLeft className="w-4 h-4" weight="bold" />
            </button>
            <span>Page {page} of {pagination.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-md border border-input hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CaretRight className="w-4 h-4" weight="bold" />
            </button>
          </div>
        </div>
      )}

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
