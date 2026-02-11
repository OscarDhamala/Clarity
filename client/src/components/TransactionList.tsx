import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList = ({ transactions, onEdit, onDelete }: TransactionListProps) => {
  if (!transactions.length) {
    return <p className="muted">No transactions yet. Add your first entry above.</p>;
  }

  return (
    <div className="transaction-list">
      {transactions.map((transaction, index) => (
        <div
          key={transaction._id || `${transaction.date}-${transaction.category}-${index}`}
          className="transaction-card"
        >
          <div>
            <p className="transaction-category">{transaction.category}</p>
            <p className="transaction-note">{transaction.note || 'No note'}</p>
          </div>
          <div className="transaction-meta">
            <span className={transaction.type === 'income' ? 'income' : 'expense'}>
              {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
            </span>
            <small>{new Date(transaction.date).toLocaleDateString()}</small>
          </div>
          <div className="transaction-actions">
            <button type="button" onClick={() => onEdit(transaction)}>
              Edit
            </button>
            <button type="button" onClick={() => transaction._id && onDelete(transaction._id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
