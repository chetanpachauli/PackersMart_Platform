-- PackersMart Platform MySQL Database Schema

CREATE DATABASE IF NOT EXISTS packersmart_db;
USE packersmart_db;

-- 1. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    pickup_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    service_type ENUM('Home Relocation', 'Vehicle Transport', 'Office Relocation', 'Commercial Goods') NOT NULL,
    moving_date DATE NOT NULL,
    additional_requirements TEXT,
    status ENUM('Pending', 'Verified', 'Fake', 'Duplicate', 'Re-attempt') DEFAULT 'Pending',
    lead_score INT DEFAULT 0,
    lead_quality ENUM('Hot', 'Warm', 'Cold', 'Unverified') DEFAULT 'Unverified',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. OTP Verifications Table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    verified_at DATETIME NULL,
    is_used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- 3. Logistics / Packers & Movers Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    coverage_cities JSON NOT NULL,
    service_types JSON NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 4.0,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    contact_phone VARCHAR(20) DEFAULT '9876543210',
    email VARCHAR(100) DEFAULT 'info@company.com',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Lead Company Matches Table
CREATE TABLE IF NOT EXISTS lead_company_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    company_id INT NOT NULL,
    match_score INT DEFAULT 0,
    notification_status ENUM('Sent', 'Pending') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
