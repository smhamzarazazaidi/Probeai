import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, X, Bell, Plus, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const navigate = useNavigate();
  const { sign_out, user, isAuthenticated } = useAuth();
  const { notifications } = useNotifications();
  const unreadCount = notifications.length;

  const handleSignOut = async () => {
    await sign_out();
    setIsMenuOpen(false);
    navigate('/');
  };

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 
      flex items-center justify-between px-6 lg:px-8 py-4
      bg-white/80 dark:bg-black/80 backdrop-blur-xl
      border-b border-gray-200 dark:border-white/10 transition-colors duration-300">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-[#00C37A] 
          flex items-center justify-center group-hover:scale-105 transition-transform">
          <span className="text-white dark:text-black font-black text-sm">PA</span>
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-lg">ProbeAI</span>
        <span className="text-[10px] text-[#00C37A] border border-[#00C37A]/30 
          rounded-full px-2 py-0.5 ml-1 font-bold">BETA</span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">Platform</Link>
        <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')} className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">Intelligence</button>
        <button onClick={() => navigate(isAuthenticated ? '/settings' : '/login')} className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">Case Studies</button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {isAuthenticated && (
          <>
            <button onClick={() => navigate('/survey/new')} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full
              bg-[#00C37A] hover:bg-[#00a866] text-white dark:text-black font-bold text-sm
              transition-all duration-200 hover:scale-105">
              <Plus size={16} className="text-current" /> New Flow
            </button>

            {/* Notification icon */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10
                flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition text-gray-600 dark:text-gray-300"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#00C37A] text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-3 w-80 max-h-80 overflow-y-auto bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-[120] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-100 dark:border-white/5">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.18em]">Notifications</p>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {unreadCount === 0 ? 'No activity yet' : `${unreadCount} event${unreadCount === 1 ? '' : 's'}`}
                      </span>
                    </div>
                    {unreadCount === 0 ? (
                      <p className="text-xs text-gray-500 px-2 pt-2">You’ll see form events here as you work.</p>
                    ) : (
                      notifications
                        .slice(-6)
                        .reverse()
                        .map(n => (
                          <div
                            key={n.id}
                            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 ${n.type === 'success'
                                ? 'bg-[#00C37A]/10 border border-[#00C37A]/30 text-[#00a866] dark:text-[#00C37A]'
                                : n.type === 'error'
                                  ? 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
                                  : 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300'
                              }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span className="flex-1">{n.message}</span>
                          </div>
                        ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Account Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 rounded-full bg-gradient-to-br 
            from-[#00C37A] to-emerald-700
            flex items-center justify-center text-white dark:text-black font-bold text-sm
            hover:scale-105 transition-transform overflow-hidden shadow-sm"
          >
            {isAuthenticated ? (
              user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="User" className="size-full object-cover" />
              ) : (
                getInitials(user?.email || '')
              )
            ) : (
              isMenuOpen ? <X size={16} /> : <User size={16} />
            )}
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-4 w-56 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                >
                  {!isAuthenticated ? (
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-900 dark:text-white bg-[#00C37A]/10 hover:bg-[#00C37A]/20 rounded-xl transition-colors font-bold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="size-4 text-[#00C37A]" />
                      Sign In / Sign Up
                    </Link>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 mb-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Account</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="size-4 text-[#00C37A]" />
                        Control Center
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="size-4 text-blue-500" />
                        Preferences
                      </Link>
                      <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-2" />
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium"
                        onClick={handleSignOut}
                      >
                        <LogOut className="size-4" />
                        Strategic Sign Out
                      </button>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
