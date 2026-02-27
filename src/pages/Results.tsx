import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Award,
  Zap,
  Printer,
  Download,
  ArrowUpRight,
  MessageSquareQuote,
  Loader2,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'motion/react';
import { Analysis, Theme, PainPoint, Opportunity, ActionItem } from '../types';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function Results() {
  const { id } = useParams();
  const { session } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    fetchAnalysis();

    // Poll if not found (might be still analyzing)
    const interval = setInterval(() => {
      if (!analysis) fetchAnalysis();
    }, 5000);
    return () => clearInterval(interval);
  }, [id, session, analysis]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/surveys/${id}/analysis`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const body = await res.json();
      if (!res.ok || body?.error || !body?.data) {
        setAnalysis(null);
        setErrorMessage('No analysis is available yet. Make sure you have collected responses and triggered analysis from the Collect screen.');
        return;
      }
      setAnalysis(body.data);
      setErrorMessage(null);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      setErrorMessage('Unable to load analysis right now. Please try again in a moment.');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
        <Header />
        <div className="flex flex-col items-center justify-center p-6 text-center pt-40">
          <div className="relative size-40 mb-12">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="relative size-full border-4 border-emerald-500/10 border-t-emerald-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              <BrainCircuit className="size-20 text-emerald-500/50" />
            </motion.div>
          </div>
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-4 tracking-tight">Finalizing Synthesis</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-sm mx-auto">Gemini 1.5 Flash is currently distilling qualitative variables into actionable strategic vectors.</p>

          <div className="mt-12 flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="size-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
        <Header />
        <div className="flex flex-col items-center justify-center p-6 text-center pt-40 max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Analysis not ready</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6">
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  const themes: Theme[] = (analysis.themes as any) || [];
  const painPoints: PainPoint[] = (analysis.pain_points as any) || [];
  const opportunities: Opportunity[] = (analysis.opportunities as any) || [];
  const actionPlan: ActionItem[] = (analysis.action_plan as any) || [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0c0c0c] dark:text-white selection:bg-emerald-500/30">
      <Header />

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <nav className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 backdrop-blur-2xl sticky top-16 z-40 print:hidden hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black italic text-gray-600 dark:text-gray-400 uppercase tracking-[0.3em]">Strategic Report v2.0</span>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex gap-4">
              {['Summary', 'Themes', 'Action', 'Opportunity'].map(l => (
                <span key={l} className="text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:text-white transition-colors cursor-pointer uppercase tracking-widest">{l}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:bg-gray-700 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <Printer className="size-3.5" />
              Print
            </button>
            <button className="flex items-center gap-2 px-5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
              <Download className="size-3.5" />
              Export PDF
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 relative z-10">

        {/* Executive Summary */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[48px] p-8 lg:p-16 relative overflow-hidden backdrop-blur-xl shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
              <Target className="size-[500px] text-emerald-500" />
            </div>

            <div className="max-w-4xl relative z-10">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
                <Award className="size-3.5" />
                Executive Intelligence Brief
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-10 leading-[1.1] tracking-tight">
                Strategic <span className="text-emerald-500 italic font-serif">Synthesis.</span>
              </h1>
              <p className="text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {analysis.executive_summary}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-16 pt-16 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-4xl font-bold text-emerald-500 mb-2">{analysis.overall_sentiment.toFixed(1)}</div>
                <div className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-600 dark:text-gray-400">Sentiment Index</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-500 mb-2">{analysis.nps_score.toFixed(0)}</div>
                <div className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-600 dark:text-gray-400">Promoter Score</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-zinc-200 mb-2">{analysis.response_count}</div>
                <div className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-600 dark:text-gray-400">Neural Nodes</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-500 mb-2">100%</div>
                <div className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-600 dark:text-gray-400">Confidence</div>
              </div>
            </div>
          </motion.div>
        </section>

        <div className="grid lg:grid-cols-3 gap-12">

          {/* Themes Column */}
          <div className="lg:col-span-2 space-y-12">
            <h3 className="text-2xl font-bold flex items-center gap-4">
              <span className="size-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
                <Lightbulb className="size-5 text-amber-500" />
              </span>
              Extracted Themes
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {themes.map((theme, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 p-8 rounded-[32px] hover:border-gray-200 dark:border-gray-700 hover:bg-white dark:bg-gray-800/60 transition-all flex flex-col group shadow-xl"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="font-bold text-xl group-hover:text-amber-500 transition-colors">{theme.theme}</span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${theme.sentiment > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                      {theme.sentiment > 0 ? '+' : ''}{theme.sentiment.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 flex-grow">{theme.summary}</p>
                  <div className="space-y-4">
                    {theme.quotes.map((quote, qi) => (
                      <div key={qi} className="text-xs italic text-gray-500 dark:text-gray-400 flex gap-3 leading-relaxed">
                        <MessageSquareQuote className="size-4 shrink-0 text-zinc-800" />
                        "{quote}"
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Opportunities */}
            <h3 className="text-2xl font-bold flex items-center gap-4 pt-12">
              <span className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/10 shadow-lg shadow-emerald-500/5">
                <Zap className="size-5 text-emerald-500" />
              </span>
              Strategic Opportunities
            </h3>
            <div className="space-y-6">
              {opportunities.map((opp, i) => (
                <div key={i} className="group bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10 p-8 rounded-[40px] flex flex-col md:flex-row items-start md:items-center gap-8 hover:bg-emerald-500/[0.07] transition-all">
                  <div className="size-16 rounded-[20px] bg-white dark:bg-gray-800 border border-emerald-500/20 dark:border-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-xl">
                    <TrendingUp className="size-8" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-2xl mb-2 group-hover:translate-x-1 transition-transform">{opp.opportunity}</div>
                    <div className="flex gap-4 mb-4">
                      <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[9px] font-black uppercase tracking-widest text-emerald-500/60 font-mono">Impact: {opp.impact}</span>
                      <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[9px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 font-mono">Effort: {opp.effort}</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 italic text-sm">"{opp.evidence}"</p>
                  </div>
                  <div className="size-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-emerald-500 text-black">
                    <ArrowUpRight className="size-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Pain Points & Actions */}
          <div className="space-y-12">
            <h3 className="text-2xl font-bold flex items-center gap-4">
              <span className="size-10 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
                <AlertCircle className="size-5 text-red-500" />
              </span>
              Friction Vectors
            </h3>
            <div className="space-y-6">
              {painPoints.map((point, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-[32px] backdrop-blur-md">
                  <div className="flex justify-between items-start mb-4 text-lg font-bold">
                    <span className="flex-1 pr-4">{point.point}</span>
                    <span className="text-red-500 font-mono font-black text-xs uppercase">SEV {point.severity}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${point.severity * 10}%` }} className="h-full bg-red-500" />
                  </div>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400 font-bold block mb-1 uppercase text-[9px] tracking-widest">Observable Evidence</span>
                    "{point.evidence}"
                  </p>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-bold flex items-center gap-4 pt-12">
              <span className="size-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
                <CheckCircle2 className="size-5 text-blue-500" />
              </span>
              Action Roadmap
            </h3>
            <div className="space-y-6 relative">
              <div className="absolute left-[23px] top-12 bottom-12 w-px bg-white/5" />
              {actionPlan.map((item, i) => (
                <div key={i} className="relative z-10 flex gap-6">
                  <div className="size-12 rounded-[18px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-black text-blue-500 shrink-0 shadow-lg">
                    {i + 1}
                  </div>
                  <div className="pt-2">
                    <div className="font-bold text-lg mb-1">{item.action}</div>
                    <div className="text-[9px] font-black uppercase text-blue-500/50 tracking-[0.2em] mb-3">Priority: {item.priority}</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium italic">"{item.rationale}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .min-h-screen { background: white !important; }
          section, div, main { border-color: #ddd !important; box-shadow: none !important; color: black !important; }
          .bg-emerald-500 { background-color: #10b981 !important; color: white !important; }
          .text-gray-500 dark:text-gray-400, .text-gray-500 dark:text-gray-400, .text-gray-700 dark:text-gray-300 { color: #333 !important; }
          nav, header, .print\\:hidden { display: none !important; }
          button { display: none !important; }
          h1, h2, h3, .font-bold { color: black !important; }
          .bg-white dark:bg-gray-800\\/50, .bg-white dark:bg-gray-800\\/40, .bg-white dark:bg-gray-800 { background: white !important; border: 1px solid #ddd !important; }
          .rounded-[48px], .rounded-[32px], .rounded-[40px] { border-radius: 12px !important; }
        }
      `}</style>
    </div>
  );
}
