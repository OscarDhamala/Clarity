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
  onAiCreate?: (prompt: string, userDate?: string) => Promise<void>;
}

const AI_SUGGESTIONS = [
  'Spend 1500 on Biryani',
  'Spend 2500 on electricity',
  'Earned 10000 by freelancing',
] as const;

type AiStatus = 'idle' | 'loading' | 'success' | 'error';

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
  onAiCreate,
}: TransactionFormProps) => {
  const [formValues, setFormValues] = useState(defaultForm(lockedType));
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
  const [aiMessage, setAiMessage] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const aiEnabled = Boolean(onAiCreate && !lockedType);

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

  useEffect(() => {
    if (!aiEnabled || typeof window === 'undefined') {
      return undefined;
    }

    const rotation = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % AI_SUGGESTIONS.length);
    }, 5000);

    return () => window.clearInterval(rotation);
  }, [aiEnabled]);

  useEffect(() => {
    if ((aiStatus === 'success' || aiStatus === 'error') && typeof window !== 'undefined') {
      const resetTimer = window.setTimeout(() => {
        setAiStatus('idle');
        setAiMessage('');
      }, 4000);
      return () => window.clearTimeout(resetTimer);
    }
    return undefined;
  }, [aiStatus]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAiPromptChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    setAiPrompt(event.target.value);
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

  const handleAiSubmit = async () => {
    if (!onAiCreate) {
      return;
    }

    const trimmedPrompt = aiPrompt.trim();
    if (!trimmedPrompt) {
      setAiStatus('error');
      setAiMessage('Describe the transaction so Clarity AI can help.');
      return;
    }

    try {
      setAiStatus('loading');
      setAiMessage('Letting Clarity AI work...');
      const now = new Date();
      const localISODate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];

      await onAiCreate(trimmedPrompt, localISODate);
      setAiStatus('success');
      setAiMessage('Added automatically to your history.');
      setAiPrompt('');
    } catch (error) {
      const fallbackMessage = error instanceof Error ? error.message : 'Clarity AI could not understand that note.';
      setAiStatus('error');
      setAiMessage(fallbackMessage);
    }
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      {aiEnabled && (
        <section className="clarity-ai-card" aria-live="polite">
          <div className="ai-header">
            <div>
              <p className="ai-pill">Clarity AI</p>
            </div>
            <span className="ai-chip">Auto</span>
          </div>

          <div className="ai-input-row">
            <textarea
              name="clarityAiPrompt"
              rows={1}
              value={aiPrompt}
              onChange={handleAiPromptChange}
              placeholder={AI_SUGGESTIONS[placeholderIndex]}
              disabled={aiStatus === 'loading'}
            />
            <button
              type="button"
              className="primary-btn ai-btn"
              onClick={handleAiSubmit}
              disabled={aiStatus === 'loading'}
            >
              {aiStatus === 'loading' ? 'Working...' : 'Let AI work'}
            </button>
          </div>

          {aiMessage && <p className={`ai-status ${aiStatus}`}>{aiMessage}</p>}
        </section>
      )}

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
          step="1000"
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
