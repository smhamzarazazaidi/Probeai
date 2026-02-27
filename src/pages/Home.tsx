import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  Zap,
  Target,
  Shield,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white selection:bg-emerald-500/30 overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full opacity-50" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Sparkles className="size-3" />
            Introducing Insight Engine 2.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-8xl font-bold tracking-tight mb-8 leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
          >
            Conversations that <br />
            <span className="text-emerald-500 font-serif italic italic-shadow">actually</span> scale.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl lg:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Stop guessing. Our autonomous AI interviewers depth-probe your users 24/7 to uncover strategic patterns you actually want to see.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg transition-all shadow-[0_0_40px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 group"
            >
              Start Extracting Insights
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-white font-bold text-lg hover:bg-gray-100 dark:bg-gray-700 transition-all">
              Watch Demo Flow
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BrainCircuit,
                title: "Autonomous Probing",
                desc: "Gemini 1.5 Flash picks up on vague answers and drills down automatically."
              },
              {
                icon: Target,
                title: "Precision Targeting",
                desc: "Define your audience and let our AI handle the rest of the context setting."
              },
              {
                icon: Zap,
                title: "Instant Synthesis",
                desc: "Get strategic reports with prioritized action plans in seconds, not weeks."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[32px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-500/20 dark:border-emerald-500/10 transition-all group"
              >
                <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="size-6" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="py-20 px-6 text-center">
        <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-12">Trusted by 200+ product teams</p>
        <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all pointer-events-none">
          <div className="text-2xl font-black">FORREST</div>
          <div className="text-2xl font-black">VELOX</div>
          <div className="text-2xl font-black">INSIGHT</div>
          <div className="text-2xl font-black">NEXUS</div>
          <div className="text-2xl font-black">STRATOS</div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto rounded-[48px] bg-gradient-to-br from-emerald-500 to-emerald-700 p-12 lg:p-24 text-center text-black overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-8 relative z-10 leading-none">
            Scale your <span className="italic">curiosity.</span>
          </h2>
          <p className="text-xl lg:text-2xl text-black/70 font-medium mb-12 max-w-xl mx-auto relative z-10">
            Join the elite teams who have replaced static surveys with conversational intelligence.
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="relative z-10 px-10 py-5 bg-black text-white rounded-2xl font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            Build your first Engine
          </button>
        </div>
      </section>

      <footer className="py-12 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400 font-medium">
        <p>© 2026 Insight Engine AI. Built for the future of research.</p>
      </footer>
    </div>
  );
}
