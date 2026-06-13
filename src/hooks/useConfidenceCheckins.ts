import { useTable } from './useTable'
import type { Database } from '@/types/database'

type ConfidenceCheckinsRow = Database['public']['Tables']['confidence_checkins']['Row']
type ConfidenceCheckinsInsert = Database['public']['Tables']['confidence_checkins']['Insert']

export function useConfidenceCheckins() {
  return useTable<ConfidenceCheckinsRow, ConfidenceCheckinsInsert>('confidence_checkins')
}
