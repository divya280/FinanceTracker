import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Menu, X, Wallet, Tags, PiggyBank } from 'lucide-react';
import { cn } from '../lib/utils';
import NotificationBell from './NotificationBell';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
      active 
        ? "bg-primary text-primary-foreground" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Wallet className="w-6 h-6 text-primary mr-2" />
          <h1 className="text-xl font-bold">FinanceTracker</h1>
        </div>

        <nav className="p-4 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            to="/" 
            active={location.pathname === '/'} 
          />
          <SidebarItem
            icon={Receipt}
            label="Transactions"
            to="/transactions"
            active={location.pathname === '/transactions'}
          />
          <SidebarItem
            icon={Tags}
            label="Categories"
            to="/categories"
            active={location.pathname === '/categories'}
          />
          <SidebarItem
            icon={PiggyBank}
            label="Budgets"
            to="/budgets"
            active={location.pathname === '/budgets'}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border bg-card">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md hover:bg-muted"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="ml-3 font-semibold">FinanceTracker</span>
          </div>
          <div className="hidden lg:block" />
          <NotificationBell />
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
