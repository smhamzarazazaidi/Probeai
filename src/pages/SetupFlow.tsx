import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Plus,
    Sparkles,
    Trash2,
    ChevronRight,
    ChevronLeft,
    MessageCircle,
    BarChart3,
    ListOrdered,
    Loader2,
    Check,
    Shield,
    Users,
    Settings,
    Target,
    Zap,
    Info,
    Smartphone,
    Calendar,
    MapPin,
    Briefcase,
    Building,
    Radio,
    Type,
    Star,
    ArrowUpCircle,
    Edit3,
    X,
    GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Question } from '../types';

export default function SetupFlow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { session } = useAuth();
    const { notify } = useNotifications();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1 Data
    const [formData, setFormData] = useState({
        title: '',
        goal: '',
        target_audience: '',
        context: ''
    });

    // Step 2 Data
    const [respondentFields, setRespondentFields] = useState<any[]>([
        { label: 'Full Name', field_type: 'text', is_required: true, always_on: true },
        { label: 'Email Address', field_type: 'email', is_required: true, always_on: true }
    ]);
    const [customFieldLabel, setCustomFieldLabel] = useState('');
    const [customFieldType, setCustomFieldType] = useState('text');

    // Step 3 Data
    const [questions, setQuestions] = useState<Question[]>([]);
    const [qConfig, setQConfig] = useState({
        count: 7,
        customCount: 7,
        isCustomCount: false,
        types: ['OPEN', 'SCALE', 'CHOICE'],
        behavior: {
            follow_up: true,
            probe_negative: true,
            strictly_set: false
        }
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
    const [editIdx, setEditIdx] = useState<number | null>(null);

    useEffect(() => {
        if (id && id !== 'new') {
            fetchSurvey();
        }
    }, [id]);

    const fetchSurvey = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/surveys/${id}`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            const { data } = await res.json();
            if (data) {
                setFormData({
                    title: data.title || '',
                    goal: data.goal || '',
                    target_audience: data.target_audience || '',
                    context: data.context || ''
                });
                if (data.respondent_fields?.length > 0) {
                    setRespondentFields(data.respondent_fields);
                }
                if (data.questions?.length > 0) {
                    setQuestions(data.questions);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const isNew = !id || id === 'new';
            const url = isNew ? '/api/surveys' : `/api/surveys/${id}`;
            const method = isNew ? 'POST' : 'PATCH';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(formData)
            });
            const { data } = await res.json();

            if (isNew) {
                navigate(`/survey/${data.id}/setup`, { replace: true });
            }
            notify('Project details saved.', 'success');
            setStep(2);
        } catch (err) {
            console.error(err);
            notify('Failed to save project details.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStep2Submit = async () => {
        setLoading(true);
        try {
            await fetch(`/api/surveys/${id}/fields`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ fields: respondentFields })
            });
            notify('Onboarding fields saved.', 'success');
            setStep(3);
        } catch (err) {
            console.error(err);
            notify('Failed to save onboarding fields.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addCustomField = () => {
        if (!customFieldLabel) return;
        setRespondentFields([...respondentFields, {
            label: customFieldLabel,
            field_type: customFieldType,
            is_required: false
        }]);
        setCustomFieldLabel('');
    };

    const toggleField = (label: string) => {
        const exists = respondentFields.find(f => f.label === label);
        if (exists && !exists.always_on) {
            setRespondentFields(respondentFields.filter(f => f.label !== label));
        } else if (!exists) {
            setRespondentFields([...respondentFields, { label, field_type: 'text', is_required: false }]);
        }
    };

    const generateAIQuestions = async () => {
        setLoading(true);
        try {
            const count = qConfig.isCustomCount ? qConfig.customCount : qConfig.count;
            try {
                const res = await fetch(`/api/surveys/${id}/generate-questions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({ ...qConfig, count })
                });
                if (res.ok) {
                    const { data } = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setQuestions(data as Question[]);
                        return;
                    }
                }
            } catch (err) {
                console.error('API question generation failed, falling back locally:', err);
            }

            // Fallback: generate questions on the client so something always appears
            const safeCount = Number.isFinite(count as any) && count > 0 ? Math.min(count, 20) : 7;
            const goal = formData.goal || 'this product or experience';
            const templates = [
                `In your own words, what initially attracted you to ${goal}?`,
                `Can you walk me through the last time you engaged with ${goal}?`,
                `What specific problems were you hoping ${goal} would solve for you?`,
                `What, if anything, felt confusing or frustrating about ${goal}?`,
                `If you could change one thing about ${goal}, what would it be and why?`,
                `How does ${goal} compare to other options you’ve tried?`,
                `What would make you excited to recommend ${goal} to a friend or colleague?`,
                `What almost stopped you from trying or continuing with ${goal}?`,
                `What’s the biggest value you feel you’ve gotten from ${goal} so far?`,
                `Imagine we’re meeting again in six months—what would need to be true for you to say ${goal} was a success?`
            ];

            const localGenerated: Question[] = Array.from({ length: safeCount }).map((_, index) => ({
                id: `${index}`,
                survey_id: id || '',
                text: templates[index] || templates[templates.length - 1],
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

            setQuestions(localGenerated);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const saveQuestions = async (isDraft = false) => {
        setLoading(true);
        try {
            await fetch(`/api/surveys/${id}/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ questions })
            });
            if (!isDraft) {
                notify('Survey launched and ready to collect.', 'success');
                launchSurvey();
            } else {
                // Ensure status stays DRAFT and return to dashboard
                await fetch(`/api/surveys/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({ status: 'DRAFT' })
                });
                notify('Questions saved as draft.', 'success');
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            notify('Failed to save questions.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const launchSurvey = async () => {
        setLoading(true);
        try {
            await fetch(`/api/surveys/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ status: 'COLLECTING' })
            });
            navigate(`/survey/${id}/collect`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (q: Partial<Question> | null, idx: number | null) => {
        setEditingQuestion(q || {
            type: 'OPEN',
            text: '',
            category: 'general',
            options: [],
            scale_min_label: 'Not at all',
            scale_max_label: 'Absolutely',
            star_count: 5,
            is_required: false,
            allow_followup: true
        });
        setEditIdx(idx);
        setIsModalOpen(true);
    };

    const saveEditedQuestion = () => {
        if (!editingQuestion?.text) return;
        const newQs = [...questions];
        if (editIdx !== null) {
            newQs[editIdx] = editingQuestion as Question;
        } else {
            newQs.push(editingQuestion as Question);
        }
        setQuestions(newQs);
        setIsModalOpen(false);
        setEditingQuestion(null);
        setEditIdx(null);
    };

    const deleteQuestion = (idx: number) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const toggleQType = (type: string) => {
        const types = qConfig.types.includes(type)
            ? qConfig.types.filter(t => t !== type)
            : [...qConfig.types, type];
        setQConfig({ ...qConfig, types });
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
            <Header />

            <main className="max-w-5xl mx-auto px-6 pt-24 pb-20">

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between items-end mb-4">
                        <div className="space-y-1">
                            <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Step {step} of 3</span>
                            <h2 className="text-2xl font-bold">
                                {step === 1 && "Project Details"}
                                {step === 2 && "Respondent Configuration"}
                                {step === 3 && "Question Builder"}
                            </h2>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{Math.round((step / 3) * 100)}% Complete</span>
                    </div>
                    <div className="h-1.5 w-full bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: PROJECT DETAILS */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <form onSubmit={handleStep1Submit} className="space-y-8">
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[32px] p-8 lg:p-10 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Flow Name *</label>
                                        <input
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. FoodieApp Market Validation"
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 focus:border-emerald-500/50 outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">What is your primary goal? *</label>
                                        <textarea
                                            required
                                            value={formData.goal}
                                            onChange={e => setFormData({ ...formData, goal: e.target.value })}
                                            placeholder="e.g. Validate if busy professionals will pay $50/mo for healthy meal prep..."
                                            className="w-full h-32 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 focus:border-emerald-500/50 outline-none transition-all resize-none font-medium"
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Target Audience *</label>
                                            <input
                                                required
                                                value={formData.target_audience}
                                                onChange={e => setFormData({ ...formData, target_audience: e.target.value })}
                                                placeholder="e.g. Remote workers, 25-40"
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 focus:border-emerald-500/50 outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Additional Context</label>
                                            <input
                                                value={formData.context}
                                                onChange={e => setFormData({ ...formData, context: e.target.value })}
                                                placeholder="Optional details..."
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 focus:border-emerald-500/50 outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/20">
                                        Next: Respondent Info <ChevronRight className="size-5" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 2: RESPONDENT INFO */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[32px] p-8 lg:p-10 space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Onboarding Fields</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Select the data points you want to collect before the interview begins.</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Full Name', icon: Users, disabled: true },
                                        { label: 'Email Address', icon: MessageCircle, disabled: true },
                                        { label: 'Phone Number', icon: Smartphone, type: 'tel' },
                                        { label: 'Age Range', icon: Calendar, type: 'number' },
                                        { label: 'Location', icon: MapPin, type: 'text' },
                                        { label: 'Job Title', icon: Briefcase, type: 'text' },
                                        { label: 'Company Name', icon: Building, type: 'text' },
                                        { label: 'Referral Source', icon: Radio, type: 'select' },
                                    ].map((field) => {
                                        const isSelected = respondentFields.some(f => f.label === field.label);
                                        return (
                                            <button
                                                key={field.label}
                                                disabled={field.disabled}
                                                onClick={() => toggleField(field.label)}
                                                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all gap-3 relative ${isSelected
                                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:border-gray-700'
                                                    } ${field.disabled ? 'opacity-50 cursor-not-allowed border-emerald-500/20 dark:border-emerald-500/10' : ''}`}
                                            >
                                                <field.icon className="size-6" />
                                                <span className="text-xs font-bold leading-tight">{field.label}</span>
                                                {isSelected && <Check className="size-4 absolute top-2 right-2 text-emerald-500" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1 block mb-4">Add Custom Field</label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            value={customFieldLabel}
                                            onChange={e => setCustomFieldLabel(e.target.value)}
                                            placeholder="Field label..."
                                            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:border-emerald-500/50 outline-none"
                                        />
                                        <select
                                            value={customFieldType}
                                            onChange={e => setCustomFieldType(e.target.value)}
                                            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-500 dark:text-gray-400 focus:border-emerald-500/50 outline-none"
                                        >
                                            <option value="text">Text Input</option>
                                            <option value="number">Number</option>
                                            <option value="select">Selection</option>
                                        </select>
                                        <button
                                            onClick={addCustomField}
                                            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-zinc-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap"
                                        >
                                            <Plus className="size-4" /> Add Field
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button onClick={() => setStep(1)} className="px-8 py-4 text-gray-500 dark:text-gray-400 font-bold flex items-center gap-2 hover:text-white transition-colors">
                                    <ChevronLeft className="size-5" /> Back
                                </button>
                                <button onClick={handleStep2Submit} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/20">
                                    Next: Question Setup <ChevronRight className="size-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: QUESTION BUILDER */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* AI GENERATION PANEL */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[40px] p-8 lg:p-12 space-y-8 relative overflow-hidden backdrop-blur-xl">
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                    <Sparkles className="size-48 text-emerald-500" />
                                </div>

                                <div className="relative z-10 flex flex-col md:flex-row gap-12">
                                    <div className="flex-1 space-y-8">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/10">
                                                    <Sparkles className="size-5 text-emerald-500" />
                                                </div>
                                                AI Insight Generation
                                            </h3>
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Question Density</label>
                                                    <div className="flex flex-wrap gap-3">
                                                        {[5, 7, 10, 12].map(n => (
                                                            <button
                                                                key={n}
                                                                onClick={() => setQConfig({ ...qConfig, count: n, isCustomCount: false })}
                                                                className={`px-6 py-3 rounded-2xl border font-black transition-all text-sm ${!qConfig.isCustomCount && qConfig.count === n ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:border-gray-700'}`}
                                                            >
                                                                {n}
                                                            </button>
                                                        ))}
                                                        <button
                                                            onClick={() => setQConfig({ ...qConfig, isCustomCount: true })}
                                                            className={`px-6 py-3 rounded-2xl border font-black transition-all text-sm ${qConfig.isCustomCount ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
                                                        >
                                                            Custom
                                                        </button>
                                                        {qConfig.isCustomCount && (
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="20"
                                                                value={qConfig.customCount}
                                                                onChange={e => setQConfig({ ...qConfig, customCount: parseInt(e.target.value) || 1 })}
                                                                className="w-20 bg-gray-50 dark:bg-gray-900 border border-emerald-500/50 rounded-2xl p-3 text-center text-sm font-bold outline-none"
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Active Modalities</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            { id: 'OPEN', label: 'Open Ended', icon: Type },
                                                            { id: 'SCALE', label: 'Scale (1-10)', icon: BarChart3 },
                                                            { id: 'CHOICE', label: 'Multiple Choice', icon: ListOrdered },
                                                            { id: 'YES_NO', label: 'Yes / No', icon: Radio },
                                                            { id: 'STAR_RATING', label: 'Star Rating', icon: Star },
                                                            { id: 'RANKING', label: 'Ranking', icon: ArrowUpCircle }
                                                        ].map(t => (
                                                            <button
                                                                key={t.id}
                                                                onClick={() => toggleQType(t.id)}
                                                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${qConfig.types.includes(t.id)
                                                                    ? 'bg-gray-100 dark:bg-gray-700 border-white/20 text-white'
                                                                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                                                    }`}
                                                            >
                                                                <div className={`p-2 rounded-lg ${qConfig.types.includes(t.id) ? 'bg-emerald-500 text-black' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                                                                    <t.icon className="size-4" />
                                                                </div>
                                                                <span className="text-xs font-bold">{t.label}</span>
                                                                {qConfig.types.includes(t.id) && <Check className="size-4 ml-auto text-emerald-500" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={generateAIQuestions}
                                                    disabled={loading}
                                                    className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-[24px] font-black flex items-center justify-center gap-3 transition-all group shadow-2xl shadow-emerald-500/20 active:scale-[0.98]"
                                                >
                                                    {loading ? <Loader2 className="size-6 animate-spin" /> : (
                                                        <>
                                                            <Zap className="size-6" />
                                                            <span>🤖 GENERATE WITH INTELLIGENCE</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-px bg-white/5 hidden md:block" />

                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-bold">Manual Architect</h3>
                                            <button
                                                onClick={() => openEditModal(null, null)}
                                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-zinc-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                                            >
                                                <Plus className="size-3.5" /> ADD CUSTOM
                                            </button>
                                        </div>

                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                            {questions.length === 0 ? (
                                                <div className="h-[300px] rounded-[32px] border border-gray-200 dark:border-gray-700 border-dashed flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 gap-4">
                                                    <div className="size-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-zinc-800">
                                                        <MessageCircle className="size-8" />
                                                    </div>
                                                    <p className="text-sm font-bold italic">No questions engineered yet.</p>
                                                </div>
                                            ) : (
                                                questions.map((q, i) => (
                                                    <motion.div
                                                        layout
                                                        key={i}
                                                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5 rounded-[24px] group relative hover:border-emerald-500/30 transition-all shadow-xl"
                                                    >
                                                        <div className="flex justify-between items-start gap-4 mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <GripVertical className="size-4 text-zinc-800 cursor-grab" />
                                                                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase">Q{i + 1}</span>
                                                            </div>
                                                            <div className="flex gap-1.5">
                                                                <button
                                                                    onClick={() => openEditModal(q, i)}
                                                                    className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                                                >
                                                                    <Edit3 className="size-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteQuestion(i)}
                                                                    className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-zinc-200 font-medium leading-relaxed mb-4">{q.text}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                                                {q.type}
                                                            </span>
                                                            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                                                {q.category}
                                                            </span>
                                                            {q.is_required && (
                                                                <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest">Required</span>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button onClick={() => setStep(2)} className="px-8 py-4 text-gray-500 dark:text-gray-400 font-bold flex items-center gap-2 hover:text-white transition-colors">
                                    <ChevronLeft className="size-5" /> Back
                                </button>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => saveQuestions(true)}
                                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                                    >
                                        Save as Draft
                                    </button>
                                    <button
                                        onClick={() => saveQuestions(false)}
                                        disabled={questions.length === 0}
                                        className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-100 dark:bg-gray-700 disabled:text-gray-600 dark:text-gray-400 text-black font-bold rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                    >
                                        Launch Survey 🚀
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* EDIT/ADD MODAL */}
                <AnimatePresence>
                    {isModalOpen && editingQuestion && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                onClick={() => setIsModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[40px] shadow-2xl overflow-hidden"
                            >
                                <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 backdrop-blur-xl">
                                    <h3 className="text-2xl font-bold flex items-center gap-3">
                                        <Edit3 className="size-6 text-emerald-500" />
                                        {editIdx !== null ? 'Edit Engineering' : 'New Strategic Q'}
                                    </h3>
                                    <button onClick={() => setIsModalOpen(false)} className="size-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-white transition-colors">
                                        <X className="size-6" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    {/* Question Type */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Modal Type</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {[
                                                { id: 'OPEN', label: 'Open Ended', desc: 'Free text responses', icon: Type },
                                                { id: 'SCALE', label: 'Scale (1-10)', desc: 'Satisfaction index', icon: BarChart3 },
                                                { id: 'CHOICE', label: 'Choice', desc: 'Single selection', icon: ListOrdered },
                                                { id: 'YES_NO', label: 'Yes / No', desc: 'Binary decision', icon: Radio },
                                                { id: 'STAR_RATING', label: 'Star Rating', desc: 'Visual 1-5 rank', icon: Star },
                                                { id: 'RANKING', label: 'Ranking', desc: 'Priority sort', icon: ArrowUpCircle }
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setEditingQuestion({ ...editingQuestion, type: t.id as any })}
                                                    className={`p-4 rounded-2xl border flex flex-col items-start gap-2 transition-all ${editingQuestion.type === t.id ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
                                                >
                                                    <t.icon className="size-5" />
                                                    <div className="text-left">
                                                        <div className="text-xs font-black uppercase">{t.id}</div>
                                                        <div className="text-[9px] opacity-60 font-medium">{t.desc}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Question Text */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Engine Query Text</label>
                                        <textarea
                                            value={editingQuestion.text}
                                            onChange={e => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                                            placeholder="What exactly should the AI ask?"
                                            className="w-full h-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 font-medium focus:border-emerald-500/50 outline-none transition-all resize-none"
                                        />
                                    </div>

                                    {/* Additional Logic: CHOICE/RANKING */}
                                    {(editingQuestion.type === 'CHOICE' || editingQuestion.type === 'RANKING') && (
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Selection Options</label>
                                            <div className="space-y-3">
                                                {(editingQuestion as any).options?.map((opt: string, oi: number) => (
                                                    <div key={oi} className="flex gap-2">
                                                        <input
                                                            value={opt}
                                                            onChange={e => {
                                                                const opts = [...(editingQuestion as any).options];
                                                                opts[oi] = e.target.value;
                                                                setEditingQuestion({ ...editingQuestion, options: opts });
                                                            }}
                                                            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm font-medium outline-none"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const opts = (editingQuestion as any).options.filter((_: any, idx: number) => idx !== oi);
                                                                setEditingQuestion({ ...editingQuestion, options: opts });
                                                            }}
                                                            className="p-3 bg-red-500/10 text-red-500 rounded-xl"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => setEditingQuestion({ ...editingQuestion, options: [...((editingQuestion as any).options || []), ''] })}
                                                    className="flex items-center gap-2 text-xs font-bold text-emerald-500 ml-1"
                                                >
                                                    <Plus className="size-4" /> Add Option
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* SCALE */}
                                    {editingQuestion.type === 'SCALE' && (
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">Min Label</label>
                                                <input
                                                    value={editingQuestion.scale_min_label || ''}
                                                    onChange={e => setEditingQuestion({ ...editingQuestion, scale_min_label: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl padding-4 p-3 text-xs outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">Max Label</label>
                                                <input
                                                    value={editingQuestion.scale_max_label || ''}
                                                    onChange={e => setEditingQuestion({ ...editingQuestion, scale_max_label: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Synthesis Category</label>
                                            <select
                                                value={editingQuestion.category}
                                                onChange={e => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm font-bold outline-none"
                                            >
                                                <option value="general">General</option>
                                                <option value="pain_point">Pain Point</option>
                                                <option value="behaviour">Behaviour</option>
                                                <option value="satisfaction">Satisfaction</option>
                                                <option value="opportunity">Opportunity</option>
                                                <option value="willingness_to_pay">Willingness to Pay</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">Directives</label>
                                            <div className="flex flex-col gap-3">
                                                <button
                                                    onClick={() => setEditingQuestion({ ...editingQuestion, is_required: !editingQuestion.is_required })}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${editingQuestion.is_required ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                                                >
                                                    {editingQuestion.is_required ? <Check className="size-3" /> : <div className="size-3" />}
                                                    Required Question
                                                </button>
                                                <button
                                                    onClick={() => setEditingQuestion({ ...editingQuestion, allow_followup: !editingQuestion.allow_followup })}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${editingQuestion.allow_followup ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                                                >
                                                    {editingQuestion.allow_followup ? <Check className="size-3" /> : <div className="size-3" />}
                                                    Proactive Probing
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-4">
                                    <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 rounded-2xl font-bold bg-white/5 hover:bg-white/10 transition-all">Cancel</button>
                                    <button
                                        onClick={saveEditedQuestion}
                                        className="px-10 py-3 rounded-2xl font-black bg-emerald-500 text-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                                    >
                                        ENGINEER QUESTION ✓
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
