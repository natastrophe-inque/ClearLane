import { useTable } from './useTable'
import type { Database } from '@/types/database'

type UsersRow = Database['public']['Tables']['users']['Row']
type UsersInsert = Database['public']['Tables']['users']['Insert']

export function useUsers() {
  return useTable<UsersRow, UsersInsert>('users')
}
