import { useState } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import WelcomeScreen from '@/components/WelcomeScreen'
import OnboardingWizard from '@/components/OnboardingWizard'
import AuthScreen from '@/components/AuthScreen'
import TabBar from '@/components/TabBar'
import HomeDashboard from '@/components/HomeDashboard'
import PracticeScreen from '@/components/PracticeScreen'
import HazardPerceptionTrainer from '@/components/HazardPerceptionTrainer'
import IntersectionTrainer from '@/components/IntersectionTrainer'
import LanePositioningTrainer from '@/components/LanePositioningTrainer'
import RoadTestPrep from '@/components/RoadTestPrep'
import TestRoutePractice from '@/components/TestRoutePractice'
import AIDrivingCoach from '@/components/AIDrivingCoach'
import DriveScreen from '@/components/DriveScreen'
import RealDriveAnalysis from '@/components/RealDriveAnalysis'
import DriverConfidenceMode from '@/components/DriverConfidenceMode'
import DriveTracker from '@/components/DriveTracker'
import DriveSummary from '@/components/DriveSummary'
import ProgressScreen from '@/components/ProgressScreen'
import ProfileScreen from '@/components/ProfileScreen'
import { useTheme } from '@/hooks/useTheme'
import {
  mockConfidence,
  mockReadiness,
  mockAchievements,
  mockBadges,
  mockHazardScenarios,
  mockIntersectionScenarios,
  mockLaneScenarios,
  mockRoadTestQuestions,
  mockTestResults,
  mockRoutes,
  mockCoachMessages,
  mockDrivingInsights,
  mockBreathingExercises,
  mockAnxietyLogs,
  mockCheckIns,
  mockSkillTree,
} from '@/data/mockData'
import type { User, TabId } from '@/types'
import type { AuthUser } from '@/hooks/useAuth'
import type { DriveSession } from '@/hooks/useDriveTracker'

type Screen =
  | { id: 'home' }
  | { id: 'practice' }
  | { id: 'hazard_trainer' }
  | { id: 'intersection_trainer' }
  | { id: 'lane_trainer' }
  | { id: 'road_test_prep' }
  | { id: 'test_route_practice' }
  | { id: 'ai_coach' }
  | { id: 'drive' }
  | { id: 'real_drive_analysis' }
  | { id: 'confidence_mode' }
  | { id: 'drive_tracker' }
  | { id: 'drive_summary'; session: DriveSession }
  | { id: 'progress' }
  | { id: 'profile' }

function userFromAuth(au: AuthUser): User {
  return {
    name: au.name,
    level: au.levelName,
    levelNumber: au.levelNumber,
    xp: au.xp,
    xpToNextLevel: 500,
    testDate: au.testDate,
    testType: au.testType,
    learningGoals: au.goals,
    streakDays: au.streakDays,
    totalSessions: au.totalSessions,
    joinedDate: new Date().toISOString().split('T')[0],
    avatarUrl: '',
  }
}

const fallbackUser: User = {
  name: 'Driver',
  level: 'Getting Started',
  levelNumber: 1,
  xp: 0,
  xpToNextLevel: 500,
  testDate: null,
  testType: 'none',
  learningGoals: [],
  streakDays: 0,
  totalSessions: 0,
  joinedDate: new Date().toISOString().split('T')[0],
  avatarUrl: '',
}

function MainApp() {
  const { isAuthenticated, isOnboarded, user, authLoading, login, signup, completeOnboarding } = useAuth()
  const [authScreenMode, setAuthScreenMode] = useState<'signin' | 'signup'>('signup')
  const [showAuth, setShowAuth] = useState(false)
  const { settings, updateSettings } = useTheme()

  // Main app routing
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [screen, setScreen] = useState<Screen>({ id: 'home' })

  const navigate = (s: Screen) => {
    setScreen(s)
    const tabMap: Record<string, TabId> = {
      home: 'home', practice: 'practice', hazard_trainer: 'practice',
      intersection_trainer: 'practice', lane_trainer: 'practice',
      road_test_prep: 'practice', test_route_practice: 'practice',
      ai_coach: 'home', drive: 'drive', real_drive_analysis: 'drive',
      confidence_mode: 'drive', drive_tracker: 'drive', drive_summary: 'drive',
      progress: 'progress', profile: 'profile',
    }
    setActiveTab(tabMap[s.id] ?? 'home')
  }

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    switch (tab) {
      case 'home': setScreen({ id: 'home' }); break
      case 'practice': setScreen({ id: 'practice' }); break
      case 'drive': setScreen({ id: 'drive' }); break
      case 'progress': setScreen({ id: 'progress' }); break
      case 'profile': setScreen({ id: 'profile' }); break
    }
  }

  const back = () => {
    const backMap: Record<string, () => void> = {
      hazard_trainer: () => setScreen({ id: 'practice' }),
      intersection_trainer: () => setScreen({ id: 'practice' }),
      lane_trainer: () => setScreen({ id: 'practice' }),
      road_test_prep: () => setScreen({ id: 'practice' }),
      test_route_practice: () => setScreen({ id: 'practice' }),
      ai_coach: () => { setScreen({ id: 'home' }); setActiveTab('home') },
      real_drive_analysis: () => setScreen({ id: 'drive' }),
      confidence_mode: () => setScreen({ id: 'drive' }),
      drive_tracker: () => setScreen({ id: 'drive' }),
      drive_summary: () => setScreen({ id: 'drive' }),
    }
    backMap[screen.id]?.()
  }

  const currentUser: User = user ? userFromAuth(user) : fallbackUser

  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    return await login(email, password)
  }

  const handleSignUp = async (email: string, password: string, name: string): Promise<boolean> => {
    return await signup(email, password, name)
  }

  const renderScreen = () => {
    switch (screen.id) {
      case 'home':
        return (
          <HomeDashboard
            user={currentUser}
            confidence={mockConfidence}
            readiness={mockReadiness}
            achievements={mockAchievements}
            onStartTraining={() => navigate({ id: 'practice' })}
            onViewCoach={() => navigate({ id: 'ai_coach' })}
          />
        )
      case 'practice':
        return (
          <PracticeScreen
            onSelectTrainer={(trainer) => {
              switch (trainer) {
                case 'hazard': navigate({ id: 'hazard_trainer' }); break
                case 'intersection': navigate({ id: 'intersection_trainer' }); break
                case 'lane': navigate({ id: 'lane_trainer' }); break
              }
            }}
          />
        )
      case 'hazard_trainer': return <HazardPerceptionTrainer scenarios={mockHazardScenarios} onBack={back} />
      case 'intersection_trainer': return <IntersectionTrainer scenarios={mockIntersectionScenarios} onBack={back} />
      case 'lane_trainer': return <LanePositioningTrainer scenarios={mockLaneScenarios} onBack={back} />
      case 'road_test_prep': return <RoadTestPrep readiness={mockReadiness} questions={mockRoadTestQuestions} mockResults={mockTestResults} onBack={back} />
      case 'test_route_practice': return <TestRoutePractice routes={mockRoutes} onBack={back} />
      case 'ai_coach': return <AIDrivingCoach messages={mockCoachMessages} onBack={back} />
      case 'drive': return <DriveScreen insights={mockDrivingInsights} onAnalyze={() => navigate({ id: 'real_drive_analysis' })} onConfidenceMode={() => navigate({ id: 'confidence_mode' })} onRealDrive={() => navigate({ id: 'drive_tracker' })} />
      case 'real_drive_analysis': return <RealDriveAnalysis insights={mockDrivingInsights} onBack={back} />
      case 'confidence_mode': return <DriverConfidenceMode exercises={mockBreathingExercises} anxietyLogs={mockAnxietyLogs} checkIns={mockCheckIns} onBack={back} />
      case 'drive_tracker': return <DriveTracker onStop={(s) => navigate({ id: 'drive_summary', session: s })} onBack={back} />
      case 'drive_summary': return <DriveSummary session={screen.session} onDone={back} />
      case 'progress': return <ProgressScreen user={currentUser} confidence={mockConfidence} achievements={mockAchievements} badges={mockBadges} skillTree={mockSkillTree} />
      case 'profile':
        return <ProfileScreen user={currentUser} settings={settings} onUpdateSettings={updateSettings} />
      default: return null
    }
  }

  const mainScreens: string[] = ['home', 'practice', 'drive', 'progress', 'profile']
  const showTabBar = mainScreens.includes(screen.id)

  // Loading
  if (authLoading) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center">
            <span className="text-2xl">🛣️</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated → Welcome or Auth
  if (!isAuthenticated) {
    if (showAuth) {
      return (
        <div className="app-shell">
          <AuthScreen
            mode={authScreenMode}
            onBack={() => setShowAuth(false)}
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
          />
        </div>
      )
    }
    return (
      <div className="app-shell">
        <WelcomeScreen
          onGetStarted={() => { setAuthScreenMode('signup'); setShowAuth(true) }}
          onSignIn={() => { setAuthScreenMode('signin'); setShowAuth(true) }}
        />
      </div>
    )
  }

  // Authenticated but not onboarded
  if (!isOnboarded) {
    return (
      <div className="app-shell">
        <OnboardingWizard onComplete={completeOnboarding} />
      </div>
    )
  }

  // Full app
  return (
    <div data-component="src/App.tsx" className="app-shell">
      {renderScreen()}
      {showTabBar && <TabBar activeTab={activeTab} onTabChange={handleTabChange} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}
