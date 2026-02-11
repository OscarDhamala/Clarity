import axios from 'axios';
import { AuthResponse, Transaction, TransactionFilters } from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5050',
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/register', data);
  return response.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login', data);
  return response.data;
};

export const fetchTransactions = async (
  filters: TransactionFilters = {}
): Promise<Transaction[]> => {
  const response = await api.get<{ transactions: Transaction[] }>('/api/transactions', {
    params: filters,
  });
  return response.data.transactions;
};

export const createTransaction = async (
  transaction: Omit<Transaction, '_id'>
): Promise<Transaction> => {
  const response = await api.post<{ transaction: Transaction }>(
    '/api/transactions',
    transaction
  );
  return response.data.transaction;
};

export const createTransactionFromAI = async (
  prompt: string,
  userDate?: string
): Promise<Transaction> => {
  const response = await api.post<{ transaction: Transaction }>(
    '/api/transactions/ai',
    { prompt, userDate }
  );
  return response.data.transaction;
};

export const updateTransaction = async (
  id: string,
  updates: Partial<Transaction>
): Promise<Transaction> => {
  const response = await api.put<{ transaction: Transaction }>(
    `/api/transactions/${id}`,
    updates
  );
  return response.data.transaction;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await api.delete(`/api/transactions/${id}`);
};

export default api;
