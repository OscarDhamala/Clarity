import { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface CategoryBarChartProps {
  transactions: Transaction[];
  type: TransactionType;
}

const currencyFormatter = new Intl.NumberFormat('ne-NP', {
  style: 'currency',
  currency: 'NPR',
});

const fallbackLabel = 'Uncategorized';

const CategoryBarChart = ({ transactions, type }: CategoryBarChartProps) => {
  const chartData = useMemo(() => {
    const totals = transactions.reduce<Record<string, number>>((acc, transaction) => {
      const key = transaction.category?.trim() || fallbackLabel;
      acc[key] = (acc[key] || 0) + Number(transaction.amount);
      return acc;
    }, {});

    return Object.entries(totals)
      .sort(([, valueA], [, valueB]) => valueB - valueA)
      .slice(0, 6);
  }, [transactions]);

  const maxValue = chartData.length ? chartData[0][1] : 0;
  const heading = type === 'income' ? 'Income by category' : 'Expenses by category';
  const emptyCopy =
    type === 'income'
      ? 'No income categories yet. Add an entry to unlock this view.'
      : 'No expense categories yet. Add an entry to unlock this view.';

  if (!chartData.length) {
    return (
      <section className="category-chart-card">
        <div className="chart-header">
          <h3>{heading}</h3>
          <span className="muted">0 categories</span>
        </div>
        <p className="muted">{emptyCopy}</p>
      </section>
    );
  }

  return (
    <section className="category-chart-card">
      <div className="chart-header">
        <h3>{heading}</h3>
        <span className="muted">{chartData.length} categories</span>
      </div>

      <div className="category-bar-vertical">
        {chartData.map(([category, total]) => (
          <div key={category} className="category-column">
            <div className="category-bar-shell">
              <div
                className={`category-bar-fill vertical ${type}`}
                style={{ height: maxValue ? `${(total / maxValue) * 100}%` : '0%' }}
              />
            </div>
            <span className="category-column-value">{currencyFormatter.format(total)}</span>
            <span className="category-column-label">{category}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryBarChart;
