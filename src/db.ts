import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database('insight_engine.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS surveys (
    id TEXT PRIMARY KEY,
    title TEXT,
    goal TEXT,
    target_audience TEXT,
    status TEXT DEFAULT 'DRAFT',   -- DRAFT | COLLECTING | ANALYSING | COMPLETED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    share_token TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    survey_id TEXT,
    text TEXT,
    type TEXT,               -- OPEN | SCALE | CHOICE | FOLLOWUP
    category TEXT,
    order_index INTEGER,
    options TEXT,            -- JSON string for CHOICE type
    parent_question_id TEXT,
    FOREIGN KEY (survey_id) REFERENCES surveys (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    survey_id TEXT,
    respondent_name TEXT,
    respondent_email TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    metadata TEXT,
    FOREIGN KEY (survey_id) REFERENCES surveys (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    question_id TEXT,
    answer TEXT,
    sentiment_score REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS analysis (
    id TEXT PRIMARY KEY,
    survey_id TEXT,
    executive_summary TEXT,
    overall_sentiment REAL,
    themes TEXT,
    pain_points TEXT,
    opportunities TEXT,
    action_plan TEXT,
    nps_score REAL,
    response_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys (id) ON DELETE CASCADE
  );
`);

export default db;
