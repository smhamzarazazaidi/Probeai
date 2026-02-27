import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BrainCircuit, Mail, Lock, Chrome, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../context/NotificationContext';

export default function Login() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { notify } = useNotifications();

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { name } }
                });
                if (error) throw error;
                notify('Check your email for the confirmation link.', 'info');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                notify('Signed in successfully.', 'success');
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
            notify('Authentication failed. Please check your details.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard'
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row overflow-hidden">
            {/* Visual Side */}
            <div className="hidden md:flex flex-1 relative bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-emerald-500/10 blur-[150px] rounded-full" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-500/10 blur-[150px] rounded-full" />
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="size-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-black mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                    >
                        <BrainCircuit className="size-10" />
                    </motion.div>
                    <h1 className="text-5xl font-bold tracking-tight mb-6">
                        The future of <span className="text-emerald-500 font-serif italic">insight</span> synthesis.
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                        Join thousands of product leaders using AI to turn raw conversations into strategic leverage.
                    </p>

                    <div className="mt-12 space-y-4">
                        {[
                            { icon: Sparkles, text: "Advanced Gemini 1.5 Probing" },
                            { icon: Chrome, text: "Seamless Google Integration" },
                            { icon: Lock, text: "Enterprise-grade Auth via Supabase" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-3 text-gray-500 dark:text-gray-400"
                            >
                                <item.icon className="size-4 text-emerald-500/80" />
                                <span className="text-sm font-medium">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 relative">
                <div className="w-full max-w-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-3xl font-bold mb-2">
                            {isSignUp ? 'Create account' : 'Welcome back'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {isSignUp ? 'Start your research journey' : 'Resume your insight extraction'}
                        </p>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-xl transition-all"
                        >
                            <Chrome className="size-5" />
                            Continue with Google
                        </button>

                        <div className="relative py-4 flex items-center gap-4">
                            <div className="h-px bg-white/5 flex-1" />
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">or email</span>
                            <div className="h-px bg-white/5 flex-1" />
                        </div>

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            {isSignUp && (
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-600 dark:text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 dark:text-gray-400 focus:border-emerald-500/50 outline-none transition-all"
                                    />
                                </div>
                            )}
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-600 dark:text-gray-400" />
                                <input
                                    required
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 dark:text-gray-400 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-600 dark:text-gray-400" />
                                <input
                                    required
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 dark:text-gray-400 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group mt-6"
                            >
                                {loading ? <Loader2 className="size-5 animate-spin" /> : (
                                    <>
                                        <span>{isSignUp ? 'Create account' : 'Sign in'}</span>
                                        <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-8">
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-400 transition-colors"
                            >
                                {isSignUp ? 'Already have an account? Sign in' : 'Don\'t have an account? Sign up'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                    Protected by Supabase Encryption
                </div>
            </div>
        </div>
    );
}
