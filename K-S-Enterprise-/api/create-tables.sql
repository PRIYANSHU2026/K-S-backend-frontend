-- Create products table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `images` TEXT,
  `category` VARCHAR(100) NOT NULL,
  `subcategory` VARCHAR(100) NOT NULL,
  `features` TEXT,
  `specifications` TEXT,
  `inStock` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create subcategories table
CREATE TABLE IF NOT EXISTS `subcategories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create upload_history table
CREATE TABLE IF NOT EXISTS `upload_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `upload_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('success', 'error') NOT NULL,
  `message` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default categories
INSERT INTO `categories` (`id`, `name`) VALUES
('garden-tools', 'Garden Tools'),
('power-tools', 'Power Tools'),
('robotic-lawn-mower', 'Robotic Lawn Mower');

-- Insert default subcategories
INSERT INTO `subcategories` (`id`, `name`, `category_id`) VALUES
('aerator-scarifier', 'Cordless Aerator/Scarifier', 'garden-tools'),
('brush-cutter', 'Cordless Brush Cutter', 'garden-tools'),
('chain-saw', 'Cordless Chain Saw', 'garden-tools'),
('hedge-trimmer', 'Cordless Hedge Trimmer', 'garden-tools'),
('hose-reels', 'Cordless Hose Reels (Water)', 'garden-tools'),
('knife-shredder', 'Cordless Knife Shredder', 'garden-tools'),
('lawn-mower', 'Cordless Lawn Mower', 'garden-tools'),
('multi-tools', 'Cordless Multifunctional Tools', 'garden-tools'),
('pruning-shears', 'Cordless Pruning Shears', 'garden-tools'),
('push-sweeper', 'Cordless Push Sweeper', 'garden-tools'),
('sprayer', 'Cordless Sprayer', 'garden-tools'),
('vacuum', 'Cordless Vacuum', 'garden-tools');
