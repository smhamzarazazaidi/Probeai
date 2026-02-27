import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    MoreHorizontal,
    Share2,
    Users,
    Clock,
    Settings,
    Trash2,
    Pause,
    Play,
    BarChart2
} from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../lib/utils';
import { supabase } from '../lib/supabase';

// Status colors provided by the user
const statusColors: Record<string, any> = {
    COLLECTING: { bg: 'bg-[#00C37A]/10', text: 'text-[#00C37A]', dot: 'bg-[#00C37A]' },
    DRAFT: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500 dark:bg-yellow-400' },
    COMPLETED: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500 dark:bg-blue-400' },
    ANALYSING: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500 dark:bg-purple-400' },
};

export default function Dashboard() {
    const { user, session } = useAuth();
    const [surveys, setSurveys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Drafts' | 'Completed'>('All');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSurveys();
    }, [user]);

    const fetchSurveys = async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/surveys', {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            const { data } = await res.json();
            setSurveys(data || []);
        } catch (error) {
            console.error('Failed to fetch surveys:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSurveyStatus = async (surveyId: string, nextStatus: string) => {
        if (!session) return;
        try {
            await fetch(`/api/surveys/${surveyId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ status: nextStatus })
            });
            await fetchSurveys();
        } catch (error) {
            console.error('Failed to update survey status:', error);
        }
    };

    const handleToggleActive = async (survey: any) => {
        const nextStatus = survey.status === 'COLLECTING' ? 'COMPLETED' : 'COLLECTING';
        await updateSurveyStatus(survey.id, nextStatus);
    };

    const handleDeleteSurvey = async (surveyId: string) => {
        if (!session) return;
        const confirmed = window.confirm('Delete this flow and all its data? This cannot be undone.');
        if (!confirmed) return;
        try {
            await fetch(`/api/surveys/${surveyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            await fetchSurveys();
        } catch (error) {
            console.error('Failed to delete survey:', error);
        }
    };

    const filteredSurveys = surveys.filter((survey) => {
        if (activeTab === 'Active') {
            return survey.status === 'COLLECTING' || survey.status === 'ANALYSING';
        }
        if (activeTab === 'Drafts') {
            return survey.status === 'DRAFT';
        }
        if (activeTab === 'Completed') {
            return survey.status === 'COMPLETED';
        }
        return true;
    });

    const activeCount = surveys.filter(s => s.status === 'COLLECTING' || s.status === 'ANALYSING').length;
    const totalResponses = surveys.reduce((acc, curr) => acc + (curr.response_count || curr.sessions?.count || 0), 0);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0F0F0F] text-gray-900 dark:text-white transition-colors duration-300 pb-16">
            <Header />

            <main className="max-w-7xl mx-auto pt-28 pb-12">

                {/* PAGE HEADER REDESIGN */}
                <div className="px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div>
                            <p className="text-[#00C37A] text-sm font-medium mb-1 tracking-widest uppercase">
                                Dashboard
                            </p>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white">
                                My Research <span className="text-[#00C37A]">Engines</span>
                            </h1>
                            <p className="text-gray-500 mt-2 text-sm">
                                Manage and monitor your conversational validation flows.
                            </p>
                        </div>

                        <button onClick={() => navigate('/survey/new')} className="hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl
                      bg-[#00C37A] hover:bg-[#00a866] text-white dark:text-black font-bold text-sm
                      transition-all duration-200 hover:scale-105 hover:shadow-lg 
                      hover:shadow-[#00C37A]/20">
                            <Plus size={18} /> Create New Flow
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-6 mt-8">
                        {[
                            { label: 'Total Flows', value: surveys.length.toString() },
                            { label: 'Active', value: activeCount.toString() },
                            { label: 'Total Responses', value: totalResponses.toString() },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 min-w-[140px] shadow-sm dark:shadow-none">
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEARCH + FILTER REDESIGN */}
                <div className="px-6 lg:px-8 flex flex-col md:flex-row md:items-center gap-4 mt-12 mb-8">
                    {/* Search */}
                    <div className="relative flex-1 max-w-lg shadow-sm dark:shadow-none rounded-2xl">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 
                      text-gray-500" />
                        <input
                            placeholder="Search by goal or audience..."
                            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm
                        bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10
                        text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600
                        focus:outline-none focus:border-[#00C37A]/50 dark:focus:bg-white/10
                        transition-all duration-200"
                        />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-1 overflow-x-auto shadow-sm dark:shadow-none">
                        {(['All', 'Active', 'Drafts', 'Completed'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                          ${activeTab === tab
                                        ? 'bg-[#00C37A] text-white dark:text-black font-bold'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* GRID LAYOUT */}
                <div className="px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="min-h-[280px] rounded-3xl bg-gray-200 dark:bg-white/5 animate-pulse border border-gray-300 dark:border-white/10 shadow-sm dark:shadow-none" />
                        ))
                    ) : (
                        <>
                            {filteredSurveys.map(survey => {
                                const statusInfo = statusColors[survey.status] || statusColors.DRAFT;
                                return (
                                    <div key={survey.id} className="group relative rounded-3xl overflow-hidden
                                  bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10
                                  hover:border-[#00C37A]/30 dark:hover:bg-white/[0.06]
                                  transition-all duration-300 hover:-translate-y-1
                                  hover:shadow-xl hover:shadow-[#00C37A]/5 p-6 flex flex-col shadow-sm dark:shadow-none">

                                        {/* Top row */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                      ${statusInfo.bg} ${statusInfo.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}
                                        ${survey.status === 'COLLECTING' ? 'animate-pulse' : ''}`} />
                                                {survey.status}
                                            </div>
                                            <button className="w-8 h-8 rounded-xl bg-transparent hover:bg-gray-100 dark:hover:bg-white/10
                                      flex items-center justify-center transition opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal size={16} className="text-gray-400" />
                                            </button>
                                        </div>

                                        {/* Title */}
                                        <Link to={`/survey/${survey.id}/${survey.status === 'DRAFT' ? 'setup' : 'results'}`}>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 truncate group-hover:text-[#00C37A] transition-colors">
                                                {survey.title || 'Untitled Flow'}
                                            </h3>
                                            <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                                                {survey.goal || 'No goal specified'}
                                            </p>
                                        </Link>

                                        <div className="mt-auto">
                                            {/* Stats */}
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                                                    <Users size={13} />
                                                    <span>{survey.response_count || survey.sessions?.count || 0} Responses</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                                                    <Clock size={13} />
                                                    <span>{formatRelativeTime(survey.created_at)}</span>
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-gray-100 dark:border-white/5 mb-4" />

                                            {/* Action buttons */}
                                            <div className="flex items-center gap-2">
                                                {/* Primary action */}
                                                {survey.status === 'DRAFT' ? (
                                                    <Link to={`/survey/${survey.id}/setup`} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                                            bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-white transition flex-1 justify-center">
                                                        <Settings size={13} /> Configure
                                                    </Link>
                                                ) : (
                                                    <Link to={`/survey/${survey.id}/results`} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                                            bg-[#00C37A]/10 hover:bg-[#00C37A]/20 text-[#00a866] dark:text-[#00C37A] transition flex-1 justify-center">
                                                        <BarChart2 size={13} /> Results
                                                    </Link>
                                                )}

                                                {/* Icon buttons */}
                                                <button onClick={() => handleToggleActive(survey)} className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/15
                                          flex items-center justify-center transition shrink-0" title={survey.status === 'COLLECTING' ? 'Pause' : 'Start'}>
                                                    {survey.status === 'COLLECTING' ? (
                                                        <Pause size={14} className="text-gray-500 dark:text-gray-400" />
                                                    ) : (
                                                        <Play size={14} className="text-gray-500 dark:text-gray-400" />
                                                    )}
                                                </button>
                                                <button onClick={() => {
                                                    const link = `${window.location.origin}/s/${survey.share_token}`;
                                                    navigator.clipboard.writeText(link);
                                                    alert('Link copied!');
                                                }} className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/15
                                          flex items-center justify-center transition shrink-0" title="Share">
                                                    <Share2 size={14} className="text-gray-500 dark:text-gray-400" />
                                                </button>
                                                <button onClick={() => handleDeleteSurvey(survey.id)} className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/5 dark:hover:bg-red-500/20
                                          flex items-center justify-center transition shrink-0 group/del" title="Delete">
                                                    <Trash2 size={14} className="text-red-500/80 group-hover/del:text-red-600 dark:text-red-500/60 dark:group-hover/del:text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty Card — Create New */}
                            <button onClick={() => navigate('/survey/new')}
                                className="rounded-3xl border-2 border-dashed border-gray-300 dark:border-white/10
                              hover:border-[#00C37A]/40 hover:bg-[#00C37A]/5 dark:hover:bg-[#00C37A]/5
                              transition-all duration-300 hover:-translate-y-1
                              flex flex-col items-center justify-center gap-3 p-6 min-h-[280px]
                              group bg-white dark:bg-transparent shadow-sm dark:shadow-none">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 shadow-sm dark:shadow-none
                                group-hover:bg-[#00C37A]/10 transition
                                flex items-center justify-center">
                                    <Plus size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-[#00C37A]" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-500 group-hover:text-[#00C37A] text-sm font-medium transition">
                                    Create New Flow
                                </p>
                            </button>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
