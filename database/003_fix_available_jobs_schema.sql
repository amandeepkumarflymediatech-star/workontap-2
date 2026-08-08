-- Migration 003: Fix Available Jobs Schema & Performance Indexes
-- Description: Ensures service_cities/service_areas exist on service_providers and adds performance indexes on bookings for available jobs.

-- 1. Ensure 'service_cities' column exists in 'service_providers'
SET @dbname = DATABASE();
SET @tablename = "service_providers";
SET @columnname = "service_cities";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (table_name = @tablename)
    AND (table_schema = @dbname)
    AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " JSON AFTER service_areas;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Ensure 'cluster' column exists in 'bookings'
SET @tablename = "bookings";
SET @columnname = "cluster";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (table_name = @tablename)
    AND (table_schema = @dbname)
    AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(100) AFTER longitude;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 3. Performance indexes for available jobs querying
ALTER TABLE bookings ADD INDEX idx_status_provider_created (status, provider_id, created_at);
ALTER TABLE bookings ADD INDEX idx_city_cluster (city, cluster);
