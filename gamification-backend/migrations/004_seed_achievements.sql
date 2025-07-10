INSERT INTO achievements (id, name, description, icon, type, target, timeframe_days) VALUES
  ('first_task', 'First Task', 'Complete your first task', '🌱', 'tasks', 1, NULL),
  ('task_novice', 'Task Novice', 'Complete 10 tasks', '📝', 'tasks', 10, NULL),
  ('task_master', 'Task Master', 'Complete 100 tasks', '🏆', 'tasks', 100, NULL),
  ('level_5', 'Level 5', 'Reach level 5', '🎯', 'level', 5, NULL),
  ('level_10', 'Level 10', 'Reach level 10', '🚀', 'level', 10, NULL),
  ('xp_sprinter', 'XP Sprinter', 'Earn 500 XP in 7 days', '⚡', 'xp', 500, 7),
  ('streak_starter', 'Streak Starter', 'Complete a task every day for 3 days', '🔥', 'streak', 3, 3),
  ('streak_master', 'Streak Master', 'Complete a task every work day for 5 days', '��🔥', 'streak', 5, 5),
  ('cto_specialist', 'CTO’s Secret Agent', 'Complete a CTO Special Task and prove you’re ready for the next big mission! 🕵️‍♂️', '🕵️‍♂️', 'cto_special', 1, NULL); 