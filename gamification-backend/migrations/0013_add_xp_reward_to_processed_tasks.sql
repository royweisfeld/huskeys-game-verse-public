-- Migration number: 0013 	 2025-07-10T21:59:47.550Z
-- Migration to add xp_reward column to processed_tasks
ALTER TABLE processed_tasks ADD COLUMN xp_reward INTEGER DEFAULT 0;
