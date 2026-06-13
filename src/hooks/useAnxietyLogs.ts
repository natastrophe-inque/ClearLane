import { useTable } from './useTable'
import type { Database } from '@/types/database'

type AnxietyLogsRow = Database['public']['Tables']['anxiety_logs']['Row']
type AnxietyLogsInsert = Database['public']['Tables']['anxiety_logs']['Insert']

export function useAnxietyLogs() {
  return useTable<AnxietyLogsRow, AnxietyLogsInsert>('anxiety_logs')
}
