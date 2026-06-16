import { cn, formatRelativeDate, badgeTierColor } from '@/lib/utils'
import type { Achievement, Badge } from '@/types'

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const unlocked = !!achievement.unlockedAt
  return (
    <div className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all', unlocked ? 'bg-white dark:bg-surface-card-dark border border-gray-100' : 'bg-gray-50 border-dashed border-gray-200 opacity-70')}>
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', unlocked ? 'bg-accent-100 dark:bg-accent-900/30' : 'bg-gray-200')}>
        <span className={cn('text-lg', unlocked ? '' : 'grayscale')}>
          {achievement.icon === 'Car' && '🚗'}
          {achievement.icon === 'Flame' && '🔥'}
          {achievement.icon === 'ShieldAlert' && '⚠️'}
          {achievement.icon === 'ArrowLeftRight' && '↔️'}
          {achievement.icon === 'TrendingUp' && '📈'}
          {achievement.icon === 'Moon' && '🌙'}
          {achievement.icon === 'Trophy' && '🏆'}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-semibold', unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400')}>{achievement.title}</p>
        <p className="text-xs text-gray-500 truncate">{achievement.description}</p>
      </div>
      {unlocked && achievement.unlockedAt && <span className="text-[10px] text-gray-400 shrink-0">{formatRelativeDate(achievement.unlockedAt)}</span>}
    </div>
  )
}

export function BadgeCard({ badge }: { badge: Badge }) {
  const pct = Math.round((badge.progress / badge.progressMax) * 100)
  return (
    <div className={cn('flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all', badge.earned ? 'bg-white dark:bg-surface-card-dark border-accent-200' : 'bg-gray-50 border-dashed border-gray-200')}>
      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-xl', badge.earned ? `bg-gradient-to-br ${badgeTierColor(badge.tier)}` : 'bg-gray-200')}>
        {badge.icon === 'Sunrise' && '🌅'}
        {badge.icon === 'Moon' && '🌙'}
        {badge.icon === 'Flame' && '🔥'}
        {badge.icon === 'Eye' && '👁️'}
        {badge.icon === 'Shield' && '🛡️'}
        {badge.icon === 'Leaf' && '🍃'}
      </div>
      <p className={cn('text-xs font-semibold text-center', badge.earned ? 'text-gray-900 dark:text-white' : 'text-gray-400')}>{badge.name}</p>
      {!badge.earned && <div className="w-full bg-gray-200 rounded-full h-1"><div className="bg-accent-500 h-1 rounded-full" style={{ width: `${pct}%` }} /></div>}
    </div>
  )
}

export function AchievementList({ achievements }: { achievements: Achievement[] }) {
  return <div className="space-y-2">{achievements.map((a) => <AchievementCard key={a.id} achievement={a} />)}</div>
}

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return <div className="grid grid-cols-3 gap-3">{badges.map((b) => <BadgeCard key={b.id} badge={b} />)}</div>
}