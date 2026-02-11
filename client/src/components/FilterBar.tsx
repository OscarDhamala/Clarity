import { ChangeEvent } from 'react';
import { TransactionFilters } from '../types';

interface FilterBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

const FilterBar = ({ filters, onChange, onApply, onClear }: FilterBarProps) => {
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="filter-bar">
      <select name="type" value={filters.type || ''} onChange={handleInputChange}>
        <option value="">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <input
        name="category"
        value={filters.category || ''}
        onChange={handleInputChange}
        placeholder="Category"
      />

      <input
        type="date"
        name="startDate"
        value={filters.startDate || ''}
        onChange={handleInputChange}
      />

      <input
        type="date"
        name="endDate"
        value={filters.endDate || ''}
        onChange={handleInputChange}
      />

      <button type="button" className="primary-btn" onClick={onApply}>
        Apply
      </button>
      <button type="button" className="ghost-btn" onClick={onClear}>
        Clear
      </button>
    </div>
  );
};

export default FilterBar;
