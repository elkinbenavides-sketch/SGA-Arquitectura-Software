import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Filter,
  Layers,
} from 'lucide-react';
import { exportToCSV } from '../../services/academicStorage';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  filters?: FilterConfig[];
  exportFilename?: string;
  primaryAction?: {
    label: string;
    icon?: React.ElementType;
    onClick: () => void;
  };
  keyExtractor: (row: T) => string;
  initialSortKey?: string;
  initialSortDir?: 'asc' | 'desc';
  pageSizeOptions?: number[];
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  title,
  subtitle,
  searchPlaceholder = 'Buscar registros...',
  searchFields,
  filters = [],
  exportFilename = 'reporte-sga',
  primaryAction,
  keyExtractor,
  initialSortKey,
  initialSortDir = 'asc',
  pageSizeOptions = [5, 10, 25, 50],
  emptyMessage = 'No se encontraron registros que coincidan con la búsqueda.',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey || columns[0]?.key);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDir);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[1] || 10);

  // Handle sort toggle
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Filter & Search
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Check search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        let matchesSearch = false;

        if (searchFields && searchFields.length > 0) {
          matchesSearch = searchFields.some((field) => {
            const val = row[field];
            return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
          });
        } else {
          matchesSearch = Object.values(row).some((val) => {
            return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
          });
        }

        if (!matchesSearch) return false;
      }

      // 2. Check filters
      for (const [filterKey, filterValue] of Object.entries(activeFilters)) {
        if (filterValue && filterValue !== 'ALL') {
          if (String(row[filterKey]) !== filterValue) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, searchFields, activeFilters]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Excel / CSV Export
  const handleExportCSV = () => {
    const headers = columns.map((c) => c.header);
    const rows = sortedData.map((row) =>
      columns.map((c) => {
        const val = row[c.key];
        return val !== undefined && val !== null ? String(val) : '';
      })
    );
    exportToCSV(exportFilename, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          {title && <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* CSV Download */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
            title="Exportar registros a archivo Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel / CSV</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors no-print"
            title="Imprimir vista de tabla o exportar a PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir</span>
          </button>

          {/* Primary Action Button */}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-900 text-white hover:bg-blue-800 shadow-xs shadow-blue-950/20 transition-all"
            >
              {primaryAction.icon && <primaryAction.icon className="w-3.5 h-3.5" />}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 no-print">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/80 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        {filters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Filtros:
            </span>
            {filters.map((filter) => (
              <select
                key={filter.key}
                value={activeFilters[filter.key] || 'ALL'}
                onChange={(e) => {
                  setActiveFilters({
                    ...activeFilters,
                    [filter.key]: e.target.value,
                  });
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="ALL">{filter.label}: Todos</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`py-3 px-4 ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    } ${
                      col.sortable !== false ? 'cursor-pointer hover:bg-slate-100/80 select-none' : ''
                    }`}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'center'
                          ? 'justify-center'
                          : col.align === 'right'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                            )
                          ) : (
                            <ChevronDown className="w-3 h-3 opacity-30" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3 px-4 text-slate-700 ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-slate-700">{emptyMessage}</p>
                    <p className="text-[11px] text-slate-400">
                      Prueba ajustando los términos de búsqueda o los filtros activos.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 no-print">
        <div className="flex items-center gap-3">
          <span>
            Mostrando{' '}
            <strong className="text-slate-900">
              {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{' '}
            a{' '}
            <strong className="text-slate-900">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </strong>{' '}
            de <strong className="text-slate-900">{sortedData.length}</strong> registros
          </span>

          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span className="text-slate-500">Por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:outline-hidden"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-semibold text-slate-800">
            Pág. {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
