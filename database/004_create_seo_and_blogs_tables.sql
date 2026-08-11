CREATE TABLE IF NOT EXISTS seo_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(100) UNIQUE NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT,
    canonical_url VARCHAR(255),
    og_title VARCHAR(255),
    og_description TEXT,
    og_image VARCHAR(255),
    header_scripts TEXT,
    footer_scripts TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO seo_settings (page_name, meta_title, meta_description)
VALUES ('global', 'WorkOnTop', 'Find the best professionals');

CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    author VARCHAR(100),
    image_url VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
