import { Transaction } from '../types';

interface SummaryCardsProps {
  transactions: Transaction[];
}

const SummaryCards = ({ transactions }: SummaryCardsProps) => {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const balance = income - expenses;

  const cards = [
    { label: 'Income', value: income, accent: 'positive' },
    { label: 'Expenses', value: expenses, accent: 'negative' },
    { label: 'Balance', value: balance, accent: balance >= 0 ? 'neutral' : 'negative' },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <div key={card.label} className={`summary-card ${card.accent}`}>
          <p>{card.label}</p>
          <strong>${card.value.toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
