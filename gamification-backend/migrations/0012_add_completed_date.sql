-- Migration number: 0012 	 2025-07-10T21:51:50.779Z

ALTER TABLE processed_tasks ADD COLUMN completed_at DATE; 

UPDATE processed_tasks
SET completed_at = '2025-07-01'
WHERE completed_at IS NULL; 