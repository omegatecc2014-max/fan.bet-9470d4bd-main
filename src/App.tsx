import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";
import { WalletProvider } from "@/hooks/useWallet";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import FeedPage from "./pages/FeedPage";
import RankingsPage from "./pages/RankingsPage";
import WalletPage from "./pages/WalletPage";
import ProfilePage from "./pages/ProfilePage";
import InfluencerDashboard from "./pages/influencer/InfluencerDashboard";

import PostHintPage from "./pages/influencer/PostHintPage";
import QuestionnairePage from "./pages/influencer/QuestionnairePage";
import PrivacySecurityPage from "./pages/PrivacySecurityPage";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import ModerationPage from "./pages/admin/ModerationPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import UserFlowPage from "./pages/admin/UserFlowPage";
import InfluencersPage from "./pages/admin/InfluencersPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import NotificationsPage from "./pages/admin/NotificationsPage";
import SupportPage from "./pages/admin/SupportPage";
import LeadsPage from "./pages/admin/LeadsPage";
import TournamentsPage from "./pages/admin/TournamentsPage";
import HelpCenterPage from "./pages/HelpCenterPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WalletProvider>
        <TooltipProvider>
          <Sonner theme="dark" />
          <BrowserRouter>
            <Routes>
          {/* Admin Panel */}

          <Route
            path="/admin"
            element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminLayout>
                <UsersPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <AdminLayout>
                <ModerationPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <AdminLayout>
                <PaymentsPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/flow"
            element={
              <AdminLayout>
                <UserFlowPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/influencers"
            element={
              <AdminLayout>
                <InfluencersPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminLayout>
                <AnalyticsPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <AdminLayout>
                <NotificationsPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/support"
            element={
              <AdminLayout>
                <SupportPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/leads"
            element={
              <AdminLayout>
                <LeadsPage />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/tournaments"
            element={
              <AdminLayout>
                <TournamentsPage />
              </AdminLayout>
            }
          />

          {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main App */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell>
                <Routes>
                  <Route path="/" element={<FeedPage />} />
                  <Route path="/rankings" element={<RankingsPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/help" element={<HelpCenterPage />} />
                  <Route path="/privacy-security" element={<PrivacySecurityPage />} />

                  <Route path="/influencer" element={<InfluencerDashboard />} />
                  <Route path="/influencer/post-hint" element={<PostHintPage />} />
                  <Route path="/influencer/questionnaire" element={<QuestionnairePage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>

      </WalletProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
