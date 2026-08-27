import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SquaresFour, Receipt, List, X, Wallet, Tag, PiggyBank } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
  { icon: SquaresFour, label: 'Dashboard', to: '/' },
  { icon: Receipt, label: 'Transactions', to: '/transactions' },
  { icon: Tag, label: 'Categories', to: '/categories' },
  { icon: PiggyBank, label: 'Budgets', to: '/budgets' },
];

const NavPill = ({ icon: Icon, label, to, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
      active
        ? "bg-white/25 text-white shadow-sm"
        : "text-white/80 hover:bg-white/15 hover:text-white"
    )}
  >
    <Icon className="w-4 h-4" weight="duotone" />
    <span>{label}</span>
  </Link>
);

const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname === to);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="gradient-primary sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-white" weight="duotone" />
              <h1 className="text-xl font-bold text-white">FinanceTracker</h1>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavPill key={item.to} {...item} active={isActive(item.to)} />
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <NotificationBell variant="dark" />
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="lg:hidden p-2 rounded-md text-white hover:bg-white/15"
              >
                {menuOpen ? <X className="w-6 h-6" weight="bold" /> : <List className="w-6 h-6" weight="bold" />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {menuOpen && (
            <nav className="lg:hidden pb-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <NavPill key={item.to} {...item} active={isActive(item.to)} onClick={() => setMenuOpen(false)} />
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
