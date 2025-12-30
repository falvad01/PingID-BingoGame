-- ============================================================
-- MIGRATION SCRIPT: Update Production Database to New Structure
-- Database: bingo-dev
-- Date: Generated
-- Description: Migrates production data to new model structure
-- ============================================================

-- Disable foreign key checks for migration
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- STEP 1: BACKUP EXISTING SEASON DATA
-- ============================================================
CREATE TABLE IF NOT EXISTS season_backup AS SELECT * FROM season;

-- ============================================================
-- STEP 2: UPDATE SEASON TABLE STRUCTURE
-- ============================================================
-- Add new columns to season table
ALTER TABLE season ADD COLUMN IF NOT EXISTS name VARCHAR(255) AFTER id;
ALTER TABLE season ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 0 AFTER name;
ALTER TABLE season ADD COLUMN IF NOT EXISTS start_date DATETIME DEFAULT NULL AFTER is_active;
ALTER TABLE season ADD COLUMN IF NOT EXISTS end_date DATETIME DEFAULT NULL AFTER start_date;

-- ============================================================
-- STEP 3: MIGRATE SEASON DATA (year → name)
-- ============================================================
-- Update season records with transformed data
UPDATE season 
SET 
    name = year,
    is_active = CASE 
        WHEN id = 1 THEN 0  -- 2024 season is not active
        WHEN id = 2 THEN 1  -- 2025 season is active
        ELSE 0 
    END,
    start_date = CASE 
        WHEN id = 1 THEN '2024-01-01 00:00:00'
        WHEN id = 2 THEN '2025-01-01 00:00:00'
        ELSE NULL 
    END,
    end_date = CASE 
        WHEN id = 1 THEN '2024-12-31 23:59:59'
        WHEN id = 2 THEN '2025-12-31 23:59:59'
        ELSE NULL 
    END
WHERE year IS NOT NULL;

-- ============================================================
-- STEP 4: CLEAN UP NUMBER TABLE DATA
-- ============================================================
-- Verify all number records have valid season_id references
-- No action needed if all records are valid

-- Update created_at timestamps where they are '0000-00-00 00:00:00'
UPDATE season 
SET created_at = NOW() 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

-- ============================================================
-- STEP 5: INTEGRATE 2024 NUMBERS DATA
-- ============================================================
-- Insert 2024 numbers if they don't already exist
-- This assumes 2024Numbers.sql has records with fields: (id, user_id, number, created_at)
-- We need to add season_id = 1 for all 2024 numbers

-- First, check the maximum ID in the number table to avoid conflicts
SET @max_number_id = (SELECT COALESCE(MAX(id), 0) FROM number);

-- Insert 2024 numbers with season_id = 1
-- NOTE: This section needs to be executed after examining 2024Numbers.sql file
-- Uncomment and adjust the following INSERT if needed:

/*
INSERT INTO number (id, user_id, number, season_id, created_at)
SELECT 
    id + @max_number_id AS id,
    user_id,
    number,
    1 AS season_id,  -- Assign to 2024 season
    COALESCE(created_at, NOW()) AS created_at
FROM 2024Numbers_temp
WHERE NOT EXISTS (
    SELECT 1 FROM number n 
    WHERE n.user_id = 2024Numbers_temp.user_id 
    AND n.number = 2024Numbers_temp.number 
    AND n.season_id = 1
);
*/

-- ============================================================
-- STEP 6: VERIFY DATA INTEGRITY
-- ============================================================

-- Check season table structure
SELECT 
    'Season Table Verification' AS check_type,
    COUNT(*) AS total_seasons,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_seasons
FROM season;

-- Check number table integrity
SELECT 
    'Number Table Verification' AS check_type,
    COUNT(*) AS total_numbers,
    COUNT(DISTINCT season_id) AS seasons_with_numbers,
    COUNT(DISTINCT user_id) AS users_with_numbers
FROM number;

-- Check users table
SELECT 
    'Users Table Verification' AS check_type,
    COUNT(*) AS total_users,
    SUM(CASE WHEN administrator = 1 THEN 1 ELSE 0 END) AS administrators
FROM users;

-- Verify foreign key relationships
SELECT 
    'Foreign Key Verification' AS check_type,
    COUNT(*) AS orphaned_numbers
FROM number n
LEFT JOIN users u ON n.user_id = u.id
LEFT JOIN season s ON n.season_id = s.id
WHERE u.id IS NULL OR s.id IS NULL;

-- ============================================================
-- STEP 7: OPTIONAL - DROP OLD COLUMN
-- ============================================================
-- After verifying migration is successful, you can drop the old 'year' column
-- CAUTION: Uncomment only after verifying the migration

-- ALTER TABLE season DROP COLUMN IF EXISTS year;

-- ============================================================
-- STEP 8: RE-ENABLE FOREIGN KEY CHECKS
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Next steps:
-- 1. Review verification query results
-- 2. Test application with new structure
-- 3. If successful, drop backup table: DROP TABLE season_backup;
-- 4. If needed, restore from backup: INSERT INTO season SELECT * FROM season_backup;
-- ============================================================

SELECT 'Migration script completed successfully!' AS status;
