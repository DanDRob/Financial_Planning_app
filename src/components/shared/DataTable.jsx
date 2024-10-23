import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

export const DataTable = ({
  data,
  columns,
  onUpdate,
  editable = false,
  sortable = true,
  filterable = true,
  pagination = true,
  pageSize = 10
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState(null);

  const formatCell = (value, type) => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'number':
        return value.toLocaleString();
      case 'date':
        return new Date(value).toLocaleDateString();
      default:
        return value;
    }
  };

  const handleSort = (key) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilter = (column, value) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1);
  };

  const handleCellEdit = (rowIndex, column, value) => {
    if (!editable) return;
    onUpdate?.(rowIndex, column.accessor, value);
    setEditingCell(null);
  };

  const sortData = (dataToSort) => {
    if (!sortConfig.key) return dataToSort;

    return [...dataToSort].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filterData = (dataToFilter) => {
    return dataToFilter.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const cellValue = row[key]?.toString().toLowerCase();
        return cellValue?.includes(value.toLowerCase());
      });
    });
  };

  const paginateData = (dataToPage) => {
    if (!pagination) return dataToPage;
    
    const start = (currentPage - 1) * pageSize;
    return dataToPage.slice(start, start + pageSize);
  };

  const processedData = paginateData(filterData(sortData(data)));
  const totalPages = Math.ceil(filterData(sortData(data)).length / pageSize);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.accessor}
                className={sortable ? 'cursor-pointer select-none' : ''}
                onClick={() => handleSort(column.accessor)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {sortable && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
                {filterable && (
                  <Input
                    placeholder={`Filter ${column.header}`}
                    value={filters[column.accessor] || ''}
                    onChange={(e) => handleFilter(column.accessor, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2"
                  />
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column.accessor}>
                  {editingCell?.rowIndex === rowIndex && 
                   editingCell?.column === column.accessor ? (
                    <Input
                      value={row[column.accessor]}
                      onChange={(e) => handleCellEdit(rowIndex, column, e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                    />
                  ) : (
                    <div
                      className={editable ? 'cursor-pointer hover:bg-gray-100 p-1 rounded' : ''}
                      onClick={() => editable && setEditingCell({ rowIndex, column: column.accessor })}
                    >
                      {formatCell(row[column.accessor], column.type)}
                    </div>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};