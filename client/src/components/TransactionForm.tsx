import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Transaction } from '../types';

interface TransactionFormProps {
  selectedTransaction: Transaction | null;
  onCreate: (transaction: Omit<Transaction, '_id'>) => Promise<void> | void;
  onUpdate: (id: string, transaction: Omit<Transaction, '_id'>) => Promise<void> | void;
  onCancelEdit: () => void;
}

const defaultForm = () => ({
  type: 'income',
  amount: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  note: '',
});

const TransactionForm = ({
  selectedTransaction,
  onCreate,
  onUpdate,
  onCancelEdit,
}: TransactionFormProps) => {
  const [formValues, setFormValues] = useState(defaultForm());

  useEffect(() => {
    if (selectedTransaction) {
      setFormValues({
        type: selectedTransaction.type,
        amount: String(selectedTransaction.amount),
        category: selectedTransaction.category,
        date: selectedTransaction.date.split('T')[0],
        note: selectedTransaction.note || '',
      });
    } else {
      setFormValues(defaultForm());
    }
  }, [selectedTransaction]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const payload = {
      type: formValues.type as Transaction['type'],
      amount: Number(formValues.amount),
      category: formValues.category,
      date: formValues.date,
      note: formValues.note,
    };

    if (selectedTransaction?._id) {
      await onUpdate(selectedTransaction._id, payload);
    } else {
      await onCreate(payload);
    }

    setFormValues(defaultForm());
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <h3>{selectedTransaction ? 'Edit transaction' : 'Add a transaction'}</h3>

      <div className="form-row">
        <label>
          <span>Type</span>
          <select name="type" value={formValues.type} onChange={handleChange}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>

        <label>
          <span>Amount</span>
          <input
            type="number"
            name="amount"
            min="0"
            step="0.01"
            value={formValues.amount}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          <span>Category</span>
          <input
            name="category"
            value={formValues.category}
            onChange={handleChange}
            placeholder="Groceries, Salary, Rent..."
            required
          />
        </label>

        <label>
          <span>Date</span>
          <input
            type="date"
            name="date"
            value={formValues.date}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <label>
        <span>Note</span>
        <input
          name="note"
          value={formValues.note}
          onChange={handleChange}
          placeholder="Optional details"
        />
      </label>

      <div className="form-actions">
        {selectedTransaction && (
          <button type="button" className="ghost-btn" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
        <button className="primary-btn" type="submit">
          {selectedTransaction ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
