import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import { transactionApi } from '../services/api';
import { Plus } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const { user } = useAuth();
  const userId = user?.uid;

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  const fetchTransactions = async () => {
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

      <div className="bg-card border border-border rounded-xl shadow-sm">
        {loading ? (
          <div className="p-8 text-center">Loading transactions...</div>
        ) : (
          <TransactionTable 
            transactions={transactions} 
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
      />
    </Layout>
  );
};

export default Transactions;
