import { RequestListPage } from '@/components/dashboard/RequestListPage'
import { useAuth } from '@/contexts/AuthContext'

export default function Page() {
  const { user } = useAuth()
  return <RequestListPage role="afisa-usafirishaji" mode="pending" userId={user?.id} />
}
