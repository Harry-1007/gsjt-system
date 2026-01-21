-- 创建场景表
CREATE TABLE IF NOT EXISTS scenarios (
  scenario_id VARCHAR(255) PRIMARY KEY,
  title TEXT NOT NULL,
  title_zh_hk TEXT,
  description TEXT NOT NULL,
  description_zh_hk TEXT,
  illustration_id VARCHAR(255),
  competency_tags JSONB
);

-- 创建选项表
CREATE TABLE IF NOT EXISTS scenario_options (
  id SERIAL PRIMARY KEY,
  scenario_id VARCHAR(255) NOT NULL,
  option_id VARCHAR(255) NOT NULL,
  option_text TEXT NOT NULL,
  option_text_zh_hk TEXT,
  next_scenario_id VARCHAR(255),
  integrity_score INTEGER DEFAULT 0,
  teamwork_score INTEGER DEFAULT 0,
  service_orientation_score INTEGER DEFAULT 0,
  discipline_score INTEGER DEFAULT 0,
  problem_solving_score INTEGER DEFAULT 0,
  stress_tolerance_score INTEGER DEFAULT 0,
  integrity_and_honesty_score INTEGER DEFAULT 0,
  problem_solving_under_stress_score INTEGER DEFAULT 0,
  effective_communication_score INTEGER DEFAULT 0,
  FOREIGN KEY (scenario_id) REFERENCES scenarios(scenario_id) ON DELETE CASCADE
);

-- 创建候选人结果表
CREATE TABLE IF NOT EXISTS candidate_results (
  candidate_id VARCHAR(255) PRIMARY KEY,
  test_id VARCHAR(255),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  total_scores JSONB,
  rating VARCHAR(255),
  answers JSONB
);

-- 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_scenario_options ON scenario_options(scenario_id);
