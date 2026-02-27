export type SurveyStatus = 'DRAFT' | 'COLLECTING' | 'ANALYSING' | 'COMPLETED';

export interface Survey {
    id: string;
    user_id: string;
    title: string;
    goal: string;
    target_audience: string;
    context?: string;
    status: SurveyStatus;
    share_token: string;
    created_at: string;
    questions?: Question[];
    respondent_fields?: RespondentField[];
    sessions?: { count: number }[];
}

export interface RespondentField {
    id: string;
    survey_id: string;
    label: string;
    field_type: 'text' | 'email' | 'number' | 'select' | 'tel';
    is_required: boolean;
    options?: string | null;
    order_index: number;
}

export interface Question {
    id: string;
    survey_id: string;
    text: string;
    type: 'OPEN' | 'SCALE' | 'CHOICE' | 'YES_NO' | 'STAR_RATING' | 'RANKING' | 'PROBE';
    category: string;
    order_index: number;
    options?: any | null;
    scale_min?: number;
    scale_max?: number;
    scale_min_label?: string | null;
    scale_max_label?: string | null;
    star_count?: number;
    is_required?: boolean;
    allow_followup?: boolean;
}

export interface Session {
    id: string;
    survey_id: string;
    respondent_name: string;
    respondent_email: string;
    respondent_meta: any;
    created_at: string;
    completed_at: string | null;
}

export interface Response {
    id: string;
    session_id: string;
    question_id: string;
    answer: string;
    created_at: string;
}

export interface Analysis {
    id: string;
    survey_id: string;
    executive_summary: string;
    overall_sentiment: number;
    themes: any; // Stored as JSONB in Supabase
    pain_points: any;
    opportunities: any;
    action_plan: any;
    nps_score: number;
    response_count: number;
    created_at: string;
}

export interface Theme {
    theme: string;
    summary: string;
    sentiment: number;
    quotes: string[];
}

export interface PainPoint {
    point: string;
    severity: number;
    evidence: string;
}

export interface Opportunity {
    opportunity: string;
    impact: 'High' | 'Med' | 'Low';
    effort: 'High' | 'Med' | 'Low';
    evidence: string;
}

export interface ActionItem {
    action: string;
    priority: 'Urgent' | 'High' | 'Med';
    rationale: string;
}
