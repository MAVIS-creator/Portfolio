CREATE TABLE IF NOT EXISTS klyvex_portfolio_posts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(190) NOT NULL UNIQUE,
  excerpt VARCHAR(320) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_klyvex_portfolio_public (status,published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS klyvex_portfolio_blog_comments (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,post_id BIGINT UNSIGNED NOT NULL,name VARCHAR(80) NOT NULL,email VARCHAR(190) NOT NULL,comment_text TEXT NOT NULL,status ENUM('pending','approved') NOT NULL DEFAULT 'pending',created_at DATETIME NOT NULL,INDEX idx_klyvex_blog_comments_post_status(post_id,status)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS klyvex_portfolio_likes (post_id BIGINT UNSIGNED NOT NULL,visitor_hash CHAR(64) NOT NULL,created_at DATETIME NOT NULL,PRIMARY KEY(post_id,visitor_hash)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS klyvex_portfolio_settings (setting_key VARCHAR(80) PRIMARY KEY,setting_value VARCHAR(255) NOT NULL,updated_at DATETIME NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO klyvex_portfolio_settings(setting_key,setting_value,updated_at) VALUES('comments_enabled','1',UTC_TIMESTAMP());
