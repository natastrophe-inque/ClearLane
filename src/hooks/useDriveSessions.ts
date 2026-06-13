import { useTable } from './useTable'
import type { Database } from '@/types/database'

type DriveSessionsRow = Database['public']['Tables']['drive_sessions']['Row']
type DriveSessionsInsert = Database['public']['Tables']['drive_sessions']['Insert']

export function useDriveSessions() {
  return useTable<DriveSessionsRow, DriveSessionsInsert>('drive_sessions')
}
