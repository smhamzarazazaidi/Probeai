import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Send,
  User,
  Bot,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Survey, Question } from '../types';

interface Message {
  id: string;
  type: 'question' | 'answer' | 'typing';
  text: string;
  questionId?: string;
  category?: string;
}

export default function Respond() {
  const { token } = useParams();
  const [survey, setSurvey] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [session, setSession] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Respondent Form Data
  const [respondentData, setRespondentData] = useState<any>({});

  useEffect(() => {
    fetchSurvey();
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSurvey = async () => {
    try {
      const res = await fetch(`/api/surveys/token/${token}`);
      const { data, error } = await res.json();
      if (error) throw new Error(error);
      setSurvey(data);

      const s = io();
      s.emit('join_survey', data.id);
      setSocket(s);
    } catch (error) {
      console.error('Failed to fetch survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;
    setLoading(true);
    try {
      // Reset any previous conversation state
      setMessages([]);
      setCompleted(false);

      const { 'Full Name': name, 'Email Address': email, ...meta } = respondentData;

      const res = await fetch(`/api/surveys/${survey.id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondent_name: name,
          respondent_email: email,
          respondent_meta: meta
        })
      });
      const body = await res.json();
      if (!res.ok || body?.error) {
        console.error('Failed to start session:', body?.error);
        alert('Could not start the interview. Please try again in a moment.');
        return;
      }
      setSession({ id: body.data.session_id, name: name as string });

      let qs: Question[] = Array.isArray(survey.questions) ? survey.questions : [];
      if (!qs.length) {
        // Fallback: generate a simple question script from the survey goal
        const goal = survey.goal || 'this product or experience';
        const templates = [
          `To start, in your own words, what interested you most about ${goal}?`,
          `Can you describe the last time you used or thought about ${goal}?`,
          `What were you hoping ${goal} would help you achieve or change?`,
          `What, if anything, has been frustrating or confusing about ${goal}?`,
          `If you could improve one thing about ${goal}, what would it be and why?`
        ];

        qs = templates.map((text, index) => ({
          id: `${index}`,
          survey_id: survey.id,
          text,
          type: 'OPEN',
          category: 'general',
          options: null,
          order_index: index,
          scale_min: 1,
          scale_max: 10,
          scale_min_label: 'Not at all',
          scale_max_label: 'Absolutely',
          star_count: 5,
          is_required: false,
          allow_followup: true
        }));

        // Persist fallback in local survey state so handleSend can read it
        setSurvey((prev: any) => (prev ? { ...prev, questions: qs } : prev));
      }

      // Warm greeting before the first question
      setMessages([
        {
          id: Math.random().toString(36),
          type: 'question',
          text: `Thanks for joining! I’ll ask a few quick questions about your experience with ${survey.goal || 'this product'}. Take your time and be as honest as you like.`,
          category: 'INTRO'
        }
      ]);

      // Start with the first question
      showNextQuestion(0, qs);
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNextQuestion = async (index: number, questions = survey.questions) => {
    if (index >= questions.length) {
      completeSession();
      return;
    }

    const question = questions[index];
    setIsTyping(true);

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 1200));

    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: Math.random().toString(36),
      type: 'question',
      text: question.text,
      questionId: question.id,
      category: question.category
    }]);

    setCurrentQuestionIndex(index);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !session || !survey) return;

    const currentQuestion = survey.questions[currentQuestionIndex];
    const answer = inputValue.trim();
    setInputValue('');

    // Add user answer to chat
    setMessages(prev => [...prev, {
      id: Math.random().toString(36),
      type: 'answer',
      text: answer
    }]);

    try {
      // 1. Save response
      await fetch(`/api/surveys/${survey.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          question_id: currentQuestion.id,
          answer,
          category: currentQuestion.category
        })
      });

      // 2. Check for follow-up
      setIsTyping(true);
      const followupRes = await fetch(`/api/surveys/${survey.id}/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: currentQuestion.text,
          answer,
          survey_goal: survey.goal
        })
      });
      const { data } = await followupRes.json();

      if (data.should_follow_up && data.follow_up_question) {
        // AI Follow-up
        await new Promise(r => setTimeout(r, 1500));
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Math.random().toString(36),
          type: 'question',
          text: data.follow_up_question,
          category: 'PROBE'
        }]);
      } else {
        // Move to next original question
        showNextQuestion(currentQuestionIndex + 1);
      }
    } catch (error) {
      console.error('Error handling response:', error);
      setIsTyping(false);
    }
  };

  const completeSession = async () => {
    if (!session) return;
    try {
      await fetch(`/api/sessions/${session.id}/complete`, { method: 'PATCH' });
      setCompleted(true);
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  if (loading && !survey) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="size-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!survey) return <div className="p-20 text-center text-white">Survey not found.</div>;

  // Onboarding Screen
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#111111] dark:text-white flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Sparkle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-emerald-500/5 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 lg:p-12 rounded-[40px] shadow-2xl relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-6">
            <Sparkles className="size-3" /> Conversational AI
          </div>

          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/40 leading-tight">
            Help us understand <br />
            <span className="text-emerald-500 italic font-serif">your perspective.</span>
          </h1>

          <p className="text-gray-500 dark:text-gray-400 font-medium mb-10 leading-relaxed">
            {survey.title}. We're conducting a brief AI-led study.
            Estimated time: <span className="text-white font-bold">5 minutes</span>.
          </p>

          <form onSubmit={startSession} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {survey.respondent_fields?.map((field: any) => {
                const inputType =
                  ['text', 'email', 'number', 'tel'].includes(field.field_type)
                    ? field.field_type
                    : 'text';
                return (
                <div key={field.label} className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">{field.label} {field.is_required && '*'}</label>
                  <input
                    required={field.is_required}
                    type={inputType}
                    value={respondentData[field.label] || ''}
                    onChange={e => setRespondentData({ ...respondentData, [field.label]: e.target.value })}
                    placeholder={`Your ${field.label.toLowerCase()}...`}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all shadow-inner"
                  />
                </div>
              );})}
            </div>

            <button
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-100 dark:bg-gray-700 disabled:text-gray-600 dark:text-gray-400 text-black font-bold py-5 rounded-3xl transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-3 group mt-4 overflow-hidden"
            >
              {loading ? <Loader2 className="size-6 animate-spin" /> : (
                <>
                  <span className="text-lg">Begin Interaction</span>
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest pt-4">Secured by ProbeAI AI</p>
          </form>
        </motion.div>
      </div>
    );
  }

  // Completion Screen
  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white flex items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="size-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-8 border border-emerald-500/30">
            <CheckCircle2 className="size-14" />
          </div>
          <h1 className="text-5xl font-bold mb-6 italic font-serif">Strategic contribution complete.</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xl font-medium max-w-md mx-auto leading-relaxed">
            Thank you, {session.name}. Your insights have been successfully synthesized and routed to the researchers.
          </p>
          <div className="mt-16 h-1 w-64 mx-auto bg-white dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-1/2 h-full bg-emerald-500" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 text-gray-900 dark:bg-[#0c0c0c] dark:text-white flex flex-col">
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0c0c]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Bot className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Insight AI</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Active Synthesis</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
            <div className="flex justify-between w-full">
              <span className="text-[9px] font-black italic text-gray-600 dark:text-gray-400 uppercase tracking-tighter">Progress</span>
              <span className="text-[9px] font-bold text-emerald-500">{Math.round((currentQuestionIndex / (survey.questions?.length || 1)) * 100)}%</span>
            </div>
            <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${(currentQuestionIndex / (survey.questions?.length || 1)) * 100}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Optimized Chat Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pt-32 pb-40 overflow-y-auto no-scrollbar">
        <div className="space-y-10">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${message.type === 'answer' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[90%] ${message.type === 'answer' ? 'flex-row-reverse' : ''}`}>
                  <div className={`mt-1 size-9 rounded-2xl flex-shrink-0 flex items-center justify-center border shadow-sm ${message.type === 'answer'
                      ? 'bg-emerald-500 border-emerald-400 text-black'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-emerald-500'
                    }`}>
                    {message.type === 'answer' ? <User className="size-5" /> : <Bot className="size-5" />}
                  </div>

                  <div className={`p-5 rounded-[28px] text-[17px] leading-[1.6] shadow-xl ${message.type === 'answer'
                      ? 'bg-gray-100 dark:bg-gray-700 text-white rounded-tr-none border border-gray-200 dark:border-gray-700'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-zinc-200 rounded-tl-none backdrop-blur-sm'
                    }`}>
                    {message.category && (
                      <span className="text-[9px] font-black uppercase mb-1.5 block text-emerald-500/50 tracking-[0.2em]">
                        {message.category}
                      </span>
                    )}
                    <p className="font-medium whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex gap-4">
                  <div className="mt-1 size-9 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-emerald-500">
                    <Bot className="size-5" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-[24px] rounded-tl-none flex items-center gap-1.5">
                    <span className="size-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="size-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="size-2 bg-emerald-500 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Console */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/90 to-transparent">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            rows={1}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (socket) socket.emit('respondent_typing', survey.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Share your thoughts here..."
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[28px] p-6 pr-20 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all resize-none shadow-2xl font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center hover:scale-105 active:scale-95 disabled:scale-100 disabled:bg-gray-100 dark:bg-gray-700 disabled:text-zinc-700 transition-all shadow-lg shadow-emerald-500/20 group"
          >
            <Send className="size-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        <div className="text-center mt-4">
          <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">Neural Depth Engine v1.5</span>
        </div>
      </div>
    </div>
  );
}
