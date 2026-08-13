-- =====================================================
-- Migration 005: Create service_locations table for SEO
-- =====================================================

CREATE TABLE IF NOT EXISTS service_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL,
    location_name VARCHAR(200) NOT NULL,
    location_slug VARCHAR(200) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT,
    canonical_url VARCHAR(255),
    custom_heading VARCHAR(255),
    custom_intro TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_service_location (service_id, location_slug)
);

-- Index for fast lookup by location_slug and service_id
CREATE INDEX idx_sl_loc_slug ON service_locations(location_slug);
CREATE INDEX idx_sl_active ON service_locations(is_active);
