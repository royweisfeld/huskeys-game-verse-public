-- Achievements table: defines all possible achievements
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  type TEXT NOT NULL, -- e.g., 'tasks', 'level', 'xp', 'streak'
  target INTEGER NOT NULL, -- e.g., 10 tasks, level 5, 500 XP, 7 days
  timeframe_days INTEGER -- for XP/time or streaks, NULL if not applicable
);

-- User achievements: tracks which user has unlocked which achievement
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id)
); 