import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

// Pages
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';

// Layout components
import { Navigation } from '@/app/components/Navigation';
import { Footer } from '@/app/components/Footer';
import { AdminLayout } from '@/app/components/admin/AdminLayout';

// Main pages
import { HomePage } from '@/app/components/HomePage';
import { CoursesPage } from '@/app/components/CoursesPage';
import { CourseDetailPage } from '@/app/components/CourseDetailPage';
import { VideosPage } from '@/app/components/VideosPage';
import { TestsPage } from '@/app/components/TestsPage';
import { TestTakingPage } from '@/app/components/TestTakingPage';
import { ProfilePage } from '@/app/components/ProfilePage';
import { DashboardPage } from '@/app/components/DashboardPage';
import { PremiumPage } from '@/app/components/PremiumPage';
import { LawArticlesPage } from '@/app/components/LawArticlesPage';

// Admin pages
import { AdminDashboard } from '@/app/components/admin/AdminDashboard';
import { UserManagement } from '@/app/components/admin/UserManagement';
import { CourseManagement } from '@/app/components/admin/CourseManagement';
import { TestManagement } from '@/app/components/admin/TestManagement';
import { Analytics } from '@/app/components/admin/Analytics';
import { PaymentManagement } from '@/app/components/admin/PaymentManagement';
import { NotificationCenter } from '@/app/components/admin/NotificationCenter';
import { SiteSettings } from '@/app/components/admin/SiteSettings';

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
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}