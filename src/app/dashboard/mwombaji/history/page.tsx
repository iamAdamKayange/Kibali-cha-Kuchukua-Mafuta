'use client'

import { RequestListPage } from '@/components/dashboard/RequestListPage'
import { useAuth } from '@/contexts/AuthContext'

export default function Page() {
  const { user } = useAuth()
  return <RequestListPage role="mwombaji" mode="history" userId={user?.id} />
}
