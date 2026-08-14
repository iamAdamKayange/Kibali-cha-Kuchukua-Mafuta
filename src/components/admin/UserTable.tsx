'use client'

import { Edit3, Trash2 } from 'lucide-react'
import type { User } from '@/types'

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

function departmentName(user: User) {
  const department = user.department
  if (!department) return 'N/A'
  return typeof department === 'string' ? department : department.name
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 font-medium">Jina</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Idara</th>
            <th className="px-4 py-3 font-medium">Hali</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {users.map((user) => (
            <tr key={user.id} className="text-gray-700 dark:text-gray-300">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A'}
              </td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.role}</td>
              <td className="px-4 py-3">{departmentName(user)}</td>
              <td className="px-4 py-3">{user.isActive ? 'Active' : 'Inactive'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button onClick={() => onEdit(user)} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(user)} className="rounded-lg p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
