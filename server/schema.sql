-- ALTER TABLE for invoices (run these if table already exists)
ALTER TABLE invoices ADD COLUMN shop_code VARCHAR(20);
ALTER TABLE invoices ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(20) NOT NULL UNIQUE,
  date DATE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_contact_number VARCHAR(20) NOT NULL,
  customer_alt_contact_number VARCHAR(20),
  device_model_name VARCHAR(255) NOT NULL,
  imei_number VARCHAR(50) NOT NULL,
  device_price DECIMAL(10,2) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL,
  warranty_duration VARCHAR(20) NOT NULL DEFAULT '2 years',
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Unified users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','shopowner','manager') NOT NULL,
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  admin_name VARCHAR(255),
  admin_code VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Shop Owners table
CREATE TABLE IF NOT EXISTS shop_owners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  shop_name VARCHAR(255),
  shop_address VARCHAR(255),
  contact_number VARCHAR(20),
  shop_code VARCHAR(20) UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Managers table
CREATE TABLE IF NOT EXISTS managers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  manager_name VARCHAR(255),
  contact_number VARCHAR(20),
  manager_code VARCHAR(20) UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
