import React from 'react';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  className?: string;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  onSort,
  sortKey,
  sortDirection,
  emptyMessage = 'No data available',
  className = '',
}) => {
  const handleSort = (key: string) => {
    if (!onSort) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  text-left py-3 px-4 font-medium text-primary-text
                  ${column.sortable ? 'cursor-pointer hover:text-royal-indigo transition-colors' : ''}
                  ${column.width ? column.width : ''}
                `}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && sortKey === column.key && (
                    <span className="text-royal-indigo">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 px-4 text-center text-secondary-text"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-800 hover:bg-surface-hover/30 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="py-4 px-4 text-primary-text">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;