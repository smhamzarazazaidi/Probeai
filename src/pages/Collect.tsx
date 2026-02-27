import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Copy,
  Share2,
  Users,
  CheckCircle,
  Clock,
  Activity,
  BarChart2,
  Zap,
  ArrowRight,
  ExternalLink,
  Loader2,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Survey } from '../types';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function Collect() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [survey, setSurvey] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, completion_rate: 0, avg_minutes: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetchInitialData();

    const socket = io();
    socket.emit('join_survey', id);

    socket.on('session_started', (data: any) => {
      addActivity({ type: 'start', ...data });
      refreshStats();
    });

    socket.on('new_response', (data: any) => {
      addActivity({ type: 'response', ...data });
    });

    socket.on('session_completed', (data: any) => {
      addActivity({ type: 'complete', ...data });
      refreshStats();
    });

    socket.on('analysis_ready', () => {
      navigate(`/survey/${id}/results`);
    });

    return () => { socket.disconnect(); };
  }, [id, session]);

  const fetchInitialData = async () => {
    try {
      const res = await fetch(`/api/surveys/${id}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const { data } = await res.json();
      setSurvey(data);
      refreshStats();
    } catch (error) {
      console.error('Failed to fetch survey:', error);
    }
  };

  const refreshStats = async () => {
    try {
      // In Supabase version, we can calculate from the object returned or hit another endpoint
      // For simplicity, let's stick to the endpoint or derive from sessions
      const res = await fetch(`/api/surveys/${id}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const { data } = await res.json();
      if (data) {
        // Calculate basic stats manually if needed, or use a dedicated view
        setStats({
          total: data.sessions?.count || 0,
          completed: 0, // Placeholder until detailed stats added
          completion_rate: 0,
          avg_minutes: 0
        });
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  const addActivity = (act: any) => {
    setActivities(prev => [
      { id: Math.random(), timestamp: new Date(), ...act },
      ...prev.slice(0, 19)
    ]);
  };

  const handleCopy = () => {
    const url = `${window.location.origin}/s/${survey?.share_token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyse = async () => {
    setAnalyzing(true);
    try {
      await fetch(`/api/surveys/${id}/analyse`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalyzing(false);
    }
  };

  if (!survey) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Loader2 className="size-8 text-emerald-500 animate-spin" />
    </div>
  );

  const shareUrl = `${window.location.origin}/s/${survey.share_token}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <Header />

      {/* Background radial */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05)_0%,transparent_50%)] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Left Side: Stats & Share */}
          <div className="flex-1 space-y-8">
            <header>
              <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold uppercase tracking-widest mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Collection Active
              </div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                {survey.title}
              </h1>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Logs', value: stats.total, icon: Users, color: 'emerald' },
                { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'blue' },
                { label: 'Completion', value: `${stats.completion_rate}%`, icon: Activity, color: 'purple' },
                { label: 'Avg Time', value: `${stats.avg_minutes}m`, icon: Clock, color: 'amber' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl backdrop-blur-sm">
                  <stat.icon className={`size-5 mb-4 text-${stat.color}-500`} />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Share Card */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/10 rounded-[32px] p-8 lg:p-10">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-8 w-full">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Engage your audience</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Deploy your AI researcher via the strategic link or QR.</p>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 bg-black/40 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 font-mono text-sm text-gray-500 dark:text-gray-400 truncate shadow-inner">
                      {shareUrl}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="bg-gray-100 dark:bg-gray-700 hover:bg-zinc-700 text-white px-5 py-4 rounded-2xl transition-all relative overflow-hidden"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div key="check" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}>
                            <CheckCircle className="size-5 text-emerald-500" />
                          </motion.div>
                        ) : (
                          <motion.div key="copy" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}>
                            <Copy className="size-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: survey.title, url: shareUrl });
                        }
                      }}
                      className="flex-1 bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Share2 className="size-4" />
                      More Options
                    </button>
                    <a
                      href={shareUrl}
                      target="_blank"
                      className="size-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center hover:bg-gray-100 dark:bg-gray-700 transition-all"
                    >
                      <ExternalLink className="size-5" />
                    </a>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform hidden md:block">
                  <img src={qrUrl} alt="QR Code" className="size-40" />
                </div>
              </div>
            </div>

            {/* Trigger Analysis */}
            <div className="pt-8">
              <button
                disabled={stats.total === 0 || analyzing}
                onClick={handleAnalyse}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 disabled:from-zinc-900 disabled:to-zinc-900 disabled:text-gray-600 dark:text-gray-400 text-white font-bold py-6 rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                {analyzing ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="size-6 animate-spin" />
                    <span className="text-lg">Synthesizing Qualitative Data...</span>
                  </div>
                ) : (
                  <>
                    <BrainCircuit className="size-6" />
                    <span className="text-xl">Generate AI Insights</span>
                    <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              <p className="text-center text-gray-600 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-6">
                Recommended quorum: 5+ responses for high density analysis
              </p>
            </div>
          </div>

          {/* Right Side: Activity Feed */}
          <div className="w-full lg:w-[450px]">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[40px] h-full flex flex-col p-10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <BarChart2 className="size-5 text-emerald-500" />
                  Live Stream
                </h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-lg font-bold uppercase tracking-widest border border-emerald-500/20 dark:border-emerald-500/10">Active</span>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
                <AnimatePresence initial={false}>
                  {activities.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20 border border-gray-200 dark:border-gray-700 border-dashed rounded-3xl">
                      <Activity className="size-12 mb-4 animate-pulse" />
                      <p className="text-sm font-bold uppercase tracking-widest">Awaiting interaction</p>
                    </div>
                  ) : (
                    activities.map((act) => (
                      <motion.div
                        key={act.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-5 items-start relative group"
                      >
                        <div className={`mt-1 size-10 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-lg ${act.type === 'complete' ? 'bg-emerald-500 text-black' :
                            act.type === 'response' ? 'bg-gray-100 dark:bg-gray-700 text-emerald-500 border border-emerald-500/20 dark:border-emerald-500/10' :
                              'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                          }`}>
                          {act.respondent_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="text-[15px] leading-tight text-gray-700 dark:text-gray-300">
                            <span className="font-bold text-white pr-1.5">{act.respondent_name || 'Anonymous'}</span>
                            {act.type === 'start' && 'joined the chamber'}
                            {act.type === 'response' && `replied to ${act.question_category || 'probing'}`}
                            {act.type === 'complete' && 'completed the study'}
                          </p>
                          <span className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest mt-2 block">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Analyzing Overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-[50px] flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative size-56 mb-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-emerald-500/20 dark:border-emerald-500/10 border-t-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 m-4">
                <BrainCircuit className="size-20 text-emerald-500 animate-pulse" />
              </div>
            </div>

            <h2 className="text-5xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">Synthesizing Strategy</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xl font-medium max-w-lg mx-auto leading-relaxed">
              Gemini 1.5 is performing a multi-vector qualitative analysis across all captured respondent sessions.
            </p>

            <div className="mt-16 flex flex-col items-center gap-4">
              <div className="flex gap-2">
                {[Array(5)].map((_, i) => (
                  <div key={i} className="size-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <span className="text-xs font-black text-zinc-700 uppercase tracking-[0.4em]">Pattern Recognition Active</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
