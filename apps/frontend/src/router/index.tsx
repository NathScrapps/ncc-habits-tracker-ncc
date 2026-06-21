import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { PatientDashboardPage } from '@/pages/PatientDashboardPage'
import { NutritionistPatientsPage } from '@/pages/NutritionistPatientsPage'
import { PatientDetailPage } from '@/pages/PatientDetailPage'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage'))

function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth()
  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'NUTRITIONIST') return <Navigate to="/nutritionist/patients" replace />
  if (user?.role === 'ADMIN') return <Navigate to="/admin/users" replace />
  return <Navigate to="/patient/dashboard" replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Patient routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute requiredRole="PATIENT">
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboardPage />} />
      </Route>

      {/* Nutritionist routes */}
      <Route
        path="/nutritionist"
        element={
          <ProtectedRoute requiredRole="NUTRITIONIST">
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="patients" replace />} />
        <Route path="patients" element={<NutritionistPatientsPage />} />
        <Route path="patients/:patientId" element={<PatientDetailPage />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="users" replace />} />
        <Route
          path="users"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminUsersPage />
            </Suspense>
          }
        />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
