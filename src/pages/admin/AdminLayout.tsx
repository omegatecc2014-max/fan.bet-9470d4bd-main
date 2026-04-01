import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdminGuard } from "@/lib/adminGuard";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  Activity,
  Star,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  BellRing,
  Headset,
  UserCheck2,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, badge: null },
  { path: "/admin/users", label: "Usuários", icon: Users, badge: "1.2k" },
  { path: "/admin/leads", label: "Leads", icon: UserCheck2, badge: "NEW" },
  { path: "/admin/moderation", label: "Moderação", icon: ShieldCheck, badge: "23" },
  { path: "/admin/payments", label: "Pagamentos", icon: CreditCard, badge: null },
  { path: "/admin/flow", label: "Fluxo de Usuário", icon: Activity, badge: null },
  { path: "/admin/influencers", label: "Influenciadores", icon: Star, badge: "7" },
  { path: "/admin/tournaments", label: "Torneios", icon: Trophy, badge: null },
  { path: "/admin/notifications", label: "Notificações", icon: BellRing, badge: null },
  { path: "/admin/analytics", label: "Analytics", icon: TrendingUp, badge: null },
  { path: "/admin/support", label: "Chamados", icon: Headset, badge: null },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useAdminGuard();

  const Sidebar = ({ mobile = false }) => (
    <div
      className={`flex flex-col h-full bg-[#0d0f1a] border-r border-white/5 transition-all duration-300 ${
        mobile ? "w-72" : collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg gradient-star flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-black text-[#0d0f1a]">F</span>
        </div>
        {(!collapsed || mobile) && (
          <div className="overflow-hidden">
            <p className="font-display font-bold text-sm text-white leading-tight">Fan.bet</p>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Admin Panel</p>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-white/30 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                active
                  ? "bg-yellow-400/10 text-yellow-400"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-xl bg-yellow-400/10"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <item.icon size={18} className="flex-shrink-0 relative z-10" />
              {(!collapsed || mobile) && (
                <span className="text-sm font-medium relative z-10 flex-1">{item.label}</span>
              )}
              {(!collapsed || mobile) && item.badge && (
                <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 text-[10px] relative z-10">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-white/5 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
          <Settings size={18} />
          {(!collapsed || mobile) && <span className="text-sm font-medium">Configurações</span>}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all">
          <LogOut size={18} />
          {(!collapsed || mobile) && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#080a14] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/70 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-4 border-b border-white/5 bg-[#0a0c18]/80 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-white/50 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-white text-base">
              {navItems.find(
                (n) => n.path === location.pathname || (n.path !== "/admin" && location.pathname.startsWith(n.path))
              )?.label ?? "Admin"}
            </h1>
            <p className="text-white/40 text-xs mt-0.5">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-star flex items-center justify-center">
                <span className="text-xs font-black text-[#0d0f1a]">SA</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-white text-xs font-semibold">Super Admin</p>
                <p className="text-white/40 text-[10px]">admin@fan.bet</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
