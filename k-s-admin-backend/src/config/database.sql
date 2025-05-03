-- Products Management Tables
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `images` TEXT,
  `category_id` VARCHAR(36) NOT NULL,
  `features` TEXT,
  `specifications` TEXT,
  `in_stock` BOOLEAN DEFAULT TRUE,
  `sku` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customer Management Tables
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100),
  `phone` VARCHAR(20),
  `address` TEXT,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Role Management Tables
CREATE TABLE IF NOT EXISTS `roles` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `permissions` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role_id` VARCHAR(36) NOT NULL,
  `avatar` TEXT,
  `last_login` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Warranty Management Tables
CREATE TABLE IF NOT EXISTS `warranties` (
  `id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `customer_id` VARCHAR(36) NOT NULL,
  `purchase_date` DATE NOT NULL,
  `expiry_date` DATE NOT NULL,
  `warranty_details` TEXT,
  `status` ENUM('active', 'expired', 'claimed') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

-- Default data for roles
INSERT INTO `roles` (`id`, `name`, `description`, `permissions`) VALUES
('role-1', 'Super Admin', 'Full access to all system features', '["all"]'),
('role-2', 'Admin', 'Access to most system features', '["products.view", "products.create", "products.edit", "products.delete", "customers.view", "customers.create", "customers.edit", "customers.delete", "warranties.view", "warranties.create", "warranties.edit", "warranties.delete", "contact.view", "contact.delete", "content.view", "content.edit"]'),
('role-3', 'Editor', 'Can manage products and customers', '["products.view", "products.create", "products.edit", "customers.view", "customers.create", "customers.edit", "warranties.view", "warranties.create", "contact.view", "content.view", "content.edit"]'),
('role-4', 'Viewer', 'Can only view information', '["products.view", "customers.view", "warranties.view", "contact.view", "content.view"]');

-- Default super admin user
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role_id`) VALUES
('user-1', 'Super Admin', 'admin@ks-enterprise.com', '$2b$10$mLAMKVatOJKYOf8Tq7MCZ.Y7MVMufE8RIRgbDlk0YQW5PWGxzrCdC', 'role-1');
-- Default password is 'admin123' - should be changed immediately after first login

-- Default website content
INSERT INTO `website_content` (`id`, `section`, `title`, `content`, `metadata`) VALUES
('content-1', 'about_us', 'About K-S Enterprise', '<p>K-S Enterprise is a leading provider of high-quality garden tools, forest equipment, and maintenance solutions. With over 15 years of experience in the industry, we pride ourselves on delivering exceptional products and service to our customers.</p><p>Our mission is to provide innovative and reliable tools that make outdoor work easier and more efficient. We believe in sustainable practices and offering products that are built to last.</p>', '{}'),
('content-2', 'home_banner', 'Quality Garden & Forest Tools', '<p>Discover our premium range of garden and forest equipment</p>', '{"button_text": "Shop Now", "button_link": "/products"}'),
('content-3', 'contact_info', 'Contact Information', '<p>Our customer service team is available to help you with any inquiries.</p>', '{"address": "123 Main Street, Bangalore, Karnataka, India - 560001", "phone": "9845019069, 7760093353, 9480453271", "email": "info@ksenterprises.com"}');
