'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { FuelRequest, RequestFilter } from '@/types'

interface UseRequestsOptions {
  autoFetch?: boolean
  initialFilters?: RequestFilter
  page?: number
  limit?: number
}

interface UseRequestsReturn {
  requests: FuelRequest[]
  loading: boolean
  error: string | null
  total: number
  page: number
  totalPages: number
  filters: RequestFilter
  fetchRequests: (filters?: RequestFilter) => Promise<void>
  fetchRequest: (id: string) => Promise<FuelRequest | null>
  createRequest: (data: Partial<FuelRequest>) => Promise<FuelRequest | null>
  updateRequest: (id: string, data: Partial<FuelRequest>) => Promise<FuelRequest | null>
  approveRequest: (id: string, stage: string, data: any) => Promise<FuelRequest | null>
  rejectRequest: (id: string, stage: string, reason: string) => Promise<FuelRequest | null>
  issueFuel: (id: string, data: any) => Promise<FuelRequest | null>
  setFilters: (filters: RequestFilter) => void
  setPage: (page: number) => void
  clearFilters: () => void
  refetch: () => Promise<void>
}

export function useRequests(options: UseRequestsOptions = {}): UseRequestsReturn {
  const {
    autoFetch = true,
    initialFilters = {},
    page: initialPage = 1,
    limit = 10,
  } = options

  const [requests, setRequests] = useState<FuelRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<RequestFilter>(initialFilters)

  // Fetch requests
  const fetchRequests = useCallback(async (newFilters?: RequestFilter) => {
    setLoading(true)
    setError(null)
    
    try {
      const currentFilters = newFilters || filters
      const queryParams = new URLSearchParams()
      
      // Add pagination
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())
      
      // Add filters
      if (currentFilters.status) {
        queryParams.append('status', currentFilters.status)
      }
      if (currentFilters.dateFrom) {
        queryParams.append('fromDate', currentFilters.dateFrom.toISOString())
      }
      if (currentFilters.dateTo) {
        queryParams.append('toDate', currentFilters.dateTo.toISOString())
      }

      const response = await api.get<FuelRequest[]>(`/fuel-requests?${queryParams.toString()}`)

      if (response.success && response.data) {
        setRequests(response.data)
        const pagination = (response as any).pagination
        setTotal(pagination?.total || response.data.length)
        setTotalPages(pagination?.totalPages || 1)
      } else {
        setError(response.error || 'Failed to fetch requests')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [page, limit, filters])

  // Fetch single request
  const fetchRequest = useCallback(async (id: string): Promise<FuelRequest | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get<FuelRequest>(`/fuel-requests/${id}`)
      
      if (response.success && response.data) {
        return response.data
      } else {
        setError(response.error || 'Failed to fetch request')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Create request
  const createRequest = useCallback(async (data: Partial<FuelRequest>): Promise<FuelRequest | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<FuelRequest>('/fuel-requests', data)
      
      if (response.success && response.data) {
        // Refresh list
        await fetchRequests()
        return response.data
      } else {
        setError(response.error || 'Failed to create request')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRequests])

  // Update request
  const updateRequest = useCallback(async (id: string, data: Partial<FuelRequest>): Promise<FuelRequest | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.put<FuelRequest>(`/fuel-requests/${id}`, data)
      
      if (response.success && response.data) {
        // Refresh list
        await fetchRequests()
        return response.data
      } else {
        setError(response.error || 'Failed to update request')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRequests])

  // Approve request
  const approveRequest = useCallback(async (id: string, stage: string, data: any): Promise<FuelRequest | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<{ request: FuelRequest }>(`/approvals/${id}/${stage}`, data)
      
      if (response.success && response.data) {
        await fetchRequests()
        return response.data.request
      } else {
        setError(response.error || 'Failed to approve request')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRequests])

  // Reject request
  const rejectRequest = useCallback(async (id: string, stage: string, reason: string): Promise<FuelRequest | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post<{ request: FuelRequest }>(`/approvals/${id}/${stage}`, {
        approved: false,
        reason,
        designation: '',
        signature: '',
      })
      
      if (response.success && response.data) {
        await fetchRequests()
        return response.data.request
      } else {
        setError(response.error || 'Failed to reject request')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRequests])

  const issueFuel = useCallback(async (id: string, data: any): Promise<FuelRequest | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post<{ request: FuelRequest }>(`/fuel-issuance/${id}`, data)

      if (response.success && response.data) {
        await fetchRequests()
        return response.data.request
      }

      setError(response.error || 'Failed to issue fuel')
      return null
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRequests])

  // Set filters with auto-fetch
  const handleSetFilters = useCallback((newFilters: RequestFilter) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({})
    setPage(1)
  }, [])

  // Refetch
  const refetch = useCallback(async () => {
    await fetchRequests()
  }, [fetchRequests])

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchRequests()
    }
  }, [autoFetch, fetchRequests])

  return {
    requests,
    loading,
    error,
    total,
    page,
    totalPages,
    filters,
    fetchRequests,
    fetchRequest,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    issueFuel,
    setFilters: handleSetFilters,
    setPage,
    clearFilters,
    refetch,
  }
}
