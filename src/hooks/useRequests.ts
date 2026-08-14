'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { FuelRequest, RequestFilter } from '@/types'

interface ApprovalPayload {
  approved: boolean
  reason?: string
  designation?: string
  title?: string
  litresApproved?: number
  logbookNumber?: string
  logbookTo?: string
  auditAction?: 'APPROVE' | 'REJECT'
  actionBy?: string
  actionRole?: string
  actionAt?: string
}

interface FuelIssuePayload {
  fuelType: string
  litresIssued: number
  tokenNumber: string
  designation?: string
  auditAction?: 'ISSUE_FUEL'
  actionBy?: string
  actionRole?: string
  actionAt?: string
}

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
  approveRequest: (id: string, stage: string, data: ApprovalPayload) => Promise<FuelRequest | null>
  rejectRequest: (id: string, stage: string, reason: string) => Promise<FuelRequest | null>
  issueFuel: (id: string, data: FuelIssuePayload) => Promise<FuelRequest | null>
  setFilters: (filters: RequestFilter) => void
  setPage: (page: number) => void
  clearFilters: () => void
  refetch: () => Promise<void>
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'An error occurred'
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

  const fetchRequests = useCallback(async (newFilters?: RequestFilter) => {
    setLoading(true)
    setError(null)

    try {
      const currentFilters = newFilters || filters
      const queryParams = new URLSearchParams()

      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())

      if (currentFilters.status) queryParams.append('status', currentFilters.status)
      if (currentFilters.dateFrom) queryParams.append('fromDate', currentFilters.dateFrom.toISOString())
      if (currentFilters.dateTo) queryParams.append('toDate', currentFilters.dateTo.toISOString())

      const response = await api.get<FuelRequest[]>(`/fuel-requests?${queryParams.toString()}`)

      if (response.success && response.data) {
        setRequests(response.data)
        setTotal(response.pagination?.total || response.data.length)
        setTotalPages(response.pagination?.totalPages || 1)
        return
      }

      setError(response.error || 'Failed to fetch requests')
    } catch (err: unknown) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [page, limit, filters])

  const fetchRequest = useCallback(async (id: string): Promise<FuelRequest | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get<FuelRequest>(`/fuel-requests/${id}`)

      if (response.success && response.data) return response.data

      setError(response.error || 'Failed to fetch request')
      return null
    } catch (err: unknown) {
      setError(errorMessage(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const createRequest = useCallback(async (data: Partial<FuelRequest>): Promise<FuelRequest | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post<FuelRequest>('/fuel-requests', data)

      if (response.success && response.data) {
        await fetchRequests()
        return response.data
      }

      setError(response.error || 'Failed to create request')
      return null
    } catch (err: unknown) {
      setError(errorMessage(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRequests])

  const updateRequest = useCallback(async (id: string, data: Partial<FuelRequest>): Promise<FuelRequest | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.put<FuelRequest>(`/fuel-requests/${id}`, data)

      if (response.success && response.data) {
        await fetchRequests()
        return response.data
      }

      setError(response.error || 'Failed to update request')
      return null
    } catch (err: unknown) {
      setError(errorMessage(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRequests])

  const approveRequest = useCallback(async (
    id: string,
    stage: string,
    data: ApprovalPayload
  ): Promise<FuelRequest | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post<{ request: FuelRequest }>(`/approvals/${id}/${stage}`, {
        ...data,
        approved: true,
        auditAction: 'APPROVE',
      })

      if (response.success && response.data) {
        await fetchRequests()
        return response.data.request
      }

      setError(response.error || 'Failed to approve request')
      return null
    } catch (err: unknown) {
      setError(errorMessage(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRequests])

  const rejectRequest = useCallback(async (
    id: string,
    stage: string,
    reason: string
  ): Promise<FuelRequest | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post<{ request: FuelRequest }>(`/approvals/${id}/${stage}`, {
        approved: false,
        reason,
        designation: 'Confirmed electronically',
        signature: 'Confirmed electronically',
        auditAction: 'REJECT',
      })

      if (response.success && response.data) {
        await fetchRequests()
        return response.data.request
      }

      setError(response.error || 'Failed to reject request')
      return null
    } catch (err: unknown) {
      setError(errorMessage(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRequests])

  const issueFuel = useCallback(async (id: string, data: FuelIssuePayload): Promise<FuelRequest | null> => {
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
    } catch (err: unknown) {
      setError(errorMessage(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRequests])

  const handleSetFilters = useCallback((newFilters: RequestFilter) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setPage(1)
  }, [])

  const refetch = useCallback(async () => {
    await fetchRequests()
  }, [fetchRequests])

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
