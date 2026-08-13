-- Migration 006: Add missing geolocation and booking columns
ALTER TABLE bookings ADD COLUMN latitude DECIMAL(10,8) DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN longitude DECIMAL(11,8) DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN cluster VARCHAR(100) DEFAULT NULL;
