import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Transaction } from '../types';

interface TransactionFormProps {
  selectedTransaction: Transaction | null;
  onCreate: (transaction: Omit<Transaction, '_id'>) => Promise<void> | void;
  onUpdate: (id: string, transaction: Omit<Transaction, '_id'>) => Promise<void> | void;
  onCancelEdit: () => void;
  lockedType?: Transaction['type'];
  title?: string;
  submitLabel?: string;
}

const defaultForm = (type: Transaction['type'] = 'income') => ({
  type,
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
  lockedType,
  title,
  submitLabel,
}: TransactionFormProps) => {
  const [formValues, setFormValues] = useState(defaultForm(lockedType));

  useEffect(() => {
    if (selectedTransaction) {
      setFormValues({
        type: lockedType ?? selectedTransaction.type,
        amount: String(selectedTransaction.amount),
        category: selectedTransaction.category,
        date: selectedTransaction.date.split('T')[0],
        note: selectedTransaction.note || '',
      });
    } else {
      setFormValues(defaultForm(lockedType));
    }
  }, [selectedTransaction, lockedType]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const payload = {
      type: (lockedType ?? formValues.type) as Transaction['type'],
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
    setFormValues(defaultForm(lockedType));
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <h3>{title || (selectedTransaction ? 'Edit transaction' : 'Add a transaction')}</h3>

      <label className="form-field">
        <span>Type</span>
        {lockedType ? (
          <div className={`type-pill ${lockedType}`}>
            {lockedType === 'income' ? 'Income' : 'Expense'}
          </div>
        ) : (
          <select name="type" value={formValues.type} onChange={handleChange}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        )}
      </label>

      <label className="form-field">
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

      <label className="form-field">
        <span>Category</span>
        <input
          name="category"
          value={formValues.category}
          onChange={handleChange}
          placeholder="Groceries, Salary, Rent..."
          required
        />
      </label>

      <label className="form-field">
        <span>Date</span>
        <input
          type="date"
          name="date"
          value={formValues.date}
          onChange={handleChange}
          required
        />
      </label>

      <label className="form-field">
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
          {submitLabel || (selectedTransaction ? 'Update' : 'Add')}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
