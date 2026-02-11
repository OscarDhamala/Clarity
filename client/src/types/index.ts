export type TransactionType = 'income' | 'expense';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Transaction {
  _id?: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface TransactionFilters {
  type?: TransactionType | '';
  category?: string;
  startDate?: string;
  endDate?: string;
}
