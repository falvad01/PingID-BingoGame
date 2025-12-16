-- Migration script to update the season table
-- Execute this in your MySQL database

-- Step 1: Add new columns to season table
ALTER TABLE `season` 
ADD COLUMN `name` VARCHAR(255) NOT NULL AFTER `id`,
ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT FALSE AFTER `name`,
ADD COLUMN `start_date` DATE NULL AFTER `is_active`,
ADD COLUMN `end_date` DATE NULL AFTER `start_date`;

-- Step 2: Migrate existing data (convert year to name)
-- This updates existing records to use year as name
UPDATE `season` 
SET `name` = CONCAT('Temporada ', `year`)
WHERE `name` = '' OR `name` IS NULL;

-- Step 3: Optional - Set the most recent season as active if none are active
UPDATE `season` 
SET `is_active` = TRUE 
WHERE `id` = (SELECT id FROM (SELECT id FROM season ORDER BY created_at DESC LIMIT 1) as temp)
AND NOT EXISTS (SELECT 1 FROM season WHERE is_active = TRUE);

-- Step 4: Verify the changes
SELECT * FROM `season`;
