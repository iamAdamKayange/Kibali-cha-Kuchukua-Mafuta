'use client'

import { RequestListPage } from '@/components/dashboard/RequestListPage'
import { useAuth } from '@/contexts/AuthContext'

export default function Page() {
  const { user } = useAuth()
  return <RequestListPage role="ada-dahrm" mode="history" userId={user?.id} />
}
