CREATE DATABASE employee_management;
USE employee_management; 

-- Base Pattern Columns applied to all domain tables:
-- status, created_at, updated_at

-- 1. Locations Entity
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(150),
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Departments Entity
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL UNIQUE,
    location_id INT,
    status VARCHAR(10) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- 3. Roles Entity
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(10) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Permissions Entity
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Role_Permissions (Junction Table)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 6. Employees Entity
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    country_code VARCHAR(5) NOT NULL DEFAULT '+1',
    mobile_number VARCHAR(15) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    role_id INT NOT NULL,
    hire_date DATE,
    status VARCHAR(10) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 7. Audit Logs Entity (System Activity Only)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    performed_by_employee_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 8. Seed Initial Departments (Required for frontend dropdowns)
INSERT INTO departments (id, code, name) VALUES
(1, 'ENG', 'Engineering'),
(2, 'HR', 'Human Resources'),
(3, 'FIN', 'Finance'),
(4, 'IT', 'Information Technology (IT)'),
(5, 'ACC', 'Accounting'),
(6, 'MKT', 'Marketing'),
(7, 'SLS', 'Sales')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 9. Seed Initial Roles (Required for frontend dropdowns)
INSERT INTO roles (id, title) VALUES
(1, 'Admin'),
(2, 'Developer'),
(3, 'Manager'),
(4, 'Designer'),
(5, 'HR Specialist'),
(6, 'Accountant')
ON DUPLICATE KEY UPDATE title = VALUES(title);