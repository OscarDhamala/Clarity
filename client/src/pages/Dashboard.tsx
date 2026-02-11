import { useEffect, useState } from 'react';
import FilterBar from '../components/FilterBar';
import SummaryCards from '../components/SummaryCards';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import useTransactions from '../hooks/useTransactions';
import { Transaction, TransactionFilters, User } from '../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const {
    transactions,
    loading,
    error,
    loadTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useTransactions();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const sanitizeFilters = () => {
    const cleaned: TransactionFilters = {};

    if (filters.type) cleaned.type = filters.type;
    if (filters.category) cleaned.category = filters.category;
    if (filters.startDate) cleaned.startDate = filters.startDate;
    if (filters.endDate) cleaned.endDate = filters.endDate;

    return cleaned;
  };

  const handleCreate = async (transaction: Omit<Transaction, '_id'>) => {
    await addTransaction(transaction);
    await loadTransactions(sanitizeFilters());
  };

  const handleUpdate = async (id: string, transaction: Omit<Transaction, '_id'>) => {
    await editTransaction(id, transaction);
    setSelectedTransaction(null);
    await loadTransactions(sanitizeFilters());
  };

  const handleDelete = async (id: string) => {
    await removeTransaction(id);
    await loadTransactions(sanitizeFilters());
  };

  const handleApplyFilters = () => {
    loadTransactions(sanitizeFilters());
  };

  const handleClearFilters = () => {
    setFilters({});
    loadTransactions();
  };

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="muted">Welcome back,</p>
          <h2>{user.name}</h2>
        </div>
        <button className="ghost-btn" onClick={onLogout}>
          Logout
        </button>
      </header>

      <SummaryCards transactions={transactions} />

      <div className="dashboard-grid">
        <TransactionForm
          selectedTransaction={selectedTransaction}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onCancelEdit={() => setSelectedTransaction(null)}
        />

        <section className="transactions-panel">
          <div className="panel-header">
            <h3>Transactions</h3>
            <p className="muted">Filter and review your activity</p>
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
            transactions={transactions}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
