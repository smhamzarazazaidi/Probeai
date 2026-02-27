import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Sparkles,
  Trash2,
  ChevronRight,
  MessageCircle,
  BarChart3,
  ListOrdered,
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Survey, Question } from '../types';

export default function Setup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSurveyData();
  }, [id]);

  const fetchSurveyData = async () => {
    try {
      const [surveyRes, questionsRes] = await Promise.all([
        fetch(`/api/surveys/${id}`),
        fetch(`/api/surveys/${id}/questions`)
      ]);

      const surveyData = await surveyRes.json();
      const questionsData = await questionsRes.json();

      setSurvey(surveyData.data);
      setQuestions(questionsData.data);
    } catch (error) {
      console.error('Failed to fetch survey data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/surveys/${id}/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: '' })
      });
      const { data, error } = await res.json();
      if (error) throw new Error(error);
      setQuestions(data);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      alert('AI generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleLaunch = async () => {
    try {
      const res = await fetch(`/api/surveys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COLLECTING' })
      });
      if (res.ok) {
        navigate(`/survey/${id}/collect`);
      }
    } catch (error) {
      console.error('Failed to launch survey:', error);
    }
  };

  const updateQuestionText = (qId: string, text: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, text } : q));
  };

  const deleteQuestion = (qId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== qId));
    // In a real app, you'd also delete on backend or save all at once
  };

  const addManualQuestion = () => {
    const newQ: Question = {
      id: Math.random().toString(36).substr(2, 9),
      survey_id: id!,
      text: '',
      type: 'OPEN',
      category: 'manual',
      order_index: questions.length,
      options: null,
      parent_question_id: null
    };
    setQuestions([...questions, newQ]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="size-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black">
              <Sparkles className="size-5" />
            </div>
            <h1 className="font-semibold text-lg truncate max-w-[200px] md:max-w-md">
              {survey?.title || 'Draft Survey'}
            </h1>
          </div>
          <button
            onClick={handleLaunch}
            disabled={questions.length === 0}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-100 dark:bg-gray-700 disabled:text-gray-500 dark:text-gray-400 text-black px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2"
          >
            Launch Survey
            <ChevronRight className="size-4" />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Structure your Insight Engine</h2>
          <p className="text-gray-500 dark:text-gray-400">Review and refine the questions the AI will use to probe your respondents.</p>
        </div>

        {/* Generate Button Container */}
        {questions.length === 0 && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800/20"
          >
            <div className="size-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 font-bold text-2xl">
              AI
            </div>
            <h3 className="text-xl font-semibold mb-2">No questions yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-sm">
              Let the AI architect the perfect interview flow based on your goals.
            </p>
            <button
              onClick={handleGenerateQuestions}
              className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
            >
              <Sparkles className="size-4" />
              Generate with AI
            </button>
          </motion.div>
        )}

        {/* Question List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {generating ? (
              // Skeleton Loader
              [1, 2, 3].map(i => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded-full mb-4" />
                  <div className="h-6 w-full bg-gray-100 dark:bg-gray-700 rounded-full" />
                </motion.div>
              ))
            ) : (
              questions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                        <Check className="size-3" />
                        {q.category}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="text-gray-600 dark:text-gray-400 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <textarea
                    value={q.text}
                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                    className="w-full bg-transparent text-lg font-medium border-none p-0 focus:ring-0 placeholder:text-zinc-700 resize-none"
                    rows={2}
                    placeholder="Type your question here..."
                  />

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                      {q.type === 'OPEN' && <MessageCircle className="size-3" />}
                      {q.type === 'SCALE' && <BarChart3 className="size-3" />}
                      {q.type === 'CHOICE' && <ListOrdered className="size-3" />}
                      {q.type}
                    </span>
                    {q.options && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                        {JSON.parse(q.options).length} options
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {questions.length > 0 && !generating && (
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={addManualQuestion}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                <Plus className="size-4" />
                Add manual question
              </button>
              <div className="h-4 w-px bg-gray-100 dark:bg-gray-700" />
              <button
                onClick={handleGenerateQuestions}
                className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 transition-colors text-sm font-medium"
              >
                <Sparkles className="size-4" />
                Regenerate all
              </button>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
