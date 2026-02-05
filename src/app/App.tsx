import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

// Layout components
import { Navigation } from '@/app/components/Navigation';
import { Footer } from '@/app/components/Footer';
import { AdminLayout } from '@/app/components/admin/AdminLayout';
import { ReloadPrompt } from '@/app/components/ReloadPrompt';

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));

const HomePage = lazy(() => import('@/app/components/HomePage').then(module => ({ default: module.HomePage })));
const CoursesPage = lazy(() => import('@/app/components/CoursesPage').then(module => ({ default: module.CoursesPage })));
const CourseDetailPage = lazy(() => import('@/app/components/CourseDetailPage').then(module => ({ default: module.CourseDetailPage })));
const VideosPage = lazy(() => import('@/app/components/VideosPage').then(module => ({ default: module.VideosPage })));
const TestsPage = lazy(() => import('@/app/components/TestsPage').then(module => ({ default: module.TestsPage })));
const TestTakingPage = lazy(() => import('@/app/components/TestTakingPage').then(module => ({ default: module.TestTakingPage })));
const ProfilePage = lazy(() => import('@/app/components/ProfilePage').then(module => ({ default: module.ProfilePage })));
const DashboardPage = lazy(() => import('@/app/components/DashboardPage').then(module => ({ default: module.DashboardPage })));
const PremiumPage = lazy(() => import('@/app/components/PremiumPage').then(module => ({ default: module.PremiumPage })));
const LawArticlesPage = lazy(() => import('@/app/components/LawArticlesPage').then(module => ({ default: module.LawArticlesPage })));
const FlashcardsPage = lazy(() => import('@/app/components/FlashcardsPage').then(module => ({ default: module.FlashcardsPage })));
const FavoritesPage = lazy(() => import('@/app/components/FavoritesPage').then(module => ({ default: module.FavoritesPage })));

// Admin pages
const AdminDashboard = lazy(() => import('@/app/components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const UserManagement = lazy(() => import('@/app/components/admin/UserManagement').then(module => ({ default: module.UserManagement })));
const CourseManagement = lazy(() => import('@/app/components/admin/CourseManagement').then(module => ({ default: module.CourseManagement })));
const TestManagement = lazy(() => import('@/app/components/admin/TestManagement').then(module => ({ default: module.TestManagement })));
const Analytics = lazy(() => import('@/app/components/admin/Analytics').then(module => ({ default: module.Analytics })));
const PaymentManagement = lazy(() => import('@/app/components/admin/PaymentManagement').then(module => ({ default: module.PaymentManagement })));
const NotificationCenter = lazy(() => import('@/app/components/admin/NotificationCenter').then(module => ({ default: module.NotificationCenter })));
const SiteSettings = lazy(() => import('@/app/components/admin/SiteSettings').then(module => ({ default: module.SiteSettings })));

// Layout wrapper for authenticated pages
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Public home page */}
                <Route
                  path="/"
                  element={
                    <MainLayout>
                      <HomePage />
                    </MainLayout>
                  }
                />

                {/* Protected user routes */}
                <Route
                  path="/courses"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <CoursesPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/courses/:id"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <CourseDetailPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/videos"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <VideosPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/tests"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <TestsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/tests/:id/take"
                  element={
                    <ProtectedRoute>
                      <TestTakingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DashboardPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ProfilePage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/flashcards"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <FlashcardsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <FavoritesPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Premium route */}
                <Route
                  path="/premium"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PremiumPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Law Articles route */}
                <Route
                  path="/law"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <LawArticlesPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes with separate layout */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout>
                        <UserManagement />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/courses"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout>
                        <CourseManagement />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/tests"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout>
                        <TestManagement />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/payments"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout>
                        <PaymentManagement />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout>
                        <Analytics />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout>
                        <SiteSettings />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/notifications"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout>
                        <NotificationCenter />
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Redirect old admin route to new dashboard */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
          <ReloadPrompt />
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}