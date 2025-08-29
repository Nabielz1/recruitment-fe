import React from 'react';

// Tipe untuk setiap opsi dalam dropdown
type SelectOption = {
  value: string;
  label: string;
};

// Tipe props untuk komponen Select
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, options, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="mt-1">
          <select
            id={id}
            ref={ref}
            {...props}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {/* Opsi default yang tidak bisa dipilih */}
            <option value="" disabled>-- Select an option --</option>
            
            {/* Mapping semua opsi yang diberikan */}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
);

export default Select;