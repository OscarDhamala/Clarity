import { useState, useCallback } from 'react';
import { Transaction, TransactionFilters } from '../types';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/api';

const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async (filters?: TransactionFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTransactions(filters);
      setTransactions(data);
    } catch (err) {
      setError('Could not load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, '_id'>) => {
    setError(null);
    try {
      const newTransaction = await createTransaction(transaction);
      setTransactions((prev) => [newTransaction, ...prev]);
    } catch (err) {
      setError('Could not add transaction');
    }
  }, []);

  const editTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    setError(null);
    try {
      const updatedTransaction = await updateTransaction(id, updates);
      setTransactions((prev) =>
        prev.map((transaction) => (transaction._id === id ? updatedTransaction : transaction))
      );
    } catch (err) {
      setError('Could not update transaction');
    }
  }, []);

  const removeTransaction = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((transaction) => transaction._id !== id));
    } catch (err) {
      setError('Could not delete transaction');
    }
  }, []);

  return {
    transactions,
    loading,
    error,
    loadTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
  };
};

export default useTransactions;
