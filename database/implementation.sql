-- 1. Locations (No dependencies)
INSERT INTO locations (address, city, country, country_code, status) 
VALUES ('123 Main St', 'New York', 'USA', '+1', 'active');

-- 2. Roles & Permissions (No dependencies)
INSERT INTO roles (title, description, status) 
VALUES ('Admin', 'Full System Access', 'active');

INSERT INTO permissions (name, description) 
VALUES ('WRITE_PRIVILEGE', 'Allows creating and editing records');

-- 3. Departments (Depends on locations)
INSERT INTO departments (code, name, location_id, status) 
VALUES ('ENG', 'Engineering', 1, 'active');

-- 4. Role Permissions (Depends on roles & permissions)
INSERT INTO role_permissions (role_id, permission_id) 
VALUES (1, 1);

-- 5. Employees (Depends on departments & roles)
INSERT INTO employees (name, email, country_code, mobile_number, department_id, role_id, hire_date, status) 
VALUES ('Alex Smith', 'alex@example.com', '+1', '5551234567', 1, 1, '2024-01-15', 'active');
INSERT INTO employees (name, email, country_code, mobile_number, department_id, role_id, hire_date, status) 
VALUES ('zain', 'azain@gmail.com', '+1', '7492749849', 1, 1, '2024-01-15', 'decline');

-- 6. Audit Logs (Depends on employees)
INSERT INTO audit_logs (event_type, description, performed_by_employee_id) 
VALUES ('USER_LOGIN', 'Employee logged into portal', 1);
 
