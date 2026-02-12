import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import SummaryCards from '../components/SummaryCards';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import CategoryBarChart from '../components/CategoryBarChart';
import useTransactions from '../hooks/useTransactions';
import { Transaction, TransactionFilters, TransactionType, User } from '../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const navItems = [
  { label: 'Dashboard', to: '/dashboard', description: 'Track cashflow, filters, and latest activity.' },
  { label: 'Income', to: '/dashboard/income', description: 'Log paychecks, side hustles, and inflow.' },
  { label: 'Expense', to: '/dashboard/expenses', description: 'Keep spending intentional with clean visuals.' },
];

const fallbackLabel = 'Uncategorized';

const getStoredTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.localStorage.getItem('clarityTheme') === 'dark' ? 'dark' : 'light';
};

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const {
    transactions,
    loading,
    error,
    loadTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
    addAiTransaction,
  } = useTransactions();
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getStoredTheme());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('clarityTheme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      if (window.innerWidth > 960) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`dashboard-shell${sidebarOpen ? ' sidebar-open' : ''}`}>
      <aside id="dashboard-sidebar" className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-mark">
            <div className="brand-icon">
              <img src="/Clarity-Logo.png" alt="Clarity logo" />
            </div>
            <div>
              <span>CLARITY</span>
            </div>
          </div>
          <div className="sidebar-header-actions">
            <button
              type="button"
              className={`theme-toggle${theme === 'dark' ? ' active' : ''}`}
              aria-label="Toggle dark theme"
              onClick={toggleTheme}
            >
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
            </button>
            <button
              type="button"
              className="sidebar-dismiss"
              aria-label="Close navigation"
              onClick={closeSidebar}
            >
              <span />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeSidebar}
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className="nav-link logout"
            onClick={() => {
              closeSidebar();
              onLogout();
            }}
          >
            Logout
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <p className="muted">Logged in user</p>
              <strong>{user.name}</strong>
            </div>
          </div>
        </div>

      </aside>

      <div className="dashboard-overlay" aria-hidden="true" onClick={closeSidebar} />

      <main className="dashboard-main">
        <div className="mobile-top-bar">
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label="Toggle navigation"
            aria-controls="dashboard-sidebar"
            aria-expanded={sidebarOpen}
            onClick={toggleSidebar}
          >
            <span />
            <span />
            <span />
          </button>
          <span className="mobile-top-title">Clarity</span>
        </div>

        <Routes>
          <Route
            index
            element={
              <OverviewView
                transactions={transactions}
                loading={loading}
                error={error}
                loadTransactions={loadTransactions}
                addTransaction={addTransaction}
                editTransaction={editTransaction}
                removeTransaction={removeTransaction}
                addAiTransaction={addAiTransaction}
              />
            }
          />
          <Route
            path="income"
            element={
              <TypeTransactionsView
                type="income"
                title="Income"
                transactions={transactions}
                loading={loading}
                error={error}
                loadTransactions={loadTransactions}
                addTransaction={addTransaction}
                editTransaction={editTransaction}
                removeTransaction={removeTransaction}
              />
            }
          />
          <Route
            path="expenses"
            element={
              <TypeTransactionsView
                type="expense"
                title="Expenses"
                transactions={transactions}
                loading={loading}
                error={error}
                loadTransactions={loadTransactions}
                addTransaction={addTransaction}
                editTransaction={editTransaction}
                removeTransaction={removeTransaction}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
};

interface OverviewViewProps {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  loadTransactions: (filters?: TransactionFilters) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, '_id'>) => Promise<void> | void;
  editTransaction: (id: string, transaction: Omit<Transaction, '_id'>) => Promise<void> | void;
  removeTransaction: (id: string) => Promise<void> | void;
  addAiTransaction: (prompt: string, userDate?: string) => Promise<Transaction>;
}

const OverviewView = ({
  transactions,
  loading,
  error,
  loadTransactions,
  addTransaction,
  editTransaction,
  removeTransaction,
  addAiTransaction,
}: OverviewViewProps) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<TransactionFilters>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, appliedFilters),
    [transactions, appliedFilters]
  );
  const displayedTransactions = filteredTransactions.slice(0, 5);
  const hasMoreTransactions = filteredTransactions.length > 5;

  const handleApplyFilters = () => {
    setAppliedFilters(cleanFilters(filters));
  };

  const handleClearFilters = () => {
    setFilters({});
    setAppliedFilters({});
  };

  const handleCreate = async (transaction: Omit<Transaction, '_id'>) => {
    await addTransaction(transaction);
    await loadTransactions();
  };

  const handleUpdate = async (id: string, transaction: Omit<Transaction, '_id'>) => {
    await editTransaction(id, transaction);
    setSelectedTransaction(null);
    await loadTransactions();
  };

  const handleDelete = async (id: string) => {
    await removeTransaction(id);
    await loadTransactions();
  };

  const handleAiCreate = async (prompt: string, userDate?: string) => {
    await addAiTransaction(prompt, userDate);
    await loadTransactions();
  };

  return (
    <>
      <SummaryCards transactions={filteredTransactions} />

      <div className="overview-grid">
        <TransactionForm
          selectedTransaction={selectedTransaction}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onCancelEdit={() => setSelectedTransaction(null)}
          onAiCreate={handleAiCreate}
        />

        <section className="transactions-panel">
          <div className="panel-header">
            <div>
              <h3>Transactions</h3>
              <p className="muted">Filter and review your latest activity.</p>
            </div>
            <div className="panel-meta">
              <span>{filteredTransactions.length} records</span>
            </div>
          </div>

          <FilterBar
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />

          {loading && <p>Loading your data...</p>}
          {error && <p className="error-text">{error}</p>}

          <TransactionList
            transactions={displayedTransactions}
            onEdit={setSelectedTransaction}
            onDelete={handleDelete}
          />

          {hasMoreTransactions && (
            <div className="panel-actions">
              <button
                type="button"
                className="ghost-btn view-all-btn"
                onClick={() => navigate('/dashboard/income')}
              >
                View all income
              </button>
              <button
                type="button"
                className="ghost-btn view-all-btn"
                onClick={() => navigate('/dashboard/expenses')}
              >
                View all expenses
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

interface TypeTransactionsViewProps {
  type: TransactionType;
  title: string;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  loadTransactions: (filters?: TransactionFilters) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, '_id'>) => Promise<void> | void;
  editTransaction: (id: string, transaction: Omit<Transaction, '_id'>) => Promise<void> | void;
  removeTransaction: (id: string) => Promise<void> | void;
}

const TypeTransactionsView = ({
  type,
  title,
  transactions,
  loading,
  error,
  loadTransactions,
  addTransaction,
  editTransaction,
  removeTransaction,
}: TypeTransactionsViewProps) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const filteredTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.type === type),
    [transactions, type]
  );

  const addLabel = type === 'income' ? 'income' : 'expense';
  const recordsLabel = `${filteredTransactions.length} ${filteredTransactions.length === 1 ? 'record' : 'records'}`;

  const handleToggleForm = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setSelectedTransaction(null);
    }
  };

  const handleStartCreate = () => {
    handleToggleForm(true);
  };

  const escapeValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) {
      return '""';
    }
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const handleDownloadReport = () => {
    if (typeof document === 'undefined') {
      return;
    }

    const headers = ['Date', 'Category', 'Amount (NPR)', 'Notes'];
    const rows = filteredTransactions.map((transaction) => [
      transaction.date,
      transaction.category || fallbackLabel,
      Number(transaction.amount).toFixed(2),
      transaction.note || '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeValue(cell)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `clarity-${type}-report-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreate = async (transaction: Omit<Transaction, '_id'>) => {
    await addTransaction(transaction);
    await loadTransactions();
    handleToggleForm(false);
  };

  const handleUpdate = async (id: string, transaction: Omit<Transaction, '_id'>) => {
    await editTransaction(id, transaction);
    await loadTransactions();
    handleToggleForm(false);
  };

  const handleDelete = async (id: string) => {
    await removeTransaction(id);
    await loadTransactions();
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    handleToggleForm(true);
  };

  return (
    <section className="type-view">
      <div className="type-controls">
        <div className="type-heading">
          <span className="muted">{recordsLabel}</span>
          <h2>{title}</h2>
        </div>
        <div className="type-actions">
          <button className="primary-btn" type="button" onClick={handleStartCreate}>
            Add {addLabel}
          </button>
          <button className="secondary-btn download-btn" type="button" onClick={handleDownloadReport}>
            Download report
          </button>
        </div>
      </div>

      <CategoryBarChart transactions={filteredTransactions} type={type} />

      <div className={formOpen ? 'overview-grid' : 'single-column'}>
        {formOpen && (
          <TransactionForm
            title={`Add ${addLabel}`}
            submitLabel={`Save ${addLabel}`}
            lockedType={type}
            selectedTransaction={selectedTransaction}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onCancelEdit={() => handleToggleForm(false)}
          />
        )}

        <section className="transactions-panel">
          {loading && <p>Syncing data...</p>}
          {error && <p className="error-text">{error}</p>}
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>
      </div>
    </section>
  );
};

const cleanFilters = (filters: TransactionFilters) => {
  const cleaned: TransactionFilters = {};

  if (filters.type) cleaned.type = filters.type;
  if (filters.category) cleaned.category = filters.category;
  if (filters.startDate) cleaned.startDate = filters.startDate;
  if (filters.endDate) cleaned.endDate = filters.endDate;

  return cleaned;
};

const filterTransactions = (transactions: Transaction[], filters: TransactionFilters) => {
  if (!filters.type && !filters.category && !filters.startDate && !filters.endDate) {
    return transactions;
  }

  return transactions.filter((transaction) => {
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }

    if (
      filters.category &&
      !transaction.category.toLowerCase().includes(filters.category.toLowerCase())
    ) {
      return false;
    }

    if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
      return false;
    }

    if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
      return false;
    }

    return true;
  });
};

export default Dashboard;
