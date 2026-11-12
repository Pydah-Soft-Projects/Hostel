-- ==============================================================================
-- MAINTENANCE DATABASE UPDATE SCRIPT FOR HOSTEL COMPLAINTS INTEGRATION
-- Target Database: maintenance_db
-- Target Table: complaints, categories
-- Compatible with MySQL Workbench, DBeaver, Navicat, phpMyAdmin, and CLI
-- ==============================================================================

USE `maintenance_db`;

-- ------------------------------------------------------------------------------
-- 1. ADD NEW COLUMNS TO `complaints` TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE `complaints`
    ADD COLUMN `requester_phone` VARCHAR(30) NULL AFTER `requester_identifier`,
    ADD COLUMN `requester_email` VARCHAR(255) NULL AFTER `requester_phone`,
    ADD COLUMN `source` VARCHAR(50) NOT NULL DEFAULT 'hostel' AFTER `requester_email`,
    ADD COLUMN `complaint_type` ENUM('student', 'facility') NOT NULL DEFAULT 'student' AFTER `source`,
    ADD COLUMN `hostel_id` VARCHAR(50) NULL AFTER `room_no`,
    ADD COLUMN `hostel_name` VARCHAR(255) NULL AFTER `hostel_id`,
    ADD COLUMN `bed_no` VARCHAR(50) NULL AFTER `hostel_name`,
    ADD COLUMN `mongo_complaint_id` VARCHAR(50) NULL AFTER `closed_at`,
    ADD COLUMN `warden_id` VARCHAR(50) NULL AFTER `mongo_complaint_id`,
    ADD COLUMN `warden_name` VARCHAR(255) NULL AFTER `warden_id`,
    MODIFY COLUMN `photo_url` TEXT NULL;

-- ------------------------------------------------------------------------------
-- 2. ADD INDEXES FOR FAST LOOKUPS
-- ------------------------------------------------------------------------------
CREATE INDEX `idx_complaints_mongo_id` ON `complaints` (`mongo_complaint_id`);
CREATE INDEX `idx_complaints_source` ON `complaints` (`source`);
CREATE INDEX `idx_complaints_hostel` ON `complaints` (`hostel_name`);
CREATE INDEX `idx_complaints_type` ON `complaints` (`complaint_type`);

-- ------------------------------------------------------------------------------
-- 3. CATEGORIES SYNCHRONIZATION FOR HOSTEL
-- ------------------------------------------------------------------------------

-- Ensure 'Canteen' category is active
UPDATE `categories` SET `is_active` = 1 WHERE `name` = 'Canteen';

-- Ensure existing Wifi, Power, Food, Higiene subcategories are active
UPDATE `categories` SET `is_active` = 1 WHERE `name` IN ('Wifi', 'Power', 'Food', 'Higiene');

-- Add 'Common Facilities' category under Hostel (id 4) if not exists
INSERT INTO `categories` (`name`, `description`, `parent_id`, `is_active`, `display_order`, `requires_approval`)
SELECT 'Common Facilities', 'Hostel common facilities (Laundry, Dining Hall, Study Room, Security)', 4, 1, 3, 0
WHERE NOT EXISTS (
    SELECT 1 FROM `categories` WHERE `name` = 'Common Facilities' AND `parent_id` = 4
);

-- Add 'Others' category under Hostel (id 4) if not exists
INSERT INTO `categories` (`name`, `description`, `parent_id`, `is_active`, `display_order`, `requires_approval`)
SELECT 'Others', 'Other general hostel complaints', 4, 1, 99, 0
WHERE NOT EXISTS (
    SELECT 1 FROM `categories` WHERE `name` = 'Others' AND `parent_id` = 4
);

-- ------------------------------------------------------------------------------
-- 4. VERIFY RESULTS
-- ------------------------------------------------------------------------------
DESCRIBE `complaints`;
SELECT id, name, parent_id, is_active FROM `categories` ORDER BY parent_id, id;
