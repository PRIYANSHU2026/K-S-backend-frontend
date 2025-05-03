-- Contact Form Submissions Table
CREATE TABLE IF NOT EXISTS `contact_form_submissions` (
  `id` VARCHAR(36) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `user_email` VARCHAR(100) NOT NULL,
  `user_phone` VARCHAR(20),
  `subject` VARCHAR(255),
  `message` TEXT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('new', 'read', 'responded', 'archived') DEFAULT 'new',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Website Content Management Table
CREATE TABLE IF NOT EXISTS `website_content` (
  `id` VARCHAR(36) NOT NULL,
  `section` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255),
  `content` TEXT,
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `section_unique` (`section`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default website content
INSERT IGNORE INTO `website_content` (`id`, `section`, `title`, `content`, `metadata`)
VALUES
('content-1', 'about_us', 'About K-S Enterprise', '<p>K-S Enterprise is a leading provider of high-quality garden tools, forest equipment, and maintenance solutions. With over 15 years of experience in the industry, we pride ourselves on delivering exceptional products and service to our customers.</p><p>Our mission is to provide innovative and reliable tools that make outdoor work easier and more efficient. We believe in sustainable practices and offering products that are built to last.</p>', '{}'),
('content-2', 'home_banner', 'Quality Garden & Forest Tools', '<p>Discover our premium range of garden and forest equipment</p>', '{"button_text": "Shop Now", "button_link": "/products"}'),
('content-3', 'contact_info', 'Contact Information', '<p>Our customer service team is available to help you with any inquiries.</p>', '{"address": "123 Main Street, Bangalore, Karnataka, India - 560001", "phone": "9845019069, 7760093353, 9480453271", "email": "info@ksenterprises.com"}');
