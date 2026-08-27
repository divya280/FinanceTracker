import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import CategoryForm from '../components/CategoryForm';
import { categoryApi } from '../services/api';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { user } = useAuth();
  const userId = user?.uid;

  useEffect(() => {
    if (userId) fetchCategories();
  }, [userId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryApi.getByUser(userId);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category? Existing transactions will keep their category text.")) {
      try {
        await categoryApi.delete(id);
        fetchCategories();
      } catch (err) {
        console.error("Failed to delete category", err);
      }
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory._id, data);
      } else {
        await categoryApi.create({ ...data, userId });
      }
      setIsFormOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error("Failed to save category", err);
      alert(err.response?.data?.error || "Failed to save category");
    }
  };

  const renderGroup = (type, label) => {
    const items = categories.filter((c) => c.type === type);
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">{label}</h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No {type} categories yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between p-3 rounded-xl border-l-4 bg-muted/30 hover:bg-muted/60 transition-colors"
                style={{ borderLeftColor: c.color }}
              >
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ color: c.color, backgroundColor: `${c.color}1a` }}
                >
                  {c.name}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(c)} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit">
                    <PencilSimple className="w-4 h-4" weight="duotone" />
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="p-2 rounded-md hover:bg-red-100 text-muted-foreground hover:text-red-600" title="Delete">
                    <Trash className="w-4 h-4" weight="duotone" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage income and expense categories</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
        >
          <Plus className="w-5 h-5" weight="bold" />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderGroup('income', 'Income Categories')}
          {renderGroup('expense', 'Expense Categories')}
        </div>
      )}

      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingCategory(null); }}
        onSubmit={handleSubmit}
        initialData={editingCategory}
      />
    </Layout>
  );
};

export default Categories;
