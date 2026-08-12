'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  ChevronDown,
  Fuel,
  Car,
  User,
  Building
} from 'lucide-react'

interface FilterOptions {
  search: string
  status: string
  fuelType: string
  department: string
  dateFrom: string
  dateTo: string
}

interface RequestFiltersProps {
  onFilter: (filters: FilterOptions) => void
  onClear: () => void
  initialFilters?: Partial<FilterOptions>
}

const statusOptions = [
  { value: '', label: 'Hali Yote' },
  { value: 'pending', label: 'Inasubiri' },
  { value: 'submitted', label: 'Imewasilishwa' },
  { value: 'approved', label: 'Imeidhinishwa' },
  { value: 'rejected', label: 'Imekataliwa' },
  { value: 'completed', label: 'Imekamilika' },
]

const fuelOptions = [
  { value: '', label: 'Aina Yote' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Petrol', label: 'Petrol' },
]

const departmentOptions = [
  { value: '', label: 'Idara Yote' },
  { value: 'Habari', label: 'Habari' },
  { value: 'Utamaduni', label: 'Utamaduni' },
  { value: 'Sanaa', label: 'Sanaa' },
  { value: 'Michezo', label: 'Michezo' },
  { value: 'Usafirishaji', label: 'Usafirishaji' },
  { value: 'ADA', label: 'ADA' },
  { value: 'DAHRM', label: 'DAHRM' },
]

export function RequestFilters({ onFilter, onClear, initialFilters }: RequestFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    search: initialFilters?.search || '',
    status: initialFilters?.status || '',
    fuelType: initialFilters?.fuelType || '',
    department: initialFilters?.department || '',
    dateFrom: initialFilters?.dateFrom || '',
    dateTo: initialFilters?.dateTo || '',
  })

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const handleClear = () => {
    const emptyFilters = {
      search: '',
      status: '',
      fuelType: '',
      department: '',
      dateFrom: '',
      dateTo: '',
    }
    setFilters(emptyFilters)
    onClear()
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="glass-card rounded-2xl p-4 md:p-6">
      {/* Search Bar - Always Visible */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Tafuta kwa namba, mwombaji, au gari..."
            className="input-field pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-3 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
              isExpanded || hasActiveFilters
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Vichujio</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary-500 rounded-full" />
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} />
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">Futa</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
          marginTop: isExpanded ? 16 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Hali
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-field"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Fuel className="w-4 h-4 inline mr-1" />
              Aina ya Mafuta
            </label>
            <select
              value={filters.fuelType}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              className="input-field"
            >
              {fuelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Building className="w-4 h-4 inline mr-1" />
              Idara
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="input-field"
            >
              {departmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              Tarehe
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="input-field text-sm flex-1"
                placeholder="Kuanzia"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="input-field text-sm flex-1"
                placeholder="Hadi"
              />
            </div>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Vichujio vya haraka:</span>
          <button
            onClick={() => {
              handleFilterChange('status', 'pending')
              setIsExpanded(true)
            }}
            className="px-3 py-1 text-xs bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400 rounded-full hover:bg-warning-100 dark:hover:bg-warning-900/40 transition-colors duration-200"
          >
            Yanasubiri
          </button>
          <button
            onClick={() => {
              handleFilterChange('status', 'approved')
              setIsExpanded(true)
            }}
            className="px-3 py-1 text-xs bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-400 rounded-full hover:bg-success-100 dark:hover:bg-success-900/40 transition-colors duration-200"
          >
            Yameidhinishwa
          </button>
          <button
            onClick={() => {
              handleFilterChange('status', 'rejected')
              setIsExpanded(true)
            }}
            className="px-3 py-1 text-xs bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-400 rounded-full hover:bg-danger-100 dark:hover:bg-danger-900/40 transition-colors duration-200"
          >
            Yamekataliwa
          </button>
          <button
            onClick={() => {
              handleFilterChange('status', 'completed')
              setIsExpanded(true)
            }}
            className="px-3 py-1 text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors duration-200"
          >
            Imekamilika
          </button>
          <button
            onClick={() => {
              handleFilterChange('fuelType', 'Diesel')
              setIsExpanded(true)
            }}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Diesel
          </button>
          <button
            onClick={() => {
              handleFilterChange('fuelType', 'Petrol')
              setIsExpanded(true)
            }}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Petrol
          </button>
        </div>
      </motion.div>
    </div>
  )
}